// =====================================================
// SUPABASE CLIENT CONFIGURATION
// =====================================================

/**
 * IMPORTANT: Replace these with your actual Supabase credentials
 *
 * To find your credentials:
 * 1. Go to https://app.supabase.com
 * 2. Select your project
 * 3. Go to Settings > API
 * 4. Copy the Project URL and anon/public key
 */

const SUPABASE_CONFIG = {
  url: 'YOUR_SUPABASE_URL', // e.g., 'https://xxxxx.supabase.co'
  anonKey: 'YOUR_SUPABASE_ANON_KEY', // Your public anon key
};

// =====================================================
// INITIALIZE SUPABASE CLIENT
// =====================================================

let supabaseClient = null;

/**
 * Initialize the Supabase client
 * This will be called automatically when the app loads
 */
function initializeSupabase() {
  // Check if Supabase library is loaded
  if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded. Make sure to include it in your HTML.');
    return null;
  }

  // Check if config is set
  if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' || SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn('Supabase credentials not configured. Using localStorage fallback.');
    return null;
  }

  try {
    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('✓ Supabase client initialized successfully');
    return supabaseClient;
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    return null;
  }
}

/**
 * Get the Supabase client instance
 */
function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = initializeSupabase();
  }
  return supabaseClient;
}

/**
 * Check if Supabase is configured and available
 */
function isSupabaseAvailable() {
  return supabaseClient !== null &&
         SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' &&
         SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY';
}

// =====================================================
// ENVIRONMENT DETECTION
// =====================================================

/**
 * Determine if we're running in production or development
 */
function getEnvironment() {
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }

  if (hostname.includes('github.io')) {
    return 'production';
  }

  return 'development';
}

// =====================================================
// EXPORT FOR USE IN APP
// =====================================================

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', () => {
  const client = initializeSupabase();

  if (client) {
    console.log(`Running in ${getEnvironment()} mode with Supabase`);
  } else {
    console.log(`Running in ${getEnvironment()} mode with localStorage fallback`);
  }
});
