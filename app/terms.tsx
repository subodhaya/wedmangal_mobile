import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";

export default function TermsScreen() {
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
            <Text className="text-3xl font-bold text-foreground">Terms & Conditions</Text>
            <Text className="text-sm text-muted">Last updated: May 5, 2026</Text>
          </View>

          {/* Content */}
          <View className="gap-4">
            <Section
              title="1. Acceptance of Terms"
              content="By using WedMangal, you agree to comply with these terms and conditions. If you do not agree, please do not use the app."
            />

            <Section
              title="2. User Accounts"
              content="You are responsible for maintaining the confidentiality of your account information. You agree to accept responsibility for all activities that occur under your account."
            />

            <Section
              title="3. Booking & Payments"
              content="All bookings are subject to service provider availability. Payments are arranged directly between users and service providers. WedMangal is not responsible for payment disputes."
            />

            <Section
              title="4. User Conduct"
              content="You agree not to use the app for any unlawful purposes or in any way that could damage, disable, or impair the app. This includes harassment, fraud, or misrepresentation."
            />

            <Section
              title="5. Limitation of Liability"
              content="WedMangal is provided 'as is' without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the app."
            />

            <Section
              title="6. Changes to Terms"
              content="We reserve the right to modify these terms at any time. Your continued use of the app constitutes acceptance of the updated terms."
            />

            <Section
              title="7. Governing Law"
              content="These terms are governed by the laws of India. Any disputes shall be resolved in the courts of India."
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
