import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-server'

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const body = await req.json()
  const updates: Record<string, any> = {
    name: body.name,
    quantity: body.quantity,
    unit: body.unit,
    state: body.state,
    purchased_at: body.state === 'PANTRY' ? new Date().toISOString() : undefined,
    expires_at: body.expiresAt,
    notes: body.notes,
  }
  Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k])
  const { data, error } = await supabase.from('items').update(updates).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: { id: string }}) {
  const { error } = await supabase.from('items').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
