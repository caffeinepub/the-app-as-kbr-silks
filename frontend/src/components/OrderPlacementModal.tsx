import { useState } from 'react';
import { Loader2, ShoppingCart, IndianRupee, CheckCircle2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { usePlaceOrder } from '@/hooks/useQueries';
import { type Saree, FabricType } from '../backend';

const FABRIC_LABELS: Record<FabricType, string> = {
  [FabricType.Kanjivaram]: 'Kanjivaram',
  [FabricType.Banarasi]: 'Banarasi',
  [FabricType.Mysore]: 'Mysore',
};

interface OrderPlacementModalProps {
  saree: Saree | null;
  open: boolean;
  onClose: () => void;
}

export default function OrderPlacementModal({ saree, open, onClose }: OrderPlacementModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; quantity?: string }>({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<bigint | null>(null);

  const placeOrder = usePlaceOrder();
  const queryClient = useQueryClient();

  const maxStock = saree ? Number(saree.stock) : 1;
  const unitPrice = saree ? Number(saree.price) : 0;
  const totalPrice = unitPrice * quantity;

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!customerName.trim()) newErrors.name = 'Customer name is required.';
    if (!customerPhone.trim()) newErrors.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(customerPhone.trim())) newErrors.phone = 'Enter a valid 10-digit phone number.';
    if (quantity < 1) newErrors.quantity = 'Quantity must be at least 1.';
    if (quantity > maxStock) newErrors.quantity = `Only ${maxStock} in stock.`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saree || !validate()) return;

    try {
      const id = await placeOrder.mutateAsync({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: [{ sareeId: saree.id, quantity: BigInt(quantity) }],
        productDetails: [
          {
            name: saree.name,
            fabricType: saree.fabricType,
            color: saree.color,
            unitPrice: saree.price,
            quantity: BigInt(quantity),
          },
        ],
      });
      setOrderId(id);
      setOrderSuccess(true);
      // Invalidate orders cache so AdminOrders page reflects the new order immediately
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err) {
      // Error is handled via placeOrder.isError
    }
  };

  const handleClose = () => {
    setCustomerName('');
    setCustomerPhone('');
    setQuantity(1);
    setErrors({});
    setOrderSuccess(false);
    setOrderId(null);
    placeOrder.reset();
    onClose();
  };

  if (!saree) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent
        className="max-w-md w-full p-0 overflow-hidden rounded-sm"
        style={{ border: '1px solid oklch(0.78 0.14 72 / 0.3)' }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4"
          style={{
            background: 'linear-gradient(135deg, oklch(0.26 0.12 22) 0%, oklch(0.34 0.14 22) 100%)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold text-ivory flex items-center gap-2">
              <ShoppingCart size={20} style={{ color: 'oklch(0.78 0.14 72)' }} />
              Place Order
            </DialogTitle>
            <DialogDescription className="font-body text-sm" style={{ color: 'oklch(0.78 0.14 72 / 0.8)' }}>
              Fill in your details to place an order for this saree.
            </DialogDescription>
          </DialogHeader>
        </div>

        {orderSuccess ? (
          /* ── Success State ── */
          <div className="px-6 py-8 flex flex-col items-center text-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'oklch(0.52 0.14 140 / 0.15)' }}
            >
              <CheckCircle2 size={36} style={{ color: 'oklch(0.42 0.14 140)' }} />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold mb-1" style={{ color: 'oklch(0.38 0.16 22)' }}>
                Order Placed Successfully!
              </h3>
              <p className="font-body text-sm text-muted-foreground mb-1">
                Order <span className="font-semibold">#{String(orderId ?? '').padStart(4, '0')}</span> has been received.
              </p>
              <p className="font-body text-xs text-muted-foreground">
                Our team will contact you at <span className="font-semibold">{customerPhone}</span> to confirm your order.
              </p>
            </div>
            <div
              className="w-full rounded-sm p-3 text-left"
              style={{ background: 'oklch(0.97 0.008 80)', border: '1px solid oklch(0.88 0.025 70)' }}
            >
              <p className="font-body text-xs text-muted-foreground mb-1">Order Summary</p>
              <p className="font-heading text-sm font-semibold">{saree.name}</p>
              <p className="font-body text-xs text-muted-foreground">
                {FABRIC_LABELS[saree.fabricType]} · {saree.color} · Qty: {quantity}
              </p>
              <div className="flex items-center gap-0.5 mt-1">
                <IndianRupee size={13} style={{ color: 'oklch(0.38 0.16 22)' }} />
                <span className="font-heading font-bold text-sm" style={{ color: 'oklch(0.38 0.16 22)' }}>
                  {totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <Button
              onClick={handleClose}
              className="w-full font-heading font-semibold rounded-sm"
              style={{
                background: 'linear-gradient(135deg, oklch(0.62 0.16 65), oklch(0.78 0.14 72))',
                color: 'oklch(0.18 0.04 30)',
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          /* ── Order Form ── */
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Product Preview */}
            <div
              className="flex items-center gap-3 p-3 rounded-sm"
              style={{ background: 'oklch(0.97 0.008 80)', border: '1px solid oklch(0.88 0.025 70)' }}
            >
              <img
                src={saree.image?.getDirectURL?.() || '/assets/generated/saree-placeholder.dim_400x500.png'}
                alt={saree.name}
                className="w-14 h-16 object-cover rounded-sm flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/generated/saree-placeholder.dim_400x500.png';
                }}
              />
              <div className="min-w-0">
                <p className="font-heading text-sm font-semibold truncate">{saree.name}</p>
                <p className="font-body text-xs text-muted-foreground">
                  {FABRIC_LABELS[saree.fabricType]} · {saree.color}
                </p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <IndianRupee size={12} style={{ color: 'oklch(0.38 0.16 22)' }} />
                  <span className="font-heading font-bold text-sm" style={{ color: 'oklch(0.38 0.16 22)' }}>
                    {unitPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="font-body text-xs text-muted-foreground ml-1">/ piece</span>
                </div>
              </div>
            </div>

            {/* Customer Name */}
            <div className="space-y-1.5">
              <Label htmlFor="order-name" className="font-body text-sm font-medium">
                Your Name <span style={{ color: 'oklch(0.52 0.22 25)' }}>*</span>
              </Label>
              <Input
                id="order-name"
                placeholder="Enter your full name"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className="font-body text-sm"
                disabled={placeOrder.isPending}
              />
              {errors.name && (
                <p className="font-body text-xs" style={{ color: 'oklch(0.52 0.22 25)' }}>{errors.name}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label htmlFor="order-phone" className="font-body text-sm font-medium">
                Phone Number <span style={{ color: 'oklch(0.52 0.22 25)' }}>*</span>
              </Label>
              <Input
                id="order-phone"
                placeholder="10-digit mobile number"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                className="font-body text-sm"
                disabled={placeOrder.isPending}
                inputMode="numeric"
              />
              {errors.phone && (
                <p className="font-body text-xs" style={{ color: 'oklch(0.52 0.22 25)' }}>{errors.phone}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label htmlFor="order-qty" className="font-body text-sm font-medium">
                Quantity
              </Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || placeOrder.isPending}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center font-heading font-bold text-base transition-colors hover:border-gold-dark disabled:opacity-40"
                >
                  −
                </button>
                <Input
                  id="order-qty"
                  type="number"
                  min={1}
                  max={maxStock}
                  value={quantity}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(maxStock, Number(e.target.value) || 1));
                    setQuantity(v);
                    if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: undefined }));
                  }}
                  className="font-body text-sm text-center w-20"
                  disabled={placeOrder.isPending}
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  disabled={quantity >= maxStock || placeOrder.isPending}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center font-heading font-bold text-base transition-colors hover:border-gold-dark disabled:opacity-40"
                >
                  +
                </button>
                <span className="font-body text-xs text-muted-foreground">
                  of {maxStock} available
                </span>
              </div>
              {errors.quantity && (
                <p className="font-body text-xs" style={{ color: 'oklch(0.52 0.22 25)' }}>{errors.quantity}</p>
              )}
            </div>

            {/* Total Price */}
            <div
              className="flex items-center justify-between p-3 rounded-sm"
              style={{ background: 'oklch(0.62 0.16 65 / 0.08)', border: '1px solid oklch(0.78 0.14 72 / 0.25)' }}
            >
              <span className="font-body text-sm font-medium">Total Amount</span>
              <div className="flex items-center gap-0.5">
                <IndianRupee size={15} style={{ color: 'oklch(0.38 0.16 22)' }} />
                <span className="font-heading font-bold text-lg" style={{ color: 'oklch(0.38 0.16 22)' }}>
                  {totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Backend Error */}
            {placeOrder.isError && (
              <p className="font-body text-xs text-center" style={{ color: 'oklch(0.52 0.22 25)' }}>
                Failed to place order. Please try again.
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 font-body text-sm rounded-sm"
                disabled={placeOrder.isPending}
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={placeOrder.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-sm font-heading font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.38 0.16 22), oklch(0.52 0.18 22))',
                  color: 'oklch(0.97 0.008 85)',
                }}
              >
                {placeOrder.isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Placing Order…
                  </>
                ) : (
                  <>
                    <ShoppingCart size={15} />
                    Confirm Order
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
