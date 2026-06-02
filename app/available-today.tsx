import {
  Text, View, TouchableOpacity, Image, FlatList,
  ActivityIndicator, Linking, TextInput,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

const BRAND = '#5e143f';
const GOLD = '#c9973a';
const GOLD_TEXT = '#f9e79f';

const CATEGORIES = [
  { id: 'all',              label: 'All' },
  { id: 'Makeup_Artist',   label: 'Makeup' },
  { id: 'Photographers',   label: 'Photography' },
  { id: 'Caterers',        label: 'Caterers' },
  { id: 'Decorators',      label: 'Decorators' },
  { id: 'Mehandi_Artist',  label: 'Mehandi' },
  { id: 'DJ_Artist',       label: 'DJ' },
  { id: 'Planners',        label: 'Planners' },
  { id: 'Jewellery',       label: 'Jewellery' },
  { id: 'Travel_Transport', label: 'Transport' },
  { id: 'Entertainment',   label: 'Music' },
  { id: 'Pandit',          label: 'Pandit' },
];

interface Product {
  _id: number;
  name: string;
  image: string;
  category: string | null;
  min_price: string | null;
  average_rating: number;
  city: string | null;
  area_name: string | null;
  business_phone?: string;
  personal_phone?: string;
}

const getImageUrl = (img: string | null) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `https://wedmangal.com/static/images/${img}`;
};

const normalizePhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned || cleaned === '0000') return '';
  if (cleaned.startsWith('0') && cleaned.length >= 10) return '91' + cleaned.slice(1);
  if (cleaned.length === 10) return '91' + cleaned;
  return cleaned;
};

function VendorCard({ v }: { v: Product }) {
  const router = useRouter();
  const imgUrl = getImageUrl(v.image);
  const phone = normalizePhone(v.business_phone ?? v.personal_phone ?? '');

  return (
    <TouchableOpacity
      onPress={() => router.push(`/service/${v._id}`)}
      activeOpacity={0.9}
      style={{
        backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
        marginBottom: 14, borderWidth: 1, borderColor: '#f0e6ea',
        elevation: 2, shadowColor: BRAND, shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
      }}
    >
      {/* Image */}
      <View style={{ height: 150, backgroundColor: '#f5e8ee', position: 'relative' }}>
        {imgUrl ? (
          <Image source={{ uri: imgUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 36 }}>🏮</Text>
          </View>
        )}
        {/* LIVE badge */}
        <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#22C55E', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>LIVE</Text>
        </View>
        {v.category && (
          <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(94,20,63,0.85)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ color: GOLD_TEXT, fontSize: 10, fontWeight: '600' }}>{v.category.replace(/_/g, ' ')}</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={{ padding: 12, gap: 5 }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: '#1a0a12' }} numberOfLines={1}>{v.name}</Text>
        <Text style={{ fontSize: 12, color: '#7a5a6a' }}>
          📍 {v.area_name ? `${v.area_name}, ` : ''}{v.city}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {v.average_rating > 0 && (
            <Text style={{ fontSize: 12, color: GOLD }}>★ {v.average_rating.toFixed(1)}</Text>
          )}
          {v.min_price && (
            <Text style={{ fontSize: 12, fontWeight: '700', color: BRAND }}>
              from ₹{parseInt(v.min_price).toLocaleString('en-IN')}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <TouchableOpacity
            onPress={() => router.push(`/service/${v._id}`)}
            style={{ flex: 1, backgroundColor: BRAND, borderRadius: 8, paddingVertical: 8, alignItems: 'center' }}
          >
            <Text style={{ color: GOLD_TEXT, fontWeight: '700', fontSize: 12 }}>View Profile</Text>
          </TouchableOpacity>
          {phone ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${phone}`)}
              style={{ flex: 1, backgroundColor: '#f0fdf4', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#86efac' }}
            >
              <Text style={{ color: '#16a34a', fontWeight: '700', fontSize: 12 }}>📞 Call Now</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function AvailableTodayScreen() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiClient.getAvailableToday()
      .then(r => setVendors(Array.isArray(r.data) ? r.data : []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = vendors.filter(v => {
    const matchCat = activeCategory === 'all' || v.category === activeCategory;
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase())
      || (v.city ?? '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <IconSymbol size={20} name="chevron.left" color={GOLD_TEXT} />
          <Text style={{ color: GOLD_TEXT, fontSize: 14 }}>Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' }} />
          <Text style={{ color: GOLD_TEXT, fontSize: 22, fontWeight: '900' }}>Available Today</Text>
        </View>
        <Text style={{ color: '#f5d0e0', fontSize: 13, marginTop: 2 }}>
          Book instantly — {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} free right now
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, backgroundColor: '#fdf8f0' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1.5, borderColor: '#e8d5de' }}>
          <Text style={{ fontSize: 14 }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or city…"
            placeholderTextColor="#c9b0bc"
            style={{ flex: 1, fontSize: 14, color: '#1a0a12' }}
          />
        </View>
      </View>

      {/* Category pills */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={c => c.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
        style={{ backgroundColor: '#fdf8f0', borderBottomWidth: 1, borderBottomColor: '#e8d5de', maxHeight: 56 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveCategory(item.id)}
            style={{
              paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
              backgroundColor: activeCategory === item.id ? BRAND : '#fff',
              borderWidth: 1.5, borderColor: activeCategory === item.id ? BRAND : '#e8d5de',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: activeCategory === item.id ? GOLD_TEXT : '#7a5a6a' }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Text style={{ fontSize: 40 }}>🔍</Text>
          <Text style={{ color: '#7a5a6a', fontSize: 15 }}>No vendors available right now</Text>
          <Text style={{ color: '#9a7a85', fontSize: 13, textAlign: 'center', paddingHorizontal: 32 }}>
            Check back soon — vendors update their availability in real time
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={v => String(v._id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          renderItem={({ item }) => <VendorCard v={item} />}
        />
      )}
    </ScreenContainer>
  );
}
