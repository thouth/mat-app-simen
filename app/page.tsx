'use client';

import { useEffect, useState } from 'react';

type Item = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  state: 'SHOPPING' | 'PANTRY';
};

type Food = {
  id: number|string;
  name: string;
  group?: string|null;
  aliases?: string[];
  defaultUnit?: string|null;
};

function TabBar({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const tabs = ['Handleliste','Matlager','Søk'];
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t bg-white/90 backdrop-blur p-2 grid grid-cols-3 gap-2">
      {tabs.map(t => (
        <button key={t} onClick={() => setTab(t)} className={`py-2 rounded-xl ${tab===t?'bg-black text-white':'bg-gray-100'}`}>{t}</button>
      ))}
    </nav>
  );
}

export default function Home() {
  const [tab, setTab] = useState('Handleliste');
  const [shopping, setShopping] = useState<Item[]>([]);
  const [pantry, setPantry] = useState<Item[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);

  async function refresh() {
    const [s, p] = await Promise.all([
      fetch('/api/items?state=SHOPPING').then(r=>r.json()),
      fetch('/api/items?state=PANTRY').then(r=>r.json())
    ]);
    setShopping(s); setPantry(p);
  }
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    const id = setTimeout(async () => {
      if (!query) { setResults([]); return; }
      const res = await fetch(`/api/foods?q=${encodeURIComponent(query)}`).then(r=>r.json());
      setResults(res);
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  async function addToShopping(food: Food) {
    await fetch('/api/items', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      foodId: food.id, name: food.name, quantity: 1, unit: food.defaultUnit || 'stk', state: 'SHOPPING'
    })});
    setQuery(''); setResults([]); await refresh();
  }
  async function markBought(item: Item) {
    await fetch(`/api/items/${item.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ state:'PANTRY' }) });
    await refresh();
  }
  async function removeItem(item: Item) {
    await fetch(`/api/items/${item.id}`, { method:'DELETE' });
    await refresh();
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-24">
      {tab === 'Søk' && (
        <section>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Søk i Matvaretabellen (f.eks. melk)"
            className="w-full border rounded-xl p-3" />
          <ul className="mt-3 space-y-2">
            {results.map(r => (
              <li key={String(r.id)} className="border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.name}</div>
                  {r.group && <div className="text-xs text-gray-500">{r.group}</div>}
                </div>
                <button onClick={() => addToShopping(r)} className="px-3 py-2 rounded-lg bg-black text-white">Legg til</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'Handleliste' && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Handleliste</h2>
          {shopping.length===0 ? <p className="text-gray-500">Tom handleliste</p> : (
            <ul className="space-y-2">
              {shopping.map(it => (
                <li key={it.id} className="border rounded-xl p-3 flex items-center justify-between">
                  <div><span className="font-medium">{it.name}</span> <span className="text-sm text-gray-500">× {it.quantity} {it.unit}</span></div>
                  <div className="flex gap-2">
                    <button onClick={() => markBought(it)} className="px-3 py-2 rounded-lg bg-green-600 text-white">Markér som kjøpt</button>
                    <button onClick={() => removeItem(it)} className="px-3 py-2 rounded-lg bg-gray-100">Slett</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'Matlager' && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Matlager</h2>
          {pantry.length===0 ? <p className="text-gray-500">Ingen varer i matlageret</p> : (
            <ul className="space-y-2">
              {pantry.map(it => (
                <li key={it.id} className="border rounded-xl p-3 flex items-center justify-between">
                  <div><span className="font-medium">{it.name}</span> <span className="text-sm text-gray-500">× {it.quantity} {it.unit}</span></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <TabBar tab={tab} setTab={setTab} />
    </main>
  );
}
