import {
  ScrollView, Text, View, TouchableOpacity, TextInput,
  ActivityIndicator, Linking, FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import { shadow } from "@/lib/utils";

const BRAND  = '#5e143f';
const GOLD   = '#c9973a';
const GOLD_T = '#f9e79f';
const GREEN  = '#25D366';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

// ── 24-hour time wheel ────────────────────────────────────────────────────────
const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

function TimeWheel({ label, hour, minute, onHour, onMinute }: {
  label: string;
  hour: string; minute: string;
  onHour: (h: string) => void;
  onMinute: (m: string) => void;
}) {
  const ITEM_H = 40;
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: '#9a7a85', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {/* Hour column */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: '#9a7a85', textAlign: 'center', marginBottom: 4 }}>HH</Text>
          <View style={{ height: 160, borderRadius: 10, borderWidth: 1.5, borderColor: '#e8d5de', overflow: 'hidden', backgroundColor: '#fdf8f0' }}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
              {HOURS.map(h => (
                <TouchableOpacity
                  key={h}
                  onPress={() => onHour(h)}
                  style={{
                    height: ITEM_H, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: hour === h ? BRAND : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: hour === h ? GOLD_T : '#2a1a1f' }}>{h}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        {/* Colon */}
        <View style={{ justifyContent: 'center', paddingTop: 22 }}>
          <Text style={{ fontSize: 20, fontWeight: '900', color: BRAND }}>:</Text>
        </View>
        {/* Minute column */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: '#9a7a85', textAlign: 'center', marginBottom: 4 }}>MM</Text>
          <View style={{ height: 160, borderRadius: 10, borderWidth: 1.5, borderColor: '#e8d5de', overflow: 'hidden', backgroundColor: '#fdf8f0' }}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
              {MINUTES.map(m => (
                <TouchableOpacity
                  key={m}
                  onPress={() => onMinute(m)}
                  style={{
                    height: ITEM_H, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: minute === m ? BRAND : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: minute === m ? GOLD_T : '#2a1a1f' }}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
      {/* Selected display */}
      <View style={{ backgroundColor: BRAND, borderRadius: 8, paddingVertical: 6, alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '900', color: GOLD_T }}>{hour}:{minute}</Text>
      </View>
    </View>
  );
}

// ── Inline Calendar ───────────────────────────────────────────────────────────
function CalendarPicker({ selected, onSelect }: {
  selected: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year  = view.getFullYear();
  const month = view.getMonth();
  const firstDow    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const toDate = (d: number) => new Date(year, month, d);
  const isPast = (d: number) => toDate(d) < today;
  const isSelected = (d: number) => {
    if (!selected) return false;
    const s = new Date(selected);
    return s.getFullYear() === year && s.getMonth() === month && s.getDate() === d;
  };

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#e8d5de', overflow: 'hidden' }}>
      {/* Month nav */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: BRAND, paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity
          onPress={() => setView(v => new Date(v.getFullYear(), v.getMonth() - 1, 1))}
          style={{ padding: 6 }}
          disabled={view.getFullYear() === today.getFullYear() && view.getMonth() === today.getMonth()}
        >
          <Text style={{ color: GOLD_T, fontSize: 20, fontWeight: '700', opacity: (view.getFullYear() === today.getFullYear() && view.getMonth() === today.getMonth()) ? 0.3 : 1 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ color: GOLD_T, fontWeight: '800', fontSize: 15 }}>
          {MONTHS[month]} {year}
        </Text>
        <TouchableOpacity
          onPress={() => setView(v => new Date(v.getFullYear(), v.getMonth() + 1, 1))}
          style={{ padding: 6 }}
        >
          <Text style={{ color: GOLD_T, fontSize: 20, fontWeight: '700' }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={{ flexDirection: 'row', backgroundColor: '#fdf8f0', paddingVertical: 6 }}>
        {WEEKDAYS.map(w => (
          <Text key={w} style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#9a7a85' }}>{w}</Text>
        ))}
      </View>

      {/* Day cells */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8 }}>
        {cells.map((day, idx) => {
          if (!day) return <View key={`e${idx}`} style={{ width: '14.28%', aspectRatio: 1 }} />;
          const past = isPast(day);
          const sel  = isSelected(day);
          const isToday = toDate(day).getTime() === today.getTime();

          return (
            <TouchableOpacity
              key={`${year}-${month}-${day}`}
              onPress={() => !past && onSelect(toDate(day))}
              disabled={past}
              style={{ width: '14.28%', aspectRatio: 1, padding: 2 }}
              activeOpacity={past ? 1 : 0.75}
            >
              <View style={{
                flex: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
                backgroundColor: sel ? BRAND : 'transparent',
                borderWidth: isToday && !sel ? 2 : 0,
                borderColor: BRAND,
              }}>
                <Text style={{
                  fontSize: 13, fontWeight: sel || isToday ? '800' : '400',
                  color: sel ? GOLD_T : past ? '#d0c0c8' : '#1a0a12',
                }}>
                  {day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Main Booking Screen ───────────────────────────────────────────────────────
export default function BookingScreen() {
  const { id, productId, serviceName, vendorName, price, vendorPhone } = useLocalSearchParams<{
    id: string; productId: string; serviceName: string;
    vendorName: string; price: string; vendorPhone: string;
  }>();
  const router = useRouter();

  const [date, setDate]         = useState<Date | null>(null);
  const [startHour, setStartHour]   = useState('09');
  const [startMin,  setStartMin]    = useState('00');
  const [endHour,   setEndHour]     = useState('10');
  const [endMin,    setEndMin]      = useState('00');
  const [venue, setVenue]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [booked, setBooked]     = useState(false);
  const [orderId, setOrderId]   = useState('');
  const [error, setError]       = useState('');

  const displayPrice = price && parseInt(price) > 0
    ? `₹${parseInt(price).toLocaleString('en-IN')}`
    : 'Contact for Price';

  const formattedDate = date
    ? date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const startTime = `${startHour}:${startMin}`;
  const endTime   = `${endHour}:${endMin}`;

  const confirmBooking = async () => {
    if (!date) { setError('Please select a date'); return; }
    // Validate end time > start time
    if (endHour < startHour || (endHour === startHour && endMin <= startMin)) {
      setError('End time must be after start time'); return;
    }
    setError('');
    setLoading(true);
    try {
      const iso = date.toISOString().split('T')[0];
      const priceVal = price && parseInt(price) > 0 ? price : '0';
      const res = await apiClient.createOrder({
        paymentMethod: 'WhatsApp_Booking',
        taxPrice: '0.00',
        shippingPrice: '0.00',
        totalPrice: priceVal,
        shippingAddress: {
          address: venue.trim() || 'To be confirmed',
          city: 'India',
          postalCode: '000000',
          country: 'India',
        },
        orderItems: [{
          service: id,
          qty: 1,
          price: priceVal,
          bookingDate: iso,
          startTime,
          endTime,
        }],
      });
      setOrderId(String(res.data._id ?? res.data.id ?? ''));
      setBooked(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    if (!vendorPhone) return;
    const msg = [
      `Thank you for contacting ${vendorName} 🌹😊`,
      `Hope you are doing well and good`,
      `How may I help you`,
      `Please fill your event details here and we will get to you shortly`,
      ``,
      `Event: ${serviceName}`,
      `Date: ${formattedDate}`,
      `Time: ${startTime} – ${endTime}`,
      `Venue: ${venue.trim() || 'TBD'}`,
      ``,
      `Looking forward to make ur big day more beautiful and memorable😊`,
    ].join('\n');
    Linking.openURL(`https://wa.me/${vendorPhone}?text=${encodeURIComponent(msg)}`);
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (booked) {
    return (
      <ScreenContainer edges={['top', 'left', 'right']} containerClassName="bg-white">
        <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', gap: 24 }}>
          <View style={{
            width: 90, height: 90, borderRadius: 45,
            backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center', marginTop: 32,
          }}>
            <Text style={{ fontSize: 44, color: '#fff' }}>✓</Text>
          </View>

          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 24, fontWeight: '900', color: BRAND }}>Booking Confirmed!</Text>
            <Text style={{ fontSize: 13, color: '#7a5a6a', textAlign: 'center' }}>
              Your request has been sent. The vendor will confirm via WhatsApp.
            </Text>
          </View>

          <View style={{
            width: '100%', backgroundColor: '#fdf8f0', borderRadius: 16,
            padding: 20, gap: 12, borderWidth: 1, borderColor: '#e8d5de',
          }}>
            {orderId ? <Row label="Booking ID" value={`#${orderId}`} bold /> : null}
            <Row label="Vendor"   value={vendorName} />
            <Row label="Service"  value={serviceName} />
            <Row label="Date"     value={formattedDate} />
            <Row label="Time"     value={`${startTime} – ${endTime}`} />
            {venue ? <Row label="Venue" value={venue} /> : null}
            <Row label="Price"    value={displayPrice} bold />
          </View>

          {vendorPhone ? (
            <TouchableOpacity
              onPress={openWhatsApp}
              style={{
                width: '100%', backgroundColor: GREEN, borderRadius: 14,
                paddingVertical: 15, flexDirection: 'row', alignItems: 'center',
                justifyContent: 'center', gap: 10,
              }}
            >
              <Text style={{ fontSize: 20 }}>💬</Text>
              <View>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>Message Vendor on WhatsApp</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>Send booking details for confirmation</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/bookings')}
            style={{ width: '100%', borderWidth: 2, borderColor: BRAND, borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}
          >
            <Text style={{ color: BRAND, fontWeight: '800', fontSize: 15 }}>View My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <Text style={{ color: '#9a7a85', fontSize: 13, textDecorationLine: 'underline' }}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ── Booking form ───────────────────────────────────────────────────────────
  return (
    <ScreenContainer edges={['top', 'left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 18, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={{ color: GOLD_T, fontSize: 22 }}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: GOLD_T, fontSize: 18, fontWeight: '900' }}>Book Service</Text>
          <Text style={{ color: '#f5d0e0', fontSize: 12, marginTop: 2 }} numberOfLines={1}>{vendorName}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 20 }} keyboardShouldPersistTaps="handled">

        {/* Service summary */}
        <View style={{ backgroundColor: '#fdf8f0', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e8d5de', gap: 8 }}>
          <Text style={{ fontSize: 11, color: '#9a7a85', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            You're booking
          </Text>
          <Text style={{ fontSize: 17, fontWeight: '800', color: BRAND }}>{serviceName}</Text>
          <Text style={{ fontSize: 13, color: '#7a5a6a' }}>by {vendorName}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: BRAND }}>{displayPrice}</Text>
            <View style={{ backgroundColor: '#fff3cd', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ fontSize: 11, color: '#856404', fontWeight: '700' }}>💳 Pay at venue</Text>
            </View>
          </View>
        </View>

        {/* Date calendar */}
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: BRAND }}>📅 Select Date</Text>
          <CalendarPicker selected={date} onSelect={setDate} />
          {date && (
            <View style={{ backgroundColor: '#f0fdf4', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#86efac' }}>
              <Text style={{ color: '#16a34a', fontWeight: '700', fontSize: 13, textAlign: 'center' }}>
                ✓ {formattedDate}
              </Text>
            </View>
          )}
        </View>

        {/* 24-hour time pickers */}
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: BRAND }}>⏰ Select Time (24-hour)</Text>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <TimeWheel
              label="Start Time"
              hour={startHour} minute={startMin}
              onHour={setStartHour} onMinute={setStartMin}
            />
            <TimeWheel
              label="End Time"
              hour={endHour} minute={endMin}
              onHour={setEndHour} onMinute={setEndMin}
            />
          </View>
        </View>

        {/* Venue */}
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: BRAND }}>📍 Venue / Address</Text>
          <TextInput
            value={venue}
            onChangeText={setVenue}
            placeholder="e.g. Taj Mahal Hall, Chennai"
            placeholderTextColor="#c9b0bc"
            style={{
              backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5,
              borderColor: '#e8d5de', paddingHorizontal: 16, paddingVertical: 12,
              fontSize: 14, color: '#1a0a12',
            }}
          />
        </View>

        {/* Error */}
        {error ? (
          <Text style={{ fontSize: 13, color: '#EF4444', fontWeight: '600' }}>{error}</Text>
        ) : null}

        {/* Confirm */}
        <TouchableOpacity
          onPress={confirmBooking}
          disabled={loading}
          style={{
            backgroundColor: BRAND, borderRadius: 14, paddingVertical: 16,
            alignItems: 'center', justifyContent: 'center',
            opacity: loading ? 0.7 : 1, marginTop: 4,
            ...shadow(BRAND, 0.25, 10),
          }}
        >
          {loading ? (
            <ActivityIndicator color={GOLD_T} />
          ) : (
            <Text style={{ color: GOLD_T, fontWeight: '900', fontSize: 16 }}>✨ Confirm Booking</Text>
          )}
        </TouchableOpacity>

        <Text style={{ fontSize: 12, color: '#9a7a85', textAlign: 'center' }}>
          After confirming, message the vendor on WhatsApp for final confirmation.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontSize: 12, color: '#9a7a85' }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: bold ? '800' : '600', color: bold ? BRAND : '#1a0a12', maxWidth: '65%', textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}
