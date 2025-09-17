import { createClient } from '@supabase/supabase-js';

// Get environment variables with proper validation
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration Check:');
console.log('- URL exists:', !!supabaseUrl);
console.log('- Key exists:', !!supabaseAnonKey);
console.log('- URL value:', supabaseUrl ? `${supabaseUrl.substring(0, 40)}...` : 'undefined');

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'placeholder-key' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseUrl.includes('.supabase.co');

console.log('- Is configured:', isSupabaseConfigured);

// Only create client if properly configured
let supabase: any = null;

if (isSupabaseConfigured) {
  console.log('✅ Creating real Supabase client');
  supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'juiceit-app@1.0.0',
      },
    },
  });
} else {
  console.log('⚠️ Creating mock Supabase client - configuration invalid');
  // Create a mock client that will always fail gracefully
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: null }),
    },
    functions: {
      invoke: (functionName: string, options?: any) => {
        console.log(`🚫 Mock Supabase: Cannot invoke function '${functionName}' - Supabase not configured`);
        return Promise.resolve({ data: null, error: new Error('Supabase not configured') });
      },
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
      insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    }),
  };
}

// Add function to test edge function connectivity
export const testEdgeFunction = async () => {
  if (!isSupabaseConfigured) {
    console.log('🚫 Cannot test edge function - Supabase not configured');
    return false;
  }

  try {
    console.log('🧪 Testing edge function connectivity...');
    const { data, error } = await supabase.functions.invoke('generate-recipe', {
      body: { mood: 'tired', goal: 'energy' }
    });

    if (error) {
      console.error('❌ Edge function test failed:', error);
      return false;
    }

    console.log('✅ Edge function test successful');
    return true;
  } catch (err) {
    console.error('💥 Edge function test error:', err);
    return false;
  }
};

export { supabase, isSupabaseConfigured };