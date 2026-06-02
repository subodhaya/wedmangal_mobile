import {
  ScrollView, Text, View, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const BRAND = '#5e143f';
const GOLD = '#f9e79f';

export default function SignUpScreen() {
  const router = useRouter();
  const { setAuthData } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
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
      const response = await apiClient.signup({ name: name.trim(), email: email.trim(), password });
      const { access, refresh, user } = response.data;
      await setAuthData({ access, refresh, user });
      router.replace('/(tabs)');
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
          <Text style={{ fontSize: 28, color: GOLD }}>💍</Text>
          <Text style={{ fontSize: 24, fontWeight: '900', color: GOLD, letterSpacing: 1 }}>WedMangal</Text>
          <Text style={{ fontSize: 13, color: '#f5d0e0' }}>Create your account</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 24, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: 22, fontWeight: '800', color: BRAND }}>Register</Text>

          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#1a0a12' }}>Full Name</Text>
            <TextInput
              style={inputStyle}
              placeholder="Your name"
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

          {/* Register button */}
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
              <Text style={{ color: GOLD, fontWeight: '800', fontSize: 16 }}>Register</Text>
            )}
          </TouchableOpacity>

          {/* Back to login */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 }}>
            <Text style={{ fontSize: 14, color: '#7a5a6a' }}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={{ fontSize: 14, color: BRAND, fontWeight: '700' }}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
