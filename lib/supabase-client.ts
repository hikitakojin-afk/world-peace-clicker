import { createClient } from '@supabase/supabase-js'

// 環境変数（ビルド時に埋め込み）
const supabaseUrl = 'https://hhoifxeohngrtwzcpxcx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhob2lmeGVvaG5ncnR3emNweGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODUxMTYsImV4cCI6MjA4NzE2MTExNn0.A69rmiM5KVAflEX_HPKgtru3uipRIEXUgNFstsoEDrk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
