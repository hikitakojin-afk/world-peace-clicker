import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hhoifxeohngrtwzcpxcx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhob2lmeGVvaG5ncnR3emNweGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODUxMTYsImV4cCI6MjA4NzE2MTExNn0.A69rmiM5KVAflEX_HPKgtru3uipRIEXUgNFstsoEDrk'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhob2lmeGVvaG5ncnR3emNweGN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU4NTExNiwiZXhwIjoyMDg3MTYxMTE2fQ.w-kNkw3YQibMSQzHp4ALP6RT1L8oudxu0BlMqRiB9-8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// サーバー側専用（service_role key使用）
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
