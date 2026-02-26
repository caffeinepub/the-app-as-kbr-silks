import { useState, useRef } from 'react';
import { useGetAllSarees, useAddSaree, useUpdateSaree, useDeleteSaree } from '../hooks/useQueries';
import { FabricType, type Saree } from '../backend';
import { ExternalBlob } from '../backend';
import { compressImage } from '../utils/imageCompression';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, ImageIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MAX_BLOB_SIZE = 1_400_000; // 1.4MB IC limit

interface SareeFormData {
  name: string;
  description: string;
  fabricType: FabricType;
  color: string;
  price: string;
  stock: string;
}

const defaultForm: SareeFormData = {
  name: '',
  description: '',
  fabricType: FabricType.Kanjivaram,
  color: '',
  price: '',
  stock: '',
};

export default function AdminSarees() {
  const { data: sarees = [], isLoading, refetch, isFetching } = useGetAllSarees();
  const addSaree = useAddSaree();
  const updateSaree = useUpdateSaree();
  const deleteSaree = useDeleteSaree();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSaree, setEditingSaree] = useState<Saree | null>(null);
  const [form, setForm] = useState<SareeFormData>(defaultForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [keepExistingImage, setKeepExistingImage] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<bigint | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = addSaree.isPending || updateSaree.isPending;

  function openAddModal() {
    setEditingSaree(null);
    setForm(defaultForm);
    setImageFile(null);
    setImagePreview(null);
    setKeepExistingImage(true);
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(saree: Saree) {
    setEditingSaree(saree);
    setForm({
      name: saree.name,
      description: saree.description,
      fabricType: saree.fabricType,
      color: saree.color,
      price: saree.price.toString(),
      stock: saree.stock.toString(),
    });
    setImageFile(null);
    setImagePreview(saree.image ? saree.image.getDirectURL() : null);
    setKeepExistingImage(true);
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingSaree(null);
    setForm(defaultForm);
    setImageFile(null);
    setImagePreview(null);
    setKeepExistingImage(true);
    setFormError(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setKeepExistingImage(false);
    setFormError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    // Validate required fields
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    if (!form.color.trim()) { setFormError('Color is required'); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      setFormError('Valid price is required'); return;
    }
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) {
      setFormError('Valid stock quantity is required'); return;
    }

    // Build image blob
    let imageBlob: ExternalBlob | null = null;

    if (imageFile) {
      try {
        const rawBytes = await compressImage(imageFile);
        // Cast to the exact type expected by ExternalBlob.fromBytes()
        const compressed = rawBytes.buffer instanceof ArrayBuffer
          ? new Uint8Array(rawBytes.buffer as ArrayBuffer, rawBytes.byteOffset, rawBytes.byteLength) as Uint8Array<ArrayBuffer>
          : new Uint8Array(rawBytes) as Uint8Array<ArrayBuffer>;

        if (compressed.length > MAX_BLOB_SIZE) {
          setFormError(`Image is too large (${(compressed.length / 1024 / 1024).toFixed(2)}MB). Please use a smaller image.`);
          return;
        }
        imageBlob = ExternalBlob.fromBytes(compressed);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Image compression failed';
        setFormError(`Image error: ${msg}`);
        return;
      }
    } else if (editingSaree && keepExistingImage && editingSaree.image) {
      imageBlob = editingSaree.image;
    }

    try {
      if (editingSaree) {
        await updateSaree.mutateAsync({
          id: editingSaree.id,
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

      // Close modal first, then trigger a fresh refetch to ensure list updates
      closeModal();
      // Small delay to let the backend settle, then force a fresh fetch
      setTimeout(() => {
        refetch();
      }, 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      setFormError(msg);
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteSaree.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      console.error('Delete failed:', err);
    }
  }

  function getFabricLabel(f: FabricType) {
    return f === FabricType.Kanjivaram ? 'Kanjivaram' : f === FabricType.Banarasi ? 'Banarasi' : 'Mysore';
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-maroon">Saree Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">{sarees.length} sarees in catalog</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-maroon/30 text-maroon hover:bg-maroon/5"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
          <Button onClick={openAddModal} className="btn-maroon">
            <Plus className="h-4 w-4 mr-1" />
            Add Saree
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sarees.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No sarees yet</p>
          <p className="text-sm mt-1">Click "Add Saree" to add your first product.</p>
        </div>
      )}

      {/* Saree grid */}
      {!isLoading && sarees.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sarees.map((saree) => (
            <div key={saree.id.toString()} className="card-luxury rounded-xl overflow-hidden group">
              {/* Image */}
              <div className="relative h-48 bg-ivory-dark overflow-hidden">
                {saree.image ? (
                  <img
                    src={saree.image.getDirectURL()}
                    alt={saree.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/generated/saree-placeholder.dim_400x500.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src="/assets/generated/saree-placeholder.dim_400x500.png"
                      alt="placeholder"
                      className="w-full h-full object-cover opacity-50"
                    />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(saree)}
                    className="bg-white/90 hover:bg-white text-maroon rounded-full p-1.5 shadow-sm transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(saree.id)}
                    className="bg-white/90 hover:bg-red-50 text-red-600 rounded-full p-1.5 shadow-sm transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {saree.stock === 0n && (
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-semibold text-maroon text-sm truncate">{saree.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{saree.color} · {getFabricLabel(saree.fabricType)}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gold font-bold text-sm">₹{Number(saree.price).toLocaleString('en-IN')}</span>
                  <span className="text-xs text-muted-foreground">Stock: {saree.stock.toString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-maroon">
              {editingSaree ? 'Edit Saree' : 'Add New Saree'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Bridal Kanjivaram Red"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the saree..."
                rows={3}
              />
            </div>

            {/* Fabric Type */}
            <div className="space-y-1">
              <Label>Fabric Type *</Label>
              <Select
                value={form.fabricType}
                onValueChange={(v) => setForm(f => ({ ...f, fabricType: v as FabricType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FabricType.Kanjivaram}>Kanjivaram</SelectItem>
                  <SelectItem value={FabricType.Banarasi}>Banarasi</SelectItem>
                  <SelectItem value={FabricType.Mysore}>Mysore</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div className="space-y-1">
              <Label htmlFor="color">Color *</Label>
              <Input
                id="color"
                value={form.color}
                onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))}
                placeholder="e.g. Deep Red with Gold Border"
                required
              />
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="e.g. 15000"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))}
                  placeholder="e.g. 5"
                  required
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Image</Label>
              {imagePreview && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setKeepExistingImage(false);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div
                className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-maroon/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {imageFile ? imageFile.name : 'Click to upload image'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP · Auto-compressed to fit IC limit</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="btn-maroon" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    {editingSaree ? 'Saving…' : 'Adding…'}
                  </>
                ) : (
                  editingSaree ? 'Save Changes' : 'Add Saree'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Saree?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The saree will be permanently removed from the catalog.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} disabled={deleteSaree.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId !== null && handleDelete(deleteConfirmId)}
              disabled={deleteSaree.isPending}
            >
              {deleteSaree.isPending ? (
                <><RefreshCw className="h-4 w-4 mr-1 animate-spin" />Deleting…</>
              ) : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
