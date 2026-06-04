import {
  ScrollView, Text, View, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const BRAND = '#5e143f';
const GOLD = '#f9e79f';
const GOOGLE_CLIENT_ID = '729274233685-h48vkscuohkqt32n8o72ifik06g2cv0d.apps.googleusercontent.com';

const redirectUri = Platform.OS === 'web'
  ? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081')
  : makeRedirectUri({ scheme: 'manus20260505133231' });

export default function LoginScreen() {
  const router = useRouter();
  const { setAuthData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params?.id_token;
      if (idToken) handleGoogleToken(idToken);
    }
  }, [response]);

  // After login: service-owners always go to add-product; customers → home tabs
  const routeAfterLogin = (userData: any) => {
    if (userData?.role === 'service-owner') {
      router.replace('/add-product' as any);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleGoogleToken = async (idToken: string) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await apiClient.googleLogin(idToken);
      const data = res.data;
      const userData = data.user ?? {
        id: data.id ?? data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
      };
      await setAuthData({ access: data.access, refresh: data.refresh, user: userData });
      routeAfterLogin(userData);
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiClient.loginWithJWT(email.trim(), password);
      const data = res.data;
      // Backend may return user nested or flat at top level
      const userData = data.user ?? {
        id: data.id ?? data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
      };
      await setAuthData({ access: data.access, refresh: data.refresh, user: userData });
      routeAfterLogin(userData);
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Top maroon section */}
        <View style={{
          backgroundColor: BRAND, paddingTop: 60, paddingBottom: 40,
          paddingHorizontal: 28, alignItems: 'center', gap: 8,
        }}>
          {/* Home link */}
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={{ position: 'absolute', top: 20, left: 20, padding: 8 }}
          >
            <Text style={{ color: GOLD, fontSize: 14, fontWeight: '600' }}>← Home</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 36, color: GOLD }}>💍</Text>
          <Text style={{ fontSize: 30, fontWeight: '900', color: GOLD, letterSpacing: 1 }}>WedMangal</Text>
          <Text style={{ fontSize: 14, color: '#f5d0e0', marginTop: 2 }}>Book your celebration services</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 24, gap: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: 22, fontWeight: '800', color: BRAND }}>Sign In</Text>

          {/* Google Sign In */}
          <TouchableOpacity
            onPress={() => promptAsync()}
            disabled={!request || submitting}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#ffffff', borderRadius: 12, paddingVertical: 13,
              borderWidth: 1.5, borderColor: '#e8d5de', gap: 10,
              opacity: (!request || submitting) ? 0.6 : 1,
            }}
          >
            <Text style={{ fontSize: 18 }}>G</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1a0a12' }}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e8d5de' }} />
            <Text style={{ fontSize: 12, color: '#7a5a6a' }}>or sign in with email</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#e8d5de' }} />
          </View>

          {/* Email */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#1a0a12' }}>Email</Text>
            <TextInput
              style={{
                backgroundColor: '#fdf8f0', borderWidth: 1, borderColor: '#e8d5de',
                borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
                fontSize: 14, color: '#1a0a12',
              }}
              placeholder="you@example.com"
              placeholderTextColor="#c9b0bc"
              value={email}
              onChangeText={setEmail}
              editable={!submitting}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#1a0a12' }}>Password</Text>
            <TextInput
              style={{
                backgroundColor: '#fdf8f0', borderWidth: 1, borderColor: '#e8d5de',
                borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
                fontSize: 14, color: '#1a0a12',
              }}
              placeholder="••••••••"
              placeholderTextColor="#c9b0bc"
              value={password}
              onChangeText={setPassword}
              editable={!submitting}
              secureTextEntry
            />
          </View>

          {error ? (
            <Text style={{ fontSize: 13, color: '#EF4444', fontWeight: '500' }}>{error}</Text>
          ) : null}

          {/* Sign In button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={submitting}
            style={{
              backgroundColor: BRAND, borderRadius: 12,
              paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator color={GOLD} />
            ) : (
              <Text style={{ color: GOLD, fontWeight: '800', fontSize: 16 }}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Create account */}
          <TouchableOpacity
            onPress={() => router.push('/signup')}
            style={{
              borderRadius: 12, paddingVertical: 13, alignItems: 'center',
              borderWidth: 2, borderColor: BRAND,
            }}
          >
            <Text style={{ color: BRAND, fontWeight: '700', fontSize: 15 }}>Create Account</Text>
          </TouchableOpacity>

          {/* Register as Vendor */}
          <TouchableOpacity
            onPress={() => router.push('/owner-signup' as any)}
            style={{ alignItems: 'center', paddingVertical: 10 }}
          >
            <Text style={{ fontSize: 13, color: '#7a5a6a' }}>
              Are you a vendor?{' '}
              <Text style={{ color: BRAND, fontWeight: '700' }}>Register your business →</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
