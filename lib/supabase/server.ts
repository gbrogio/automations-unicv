import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    {
      cookies: {
        get(key) {
          return cookieStore.get(key)?.value
        },
        set(key, value, options) {
          cookieStore.set(key, value, options)
        },
        remove(key, options) {
          cookieStore.delete(key)
        },
      },
    }
  )
}