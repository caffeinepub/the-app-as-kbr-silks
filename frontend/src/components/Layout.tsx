import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Menu, X, ShoppingBag, Package, Users, BookOpen, Phone, Settings } from 'lucide-react';
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

  const isAdminRoute = currentPath.startsWith('/admin');

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const visibleNavItems = isVerified
    ? [...publicNavItems, ...adminNavItems]
    : publicNavItems;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Announcement Bar */}
      {!isAdminRoute && (
        <div
          className="text-center py-2 px-4 text-xs font-body tracking-wide"
          style={{
            background: 'linear-gradient(90deg, oklch(0.18 0.10 18) 0%, oklch(0.22 0.12 18) 50%, oklch(0.18 0.10 18) 100%)',
            color: 'oklch(0.86 0.12 76)',
          }}
        >
          ✦ Free Delivery on Orders Above ₹5,000 &nbsp;|&nbsp; Authentic Dharmavaram Silk Sarees &nbsp;|&nbsp; Call: {BUSINESS_PHONE_DISPLAY} ✦
        </div>
      )}

      {/* Main Header */}
      <header
        className="sticky top-0 z-50 shadow-silk"
        style={{
          background: 'linear-gradient(135deg, oklch(0.18 0.10 18) 0%, oklch(0.28 0.14 18) 50%, oklch(0.22 0.12 18) 100%)',
          borderBottom: '2px solid oklch(0.75 0.15 68 / 0.5)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-2">
            {/* Logo / Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/assets/generated/kbr-silks-logo.dim_400x200.png"
                alt="KBR Silks"
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  // Fallback to text logo if image fails
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Text fallback always visible alongside logo */}
              <div className="flex flex-col">
                <span
                  className="font-heading text-xl font-bold leading-none tracking-wide"
                  style={{ color: 'oklch(0.86 0.12 76)' }}
                >
                  KBR Silks
                </span>
                <span
                  className="font-display text-xs italic leading-tight tracking-wider"
                  style={{ color: 'oklch(0.75 0.15 68 / 0.75)' }}
                >
                  Pure Silk. Timeless Elegance.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-sm font-body font-medium transition-all duration-200"
                    style={{
                      color: active ? 'oklch(0.86 0.12 76)' : 'oklch(0.75 0.15 68 / 0.85)',
                      background: active ? 'oklch(0.75 0.15 68 / 0.15)' : 'transparent',
                      borderBottom: active ? '2px solid oklch(0.75 0.15 68)' : '2px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.color = 'oklch(0.86 0.12 76)';
                        (e.currentTarget as HTMLElement).style.background = 'oklch(0.75 0.15 68 / 0.10)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.color = 'oklch(0.75 0.15 68 / 0.85)';
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Cross-panel navigation */}
              {!isAdminRoute && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-sm font-body font-medium transition-all duration-200"
                  style={{ color: 'oklch(0.75 0.15 68 / 0.6)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'oklch(0.75 0.15 68)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'oklch(0.75 0.15 68 / 0.6)';
                  }}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
              {isAdminRoute && (
                <Link
                  to="/"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-sm font-body font-medium transition-all duration-200"
                  style={{ color: 'oklch(0.75 0.15 68 / 0.6)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'oklch(0.75 0.15 68)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'oklch(0.75 0.15 68 / 0.6)';
                  }}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  View Catalog
                </Link>
              )}

              {/* Logout for verified admins */}
              {isVerified && (
                <button
                  onClick={clearVerification}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-sm font-body font-medium transition-all duration-200 ml-1"
                  style={{ color: 'oklch(0.65 0.18 25)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'oklch(0.75 0.22 25)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'oklch(0.65 0.18 25)';
                  }}
                >
                  Logout
                </button>
              )}

              {/* WhatsApp CTA */}
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-sm text-xs font-body font-semibold transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #1a7a3c, #25a244)',
                  color: 'white',
                }}
              >
                <SiWhatsapp className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-sm transition-colors"
              style={{ color: 'oklch(0.75 0.15 68)' }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t"
            style={{
              background: 'oklch(0.16 0.08 18)',
              borderColor: 'oklch(0.75 0.15 68 / 0.3)',
            }}
          >
            <div className="px-4 py-3 space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-sm text-sm font-body font-medium transition-all"
                    style={{
                      color: active ? 'oklch(0.86 0.12 76)' : 'oklch(0.75 0.15 68 / 0.85)',
                      background: active ? 'oklch(0.75 0.15 68 / 0.15)' : 'transparent',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}

              {!isAdminRoute && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-sm text-sm font-body font-medium"
                  style={{ color: 'oklch(0.75 0.15 68 / 0.6)' }}
                >
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              {isAdminRoute && (
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-sm text-sm font-body font-medium"
                  style={{ color: 'oklch(0.75 0.15 68 / 0.6)' }}
                >
                  <BookOpen className="w-4 h-4" />
                  View Catalog
                </Link>
              )}

              {isVerified && (
                <button
                  onClick={() => { clearVerification(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-sm text-sm font-body font-medium w-full text-left"
                  style={{ color: 'oklch(0.65 0.18 25)' }}
                >
                  Logout
                </button>
              )}

              {/* Mobile contact info */}
              <div
                className="mt-3 pt-3 border-t space-y-2"
                style={{ borderColor: 'oklch(0.75 0.15 68 / 0.2)' }}
              >
                <a
                  href={`tel:${BUSINESS_PHONE}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-body"
                  style={{ color: 'oklch(0.75 0.15 68 / 0.75)' }}
                >
                  <Phone className="w-4 h-4" />
                  {BUSINESS_PHONE_DISPLAY}
                </a>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-body font-semibold"
                  style={{ color: '#25a244' }}
                >
                  <SiWhatsapp className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          background: 'linear-gradient(135deg, oklch(0.14 0.08 18) 0%, oklch(0.20 0.10 18) 50%, oklch(0.14 0.08 18) 100%)',
          borderTop: '2px solid oklch(0.75 0.15 68 / 0.4)',
        }}
      >
        {/* Gold ornament top border */}
        <div
          className="h-0.5 w-full"
          style={{
            background: 'linear-gradient(90deg, transparent, oklch(0.75 0.15 68), oklch(0.86 0.12 76), oklch(0.75 0.15 68), transparent)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/assets/generated/kbr-silks-logo.dim_400x200.png"
                  alt="KBR Silks"
                  className="h-10 w-auto object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div>
                  <h3 className="font-heading text-lg font-bold" style={{ color: 'oklch(0.86 0.12 76)' }}>
                    KBR Silks
                  </h3>
                  <p className="font-display text-xs italic" style={{ color: 'oklch(0.75 0.15 68 / 0.7)' }}>
                    Tradition Woven with Elegance
                  </p>
                </div>
              </div>
              <p className="font-body text-sm leading-relaxed" style={{ color: 'oklch(0.75 0.15 68 / 0.65)' }}>
                Purveyors of authentic Dharmavaram silk sarees with rich gold zari work. 
                Celebrating Indian heritage through every thread since generations.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all"
                  style={{ background: '#25a244', color: 'white' }}
                >
                  <SiWhatsapp className="w-3.5 h-3.5" />
                  WhatsApp Us
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-heading text-base font-semibold mb-4" style={{ color: 'oklch(0.86 0.12 76)' }}>
                Quick Links
              </h4>
              <ul className="space-y-2">
                {[
                  { label: 'Our Collection', href: '/' },
                  { label: 'Bridal Sarees', href: '/' },
                  { label: 'New Arrivals', href: '/' },
                  { label: 'Admin Panel', href: '/admin' },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="font-body text-sm transition-colors"
                      style={{ color: 'oklch(0.75 0.15 68 / 0.65)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'oklch(0.86 0.12 76)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'oklch(0.75 0.15 68 / 0.65)'; }}
                    >
                      ✦ {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-heading text-base font-semibold mb-4" style={{ color: 'oklch(0.86 0.12 76)' }}>
                Contact Us
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'oklch(0.75 0.15 68)' }} />
                  <div>
                    <a
                      href={`tel:${BUSINESS_PHONE}`}
                      className="font-body text-sm block transition-colors"
                      style={{ color: 'oklch(0.75 0.15 68 / 0.8)' }}
                    >
                      {BUSINESS_PHONE_DISPLAY}
                    </a>
                    <a
                      href={`tel:${BUSINESS_PHONE_ALT}`}
                      className="font-body text-sm block transition-colors"
                      style={{ color: 'oklch(0.75 0.15 68 / 0.8)' }}
                    >
                      {BUSINESS_PHONE_ALT_DISPLAY}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <SiWhatsapp className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#25a244' }} />
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-sm"
                    style={{ color: '#25a244' }}
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderColor: 'oklch(0.75 0.15 68 / 0.2)' }}
          >
            <p className="font-body text-xs" style={{ color: 'oklch(0.75 0.15 68 / 0.5)' }}>
              © {new Date().getFullYear()} KBR Silks. All rights reserved.
            </p>
            <p className="font-body text-xs flex items-center gap-1" style={{ color: 'oklch(0.75 0.15 68 / 0.5)' }}>
              Built with{' '}
              <span style={{ color: 'oklch(0.65 0.18 25)' }}>♥</span>
              {' '}using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'kbr-silks')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors"
                style={{ color: 'oklch(0.75 0.15 68 / 0.7)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'oklch(0.86 0.12 76)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'oklch(0.75 0.15 68 / 0.7)'; }}
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
