import {
  ScrollView, Text, View, TouchableOpacity, ActivityIndicator,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

const BRAND = '#5e143f';
const GOLD = '#f9e79f';
const GOLD2 = '#c9973a';

interface OrderItem {
  _id: number;
  name: string | null;
  price: string | null;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  service: { _id: number; name: string | null } | null;
  product: { _id: number; name: string | null; category: string | null } | null;
}

interface Order {
  _id: number;
  totalPrice: string | null;
  isPaid: boolean;
  isDelivered: boolean;
  isCancelled: boolean;
  markasDone: boolean;
  createdAt: string;
  paidAt?: string;
  deliveredAt?: string;
  orderItems: OrderItem[];
}

type FilterKey = 'all' | 'pending' | 'paid' | 'completed';

const FILTERS: { key: FilterKey; label: string; icon: string }[] = [
  { key: 'all',       label: 'All',       icon: '📦' },
  { key: 'pending',   label: 'Pending',   icon: '⏳' },
  { key: 'paid',      label: 'Paid',      icon: '💰' },
  { key: 'completed', label: 'Completed', icon: '✅' },
];

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const fmtTime = (s?: string) => {
  if (!s) return '';
  const [h, m] = s.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

const getBandColor = (o: Order) => {
  if (o.isDelivered || o.markasDone) return '#22C55E';
  if (!o.isPaid) return '#EF4444';
  return GOLD2;
};

const getStatusBadge = (o: Order): { label: string; color: string; bg: string } => {
  if (o.isDelivered || o.markasDone) return { label: '✅ Completed', color: '#16a34a', bg: '#dcfce7' };
  if (o.isPaid) return { label: '💰 Paid', color: '#92400e', bg: '#fef3c7' };
  return { label: '⏳ Pending', color: '#991b1b', bg: '#fee2e2' };
};

export default function BookingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar'>('bookings');
  const [togglingPaid, setTogglingPaid] = useState<number | null>(null);
  const [togglingDone, setTogglingDone] = useState<number | null>(null);

  const isVendor = (user as any)?.role === 'service-owner';

  const loadOrders = useCallback(() => {
    setLoading(true);
    apiClient.getMyOrders()
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : r.data?.results ?? [];
        setOrders(data);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(loadOrders);

  const filtered = orders.filter(o => {
    if (filter === 'paid')      return o.isPaid && !(o.isDelivered || o.markasDone);
    if (filter === 'completed') return o.isDelivered || o.markasDone;
    if (filter === 'pending')   return !o.isPaid;
    return true;
  });

  const totalSpent = orders.reduce((s, o) => s + (parseFloat(o.totalPrice ?? '0') || 0), 0);
  const paidCount  = orders.filter(o => o.isPaid).length;
  const doneCount  = orders.filter(o => o.isDelivered || o.markasDone).length;
  const pendCount  = orders.filter(o => !o.isPaid).length;

  const handleTogglePaid = async (orderId: number, current: boolean) => {
    setTogglingPaid(orderId);
    try {
      await apiClient.updateOrderToPaid(orderId);
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, isPaid: !current, paidAt: !current ? new Date().toISOString() : undefined } : o
      ));
    } catch {
      Alert.alert('Error', 'Could not update payment status.');
    } finally {
      setTogglingPaid(null);
    }
  };

  const handleToggleDone = async (orderId: number, current: boolean) => {
    setTogglingDone(orderId);
    try {
      await apiClient.updateOrderToDelivered(orderId);
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, isDelivered: !current, deliveredAt: !current ? new Date().toISOString() : undefined } : o
      ));
    } catch {
      Alert.alert('Error', 'Could not update completion status.');
    } finally {
      setTogglingDone(null);
    }
  };

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: GOLD, fontSize: 22, fontWeight: '800' }}>My Appointments</Text>
            <Text style={{ color: '#f5d0e0', fontSize: 13, marginTop: 2 }}>
              {loading ? 'Loading…' : `${orders.length} booking${orders.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Vendor tab switcher */}
      {isVendor && (
        <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e8d5de' }}>
          {[
            { key: 'bookings', label: '📋 My Bookings' },
            { key: 'calendar', label: '📅 Calendar' },
          ].map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setActiveTab(t.key as any)}
              style={{
                flex: 1, paddingVertical: 13, alignItems: 'center',
                borderBottomWidth: 2.5,
                borderBottomColor: activeTab === t.key ? BRAND : 'transparent',
                backgroundColor: activeTab === t.key ? '#fdf8f0' : '#fff',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: activeTab === t.key ? BRAND : '#9a7a85' }}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Calendar tab */}
      {activeTab === 'calendar' && isVendor ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
          <Text style={{ fontSize: 36 }}>📅</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: BRAND }}>Availability Calendar</Text>
          <Text style={{ fontSize: 13, color: '#7a5a6a', textAlign: 'center' }}>
            Manage your blocked dates and see customer bookings
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/vendor-calendar' as any)}
            style={{ backgroundColor: BRAND, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12, marginTop: 8 }}
          >
            <Text style={{ color: GOLD, fontWeight: '800', fontSize: 14 }}>Open Full Calendar →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Stats row */}
          {!loading && orders.length > 0 && (
            <ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 10, gap: 10 }}
              style={{ backgroundColor: '#fdf8f0', borderBottomWidth: 1, borderBottomColor: '#e8d5de', maxHeight: 80 }}
            >
              {[
                { icon: '📦', num: orders.length,   label: 'Total',     bg: 'rgba(94,20,63,0.08)' },
                { icon: '⏳', num: pendCount,        label: 'Pending',   bg: 'rgba(239,68,68,0.08)' },
                { icon: '💰', num: paidCount,        label: 'Paid',      bg: 'rgba(212,168,67,0.12)' },
                { icon: '✅', num: doneCount,        label: 'Completed', bg: 'rgba(34,197,94,0.10)' },
                { icon: '💸', num: `₹${totalSpent.toLocaleString('en-IN')}`, label: 'Spent', bg: 'rgba(94,20,63,0.08)' },
              ].map(stat => (
                <View key={stat.label} style={{
                  backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  borderWidth: 1, borderColor: '#e8d5de', minWidth: 90,
                }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: stat.bg, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 14 }}>{stat.icon}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: BRAND }}>{stat.num}</Text>
                    <Text style={{ fontSize: 10, color: '#9a7a85', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 }}>{stat.label}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Filter pills */}
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 10, gap: 8 }}
            style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e8d5de', maxHeight: 52 }}
          >
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                  backgroundColor: filter === f.key ? BRAND : '#fdf8f0',
                  borderWidth: 1.5, borderColor: filter === f.key ? BRAND : '#e8d5de',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: filter === f.key ? GOLD : '#7a5a6a' }}>
                  {f.icon} {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={BRAND} />
            </View>
          ) : filtered.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
              <Text style={{ fontSize: 44 }}>📋</Text>
              <Text style={{ fontSize: 17, fontWeight: '800', color: BRAND }}>
                {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
              </Text>
              <Text style={{ fontSize: 13, color: '#7a5a6a', textAlign: 'center' }}>
                {filter === 'all'
                  ? "You haven't made any bookings yet. Find your dream wedding vendors!"
                  : `No bookings match the "${filter}" filter.`}
              </Text>
              {filter === 'all' && (
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/search')}
                  style={{ backgroundColor: BRAND, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 30, marginTop: 4 }}
                >
                  <Text style={{ color: GOLD, fontWeight: '700', fontSize: 14 }}>✨ Explore Vendors</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
              {filtered.map(order => {
                const badge = getStatusBadge(order);
                const bandColor = getBandColor(order);
                const item = order.orderItems?.[0];
                const isPaying = togglingPaid === order._id;
                const isDoning = togglingDone === order._id;

                return (
                  <View key={order._id} style={{
                    backgroundColor: '#fff', borderRadius: 16, marginBottom: 14,
                    borderWidth: 1, borderColor: '#e8d5de', overflow: 'hidden',
                    elevation: 2, shadowColor: BRAND, shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
                  }}>
                    {/* Color band */}
                    <View style={{ height: 4, backgroundColor: bandColor }} />

                    <View style={{ padding: 14, gap: 10 }}>
                      {/* ID + badge */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ gap: 2 }}>
                          <View style={{ backgroundColor: 'rgba(94,20,63,0.07)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' }}>
                            <Text style={{ fontSize: 10, fontFamily: 'monospace', color: BRAND }}>
                              #{String(order._id).slice(-8).toUpperCase()}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 11, color: '#9a7a85' }}>
                            📅 {fmtDate(order.createdAt)}
                          </Text>
                        </View>
                        <View style={{ backgroundColor: badge.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: badge.color }}>{badge.label}</Text>
                        </View>
                      </View>

                      {/* Services */}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {order.orderItems.slice(0, 2).map(it => (
                          <View key={it._id} style={{ backgroundColor: '#fdf0f6', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#e8d5de' }}>
                            <Text style={{ fontSize: 12, color: '#5a3a45' }}>
                              ✨ {it.service?.name ?? it.product?.name ?? it.name ?? 'Service'}
                            </Text>
                          </View>
                        ))}
                        {order.orderItems.length > 2 && (
                          <View style={{ backgroundColor: '#f5e4ec', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                            <Text style={{ fontSize: 12, color: BRAND }}>+{order.orderItems.length - 2} more</Text>
                          </View>
                        )}
                      </View>

                      {/* Info row */}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(232,213,222,0.5)' }}>
                        <View>
                          <Text style={{ fontSize: 10, color: '#9a7a85', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 }}>Total</Text>
                          <Text style={{ fontSize: 16, fontWeight: '800', color: BRAND }}>
                            ₹{parseFloat(order.totalPrice ?? '0').toLocaleString('en-IN')}
                          </Text>
                        </View>
                        {item?.start_date && (
                          <View>
                            <Text style={{ fontSize: 10, color: '#9a7a85', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 }}>Event Date</Text>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#2a1a1f' }}>
                              📅 {fmtDate(item.start_date)}
                            </Text>
                          </View>
                        )}
                        {item?.start_time && (
                          <View>
                            <Text style={{ fontSize: 10, color: '#9a7a85', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 }}>Time</Text>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#2a1a1f' }}>
                              {fmtTime(item.start_time)}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Action buttons */}
                      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                        <TouchableOpacity
                          onPress={() => handleTogglePaid(order._id, order.isPaid)}
                          disabled={isPaying || isDoning}
                          style={{
                            flex: 1, paddingVertical: 9, borderRadius: 30, alignItems: 'center', justifyContent: 'center',
                            backgroundColor: order.isPaid ? 'rgba(34,197,94,0.10)' : '#22C55E',
                            borderWidth: 1.5,
                            borderColor: order.isPaid ? 'rgba(34,197,94,0.28)' : 'transparent',
                            opacity: isPaying ? 0.65 : 1,
                          }}
                        >
                          {isPaying ? (
                            <ActivityIndicator size="small" color={order.isPaid ? '#16a34a' : '#fff'} />
                          ) : (
                            <Text style={{ fontSize: 12, fontWeight: '700', color: order.isPaid ? '#16a34a' : '#fff' }}>
                              {order.isPaid ? '✓ Paid' : '✓ Mark Paid'}
                            </Text>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleToggleDone(order._id, order.isDelivered || order.markasDone)}
                          disabled={isPaying || isDoning}
                          style={{
                            flex: 1, paddingVertical: 9, borderRadius: 30, alignItems: 'center', justifyContent: 'center',
                            backgroundColor: (order.isDelivered || order.markasDone) ? 'rgba(94,20,63,0.08)' : BRAND,
                            borderWidth: 1.5,
                            borderColor: (order.isDelivered || order.markasDone) ? 'rgba(94,20,63,0.2)' : 'transparent',
                            opacity: isDoning ? 0.65 : 1,
                          }}
                        >
                          {isDoning ? (
                            <ActivityIndicator size="small" color={(order.isDelivered || order.markasDone) ? BRAND : GOLD} />
                          ) : (
                            <Text style={{ fontSize: 12, fontWeight: '700', color: (order.isDelivered || order.markasDone) ? BRAND : GOLD }}>
                              {(order.isDelivered || order.markasDone) ? '✅ Done' : '✅ Mark Done'}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </>
      )}
    </ScreenContainer>
  );
}
