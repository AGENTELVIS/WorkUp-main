"use client"

import { useAuth, useSession, useUser } from '@clerk/nextjs';
import {createClient} from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function createClerkSupabaseClient(){
  const {session} = useSession()
  return createClient(
        supabaseUrl,
        supabaseKey,
        {
          async accessToken() {
            return session?.getToken() ?? null
          },
        },
  )
}
