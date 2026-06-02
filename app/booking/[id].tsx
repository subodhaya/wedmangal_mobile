import {
  ScrollView, Text, View, TouchableOpacity, TextInput,
  ActivityIndicator, Linking, Modal, Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { shadow } from "@/lib/utils";
import DateTimePicker from "@react-native-community/datetimepicker";

const BRAND  = '#5e143f';
const GOLD   = '#c9973a';
const GOLD_T = '#f9e79f';
const GREEN  = '#25D366';

const TIME_SLOTS = [
  { label: '9:00 AM',  start: '09:00', end: '10:00' },
  { label: '10:00 AM', start: '10:00', end: '11:00' },
  { label: '11:00 AM', start: '11:00', end: '12:00' },
  { label: '12:00 PM', start: '12:00', end: '13:00' },
  { label: '2:00 PM',  start: '14:00', end: '15:00' },
  { label: '3:00 PM',  start: '15:00', end: '16:00' },
  { label: '4:00 PM',  start: '16:00', end: '17:00' },
  { label: '6:00 PM',  start: '18:00', end: '19:00' },
];

export default function BookingScreen() {
  const { id, productId, serviceName, vendorName, price, vendorPhone } = useLocalSearchParams<{
    id: string; productId: string; serviceName: string;
    vendorName: string; price: string; vendorPhone: string;
  }>();
  const router = useRouter();

  const [date, setDate]           = useState<Date | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot]   = useState<(typeof TIME_SLOTS)[0] | null>(null);
  const [venue, setVenue]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [booked, setBooked]       = useState(false);
  const [orderId, setOrderId]     = useState('');
  const [error, setError]         = useState('');

  const displayPrice = price && parseInt(price) > 0
    ? `₹${parseInt(price).toLocaleString('en-IN')}`
    : 'Contact for Price';

  const formattedDate = date
    ? date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const confirmBooking = async () => {
    if (!date) { setError('Please select a date'); return; }
    if (!timeSlot) { setError('Please select a time slot'); return; }
    setError('');
    setLoading(true);
    try {
      const iso = date.toISOString().split('T')[0];
      const priceVal = price && parseInt(price) > 0 ? price : '0';
      const payload = {
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
          startTime: timeSlot.start,
          endTime: timeSlot.end,
        }],
      };
      const res = await apiClient.createOrder(payload);
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
      `Time: ${timeSlot?.label ?? ''}`,
      `Venue: ${venue.trim() || ''}`,
      ``,
      `Looking forward to make ur big day more beautiful and memorable😊`,
    ].join('\n');
    Linking.openURL(`https://wa.me/${vendorPhone}?text=${encodeURIComponent(msg)}`);
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (booked) {
    return (
      <ScreenContainer edges={['top', 'left', 'right']} containerClassName="bg-white">
        <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', gap: 24 }}>
          {/* Checkmark */}
          <View style={{
            width: 90, height: 90, borderRadius: 45,
            backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center',
            marginTop: 32,
          }}>
            <Text style={{ fontSize: 44, color: '#fff' }}>✓</Text>
          </View>

          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 24, fontWeight: '900', color: BRAND }}>Booking Confirmed!</Text>
            <Text style={{ fontSize: 13, color: '#7a5a6a', textAlign: 'center' }}>
              Your request has been sent. The vendor will confirm via WhatsApp.
            </Text>
          </View>

          {/* Summary card */}
          <View style={{
            width: '100%', backgroundColor: '#fdf8f0', borderRadius: 16,
            padding: 20, gap: 12, borderWidth: 1, borderColor: '#e8d5de',
          }}>
            {orderId ? (
              <Row label="Booking ID" value={`#${orderId}`} bold />
            ) : null}
            <Row label="Vendor"  value={vendorName} />
            <Row label="Service" value={serviceName} />
            <Row label="Date"    value={formattedDate} />
            <Row label="Time"    value={timeSlot?.label ?? ''} />
            {venue ? <Row label="Venue" value={venue} /> : null}
            <Row label="Price"   value={displayPrice} bold />
          </View>

          {/* WhatsApp button */}
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

          {/* My bookings */}
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/bookings')}
            style={{
              width: '100%', borderWidth: 2, borderColor: BRAND,
              borderRadius: 14, paddingVertical: 13, alignItems: 'center',
            }}
          >
            <Text style={{ color: BRAND, fontWeight: '800', fontSize: 15 }}>View My Bookings</Text>
          </TouchableOpacity>

          {/* Back home */}
          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <Text style={{ color: '#9a7a85', fontSize: 13, textDecorationLine: 'underline' }}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ── Booking form ──────────────────────────────────────────────────────────
  return (
    <ScreenContainer edges={['top', 'left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 18, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={{ color: GOLD_T, fontSize: 22 }}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: GOLD_T, fontSize: 18, fontWeight: '900' }}>Book Service</Text>
          <Text style={{ color: '#f5d0e0', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
            {vendorName}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Service summary card */}
        <View style={{
          backgroundColor: '#fdf8f0', borderRadius: 14, padding: 16,
          borderWidth: 1, borderColor: '#e8d5de', gap: 8,
        }}>
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

        {/* Date picker */}
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: BRAND }}>📅 Select Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{
              backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5,
              borderColor: date ? BRAND : '#e8d5de', paddingHorizontal: 16, paddingVertical: 14,
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, color: date ? '#1a0a12' : '#c9b0bc', fontWeight: date ? '600' : '400' }}>
              {date ? formattedDate : 'Tap to choose wedding event date'}
            </Text>
            <Text style={{ fontSize: 18 }}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Time slot chips */}
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: BRAND }}>⏰ Select Time Slot</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TIME_SLOTS.map(slot => {
              const active = timeSlot?.start === slot.start;
              return (
                <TouchableOpacity
                  key={slot.start}
                  onPress={() => setTimeSlot(slot)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                    backgroundColor: active ? BRAND : '#fff',
                    borderWidth: 1.5, borderColor: active ? BRAND : '#e8d5de',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: active ? GOLD_T : '#5a3a45' }}>
                    {slot.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
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

        {/* Confirm button */}
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
            <Text style={{ color: GOLD_T, fontWeight: '900', fontSize: 16 }}>
              ✨ Confirm Booking
            </Text>
          )}
        </TouchableOpacity>

        {/* WhatsApp note */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 12, color: '#9a7a85', textAlign: 'center' }}>
            After confirming, you'll be prompted to message the vendor on WhatsApp for final confirmation.
          </Text>
        </View>
      </ScrollView>

      {/* Date picker modal */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="slide">
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0e6ea' }}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={{ color: BRAND, fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setDate(pickerDate); setShowDatePicker(false); }}>
                    <Text style={{ color: BRAND, fontWeight: '800' }}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={pickerDate}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={(_, d) => d && setPickerDate(d)}
                  style={{ backgroundColor: '#fff' }}
                />
              </View>
            </View>
          </Modal>
        ) : Platform.OS === 'android' ? (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, d) => {
              setShowDatePicker(false);
              if (event.type === 'set' && d) setDate(d);
            }}
          />
        ) : (
          <Modal transparent animationType="fade">
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 300, gap: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: BRAND }}>Select Event Date</Text>
                <DateTimePicker
                  value={pickerDate}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={(_, d) => d && setPickerDate(d)}
                />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={{ flex: 1, borderWidth: 1.5, borderColor: BRAND, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
                  >
                    <Text style={{ color: BRAND, fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setDate(pickerDate); setShowDatePicker(false); }}
                    style={{ flex: 1, backgroundColor: BRAND, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
                  >
                    <Text style={{ color: GOLD_T, fontWeight: '700' }}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )
      )}
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
