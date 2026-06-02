import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import React from "react";
import { apiClient } from "@/lib/api-client";

interface Review {
  _id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ReviewsScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert("Error", "Please write a review");
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        product_id: productId,
        rating,
        comment,
      };

      await apiClient.createReview(productId as string, reviewData);
      Alert.alert("Success", "Review submitted successfully!");
      setComment("");
      setRating(5);
      // Refresh reviews
      fetchReviews();
    } catch (error) {
      Alert.alert("Error", "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await apiClient.getReviews(productId as string);
      setReviews(response.data || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  React.useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

const StarRating = ({ value, onPress }: { value: number; onPress: (val: number) => void }) => (
    <View className="flex-row gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onPress(star)}>
          <IconSymbol
            size={28}
            name={star <= value ? "star.fill" : "star"}
            color={star <= value ? "#D4A574" : "#B0B0B0"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

    const ReviewCard = ({ review }: { review: Review }) => (
    <View className="bg-surface rounded-xl p-4 border border-border mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="font-semibold text-foreground">{review.user_name}</Text>
        <View className="flex-row gap-1">
          {[...Array(5)].map((_, i) => (
            <IconSymbol
              key={i}
              size={14}
              name={i < review.rating ? "star.fill" : "star"}
              color={i < review.rating ? "#D4A574" : "#B0B0B0"}
            />
          ))}
        </View>
      </View>
      <Text className="text-sm text-muted mb-2">{review.comment}</Text>
      <Text className="text-xs text-muted">{review.created_at}</Text>
    </View>
  );

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
            <Text className="text-3xl font-bold text-foreground">Reviews</Text>
            <Text className="text-sm text-muted">Share your experience</Text>
          </View>

          {/* Write Review */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-3">
            <Text className="font-semibold text-foreground">Write a Review</Text>

            {/* Rating */}
            <View className="gap-2">
              <Text className="text-sm text-muted">Your Rating</Text>
              <StarRating value={rating} onPress={setRating} />
            </View>

            {/* Comment */}
            <TextInput
              className="bg-background border border-border rounded-lg px-3 py-3 text-foreground"
              placeholder="Share your experience..."
              placeholderTextColor="#B0B0B0"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
            />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitReview}
              disabled={loading}
              className="bg-primary rounded-lg py-3 items-center"
            >
              {loading ? (
                <ActivityIndicator color="#F8F6F1" />
              ) : (
                <Text className="text-background font-bold">Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Reviews List */}
          <View className="gap-3">
            <Text className="font-semibold text-foreground">Customer Reviews ({reviews.length})</Text>
            {reviews.length > 0 ? (
              reviews.map((review) => <ReviewCard key={review._id} review={review} />)
            ) : (
              <View className="py-8 items-center">
                <Text className="text-muted">No reviews yet</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
