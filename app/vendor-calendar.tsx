import {
  ScrollView, Text, View, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, Modal, Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import DateTimePicker from "@react-native-community/datetimepicker";

const BRAND = '#5e143f';
const GOLD = '#f9e79f';
const GOLD2 = '#c9973a';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

interface BlockedDate {
  _id: number;
  date: string;
  reason: string;
}

const toDateStr = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const todayStr = () => {
  const t = new Date();
  return toDateStr(t.getFullYear(), t.getMonth(), t.getDate());
};

export default function VendorCalendarScreen() {
  const router = useRouter();
  const [viewDate, setViewDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  const TODAY = todayStr();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.getVendorCalendar();
      setBookedDates(data.booked_dates ?? []);
      setBlockedDates(data.unavailable_dates ?? []);
    } catch {
      setError('Could not load calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  const handleBlock = async () => {
    if (!selectedDate) { Alert.alert('Select a date first'); return; }
    if (bookedDates.includes(selectedDate)) {
      Alert.alert('Cannot block', 'This date has a customer booking and cannot be blocked.');
      return;
    }
    setSaving(true);
    try {
      await apiClient.blockCalendarDate({ date: selectedDate, reason: blockReason || 'Unavailable' });
      setBlockReason('');
      await fetchCalendar();
    } catch {
      Alert.alert('Error', 'Could not block date. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = (id: number) => {
    Alert.alert('Unblock Date', 'Remove this blocked date?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unblock', style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.unblockCalendarDate(id);
            await fetchCalendar();
          } catch {
            Alert.alert('Error', 'Could not unblock date.');
          }
        },
      },
    ]);
  };

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isBooked = (d: string) => bookedDates.includes(d);
  const blockedObj = (d: string) => blockedDates.find(b => b.date === d);
  const isBlocked = (d: string) => !!blockedObj(d);
  const isPast = (d: string) => d < TODAY;

  const getCellStyle = (dateStr: string): { bg: string; text: string; border: string } => {
    if (dateStr === selectedDate) return { bg: BRAND, text: GOLD, border: BRAND };
    if (isBooked(dateStr))        return { bg: 'rgba(34,197,94,0.15)', text: '#16a34a', border: 'rgba(34,197,94,0.4)' };
    if (isBlocked(dateStr))       return { bg: 'rgba(239,68,68,0.12)', text: '#dc2626', border: 'rgba(239,68,68,0.35)' };
    if (isPast(dateStr))          return { bg: 'transparent', text: '#c9b0bc', border: 'transparent' };
    return { bg: '#fdf8f0', text: '#1a0a12', border: '#e8d5de' };
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedBooked = selectedDate ? isBooked(selectedDate) : false;
  const selectedBlocked = selectedDate ? blockedObj(selectedDate) : null;

  const handlePickerDate = (date: Date) => {
    const str = toDateStr(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDate(str);
    setShowPicker(false);
  };

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <IconSymbol size={20} name="chevron.left" color={GOLD} />
          <Text style={{ color: GOLD, fontSize: 14 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: GOLD, fontSize: 22, fontWeight: '900' }}>📅 Availability Calendar</Text>
        <Text style={{ color: '#f5d0e0', fontSize: 13, marginTop: 2 }}>Manage your booked and blocked dates</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
          {error ? (
            <View style={{ margin: 16, backgroundColor: '#fff5f5', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#fca5a5' }}>
              <Text style={{ color: '#dc2626', fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          {/* Calendar card */}
          <View style={{ margin: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e8d5de', overflow: 'hidden' }}>
            {/* Month nav */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fdf8f0', borderBottomWidth: 1, borderBottomColor: '#e8d5de' }}>
              <TouchableOpacity onPress={prevMonth} style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: '#e8d5de', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                <Text style={{ color: BRAND, fontWeight: '700' }}>‹</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 16, fontWeight: '800', color: BRAND }}>{MONTHS[month]} {year}</Text>
              <TouchableOpacity onPress={nextMonth} style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: '#e8d5de', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                <Text style={{ color: BRAND, fontWeight: '700' }}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Weekday headers */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingTop: 10 }}>
              {WEEKDAYS.map(w => (
                <Text key={w} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: '#9a7a85', textTransform: 'uppercase' }}>{w}</Text>
              ))}
            </View>

            {/* Day cells */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8 }}>
              {cells.map((day, idx) => {
                if (!day) return <View key={`e${idx}`} style={{ width: '14.28%', aspectRatio: 1 }} />;
                const dateStr = toDateStr(year, month, day);
                const isToday = dateStr === TODAY;
                const cs = getCellStyle(dateStr);
                return (
                  <TouchableOpacity
                    key={dateStr}
                    onPress={() => {
                      if (!isPast(dateStr) || isBooked(dateStr)) {
                        setSelectedDate(selectedDate === dateStr ? null : dateStr);
                      }
                    }}
                    style={{
                      width: '14.28%', aspectRatio: 1, padding: 2,
                    }}
                    activeOpacity={isPast(dateStr) ? 1 : 0.8}
                  >
                    <View style={{
                      flex: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: cs.bg,
                      borderWidth: isToday && dateStr !== selectedDate ? 2 : 1,
                      borderColor: isToday && dateStr !== selectedDate ? BRAND : cs.border,
                    }}>
                      <Text style={{ fontSize: 12, fontWeight: isToday ? '900' : '500', color: cs.text }}>{day}</Text>
                      {isBooked(dateStr) && (
                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: GOLD2, position: 'absolute', bottom: 3 }} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Legend */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 12, borderTopWidth: 1, borderTopColor: '#e8d5de' }}>
              {[
                { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)',  label: 'Customer Booked' },
                { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', label: 'Blocked by You' },
                { bg: '#fdf8f0',              border: '#e8d5de',               label: 'Available' },
                { bg: BRAND,                  border: BRAND,                   label: 'Selected' },
              ].map(l => (
                <View key={l.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: l.bg, borderWidth: 1, borderColor: l.border }} />
                  <Text style={{ fontSize: 10, color: '#5a3a45' }}>{l.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Selected date info */}
          {selectedDate && (
            <View style={{ marginHorizontal: 16, backgroundColor: '#fdf8f0', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e8d5de', marginBottom: 12, gap: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: BRAND }}>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
              {selectedBooked && (
                <Text style={{ fontSize: 13, color: '#16a34a' }}>🔴 This date has a customer booking — cannot be blocked.</Text>
              )}
              {selectedBlocked && (
                <Text style={{ fontSize: 13, color: '#dc2626' }}>🚫 Blocked — Reason: {selectedBlocked.reason}</Text>
              )}
              {!selectedBooked && !selectedBlocked && (
                <Text style={{ fontSize: 13, color: '#16a34a' }}>✅ Available for bookings</Text>
              )}
            </View>
          )}

          {/* Block date panel */}
          <View style={{ marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e8d5de', gap: 12, marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: BRAND }}>🚫 Block a Date</Text>

            {/* Date selector */}
            <TouchableOpacity
              onPress={() => { setPickerDate(selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date()); setShowPicker(true); }}
              style={{ borderWidth: 1.5, borderColor: '#e8d5de', borderRadius: 10, padding: 12, backgroundColor: '#fdf8f0' }}
            >
              <Text style={{ fontSize: 14, color: selectedDate ? '#1a0a12' : '#c9b0bc' }}>
                {selectedDate
                  ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Select date to block…'}
              </Text>
            </TouchableOpacity>

            <TextInput
              value={blockReason}
              onChangeText={setBlockReason}
              placeholder="Reason (optional) — e.g. Holiday, Personal leave"
              placeholderTextColor="#c9b0bc"
              style={{ borderWidth: 1.5, borderColor: '#e8d5de', borderRadius: 10, padding: 12, fontSize: 14, color: '#1a0a12', backgroundColor: '#fdf8f0' }}
            />

            <TouchableOpacity
              onPress={handleBlock}
              disabled={!selectedDate || saving || selectedBooked}
              style={{
                backgroundColor: BRAND, borderRadius: 10, paddingVertical: 12, alignItems: 'center',
                opacity: (!selectedDate || saving || selectedBooked) ? 0.5 : 1,
              }}
            >
              {saving ? <ActivityIndicator color={GOLD} /> : (
                <Text style={{ color: GOLD, fontWeight: '800', fontSize: 14 }}>🚫 Block This Date</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Currently blocked dates */}
          {blockedDates.length > 0 && (
            <View style={{ marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e8d5de', gap: 10, marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: BRAND }}>Currently Blocked ({blockedDates.length})</Text>
              {blockedDates.map(b => (
                <View key={b._id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(239,68,68,0.05)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)' }}>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#dc2626' }}>
                      {new Date(b.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#f87171' }}>{b.reason}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleUnblock(b._id)}
                    style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#dc2626' }}>✕ Unblock</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Date picker modal */}
      {showPicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="slide">
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e8d5de' }}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={{ color: BRAND, fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handlePickerDate(pickerDate)}>
                    <Text style={{ color: BRAND, fontWeight: '800' }}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker value={pickerDate} mode="date" display="spinner" minimumDate={new Date()} onChange={(_, d) => d && setPickerDate(d)} style={{ backgroundColor: '#fff' }} />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, d) => {
              setShowPicker(false);
              if (event.type === 'set' && d) handlePickerDate(d);
            }}
          />
        )
      )}
    </ScreenContainer>
  );
}
