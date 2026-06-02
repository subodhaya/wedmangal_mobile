import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function BookingConfirmationScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center gap-6">
          {/* Success Icon */}
          <View className="w-24 h-24 rounded-full bg-success items-center justify-center">
            <IconSymbol size={60} name="checkmark" color="#F8F6F1" />
          </View>

          {/* Message */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-foreground">Booking Confirmed!</Text>
            <Text className="text-sm text-muted text-center">
              Your booking has been successfully created
            </Text>
          </View>

          {/* Booking Details */}
          <View className="w-full bg-surface rounded-xl p-6 gap-4 border border-border">
            <View className="gap-2">
              <Text className="text-sm text-muted">Booking Reference</Text>
              <Text className="text-lg font-bold text-foreground">{orderId}</Text>
            </View>
            <View className="border-t border-border pt-4 gap-2">
              <Text className="text-sm text-muted">Date & Time</Text>
              <Text className="text-base font-semibold text-foreground">May 15, 2026 • 02:00 PM</Text>
            </View>
            <View className="border-t border-border pt-4 gap-2">
              <Text className="text-sm text-muted">Total Amount</Text>
              <Text className="text-2xl font-bold text-primary">₹5,900</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="w-full gap-3">
            <TouchableOpacity className="bg-primary rounded-xl py-4 items-center">
              <Text className="text-background font-bold text-lg">View Booking Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/bookings")}
              className="border border-primary rounded-xl py-4 items-center"
            >
              <Text className="text-primary font-bold text-lg">Go to My Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)")}
              className="border border-border rounded-xl py-4 items-center"
            >
              <Text className="text-foreground font-semibold text-lg">Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
