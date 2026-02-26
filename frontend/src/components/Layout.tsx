import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Menu, X, ShoppingBag, Package, Users, BookOpen, Phone, LogOut } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import {
  BUSINESS_PHONE,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_ALT,
  BUSINESS_PHONE_ALT_DISPLAY,
  WHATSAPP_LINK,
} from '@/config/constants';
import { useOwnerAuth } from '@/hooks/useOwnerAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const publicNavItems = [
  { label: 'Catalog', path: '/', icon: BookOpen },
];

const adminNavItems = [
  { label: 'Manage Sarees', path: '/admin/sarees', icon: Package },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', path: '/admin/customers', icon: Users },
];

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { isVerified, clearVerification } = useOwnerAuth();

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const visibleNavItems = isVerified
    ? [...publicNavItems, ...adminNavItems]
    : publicNavItems;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 shadow-silk" style={{
        background: 'linear-gradient(135deg, oklch(0.26 0.12 22) 0%, oklch(0.38 0.16 22) 60%, oklch(0.32 0.10 22) 100%)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, oklch(0.62 0.16 65), oklch(0.78 0.14 72), oklch(0.88 0.12 78))' }}>
                  <span className="text-crimson-dark font-heading font-bold text-lg">K</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                  style={{ background: 'oklch(0.62 0.16 65)' }} />
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold leading-none"
                  style={{ color: 'oklch(0.88 0.12 78)' }}>
                  KBR Silks
                </h1>
                <p className="text-xs font-body tracking-wide italic leading-tight"
                  style={{ color: 'oklch(0.88 0.12 78 / 0.55)' }}>
                  Pure Silk. Timeless Elegance.
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const isAdmin = adminNavItems.some(a => a.path === item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-body font-medium transition-all duration-200 ${
                      active
                        ? 'text-crimson-dark'
                        : 'text-ivory/70 hover:text-ivory'
                    }`}
                    style={active ? {
                      background: 'linear-gradient(135deg, oklch(0.62 0.16 65), oklch(0.78 0.14 72))',
                      color: 'oklch(0.18 0.04 30)',
                    } : {}}
                  >
                    <Icon size={15} />
                    {item.label}
                    {isAdmin && !active && (
                      <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full font-body"
                        style={{ background: 'oklch(0.38 0.16 22 / 0.5)', color: 'oklch(0.78 0.14 72)' }}>
                        Admin
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Logout button for verified owners */}
              {isVerified && (
                <button
                  onClick={clearVerification}
                  className="flex items-center gap-2 px-3 py-2 rounded-sm text-sm font-body font-medium transition-all duration-200 hover:opacity-80 ml-1"
                  style={{ color: 'oklch(0.75 0.18 22)' }}
                  title="Exit admin mode"
                >
                  <LogOut size={14} />
                  <span className="hidden lg:inline">Exit Admin</span>
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-sm transition-colors"
              style={{ color: 'oklch(0.88 0.12 78)' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t"
            style={{
              borderColor: 'oklch(0.78 0.14 72 / 0.2)',
              background: 'oklch(0.22 0.07 22)'
            }}>
            <nav className="px-4 py-3 space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const isAdmin = adminNavItems.some(a => a.path === item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-body font-medium transition-all duration-200 ${
                      active ? 'text-crimson-dark' : 'text-ivory/80 hover:text-ivory'
                    }`}
                    style={active ? {
                      background: 'linear-gradient(135deg, oklch(0.62 0.16 65), oklch(0.78 0.14 72))',
                      color: 'oklch(0.18 0.04 30)',
                    } : {}}
                  >
                    <Icon size={16} />
                    {item.label}
                    {isAdmin && (
                      <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: 'oklch(0.38 0.16 22 / 0.5)', color: 'oklch(0.78 0.14 72)' }}>
                        Admin
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Mobile logout for verified owners */}
              {isVerified && (
                <button
                  onClick={() => { clearVerification(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-body font-medium w-full transition-all duration-200 hover:opacity-80"
                  style={{ color: 'oklch(0.75 0.18 22)' }}
                >
                  <LogOut size={16} />
                  Exit Admin Mode
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t"
        style={{
          background: 'linear-gradient(135deg, oklch(0.22 0.07 22) 0%, oklch(0.26 0.10 22) 100%)',
          borderColor: 'oklch(0.78 0.14 72 / 0.2)'
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, oklch(0.62 0.16 65), oklch(0.78 0.14 72))' }}>
                <span className="text-crimson-dark font-heading font-bold text-sm">K</span>
              </div>
              <div>
                <p className="font-heading font-semibold text-sm" style={{ color: 'oklch(0.88 0.12 78)' }}>
                  KBR Silks
                </p>
                <p className="text-xs font-body" style={{ color: 'oklch(0.65 0.04 60)' }}>
                  Tradition Woven in Every Thread
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-body uppercase tracking-wider" style={{ color: 'oklch(0.65 0.04 60)' }}>
                Contact Us
              </p>

              {/* Phone numbers */}
              <div className="flex flex-col items-center gap-1">
                <a
                  href={`tel:${BUSINESS_PHONE}`}
                  className="flex items-center gap-1.5 text-sm font-body transition-colors hover:opacity-80"
                  style={{ color: 'oklch(0.88 0.12 78)' }}
                >
                  <Phone size={12} style={{ color: 'oklch(0.78 0.14 72)' }} />
                  <span className="font-semibold">{BUSINESS_PHONE_DISPLAY}</span>
                </a>
                <a
                  href={`tel:${BUSINESS_PHONE_ALT}`}
                  className="flex items-center gap-1.5 text-xs font-body transition-colors hover:opacity-80"
                  style={{ color: 'oklch(0.75 0.06 60)' }}
                >
                  <Phone size={11} style={{ color: 'oklch(0.65 0.08 65)' }} />
                  <span>{BUSINESS_PHONE_ALT_DISPLAY} (Alt)</span>
                </a>
              </div>

              {/* WhatsApp Button */}
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 mt-1"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.52 0.18 145), oklch(0.62 0.20 145))',
                  border: '1px solid oklch(0.70 0.18 145 / 0.4)',
                  color: 'oklch(0.98 0.01 85)',
                }}
              >
                <SiWhatsapp size={15} />
                <span className="font-heading font-semibold text-sm">Chat on WhatsApp</span>
              </a>
            </div>

            {/* Attribution */}
            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-xs font-body" style={{ color: 'oklch(0.55 0.04 50)' }}>
                © {new Date().getFullYear()} KBR Silks. All rights reserved.
              </p>
              <p className="text-xs font-body flex items-center gap-1" style={{ color: 'oklch(0.55 0.04 50)' }}>
                Built with{' '}
                <span style={{ color: 'oklch(0.62 0.16 22)' }}>♥</span>
                {' '}using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'kbr-silks')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline transition-colors"
                  style={{ color: 'oklch(0.78 0.14 72)' }}
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
