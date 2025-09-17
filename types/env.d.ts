declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      EXPO_PUBLIC_STRIPE_PAYMENT_LINK: string;
      EXPO_PUBLIC_STRIPE_CUSTOMER_PORTAL: string;
    }
  }
}

// Ensure this file is treated as a module
export {};