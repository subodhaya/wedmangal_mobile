import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

const BRAND = '#5e143f';
const GOLD = '#f9e79f';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      { id: 'edit', label: 'Edit Profile', icon: 'pencil', route: null as string | null },
      { id: 'bookings', label: 'My Bookings', icon: 'calendar', route: '/(tabs)/bookings' as string | null },
      { id: 'wishlist', label: 'Wishlist', icon: 'heart.fill', route: '/(tabs)/wishlist' as string | null },
    ],
  },
  {
    title: 'Wedding Tools',
    items: [
      { id: 'budget', label: 'Budget Planner', icon: 'creditcard.fill', route: '/budget' as string | null },
      { id: 'plan', label: 'Wedding Checklist', icon: 'checklist', route: '/plan' as string | null },
      { id: 'available', label: 'Available Today', icon: 'clock.fill', route: '/available-today' as string | null },
      { id: 'blog', label: 'Wedding Blog', icon: 'book.fill', route: '/blog' as string | null },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'help', label: 'Help & FAQ', icon: 'questionmark.circle.fill', route: '/help' as string | null },
      { id: 'terms', label: 'Terms & Conditions', icon: 'doc.fill', route: '/terms' as string | null },
      { id: 'privacy', label: 'Privacy Policy', icon: 'lock.fill', route: '/privacy' as string | null },
      { id: 'about', label: 'About', icon: 'info.circle.fill', route: '/about' as string | null },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      apiClient.getUserProfile()
        .then(r => setProfile(r.data))
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }, [])
  );

  const doLogout = async () => {
    await logout();
    if (Platform.OS === 'web') {
      window.location.href = '/login';
    } else {
      router.replace('/login');
    }
  };

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 }}>
        <Text style={{ color: GOLD, fontSize: 22, fontWeight: '800' }}>Profile</Text>

        {loading ? (
          <View style={{ marginTop: 16, alignItems: 'flex-start' }}>
            <ActivityIndicator color={GOLD} />
          </View>
        ) : profile ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16 }}>
            <View style={{
              width: 60, height: 60, borderRadius: 30,
              backgroundColor: 'rgba(249,231,159,0.25)',
              borderWidth: 2, borderColor: GOLD,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <IconSymbol size={30} name="person.fill" color={GOLD} />
            </View>
            <View style={{ gap: 2 }}>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>{profile.name}</Text>
              <Text style={{ color: '#f5d0e0', fontSize: 13 }}>{profile.email}</Text>
              {profile.role && (
                <View style={{ backgroundColor: GOLD, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 2 }}>
                  <Text style={{ color: BRAND, fontSize: 10, fontWeight: '700', textTransform: 'capitalize' }}>{profile.role}</Text>
                </View>
              )}
            </View>
          </View>
        ) : null}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 20 }}>
        {MENU_SECTIONS.map(section => (
          <View key={section.title} style={{ gap: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#7a5a6a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
              {section.title}
            </Text>
            <View style={{ backgroundColor: '#fdf8f0', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e8d5de' }}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => item.route && router.push(item.route as any)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', padding: 14,
                    borderBottomWidth: idx < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: '#e8d5de',
                  }}
                >
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#f5e4ec', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <IconSymbol size={16} name={item.icon as any} color={BRAND} />
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: '#1a0a12' }}>{item.label}</Text>
                  <IconSymbol size={14} name="chevron.right" color="#c9b0bc" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Vendor dashboard — only for service-owner role */}
        {profile?.role === 'service-owner' && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#7a5a6a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
              Vendor Dashboard
            </Text>
            <View style={{ backgroundColor: '#fdf8f0', borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: BRAND }}>
              {[
                { id: 'add', label: 'Register My Business', icon: 'plus', route: '/add-product' },
                { id: 'manage', label: 'Manage My Page', icon: 'pencil', route: '/manage-page' },
              ].map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(item.route as any)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', padding: 14,
                    borderBottomWidth: idx === 0 ? 1 : 0, borderBottomColor: '#e8d5de',
                  }}
                >
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#f5e4ec', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <IconSymbol size={16} name={item.icon as any} color={BRAND} />
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: BRAND }}>{item.label}</Text>
                  <IconSymbol size={14} name="chevron.right" color={BRAND} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Logout */}
        {confirmLogout ? (
          <View style={{ borderRadius: 12, borderWidth: 1, borderColor: '#fecaca', overflow: 'hidden' }}>
            <Text style={{ textAlign: 'center', padding: 12, fontSize: 13, color: '#7a5a6a', backgroundColor: '#fff5f5' }}>
              Are you sure you want to logout?
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={() => setConfirmLogout(false)}
                style={{ flex: 1, padding: 13, alignItems: 'center', borderTopWidth: 1, borderRightWidth: 0.5, borderColor: '#fecaca' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#7a5a6a' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={doLogout}
                style={{ flex: 1, padding: 13, alignItems: 'center', borderTopWidth: 1, borderLeftWidth: 0.5, borderColor: '#fecaca', backgroundColor: '#fff5f5' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#EF4444' }}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setConfirmLogout(true)}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              backgroundColor: '#fff5f5', borderRadius: 12, padding: 14,
              borderWidth: 1, borderColor: '#fecaca',
            }}
          >
            <IconSymbol size={18} name="arrowshape.left.fill" color="#EF4444" />
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#EF4444' }}>Logout</Text>
          </TouchableOpacity>
        )}

        <View style={{ alignItems: 'center', gap: 4, paddingBottom: 8 }}>
          <Text style={{ fontSize: 11, color: '#c9b0bc' }}>WedMangal v1.0.0</Text>
          <Text style={{ fontSize: 11, color: '#c9b0bc' }}>© 2026 WedMangal. All rights reserved.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
