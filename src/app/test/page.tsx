'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestSupabase() {
  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase.from('products').select('*').limit(5)
      console.log(data, error)
    }

    test()
  }, [])

  return <div>Check console</div>
}
