import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { createTypographyScale, colors } from '@/styles/typography';
import { TouchableCard } from '@/components/ui/TouchableCard';
import { Mood } from '@/types/app';

interface MoodSelectorProps {
  moods: Mood[];
  onMoodSelect: (moodId: string) => void;
}

export function MoodSelector({ moods, onMoodSelect }: MoodSelectorProps) {
  const { spacing, fontSizes, isSmallScreen } = useResponsive();
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
        How are you feeling?
      </Text>
      <Text style={[typography.md, { color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.xl }]}>
        Pick your mood
      </Text>
      
      <View style={[styles.grid, { paddingHorizontal: isSmallScreen ? spacing.sm : spacing.lg }]}>
        {moods.map((mood) => (
          <TouchableCard
            key={mood.id}
            style={[styles.card, { 
              width: isSmallScreen ? 170 : 180,
              height: isSmallScreen ? 150 : 160,
            }]}
            onPress={() => onMoodSelect(mood.id)}
          >
            <Text style={[styles.emoji, { fontSize: isSmallScreen ? 42 : 48 }]}>{mood.emoji}</Text>
            <Text style={[typography.md, { 
              color: colors.text.primary, 
              textAlign: 'center',
              fontWeight: '600'
            }]}>
              {mood.label}
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
    paddingVertical: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    marginBottom: 8,
  },
});