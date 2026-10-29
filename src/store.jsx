import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

// Данные из localStorage читаются ПОСЛЕ гидрации — иначе HTML с сервера и первый рендер не совпадут
function usePersist(key, initial) {
  const [v, setV] = useState(initial)
  const loaded = useRef(false)
  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(key)); if (s !== null) setV(s) } catch { /* пусто */ }
    loaded.current = true
  }, [key])
  useEffect(() => { if (loaded.current) localStorage.setItem(key, JSON.stringify(v)) }, [key, v])
  return [v, setV]
}

export function StoreProvider({ children }) {
  const [items, setItems] = usePersist('hv-cart', [])
  const [fav, setFav] = usePersist('hv-fav', [])
  const [user, setUser] = usePersist('hv-user', null)
  const [orders, setOrders] = usePersist('hv-orders', [])
  const [panel, setPanel] = useState(null) // 'cart' | 'fav' | 'profile' | 'menu'
  const [checkout, setCheckout] = useState(false)

  const api = useMemo(() => {
    const key = (id, w) => `${id}|${w}`
    const add = (p, v) => setItems((s) => {
      const k = key(p.id, v.w)
      return s.some((i) => i.key === k) ? s.map((i) => (i.key === k ? { ...i, qty: i.qty + 1 } : i))
        : [...s, { key: k, id: p.id, line: p.line, name: p.name, w: v.w, price: v.price, qty: 1 }]
    })
    const setQty = (k, q) => setItems((s) => (q <= 0 ? s.filter((i) => i.key !== k) : s.map((i) => (i.key === k ? { ...i, qty: q } : i))))
    const qtyOf = (id, w) => items.find((i) => i.key === key(id, w))?.qty || 0
    const count = items.reduce((s, i) => s + i.qty, 0)
    const total = items.reduce((s, i) => s + i.qty * i.price, 0)
    const toggleFav = (id) => setFav((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
    const placeOrder = (contact) => {
      const o = { n: String(Date.now()).slice(-6), date: new Date().toLocaleDateString('ru-RU'), items, total, contact }
      setOrders((s) => [o, ...s])
      if (!user) setUser({ name: contact.name, phone: contact.phone })
      setItems([])
      return o
    }
    return { items, add, setQty, qtyOf, count, total, fav, toggleFav, user, setUser, orders, placeOrder, panel, setPanel, checkout, setCheckout }
  }, [items, fav, user, orders, panel, checkout])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export const rub = (n) => n.toLocaleString('ru-RU').replace(/\u00a0|\u202f/g, ' ') + ' ₽'

export const fmtPhone = (raw) => {
  let d = raw.replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('8')) d = '7' + d.slice(1)
  if (!d.startsWith('7')) d = '7' + d
  const p = d.slice(1, 11)
  let s = '+7'
  if (p.length) s += ' (' + p.slice(0, 3)
  if (p.length >= 3) s += ')'
  if (p.length > 3) s += ' ' + p.slice(3, 6)
  if (p.length > 6) s += '-' + p.slice(6, 8)
  if (p.length > 8) s += '-' + p.slice(8, 10)
  return s
}
