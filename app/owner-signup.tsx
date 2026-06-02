import {
  ScrollView, Text, View, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "expo-router";
import { useState } from "react";

const BRAND = '#5e143f';
const GOLD = '#f9e79f';

export default function OwnerSignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.ownerRegister({ name: name.trim(), email: email.trim(), password });
      setSuccess(true);
      setTimeout(() => router.replace('/login'), 2500);
    } catch {
      setError('Registration failed. Email may already be in use.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#fdf8f0', borderWidth: 1, borderColor: '#e8d5de',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, color: '#1a0a12',
  } as const;

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Top brand section */}
        <View style={{
          backgroundColor: BRAND, paddingTop: 60, paddingBottom: 32,
          paddingHorizontal: 28, alignItems: 'center', gap: 6,
        }}>
          {/* Back link */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ position: 'absolute', top: 20, left: 20, padding: 8 }}
          >
            <Text style={{ color: GOLD, fontSize: 14, fontWeight: '600' }}>← Back</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 28, color: GOLD }}>🏪</Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: GOLD, letterSpacing: 1 }}>WedMangal</Text>
          <Text style={{ fontSize: 13, color: '#f5d0e0' }}>Register your business</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 24, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: BRAND }}>Service Provider Sign Up</Text>
            <Text style={{ fontSize: 13, color: '#7a5a6a' }}>
              Create a vendor account to list your wedding services on WedMangal.
            </Text>
          </View>

          {success ? (
            <View style={{
              backgroundColor: '#f0fdf4', borderWidth: 1.5, borderColor: '#86efac',
              borderRadius: 12, padding: 16, alignItems: 'center', gap: 8,
            }}>
              <Text style={{ fontSize: 20 }}>🎉</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#166534' }}>Registered successfully!</Text>
              <Text style={{ fontSize: 13, color: '#166534', textAlign: 'center' }}>
                Redirecting you to sign in…
              </Text>
            </View>
          ) : (
            <>
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#1a0a12' }}>Full Name</Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Your name or business name"
                  placeholderTextColor="#c9b0bc"
                  value={name}
                  onChangeText={setName}
                  editable={!submitting}
                />
              </View>

              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#1a0a12' }}>Email</Text>
                <TextInput
                  style={inputStyle}
                  placeholder="you@example.com"
                  placeholderTextColor="#c9b0bc"
                  value={email}
                  onChangeText={setEmail}
                  editable={!submitting}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#1a0a12' }}>Password</Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#c9b0bc"
                  value={password}
                  onChangeText={setPassword}
                  editable={!submitting}
                  secureTextEntry
                />
              </View>

              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#1a0a12' }}>Confirm Password</Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Re-enter password"
                  placeholderTextColor="#c9b0bc"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!submitting}
                  secureTextEntry
                />
              </View>

              {error ? (
                <Text style={{ fontSize: 13, color: '#EF4444', fontWeight: '500' }}>{error}</Text>
              ) : null}

              <TouchableOpacity
                onPress={handleRegister}
                disabled={submitting}
                style={{
                  backgroundColor: BRAND, borderRadius: 12,
                  paddingVertical: 14, alignItems: 'center',
                  opacity: submitting ? 0.7 : 1, marginTop: 4,
                }}
              >
                {submitting ? (
                  <ActivityIndicator color={GOLD} />
                ) : (
                  <Text style={{ color: GOLD, fontWeight: '800', fontSize: 16 }}>Register as Vendor</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Back to login */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 }}>
            <Text style={{ fontSize: 14, color: '#7a5a6a' }}>Have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={{ fontSize: 14, color: BRAND, fontWeight: '700' }}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
