import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-4">
          {/* Header */}
          <View className="gap-2 mb-2">
            <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2 mb-2">
              <IconSymbol size={24} name="chevron.left" color="#D4A574" />
              <Text className="text-lg font-semibold text-primary">Back</Text>
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Privacy Policy</Text>
            <Text className="text-sm text-muted">Last updated: May 5, 2026</Text>
          </View>

          {/* Content */}
          <View className="gap-4">
            <Section
              title="1. Information We Collect"
              content="We collect information you provide directly, including name, email, phone number, and location. We also collect usage data to improve our services."
            />

            <Section
              title="2. How We Use Your Information"
              content="Your information is used to provide and improve our services, process bookings, and communicate with you about your account. We never sell your data to third parties."
            />

            <Section
              title="3. Data Security"
              content="We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure."
            />

            <Section
              title="4. Third-Party Services"
              content="We use third-party services like WhatsApp for communication. Please review their privacy policies as we are not responsible for their practices."
            />

            <Section
              title="5. Cookies & Tracking"
              content="We use cookies and similar technologies to enhance your experience. You can control cookie settings in your device preferences."
            />

            <Section
              title="6. Your Rights"
              content="You have the right to access, update, or delete your personal information. Contact us at privacy@wedmangal.com for any requests."
            />

            <Section
              title="7. Children's Privacy"
              content="Our app is not intended for children under 13. We do not knowingly collect information from children under 13."
            />

            <Section
              title="8. Changes to Privacy Policy"
              content="We may update this policy periodically. We will notify you of significant changes via email or app notification."
            />
          </View>

          <View className="py-4" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <View className="gap-2">
      <Text className="font-semibold text-foreground">{title}</Text>
      <Text className="text-sm text-muted leading-relaxed">{content}</Text>
    </View>
  );
}
