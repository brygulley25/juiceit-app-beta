import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { createTypographyScale, colors } from '@/styles/typography';
import { TouchableCard } from '@/components/ui/TouchableCard';
import { Goal } from '@/types/app';

interface GoalSelectorProps {
  goals: Goal[];
  onGoalSelect: (goalId: string) => void;
}

export function GoalSelector({ goals, onGoalSelect }: GoalSelectorProps) {
  const { spacing, fontSizes } = useResponsive();
  const typography = createTypographyScale(fontSizes);
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.usageBadgeContainer, { 
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
      }]}>
        {/* UsageBadge will be rendered by parent component */}
      </View>
      
      <Text style={[typography.display, { color: colors.text.primary, textAlign: 'center', marginBottom: spacing.xs }]}>
        What's your goal?
      </Text>
      <Text style={[typography.md, { color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.xl }]}>
        Pick your goal
      </Text>
      
      <View style={[styles.list, { paddingHorizontal: spacing.lg }]}>
        {goals.map((goal) => (
          <TouchableCard
            key={goal.id}
            style={styles.card}
            onPress={() => onGoalSelect(goal.id)}
          >
            <Text style={[typography.lg, { 
              color: colors.text.primary, 
              textAlign: 'center',
              fontWeight: '600'
            }]}>
              {goal.label}
            </Text>
          </TouchableCard>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  usageBadgeContainer: {
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 40,
    paddingBottom: 40,
  },
  list: {
    gap: 12,
  },
  card: {
    justifyContent: 'center',
  },
});