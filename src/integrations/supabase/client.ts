
import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/environment'

import type { Database } from './types'

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
