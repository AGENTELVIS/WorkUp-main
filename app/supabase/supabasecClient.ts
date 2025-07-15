"use client"

import { useSession } from '@clerk/nextjs';
import {createClient} from '@supabase/supabase-js'
import { useEffect, useState } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// For use outside React components (no hooks)
export function createClerkSupabaseClientWithToken(token: string | null) {
  return createClient(
    supabaseUrl,
    supabaseKey,
    {
      async accessToken() {
        return token ?? null;
      },
    },
  );
}

// For use inside React components
export function useClerkSupabaseClient() {
  const { session } = useSession();
  const [client, setClient] = useState(() => createClerkSupabaseClientWithToken(null));

  useEffect(() => {
    let isMounted = true;
    async function updateClient() {
      const token = session ? await session.getToken() : null;
      if (isMounted) {
        setClient(createClerkSupabaseClientWithToken(token));
      }
    }
    updateClient();
    return () => { isMounted = false; };
  }, [session]);

  return client;
}

// Default export for compatibility: use as a hook in React components
export default function createClerkSupabaseClient() {
  return useClerkSupabaseClient();
}
