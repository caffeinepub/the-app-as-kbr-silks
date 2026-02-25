import { useState, useMemo } from 'react';
import { Search, Tag, Layers, Package, IndianRupee } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllSarees } from '@/hooks/useQueries';
import { type Saree, FabricType } from '../backend';

const FABRIC_LABELS: Record<FabricType, string> = {
  [FabricType.Kanjivaram]: 'Kanjivaram',
  [FabricType.Banarasi]: 'Banarasi',
  [FabricType.Mysore]: 'Mysore',
};

const FABRIC_COLORS: Record<FabricType, string> = {
  [FabricType.Kanjivaram]: 'oklch(0.52 0.12 195)',
  [FabricType.Banarasi]: 'oklch(0.52 0.18 22)',
  [FabricType.Mysore]: 'oklch(0.52 0.14 140)',
};

function SareeCard({ saree }: { saree: Saree }) {
  const imageUrl = saree.image?.getDirectURL?.() || '/assets/generated/saree-placeholder.dim_400x500.png';
  const fabricLabel = FABRIC_LABELS[saree.fabricType] ?? String(saree.fabricType);
  const fabricColor = FABRIC_COLORS[saree.fabricType] ?? 'oklch(0.52 0.12 195)';

  return (
    <article className="saree-card group">
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
        <img
          src={imageUrl}
          alt={saree.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/generated/saree-placeholder.dim_400x500.png';
          }}
        />
        {/* Fabric badge overlay */}
        <div className="absolute top-3 left-3">
          <span
            className="text-xs font-body font-semibold px-2.5 py-1 rounded-full text-white shadow-sm"
            style={{ background: fabricColor }}
          >
            {fabricLabel}
          </span>
        </div>
        {/* Stock badge */}
        {Number(saree.stock) === 0 && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'oklch(0.14 0.04 22 / 0.6)' }}>
            <span className="text-ivory font-heading font-semibold text-lg tracking-wide">Out of Stock</span>
          </div>
        )}
        {Number(saree.stock) > 0 && Number(saree.stock) <= 3 && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-body font-semibold px-2 py-1 rounded-full text-white"
              style={{ background: 'oklch(0.55 0.22 25)' }}>
              Only {Number(saree.stock)} left
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-heading font-semibold text-base leading-tight mb-1 text-foreground line-clamp-1">
          {saree.name}
        </h3>
        {saree.description && (
          <p className="text-xs font-body text-muted-foreground mb-2 line-clamp-2">
            {saree.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full border border-border"
              style={{ background: saree.color.toLowerCase() }}
              title={saree.color}
            />
            <span className="text-xs font-body text-muted-foreground capitalize">{saree.color}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <IndianRupee size={14} className="text-gold-dark" />
            <span className="font-heading font-bold text-lg" style={{ color: 'oklch(0.38 0.16 22)' }}>
              {Number(saree.price).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-body text-muted-foreground">
            <Package size={12} />
            <span>{Number(saree.stock)} in stock</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function SareeCardSkeleton() {
  return (
    <div className="rounded-sm overflow-hidden border border-border">
      <Skeleton className="w-full" style={{ aspectRatio: '4/5' }} />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between pt-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export default function Catalog() {
  const [search, setSearch] = useState('');
  const [selectedFabric, setSelectedFabric] = useState<FabricType | 'all'>('all');
  const { data: sarees, isLoading, error } = useGetAllSarees();

  const filtered = useMemo(() => {
    if (!sarees) return [];
    return sarees.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        FABRIC_LABELS[s.fabricType]?.toLowerCase().includes(q) ||
        s.color.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q);
      const matchesFabric = selectedFabric === 'all' || s.fabricType === selectedFabric;
      return matchesSearch && matchesFabric;
    });
  }, [sarees, search, selectedFabric]);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ minHeight: '280px' }}>
        <img
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt="Silk Splendor Collection"
          className="w-full h-full object-cover absolute inset-0"
          style={{ minHeight: '280px' }}
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, oklch(0.26 0.12 22 / 0.75) 0%, oklch(0.38 0.16 22 / 0.55) 60%, oklch(0.22 0.07 22 / 0.7) 100%)' }} />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-16">
          <p className="font-body text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: 'oklch(0.78 0.14 72 / 0.85)' }}>
            Exquisite Collection
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3"
            style={{ color: 'oklch(0.97 0.008 85)' }}>
            Silk Saree Collection
          </h1>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-16" style={{ background: 'oklch(0.78 0.14 72 / 0.6)' }} />
            <span style={{ color: 'oklch(0.78 0.14 72)' }}>✦</span>
            <div className="h-px w-16" style={{ background: 'oklch(0.78 0.14 72 / 0.6)' }} />
          </div>
          <p className="font-body text-sm max-w-md"
            style={{ color: 'oklch(0.92 0.02 75 / 0.85)' }}>
            Discover our handpicked selection of premium Kanjivaram, Banarasi, and Mysore silk sarees
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 border-b shadow-xs"
        style={{ background: 'oklch(0.99 0.004 80)', borderColor: 'oklch(0.88 0.025 70)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, fabric, or color..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 font-body text-sm border-border focus:ring-crimson"
              />
            </div>

            {/* Fabric Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-body text-muted-foreground flex items-center gap-1">
                <Layers size={12} /> Filter:
              </span>
              {(['all', ...Object.values(FabricType)] as const).map((fabric) => (
                <button
                  key={fabric}
                  onClick={() => setSelectedFabric(fabric)}
                  className={`text-xs font-body font-medium px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    selectedFabric === fabric
                      ? 'border-transparent text-white'
                      : 'border-border text-muted-foreground hover:border-gold/60 hover:text-foreground'
                  }`}
                  style={selectedFabric === fabric ? {
                    background: fabric === 'all'
                      ? 'linear-gradient(135deg, oklch(0.38 0.16 22), oklch(0.52 0.18 22))'
                      : FABRIC_COLORS[fabric as FabricType],
                  } : {}}
                >
                  {fabric === 'all' ? 'All Fabrics' : FABRIC_LABELS[fabric as FabricType]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats bar */}
        {!isLoading && sarees && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-body text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{' '}
              <span className="font-semibold text-foreground">{sarees.length}</span> sarees
            </p>
            {(search || selectedFabric !== 'all') && (
              <button
                onClick={() => { setSearch(''); setSelectedFabric('all'); }}
                className="text-xs font-body text-crimson hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <p className="font-body text-destructive">Failed to load sarees. Please try again.</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <SareeCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'oklch(0.93 0.012 75)' }}>
              <Tag size={28} className="text-muted-foreground" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2 text-foreground">
              {sarees?.length === 0 ? 'No Sarees Yet' : 'No Results Found'}
            </h3>
            <p className="font-body text-sm text-muted-foreground max-w-sm mx-auto">
              {sarees?.length === 0
                ? 'The catalog is empty. Add sarees from the Admin panel to get started.'
                : 'Try adjusting your search or filter to find what you\'re looking for.'}
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filtered.map((saree) => (
              <SareeCard key={String(saree.id)} saree={saree} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
