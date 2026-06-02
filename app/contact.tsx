import {
  ScrollView, Text, View, TouchableOpacity, TextInput,
  Linking, ActivityIndicator, Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { useState } from "react";

const BRAND = '#5e143f';
const GOLD_TEXT = '#f9e79f';

const CONTACT_CHANNELS = [
  {
    icon: '📧',
    label: 'Email Us',
    value: 'support@wedmangal.com',
    sub: 'We reply within 24 hours',
    onPress: () => Linking.openURL('mailto:support@wedmangal.com?subject=Support%20Request'),
    bg: '#fdf0f6',
    border: '#e8d5de',
  },
  {
    icon: '💬',
    label: 'WhatsApp Support',
    value: '+91 98765 43210',
    sub: '9 AM – 6 PM IST, Mon–Sat',
    onPress: () => Linking.openURL('https://wa.me/919876543210?text=Hi%2C+I+need+help+with+WedMangal'),
    bg: '#f0fdf4',
    border: '#86efac',
  },
  {
    icon: '📞',
    label: 'Call Us',
    value: '+91 98765 43210',
    sub: '9 AM – 6 PM IST, Mon–Sat',
    onPress: () => Linking.openURL('tel:+919876543210'),
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
];

export default function ContactScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState('');

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

  const handleSend = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Required', 'Please fill in all fields before sending.');
      return;
    }
    const subject = encodeURIComponent(`WedMangal Support: Message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    Linking.openURL(`mailto:support@wedmangal.com?subject=${subject}&body=${body}`);
  };

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <IconSymbol size={20} name="chevron.left" color={GOLD_TEXT} />
          <Text style={{ color: GOLD_TEXT, fontSize: 14 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: GOLD_TEXT, fontSize: 24, fontWeight: '900' }}>Contact Us</Text>
        <Text style={{ color: '#f5d0e0', fontSize: 13, marginTop: 2 }}>We'd love to hear from you</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        {/* Quick contact channels */}
        <Text style={{ fontSize: 15, fontWeight: '800', color: BRAND }}>Get in Touch</Text>
        {CONTACT_CHANNELS.map(ch => (
          <TouchableOpacity
            key={ch.label}
            onPress={ch.onPress}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 14,
              backgroundColor: ch.bg, borderRadius: 14, padding: 14,
              borderWidth: 1, borderColor: ch.border,
            }}
          >
            <Text style={{ fontSize: 28 }}>{ch.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1a0a12' }}>{ch.label}</Text>
              <Text style={{ fontSize: 13, color: BRAND, fontWeight: '600' }}>{ch.value}</Text>
              <Text style={{ fontSize: 11, color: '#9a7a85', marginTop: 1 }}>{ch.sub}</Text>
            </View>
            <IconSymbol size={16} name="chevron.right" color="#c9b0bc" />
          </TouchableOpacity>
        ))}

        {/* Office info */}
        <View style={{ backgroundColor: '#fdf8f0', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e8d5de', gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: BRAND }}>📍 Our Office</Text>
          <Text style={{ fontSize: 13, color: '#5a3a45', lineHeight: 20 }}>
            WedMangal — Tamil Nadu's Wedding Marketplace{'\n'}
            Chennai, Tamil Nadu, India{'\n'}
            PIN: 600001
          </Text>
          <Text style={{ fontSize: 12, color: '#9a7a85' }}>🕒 Mon – Sat, 9 AM to 6 PM IST</Text>
        </View>

        {/* Send a message form */}
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: BRAND }}>Send a Message</Text>

          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#9a7a85', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Your Name</Text>
            <TextInput
              style={inputStyle('name')}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#c9b0bc"
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused('')}
            />
          </View>

          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#9a7a85', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Email Address</Text>
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

          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#9a7a85', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Message</Text>
            <TextInput
              style={[inputStyle('message'), { minHeight: 100, textAlignVertical: 'top' }]}
              value={message}
              onChangeText={setMessage}
              placeholder="How can we help you?"
              placeholderTextColor="#c9b0bc"
              multiline
              numberOfLines={4}
              onFocus={() => setFocused('message')}
              onBlur={() => setFocused('')}
            />
          </View>

          <TouchableOpacity
            onPress={handleSend}
            style={{ backgroundColor: BRAND, borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}
          >
            <Text style={{ color: GOLD_TEXT, fontWeight: '800', fontSize: 15 }}>📩 Send Message</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
