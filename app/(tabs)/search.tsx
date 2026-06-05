import {
  ScrollView, Text, View, TouchableOpacity, TextInput,
  ActivityIndicator, Image, Linking,
} from "react-native";
import { shadow } from "@/lib/utils";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

const BRAND = '#5e143f';
const GOLD = '#c9973a';
const GOLD_TEXT = '#f9e79f';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Product {
  _id: number;
  name: string;
  image: string;
  category: string | null;
  min_price: string | null;
  max_price: string | null;
  average_rating: number;
  total_num_reviews: number;
  city: string | null;
  area_name: string | null;
  is_available_today: boolean;
}

type Filters = {
  sort: string;
  area_name: string;
  min_price: string;
  max_price: string;
  min_rating: number;
  [key: string]: any;
};

// ── Category pills ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',              label: 'All' },
  { id: 'Makeup_Artist',   label: 'Makeup Artist' },
  { id: 'Photographers',   label: 'Photographers' },
  { id: 'Caterers',        label: 'Caterers' },
  { id: 'Planners',        label: 'Event Planners' },
  { id: 'Decorators',      label: 'Decorators' },
  { id: 'Mehandi_Artist',  label: 'Mehandi Artist' },
  { id: 'Invitation',      label: 'Invitation' },
  { id: 'Jewellery',       label: 'Jewellery' },
  { id: 'DJ_Artist',       label: 'DJ Artist' },
  { id: 'Entertainment',   label: 'Music' },
  { id: 'Travel_Transport', label: 'Travel & Transport' },
  { id: 'Pandit',          label: 'Pandit' },
];

// ── Sort options ──────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'newest',     label: '🕐 Newest' },
  { value: 'rating',     label: '⭐ Top Rated' },
  { value: 'price_asc',  label: '💰 Low → High' },
  { value: 'price_desc', label: '💰 High → Low' },
];

// ── Category-specific filter definitions ──────────────────────────────────────
const CATEGORY_FILTERS: Record<string, { key: string; label: string; type: 'select' | 'toggle'; options?: string[] }[]> = {
  Makeup_Artist: [
    { key: 'makeup_type', label: 'Type',            type: 'select', options: ['bridal', 'non-bridal'] },
    { key: 'trial',       label: 'Trial Available', type: 'toggle' },
  ],
  Photographers: [
    { key: 'shoot_type', label: 'Shoot Type', type: 'select', options: ['wedding', 'pre-wedding', 'candid'] },
  ],
  Caterers: [
    { key: 'food_type', label: 'Food Type', type: 'select', options: ['veg', 'nonveg', 'both'] },
  ],
  DJ_Artist: [
    { key: 'dj_venue',     label: 'Venue',              type: 'select', options: ['indoor', 'outdoor'] },
    { key: 'dj_equipment', label: 'Equipment Included', type: 'toggle' },
  ],
  Mehandi_Artist: [
    { key: 'mehandi_type', label: 'Type',       type: 'select', options: ['bridal', 'regular'] },
    { key: 'home_visit',   label: 'Home Visit', type: 'toggle' },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getImageUrl = (img: string | null) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/')) return `https://wedmangal.com${img}`;
  return `https://wedmangal.com/static/images/${img}`;
};

const formatPrice = (min: string | null, max: string | null) => {
  if (!min && !max) return 'Contact for Price';
  const mn = min ? parseInt(min) : null;
  const mx = max ? parseInt(max) : null;
  if (mn && mx) return `₹${mn.toLocaleString('en-IN')} – ₹${mx.toLocaleString('en-IN')}`;
  if (mn) return `From ₹${mn.toLocaleString('en-IN')}`;
  return `Up to ₹${mx!.toLocaleString('en-IN')}`;
};

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ product, initWishlisted = false, onWishlistChange }: {
  product: Product;
  initWishlisted?: boolean;
  onWishlistChange?: (id: number, v: boolean) => void;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [wishlisted, setWishlisted] = useState(initWishlisted);
  const imgUrl = getImageUrl(product.image);
  const stars = Math.round(product.average_rating);

  useEffect(() => { setWishlisted(initWishlisted); }, [initWishlisted]);

  const handleWishlist = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    const next = !wishlisted;
    setWishlisted(next);
    onWishlistChange?.(product._id, next);
    try {
      if (wishlisted) await apiClient.removeFromWishlist(product._id);
      else await apiClient.addToWishlist(product._id);
    } catch (e) { setWishlisted(!next); onWishlistChange?.(product._id, !next); console.error(e); }
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/service/${product._id}`)}
      style={{
        backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
        marginBottom: 14, elevation: 2,
        ...shadow(BRAND, 0.08, 6),
        borderWidth: 1, borderColor: '#f0e6ea',
      }}
      activeOpacity={0.9}
    >
      <View style={{ height: 160, backgroundColor: '#f5e8ee', position: 'relative' }}>
        {imgUrl ? (
          <Image source={{ uri: imgUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 32 }}>🏮</Text>
          </View>
        )}
        {product.category && (
          <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(94,20,63,0.88)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 }}>
            <Text style={{ color: GOLD_TEXT, fontSize: 10, fontWeight: '600' }}>{product.category.replace(/_/g, ' ')}</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={handleWishlist}
          style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', borderRadius: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', elevation: 2 }}
        >
          <IconSymbol size={16} name={wishlisted ? "heart.fill" : "heart"} color={wishlisted ? '#e74c3c' : BRAND} />
        </TouchableOpacity>
        {product.is_available_today && (
          <View style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: '#22C55E', borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 }}>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>● Available Today</Text>
          </View>
        )}
      </View>

      <View style={{ padding: 12, gap: 6 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1a0a12' }} numberOfLines={1}>{product.name}</Text>
        {product.average_rating > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <Text key={i} style={{ fontSize: 12, color: i <= stars ? GOLD : '#ddd' }}>★</Text>
            ))}
            <Text style={{ fontSize: 11, color: '#9a7a85', marginLeft: 3 }}>({product.total_num_reviews})</Text>
          </View>
        )}
        <View style={{ height: 1, backgroundColor: '#f0e6ea' }} />
        {(product.area_name || product.city) && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 13 }}>📍</Text>
            <Text style={{ fontSize: 12, color: '#7a5a6a' }}>
              {product.area_name ? `${product.area_name}, ${product.city}` : product.city}
            </Text>
          </View>
        )}
        {(product.min_price || product.max_price) && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 13 }}>💰</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: BRAND }}>
              {formatPrice(product.min_price, product.max_price)}
            </Text>
          </View>
        )}
        <View style={{ marginTop: 2, backgroundColor: BRAND, borderRadius: 8, paddingVertical: 8, alignItems: 'center' }}>
          <Text style={{ color: GOLD_TEXT, fontWeight: '700', fontSize: 12 }}>View Services →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function SearchScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    typeof params.category === 'string' ? params.category : 'all'
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());

  const [filters, setFilters] = useState<Filters>({
    sort: 'newest', area_name: '', min_price: '', max_price: '', min_rating: 0,
  });
  const [filterOpen, setFilterOpen] = useState(false);

  useFocusEffect(useCallback(() => {
    if (!isAuthenticated) { setWishlistIds(new Set()); return; }
    apiClient.getWishlist()
      .then(r => {
        const items: any[] = r.data.products ?? r.data ?? [];
        setWishlistIds(new Set(items.map((i: any) => Number(i._id))));
      })
      .catch(() => {});
  }, [isAuthenticated]));

  // Active filter count (sort doesn't count)
  const activeCount = Object.keys(filters).filter(k => k !== 'sort' && filters[k] && filters[k] !== 0).length;

  useEffect(() => {
    if (typeof params.category === 'string' && params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  useEffect(() => {
    const t = setTimeout(() => fetchProducts(), 350);
    return () => clearTimeout(t);
  }, [searchQuery, selectedCategory, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const p: any = {};
      if (searchQuery.trim()) p.search = searchQuery.trim();
      if (selectedCategory !== 'all') p.keyword = selectedCategory;
      if (filters.sort) p.sort = filters.sort;
      if (filters.area_name.trim()) p.area_name = filters.area_name.trim();
      if (filters.min_price) p.min_price = filters.min_price;
      if (filters.max_price) p.max_price = filters.max_price;
      if (filters.min_rating) p.min_rating = filters.min_rating;
      // Category-specific
      (CATEGORY_FILTERS[selectedCategory] ?? []).forEach(f => {
        if (filters[f.key]) p[f.key] = filters[f.key];
      });
      const r = await apiClient.getProducts(p);
      const d = r.data;
      setProducts(d.products ?? (Array.isArray(d) ? d : d?.results ?? []));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const set = (key: string, val: any) =>
    setFilters(prev => ({ ...prev, [key]: val }));

  const clearFilters = () =>
    setFilters({ sort: 'newest', area_name: '', min_price: '', max_price: '', min_rating: 0 });

  const catFilters = CATEGORY_FILTERS[selectedCategory] ?? [];

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* ── Header ── */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {router.canGoBack() && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
            >
              <IconSymbol size={18} name="chevron.left" color={GOLD_TEXT} />
            </TouchableOpacity>
          )}
          <Text style={{ color: GOLD_TEXT, fontSize: 22, fontWeight: '800', flex: 1 }}>Search Vendors</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 30, paddingHorizontal: 14, paddingVertical: 10, marginTop: 12 }}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            style={{ flex: 1, fontSize: 14, color: '#1a0a12' }}
            placeholder="Search vendors..."
            placeholderTextColor="#9a7a85"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol size={16} name="xmark.circle.fill" color="#9a7a85" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Category pills ── */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: '#faf7f2', borderBottomWidth: 1, borderBottomColor: '#f0e6ea', maxHeight: 52 }}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => !cat.disabled && setSelectedCategory(cat.id)}
            activeOpacity={cat.disabled ? 1 : 0.7}
            style={{
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
              backgroundColor: selectedCategory === cat.id ? BRAND : '#fff',
              borderWidth: 1,
              borderColor: cat.disabled ? '#e0d0d5' : selectedCategory === cat.id ? BRAND : '#e8d5de',
              opacity: cat.disabled ? 0.5 : 1,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: cat.disabled ? '#c9b0bc' : selectedCategory === cat.id ? GOLD_TEXT : '#1a0a12' }}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Sort chips + Filter toggle ── */}
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0e6ea' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 12 }}>
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
          >
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => set('sort', opt.value)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16,
                  backgroundColor: filters.sort === opt.value ? '#fdf0f5' : '#f5f5f5',
                  borderWidth: 1,
                  borderColor: filters.sort === opt.value ? BRAND : '#e8e8e8',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: filters.sort === opt.value ? BRAND : '#5a3a45' }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Filter button */}
          <TouchableOpacity
            onPress={() => setFilterOpen(o => !o)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 5,
              paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
              backgroundColor: filterOpen || activeCount > 0 ? BRAND : '#f5f5f5',
              borderWidth: 1, borderColor: filterOpen || activeCount > 0 ? BRAND : '#e8e8e8',
            }}
          >
            <Text style={{ fontSize: 14 }}>⚙️</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: filterOpen || activeCount > 0 ? GOLD_TEXT : '#5a3a45' }}>
              Filters
            </Text>
            {activeCount > 0 && (
              <View style={{ backgroundColor: GOLD, borderRadius: 10, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{activeCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {activeCount > 0 && (
            <TouchableOpacity onPress={clearFilters} style={{ marginLeft: 6 }}>
              <Text style={{ fontSize: 12, color: '#e74c3c', fontWeight: '700' }}>✕ Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Collapsible filter panel ── */}
        {filterOpen && (
          <View style={{ backgroundColor: '#faf7f2', borderTopWidth: 1, borderTopColor: '#f0e6ea', padding: 16, gap: 16 }}>

            {/* Area */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#5a3a45' }}>📍 Area / Locality</Text>
              <TextInput
                style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8d5de', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#1a0a12' }}
                placeholder="e.g. Teynampet, Anna Nagar..."
                placeholderTextColor="#c9b0bc"
                value={filters.area_name}
                onChangeText={v => set('area_name', v)}
              />
            </View>

            {/* Price range */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#5a3a45' }}>💰 Price Range (₹)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TextInput
                  style={{ flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8d5de', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#1a0a12' }}
                  placeholder="Min"
                  placeholderTextColor="#c9b0bc"
                  keyboardType="numeric"
                  value={filters.min_price}
                  onChangeText={v => set('min_price', v)}
                />
                <Text style={{ color: '#9a7a85', fontSize: 16 }}>—</Text>
                <TextInput
                  style={{ flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8d5de', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#1a0a12' }}
                  placeholder="Max"
                  placeholderTextColor="#c9b0bc"
                  keyboardType="numeric"
                  value={filters.max_price}
                  onChangeText={v => set('max_price', v)}
                />
              </View>
            </View>

            {/* Min rating */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#5a3a45' }}>⭐ Minimum Rating</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(r => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => set('min_rating', filters.min_rating === r ? 0 : r)}
                    style={{
                      width: 42, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: filters.min_rating >= r ? '#fff8ee' : '#fff',
                      borderWidth: 1.5,
                      borderColor: filters.min_rating >= r ? GOLD : '#e8d5de',
                    }}
                  >
                    <Text style={{ fontSize: 18, color: filters.min_rating >= r ? GOLD : '#ddd' }}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category-specific filters */}
            {catFilters.map(f => (
              <View key={f.key} style={{ gap: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#5a3a45' }}>{f.label}</Text>
                {f.type === 'select' ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {f.options!.map(opt => (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => set(f.key, filters[f.key] === opt ? '' : opt)}
                        style={{
                          paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                          backgroundColor: filters[f.key] === opt ? BRAND : '#fff',
                          borderWidth: 1,
                          borderColor: filters[f.key] === opt ? BRAND : '#e8d5de',
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '600', color: filters[f.key] === opt ? GOLD_TEXT : '#1a0a12', textTransform: 'capitalize' }}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => set(f.key, filters[f.key] === 'true' ? '' : 'true')}
                    style={{
                      alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: filters[f.key] === 'true' ? '#22C55E' : '#fff',
                      borderWidth: 1,
                      borderColor: filters[f.key] === 'true' ? '#22C55E' : '#e8d5de',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: filters[f.key] === 'true' ? '#fff' : '#5a3a45' }}>
                      {filters[f.key] === 'true' ? '✓ Yes' : 'Any'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ── Results ── */}
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <View style={{ paddingVertical: 48, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={BRAND} />
          </View>
        ) : products.length === 0 ? (
          <View style={{ paddingVertical: 48, alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={{ color: '#7a5a6a', fontSize: 15, fontWeight: '600' }}>No vendors found</Text>
            <Text style={{ color: '#9a7a85', fontSize: 13, textAlign: 'center' }}>
              Try adjusting your filters or search terms
            </Text>
            {activeCount > 0 && (
              <TouchableOpacity onPress={clearFilters} style={{ backgroundColor: BRAND, paddingHorizontal: 20, paddingVertical: 9, borderRadius: 20, marginTop: 4 }}>
                <Text style={{ color: GOLD_TEXT, fontWeight: '700', fontSize: 13 }}>✕ Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {selectedCategory !== 'all' && (
              <Text style={{ fontSize: 14, fontWeight: '700', color: BRAND, marginBottom: 8 }}>
                Find & Book {selectedCategory.replace(/_/g, ' ')} for Your Dream Wedding
              </Text>
            )}
            <Text style={{ fontSize: 13, color: '#9a7a85', marginBottom: 12 }}>
              {products.length} vendor{products.length !== 1 ? 's' : ''} found
            </Text>
            {products.map(p => (
              <ProductCard
                key={p._id}
                product={p}
                initWishlisted={wishlistIds.has(p._id)}
                onWishlistChange={(id, v) => setWishlistIds(prev => {
                  const next = new Set(prev);
                  v ? next.add(id) : next.delete(id);
                  return next;
                })}
              />
            ))}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
