import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";

export default function AboutScreen() {
  const router = useRouter();

  const features = [
    { icon: "magnifyingglass", title: "Easy Search", description: "Find services by category, price, and location" },
    { icon: "heart.fill", title: "Save Favorites", description: "Build your wishlist of preferred vendors" },
    { icon: "calendar", title: "Book Instantly", description: "Schedule services with flexible dates and times" },
    { icon: "message.fill", title: "WhatsApp Integration", description: "Communicate directly with service providers" },
    { icon: "star.fill", title: "Ratings & Reviews", description: "Read genuine customer feedback" },
    { icon: "shield.fill", title: "Secure Platform", description: "Your data is protected and encrypted" },
  ];

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
            <Text className="text-3xl font-bold text-foreground">About WedMangal</Text>
          </View>

          {/* App Description */}
          <View className="gap-3 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-lg font-semibold text-foreground">Your Wedding Celebration Partner</Text>
            <Text className="text-sm text-muted leading-relaxed">
              WedMangal is a comprehensive platform designed to simplify wedding and celebration planning. We connect you with verified service providers across multiple categories to make your special day unforgettable.
            </Text>
          </View>

          {/* Features */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Key Features</Text>
            {features.map((feature, index) => (
              <View key={index} className="flex-row gap-3 bg-surface rounded-xl p-3 border border-border">
                <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
                  <IconSymbol size={20} name={feature.icon as any} color="#F8F6F1" />
                </View>
                <View className="flex-1 justify-center gap-1">
                  <Text className="font-semibold text-foreground">{feature.title}</Text>
                  <Text className="text-xs text-muted">{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* App Info */}
          <View className="gap-2 p-4 bg-surface rounded-xl border border-border">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">App Version</Text>
              <Text className="text-sm font-semibold text-foreground">1.0.0</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Build</Text>
              <Text className="text-sm font-semibold text-foreground">2026.05.05</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Platform</Text>
              <Text className="text-sm font-semibold text-foreground">React Native</Text>
            </View>
          </View>

          {/* Credits */}
          <View className="gap-2 p-4 bg-surface rounded-xl border border-border items-center">
            <Text className="text-sm font-semibold text-foreground">Made with ❤️ by WedMangal Team</Text>
            <Text className="text-xs text-muted">© 2026 WedMangal. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
