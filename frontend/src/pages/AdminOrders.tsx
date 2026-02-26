import { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronUp, ChevronDown, Loader2, ShoppingBag, IndianRupee } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetAllOrders, useUpdateOrderStatus } from '@/hooks/useQueries';
import { OrderStatus, FabricType } from '../backend';

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'Pending',
  [OrderStatus.Confirmed]: 'Confirmed',
  [OrderStatus.Shipped]: 'Shipped',
  [OrderStatus.Delivered]: 'Delivered',
  [OrderStatus.Cancelled]: 'Cancelled',
};

const STATUS_STYLES: Record<OrderStatus, { bg: string; text: string }> = {
  [OrderStatus.Pending]:   { bg: 'oklch(0.82 0.12 75 / 0.18)',  text: 'oklch(0.55 0.16 65)' },
  [OrderStatus.Confirmed]: { bg: 'oklch(0.52 0.12 195 / 0.15)', text: 'oklch(0.38 0.12 195)' },
  [OrderStatus.Shipped]:   { bg: 'oklch(0.52 0.14 260 / 0.15)', text: 'oklch(0.38 0.14 260)' },
  [OrderStatus.Delivered]: { bg: 'oklch(0.52 0.14 140 / 0.15)', text: 'oklch(0.32 0.14 140)' },
  [OrderStatus.Cancelled]: { bg: 'oklch(0.52 0.22 25 / 0.12)',  text: 'oklch(0.45 0.20 25)' },
};

const FABRIC_LABELS: Record<FabricType, string> = {
  [FabricType.Kanjivaram]: 'Kanjivaram',
  [FabricType.Banarasi]: 'Banarasi',
  [FabricType.Mysore]: 'Mysore',
};

type SortKey = 'id' | 'customerName' | 'totalPrice' | 'orderDate' | 'status';
type SortDir = 'asc' | 'desc';

function formatDateTime(time: bigint): string {
  const ms = Number(time) / 1_000_000;
  return new Date(ms).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-semibold"
      style={{ background: style.bg, color: style.text }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function StatusCell({ orderId, currentStatus }: { orderId: bigint; currentStatus: OrderStatus }) {
  const updateStatus = useUpdateOrderStatus();
  const [localStatus, setLocalStatus] = useState<OrderStatus>(currentStatus);

  const handleChange = async (newStatus: OrderStatus) => {
    setLocalStatus(newStatus);
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus });
    } catch {
      setLocalStatus(currentStatus);
    }
  };

  const style = STATUS_STYLES[localStatus];

  return (
    <div className="flex items-center gap-2">
      <Select value={localStatus} onValueChange={(v) => handleChange(v as OrderStatus)}>
        <SelectTrigger
          className="h-8 text-xs font-body font-semibold border-0 w-32 rounded-full px-3"
          style={{ background: style.bg, color: style.text }}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(OrderStatus).map((s) => (
            <SelectItem key={s} value={s} className="text-xs font-body">
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: STATUS_STYLES[s].text }}
                />
                {STATUS_LABELS[s]}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {updateStatus.isPending && <Loader2 size={12} className="animate-spin text-muted-foreground" />}
    </div>
  );
}

export default function AdminOrders() {
  const { data: orders, isLoading, error } = useGetAllOrders();
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'id': cmp = Number(a.id) - Number(b.id); break;
        case 'customerName': cmp = a.customerName.localeCompare(b.customerName); break;
        case 'totalPrice': cmp = Number(a.totalPrice) - Number(b.totalPrice); break;
        case 'orderDate': cmp = Number(a.orderDate) - Number(b.orderDate); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [orders, sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="text-muted-foreground ml-1" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="ml-1" style={{ color: 'oklch(0.78 0.14 72)' }} />
      : <ChevronDown size={12} className="ml-1" style={{ color: 'oklch(0.78 0.14 72)' }} />;
  };

  const statusCounts = useMemo(() => {
    if (!orders) return {} as Record<OrderStatus, number>;
    return orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);
  }, [orders]);

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="page-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-body text-xs tracking-widest uppercase mb-1"
            style={{ color: 'oklch(0.78 0.14 72 / 0.7)' }}>
            Admin Panel
          </p>
          <h1 className="font-heading text-3xl font-bold text-ivory">Orders</h1>
          <p className="font-body text-sm mt-1" style={{ color: 'oklch(0.92 0.02 75 / 0.7)' }}>
            View and manage all customer orders · Auto-refreshes every 15 seconds
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {!isLoading && orders && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {Object.values(OrderStatus).map((status) => {
              const style = STATUS_STYLES[status];
              return (
                <div key={status} className="bg-card rounded-sm border border-border p-4">
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {STATUS_LABELS[status]}
                  </p>
                  <p className="font-heading text-2xl font-bold" style={{ color: style.text }}>
                    {statusCounts[status] || 0}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <p className="font-body text-destructive">Failed to load orders.</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-sm" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && orders?.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'oklch(0.93 0.012 75)' }}>
              <ShoppingBag size={28} className="text-muted-foreground" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="font-body text-sm text-muted-foreground">
              Orders placed by customers will appear here automatically.
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && sorted.length > 0 && (
          <div className="rounded-sm border border-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ background: 'oklch(0.93 0.012 75)' }}>
                    {[
                      { key: 'id' as SortKey,           label: 'Order ID' },
                      { key: 'customerName' as SortKey, label: 'Customer' },
                      { key: null,                       label: 'Phone' },
                      { key: null,                       label: 'Product' },
                      { key: null,                       label: 'Fabric' },
                      { key: null,                       label: 'Color' },
                      { key: null,                       label: 'Qty' },
                      { key: null,                       label: 'Unit Price' },
                      { key: 'totalPrice' as SortKey,   label: 'Total' },
                      { key: null,                       label: 'Payment' },
                      { key: 'orderDate' as SortKey,    label: 'Date & Time' },
                      { key: 'status' as SortKey,       label: 'Status' },
                    ].map(({ key, label }) => (
                      <TableHead
                        key={label}
                        className={`font-body text-xs font-semibold uppercase tracking-wide text-foreground whitespace-nowrap ${key ? 'cursor-pointer select-none hover:text-crimson' : ''}`}
                        onClick={key ? () => handleSort(key) : undefined}
                      >
                        <span className="flex items-center">
                          {label}
                          {key && <SortIcon col={key} />}
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((order) => {
                    // Extract first product detail (primary item)
                    const primaryProduct = order.productDetails?.[0];
                    const productName = primaryProduct?.name ?? '—';
                    const fabricLabel = primaryProduct
                      ? (FABRIC_LABELS[primaryProduct.fabricType] ?? String(primaryProduct.fabricType))
                      : '—';
                    const productColor = primaryProduct?.color ?? '—';
                    const qty = primaryProduct ? Number(primaryProduct.quantity) : order.items.reduce((s, i) => s + Number(i.quantity), 0);
                    const unitPrice = primaryProduct ? Number(primaryProduct.unitPrice) : 0;

                    return (
                      <TableRow key={String(order.id)} className="admin-table-row">
                        {/* Order ID */}
                        <TableCell className="font-body text-sm font-semibold whitespace-nowrap" style={{ color: 'oklch(0.38 0.16 22)' }}>
                          #{String(order.id).padStart(4, '0')}
                        </TableCell>

                        {/* Customer Name */}
                        <TableCell className="font-body text-sm font-medium whitespace-nowrap">
                          {order.customerName}
                        </TableCell>

                        {/* Phone */}
                        <TableCell className="font-body text-sm text-muted-foreground whitespace-nowrap">
                          {order.customerPhone}
                        </TableCell>

                        {/* Product Name */}
                        <TableCell className="font-body text-sm whitespace-nowrap max-w-[140px]">
                          <span className="truncate block" title={productName}>{productName}</span>
                        </TableCell>

                        {/* Fabric */}
                        <TableCell className="font-body text-sm text-muted-foreground whitespace-nowrap">
                          {fabricLabel}
                        </TableCell>

                        {/* Color */}
                        <TableCell className="font-body text-sm whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-3 h-3 rounded-full border border-border flex-shrink-0"
                              style={{ background: productColor.toLowerCase() }}
                            />
                            <span className="capitalize text-muted-foreground">{productColor}</span>
                          </span>
                        </TableCell>

                        {/* Quantity */}
                        <TableCell className="font-body text-sm text-center font-medium">
                          {qty}
                        </TableCell>

                        {/* Unit Price */}
                        <TableCell className="font-body text-sm whitespace-nowrap">
                          <span className="flex items-center gap-0.5">
                            <IndianRupee size={12} style={{ color: 'oklch(0.55 0.14 65)' }} />
                            <span>{unitPrice.toLocaleString('en-IN')}</span>
                          </span>
                        </TableCell>

                        {/* Total Price */}
                        <TableCell className="font-body text-sm font-semibold whitespace-nowrap">
                          <span className="flex items-center gap-0.5">
                            <IndianRupee size={12} style={{ color: 'oklch(0.38 0.16 22)' }} />
                            <span style={{ color: 'oklch(0.38 0.16 22)' }}>
                              {Number(order.totalPrice).toLocaleString('en-IN')}
                            </span>
                          </span>
                        </TableCell>

                        {/* Payment Status */}
                        <TableCell className="whitespace-nowrap">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-semibold"
                            style={
                              order.paymentStatus === 'Paid'
                                ? { background: 'oklch(0.52 0.14 140 / 0.15)', color: 'oklch(0.32 0.14 140)' }
                                : { background: 'oklch(0.82 0.12 75 / 0.18)', color: 'oklch(0.55 0.16 65)' }
                            }
                          >
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </TableCell>

                        {/* Date & Time */}
                        <TableCell className="font-body text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(order.orderDate)}
                        </TableCell>

                        {/* Status Dropdown */}
                        <TableCell>
                          <StatusCell orderId={order.id} currentStatus={order.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
