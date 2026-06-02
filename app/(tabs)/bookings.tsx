import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

const BRAND = '#5e143f';
const GOLD = '#f9e79f';

interface OrderItem {
  _id: number;
  name: string | null;
  price: string | null;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  image: string | null;
  service: { _id: number; name: string | null } | null;
  product: { _id: number; name: string | null; category: string | null } | null;
}

interface Order {
  _id: number;
  totalPrice: string | null;
  isPaid: boolean;
  isCancelled: boolean;
  markasDone: boolean;
  createdAt: string;
  orderItems: OrderItem[];
  user: { id: number; name: string; email: string };
}

type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled';

function getStatus(o: Order): Status {
  if (o.isCancelled) return 'cancelled';
  if (o.markasDone) return 'completed';
  if (o.isPaid) return 'confirmed';
  return 'pending';
}

const STATUS_COLORS: Record<Status, string> = {
  confirmed: '#22C55E',
  pending: '#F59E0B',
  completed: '#3B82F6',
  cancelled: '#EF4444',
};

const fmtDate = (s: string) =>
  s ? new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const fmtTime = (s: string) => {
  if (!s) return '—';
  const [h, m] = s.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

export default function BookingsScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      apiClient.getMyOrders()
        .then(r => {
          const data = Array.isArray(r.data) ? r.data : r.data?.results ?? [];
          setOrders(data);
        })
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }, [])
  );

  const filtered = orders.filter(o => {
    const s = getStatus(o);
    if (tab === 'upcoming') return s === 'pending' || s === 'confirmed';
    return s === tab;
  });

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16 }}>
        <Text style={{ color: GOLD, fontSize: 22, fontWeight: '800' }}>My Bookings</Text>
        <Text style={{ color: '#f5d0e0', fontSize: 13, marginTop: 2 }}>Track your service bookings</Text>
      </View>

      {/* Tab bar */}
      <View style={{ flexDirection: 'row', backgroundColor: '#fdf8f0', borderBottomWidth: 1, borderBottomColor: '#e8d5de' }}>
        {(['upcoming', 'completed', 'cancelled'] as const).map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1, paddingVertical: 12, alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: tab === t ? BRAND : 'transparent',
            }}
          >
            <Text style={{
              fontSize: 13, fontWeight: '600',
              color: tab === t ? BRAND : '#7a5a6a',
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
          <IconSymbol size={64} name="calendar" color="#e8d5de" />
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a0a12' }}>No {tab} bookings</Text>
          <Text style={{ fontSize: 14, color: '#7a5a6a', textAlign: 'center' }}>
            You don't have any {tab} bookings yet
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/search')}
            style={{ backgroundColor: BRAND, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 30, marginTop: 8 }}
          >
            <Text style={{ color: GOLD, fontWeight: '700', fontSize: 14 }}>Book a Service</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <Text style={{ fontSize: 13, color: '#7a5a6a', fontWeight: '600', marginBottom: 10 }}>
            {filtered.length} booking{filtered.length !== 1 ? 's' : ''}
          </Text>
          {filtered.map(order => {
            const status = getStatus(order);
            const color = STATUS_COLORS[status];
            const item = order.orderItems?.[0];
            const name = item?.service?.name ?? item?.product?.name ?? item?.name ?? 'Wedding Service';
            return (
              <View
                key={order._id}
                style={{
                  backgroundColor: '#fdf8f0', borderRadius: 12, padding: 14,
                  borderWidth: 1, borderColor: '#e8d5de', marginBottom: 12, gap: 10,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1a0a12' }}>{name}</Text>
                    <Text style={{ fontSize: 12, color: '#7a5a6a' }}>Order #{order._id}</Text>
                  </View>
                  <View style={{ backgroundColor: color + '22', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color }}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                  </View>
                </View>

                {item && (
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <IconSymbol size={14} name="calendar" color={BRAND} />
                      <Text style={{ fontSize: 13, color: '#1a0a12' }}>{fmtDate(item.start_date)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <IconSymbol size={14} name="clock" color={BRAND} />
                      <Text style={{ fontSize: 13, color: '#1a0a12' }}>{fmtTime(item.start_time)}</Text>
                    </View>
                  </View>
                )}

                {order.totalPrice && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e8d5de', paddingTop: 8 }}>
                    <Text style={{ fontSize: 13, color: '#7a5a6a' }}>Total</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: BRAND }}>
                      ₹{parseFloat(order.totalPrice).toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}

                {order.orderItems?.length > 1 && (
                  <Text style={{ fontSize: 11, color: '#7a5a6a' }}>
                    +{order.orderItems.length - 1} more service{order.orderItems.length > 2 ? 's' : ''}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
