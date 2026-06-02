import {
  ScrollView, Text, View, TouchableOpacity, TextInput,
  ActivityIndicator, Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

const BRAND = '#5e143f';
const GOLD = '#c9973a';
const GOLD_TEXT = '#f9e79f';

const EXPENSE_ICONS: Record<string, string> = {
  venue: '🏛️',
  jewels: '💎',
  catering: '🍽️',
  decoration: '🌸',
  photography: '📷',
};

const EXPENSE_COLORS = ['#5e143f', '#c9973a', '#8a2057', '#e8b86d', '#b5436a'];

const DEFAULT_EXPENSES: Record<string, number> = {
  venue: 0,
  jewels: 0,
  catering: 0,
  decoration: 0,
  photography: 0,
};

// ── Simple SVG-free pie chart using bar segments ──────────────────────────────
function BudgetBar({ expenses, total }: { expenses: Record<string, number>; total: number }) {
  const entries = Object.entries(expenses).filter(([, v]) => v > 0);
  if (total === 0 || entries.length === 0) return null;

  return (
    <View style={{ marginVertical: 12 }}>
      <View style={{ flexDirection: 'row', height: 16, borderRadius: 8, overflow: 'hidden' }}>
        {entries.map(([key, val], i) => {
          const pct = (val / total) * 100;
          return (
            <View
              key={key}
              style={{ flex: pct, backgroundColor: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}
            />
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {entries.map(([key, val], i) => (
          <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }} />
            <Text style={{ fontSize: 11, color: '#7a5a6a' }}>
              {EXPENSE_ICONS[key] ?? '💰'} {key.charAt(0).toUpperCase() + key.slice(1)} ({Math.round((val / total) * 100)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function BudgetScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [totalBudget, setTotalBudget] = useState('0');
  const [expenses, setExpenses] = useState<Record<string, number>>({ ...DEFAULT_EXPENSES });
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return; }
    const pk = (user as any)?.id ?? (user as any)?._id;
    if (!pk) return;
    apiClient.getBudget(pk)
      .then(r => {
        if (r.data) {
          setTotalBudget(String(r.data.total_budget ?? 0));
          setExpenses({ ...DEFAULT_EXPENSES, ...(r.data.expenses ?? {}) });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const totalSpent = Object.values(expenses).reduce((a, b) => a + b, 0);
  const budget = parseFloat(totalBudget) || 0;
  const remaining = budget - totalSpent;
  const spentPct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

  const handleSave = async () => {
    const pk = (user as any)?.id ?? (user as any)?._id;
    if (!pk) return;
    setSaving(true);
    try {
      await apiClient.updateBudget(pk, { total_budget: budget, expenses });
      setMsg('Budget saved!');
      setTimeout(() => setMsg(''), 2500);
    } catch {
      Alert.alert('Error', 'Failed to save budget. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddExpense = () => {
    const trimmed = newName.trim().toLowerCase().replace(/\s+/g, '_');
    const amount = parseFloat(newAmount) || 0;
    if (!trimmed || amount <= 0) return;
    setExpenses(prev => ({ ...prev, [trimmed]: (prev[trimmed] ?? 0) + amount }));
    setNewName('');
    setNewAmount('');
  };

  if (loading) {
    return (
      <ScreenContainer containerClassName="bg-white">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['left', 'right']} containerClassName="bg-white">
      {/* Header */}
      <View style={{ backgroundColor: BRAND, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <IconSymbol size={20} name="chevron.left" color={GOLD_TEXT} />
          <Text style={{ color: GOLD_TEXT, fontSize: 14 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: GOLD_TEXT, fontSize: 24, fontWeight: '900' }}>💰 Budget Planner</Text>
        <Text style={{ color: '#f5d0e0', fontSize: 13, marginTop: 2 }}>Track your wedding expenses</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        {msg ? (
          <View style={{ backgroundColor: '#f0fdf4', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#86efac' }}>
            <Text style={{ color: '#16a34a', fontWeight: '700', textAlign: 'center' }}>{msg}</Text>
          </View>
        ) : null}

        {/* Total Budget input */}
        <View style={{ backgroundColor: '#fdf8f0', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e8d5de' }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#9a7a85', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            Total Wedding Budget
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: BRAND }}>₹</Text>
            <TextInput
              value={totalBudget}
              onChangeText={setTotalBudget}
              keyboardType="numeric"
              style={{
                flex: 1, fontSize: 28, fontWeight: '900', color: BRAND,
                borderBottomWidth: 2, borderBottomColor: BRAND, paddingBottom: 4,
              }}
              placeholder="0"
              placeholderTextColor="#c9b0bc"
            />
          </View>
        </View>

        {/* Progress bar */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e8d5de' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: '#9a7a85' }}>Spent</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: BRAND }}>
              ₹{totalSpent.toLocaleString('en-IN')} / ₹{budget.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={{ height: 10, backgroundColor: '#f0e0e8', borderRadius: 5, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${spentPct}%`, backgroundColor: spentPct >= 90 ? '#ef4444' : BRAND, borderRadius: 5 }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={{ fontSize: 12, color: '#9a7a85' }}>{Math.round(spentPct)}% used</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: remaining >= 0 ? '#16a34a' : '#ef4444' }}>
              {remaining >= 0 ? `₹${remaining.toLocaleString('en-IN')} remaining` : `₹${Math.abs(remaining).toLocaleString('en-IN')} over budget!`}
            </Text>
          </View>

          <BudgetBar expenses={expenses} total={totalSpent} />
        </View>

        {/* Expense categories */}
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: BRAND }}>Expense Breakdown</Text>
          {Object.entries(expenses).map(([key, val]) => (
            <View key={key} style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#fdf8f0', borderRadius: 12, padding: 14,
              borderWidth: 1, borderColor: '#e8d5de',
            }}>
              <Text style={{ fontSize: 22, marginRight: 10 }}>{EXPENSE_ICONS[key] ?? '💰'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: '#7a5a6a', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</Text>
              </View>
              <TextInput
                value={val > 0 ? String(val) : ''}
                onChangeText={t => setExpenses(prev => ({ ...prev, [key]: parseFloat(t) || 0 }))}
                keyboardType="numeric"
                style={{ fontSize: 15, fontWeight: '700', color: BRAND, textAlign: 'right', minWidth: 80 }}
                placeholder="0"
                placeholderTextColor="#c9b0bc"
              />
            </View>
          ))}
        </View>

        {/* Add custom expense */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e8d5de', gap: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: BRAND }}>+ Add Custom Expense</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Category name"
              placeholderTextColor="#c9b0bc"
              style={{ flex: 1, borderWidth: 1.5, borderColor: '#e8d5de', borderRadius: 10, padding: 10, fontSize: 14, color: '#1a0a12', backgroundColor: '#fdf8f0' }}
            />
            <TextInput
              value={newAmount}
              onChangeText={setNewAmount}
              placeholder="₹ Amount"
              keyboardType="numeric"
              placeholderTextColor="#c9b0bc"
              style={{ width: 100, borderWidth: 1.5, borderColor: '#e8d5de', borderRadius: 10, padding: 10, fontSize: 14, color: '#1a0a12', backgroundColor: '#fdf8f0' }}
            />
          </View>
          <TouchableOpacity
            onPress={handleAddExpense}
            style={{ backgroundColor: '#f5e4ec', borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
          >
            <Text style={{ color: BRAND, fontWeight: '700', fontSize: 14 }}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{ backgroundColor: BRAND, borderRadius: 14, paddingVertical: 16, alignItems: 'center', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? (
            <ActivityIndicator color={GOLD_TEXT} />
          ) : (
            <Text style={{ color: GOLD_TEXT, fontWeight: '800', fontSize: 16 }}>Save Budget</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
