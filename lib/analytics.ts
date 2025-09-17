import { supabase, isSupabaseConfigured } from './supabase';

interface AnalyticsProperties {
  [key: string]: string | number | boolean | null;
}

export async function track(eventName: string, properties: AnalyticsProperties = {}) {
  try {
    // Only track if Supabase is configured and user is authenticated
    if (!isSupabaseConfigured) {
      console.log(`📊 Analytics (mock): ${eventName}`, properties);
      return;
    }

    const { data: { user } } = await supabase.auth.getSession();
    
    if (!user) {
      console.log(`📊 Analytics (guest): ${eventName}`, properties);
      return;
    }

    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: user.id,
        event_name: eventName,
        properties,
      });

    if (error) {
      console.error('📊 Analytics error:', error);
    } else {
      console.log(`📊 Analytics tracked: ${eventName}`, properties);
    }
  } catch (error) {
    console.error('📊 Analytics failed:', error);
  }
}

// Predefined event types for type safety
export const AnalyticsEvents = {
  FLOW_START: 'flow_start',
  FLOW_COMPLETE: 'flow_complete', 
  SAVE_CLICKED: 'save_clicked',
  PAYWALL_VIEWED: 'paywall_viewed',
  PURCHASE_COMPLETED: 'purchase_completed',
} as const;