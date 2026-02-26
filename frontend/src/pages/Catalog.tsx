import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag, Search, Filter, Star, Package, RefreshCw,
  ChevronRight, Phone, Award, Truck, Shield, Heart
} from 'lucide-react';
import { SiWhatsapp, SiInstagram, SiFacebook } from 'react-icons/si';
import { useGetAllSarees } from '../hooks/useQueries';
import { FabricType, type Saree } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import OrderPlacementModal from '../components/OrderPlacementModal';
import { WHATSAPP_LINK, BUSINESS_PHONE_DISPLAY } from '@/config/constants';

const FABRIC_LABELS: Record<string, string> = {
  [FabricType.Kanjivaram]: 'Kanjivaram',
  [FabricType.Banarasi]: 'Banarasi',
  [FabricType.Mysore]: 'Mysore',
};

// ── Static testimonials ──────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Priya Raghunathan',
    location: 'Chennai',
    rating: 5,
    text: 'The Dharmavaram silk saree I ordered for my daughter\'s wedding was absolutely breathtaking. The gold zari work was exquisite and the fabric quality was unmatched. KBR Silks truly delivers royalty!',
    avatar: 'PR',
  },
  {
    id: 2,
    name: 'Lakshmi Venkatesh',
    location: 'Hyderabad',
    rating: 5,
    text: 'I have been buying sarees from KBR Silks for over 5 years. Their collection is always fresh, authentic, and the customer service is exceptional. The WhatsApp ordering is so convenient!',
    avatar: 'LV',
  },
  {
    id: 3,
    name: 'Anitha Krishnamurthy',
    location: 'Bangalore',
    rating: 5,
    text: 'Ordered a bridal Kanjivaram for my sister\'s wedding. The saree arrived beautifully packed and the colors were exactly as shown. The rich maroon with gold border was simply divine!',
    avatar: 'AK',
  },
  {
    id: 4,
    name: 'Meenakshi Sundaram',
    location: 'Coimbatore',
    rating: 5,
    text: 'KBR Silks is my go-to for all festive occasions. The quality of their Banarasi collection is outstanding. Every saree feels like a piece of art. Highly recommended!',
    avatar: 'MS',
  },
];

// ── Saree Image Component ────────────────────────────────────────────────────
function SareeImage({ saree, imageKey }: { saree: Saree; imageKey: string }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [imageKey]);

  if (saree.image && !imgError) {
    const url = saree.image.getDirectURL();
    return (
      <img
        src={url}
        alt={saree.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <img
      src="/assets/generated/saree-placeholder.dim_400x500.png"
      alt={saree.name}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

// ── Saree Card (Catalog Grid) ────────────────────────────────────────────────
function SareeCard({ saree, onOrderNow }: { saree: Saree; onOrderNow: (saree: Saree) => void }) {
  const fabricLabel = FABRIC_LABELS[saree.fabricType as unknown as string] ?? String(saree.fabricType);
  const isOutOfStock = saree.stock === 0n;
  const imageKey = saree.image ? saree.image.getDirectURL() : 'no-image';

  const whatsappMsg = encodeURIComponent(
    `Hi KBR Silks, I am interested in "${saree.name}" priced at ₹${Number(saree.price).toLocaleString('en-IN')}. Can you provide more details?`
  );
  const whatsappUrl = `https://wa.me/919573147399?text=${whatsappMsg}`;

  return (
    <div className="saree-card group bg-card overflow-hidden border border-border/50 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/5]">
        <SareeImage saree={saree} imageKey={imageKey} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-2 left-2">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-sm backdrop-blur-sm"
            style={{
              background: 'oklch(0.22 0.12 18 / 0.9)',
              color: 'oklch(0.86 0.12 76)',
              border: '1px solid oklch(0.75 0.15 68 / 0.4)',
            }}
          >
            {fabricLabel}
          </span>
        </div>
        {isOutOfStock && (
          <div className="absolute top-2 right-2">
            <span className="bg-destructive/90 text-destructive-foreground text-xs font-semibold px-2 py-0.5 rounded-sm backdrop-blur-sm">
              Out of Stock
            </span>
          </div>
        )}
        {/* Hover stars */}
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-white text-xs ml-1">Premium Quality</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-heading font-semibold text-foreground text-sm leading-tight mb-1 line-clamp-1">
          {saree.name}
        </h3>
        <p className="text-muted-foreground text-xs mb-2 line-clamp-2 font-body flex-1">{saree.description}</p>

        <div className="flex items-center gap-1.5 mb-2">
          <span
            className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-sm"
            style={{
              background: 'oklch(0.75 0.15 68 / 0.1)',
              color: 'oklch(0.32 0.16 18)',
              border: '1px solid oklch(0.75 0.15 68 / 0.3)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full border border-border/50 inline-block"
              style={{ backgroundColor: saree.color.toLowerCase() }}
            />
            {saree.color}
          </span>
          <span className="text-xs text-muted-foreground font-body">
            {Number(saree.stock)} left
          </span>
        </div>

        <div className="flex items-center justify-between gap-1">
          <span
            className="text-base font-bold font-heading"
            style={{ color: 'oklch(0.32 0.16 18)' }}
          >
            ₹{Number(saree.price).toLocaleString('en-IN')}
          </span>
          <button
            onClick={() => !isOutOfStock && onOrderNow(saree)}
            disabled={isOutOfStock}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold font-body rounded-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={
              isOutOfStock
                ? { background: 'oklch(0.88 0.025 70)', color: 'oklch(0.52 0.04 40)' }
                : {
                    background: 'linear-gradient(135deg, oklch(0.60 0.16 62), oklch(0.75 0.15 68))',
                    color: 'oklch(0.18 0.10 18)',
                  }
            }
          >
            <ShoppingBag className="w-3 h-3" />
            {isOutOfStock ? 'Sold Out' : 'Order'}
          </button>
        </div>

        {/* WhatsApp button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center gap-1.5 py-1.5 rounded-sm text-xs font-semibold font-body transition-all duration-200"
          style={{ background: '#25a244', color: 'white' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#2dc653'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#25a244'; }}
        >
          <SiWhatsapp className="w-3 h-3" />
          Order via WhatsApp
        </a>
      </div>
    </div>
  );
}

// ── Skeleton Card ────────────────────────────────────────────────────────────
function SareeCardSkeleton() {
  return (
    <div className="bg-card rounded-sm overflow-hidden border border-border/50">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-6 w-20 rounded-sm" />
        </div>
        <Skeleton className="h-7 w-full rounded-sm" />
      </div>
    </div>
  );
}

// ── Main Catalog / Homepage ──────────────────────────────────────────────────
export default function Catalog() {
  const { data: sarees, isLoading, isFetching, error, refetch } = useGetAllSarees();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [selectedSaree, setSelectedSaree] = useState<Saree | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const filteredSarees = useMemo(() => {
    if (!sarees) return [];
    let result = [...sarees];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.color.toLowerCase().includes(q),
      );
    }
    if (selectedFabric !== 'all') {
      result = result.filter((s) => (s.fabricType as unknown as string) === selectedFabric);
    }
    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }
    return result;
  }, [sarees, searchQuery, selectedFabric, sortBy]);

  // Bridal sarees: filter by name/description containing bridal/wedding keywords
  const bridalSarees = useMemo(() => {
    if (!sarees) return [];
    const keywords = ['bridal', 'wedding', 'bride', 'vivah', 'kalyana', 'marriage'];
    return sarees.filter((s) => {
      const text = `${s.name} ${s.description}`.toLowerCase();
      return keywords.some((kw) => text.includes(kw));
    });
  }, [sarees]);

  // Featured sarees: top 8 by price (premium items)
  const featuredSarees = useMemo(() => {
    if (!sarees) return [];
    return [...sarees]
      .sort((a, b) => Number(b.price) - Number(a.price))
      .slice(0, 8);
  }, [sarees]);

  const handleOrderNow = (saree: Saree) => {
    setSelectedSaree(saree);
    setIsOrderModalOpen(true);
  };

  const showSkeleton = isLoading || (isFetching && !sarees);

  return (
    <div className="min-h-screen bg-background">

      {/* ══════════════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[520px] md:min-h-[640px] lg:min-h-[720px]">
          {/* Hero Background Image */}
          <img
            src="/assets/generated/hero-banner.dim_1920x800.png"
            alt="KBR Silks — Tradition Woven with Elegance"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(105deg, oklch(0.14 0.08 18 / 0.92) 0%, oklch(0.18 0.10 18 / 0.80) 45%, oklch(0.14 0.08 18 / 0.40) 100%)',
            }}
          />

          {/* Hero Content */}
          <div className="relative z-10 flex items-center min-h-[520px] md:min-h-[640px] lg:min-h-[720px]">
            <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
              <div className="max-w-2xl">
                {/* Eyebrow */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="h-px w-12"
                    style={{ background: 'oklch(0.75 0.15 68)' }}
                  />
                  <span
                    className="font-body text-xs tracking-[0.25em] uppercase font-semibold"
                    style={{ color: 'oklch(0.86 0.12 76)' }}
                  >
                    Authentic Dharmavaram Silk
                  </span>
                </div>

                {/* Main Tagline */}
                <h1
                  className="font-heading font-bold leading-tight mb-3"
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                    color: 'oklch(0.97 0.008 85)',
                    textShadow: '0 2px 20px oklch(0.14 0.08 18 / 0.5)',
                  }}
                >
                  Tradition Woven
                  <br />
                  <span
                    className="font-display italic"
                    style={{
                      background: 'linear-gradient(135deg, oklch(0.75 0.15 68), oklch(0.86 0.12 76), oklch(0.75 0.15 68))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    with Elegance
                  </span>
                </h1>

                {/* Subtitle */}
                <p
                  className="font-body text-base md:text-lg leading-relaxed mb-8 max-w-lg"
                  style={{ color: 'oklch(0.97 0.008 85 / 0.80)' }}
                >
                  Discover our exquisite collection of handcrafted Kanjivaram, Banarasi & Mysore silk sarees — 
                  adorned with rich gold zari work for every celebration.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 items-center">
                  <button
                    onClick={() => {
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn-gold text-sm md:text-base px-8 py-3 flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Order Now
                  </button>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-sm text-sm md:text-base font-body font-semibold transition-all duration-200"
                    style={{
                      background: 'oklch(0.97 0.008 85 / 0.12)',
                      color: 'oklch(0.97 0.008 85)',
                      border: '1px solid oklch(0.97 0.008 85 / 0.35)',
                      backdropFilter: 'blur(8px)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'oklch(0.97 0.008 85 / 0.20)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'oklch(0.97 0.008 85 / 0.12)';
                    }}
                  >
                    <SiWhatsapp className="w-4 h-4" style={{ color: '#25a244' }} />
                    Chat with Us
                  </a>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-5 mt-8">
                  {[
                    { icon: Award, label: 'Authentic Silk' },
                    { icon: Truck, label: 'Free Delivery' },
                    { icon: Shield, label: 'Quality Assured' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <Icon className="w-4 h-4" style={{ color: 'oklch(0.75 0.15 68)' }} />
                      <span className="font-body text-xs" style={{ color: 'oklch(0.97 0.008 85 / 0.75)' }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
            <div
              className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1"
              style={{ borderColor: 'oklch(0.75 0.15 68 / 0.6)' }}
            >
              <div
                className="w-1 h-2 rounded-full"
                style={{ background: 'oklch(0.75 0.15 68)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          BRAND PROMISE STRIP
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: 'linear-gradient(90deg, oklch(0.22 0.12 18) 0%, oklch(0.28 0.14 18) 50%, oklch(0.22 0.12 18) 100%)',
          borderTop: '1px solid oklch(0.75 0.15 68 / 0.3)',
          borderBottom: '1px solid oklch(0.75 0.15 68 / 0.3)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Award, title: 'Pure Silk', desc: 'Certified authentic' },
              { icon: Truck, title: 'Free Delivery', desc: 'Orders above ₹5,000' },
              { icon: Shield, title: 'Quality Assured', desc: 'Handpicked collection' },
              { icon: Heart, title: 'Trusted Since', desc: 'Generations of craft' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 py-2">
                <div
                  className="w-9 h-9 rounded-sm flex items-center justify-center shrink-0"
                  style={{ background: 'oklch(0.75 0.15 68 / 0.15)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: 'oklch(0.86 0.12 76)' }} />
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold" style={{ color: 'oklch(0.86 0.12 76)' }}>
                    {title}
                  </p>
                  <p className="font-body text-xs" style={{ color: 'oklch(0.75 0.15 68 / 0.7)' }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURED COLLECTIONS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4" style={{ background: 'oklch(0.97 0.008 85)' }}>
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <p
              className="font-body text-xs tracking-[0.2em] uppercase font-semibold mb-2"
              style={{ color: 'oklch(0.75 0.15 68)' }}
            >
              Handpicked for You
            </p>
            <h2
              className="font-heading text-3xl md:text-4xl font-bold mb-3"
              style={{ color: 'oklch(0.22 0.12 18)' }}
            >
              Featured Collections
            </h2>
            <div className="ornament-divider max-w-xs mx-auto">
              <span className="font-display text-lg italic" style={{ color: 'oklch(0.75 0.15 68)' }}>
                ✦
              </span>
            </div>
            <p className="font-body text-sm text-muted-foreground mt-3 max-w-md mx-auto">
              Our finest selection of Dharmavaram silk sarees, curated for the discerning connoisseur
            </p>
          </div>

          {/* Featured Grid */}
          {showSkeleton ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SareeCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-body text-muted-foreground">Unable to load collection</p>
              <button onClick={() => refetch()} className="btn-gold mt-4 text-sm">
                Try Again
              </button>
            </div>
          ) : featuredSarees.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-heading text-lg font-semibold text-muted-foreground">
                Collection Coming Soon
              </p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Our curated collection will be available shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredSarees.map((saree) => {
                const imageUrl = saree.image ? saree.image.getDirectURL() : 'no-image';
                return (
                  <SareeCard
                    key={`featured-${Number(saree.id)}-${imageUrl}`}
                    saree={saree}
                    onOrderNow={handleOrderNow}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          BRIDAL SPECIALS
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-16 px-4"
        style={{
          background: 'linear-gradient(135deg, oklch(0.18 0.10 18) 0%, oklch(0.24 0.12 18) 50%, oklch(0.18 0.10 18) 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <p
              className="font-body text-xs tracking-[0.2em] uppercase font-semibold mb-2"
              style={{ color: 'oklch(0.75 0.15 68)' }}
            >
              For the Special Day
            </p>
            <h2
              className="font-heading text-3xl md:text-4xl font-bold mb-3"
              style={{ color: 'oklch(0.86 0.12 76)' }}
            >
              Bridal Specials
            </h2>
            <div className="ornament-divider max-w-xs mx-auto">
              <span className="font-display text-lg italic" style={{ color: 'oklch(0.75 0.15 68)' }}>
                ✦
              </span>
            </div>
            <p className="font-body text-sm mt-3 max-w-md mx-auto" style={{ color: 'oklch(0.75 0.15 68 / 0.75)' }}>
              Exquisite bridal sarees crafted for your most cherished moments
            </p>
          </div>

          {/* Ad Banner */}
          <div className="mb-8 rounded-sm overflow-hidden shadow-silk-lg">
            <img
              src="/assets/generated/fb-google-ad-banner.dim_1200x628.png"
              alt="KBR Silks Bridal Collection — Wedding Offers"
              className="w-full object-cover max-h-64 md:max-h-80"
            />
          </div>

          {/* Bridal Grid or Fallback */}
          {showSkeleton ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <SareeCardSkeleton key={i} />)}
            </div>
          ) : bridalSarees.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {bridalSarees.map((saree) => {
                const imageUrl = saree.image ? saree.image.getDirectURL() : 'no-image';
                return (
                  <SareeCard
                    key={`bridal-${Number(saree.id)}-${imageUrl}`}
                    saree={saree}
                    onOrderNow={handleOrderNow}
                  />
                );
              })}
            </div>
          ) : (
            /* Bridal placeholder cards when no bridal sarees exist */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  title: 'Bridal Kanjivaram',
                  desc: 'Rich maroon with heavy gold zari border — the quintessential bridal choice',
                  price: '₹18,500 onwards',
                },
                {
                  title: 'Wedding Banarasi',
                  desc: 'Opulent Banarasi silk with intricate brocade work for the perfect wedding look',
                  price: '₹15,000 onwards',
                },
                {
                  title: 'Bridal Mysore Silk',
                  desc: 'Lightweight yet luxurious Mysore silk with delicate gold zari for receptions',
                  price: '₹12,000 onwards',
                },
              ].map((item) => (
                <div key={item.title} className="card-luxury p-6 text-center">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'oklch(0.75 0.15 68 / 0.15)' }}
                  >
                    <Heart className="w-7 h-7" style={{ color: 'oklch(0.75 0.15 68)' }} />
                  </div>
                  <h3 className="font-heading text-lg font-bold mb-2" style={{ color: 'oklch(0.22 0.12 18)' }}>
                    {item.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground mb-3">{item.desc}</p>
                  <p className="font-heading text-base font-semibold" style={{ color: 'oklch(0.32 0.16 18)' }}>
                    {item.price}
                  </p>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 btn-whatsapp px-4 py-2 mx-auto"
                  >
                    <SiWhatsapp className="w-3.5 h-3.5" />
                    Enquire Now
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Bridal CTA */}
          <div className="text-center mt-10">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn-gold text-sm md:text-base px-8 py-3"
            >
              <SiWhatsapp className="w-4 h-4" />
              Book Bridal Consultation
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          INSTAGRAM PROMO BANNER
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-4" style={{ background: 'oklch(0.95 0.015 80)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p
                className="font-body text-xs tracking-[0.2em] uppercase font-semibold mb-2"
                style={{ color: 'oklch(0.75 0.15 68)' }}
              >
                Follow Our Journey
              </p>
              <h2
                className="font-heading text-2xl md:text-3xl font-bold mb-3"
                style={{ color: 'oklch(0.22 0.12 18)' }}
              >
                Drape the Legacy
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-5 leading-relaxed">
                Follow KBR Silks on social media for the latest collections, styling tips, 
                and exclusive offers. Be part of our growing community of silk saree lovers.
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-semibold font-body transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                    color: 'white',
                  }}
                >
                  <SiInstagram className="w-4 h-4" />
                  Instagram
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-semibold font-body transition-all"
                  style={{ background: '#1877f2', color: 'white' }}
                >
                  <SiFacebook className="w-4 h-4" />
                  Facebook
                </a>
              </div>
            </div>
            <div className="rounded-sm overflow-hidden shadow-silk-lg">
              <img
                src="/assets/generated/instagram-promo.dim_1080x1080.png"
                alt="KBR Silks — Drape the Legacy"
                className="w-full object-cover max-h-80 md:max-h-96"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FULL CATALOG WITH FILTERS
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="catalog-section" className="py-16 px-4" style={{ background: 'oklch(0.97 0.008 85)' }}>
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8">
            <p
              className="font-body text-xs tracking-[0.2em] uppercase font-semibold mb-2"
              style={{ color: 'oklch(0.75 0.15 68)' }}
            >
              Browse & Order
            </p>
            <h2
              className="font-heading text-3xl md:text-4xl font-bold mb-3"
              style={{ color: 'oklch(0.22 0.12 18)' }}
            >
              Our Complete Collection
            </h2>
            <div className="ornament-divider max-w-xs mx-auto">
              <span className="font-display text-lg italic" style={{ color: 'oklch(0.75 0.15 68)' }}>
                ✦
              </span>
            </div>
          </div>

          {/* Filters */}
          <div
            className="rounded-sm p-4 mb-6 border"
            style={{
              background: 'oklch(0.99 0.004 80)',
              borderColor: 'oklch(0.75 0.15 68 / 0.25)',
            }}
          >
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search sarees by name, color..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all font-body"
                  style={{ '--tw-ring-color': 'oklch(0.75 0.15 68 / 0.4)' } as React.CSSProperties}
                />
              </div>

              <div className="flex gap-2 items-center flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <select
                  value={selectedFabric}
                  onChange={(e) => setSelectedFabric(e.target.value)}
                  className="text-sm bg-background border border-border rounded-sm px-3 py-2 focus:outline-none font-body"
                >
                  <option value="all">All Fabrics</option>
                  <option value={FabricType.Kanjivaram}>Kanjivaram</option>
                  <option value={FabricType.Banarasi}>Banarasi</option>
                  <option value={FabricType.Mysore}>Mysore</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="text-sm bg-background border border-border rounded-sm px-3 py-2 focus:outline-none font-body"
                >
                  <option value="default">Sort: Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>

                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  title="Refresh catalog"
                  className="flex items-center justify-center w-8 h-8 rounded-sm border border-border hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${isFetching ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          {!showSkeleton && !error && (
            <div className="flex items-center justify-between mb-5">
              <p className="font-body text-sm text-muted-foreground">
                {filteredSarees.length === 0
                  ? 'No sarees found'
                  : `Showing ${filteredSarees.length} saree${filteredSarees.length !== 1 ? 's' : ''}`}
              </p>
              <div className="flex items-center gap-3">
                {isFetching && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-body">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Updating…
                  </span>
                )}
                {sarees && sarees.length > 0 && (
                  <p className="text-xs text-muted-foreground font-body">
                    {sarees.filter((s) => s.stock > 0n).length} in stock
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Loading */}
          {showSkeleton && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => <SareeCardSkeleton key={i} />)}
            </div>
          )}

          {/* Error */}
          {error && !showSkeleton && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="w-16 h-16 text-muted-foreground/40 mb-4" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Unable to load sarees
              </h3>
              <p className="font-body text-muted-foreground text-sm mb-4">
                There was an error loading the catalog. Please try again.
              </p>
              <button onClick={() => refetch()} className="btn-gold text-sm">
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!showSkeleton && !error && filteredSarees.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/40 mb-4" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                {sarees && sarees.length > 0 ? 'No sarees match your filters' : 'No sarees available yet'}
              </h3>
              <p className="font-body text-muted-foreground text-sm">
                {sarees && sarees.length > 0
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Check back soon for our latest collection.'}
              </p>
              {sarees && sarees.length > 0 && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedFabric('all'); setSortBy('default'); }}
                  className="mt-4 btn-gold text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Catalog Grid */}
          {!showSkeleton && !error && filteredSarees.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredSarees.map((saree) => {
                const imageUrl = saree.image ? saree.image.getDirectURL() : 'no-image';
                return (
                  <SareeCard
                    key={`${Number(saree.id)}-${imageUrl}`}
                    saree={saree}
                    onOrderNow={handleOrderNow}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CUSTOMER REVIEWS
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-16 px-4"
        style={{
          background: 'linear-gradient(135deg, oklch(0.18 0.10 18) 0%, oklch(0.24 0.12 18) 50%, oklch(0.18 0.10 18) 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <p
              className="font-body text-xs tracking-[0.2em] uppercase font-semibold mb-2"
              style={{ color: 'oklch(0.75 0.15 68)' }}
            >
              What Our Customers Say
            </p>
            <h2
              className="font-heading text-3xl md:text-4xl font-bold mb-3"
              style={{ color: 'oklch(0.86 0.12 76)' }}
            >
              Customer Reviews
            </h2>
            <div className="ornament-divider max-w-xs mx-auto">
              <span className="font-display text-lg italic" style={{ color: 'oklch(0.75 0.15 68)' }}>
                ✦
              </span>
            </div>
            <div className="flex items-center justify-center gap-1 mt-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
              <span className="font-body text-sm ml-2" style={{ color: 'oklch(0.75 0.15 68 / 0.8)' }}>
                4.9/5 from 500+ happy customers
              </span>
            </div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="testimonial-card">
                {/* Stars */}
                <div className="flex gap-0.5 mb-3 relative z-10">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {/* Quote */}
                <p className="font-body text-sm leading-relaxed text-muted-foreground mb-4 relative z-10">
                  {t.text}
                </p>
                {/* Author */}
                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-heading font-bold shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, oklch(0.22 0.12 18), oklch(0.32 0.16 18))',
                      color: 'oklch(0.86 0.12 76)',
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold" style={{ color: 'oklch(0.22 0.12 18)' }}>
                      {t.name}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          WHATSAPP CATALOG CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-14 px-4"
        style={{
          background: 'linear-gradient(135deg, oklch(0.95 0.015 80) 0%, oklch(0.97 0.008 85) 100%)',
          borderTop: '1px solid oklch(0.75 0.15 68 / 0.2)',
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ background: '#25a244' }}
          >
            <SiWhatsapp className="w-8 h-8 text-white" />
          </div>
          <h2
            className="font-heading text-2xl md:text-3xl font-bold mb-3"
            style={{ color: 'oklch(0.22 0.12 18)' }}
          >
            Order via WhatsApp
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-6 max-w-lg mx-auto leading-relaxed">
            Browse our complete catalog on WhatsApp Business. Get personalized recommendations, 
            check availability, and place your order — all in one conversation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-sm text-base font-semibold font-body transition-all shadow-lg"
              style={{ background: '#25a244', color: 'white' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#2dc653';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#25a244';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <SiWhatsapp className="w-5 h-5" />
              Open WhatsApp Catalog
            </a>
            <a
              href={`tel:${BUSINESS_PHONE_DISPLAY.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-sm text-base font-semibold font-body transition-all"
              style={{
                border: '2px solid oklch(0.32 0.16 18)',
                color: 'oklch(0.32 0.16 18)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'oklch(0.32 0.16 18)';
                (e.currentTarget as HTMLElement).style.color = 'oklch(0.97 0.008 85)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'oklch(0.32 0.16 18)';
              }}
            >
              <Phone className="w-5 h-5" />
              Call Us: {BUSINESS_PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          ORDER MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedSaree && (
        <OrderPlacementModal
          saree={selectedSaree}
          open={isOrderModalOpen}
          onClose={() => {
            setIsOrderModalOpen(false);
            setSelectedSaree(null);
          }}
        />
      )}
    </div>
  );
}
