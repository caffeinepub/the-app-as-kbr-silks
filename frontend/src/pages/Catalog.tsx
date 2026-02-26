import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Star, Package, RefreshCw } from 'lucide-react';
import { useGetAllSarees } from '../hooks/useQueries';
import { FabricType, type Saree } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import OrderPlacementModal from '../components/OrderPlacementModal';

const FABRIC_LABELS: Record<string, string> = {
  [FabricType.Kanjivaram]: 'Kanjivaram',
  [FabricType.Banarasi]: 'Banarasi',
  [FabricType.Mysore]: 'Mysore',
};

function SareeImage({ saree }: { saree: Saree }) {
  const [imgError, setImgError] = useState(false);

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

function SareeCard({ saree, onOrderNow }: { saree: Saree; onOrderNow: (saree: Saree) => void }) {
  const fabricLabel = FABRIC_LABELS[saree.fabricType as unknown as string] ?? String(saree.fabricType);
  const isOutOfStock = saree.stock === 0n;

  return (
    <div className="saree-card group bg-card rounded-lg overflow-hidden shadow-silk hover:shadow-silk-lg transition-all duration-300 border border-border/50">
      <div className="relative overflow-hidden aspect-[4/5]">
        <SareeImage saree={saree} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3">
          <span className="bg-primary/90 text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
            {fabricLabel}
          </span>
        </div>
        {isOutOfStock && (
          <div className="absolute top-3 right-3">
            <span className="bg-destructive/90 text-destructive-foreground text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
              Out of Stock
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-white text-xs ml-1">Premium Quality</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-heading font-semibold text-foreground text-base leading-tight mb-1 line-clamp-1">
          {saree.name}
        </h3>
        <p className="text-muted-foreground text-xs mb-2 line-clamp-2">{saree.description}</p>

        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            <span
              className="w-2.5 h-2.5 rounded-full border border-border/50 inline-block"
              style={{ backgroundColor: saree.color.toLowerCase() }}
            />
            {saree.color}
          </span>
          <span className="text-xs text-muted-foreground">
            Stock: {Number(saree.stock)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary font-heading">
              ₹{Number(saree.price).toLocaleString('en-IN')}
            </span>
          </div>
          <button
            onClick={() => !isOutOfStock && onOrderNow(saree)}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              isOutOfStock
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md active:scale-95'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isOutOfStock ? 'Out of Stock' : 'Order Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SareeCardSkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border/50">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function Catalog() {
  const { data: sarees, isLoading, isFetching, error, refetch } = useGetAllSarees();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFabric, setSelectedFabric] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [selectedSaree, setSelectedSaree] = useState<Saree | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Force a fresh fetch every time the catalog page mounts
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

  const handleOrderNow = (saree: Saree) => {
    setSelectedSaree(saree);
    setIsOrderModalOpen(true);
  };

  // Show loading state when initially loading or when refetching with no data yet
  const showSkeleton = isLoading || (isFetching && !sarees);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="relative h-64 md:h-80">
          <img
            src="/assets/generated/hero-banner.dim_1200x400.png"
            alt="KBR Silks Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
            <div className="px-6 md:px-12 max-w-2xl">
              <p className="text-amber-300 text-sm font-medium tracking-widest uppercase mb-2">
                Exclusive Collection
              </p>
              <h1 className="text-white font-display text-3xl md:text-5xl font-bold leading-tight mb-3">
                Pure Silk Sarees
              </h1>
              <p className="text-white/80 text-sm md:text-base">
                Handcrafted with love — Kanjivaram, Banarasi & Mysore silks
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search sarees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div className="flex gap-2 items-center">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <select
                value={selectedFabric}
                onChange={(e) => setSelectedFabric(e.target.value)}
                className="text-sm bg-muted/50 border border-border rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                <option value="all">All Fabrics</option>
                <option value={FabricType.Kanjivaram}>Kanjivaram</option>
                <option value={FabricType.Banarasi}>Banarasi</option>
                <option value={FabricType.Mysore}>Mysore</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm bg-muted/50 border border-border rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              {/* Refresh button */}
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh catalog"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 border border-border hover:bg-muted transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${isFetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats bar */}
        {!showSkeleton && !error && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredSarees.length === 0
                ? 'No sarees found'
                : `Showing ${filteredSarees.length} saree${filteredSarees.length !== 1 ? 's' : ''}`}
            </p>
            <div className="flex items-center gap-3">
              {isFetching && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Updating…
                </span>
              )}
              {sarees && sarees.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {sarees.filter((s) => s.stock > 0n).length} in stock
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {showSkeleton && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <SareeCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !showSkeleton && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
              Unable to load sarees
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              There was an error loading the catalog. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!showSkeleton && !error && filteredSarees.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
              {sarees && sarees.length > 0 ? 'No sarees match your filters' : 'No sarees available yet'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {sarees && sarees.length > 0
                ? 'Try adjusting your search or filter criteria.'
                : 'Check back soon for our latest collection.'}
            </p>
            {sarees && sarees.length > 0 && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFabric('all');
                  setSortBy('default');
                }}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Saree Grid */}
        {!showSkeleton && !error && filteredSarees.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredSarees.map((saree) => (
              <SareeCard key={Number(saree.id)} saree={saree} onOrderNow={handleOrderNow} />
            ))}
          </div>
        )}
      </main>

      {/* Order Modal */}
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
