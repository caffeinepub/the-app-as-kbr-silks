import { useState, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2, Upload, Loader2, ImageIcon, IndianRupee, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetAllSarees, useAddSaree, useUpdateSaree, useDeleteSaree } from '@/hooks/useQueries';
import { type Saree, FabricType, ExternalBlob } from '../backend';
import { compressImage, formatFileSize } from '../utils/imageCompression';
import { parseBackendError } from '../utils/retryWithBackoff';

const FABRIC_LABELS: Record<FabricType, string> = {
  [FabricType.Kanjivaram]: 'Kanjivaram',
  [FabricType.Banarasi]: 'Banarasi',
  [FabricType.Mysore]: 'Mysore',
};

interface SareeFormData {
  name: string;
  description: string;
  fabricType: FabricType;
  color: string;
  price: string;
  stock: string;
  imageFile: File | null;
  existingImageUrl: string | null;
}

interface CompressedImageInfo {
  bytes: Uint8Array<ArrayBuffer>;
  originalSizeKB: number;
  compressedSizeKB: number;
  wasCompressed: boolean;
  previewUrl: string;
}

const defaultForm: SareeFormData = {
  name: '',
  description: '',
  fabricType: FabricType.Kanjivaram,
  color: '',
  price: '',
  stock: '',
  imageFile: null,
  existingImageUrl: null,
};

function SareeFormModal({
  open,
  onClose,
  editSaree,
}: {
  open: boolean;
  onClose: () => void;
  editSaree: Saree | null;
}) {
  const [form, setForm] = useState<SareeFormData>(() => {
    if (editSaree) {
      return {
        name: editSaree.name,
        description: editSaree.description,
        fabricType: editSaree.fabricType,
        color: editSaree.color,
        price: String(editSaree.price),
        stock: String(editSaree.stock),
        imageFile: null,
        existingImageUrl: editSaree.image?.getDirectURL?.() || null,
      };
    }
    return defaultForm;
  });

  const [compressedImage, setCompressedImage] = useState<CompressedImageInfo | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof SareeFormData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addSaree = useAddSaree();
  const updateSaree = useUpdateSaree();
  const isSubmitting = addSaree.isPending || updateSaree.isPending;

  // Reset error when form changes
  useEffect(() => {
    if (submitError) setSubmitError(null);
  }, [form.name, form.color, form.price, form.stock, form.fabricType]);

  const validate = () => {
    const errs: Partial<Record<keyof SareeFormData, string>> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.color.trim()) errs.color = 'Color is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) errs.price = 'Valid price required';
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) errs.stock = 'Valid stock required';
    if (!editSaree && !form.imageFile) errs.imageFile = 'Image is required for new sarees';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);

    let imageBlob: ExternalBlob;

    if (form.imageFile && compressedImage) {
      // Use pre-compressed image bytes (already typed as Uint8Array<ArrayBuffer>)
      imageBlob = ExternalBlob.fromBytes(compressedImage.bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
    } else if (form.imageFile) {
      // Fallback: use raw file bytes with explicit cast
      const buf = await form.imageFile.arrayBuffer() as ArrayBuffer;
      const bytes = new Uint8Array(buf) as Uint8Array<ArrayBuffer>;
      imageBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
    } else if (editSaree?.image) {
      imageBlob = editSaree.image;
    } else {
      imageBlob = ExternalBlob.fromURL('/assets/generated/saree-placeholder.dim_400x500.png');
    }

    try {
      if (editSaree) {
        await updateSaree.mutateAsync({
          id: editSaree.id,
          name: form.name.trim(),
          description: form.description.trim(),
          fabricType: form.fabricType,
          color: form.color.trim(),
          price: BigInt(Math.round(Number(form.price))),
          stock: BigInt(Math.round(Number(form.stock))),
          image: imageBlob,
        });
      } else {
        await addSaree.mutateAsync({
          name: form.name.trim(),
          description: form.description.trim(),
          fabricType: form.fabricType,
          color: form.color.trim(),
          price: BigInt(Math.round(Number(form.price))),
          stock: BigInt(Math.round(Number(form.stock))),
          image: imageBlob,
        });
      }
      setUploadProgress(null);
      onClose();
    } catch (err) {
      setUploadProgress(null);
      const friendlyMessage = parseBackendError(err);
      setSubmitError(friendlyMessage);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    setForm((f) => ({ ...f, imageFile: file, existingImageUrl: null }));
    if (errors.imageFile) setErrors((prev) => ({ ...prev, imageFile: undefined }));
    setSubmitError(null);
    setCompressedImage(null);

    // Auto-compress the image
    setIsCompressing(true);
    try {
      const result = await compressImage(file);
      const previewUrl = URL.createObjectURL(result.blob);
      setCompressedImage({
        bytes: result.bytes,
        originalSizeKB: result.originalSizeKB,
        compressedSizeKB: result.compressedSizeKB,
        wasCompressed: result.wasCompressed,
        previewUrl,
      });
    } catch {
      // If compression fails, fall back to raw file bytes with explicit cast
      const buf = await file.arrayBuffer() as ArrayBuffer;
      const bytes = new Uint8Array(buf) as Uint8Array<ArrayBuffer>;
      setCompressedImage({
        bytes,
        originalSizeKB: Math.round(file.size / 1024),
        compressedSizeKB: Math.round(file.size / 1024),
        wasCompressed: false,
        previewUrl: URL.createObjectURL(file),
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const previewUrl =
    compressedImage?.previewUrl ||
    form.existingImageUrl ||
    '/assets/generated/saree-placeholder.dim_400x500.png';

  const handleDialogClose = (open: boolean) => {
    if (!open && !isSubmitting) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {editSaree ? 'Edit Saree' : 'Add New Saree'}
          </DialogTitle>
          <DialogDescription className="font-body text-sm text-muted-foreground">
            {editSaree
              ? 'Update the details of this saree.'
              : 'Fill in the details to add a new saree to the catalog.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
          {/* Left: Image Upload */}
          <div className="space-y-3">
            <Label className="font-body text-sm font-medium">Saree Image</Label>
            <div
              className="relative rounded-sm overflow-hidden border-2 border-dashed cursor-pointer transition-colors"
              style={{
                aspectRatio: '4/5',
                borderColor: errors.imageFile ? 'oklch(0.55 0.22 25)' : 'oklch(0.88 0.025 70)',
              }}
              onClick={() => !isSubmitting && fileInputRef.current?.click()}
            >
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/assets/generated/saree-placeholder.dim_400x500.png';
                }}
              />

              {/* Hover overlay */}
              {!isCompressing && !isSubmitting && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background: 'oklch(0.14 0.04 22 / 0.6)' }}
                >
                  <Upload size={24} className="text-ivory mb-2" />
                  <span className="text-ivory text-xs font-body">Click to upload</span>
                </div>
              )}

              {/* Compressing overlay */}
              {isCompressing && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ background: 'oklch(0.14 0.04 22 / 0.75)' }}
                >
                  <Loader2 size={28} className="text-gold animate-spin mb-2" />
                  <span className="text-ivory text-sm font-body">Optimizing image...</span>
                </div>
              )}

              {/* Upload progress overlay */}
              {uploadProgress !== null && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6"
                  style={{ background: 'oklch(0.14 0.04 22 / 0.82)' }}
                >
                  <Loader2 size={28} className="text-gold animate-spin" />
                  <div className="w-full">
                    <Progress value={uploadProgress} className="h-2 mb-1" />
                    <span className="text-ivory text-xs font-body text-center block">
                      Uploading… {uploadProgress}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />

            {errors.imageFile && (
              <p className="text-xs font-body text-destructive">{errors.imageFile}</p>
            )}

            {/* Compression info */}
            {compressedImage && !isCompressing && (
              <div
                className="rounded-sm px-3 py-2 text-xs font-body space-y-0.5"
                style={{ background: 'oklch(0.96 0.01 75)' }}
              >
                {compressedImage.wasCompressed ? (
                  <div className="flex items-center gap-1.5" style={{ color: 'oklch(0.42 0.14 140)' }}>
                    <CheckCircle2 size={12} />
                    <span>
                      Compressed: {formatFileSize(compressedImage.originalSizeKB * 1024)} →{' '}
                      <strong>{formatFileSize(compressedImage.compressedSizeKB * 1024)}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 size={12} />
                    <span>
                      Image size:{' '}
                      <strong>{formatFileSize(compressedImage.compressedSizeKB * 1024)}</strong> —
                      ready to upload
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* File name */}
            {form.imageFile && !isCompressing && (
              <p className="text-xs font-body text-muted-foreground truncate">{form.imageFile.name}</p>
            )}
          </div>

          {/* Right: Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="font-body text-sm font-medium">
                Name *
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Royal Crimson Kanjivaram"
                className={`mt-1 font-body text-sm ${errors.name ? 'border-destructive' : ''}`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-xs font-body text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="font-body text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the saree's weave, motifs, occasion..."
                className="mt-1 font-body text-sm resize-none"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="fabric" className="font-body text-sm font-medium">
                Fabric Type *
              </Label>
              <Select
                value={form.fabricType}
                onValueChange={(v) => setForm((f) => ({ ...f, fabricType: v as FabricType }))}
                disabled={isSubmitting}
              >
                <SelectTrigger className="mt-1 font-body text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FabricType).map((ft) => (
                    <SelectItem key={ft} value={ft} className="font-body text-sm">
                      {FABRIC_LABELS[ft]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color" className="font-body text-sm font-medium">
                Color *
              </Label>
              <Input
                id="color"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                placeholder="e.g. Deep Crimson, Ivory Gold"
                className={`mt-1 font-body text-sm ${errors.color ? 'border-destructive' : ''}`}
                disabled={isSubmitting}
              />
              {errors.color && (
                <p className="text-xs font-body text-destructive mt-1">{errors.color}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="price" className="font-body text-sm font-medium">
                  Price (₹) *
                </Label>
                <div className="relative mt-1">
                  <IndianRupee
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="0"
                    className={`pl-8 font-body text-sm ${errors.price ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.price && (
                  <p className="text-xs font-body text-destructive mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <Label htmlFor="stock" className="font-body text-sm font-medium">
                  Stock *
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  placeholder="0"
                  className={`mt-1 font-body text-sm ${errors.stock ? 'border-destructive' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.stock && (
                  <p className="text-xs font-body text-destructive mt-1">{errors.stock}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submission progress bar */}
        {isSubmitting && uploadProgress !== null && (
          <div className="space-y-1 px-1">
            <div className="flex justify-between text-xs font-body text-muted-foreground">
              <span>Uploading saree…</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Retry status */}
        {isSubmitting && uploadProgress === null && (
          <div className="flex items-center gap-2 text-sm font-body text-muted-foreground justify-center py-1">
            <RefreshCw size={14} className="animate-spin" />
            <span>Saving saree, please wait…</span>
          </div>
        )}

        {/* Error message */}
        {submitError && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-body text-sm">{submitError}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="font-body"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isCompressing}
            className="font-body btn-crimson border-0"
            style={{
              background: 'linear-gradient(135deg, oklch(0.26 0.12 22), oklch(0.38 0.16 22))',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" /> Saving…
              </>
            ) : isCompressing ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" /> Optimizing…
              </>
            ) : editSaree ? (
              'Update Saree'
            ) : (
              'Add Saree'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminSarees() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editSaree, setEditSaree] = useState<Saree | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const { data: sarees, isLoading, error } = useGetAllSarees();
  const deleteSaree = useDeleteSaree();

  const handleEdit = (saree: Saree) => {
    setEditSaree(saree);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditSaree(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditSaree(null);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    await deleteSaree.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="page-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="font-body text-xs tracking-widest uppercase mb-1"
                style={{ color: 'oklch(0.78 0.14 72 / 0.7)' }}
              >
                Admin Panel
              </p>
              <h1 className="font-heading text-3xl font-bold text-ivory">Manage Sarees</h1>
              <p className="font-body text-sm mt-1" style={{ color: 'oklch(0.92 0.02 75 / 0.7)' }}>
                Add, edit, and manage your silk saree catalog
              </p>
            </div>
            <Button
              onClick={handleAdd}
              className="font-body font-semibold flex items-center gap-2 border-0"
              style={{
                background: 'linear-gradient(135deg, oklch(0.62 0.16 65), oklch(0.78 0.14 72))',
                color: 'oklch(0.18 0.04 30)',
              }}
            >
              <Plus size={16} />
              Add Saree
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {!isLoading && sarees && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Sarees', value: sarees.length, color: 'oklch(0.38 0.16 22)' },
              {
                label: 'In Stock',
                value: sarees.filter((s) => Number(s.stock) > 0).length,
                color: 'oklch(0.52 0.14 140)',
              },
              {
                label: 'Out of Stock',
                value: sarees.filter((s) => Number(s.stock) === 0).length,
                color: 'oklch(0.55 0.22 25)',
              },
              {
                label: 'Fabric Types',
                value: new Set(sarees.map((s) => s.fabricType)).size,
                color: 'oklch(0.52 0.12 195)',
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-sm border border-border p-4">
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {stat.label}
                </p>
                <p className="font-heading text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <p className="font-body text-destructive">Failed to load sarees.</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-sm overflow-hidden border border-border">
                <Skeleton className="w-full" style={{ aspectRatio: '4/5' }} />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && sarees?.length === 0 && (
          <div className="text-center py-20">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'oklch(0.93 0.012 75)' }}
            >
              <ImageIcon size={28} className="text-muted-foreground" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">No Sarees Yet</h3>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Start building your catalog by adding your first saree.
            </p>
            <Button
              onClick={handleAdd}
              className="font-body"
              style={{
                background: 'linear-gradient(135deg, oklch(0.38 0.16 22), oklch(0.52 0.18 22))',
                color: 'oklch(0.97 0.008 85)',
              }}
            >
              <Plus size={16} className="mr-2" /> Add First Saree
            </Button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && sarees && sarees.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {sarees.map((saree) => {
              const imageUrl =
                saree.image?.getDirectURL?.() ||
                '/assets/generated/saree-placeholder.dim_400x500.png';
              return (
                <div key={String(saree.id)} className="saree-card group">
                  <div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
                    <img
                      src={imageUrl}
                      alt={saree.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          '/assets/generated/saree-placeholder.dim_400x500.png';
                      }}
                    />
                    {/* Action overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: 'oklch(0.14 0.04 22 / 0.55)' }}
                    >
                      <button
                        onClick={() => handleEdit(saree)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                        style={{
                          background: 'oklch(0.78 0.14 72)',
                          color: 'oklch(0.18 0.04 30)',
                        }}
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(saree.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                        style={{
                          background: 'oklch(0.55 0.22 25)',
                          color: 'oklch(0.97 0.008 85)',
                        }}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Stock badge */}
                    {Number(saree.stock) === 0 && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="destructive" className="font-body text-xs px-2 py-0.5">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="font-heading text-sm font-semibold leading-tight truncate mb-1">
                      {saree.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-xs text-muted-foreground">
                        {FABRIC_LABELS[saree.fabricType]}
                      </span>
                      <span
                        className="font-heading text-sm font-bold"
                        style={{ color: 'oklch(0.38 0.16 22)' }}
                      >
                        ₹{Number(saree.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-body text-xs text-muted-foreground">{saree.color}</span>
                      <span className="font-body text-xs text-muted-foreground">
                        Stock: {String(saree.stock)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <SareeFormModal open={modalOpen} onClose={handleCloseModal} editSaree={editSaree} />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Delete Saree?</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This action cannot be undone. The saree will be permanently removed from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="font-body"
              style={{ background: 'oklch(0.55 0.22 25)' }}
            >
              {deleteSaree.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-2" /> Deleting…
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
