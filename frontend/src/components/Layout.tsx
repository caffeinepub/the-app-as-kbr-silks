import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Menu, X, ShoppingBag, Package, Users, BookOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Catalog', path: '/', icon: BookOpen, section: 'public' },
  { label: 'Manage Sarees', path: '/admin/sarees', icon: Package, section: 'admin' },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBag, section: 'admin' },
  { label: 'Customers', path: '/admin/customers', icon: Users, section: 'admin' },
];

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

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
                <p className="text-xs font-body tracking-widest uppercase"
                  style={{ color: 'oklch(0.78 0.14 72 / 0.7)' }}>
                  Fine Silk Sarees
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
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
                    {item.section === 'admin' && !active && (
                      <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full font-body"
                        style={{ background: 'oklch(0.38 0.16 22 / 0.5)', color: 'oklch(0.78 0.14 72)' }}>
                        Admin
                      </span>
                    )}
                  </Link>
                );
              })}
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
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
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
                    {item.section === 'admin' && (
                      <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: 'oklch(0.38 0.16 22 / 0.5)', color: 'oklch(0.78 0.14 72)' }}>
                        Admin
                      </span>
                    )}
                  </Link>
                );
              })}
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
                  Fine Silk Sarees — Tradition Woven in Every Thread
                </p>
              </div>
            </div>

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
