import { ScrollView, Text, View, TouchableOpacity, Linking } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function HelpScreen() {
  const router = useRouter();

  const faqs: FAQItem[] = [
    {
      id: "1",
      question: "How do I book a service?",
      answer: "Browse services in the Search tab, select a service, choose your date and time, and send the booking via WhatsApp.",
    },
    {
      id: "2",
      question: "Can I cancel a booking?",
      answer: "Yes, you can cancel bookings from the My Bookings tab. Contact the service provider via WhatsApp for confirmation.",
    },
    {
      id: "3",
      question: "How do I save a service?",
      answer: "Tap the heart icon on any service to add it to your Wishlist. Access saved services from the Wishlist tab.",
    },
    {
      id: "4",
      question: "Is payment secure?",
      answer: "Payments are arranged directly with service providers via WhatsApp. Always verify details before sending money.",
    },
    {
      id: "5",
      question: "How do I contact support?",
      answer: "Use the Contact Support button below to reach our team. We typically respond within 24 hours.",
    },
  ];

  const handleContactSupport = () => {
    const email = "support@wedmangal.com";
    const subject = "Help & Support";
    Linking.openURL(`mailto:${email}?subject=${subject}`);
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2 mb-2">
              <IconSymbol size={24} name="chevron.left" color="#D4A574" />
              <Text className="text-lg font-semibold text-primary">Back</Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Help & Support</Text>
            <Text className="text-sm text-muted">Find answers to common questions</Text>
          </View>

          {/* FAQs */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Frequently Asked Questions</Text>
            {faqs.map((faq) => (
              <View key={faq.id} className="bg-surface rounded-xl p-4 border border-border gap-2">
                <Text className="font-semibold text-foreground">{faq.question}</Text>
                <Text className="text-sm text-muted leading-relaxed">{faq.answer}</Text>
              </View>
            ))}
          </View>

          {/* Contact Support */}
          <View className="gap-3 mt-4">
            <Text className="text-lg font-semibold text-foreground">Still need help?</Text>
            <TouchableOpacity
              onPress={handleContactSupport}
              className="bg-primary rounded-xl py-4 items-center flex-row justify-center gap-2"
            >
              <IconSymbol size={20} name="envelope.fill" color="#F8F6F1" />
              <Text className="text-background font-bold">Contact Support</Text>
            </TouchableOpacity>
          </View>

          {/* Contact Info */}
          <View className="gap-2 p-4 bg-surface rounded-xl border border-border">
            <Text className="text-sm font-semibold text-foreground">Contact Information</Text>
            <Text className="text-sm text-muted">Email: support@wedmangal.com</Text>
            <Text className="text-sm text-muted">Phone: +91 98765 43210</Text>
            <Text className="text-sm text-muted">Hours: 9 AM - 6 PM IST</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
