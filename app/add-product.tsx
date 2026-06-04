import {
  ScrollView, Text, View, TextInput, TouchableOpacity,
  ActivityIndicator, Platform, Alert, Image,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";

const BRAND = '#5e143f';
const GOLD = '#f9e79f';
const GOLD2 = '#c9973a';

const CATEGORIES = [
  { label: 'Makeup Artist', value: 'Makeup_Artist' },
  { label: 'Photographers', value: 'Photographers' },
  { label: 'Caterers', value: 'Caterers' },
  { label: 'Event Planners', value: 'Planners' },
  { label: 'Halls', value: 'Halls' },
  { label: 'Decorators', value: 'Decorators' },
  { label: 'Mehandi Artist', value: 'Mehandi_Artist' },
  { label: 'Invitation', value: 'Invitation' },
  { label: 'Jewellery', value: 'Jewellery' },
  { label: 'DJ Artist', value: 'DJ_Artist' },
  { label: 'Travel & Transport', value: 'Travel_Transport' },
  { label: 'Music & Entertainment', value: 'Entertainment' },
  { label: 'Pandit', value: 'Pandit' },
];

function normalizePhone(value: string) {
  let cleaned = value.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
  if (cleaned.length === 10) cleaned = '91' + cleaned;
  return cleaned;
}

type ServiceInput = {
  name: string;
  description: string;
  price: string;
  imageUri: string | null;
};

const emptyService = (): ServiceInput => ({
  name: '', description: '', price: '', imageUri: null,
});

export default function AddProductPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [services, setServices] = useState<ServiceInput[]>([emptyService()]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  // If vendor already has a business, send them to manage-page
  useEffect(() => {
    if (!user?.id) { setChecking(false); return; }
    apiClient.getMyBusiness(user.id)
      .then(() => router.replace('/manage-page' as any))
      .catch(() => setChecking(false));
  }, [user?.id]);

  const pickImage = async (onPicked: (uri: string) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      onPicked(result.assets[0].uri);
    }
  };

  const updateService = (index: number, field: keyof ServiceInput, value: string | null) => {
    setServices(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) { setError('Business name is required'); return; }
    if (!category) { setError('Please select a category'); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('brand', brand);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('city', city);
      formData.append('area_name', area);
      formData.append('address', address);
      const bp = normalizePhone(businessPhone);
      formData.append('business_phone', bp);
      formData.append('personal_phone', normalizePhone(personalPhone) || bp);
      formData.append('opening_time', openingTime);
      formData.append('closing_time', closingTime);
      formData.append('instagram_url', instagramUrl);
      formData.append('facebook_url', facebookUrl);
      formData.append('min_price', minPrice);
      formData.append('max_price', maxPrice);

      if (imageUri) {
        const filename = imageUri.split('/').pop() ?? 'image.jpg';
        const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
        formData.append('image', { uri: imageUri, type: `image/${ext}`, name: filename } as any);
      }

      services.forEach((svc, i) => {
        if (!svc.name && !svc.price) return;
        formData.append(`services[${i}][name]`, svc.name);
        formData.append(`services[${i}][description]`, svc.description);
        formData.append(`services[${i}][price]`, svc.price);
        formData.append(`services[${i}][countInStock]`, '1');
        if (svc.imageUri) {
          const fn = svc.imageUri.split('/').pop() ?? 'svc.jpg';
          const ext = fn.split('.').pop()?.toLowerCase() ?? 'jpg';
          formData.append(`services[${i}][images][0]`, { uri: svc.imageUri, type: `image/${ext}`, name: fn } as any);
        }
      });

      await apiClient.registerProduct(formData);
      Alert.alert(
        '🎉 Business Registered!',
        'Your listing has been submitted for review. You can now manage your page.',
        [{ text: 'Go to My Page', onPress: () => router.replace('/manage-page' as any) }],
        { cancelable: false }
      );
    } catch (err: any) {
      const d = err?.response?.data;
      const msg = d?.detail || d?.message || d?.error
        || (d && Object.values(d)[0] as any)?.[0]
        || null;
      if (err?.response?.status === 400 && msg?.toLowerCase?.()?.includes('already')) {
        setError('You already have a registered business. Go to Manage My Page.');
      } else {
        setError(msg || 'Submission failed. Please check your details.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#fdf8f0', borderWidth: 1, borderColor: '#e8d5de',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: '#1a0a12',
  } as const;

  const labelStyle = { fontSize: 13, fontWeight: '600' as const, color: '#1a0a12', marginBottom: 5 };

  const Section = ({ icon, title }: { icon: string; title: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 10 }}>
      <Text style={{ fontSize: 15 }}>{icon}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: BRAND }}>{title}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: '#e8d5de' }} />
    </View>
  );

  if (checking) {
    return (
      <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={BRAND} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, gap: 4 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 20, left: 16, padding: 8 }}>
          <Text style={{ color: GOLD, fontSize: 14, fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '900', color: GOLD, textAlign: 'center' }}>🎊 Register Your Business</Text>
        <Text style={{ fontSize: 13, color: '#f5d0e0', textAlign: 'center' }}>
          List your wedding services on WedMangal
        </Text>
      </View>

      {(
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">

          {error ? (
            <View style={{ backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#fca5a5', borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <Text style={{ color: '#dc2626', fontSize: 13 }}>⚠️ {error}</Text>
            </View>
          ) : null}

          {/* ── Business Details ── */}
          <Section icon="🏪" title="Business Details" />

          <View style={{ gap: 12 }}>
            <View>
              <Text style={labelStyle}>Business Name *</Text>
              <TextInput style={inputStyle} placeholder="e.g. Priya Bridal Studio" placeholderTextColor="#c9b0bc"
                value={name} onChangeText={setName} />
            </View>

            <View>
              <Text style={labelStyle}>Business Image</Text>
              <TouchableOpacity
                onPress={() => pickImage(setImageUri)}
                style={{
                  borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#e8d5de',
                  borderRadius: 10, padding: 14, alignItems: 'center',
                }}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={{ width: '100%', height: 160, borderRadius: 8 }} resizeMode="cover" />
                ) : (
                  <Text style={{ color: '#7a5a6a', fontSize: 14 }}>📷 Tap to upload main photo</Text>
                )}
              </TouchableOpacity>
            </View>

            <View>
              <Text style={labelStyle}>Brand (optional)</Text>
              <TextInput style={inputStyle} placeholder="Enter brand name" placeholderTextColor="#c9b0bc"
                value={brand} onChangeText={setBrand} />
            </View>

            <View>
              <Text style={labelStyle}>Category *</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                style={[inputStyle, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
              >
                <Text style={{ color: category ? '#1a0a12' : '#c9b0bc', fontSize: 14 }}>
                  {CATEGORIES.find(c => c.value === category)?.label || 'Select a category'}
                </Text>
                <Text style={{ color: '#7a5a6a' }}>{showCategoryPicker ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showCategoryPicker && (
                <View style={{ borderWidth: 1, borderColor: '#e8d5de', borderRadius: 10, marginTop: 4, backgroundColor: '#fff' }}>
                  {CATEGORIES.map(c => (
                    <TouchableOpacity
                      key={c.value}
                      onPress={() => { setCategory(c.value); setShowCategoryPicker(false); }}
                      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3e8ee' }}
                    >
                      <Text style={{ fontSize: 14, color: category === c.value ? BRAND : '#1a0a12', fontWeight: category === c.value ? '700' : '400' }}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View>
              <Text style={labelStyle}>Description</Text>
              <TextInput
                style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' }]}
                placeholder="Describe your business and what makes you special..."
                placeholderTextColor="#c9b0bc"
                multiline numberOfLines={3}
                value={description} onChangeText={setDescription}
              />
            </View>
          </View>

          {/* ── Location ── */}
          <Section icon="📍" title="Location" />
          <View style={{ gap: 12 }}>
            <View>
              <Text style={labelStyle}>City</Text>
              <TextInput style={inputStyle} placeholder="e.g. Chennai" placeholderTextColor="#c9b0bc"
                value={city} onChangeText={setCity} />
            </View>
            <View>
              <Text style={labelStyle}>Area</Text>
              <TextInput style={inputStyle} placeholder="e.g. Anna Nagar, T. Nagar" placeholderTextColor="#c9b0bc"
                value={area} onChangeText={setArea} />
            </View>
            <View>
              <Text style={labelStyle}>Full Address</Text>
              <TextInput
                style={[inputStyle, { minHeight: 60, textAlignVertical: 'top' }]}
                placeholder="Enter your full shop/studio address"
                placeholderTextColor="#c9b0bc" multiline numberOfLines={2}
                value={address} onChangeText={setAddress}
              />
            </View>
          </View>

          {/* ── Contact ── */}
          <Section icon="📞" title="Contact" />
          <View style={{ gap: 12 }}>
            <View>
              <Text style={labelStyle}>Business Phone</Text>
              <TextInput style={inputStyle} placeholder="10-digit number (e.g. 9876543210)" placeholderTextColor="#c9b0bc"
                value={businessPhone} onChangeText={setBusinessPhone} keyboardType="phone-pad"
                onBlur={() => setBusinessPhone(normalizePhone(businessPhone))} />
              <Text style={{ fontSize: 11, color: '#9a7a8a', marginTop: 3 }}>Country code +91 added automatically</Text>
            </View>
            <View>
              <Text style={labelStyle}>Alt. Phone (optional)</Text>
              <TextInput style={inputStyle} placeholder="Optional alternative number" placeholderTextColor="#c9b0bc"
                value={personalPhone} onChangeText={setPersonalPhone} keyboardType="phone-pad"
                onBlur={() => setPersonalPhone(normalizePhone(personalPhone))} />
            </View>
          </View>

          {/* ── Working Hours ── */}
          <Section icon="⏰" title="Working Hours" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>Opens at</Text>
              <TextInput style={inputStyle} placeholder="09:00" placeholderTextColor="#c9b0bc"
                value={openingTime} onChangeText={setOpeningTime} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>Closes at</Text>
              <TextInput style={inputStyle} placeholder="18:00" placeholderTextColor="#c9b0bc"
                value={closingTime} onChangeText={setClosingTime} />
            </View>
          </View>

          {/* ── Social Links ── */}
          <Section icon="🔗" title="Social Links" />
          <View style={{ gap: 12 }}>
            <View>
              <Text style={labelStyle}>Instagram URL</Text>
              <TextInput style={inputStyle} placeholder="https://instagram.com/yourbusiness" placeholderTextColor="#c9b0bc"
                value={instagramUrl} onChangeText={setInstagramUrl} keyboardType="url" autoCapitalize="none" />
            </View>
            <View>
              <Text style={labelStyle}>Facebook URL</Text>
              <TextInput style={inputStyle} placeholder="https://facebook.com/yourbusiness" placeholderTextColor="#c9b0bc"
                value={facebookUrl} onChangeText={setFacebookUrl} keyboardType="url" autoCapitalize="none" />
            </View>
          </View>

          {/* ── Price Range ── */}
          <Section icon="💰" title="Price Range" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>Min Price (₹)</Text>
              <TextInput style={inputStyle} placeholder="e.g. 2000" placeholderTextColor="#c9b0bc"
                value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>Max Price (₹)</Text>
              <TextInput style={inputStyle} placeholder="e.g. 50000" placeholderTextColor="#c9b0bc"
                value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" />
            </View>
          </View>

          {/* ── Services ── */}
          <Section icon="✨" title="Your Services" />
          <Text style={{ fontSize: 13, color: '#7a5a6a', marginBottom: 12 }}>
            Add the services you offer. You can add more from Manage My Page later.
          </Text>

          {services.map((svc, i) => (
            <View key={i} style={{
              borderWidth: 1.5, borderColor: '#e8d5de', borderRadius: 12,
              padding: 14, marginBottom: 12, gap: 10,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{
                  width: 26, height: 26, borderRadius: 13, backgroundColor: BRAND,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: GOLD, fontSize: 12, fontWeight: '700' }}>{i + 1}</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: BRAND }}>
                  {svc.name || `Service ${i + 1}`}
                </Text>
                {services.length > 1 && (
                  <TouchableOpacity
                    onPress={() => setServices(prev => prev.filter((_, idx) => idx !== i))}
                    style={{ marginLeft: 'auto' }}
                  >
                    <Text style={{ color: '#dc2626', fontSize: 13 }}>✕ Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View>
                <Text style={labelStyle}>Service Name</Text>
                <TextInput style={inputStyle} placeholder="e.g. Bridal Makeup, Full Day Photography"
                  placeholderTextColor="#c9b0bc" value={svc.name}
                  onChangeText={v => updateService(i, 'name', v)} />
              </View>
              <View>
                <Text style={labelStyle}>Description</Text>
                <TextInput
                  style={[inputStyle, { minHeight: 70, textAlignVertical: 'top' }]}
                  placeholder="What's included in this service?"
                  placeholderTextColor="#c9b0bc" multiline numberOfLines={3}
                  value={svc.description} onChangeText={v => updateService(i, 'description', v)}
                />
              </View>
              <View>
                <Text style={labelStyle}>Price (₹)</Text>
                <TextInput style={[inputStyle, { maxWidth: 160 }]} placeholder="e.g. 5000"
                  placeholderTextColor="#c9b0bc" value={svc.price} keyboardType="numeric"
                  onChangeText={v => updateService(i, 'price', v)} />
              </View>
              <View>
                <Text style={labelStyle}>Service Image</Text>
                <TouchableOpacity
                  onPress={() => pickImage(uri => updateService(i, 'imageUri', uri))}
                  style={{
                    borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#e8d5de',
                    borderRadius: 8, padding: 12, alignItems: 'center',
                  }}
                >
                  {svc.imageUri ? (
                    <Image source={{ uri: svc.imageUri }} style={{ width: '100%', height: 120, borderRadius: 6 }} resizeMode="cover" />
                  ) : (
                    <Text style={{ color: '#7a5a6a', fontSize: 13 }}>📷 Add service photo</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => setServices(prev => [...prev, emptyService()])}
            style={{
              borderWidth: 1.5, borderStyle: 'dashed', borderColor: GOLD2,
              borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 20,
            }}
          >
            <Text style={{ color: GOLD2, fontWeight: '700', fontSize: 14 }}>+ Add Another Service</Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              backgroundColor: BRAND, borderRadius: 12,
              paddingVertical: 15, alignItems: 'center',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator color={GOLD} />
            ) : (
              <Text style={{ color: GOLD, fontWeight: '900', fontSize: 16 }}>🎊 Submit Business Registration</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </ScreenContainer>

  );
}
