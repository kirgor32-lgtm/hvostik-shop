import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartCtx = createContext(null)
export const useCart = () => useContext(CartCtx)

const load = (k, d) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => load('hv-cart', []))
  const [fav, setFav] = useState(() => load('hv-fav', []))
  const [open, setOpen] = useState(false)
  useEffect(() => localStorage.setItem('hv-cart', JSON.stringify(items)), [items])
  useEffect(() => localStorage.setItem('hv-fav', JSON.stringify(fav)), [fav])

  const api = useMemo(() => {
    const key = (id, w) => `${id}|${w}`
    const add = (p, v) => setItems((s) => {
      const k = key(p.id, v.w)
      const ex = s.find((i) => i.key === k)
      return ex ? s.map((i) => (i.key === k ? { ...i, qty: i.qty + 1 } : i))
        : [...s, { key: k, id: p.id, line: p.line, name: p.name, img: p.img, w: v.w, price: v.price, qty: 1 }]
    })
    const setQty = (k, q) => setItems((s) => (q <= 0 ? s.filter((i) => i.key !== k) : s.map((i) => (i.key === k ? { ...i, qty: q } : i))))
    const qtyOf = (id, w) => items.find((i) => i.key === key(id, w))?.qty || 0
    const count = items.reduce((s, i) => s + i.qty, 0)
    const total = items.reduce((s, i) => s + i.qty * i.price, 0)
    const toggleFav = (id) => setFav((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
    return { items, add, setQty, qtyOf, count, total, clear: () => setItems([]), fav, toggleFav, open, setOpen }
  }, [items, fav, open])

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>
}

export const rub = (n) => n.toLocaleString('ru-RU') + ' ₽'
