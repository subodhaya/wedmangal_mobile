import {
  ScrollView, Text, View, TouchableOpacity, Image,
  ActivityIndicator, FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

const BRAND = '#5e143f';
const GOLD_TEXT = '#f9e79f';

const CATEGORIES = [
  { value: '',                label: 'All Posts' },
  { value: 'tamil-weddings',  label: 'Tamil Weddings' },
  { value: 'wedding-rituals', label: 'Wedding Rituals' },
  { value: 'wedding-tips',    label: 'Wedding Tips' },
  { value: 'vendor-tips',     label: 'Vendor Tips' },
  { value: 'real-weddings',   label: 'Real Weddings' },
];

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
}

function BlogCard({ post, onPress }: { post: BlogPost; onPress: () => void }) {
  const catLabel = CATEGORIES.find(c => c.value === post.category)?.label ?? post.category ?? '';
  const date = new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden',
        marginBottom: 16, borderWidth: 1, borderColor: '#f0e6ea',
        elevation: 2, shadowColor: BRAND, shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
      }}
    >
      {/* Cover image */}
      <View style={{ height: 160, backgroundColor: '#f5e8ee' }}>
        {post.cover_image_url ? (
          <Image source={{ uri: post.cover_image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 40 }}>💍</Text>
          </View>
        )}
        {catLabel ? (
          <View style={{
            position: 'absolute', top: 10, left: 10,
            backgroundColor: 'rgba(94,20,63,0.88)', borderRadius: 20,
            paddingHorizontal: 10, paddingVertical: 4,
          }}>
            <Text style={{ color: GOLD_TEXT, fontSize: 11, fontWeight: '600' }}>{catLabel}</Text>
          </View>
        ) : null}
      </View>

      {/* Body */}
      <View style={{ padding: 14, gap: 6 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#1a0a12' }} numberOfLines={2}>{post.title}</Text>
        <Text style={{ fontSize: 13, color: '#7a5a6a', lineHeight: 19 }} numberOfLines={2}>{post.excerpt}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
          <Text style={{ fontSize: 11, color: '#9a7a85' }}>✍️ {post.author}</Text>
          <Text style={{ fontSize: 11, color: '#9a7a85' }}>🕐 {post.read_time} min read</Text>
          <Text style={{ fontSize: 11, color: '#9a7a85' }}>{date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function BlogListScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    apiClient.getBlogPosts(activeCategory ? { category: activeCategory } : undefined)
      .then(r => setPosts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <IconSymbol size={20} name="chevron.left" color={GOLD_TEXT} />
          <Text style={{ color: GOLD_TEXT, fontSize: 14 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: GOLD_TEXT, fontSize: 24, fontWeight: '900' }}>Wedding Blog</Text>
        <Text style={{ color: '#f5d0e0', fontSize: 13, marginTop: 2 }}>Tamil weddings, rituals & tips</Text>
      </View>

      {/* Category filter pills */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        style={{ backgroundColor: '#fdf8f0', borderBottomWidth: 1, borderBottomColor: '#e8d5de' }}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.value}
            onPress={() => setActiveCategory(cat.value)}
            style={{
              paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
              backgroundColor: activeCategory === cat.value ? BRAND : '#fff',
              borderWidth: 1.5,
              borderColor: activeCategory === cat.value ? BRAND : '#e8d5de',
            }}
          >
            <Text style={{
              fontSize: 12, fontWeight: '700',
              color: activeCategory === cat.value ? GOLD_TEXT : '#7a5a6a',
            }}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : posts.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Text style={{ fontSize: 40 }}>📝</Text>
          <Text style={{ color: '#7a5a6a', fontSize: 15 }}>No blog posts yet</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={p => String(p.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <BlogCard
              post={item}
              onPress={() => router.push(`/blog/${item.slug}` as any)}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}
