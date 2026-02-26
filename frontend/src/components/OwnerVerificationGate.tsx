import { useState } from 'react';
import { Shield, Phone, Lock, AlertCircle } from 'lucide-react';
import { useOwnerAuth } from '@/hooks/useOwnerAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface OwnerVerificationGateProps {
  children: React.ReactNode;
}

export default function OwnerVerificationGate({ children }: OwnerVerificationGateProps) {
  const { isVerified, verifyPhoneNumber } = useOwnerAuth();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [attempted, setAttempted] = useState(false);

  if (isVerified) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    const success = verifyPhoneNumber(input.trim());
    if (!success) {
      setError('Access denied. Invalid phone number or password.');
    } else {
      setError('');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-sm rounded-2xl shadow-silk-lg overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, oklch(0.22 0.07 22) 0%, oklch(0.18 0.05 22) 100%)',
          border: '1px solid oklch(0.78 0.14 72 / 0.25)',
        }}
      >
        {/* Header */}
        <div
          className="px-8 py-6 text-center"
          style={{
            background: 'linear-gradient(135deg, oklch(0.26 0.12 22) 0%, oklch(0.32 0.10 22) 100%)',
            borderBottom: '1px solid oklch(0.78 0.14 72 / 0.2)',
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{
              background: 'linear-gradient(135deg, oklch(0.62 0.16 65), oklch(0.78 0.14 72))',
            }}
          >
            <Lock size={24} style={{ color: 'oklch(0.18 0.04 30)' }} />
          </div>
          <h2 className="font-heading text-xl font-bold" style={{ color: 'oklch(0.88 0.12 78)' }}>
            Admin Access
          </h2>
          <p className="text-sm font-body mt-1" style={{ color: 'oklch(0.65 0.06 60)' }}>
            Enter your phone number or admin password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="owner-input"
              className="font-body text-sm font-medium"
              style={{ color: 'oklch(0.78 0.10 65)' }}
            >
              Phone Number or Password
            </Label>
            <div className="relative">
              <Phone
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'oklch(0.62 0.16 65)' }}
              />
              <Input
                id="owner-input"
                type="text"
                placeholder="Phone number or admin password"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (attempted) setError('');
                }}
                className="pl-9 font-body"
                style={{
                  background: 'oklch(0.16 0.04 22)',
                  borderColor: error
                    ? 'oklch(0.55 0.22 22)'
                    : 'oklch(0.78 0.14 72 / 0.3)',
                  color: 'oklch(0.92 0.04 80)',
                }}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm font-body"
              style={{
                background: 'oklch(0.55 0.22 22 / 0.15)',
                border: '1px solid oklch(0.55 0.22 22 / 0.4)',
                color: 'oklch(0.75 0.18 22)',
              }}
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full font-heading font-semibold"
            style={{
              background: 'linear-gradient(135deg, oklch(0.62 0.16 65), oklch(0.78 0.14 72))',
              color: 'oklch(0.18 0.04 30)',
              border: 'none',
            }}
          >
            <Shield size={15} className="mr-2" />
            Verify & Enter Admin
          </Button>

          <p className="text-center text-xs font-body" style={{ color: 'oklch(0.50 0.04 50)' }}>
            Only authorized owners can access the admin panel.
          </p>
        </form>
      </div>
    </div>
  );
}
