import { useState } from 'react';
import { Plus, Pencil, Users, Loader2, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useGetAllCustomers, useAddCustomer, useUpdateCustomer } from '@/hooks/useQueries';
import { type Customer } from '../backend';

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const defaultForm: CustomerFormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
};

function CustomerModal({
  open,
  onClose,
  editCustomer,
}: {
  open: boolean;
  onClose: () => void;
  editCustomer: Customer | null;
}) {
  const [form, setForm] = useState<CustomerFormData>(() => {
    if (editCustomer) {
      return {
        name: editCustomer.name,
        phone: editCustomer.phone,
        email: editCustomer.email ?? '',
        address: editCustomer.address,
      };
    }
    return defaultForm;
  });
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

  const addCustomer = useAddCustomer();
  const updateCustomer = useUpdateCustomer();
  const isSubmitting = addCustomer.isPending || updateCustomer.isPending;

  const validate = () => {
    const errs: Partial<CustomerFormData> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(form.phone.trim())) errs.phone = 'Enter a valid phone number';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const emailVal = form.email.trim() || null;
    try {
      if (editCustomer) {
        await updateCustomer.mutateAsync({
          phone: editCustomer.phone,
          name: form.name.trim(),
          email: emailVal,
          address: form.address.trim(),
        });
      } else {
        await addCustomer.mutateAsync({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: emailVal,
          address: form.address.trim(),
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to save customer:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {editCustomer ? 'Edit Customer' : 'Add New Customer'}
          </DialogTitle>
          <DialogDescription className="font-body text-sm text-muted-foreground">
            {editCustomer ? 'Update customer information.' : 'Add a new customer to your records.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="cust-name" className="font-body text-sm font-medium">Full Name *</Label>
            <Input
              id="cust-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Priya Sharma"
              className={`mt-1 font-body text-sm ${errors.name ? 'border-destructive' : ''}`}
            />
            {errors.name && <p className="text-xs font-body text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="cust-phone" className="font-body text-sm font-medium">
              Phone Number * {editCustomer && <span className="text-muted-foreground text-xs">(cannot change)</span>}
            </Label>
            <div className="relative mt-1">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="cust-phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                disabled={!!editCustomer}
                className={`pl-8 font-body text-sm ${errors.phone ? 'border-destructive' : ''} ${editCustomer ? 'opacity-60' : ''}`}
              />
            </div>
            {errors.phone && <p className="text-xs font-body text-destructive mt-1">{errors.phone}</p>}
          </div>

          <div>
            <Label htmlFor="cust-email" className="font-body text-sm font-medium">Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <div className="relative mt-1">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="cust-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="priya@example.com"
                className={`pl-8 font-body text-sm ${errors.email ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.email && <p className="text-xs font-body text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="cust-address" className="font-body text-sm font-medium">Address *</Label>
            <div className="relative mt-1">
              <MapPin size={14} className="absolute left-3 top-3 text-muted-foreground" />
              <textarea
                id="cust-address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Street, City, State, PIN"
                rows={3}
                className={`w-full pl-8 pr-3 py-2 text-sm font-body rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring ${errors.address ? 'border-destructive' : 'border-input'}`}
              />
            </div>
            {errors.address && <p className="text-xs font-body text-destructive mt-1">{errors.address}</p>}
          </div>
        </div>

        {(addCustomer.isError || updateCustomer.isError) && (
          <p className="text-sm font-body text-destructive text-center">
            Failed to save. The phone number may already be registered.
          </p>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="font-body">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="font-body border-0"
            style={{ background: 'linear-gradient(135deg, oklch(0.26 0.12 22), oklch(0.38 0.16 22))', color: 'oklch(0.97 0.008 85)' }}
          >
            {isSubmitting ? (
              <><Loader2 size={14} className="animate-spin mr-2" /> Saving...</>
            ) : (
              editCustomer ? 'Update Customer' : 'Add Customer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCustomers() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');

  const { data: customers, isLoading, error } = useGetAllCustomers();

  const filtered = customers?.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  }) ?? [];

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditCustomer(null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditCustomer(null);
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="page-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-xs tracking-widest uppercase mb-1"
                style={{ color: 'oklch(0.78 0.14 72 / 0.7)' }}>
                Admin Panel
              </p>
              <h1 className="font-heading text-3xl font-bold text-ivory">Customers</h1>
              <p className="font-body text-sm mt-1" style={{ color: 'oklch(0.92 0.02 75 / 0.7)' }}>
                Manage your customer database
              </p>
            </div>
            <Button
              onClick={handleAdd}
              className="font-body font-semibold flex items-center gap-2 border-0"
              style={{ background: 'linear-gradient(135deg, oklch(0.62 0.16 65), oklch(0.78 0.14 72))', color: 'oklch(0.18 0.04 30)' }}
            >
              <Plus size={16} />
              Add Customer
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {!isLoading && customers && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-sm border border-border p-4">
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Customers</p>
              <p className="font-heading text-2xl font-bold" style={{ color: 'oklch(0.38 0.16 22)' }}>{customers.length}</p>
            </div>
            <div className="bg-card rounded-sm border border-border p-4">
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-1">With Email</p>
              <p className="font-heading text-2xl font-bold" style={{ color: 'oklch(0.52 0.12 195)' }}>
                {customers.filter(c => c.email).length}
              </p>
            </div>
            <div className="bg-card rounded-sm border border-border p-4">
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-1">Repeat Customers</p>
              <p className="font-heading text-2xl font-bold" style={{ color: 'oklch(0.52 0.14 140)' }}>
                {customers.filter(c => Number(c.totalOrders) > 1).length}
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 font-body text-sm"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <p className="font-body text-destructive">Failed to load customers.</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-sm" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && customers?.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'oklch(0.93 0.012 75)' }}>
              <Users size={28} className="text-muted-foreground" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">No Customers Yet</h3>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Add your first customer to start building your database.
            </p>
            <Button onClick={handleAdd} className="font-body"
              style={{ background: 'linear-gradient(135deg, oklch(0.38 0.16 22), oklch(0.52 0.18 22))', color: 'oklch(0.97 0.008 85)' }}>
              <Plus size={16} className="mr-2" /> Add First Customer
            </Button>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && customers && customers.length > 0 && (
          <>
            {search && (
              <p className="text-sm font-body text-muted-foreground mb-3">
                Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{' '}
                <span className="font-semibold text-foreground">{customers.length}</span> customers
              </p>
            )}
            <div className="rounded-sm border border-border overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: 'oklch(0.93 0.012 75)' }}>
                      <TableHead className="font-body text-xs font-semibold uppercase tracking-wide text-foreground">Name</TableHead>
                      <TableHead className="font-body text-xs font-semibold uppercase tracking-wide text-foreground">Phone</TableHead>
                      <TableHead className="font-body text-xs font-semibold uppercase tracking-wide text-foreground hidden sm:table-cell">Email</TableHead>
                      <TableHead className="font-body text-xs font-semibold uppercase tracking-wide text-foreground hidden md:table-cell">Address</TableHead>
                      <TableHead className="font-body text-xs font-semibold uppercase tracking-wide text-foreground text-center">Orders</TableHead>
                      <TableHead className="font-body text-xs font-semibold uppercase tracking-wide text-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((customer) => (
                      <TableRow key={customer.phone} className="admin-table-row">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-heading font-bold text-sm"
                              style={{
                                background: 'linear-gradient(135deg, oklch(0.38 0.16 22), oklch(0.52 0.18 22))',
                                color: 'oklch(0.97 0.008 85)'
                              }}>
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-body text-sm font-medium">{customer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-body text-sm text-muted-foreground flex items-center gap-1">
                            <Phone size={12} />
                            {customer.phone}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {customer.email ? (
                            <span className="font-body text-sm text-muted-foreground flex items-center gap-1">
                              <Mail size={12} />
                              {customer.email}
                            </span>
                          ) : (
                            <span className="text-xs font-body text-muted-foreground/50">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="font-body text-sm text-muted-foreground flex items-center gap-1 max-w-[200px] truncate">
                            <MapPin size={12} className="flex-shrink-0" />
                            {customer.address}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={Number(customer.totalOrders) > 0 ? 'default' : 'secondary'}
                            className="font-body text-xs"
                            style={Number(customer.totalOrders) > 0 ? {
                              background: 'oklch(0.38 0.16 22)',
                              color: 'oklch(0.97 0.008 85)'
                            } : {}}
                          >
                            <ShoppingBag size={10} className="mr-1" />
                            {String(customer.totalOrders)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(customer)}
                            className="font-body text-xs h-8 px-3 hover:text-crimson"
                          >
                            <Pencil size={12} className="mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <CustomerModal
          open={modalOpen}
          onClose={handleClose}
          editCustomer={editCustomer}
        />
      )}
    </div>
  );
}
