import {
  ScrollView, Text, View, TouchableOpacity, Image,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

const BRAND = '#5e143f';
const GOLD_TEXT = '#f9e79f';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  read_time: number;
  created_at: string;
  cover_image_url?: string;
  category?: string;
  content?: string;
}

export default function BlogPostScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    apiClient.getBlogPost(slug)
      .then(r => setPost(r.data))
      .catch(() => setError('Could not load this post.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const date = post
    ? new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <IconSymbol size={20} name="chevron.left" color={GOLD_TEXT} />
          <Text style={{ color: GOLD_TEXT, fontSize: 14 }}>Wedding Blog</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : error || !post ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
          <Text style={{ fontSize: 36 }}>😕</Text>
          <Text style={{ color: '#7a5a6a', fontSize: 15, textAlign: 'center' }}>{error || 'Post not found'}</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: BRAND, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
            <Text style={{ color: GOLD_TEXT, fontWeight: '700' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
          {/* Cover image */}
          {post.cover_image_url ? (
            <Image source={{ uri: post.cover_image_url }} style={{ width: '100%', height: 220 }} resizeMode="cover" />
          ) : (
            <View style={{ height: 120, backgroundColor: '#3d0d28', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 48 }}>💍</Text>
            </View>
          )}

          <View style={{ padding: 20, gap: 14 }}>
            {/* Meta */}
            <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 11, color: '#9a7a85' }}>✍️ {post.author}</Text>
              <Text style={{ fontSize: 11, color: '#9a7a85' }}>🕐 {post.read_time} min read</Text>
              <Text style={{ fontSize: 11, color: '#9a7a85' }}>{date}</Text>
            </View>

            {/* Title */}
            <Text style={{ fontSize: 22, fontWeight: '900', color: BRAND, lineHeight: 30 }}>{post.title}</Text>

            {/* Divider */}
            <View style={{ height: 2, backgroundColor: '#f0e0e8', borderRadius: 1 }} />

            {/* Excerpt / content */}
            {post.excerpt ? (
              <Text style={{ fontSize: 15, color: '#5a3a45', lineHeight: 24, fontStyle: 'italic' }}>{post.excerpt}</Text>
            ) : null}

            {post.content ? (
              <Text style={{ fontSize: 15, color: '#2a1a1f', lineHeight: 26 }}>{post.content}</Text>
            ) : (
              <View style={{ paddingVertical: 32, alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 24 }}>📖</Text>
                <Text style={{ color: '#9a7a85', fontSize: 14, textAlign: 'center' }}>
                  Full article available on wedmangal.com
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
