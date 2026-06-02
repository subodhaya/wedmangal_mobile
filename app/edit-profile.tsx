import {
  ScrollView, Text, View, TouchableOpacity, TextInput,
  ActivityIndicator, Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

const BRAND = '#5e143f';
const GOLD_TEXT = '#f9e79f';

export default function EditProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');

  useEffect(() => {
    apiClient.getUserProfile()
      .then(r => { setName(r.data.name ?? ''); setEmail(r.data.email ?? ''); })
      .catch(() => setError('Could not load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const inputStyle = (field: string) => ({
    backgroundColor: '#fdf8f0',
    borderWidth: 1.5,
    borderColor: focused === field ? BRAND : '#e8d5de',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1a0a12',
  } as const);

  const labelStyle = { fontSize: 12, fontWeight: '700' as const, color: '#9a7a85', textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 6 };

  const handleSave = async () => {
    if (password && password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setSaving(true);
    setError('');
    setMsg('');
    try {
      await apiClient.updateUserProfile({
        name,
        email,
        username: email,
        ...(password ? { password } : {}),
      });
      setMsg('Profile updated successfully ✓');
      setPassword('');
      setConfirm('');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer containerClassName="bg-white">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <IconSymbol size={20} name="chevron.left" color={GOLD_TEXT} />
          <Text style={{ color: GOLD_TEXT, fontSize: 14 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: GOLD_TEXT, fontSize: 24, fontWeight: '900' }}>👤 Edit Profile</Text>
        <Text style={{ color: '#f5d0e0', fontSize: 13, marginTop: 2 }}>Update your name, email or password</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        {msg ? (
          <View style={{ backgroundColor: '#f0fdf4', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#86efac' }}>
            <Text style={{ color: '#16a34a', fontWeight: '700' }}>{msg}</Text>
          </View>
        ) : null}
        {error ? (
          <View style={{ backgroundColor: '#fff5f5', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#fca5a5' }}>
            <Text style={{ color: '#dc2626', fontWeight: '600' }}>{error}</Text>
          </View>
        ) : null}

        {/* Name */}
        <View>
          <Text style={labelStyle}>Full Name</Text>
          <TextInput
            style={inputStyle('name')}
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor="#c9b0bc"
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused('')}
          />
        </View>

        {/* Email */}
        <View>
          <Text style={labelStyle}>Email Address</Text>
          <TextInput
            style={inputStyle('email')}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor="#c9b0bc"
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused('')}
          />
        </View>

        {/* Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#e8d5de' }} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#c9b0bc', textTransform: 'uppercase', letterSpacing: 0.5 }}>Change Password</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: '#e8d5de' }} />
        </View>

        {/* New password */}
        <View>
          <Text style={labelStyle}>New Password</Text>
          <TextInput
            style={inputStyle('password')}
            value={password}
            onChangeText={setPassword}
            placeholder="Leave blank to keep current"
            placeholderTextColor="#c9b0bc"
            secureTextEntry
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused('')}
          />
        </View>

        {/* Confirm */}
        <View>
          <Text style={labelStyle}>Confirm Password</Text>
          <TextInput
            style={{
              ...inputStyle('confirm'),
              borderColor: confirm && password !== confirm ? '#ef4444'
                : confirm && password === confirm ? '#22c55e'
                : focused === 'confirm' ? BRAND : '#e8d5de',
            }}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Confirm new password"
            placeholderTextColor="#c9b0bc"
            secureTextEntry
            onFocus={() => setFocused('confirm')}
            onBlur={() => setFocused('')}
          />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{ backgroundColor: BRAND, borderRadius: 14, paddingVertical: 15, alignItems: 'center', opacity: saving ? 0.7 : 1, marginTop: 4 }}
        >
          {saving ? (
            <ActivityIndicator color={GOLD_TEXT} />
          ) : (
            <Text style={{ color: GOLD_TEXT, fontWeight: '800', fontSize: 15 }}>✓ Save Changes</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
