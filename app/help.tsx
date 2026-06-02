import { ScrollView, Text, View, TouchableOpacity, Linking, LayoutAnimation } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { useState } from "react";

const BRAND = '#5e143f';
const GOLD_TEXT = '#f9e79f';

interface FAQItem {
  id: string;
  icon: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'f1', icon: '🔍',
    question: 'What is WedMangal?',
    answer: "WedMangal is Tamil Nadu's wedding vendor marketplace. It connects engaged couples with trusted local wedding service providers — photographers, makeup artists, caterers, decorators, mehandi artists, DJs, event planners, pandits, jewellers, and more — all in one place.",
  },
  {
    id: 'f2', icon: '💰',
    question: 'Is WedMangal free for customers?',
    answer: 'Yes. Browsing vendor profiles, reading reviews, and booking services on WedMangal is completely free for customers. You pay the vendor directly for their service — WedMangal does not charge any booking fee.',
  },
  {
    id: 'f3', icon: '📅',
    question: 'How do I book a wedding vendor?',
    answer: '1. Browse by category or search by name/city on the home screen.\n2. Open a vendor profile to view services, pricing, and reviews.\n3. Select a service and pick your date and time slot.\n4. Tap "Book Now" — the vendor is notified via WhatsApp.\n5. The vendor confirms the booking directly with you.',
  },
  {
    id: 'f4', icon: '📍',
    question: 'Which cities does WedMangal cover?',
    answer: 'WedMangal currently covers Tamil Nadu — including Chennai, Coimbatore, Madurai, Salem, Trichy, Tirunelveli, Vellore, Thanjavur, Erode, Tiruppur and surrounding towns.',
  },
  {
    id: 'f5', icon: '✅',
    question: 'Are vendors on WedMangal verified?',
    answer: 'Yes. All vendor listings go through a review and approval process before they appear on the platform. Customer reviews and ratings are from real bookings.',
  },
  {
    id: 'f6', icon: '🟢',
    question: 'What is the "Available Today" feature?',
    answer: '"Available Today" shows vendors who are free for same-day or next-day bookings. Vendors toggle their availability in real time so you can book instantly.',
  },
  {
    id: 'f7', icon: '🏪',
    question: 'How do I register as a vendor?',
    answer: "Tap 'Register as Vendor' in the Profile tab and fill in your business details. Once reviewed and approved, your listing goes live. Listing your business on WedMangal is free.",
  },
  {
    id: 'f8', icon: '💳',
    question: 'Do I pay in advance when booking?',
    answer: 'No. WedMangal does not process payments. Booking requests go directly to the vendor via WhatsApp. Payment terms are agreed directly between you and the vendor.',
  },
  {
    id: 'f9', icon: '⭐',
    question: 'How do I leave a review?',
    answer: "After your wedding, open the vendor profile and tap 'Write a Review'. Select a star rating and add your comments. Reviews help other couples make better decisions.",
  },
  {
    id: 'f10', icon: '💔',
    question: 'How do I cancel a booking?',
    answer: 'Contact the vendor directly via WhatsApp or phone to cancel. Cancellation policies vary by vendor — check their profile for terms before booking.',
  },
  {
    id: 'f11', icon: '🔒',
    question: 'Is my personal information safe?',
    answer: 'Yes. Your details are only shared with vendors when you initiate a booking. See our Privacy Policy for full details.',
  },
  {
    id: 'f12', icon: '📊',
    question: 'What is the Budget Planner?',
    answer: 'The Budget Planner helps you set a total wedding budget and track spending across categories like venue, catering, photography, and decoration. Find it in Profile → Budget Planner.',
  },
  {
    id: 'f13', icon: '📋',
    question: 'What is the Wedding Planner checklist?',
    answer: 'The Wedding Planner gives you a step-by-step checklist — from fixing your date to booking the pandit — so you never miss an important task. Tap each step to mark it done.',
  },
];

function FAQRow({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(o => !o);
  };

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e8d5de', overflow: 'hidden', marginBottom: 8 }}>
      <TouchableOpacity onPress={toggle} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 }} activeOpacity={0.8}>
        <Text style={{ fontSize: 18 }}>{item.icon}</Text>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: '#1a0a12' }}>{item.question}</Text>
        <IconSymbol size={14} name={open ? "chevron.up" : "chevron.down"} color={BRAND} />
      </TouchableOpacity>
      {open && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 2 }}>
          <View style={{ height: 1, backgroundColor: '#f0e6ea', marginBottom: 10 }} />
          <Text style={{ fontSize: 13, color: '#5a3a45', lineHeight: 20 }}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
}

export default function HelpScreen() {
  const router = useRouter();

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <IconSymbol size={20} name="chevron.left" color={GOLD_TEXT} />
          <Text style={{ color: GOLD_TEXT, fontSize: 14 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: GOLD_TEXT, fontSize: 24, fontWeight: '900' }}>Help & FAQ</Text>
        <Text style={{ color: '#f5d0e0', fontSize: 13, marginTop: 2 }}>Answers to common questions</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: BRAND }}>Frequently Asked Questions</Text>

        <View>
          {FAQS.map(faq => <FAQRow key={faq.id} item={faq} />)}
        </View>

        {/* Contact section */}
        <View style={{ backgroundColor: '#fdf8f0', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e8d5de', gap: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: BRAND }}>Still need help?</Text>
          <Text style={{ fontSize: 13, color: '#7a5a6a' }}>Our support team is available 9 AM – 6 PM IST, Monday to Saturday.</Text>

          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:support@wedmangal.com?subject=Help%20%26%20Support')}
            style={{ backgroundColor: BRAND, borderRadius: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <IconSymbol size={18} name="envelope.fill" color={GOLD_TEXT} />
            <Text style={{ color: GOLD_TEXT, fontWeight: '700', fontSize: 14 }}>Email Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL('https://wa.me/919876543210?text=Hi%2C+I+need+help+with+WedMangal')}
            style={{ backgroundColor: '#25D366', borderRadius: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Text style={{ fontSize: 18 }}>💬</Text>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>WhatsApp Support</Text>
          </TouchableOpacity>

          <View style={{ gap: 4, marginTop: 4 }}>
            <Text style={{ fontSize: 12, color: '#9a7a85' }}>📧  support@wedmangal.com</Text>
            <Text style={{ fontSize: 12, color: '#9a7a85' }}>📞  +91 98765 43210</Text>
            <Text style={{ fontSize: 12, color: '#9a7a85' }}>🕒  9 AM – 6 PM IST, Mon–Sat</Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
