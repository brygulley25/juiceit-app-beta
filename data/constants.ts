import { Mood, Goal } from '@/types/app';

export const MOODS: Mood[] = [
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'stressed', label: 'Stressed', emoji: '😰' },
  { id: 'bloated', label: 'Bloated', emoji: '🤢' },
  { id: 'foggy', label: 'Foggy', emoji: '🌫️' },
  { id: 'sore', label: 'Sore', emoji: '😣' },
  { id: 'under-the-weather', label: 'Under the Weather', emoji: '🤒' },
];

export const GOALS: Goal[] = [
  { id: 'energy', label: 'Energy' },
  { id: 'focus', label: 'Focus' },
  { id: 'gut', label: 'Gut Health' },
  { id: 'skin', label: 'Skin Health' },
  { id: 'immunity', label: 'Immunity' },
  { id: 'blood-pressure', label: 'Blood Pressure' },
];