import {
  ScrollView, Text, View, TouchableOpacity, Image,
  ActivityIndicator, Dimensions, FlatList, Linking, Modal, Platform,
  useWindowDimensions,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import * as storage from "@/lib/storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { shadow } from "@/lib/utils";

const BRAND = '#5e143f';
const GOLD = '#c9973a';
const GOLD_TEXT = '#f9e79f';
const { width: SW } = Dimensions.get('window');

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

// ── Category image map (explicit requires for Metro) ──────────────────────────
const CAT_IMG: Record<string, any> = {
  Makeup_Artist:    require('@/assets/images/categories/makeup.jpg'),
  Photographers:    require('@/assets/images/categories/photographer.jpg'),
  Caterers:         require('@/assets/images/categories/catering.jpeg'),
  Planners:         require('@/assets/images/categories/planners.jpg'),
  Halls:            require('@/assets/images/categories/halls.jpg'),
  Decorators:       require('@/assets/images/categories/decors.webp'),
  Mehandi_Artist:   require('@/assets/images/categories/mehandi.jpg'),
  Invitation:       require('@/assets/images/categories/invitation.jpg'),
  Jewellery:        require('@/assets/images/categories/jewellers.jpg'),
  DJ_Artist:        require('@/assets/images/categories/dj.jpg'),
  Entertainment:    require('@/assets/images/categories/nadaswaram.jpg'),
  Travel_Transport: require('@/assets/images/categories/travel.jpg'),
  Pandit:           require('@/assets/images/categories/pandit.jpg'),
};

const CATEGORIES = [
  { id: 'Makeup_Artist',    label: 'Makeup Artist' },
  { id: 'Photographers',    label: 'Photographers' },
  { id: 'Caterers',         label: 'Caterers' },
  { id: 'Planners',         label: 'Event Planners' },
  { id: 'Halls',            label: 'Halls' },
  { id: 'Decorators',       label: 'Decorators' },
  { id: 'Mehandi_Artist',   label: 'Mehandi Artist' },
  { id: 'Invitation',       label: 'Invitation' },
  { id: 'Jewellery',        label: 'Jewellery' },
  { id: 'DJ_Artist',        label: 'DJ Artist' },
  { id: 'Entertainment',    label: 'Music' },
  { id: 'Travel_Transport', label: 'Travel & Transport' },
  { id: 'Pandit',           label: 'Pandit' },
];

const SLIDES = [
  { title: 'Your Dream Wedding', sub: 'Find the best vendors for your big day' },
  { title: 'Every Detail Matters', sub: 'Décor, catering, photography — all in one place' },
  { title: 'Book with Confidence', sub: 'Verified vendors, real reviews, fair prices' },
];

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

// ── Product card — matches webapp Product.js layout ───────────────────────────
function ProductCard({ product, initWishlisted = false, onWishlistChange }: {
  product: Product;
  initWishlisted?: boolean;
  onWishlistChange?: (id: number, v: boolean) => void;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [wishlisted, setWishlisted] = useState(initWishlisted);
  const imgUrl = getImageUrl(product.image);

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

  const stars = Math.round(product.average_rating);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/service/${product._id}`)}
      style={{
        backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
        marginBottom: 16, elevation: 3,
        ...shadow(BRAND, 0.10, 8),
        borderWidth: 1, borderColor: '#f0e6ea',
      }}
      activeOpacity={0.9}
    >
      {/* ── Image ── */}
      <View style={{ height: 190, backgroundColor: '#f5e8ee', position: 'relative' }}>
        {imgUrl ? (
          <Image source={{ uri: imgUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Text style={{ fontSize: 38 }}>🏮</Text>
            <Text style={{ fontSize: 12, color: '#9a7a85' }}>{product.category?.replace(/_/g, ' ') ?? 'Wedding Vendor'}</Text>
          </View>
        )}
        {/* Category badge */}
        {product.category && (
          <View style={{
            position: 'absolute', top: 10, left: 10,
            backgroundColor: 'rgba(94,20,63,0.88)', borderRadius: 20,
            paddingHorizontal: 10, paddingVertical: 4,
          }}>
            <Text style={{ color: GOLD_TEXT, fontSize: 11, fontWeight: '600' }}>
              🎊 {product.category.replace(/_/g, ' ')}
            </Text>
          </View>
        )}
        {/* Wishlist */}
        <TouchableOpacity
          onPress={handleWishlist}
          style={{
            position: 'absolute', top: 10, right: 10,
            backgroundColor: '#fff', borderRadius: 20,
            width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
            elevation: 3, ...shadow('#000000', 0.15, 3, 1),
          }}
        >
          <IconSymbol size={18} name={wishlisted ? "heart.fill" : "heart"} color={wishlisted ? '#e74c3c' : BRAND} />
        </TouchableOpacity>
        {/* Available Today badge */}
        {product.is_available_today && (
          <View style={{
            position: 'absolute', bottom: 10, right: 10,
            backgroundColor: '#22C55E', borderRadius: 20,
            paddingHorizontal: 8, paddingVertical: 3,
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>● Available Today</Text>
          </View>
        )}
      </View>

      {/* ── Body ── */}
      <View style={{ padding: 14, gap: 7 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a0a12' }} numberOfLines={1}>
          {product.name}
        </Text>

        {/* Stars */}
        {product.average_rating > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <Text key={i} style={{ fontSize: 13, color: i <= stars ? GOLD : '#ddd' }}>★</Text>
            ))}
            <Text style={{ fontSize: 12, color: '#9a7a85', marginLeft: 3 }}>
              ({product.total_num_reviews} reviews)
            </Text>
          </View>
        )}

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#f0e6ea' }} />

        {/* Location */}
        {(product.area_name || product.city) && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={{ fontSize: 14 }}>📍</Text>
            <Text style={{ fontSize: 13, color: '#7a5a6a' }}>
              {product.area_name ? `${product.area_name}, ${product.city}` : product.city}
            </Text>
          </View>
        )}

        {/* Price */}
        {(product.min_price || product.max_price) && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={{ fontSize: 14 }}>💰</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: BRAND }}>
              {formatPrice(product.min_price, product.max_price)}
            </Text>
          </View>
        )}

        {/* CTA */}
        <View style={{
          marginTop: 2, backgroundColor: BRAND, borderRadius: 8,
          paddingVertical: 10, alignItems: 'center',
        }}>
          <Text style={{ color: GOLD_TEXT, fontWeight: '700', fontSize: 13 }}>View Services →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Available Today card ──────────────────────────────────────────────────────
function AvailableCard({ v }: { v: Product }) {
  const router = useRouter();
  const imgUrl = getImageUrl(v.image);
  const phone = (v as any).business_phone || (v as any).personal_phone || '';
  return (
    <TouchableOpacity
      onPress={() => router.push(`/service/${v._id}`)}
      style={{
        width: 160, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden',
        marginRight: 12, elevation: 2,
        ...shadow(BRAND, 0.08, 6),
        borderWidth: 1, borderColor: '#f0e6ea',
      }}
      activeOpacity={0.9}
    >
      <View style={{ height: 100, backgroundColor: '#f5e8ee', position: 'relative' }}>
        {imgUrl ? (
          <Image source={{ uri: imgUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 28 }}>🏮</Text>
          </View>
        )}
        <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: '#22C55E', borderRadius: 12, paddingHorizontal: 7, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>LIVE</Text>
        </View>
      </View>
      <View style={{ padding: 8, gap: 3 }}>
        {v.category && (
          <Text style={{ fontSize: 9, fontWeight: '700', color: BRAND, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {v.category.replace(/_/g, ' ')}
          </Text>
        )}
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#1a0a12' }} numberOfLines={1}>{v.name}</Text>
        <Text style={{ fontSize: 10, color: '#9a7a85' }} numberOfLines={1}>
          📍 {v.area_name ? `${v.area_name}, ` : ''}{v.city}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {v.average_rating > 0 && (
            <Text style={{ fontSize: 10, color: GOLD }}>★ {v.average_rating.toFixed(1)}</Text>
          )}
          {v.min_price && (
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#5a3a45' }}>
              from ₹{parseInt(v.min_price).toLocaleString('en-IN')}
            </Text>
          )}
        </View>
        {phone ? (
          <TouchableOpacity
            onPress={() => { Linking.openURL(`tel:${phone}`); }}
            style={{ backgroundColor: BRAND, borderRadius: 6, paddingVertical: 5, alignItems: 'center', marginTop: 2 }}
          >
            <Text style={{ color: GOLD_TEXT, fontSize: 10, fontWeight: '700' }}>📞 Call Now</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ── Wedding Countdown Widget ──────────────────────────────────────────────────
function WeddingCountdown() {
  const { isAuthenticated, user } = useAuth();
  const [weddingDate, setWeddingDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  useEffect(() => {
    storage.getItem('weddingDate').then(d => {
      if (d) setWeddingDate(new Date(d));
    });
  }, []);

  const saveDate = async (date: Date) => {
    setWeddingDate(date);
    await storage.setItem('weddingDate', date.toISOString());
    if (isAuthenticated && user?.id) {
      apiClient.saveWeddingDate({ user_id: user.id, wedding_date: date.toISOString().split('T')[0] }).catch(() => {});
    }
    setShowPicker(false);
  };

  const getCountdown = (date: Date) => {
    const now = new Date();
    const ms = date.getTime() - now.getTime();
    if (ms < 0) return null;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    if (days === 0) return { label: 'Today is the day!', days: 0, months: 0, weeks: 0 };
    const months = Math.floor(days / 30);
    const weeks = Math.floor(days / 7);
    return { days, months, weeks, label: '' };
  };

  const countdown = weddingDate ? getCountdown(weddingDate) : null;
  const isPast = weddingDate && countdown === null;

  if (isPast) return null;

  return (
    <View style={{
      marginHorizontal: 16, marginTop: 14, marginBottom: 4,
      backgroundColor: '#3d0d28', borderRadius: 16, overflow: 'hidden',
      elevation: 3, ...shadow(BRAND, 0.18, 8),
    }}>
      {countdown ? (
        <View style={{ padding: 16, alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 13, color: '#f5d0e0', fontWeight: '600', letterSpacing: 1 }}>💍 WEDDING COUNTDOWN</Text>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
            {[
              { n: countdown.days, u: 'DAYS' },
              { n: countdown.weeks, u: 'WEEKS' },
              { n: countdown.months, u: 'MONTHS' },
            ].map(({ n, u }) => (
              <View key={u} style={{ alignItems: 'center', gap: 2 }}>
                <Text style={{ fontSize: 30, fontWeight: '900', color: GOLD_TEXT }}>{n}</Text>
                <Text style={{ fontSize: 9, fontWeight: '700', color: '#c9a0b4', letterSpacing: 1 }}>{u}</Text>
              </View>
            ))}
          </View>
          <Text style={{ fontSize: 12, color: '#f5d0e0', marginTop: 2 }}>
            until {weddingDate!.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => { setPickerDate(weddingDate!); setShowPicker(true); }}>
            <Text style={{ fontSize: 11, color: GOLD, marginTop: 4, textDecorationLine: 'underline' }}>Change date</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={{ padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ gap: 3 }}>
            <Text style={{ color: GOLD_TEXT, fontSize: 15, fontWeight: '800' }}>💍 Set Your Wedding Date</Text>
            <Text style={{ color: '#f5d0e0', fontSize: 12 }}>Start your countdown to the big day</Text>
          </View>
          <View style={{
            backgroundColor: GOLD, width: 36, height: 36, borderRadius: 18,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 18, color: '#1a0a12' }}>+</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Date Picker */}
      {showPicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="slide">
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0e6ea' }}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={{ color: BRAND, fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => saveDate(pickerDate)}>
                    <Text style={{ color: BRAND, fontWeight: '800' }}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={pickerDate}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={(_, d) => d && setPickerDate(d)}
                  style={{ backgroundColor: '#fff' }}
                />
              </View>
            </View>
          </Modal>
        ) : Platform.OS === 'android' ? (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, d) => {
              setShowPicker(false);
              if (event.type === 'set' && d) saveDate(d);
            }}
          />
        ) : (
          // Web fallback — simple HTML date input via Modal
          <Modal transparent animationType="fade">
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 280, gap: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: BRAND }}>Select Wedding Date</Text>
                <DateTimePicker
                  value={pickerDate}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={(_, d) => d && setPickerDate(d)}
                />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setShowPicker(false)}
                    style={{ flex: 1, borderWidth: 1.5, borderColor: BRAND, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
                  >
                    <Text style={{ color: BRAND, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => saveDate(pickerDate)}
                    style={{ flex: 1, backgroundColor: BRAND, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
                  >
                    <Text style={{ color: GOLD_TEXT, fontWeight: '700' }}>Set Date</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { width: winW } = useWindowDimensions();
  const catSize = Math.floor((winW - 52) / 3);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableToday, setAvailableToday] = useState<Product[]>([]);
  const [slide, setSlide] = useState(0);
  const carouselRef = useRef<FlatList>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());

  // Reload wishlist whenever screen is focused and user is logged in
  useFocusEffect(useCallback(() => {
    if (!isAuthenticated) { setWishlistIds(new Set()); return; }
    apiClient.getWishlist()
      .then(r => {
        const items: any[] = r.data.products ?? r.data ?? [];
        setWishlistIds(new Set(items.map((i: any) => Number(i._id))));
      })
      .catch(() => {});
  }, [isAuthenticated]));

  useEffect(() => {
    apiClient.getProducts({ limit: 20 })
      .then(r => setProducts(r.data.products ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));

    apiClient.getAvailableToday()
      .then(r => setAvailableToday(Array.isArray(r.data) ? r.data : []))
      .catch(() => setAvailableToday([]));
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setSlide(s => {
        const next = (s + 1) % SLIDES.length;
        carouselRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* ── Maroon header ── */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20 }}>
        <Text style={{ color: GOLD_TEXT, fontSize: 26, fontWeight: '900', letterSpacing: 1 }}>WedMangal</Text>
        <Text style={{ color: '#f5d0e0', fontSize: 13, marginTop: 2 }}>Find & book trusted wedding vendors</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#fff' }}>
        {/* ── Hero carousel ── */}
        <FlatList
          ref={carouselRef}
          data={SLIDES}
          horizontal pagingEnabled scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          getItemLayout={(_, i) => ({ length: SW, offset: SW * i, index: i })}
          onScrollToIndexFailed={() => {}}
          renderItem={({ item }) => (
            <View style={{
              width: SW, backgroundColor: '#3d0d28',
              paddingHorizontal: 28, paddingVertical: 24, alignItems: 'center',
            }}>
              <Text style={{ color: GOLD_TEXT, fontSize: 22, fontWeight: '800', textAlign: 'center' }}>{item.title}</Text>
              <Text style={{ color: '#f5d0e0', fontSize: 14, textAlign: 'center', marginTop: 8 }}>{item.sub}</Text>
            </View>
          )}
        />
        {/* Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 10, backgroundColor: '#3d0d28' }}>
          {SLIDES.map((_, i) => (
            <View key={i} style={{
              width: i === slide ? 20 : 6, height: 6, borderRadius: 3,
              backgroundColor: i === slide ? GOLD_TEXT : 'rgba(255,255,255,0.3)',
            }} />
          ))}
        </View>

        {/* ── Search bar ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10 }}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/search')}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 10,
              backgroundColor: '#fff', borderRadius: 30, paddingHorizontal: 16,
              paddingVertical: 13, borderWidth: 1.5, borderColor: '#e8d5de',
              elevation: 1, ...shadow(BRAND, 0.06, 4, 1),
            }}
          >
            <Text style={{ fontSize: 16 }}>🔍</Text>
            <Text style={{ color: '#9a7a85', flex: 1, fontSize: 14 }}>
              Search photographers, caterers…
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Wedding Countdown ── */}
        <WeddingCountdown />

        {/* ── Available Today section ── */}
        {availableToday.length > 0 && (
          <View style={{ paddingVertical: 18, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0e6ea' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {/* Pulsing dot */}
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' }} />
                <View>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: BRAND }}>🚨 Available Today</Text>
                  <Text style={{ fontSize: 11, color: '#9a7a85', marginTop: 1 }}>
                    Book instantly — these vendors are free right now
                  </Text>
                </View>
              </View>
              <View style={{ backgroundColor: '#f0fdf4', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#86efac' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#16a34a' }}>
                  {availableToday.length} vendor{availableToday.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Horizontal scroll */}
            <ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}
            >
              {availableToday.slice(0, 5).map(v => (
                <AvailableCard key={v._id} v={v} />
              ))}
            </ScrollView>

            {/* View all button */}
            {availableToday.length > 5 && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/search')}
                style={{ marginHorizontal: 16, marginTop: 12, borderWidth: 1.5, borderColor: BRAND, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ color: BRAND, fontWeight: '700', fontSize: 13 }}>
                  View All {availableToday.length} Available Vendors →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Category grid with real photos ── */}
        <View style={{ backgroundColor: '#faf7f2', paddingVertical: 20, paddingHorizontal: 16 }}>
          <Text style={{
            fontSize: 20, fontWeight: '800', color: BRAND,
            textAlign: 'center', marginBottom: 14,
          }}>
            Top Wedding Vendor Categories
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => !cat.disabled && router.push(`/(tabs)/search?category=${cat.id}`)}
                activeOpacity={cat.disabled ? 1 : 0.85}
                style={{
                  width: catSize, borderRadius: 12, overflow: 'hidden',
                  backgroundColor: '#fff', elevation: cat.disabled ? 0 : 2,
                  ...(cat.disabled ? {} : shadow(BRAND, 0.08, 4, 1)),
                  opacity: cat.disabled ? 0.55 : 1,
                }}
              >
                <View style={{ position: 'relative' }}>
                  <Image
                    source={CAT_IMG[cat.id]}
                    style={{ width: catSize, height: catSize }}
                    resizeMode="cover"
                  />
                  {cat.disabled && (
                    <View style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.35)',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>#</Text>
                    </View>
                  )}
                </View>
                <View style={{ paddingVertical: 7, paddingHorizontal: 4, alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: cat.disabled ? '#9a7a85' : '#1a0a12', textAlign: 'center' }}>
                    {cat.label}
                  </Text>
                  {cat.disabled && (
                    <Text style={{ fontSize: 8, color: '#9a7a85', marginTop: 1 }}>Coming Soon</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Invitation CTA ── */}
        <TouchableOpacity
          onPress={() => router.push('/plan' as any)}
          activeOpacity={0.9}
          style={{
            marginHorizontal: 16, marginVertical: 16,
            backgroundColor: '#3d0d28', borderRadius: 16, overflow: 'hidden',
          }}
        >
          <View style={{ padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#f5d0e0', textTransform: 'uppercase', letterSpacing: 1 }}>
                FREE TOOL
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#f9e79f' }}>
                Creating your wedding plan is simple 💍
              </Text>
              <Text style={{ fontSize: 12, color: '#f5d0e0' }}>
                Step-by-step checklist for your big day
              </Text>
            </View>
            <View style={{
              backgroundColor: '#c9973a', borderRadius: 30,
              paddingHorizontal: 14, paddingVertical: 8, marginLeft: 12,
            }}>
              <Text style={{ color: '#1a0a12', fontWeight: '800', fontSize: 12 }}>Start →</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Featured Vendors ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: BRAND }}>Featured Vendors</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={{ fontSize: 13, color: BRAND, fontWeight: '700' }}>Explore All →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={BRAND} />
            </View>
          ) : products.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 36 }}>🏮</Text>
              <Text style={{ color: '#7a5a6a' }}>No vendors available right now</Text>
            </View>
          ) : (
            products.map(p => (
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
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
