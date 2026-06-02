import {
  ScrollView, Text, View, TouchableOpacity, TextInput,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as storage from "@/lib/storage";
import { useEffect } from "react";

const BRAND = '#5e143f';
const GOLD = '#c9973a';
const GOLD_TEXT = '#f9e79f';

const FUNCTIONS_OPTIONS = [
  { val: '1', label: '1 Function', desc: 'Just the wedding' },
  { val: '2', label: '2 Functions', desc: 'Engagement + Wedding' },
  { val: '3', label: '3+ Functions', desc: 'Full celebrations' },
];

interface Step {
  id: string;
  icon: string;
  title: string;
  desc: string;
  category: string;
  done: boolean;
}

const BASE_STEPS: Omit<Step, 'done'>[] = [
  { id: 's1',  icon: '📅', title: 'Fix the Wedding Date',     desc: 'Choose an auspicious date with your family and pandit.', category: 'Planning' },
  { id: 's2',  icon: '🏛️', title: 'Book the Venue',           desc: 'Secure your hall or outdoor venue early — they book fast.', category: 'Venue' },
  { id: 's3',  icon: '💰', title: 'Set Your Budget',          desc: 'Plan how much to spend on each category.', category: 'Planning' },
  { id: 's4',  icon: '📷', title: 'Book Photographer',        desc: 'Reserve a photographer and videographer for your big day.', category: 'Photography' },
  { id: 's5',  icon: '💄', title: 'Book Makeup Artist',       desc: 'Shortlist bridal makeup artists and do a trial.', category: 'Makeup' },
  { id: 's6',  icon: '🍽️', title: 'Finalise Caterer',         desc: 'Choose a caterer and decide the menu with your family.', category: 'Catering' },
  { id: 's7',  icon: '🌸', title: 'Book Decorator',           desc: 'Select a decorator for mandap, hall, and entrance.', category: 'Decor' },
  { id: 's8',  icon: '🎶', title: 'Book DJ / Music',          desc: 'Hire a DJ or nadaswaram artist for the ceremonies.', category: 'Entertainment' },
  { id: 's9',  icon: '✉️', title: 'Send Invitations',         desc: 'Design and distribute wedding cards — physical or digital.', category: 'Invitations' },
  { id: 's10', icon: '💎', title: 'Jewellery Shopping',        desc: 'Visit jewellers for bridal and groom jewellery.', category: 'Shopping' },
  { id: 's11', icon: '🕌', title: 'Book Pandit / Priest',     desc: 'Confirm the pandit for all ceremonies and rituals.', category: 'Rituals' },
  { id: 's12', icon: '🚗', title: 'Arrange Transport',        desc: 'Book wedding cars and guest transport.', category: 'Logistics' },
  { id: 's13', icon: '🌿', title: 'Book Mehandi Artist',      desc: 'Schedule a mehandi artist for the bride and family.', category: 'Makeup' },
  { id: 's14', icon: '🎁', title: 'Plan Return Gifts',        desc: 'Decide on return gifts for guests.', category: 'Shopping' },
  { id: 's15', icon: '📋', title: 'Final Checklist Review',   desc: 'One week before — verify all bookings and confirmations.', category: 'Planning' },
];

const BUDGET_MARKS = [50000, 100000, 300000, 500000, 1000000, 2000000, 5000000];

const formatBudget = (val: number) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)}L`;
  return `₹${(val / 1000).toFixed(0)}K`;
};

export default function PlanScreen() {
  const router = useRouter();
  const [functions, setFunctions] = useState('2');
  const [budgetIdx, setBudgetIdx] = useState(3);
  const [steps, setSteps] = useState<Step[]>(BASE_STEPS.map(s => ({ ...s, done: false })));
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    storage.getItem('weddingPlanSteps').then(data => {
      if (data) {
        try {
          const saved = JSON.parse(data);
          setSteps(BASE_STEPS.map(s => ({ ...s, done: saved[s.id] ?? false })));
          setGenerated(true);
        } catch {}
      }
    });
  }, []);

  const saveProgress = (updated: Step[]) => {
    const map: Record<string, boolean> = {};
    updated.forEach(s => { map[s.id] = s.done; });
    storage.setItem('weddingPlanSteps', JSON.stringify(map));
  };

  const toggleStep = (id: string) => {
    const updated = steps.map(s => s.id === id ? { ...s, done: !s.done } : s);
    setSteps(updated);
    saveProgress(updated);
  };

  const handleGenerate = () => setGenerated(true);

  const handleReset = () => {
    Alert.alert('Reset Plan', 'Clear all progress?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive', onPress: () => {
          const reset = steps.map(s => ({ ...s, done: false }));
          setSteps(reset);
          saveProgress(reset);
          setGenerated(false);
        },
      },
    ]);
  };

  const doneCount = steps.filter(s => s.done).length;
  const progress = Math.round((doneCount / steps.length) * 100);
  const budget = BUDGET_MARKS[budgetIdx];

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <IconSymbol size={20} name="chevron.left" color={GOLD_TEXT} />
          <Text style={{ color: GOLD_TEXT, fontSize: 14 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: GOLD_TEXT, fontSize: 24, fontWeight: '900' }}>📋 Wedding Planner</Text>
        <Text style={{ color: '#f5d0e0', fontSize: 13, marginTop: 2 }}>Your step-by-step wedding checklist</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {!generated ? (
          /* ── Setup form ── */
          <View style={{ gap: 16 }}>
            {/* Functions */}
            <View style={{ backgroundColor: '#fdf8f0', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e8d5de' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: BRAND, marginBottom: 12 }}>How many functions?</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {FUNCTIONS_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.val}
                    onPress={() => setFunctions(opt.val)}
                    style={{
                      flex: 1, borderRadius: 12, padding: 12, alignItems: 'center',
                      backgroundColor: functions === opt.val ? BRAND : '#fff',
                      borderWidth: 1.5, borderColor: functions === opt.val ? BRAND : '#e8d5de',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: functions === opt.val ? GOLD_TEXT : '#7a5a6a' }}>
                      {opt.label}
                    </Text>
                    <Text style={{ fontSize: 10, color: functions === opt.val ? '#f5d0e0' : '#9a7a85', marginTop: 2 }}>
                      {opt.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Budget slider */}
            <View style={{ backgroundColor: '#fdf8f0', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e8d5de' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: BRAND, marginBottom: 4 }}>Total Budget</Text>
              <Text style={{ fontSize: 26, fontWeight: '900', color: BRAND, textAlign: 'center', marginBottom: 12 }}>
                {formatBudget(budget)}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 4 }}>
                {BUDGET_MARKS.map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setBudgetIdx(i)}
                    style={{
                      flex: 1, height: 10, borderRadius: 5,
                      backgroundColor: i <= budgetIdx ? BRAND : '#e8d5de',
                    }}
                  />
                ))}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                <Text style={{ fontSize: 10, color: '#9a7a85' }}>₹50K</Text>
                <Text style={{ fontSize: 10, color: '#9a7a85' }}>₹50L</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleGenerate}
              style={{ backgroundColor: BRAND, borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: GOLD_TEXT, fontWeight: '800', fontSize: 16 }}>Generate My Plan ✨</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── Checklist ── */
          <View style={{ gap: 14 }}>
            {/* Progress card */}
            <View style={{ backgroundColor: '#3d0d28', borderRadius: 16, padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: GOLD_TEXT, fontWeight: '700', fontSize: 14 }}>Progress</Text>
                <Text style={{ color: GOLD_TEXT, fontWeight: '800', fontSize: 14 }}>{doneCount}/{steps.length} done</Text>
              </View>
              <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${progress}%`, backgroundColor: GOLD, borderRadius: 4 }} />
              </View>
              <Text style={{ color: '#f5d0e0', fontSize: 12, marginTop: 6 }}>{progress}% complete</Text>
            </View>

            {/* Meta badges */}
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <View style={{ backgroundColor: '#f5e4ec', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ fontSize: 12, color: BRAND, fontWeight: '700' }}>🎊 {functions === '1' ? '1 Function' : functions === '2' ? '2 Functions' : '3+ Functions'}</Text>
              </View>
              <View style={{ backgroundColor: '#f5e4ec', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ fontSize: 12, color: BRAND, fontWeight: '700' }}>💰 Budget: {formatBudget(budget)}</Text>
              </View>
            </View>

            {/* Steps */}
            {steps.map(step => (
              <TouchableOpacity
                key={step.id}
                onPress={() => toggleStep(step.id)}
                activeOpacity={0.85}
                style={{
                  flexDirection: 'row', alignItems: 'flex-start', gap: 12,
                  backgroundColor: step.done ? '#f0fdf4' : '#fff',
                  borderRadius: 14, padding: 14,
                  borderWidth: step.done ? 1.5 : 1,
                  borderColor: step.done ? '#86efac' : '#e8d5de',
                }}
              >
                <View style={{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: step.done ? '#22C55E' : BRAND,
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Text style={{ fontSize: step.done ? 16 : 14 }}>{step.done ? '✓' : step.icon}</Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{
                    fontSize: 14, fontWeight: '700',
                    color: step.done ? '#16a34a' : '#1a0a12',
                    textDecorationLine: step.done ? 'line-through' : 'none',
                  }}>
                    {step.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#9a7a85', lineHeight: 17 }}>{step.desc}</Text>
                  <View style={{ backgroundColor: step.done ? '#dcfce7' : '#f5e4ec', alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2 }}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: step.done ? '#16a34a' : BRAND }}>{step.category}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/search' as any)}
                  style={{ backgroundColor: step.done ? '#dcfce7' : BRAND, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, flexShrink: 0 }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: step.done ? '#16a34a' : GOLD_TEXT }}>
                    {step.done ? 'Booked ✓' : 'Book →'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={handleReset}
              style={{ borderWidth: 1.5, borderColor: '#e8d5de', borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginTop: 4 }}
            >
              <Text style={{ color: '#9a7a85', fontWeight: '600', fontSize: 14 }}>Reset Plan</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
