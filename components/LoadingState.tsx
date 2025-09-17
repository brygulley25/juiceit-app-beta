import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export function LoadingState() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🧪</Text>
      <ActivityIndicator size="large" color="#22c55e" style={styles.spinner} />
      <Text style={styles.title}>Creating your perfect juice</Text>
      <Text style={styles.subtitle}>Analyzing your mood and goals...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fffe',
    padding: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  spinner: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});