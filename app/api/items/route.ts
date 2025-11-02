import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase-server'

export async function GET(req: Request) {
  const supabase = getServerSupabase()
  const { searchParams } = new URL(req.url)
  const state = searchParams.get('state')

  let query = supabase.from('items').select('*').order('added_at', { ascending: false })
  if (state) {
    query = supabase.from('items').select('*').eq('state', state).order('added_at', { ascending: false })
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = getServerSupabase()
  const body = await req.json()

  const payload = {
    food_id: body.foodId ?? null,
    name: body.name,
    quantity: body.quantity ?? 1,
    unit: body.unit ?? 'stk',
    state: body.state === 'PANTRY' ? 'PANTRY' : 'SHOPPING',
  }

  const { data, error } = await supabase.from('items').insert(payload).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
