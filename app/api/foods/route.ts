import { NextResponse } from 'next/server'

let FOODS_CACHE: any[] | null = null
let lastFetch = 0
const ONE_DAY = 24 * 60 * 60 * 1000

function cleanFood(raw: any) {
  const id = raw?.id ?? raw?.foodId ?? raw?.code
  const name = raw?.name ?? raw?.displayName ?? raw?.foodName
  const group = raw?.group?.name ?? raw?.foodGroup ?? raw?.groupName ?? null
  const aliases: string[] = raw?.aliases ?? raw?.synonyms ?? []
  const defaultUnit = raw?.unit ?? null
  return { id, name, group, aliases, defaultUnit }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').toLowerCase()

  const shouldRefresh = !FOODS_CACHE || Date.now() - lastFetch > ONE_DAY
  if (shouldRefresh) {
    try {
      const res = await fetch('https://www.matvaretabellen.no/api/nb/foods.json', { next: { revalidate: 86400 } })
      const data = await res.json()
      const array = Array.isArray(data) ? data : (data?.foods ?? [])
      FOODS_CACHE = array.map(cleanFood).filter((x: any) => x.id && x.name)
      lastFetch = Date.now()
    } catch (e) {
      FOODS_CACHE = []
    }
  }

  const results = (FOODS_CACHE || []).filter((f: any) =>
    !q || f.name?.toLowerCase().includes(q) || f.aliases?.some((a: string) => a.toLowerCase().includes(q))
  ).slice(0, 25)

  return NextResponse.json(results)
}
