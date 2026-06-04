import { ScrollView, Text, View, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

const BRAND = '#5e143f';
const GOLD = '#f9e79f';

interface WishlistItem {
  _id: string | number;
  name: string;
  category: string | null;
  image?: string;
  min_price: string | number | null;
  max_price: string | number | null;
  average_rating?: number;
}

const getImageUrl = (img: string | null | undefined) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/')) return `https://wedmangal.com${img}`;
  return `https://wedmangal.com/static/images/${img}`;
};

const formatPrice = (min: string | number | null, max: string | number | null) => {
  if (!min && !max) return 'Price on request';
  const mn = min ? parseInt(String(min)) : null;
  const mx = max ? parseInt(String(max)) : null;
  if (mn && mx) return `₹${mn.toLocaleString('en-IN')} – ₹${mx.toLocaleString('en-IN')}`;
  if (mn) return `From ₹${mn.toLocaleString('en-IN')}`;
  return `Up to ₹${mx!.toLocaleString('en-IN')}`;
};

export default function WishlistScreen() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      apiClient.getWishlist()
        .then(r => {
          const raw: any[] = r.data.products ?? r.data ?? [];
          // Wishlist items may be wrapped: { product: {...} } or flat
          const items = raw.map((i: any) => i.product ?? i);
          setWishlist(items);
        })
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }, [])
  );

  const handleRemove = async (id: string | number) => {
    try {
      await apiClient.removeFromWishlist(id);
      setWishlist(prev => prev.filter(i => i._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16 }}>
        <Text style={{ color: GOLD, fontSize: 22, fontWeight: '800' }}>Wishlist</Text>
        <Text style={{ color: '#f5d0e0', fontSize: 13, marginTop: 2 }}>Your saved vendors</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : wishlist.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
          <IconSymbol size={64} name="heart" color="#e8d5de" />
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a0a12' }}>Nothing saved yet</Text>
          <Text style={{ fontSize: 14, color: '#7a5a6a', textAlign: 'center' }}>
            Save vendors you love to revisit them later
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/search')}
            style={{ backgroundColor: BRAND, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 30, marginTop: 8 }}
          >
            <Text style={{ color: GOLD, fontWeight: '700', fontSize: 14 }}>Explore Vendors</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <Text style={{ fontSize: 13, color: '#7a5a6a', fontWeight: '600', marginBottom: 10 }}>
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved
          </Text>
          {wishlist.map(item => {
            const imgUrl = getImageUrl(item.image);
            return (
              <View key={item._id} style={{
                backgroundColor: '#fdf8f0', borderRadius: 12, overflow: 'hidden',
                borderWidth: 1, borderColor: '#e8d5de', marginBottom: 12,
              }}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ width: 90, height: 90, backgroundColor: '#e8d5de', alignItems: 'center', justifyContent: 'center' }}>
                    {imgUrl ? (
                      <Image source={{ uri: imgUrl }} style={{ width: 90, height: 90 }} resizeMode="cover" />
                    ) : (
                      <IconSymbol size={28} name="heart.fill" color="#c9b0bc" />
                    )}
                  </View>
                  <View style={{ flex: 1, padding: 10, justifyContent: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#1a0a12' }}>{item.name}</Text>
                    {item.category && (
                      <Text style={{ fontSize: 12, color: '#7a5a6a' }}>{item.category}</Text>
                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: BRAND }}>
                        {formatPrice(item.min_price, item.max_price)}
                      </Text>
                      {item.average_rating && item.average_rating > 0 ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <IconSymbol size={12} name="star.fill" color={GOLD} />
                          <Text style={{ fontSize: 11, fontWeight: '600', color: '#1a0a12' }}>
                            {item.average_rating.toFixed(1)}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
                <View style={{
                  flexDirection: 'row', gap: 8, padding: 10,
                  borderTopWidth: 1, borderTopColor: '#e8d5de',
                }}>
                  <TouchableOpacity
                    onPress={() => router.push(`/service/${item._id}`)}
                    style={{ flex: 1, backgroundColor: BRAND, borderRadius: 8, paddingVertical: 9, alignItems: 'center' }}
                  >
                    <Text style={{ color: GOLD, fontWeight: '700', fontSize: 13 }}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRemove(item._id)}
                    style={{ flex: 1, backgroundColor: '#fdf8f0', borderRadius: 8, paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' }}
                  >
                    <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 13 }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
