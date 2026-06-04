import {
  ScrollView, Text, View, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Image, Switch,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
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

type ServiceImage = {
  _id: string;
  image: string;
};

type Service = {
  _id: string;
  name: string;
  description: string;
  price: string | number;
  images?: ServiceImage[];
};

type AddServiceForm = {
  name: string;
  description: string;
  price: string;
  imageUri: string | null;
};

type EditServiceForm = {
  name: string;
  description: string;
  price: string;
};

export default function ManagePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  // Handle both id formats: Django may return _id or id
  const userId = (user as any)?._id ?? user?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Business fields
  const [productId, setProductId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
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
  const [isApproved, setIsApproved] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Services
  const [services, setServices] = useState<Service[]>([]);
  const [showAddService, setShowAddService] = useState(false);
  const [addSvc, setAddSvc] = useState<AddServiceForm>({ name: '', description: '', price: '', imageUri: null });
  const [addingService, setAddingService] = useState(false);
  // Inline service editing
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditServiceForm>({ name: '', description: '', price: '' });
  const [savingService, setSavingService] = useState(false);
  // Per-service image upload tracking
  const [addingImageToId, setAddingImageToId] = useState<string | null>(null);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;          // wait for auth to restore from storage
    if (!userId) {
      router.replace('/login' as any);
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    setError('');
    apiClient.getMyBusiness(userId)
      .then(({ data }) => {
        setProductId(data._id ?? data.id ?? null);
        setName(data.name || '');
        setExistingImage(data.image || null);
        setBrand(data.brand || '');
        setCategory(data.category || '');
        setDescription(data.description || '');
        setCity(data.city || '');
        setArea(data.area_name || '');
        setAddress(data.address || '');
        setBusinessPhone(data.business_phone || '');
        setPersonalPhone(data.personal_phone || '');
        setOpeningTime(data.opening_time || '');
        setClosingTime(data.closing_time || '');
        setInstagramUrl(data.instagram_url || '');
        setFacebookUrl(data.facebook_url || '');
        setMinPrice(data.min_price ? String(data.min_price) : '');
        setMaxPrice(data.max_price ? String(data.max_price) : '');
        setIsApproved(data.is_approved || data.isApproved || false);
        setIsAvailable(data.is_available || false);
        setServices(data.services || []);
      })
      .catch(() => setError('Could not load your business data. Please try again.'))
      .finally(() => setLoading(false));
  }, [authLoading, userId]);

  const pickImage = async (onPicked: (uri: string) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access.');
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

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      const skipKeys = ['imageFile', 'image', 'isApproved', 'is_approved', 'services', 'is_claimed', 'claimed_by_id'];
      const fields: Record<string, string> = {
        name, brand, category, description, city, area_name: area,
        address, business_phone: businessPhone,
        personal_phone: personalPhone || businessPhone,
        opening_time: openingTime, closing_time: closingTime,
        instagram_url: instagramUrl, facebook_url: facebookUrl,
        min_price: minPrice, max_price: maxPrice,
      };
      for (const [key, val] of Object.entries(fields)) {
        if (!skipKeys.includes(key)) formData.append(key, val ?? '');
      }
      if (imageUri) {
        const fn = imageUri.split('/').pop() ?? 'image.jpg';
        const ext = fn.split('.').pop()?.toLowerCase() ?? 'jpg';
        formData.append('image', { uri: imageUri, type: `image/${ext}`, name: fn } as any);
      }
      await apiClient.updateProduct(userId, formData);
      setSuccess('Business updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      const d = err?.response?.data;
      setError(d ? JSON.stringify(d) : 'Update failed. Please try again.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await apiClient.toggleAvailability({ is_available: !isAvailable });
      setIsAvailable(prev => !prev);
    } catch {
      Alert.alert('Error', 'Could not update availability.');
    }
  };

  const handleDeleteService = (svcId: string) => {
    Alert.alert('Delete Service', 'Are you sure you want to delete this service?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.deleteService(svcId);
            setServices(prev => prev.filter(s => s._id !== svcId));
          } catch {
            Alert.alert('Error', 'Could not delete service.');
          }
        },
      },
    ]);
  };

  const handleAddService = async () => {
    if (!addSvc.name.trim() || !addSvc.price) {
      Alert.alert('Required', 'Service name and price are required.');
      return;
    }
    setAddingService(true);
    try {
      const formData = new FormData();
      formData.append('name', addSvc.name.trim());
      formData.append('description', addSvc.description);
      formData.append('price', addSvc.price);
      formData.append('countInStock', '1');
      if (productId) formData.append('product', productId);
      if (addSvc.imageUri) {
        const fn = addSvc.imageUri.split('/').pop() ?? 'svc.jpg';
        const ext = fn.split('.').pop()?.toLowerCase() ?? 'jpg';
        formData.append('image', { uri: addSvc.imageUri, type: `image/${ext}`, name: fn } as any);
      }
      const { data } = await apiClient.addService(formData);
      setServices(prev => [...prev, data]);
      setAddSvc({ name: '', description: '', price: '', imageUri: null });
      setShowAddService(false);
    } catch {
      Alert.alert('Error', 'Could not add service. Please try again.');
    } finally {
      setAddingService(false);
    }
  };

  // ── Remove the business main image ───────────────────────────────────────────
  const handleRemoveBusinessImage = () => {
    Alert.alert('Remove Image', 'Remove the main business photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            if (productId) await apiClient.removeBusinessImage(productId);
            setExistingImage(null);
            setImageUri(null);
          } catch {
            Alert.alert('Error', 'Could not remove image.');
          }
        },
      },
    ]);
  };

  // ── Delete one image from a service ──────────────────────────────────────────
  const handleDeleteServiceImage = (svcId: string, imgId: string) => {
    Alert.alert('Remove Image', 'Delete this service image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.removeServiceImage(imgId);
            setServices(prev => prev.map(s =>
              s._id === svcId
                ? { ...s, images: s.images?.filter(i => i._id !== imgId) }
                : s
            ));
          } catch {
            Alert.alert('Error', 'Could not delete image.');
          }
        },
      },
    ]);
  };

  // ── Add image to an existing service ─────────────────────────────────────────
  const handleAddServiceImage = async (svcId: string) => {
    const uri = await new Promise<string | null>(resolve => {
      pickImage(u => resolve(u));
      // pickImage doesn't call resolve if user cancels; handle via timeout fallback
      setTimeout(() => resolve(null), 60000);
    });
    if (!uri) return;
    setAddingImageToId(svcId);
    try {
      const fn = uri.split('/').pop() ?? 'img.jpg';
      const ext = fn.split('.').pop()?.toLowerCase() ?? 'jpg';
      const formData = new FormData();
      formData.append('images', { uri, type: `image/${ext}`, name: fn } as any);
      const { data } = await apiClient.addServiceImages(svcId, formData);
      const newImg: ServiceImage = data.image ?? data;
      setServices(prev => prev.map(s =>
        s._id === svcId
          ? { ...s, images: [...(s.images ?? []), newImg] }
          : s
      ));
    } catch {
      Alert.alert('Error', 'Could not upload image.');
    } finally {
      setAddingImageToId(null);
    }
  };

  // ── Save inline service edits ─────────────────────────────────────────────────
  const handleUpdateService = async () => {
    if (!editingServiceId) return;
    if (!editForm.name.trim() || !editForm.price) {
      Alert.alert('Required', 'Name and price are required.');
      return;
    }
    setSavingService(true);
    try {
      const { data } = await apiClient.updateService(editingServiceId, {
        name: editForm.name.trim(),
        description: editForm.description,
        price: editForm.price,
      });
      setServices(prev => prev.map(s =>
        s._id === editingServiceId ? { ...s, ...data, images: s.images } : s
      ));
      setEditingServiceId(null);
    } catch {
      Alert.alert('Error', 'Could not update service.');
    } finally {
      setSavingService(false);
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

  if (loading) {
    return (
      <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator color={BRAND} size="large" />
          <Text style={{ color: '#7a5a6a', fontSize: 14 }}>Loading your business…</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, gap: 6 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 20, left: 16, padding: 8 }}>
          <Text style={{ color: GOLD, fontSize: 14, fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '900', color: GOLD, textAlign: 'center' }}>✏️ Manage My Business</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          <View style={{
            backgroundColor: isApproved ? '#16a34a' : '#d97706',
            paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
          }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
              {isApproved ? '✅ Verified' : '⏳ Pending Approval'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">

        {/* Alerts */}
        {error ? (
          <View style={{ backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#fca5a5', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <Text style={{ color: '#dc2626', fontSize: 13 }}>⚠️ {error}</Text>
          </View>
        ) : null}
        {success ? (
          <View style={{ backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#86efac', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <Text style={{ color: '#166534', fontSize: 13 }}>✅ {success}</Text>
          </View>
        ) : null}

        {/* Availability toggle */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: '#fdf8f0', borderRadius: 10, padding: 14,
          borderWidth: 1, borderColor: '#e8d5de', marginBottom: 4,
        }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1a0a12' }}>Available for Bookings</Text>
            <Text style={{ fontSize: 12, color: '#7a5a6a' }}>
              {isAvailable ? 'Visible in "Available Today"' : 'Not shown as available today'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={handleToggleAvailability}
            trackColor={{ false: '#e8d5de', true: BRAND }}
            thumbColor={isAvailable ? GOLD2 : '#f5d0e0'}
          />
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 4 }}>
          {[
            { num: services.length, label: 'Services' },
            { num: city || '—', label: 'City' },
            { num: CATEGORIES.find(c => c.value === category)?.label?.split(' ')[0] || '—', label: 'Category' },
          ].map((stat, i) => (
            <View key={i} style={{
              flex: 1, backgroundColor: '#fdf8f0', borderRadius: 10, padding: 12,
              alignItems: 'center', borderWidth: 1, borderColor: '#e8d5de',
            }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: BRAND }}>{stat.num}</Text>
              <Text style={{ fontSize: 11, color: '#7a5a6a' }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Business Info ── */}
        <Section icon="🏪" title="Business Info" />
        <View style={{ gap: 12 }}>
          <View>
            <Text style={labelStyle}>Business Name *</Text>
            <TextInput style={inputStyle} value={name} onChangeText={setName} placeholder="Business name" placeholderTextColor="#c9b0bc" />
          </View>

          <View>
            <Text style={labelStyle}>Business Image</Text>
            {(imageUri || existingImage) ? (
              <View style={{ position: 'relative' }}>
                <Image
                  source={{ uri: imageUri ?? existingImage! }}
                  style={{ width: '100%', height: 160, borderRadius: 10 }}
                  resizeMode="cover"
                />
                {/* Replace */}
                <TouchableOpacity
                  onPress={() => pickImage(setImageUri)}
                  style={{ position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>📷 Replace</Text>
                </TouchableOpacity>
                {/* Delete */}
                <TouchableOpacity
                  onPress={handleRemoveBusinessImage}
                  style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(220,38,38,0.85)', borderRadius: 20, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => pickImage(setImageUri)}
                style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#e8d5de', borderRadius: 10, padding: 24, alignItems: 'center' }}
              >
                <Text style={{ color: '#7a5a6a', fontSize: 13 }}>📷 Tap to upload main photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <View>
            <Text style={labelStyle}>Brand</Text>
            <TextInput style={inputStyle} value={brand} onChangeText={setBrand} placeholder="Brand name (optional)" placeholderTextColor="#c9b0bc" />
          </View>

          <View>
            <Text style={labelStyle}>Category</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              style={[inputStyle, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
            >
              <Text style={{ color: category ? '#1a0a12' : '#c9b0bc', fontSize: 14 }}>
                {CATEGORIES.find(c => c.value === category)?.label || 'Select category'}
              </Text>
              <Text style={{ color: '#7a5a6a' }}>{showCategoryPicker ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={{ borderWidth: 1, borderColor: '#e8d5de', borderRadius: 10, marginTop: 4, backgroundColor: '#fff' }}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity key={c.value}
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
              value={description} onChangeText={setDescription}
              placeholder="Describe your business..." placeholderTextColor="#c9b0bc"
              multiline numberOfLines={3}
            />
          </View>
        </View>

        {/* ── Location ── */}
        <Section icon="📍" title="Location" />
        <View style={{ gap: 12 }}>
          <View>
            <Text style={labelStyle}>City</Text>
            <TextInput style={inputStyle} value={city} onChangeText={setCity} placeholder="e.g. Chennai" placeholderTextColor="#c9b0bc" />
          </View>
          <View>
            <Text style={labelStyle}>Area</Text>
            <TextInput style={inputStyle} value={area} onChangeText={setArea} placeholder="e.g. Anna Nagar" placeholderTextColor="#c9b0bc" />
          </View>
          <View>
            <Text style={labelStyle}>Full Address</Text>
            <TextInput
              style={[inputStyle, { minHeight: 60, textAlignVertical: 'top' }]}
              value={address} onChangeText={setAddress}
              placeholder="Full address" placeholderTextColor="#c9b0bc" multiline numberOfLines={2}
            />
          </View>
        </View>

        {/* ── Contact ── */}
        <Section icon="📞" title="Contact" />
        <View style={{ gap: 12 }}>
          <View>
            <Text style={labelStyle}>Business Phone</Text>
            <TextInput style={inputStyle} value={businessPhone} onChangeText={setBusinessPhone}
              placeholder="10-digit number" placeholderTextColor="#c9b0bc" keyboardType="phone-pad" />
          </View>
          <View>
            <Text style={labelStyle}>Alt. Phone</Text>
            <TextInput style={inputStyle} value={personalPhone} onChangeText={setPersonalPhone}
              placeholder="Optional" placeholderTextColor="#c9b0bc" keyboardType="phone-pad" />
          </View>
        </View>

        {/* ── Working Hours ── */}
        <Section icon="⏰" title="Working Hours" />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>Opens at</Text>
            <TextInput style={inputStyle} value={openingTime} onChangeText={setOpeningTime}
              placeholder="09:00" placeholderTextColor="#c9b0bc" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>Closes at</Text>
            <TextInput style={inputStyle} value={closingTime} onChangeText={setClosingTime}
              placeholder="18:00" placeholderTextColor="#c9b0bc" />
          </View>
        </View>

        {/* ── Social Links ── */}
        <Section icon="🔗" title="Social Links" />
        <View style={{ gap: 12 }}>
          <View>
            <Text style={labelStyle}>Instagram URL</Text>
            <TextInput style={inputStyle} value={instagramUrl} onChangeText={setInstagramUrl}
              placeholder="https://instagram.com/yourbusiness" placeholderTextColor="#c9b0bc"
              keyboardType="url" autoCapitalize="none" />
          </View>
          <View>
            <Text style={labelStyle}>Facebook URL</Text>
            <TextInput style={inputStyle} value={facebookUrl} onChangeText={setFacebookUrl}
              placeholder="https://facebook.com/yourbusiness" placeholderTextColor="#c9b0bc"
              keyboardType="url" autoCapitalize="none" />
          </View>
        </View>

        {/* ── Price Range ── */}
        <Section icon="💰" title="Price Range" />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>Min (₹)</Text>
            <TextInput style={inputStyle} value={minPrice} onChangeText={setMinPrice}
              placeholder="e.g. 2000" placeholderTextColor="#c9b0bc" keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>Max (₹)</Text>
            <TextInput style={inputStyle} value={maxPrice} onChangeText={setMaxPrice}
              placeholder="e.g. 50000" placeholderTextColor="#c9b0bc" keyboardType="numeric" />
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            backgroundColor: BRAND, borderRadius: 12,
            paddingVertical: 14, alignItems: 'center', marginTop: 20,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator color={GOLD} />
          ) : (
            <Text style={{ color: GOLD, fontWeight: '900', fontSize: 15 }}>💾 Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* ── Services ── */}
        <Section icon="✨" title="My Services" />

        {services.length === 0 ? (
          <Text style={{ color: '#9a7a8a', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
            No services added yet.
          </Text>
        ) : (
          services.map((svc) => {
            const isEditing = editingServiceId === svc._id;
            const isAddingImg = addingImageToId === svc._id;
            return (
              <View key={svc._id} style={{
                borderWidth: 1.5, borderColor: isEditing ? BRAND : '#e8d5de',
                borderRadius: 14, padding: 14, marginBottom: 12, gap: 10,
              }}>

                {/* ── Service images row ── */}
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#9a7a85', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
                    Photos
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {(svc.images ?? []).map(img => (
                      <View key={img._id} style={{ position: 'relative' }}>
                        <Image
                          source={{ uri: img.image.startsWith('http') ? img.image : `https://wedmangal.com${img.image.startsWith('/') ? '' : '/static/images/'}${img.image}` }}
                          style={{ width: 90, height: 90, borderRadius: 8 }}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={() => handleDeleteServiceImage(svc._id, img._id)}
                          style={{ position: 'absolute', top: 3, right: 3, backgroundColor: 'rgba(220,38,38,0.85)', borderRadius: 14, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    {/* Add image slot */}
                    <TouchableOpacity
                      onPress={() => handleAddServiceImage(svc._id)}
                      disabled={isAddingImg}
                      style={{ width: 90, height: 90, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: GOLD2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fdf8f0' }}
                    >
                      {isAddingImg
                        ? <ActivityIndicator size="small" color={BRAND} />
                        : <Text style={{ fontSize: 22 }}>+</Text>}
                    </TouchableOpacity>
                  </ScrollView>
                </View>

                {/* ── View / Edit toggle ── */}
                {!isEditing ? (
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#1a0a12' }}>{svc.name}</Text>
                    {svc.description ? (
                      <Text style={{ fontSize: 12, color: '#7a5a6a' }} numberOfLines={2}>{svc.description}</Text>
                    ) : null}
                    <Text style={{ fontSize: 14, fontWeight: '800', color: BRAND }}>₹{svc.price}</Text>

                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingServiceId(svc._id);
                          setEditForm({ name: String(svc.name), description: String(svc.description ?? ''), price: String(svc.price) });
                        }}
                        style={{ flex: 1, backgroundColor: '#fdf0f6', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: BRAND }}
                      >
                        <Text style={{ color: BRAND, fontWeight: '700', fontSize: 12 }}>✏️ Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteService(svc._id)}
                        style={{ flex: 1, backgroundColor: '#fff5f5', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5' }}
                      >
                        <Text style={{ color: '#dc2626', fontWeight: '700', fontSize: 12 }}>🗑 Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  /* ── Inline edit form ── */
                  <View style={{ gap: 10 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: BRAND }}>Edit Service</Text>
                    <View>
                      <Text style={labelStyle}>Name *</Text>
                      <TextInput
                        style={inputStyle}
                        value={editForm.name}
                        onChangeText={v => setEditForm(p => ({ ...p, name: v }))}
                        placeholder="Service name"
                        placeholderTextColor="#c9b0bc"
                      />
                    </View>
                    <View>
                      <Text style={labelStyle}>Description</Text>
                      <TextInput
                        style={[inputStyle, { minHeight: 70, textAlignVertical: 'top' }]}
                        value={editForm.description}
                        onChangeText={v => setEditForm(p => ({ ...p, description: v }))}
                        placeholder="What's included?"
                        placeholderTextColor="#c9b0bc"
                        multiline numberOfLines={3}
                      />
                    </View>
                    <View>
                      <Text style={labelStyle}>Price (₹) *</Text>
                      <TextInput
                        style={[inputStyle, { maxWidth: 160 }]}
                        value={editForm.price}
                        onChangeText={v => setEditForm(p => ({ ...p, price: v }))}
                        placeholder="e.g. 5000"
                        placeholderTextColor="#c9b0bc"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => setEditingServiceId(null)}
                        style={{ flex: 1, borderWidth: 1.5, borderColor: '#e8d5de', borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
                      >
                        <Text style={{ color: '#7a5a6a', fontWeight: '700', fontSize: 13 }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleUpdateService}
                        disabled={savingService}
                        style={{ flex: 2, backgroundColor: BRAND, borderRadius: 10, paddingVertical: 10, alignItems: 'center', opacity: savingService ? 0.7 : 1 }}
                      >
                        {savingService
                          ? <ActivityIndicator size="small" color={GOLD} />
                          : <Text style={{ color: GOLD, fontWeight: '800', fontSize: 13 }}>💾 Save Service</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* Add service toggle */}
        <TouchableOpacity
          onPress={() => setShowAddService(!showAddService)}
          style={{
            borderWidth: 1.5, borderStyle: 'dashed', borderColor: GOLD2,
            borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 8,
          }}
        >
          <Text style={{ color: GOLD2, fontWeight: '700', fontSize: 14 }}>
            {showAddService ? '✕ Cancel' : '+ Add New Service'}
          </Text>
        </TouchableOpacity>

        {showAddService && (
          <View style={{ borderWidth: 1.5, borderColor: '#e8d5de', borderRadius: 12, padding: 14, marginBottom: 16, gap: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: BRAND }}>New Service</Text>

            <View>
              <Text style={labelStyle}>Service Name *</Text>
              <TextInput style={inputStyle} value={addSvc.name}
                onChangeText={v => setAddSvc(p => ({ ...p, name: v }))}
                placeholder="e.g. Bridal Makeup" placeholderTextColor="#c9b0bc" />
            </View>
            <View>
              <Text style={labelStyle}>Description</Text>
              <TextInput
                style={[inputStyle, { minHeight: 70, textAlignVertical: 'top' }]}
                value={addSvc.description}
                onChangeText={v => setAddSvc(p => ({ ...p, description: v }))}
                placeholder="What's included?" placeholderTextColor="#c9b0bc"
                multiline numberOfLines={3}
              />
            </View>
            <View>
              <Text style={labelStyle}>Price (₹) *</Text>
              <TextInput style={[inputStyle, { maxWidth: 160 }]} value={addSvc.price}
                onChangeText={v => setAddSvc(p => ({ ...p, price: v }))}
                placeholder="e.g. 5000" placeholderTextColor="#c9b0bc" keyboardType="numeric" />
            </View>
            <View>
              <Text style={labelStyle}>Service Image</Text>
              <TouchableOpacity
                onPress={() => pickImage(uri => setAddSvc(p => ({ ...p, imageUri: uri })))}
                style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#e8d5de', borderRadius: 8, padding: 12, alignItems: 'center' }}
              >
                {addSvc.imageUri ? (
                  <Image source={{ uri: addSvc.imageUri }} style={{ width: '100%', height: 110, borderRadius: 6 }} resizeMode="cover" />
                ) : (
                  <Text style={{ color: '#7a5a6a', fontSize: 13 }}>📷 Add photo</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleAddService}
              disabled={addingService}
              style={{
                backgroundColor: BRAND, borderRadius: 10,
                paddingVertical: 12, alignItems: 'center', opacity: addingService ? 0.7 : 1,
              }}
            >
              {addingService ? (
                <ActivityIndicator color={GOLD} />
              ) : (
                <Text style={{ color: GOLD, fontWeight: '800', fontSize: 14 }}>Add Service</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
