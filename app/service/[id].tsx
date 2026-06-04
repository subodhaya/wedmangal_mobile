import {
  ScrollView, Text, View, TouchableOpacity, Image,
  ActivityIndicator, Linking, TextInput, Alert,
} from "react-native";
import { shadow } from "@/lib/utils";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

const BRAND = '#5e143f';
const GOLD = '#c9973a';
const GOLD_TEXT = '#f9e79f';

interface ServiceImage { _id?: number; image: string; }

interface Review {
  _id: number;
  user: string;
  name?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Service {
  _id: number;
  name: string | null;
  price: string | null;
  description: string | null;
  rating?: number;
  numReviews?: number;
  images?: ServiceImage[];
  reviews?: Review[];
}

interface Product {
  _id: number;
  name: string;
  image: string;
  category: string | null;
  average_rating: number;
  total_num_reviews: number;
  min_price: string | null;
  max_price: string | null;
  area_name: string | null;
  address: string | null;
  opening_time: string | null;
  closing_time: string | null;
  personal_phone: string | null;
  business_phone: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  city: string | null;
  services?: Service[];
}

const getImageUrl = (img: string | null | undefined) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/')) return `https://wedmangal.com${img}`;
  return `https://wedmangal.com/static/images/${img}`;
};

const normalizePhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned || cleaned === '0000') return '';
  if (cleaned.startsWith('0') && cleaned.length >= 10) return '91' + cleaned.slice(1);
  if (cleaned.length === 10) return '91' + cleaned;
  return cleaned;
};

const formatTime = (t: string | null) => {
  if (!t || t === 'null') return 'By Appointment';
  return t.slice(0, 5);
};

// ── Star selector ─────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity key={i} onPress={() => onChange(i)}>
          <Text style={{ fontSize: 26, color: i <= value ? GOLD : '#ddd' }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Phone row (call + WhatsApp) ───────────────────────────────────────────────
function PhoneRow({ label, phone, businessName }: { label: string; phone: string; businessName: string }) {
  const clean = normalizePhone(phone);
  if (!clean) return null;
  const msg = encodeURIComponent(
    `Hi, I found you on WedMangal! I'm interested in your ${businessName} services. Can you please share more details?`
  );
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
      <View>
        <Text style={{ fontSize: 11, color: '#9a7a85' }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1a0a12' }}>{phone}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${clean}`)}
          style={{ backgroundColor: BRAND, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, flexDirection: 'row', gap: 5, alignItems: 'center' }}
        >
          <IconSymbol size={14} name="phone.fill" color={GOLD_TEXT} />
          <Text style={{ color: GOLD_TEXT, fontSize: 12, fontWeight: '700' }}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL(`https://wa.me/${clean}?text=${msg}`)}
          style={{ backgroundColor: '#25D366', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, flexDirection: 'row', gap: 5, alignItems: 'center' }}
        >
          <IconSymbol size={14} name="message.fill" color="#fff" />
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Service card with reviews + review form ───────────────────────────────────
function ServiceCard({
  service, productId, productName, vendorPhone, isAuthenticated,
}: {
  service: Service; productId: number; productName: string; vendorPhone: string; isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(service.reviews ?? []);
  const [imgIdx, setImgIdx] = useState(0);

  const imgs = service.images ?? [];
  const svcStars = Math.round(service.rating ?? 0);

  const submitReview = async () => {
    if (rating === 0) { Alert.alert('Rating required', 'Please select a star rating'); return; }
    if (!isAuthenticated) { router.push('/login'); return; }
    setSubmitting(true);
    try {
      const r = await apiClient.createReview(service._id, { rating, comment: comment.trim() });
      setReviews(prev => [r.data.review ?? { _id: Date.now(), user: 'You', rating, comment, createdAt: new Date().toISOString() }, ...prev]);
      setRating(0);
      setComment('');
    } catch {
      Alert.alert('Error', 'Could not submit review. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#f0e6ea', marginBottom: 16, elevation: 2, ...shadow(BRAND, 0.07, 6) }}>

      {/* Service header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0e6ea' }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1a0a12', flex: 1 }}>{service.name}</Text>
        {(service.rating ?? 0) > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Text style={{ color: GOLD, fontSize: 14 }}>★</Text>
            <Text style={{ fontWeight: '700', color: '#1a0a12', fontSize: 13 }}>{(service.rating ?? 0).toFixed(1)}</Text>
            <Text style={{ color: '#9a7a85', fontSize: 11 }}>({service.numReviews ?? 0})</Text>
          </View>
        )}
      </View>

      {/* Image carousel (simple prev/next) */}
      {imgs.length > 0 && (
        <View style={{ height: 200, backgroundColor: '#f5e8ee', position: 'relative' }}>
          <Image
            source={{ uri: getImageUrl(imgs[imgIdx]?.image) ?? '' }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          {imgs.length > 1 && (
            <>
              <TouchableOpacity
                onPress={() => setImgIdx(i => Math.max(0, i - 1))}
                style={{ position: 'absolute', left: 8, top: '50%', marginTop: -18, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 18, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setImgIdx(i => Math.min(imgs.length - 1, i + 1))}
                style={{ position: 'absolute', right: 8, top: '50%', marginTop: -18, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 18, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>›</Text>
              </TouchableOpacity>
              <View style={{ position: 'absolute', bottom: 8, alignSelf: 'center', flexDirection: 'row', gap: 4 }}>
                {imgs.map((_, i) => (
                  <View key={i} style={{ width: i === imgIdx ? 16 : 5, height: 5, borderRadius: 3, backgroundColor: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.5)' }} />
                ))}
              </View>
            </>
          )}
        </View>
      )}

      <View style={{ padding: 14, gap: 10 }}>
        {service.description && (
          <Text style={{ fontSize: 13, color: '#5a3a45', lineHeight: 20 }}>{service.description}</Text>
        )}

        {/* Price + Book button */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 11, color: '#9a7a85' }}>Price</Text>
            {service.price && parseInt(service.price) > 0 ? (
              <Text style={{ fontSize: 18, fontWeight: '800', color: BRAND }}>
                ₹{parseInt(service.price).toLocaleString('en-IN')}
              </Text>
            ) : (
              <Text style={{ fontSize: 14, color: '#9a7a85', fontStyle: 'italic' }}>📞 Contact for Price</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => {
              if (!isAuthenticated) { router.push('/login'); return; }
              const params = new URLSearchParams({
                productId: String(productId),
                serviceName: service.name ?? '',
                vendorName: productName,
                price: service.price ?? '0',
                vendorPhone,
              });
              router.push(`/booking/${service._id}?${params.toString()}`);
            }}
            style={{ backgroundColor: BRAND, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24 }}
          >
            <Text style={{ color: GOLD_TEXT, fontWeight: '800', fontSize: 13 }}>✨ Book Now</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews */}
        <View style={{ marginTop: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: BRAND, marginBottom: 8 }}>💬 Customer Reviews</Text>

          {reviews.length === 0 ? (
            <Text style={{ fontSize: 13, color: '#9a7a85', fontStyle: 'italic' }}>No reviews yet — be the first!</Text>
          ) : (
            reviews.map(rv => (
              <View key={rv._id} style={{ borderTopWidth: 1, borderTopColor: '#f0e6ea', paddingTop: 10, marginTop: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', color: '#1a0a12', fontSize: 13 }}>{rv.user || rv.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Text key={i} style={{ fontSize: 11, color: i <= rv.rating ? GOLD : '#ddd' }}>★</Text>
                    ))}
                    {rv.createdAt && (
                      <Text style={{ fontSize: 10, color: '#9a7a85', marginLeft: 4 }}>
                        {new Date(rv.createdAt).toLocaleDateString('en-IN')}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#5a3a45', marginTop: 4, lineHeight: 18 }}>
                  {rv.comment || <Text style={{ fontStyle: 'italic', color: '#9a7a85' }}>No comment provided.</Text>}
                </Text>
              </View>
            ))
          )}

          {/* Write a review */}
          <View style={{ marginTop: 14, backgroundColor: '#faf7f2', borderRadius: 10, padding: 14, gap: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: BRAND }}>✍️ Write a Review</Text>
            {!isAuthenticated ? (
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={{ fontSize: 13, color: BRAND }}>Please <Text style={{ fontWeight: '700', textDecorationLine: 'underline' }}>sign in</Text> to write a review</Text>
              </TouchableOpacity>
            ) : (
              <>
                <StarPicker value={rating} onChange={setRating} />
                <TextInput
                  style={{
                    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8d5de',
                    borderRadius: 8, padding: 10, fontSize: 13, color: '#1a0a12',
                    minHeight: 70, textAlignVertical: 'top',
                  }}
                  placeholder="Share your experience... (optional)"
                  placeholderTextColor="#c9b0bc"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                />
                <TouchableOpacity
                  onPress={submitReview}
                  disabled={submitting}
                  style={{ backgroundColor: BRAND, borderRadius: 8, paddingVertical: 10, alignItems: 'center', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? <ActivityIndicator color={GOLD_TEXT} size="small" /> : (
                    <Text style={{ color: GOLD_TEXT, fontWeight: '700', fontSize: 13 }}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (id) {
      apiClient.getProductById(id as string)
        .then(r => setProduct(r.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleWishlist = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    try {
      if (inWishlist) await apiClient.removeFromWishlist(id as string);
      else await apiClient.addToWishlist(id as string);
      setInWishlist(w => !w);
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      </ScreenContainer>
    );
  }

  if (!product) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <Text style={{ color: '#1a0a12', fontWeight: '600', fontSize: 16 }}>Vendor not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: BRAND, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24 }}
          >
            <Text style={{ color: GOLD_TEXT, fontWeight: '700' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const heroImg = getImageUrl(product.image);
  const phones: { label: string; phone: string }[] = [];
  if (product.business_phone) phones.push({ label: '📞 Business Phone', phone: product.business_phone });
  if (product.personal_phone && product.personal_phone !== product.business_phone)
    phones.push({ label: '📱 Personal Phone', phone: product.personal_phone });

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#fff' }}>

        {/* ── Hero image ── */}
        <View style={{ height: 270, backgroundColor: '#f5e8ee', position: 'relative' }}>
          {heroImg ? (
            <Image source={{ uri: heroImg }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 60 }}>🏪</Text>
            </View>
          )}
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ position: 'absolute', top: 48, left: 16, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 22, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', elevation: 3 }}
          >
            <IconSymbol size={20} name="chevron.left" color={BRAND} />
          </TouchableOpacity>
          {/* Wishlist button */}
          <TouchableOpacity
            onPress={handleWishlist}
            style={{ position: 'absolute', top: 48, right: 16, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 22, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', elevation: 3 }}
          >
            <IconSymbol size={20} name={inWishlist ? "heart.fill" : "heart"} color={inWishlist ? '#e74c3c' : BRAND} />
          </TouchableOpacity>
          {/* Name + category overlay */}
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(94,20,63,0.80)', paddingHorizontal: 16, paddingVertical: 14 }}>
            <Text style={{ color: GOLD_TEXT, fontSize: 20, fontWeight: '900' }}>{product.name}</Text>
            {product.category && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <View style={{ backgroundColor: 'rgba(201,151,58,0.25)', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ color: GOLD_TEXT, fontSize: 11, fontWeight: '600' }}>
                    🎊 {product.category.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ── Go back link ── */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingTop: 14 }}
        >
          <IconSymbol size={14} name="chevron.left" color={BRAND} />
          <Text style={{ fontSize: 13, color: BRAND, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>

        <View style={{ padding: 16, gap: 16 }}>

          {/* ── Rating row ── */}
          {product.average_rating > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <Text key={i} style={{ fontSize: 18, color: i <= Math.round(product.average_rating) ? GOLD : '#ddd' }}>★</Text>
              ))}
              <Text style={{ fontWeight: '700', color: '#1a0a12', fontSize: 15 }}>{product.average_rating.toFixed(1)}</Text>
              <Text style={{ color: '#9a7a85', fontSize: 13 }}>({product.total_num_reviews} reviews)</Text>
            </View>
          )}

          {/* ── Price range card ── */}
          {(product.min_price || product.max_price) && (
            <View style={{ backgroundColor: '#faf7f2', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#f0e6ea' }}>
              <Text style={{ fontSize: 12, color: '#9a7a85' }}>💰 Price Range</Text>
              <Text style={{ fontSize: 22, fontWeight: '900', color: BRAND, marginTop: 4 }}>
                {product.min_price && product.max_price
                  ? `₹${parseInt(product.min_price).toLocaleString('en-IN')} – ₹${parseInt(product.max_price).toLocaleString('en-IN')}`
                  : product.min_price
                    ? `From ₹${parseInt(product.min_price).toLocaleString('en-IN')}`
                    : `Up to ₹${parseInt(product.max_price!).toLocaleString('en-IN')}`
                }
              </Text>
            </View>
          )}

          {/* ── Vendor details card ── */}
          <View style={{ backgroundColor: '#faf7f2', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#f0e6ea', gap: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: BRAND }}>Vendor Details</Text>

            {product.area_name && (
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 16 }}>📍</Text>
                <View>
                  <Text style={{ fontSize: 11, color: '#9a7a85' }}>Area</Text>
                  <Text style={{ fontSize: 14, color: '#1a0a12' }}>{product.area_name}</Text>
                </View>
              </View>
            )}

            {product.address && (
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 16 }}>🏠</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#9a7a85' }}>Address</Text>
                  <Text style={{ fontSize: 14, color: '#1a0a12' }}>{product.address}</Text>
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 16 }}>⏰</Text>
              <View>
                <Text style={{ fontSize: 11, color: '#9a7a85' }}>Working Hours</Text>
                <Text style={{ fontSize: 14, color: product.opening_time ? '#1a0a12' : '#9a7a85', fontStyle: product.opening_time ? 'normal' : 'italic' }}>
                  {product.opening_time && product.opening_time !== 'null'
                    ? `${formatTime(product.opening_time)} – ${formatTime(product.closing_time)}`
                    : 'By Appointment'}
                </Text>
              </View>
            </View>

            {/* Phones */}
            {phones.map((ph, i) => (
              <PhoneRow key={i} label={ph.label} phone={ph.phone} businessName={product.name} />
            ))}

            {/* Social links */}
            {(product.instagram_url || product.facebook_url) && (
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 16 }}>🔗</Text>
                <View>
                  <Text style={{ fontSize: 11, color: '#9a7a85' }}>Social Media</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                    {product.instagram_url && (
                      <TouchableOpacity onPress={() => Linking.openURL(product.instagram_url!)}>
                        <Text style={{ color: '#E1306C', fontWeight: '700', fontSize: 13 }}>📸 Instagram</Text>
                      </TouchableOpacity>
                    )}
                    {product.facebook_url && (
                      <TouchableOpacity onPress={() => Linking.openURL(product.facebook_url!)}>
                        <Text style={{ color: '#1877F2', fontWeight: '700', fontSize: 13 }}>👍 Facebook</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* ── Services ── */}
          {product.services && product.services.length > 0 && (
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: BRAND, marginBottom: 12 }}>✨ Services Offered</Text>
              {product.services.map(svc => (
                <ServiceCard
                  key={svc._id}
                  service={svc}
                  productId={product._id}
                  productName={product.name}
                  vendorPhone={normalizePhone(product.business_phone ?? product.personal_phone ?? '')}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
