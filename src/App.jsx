import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search, ShoppingBag, Heart, User, MapPin, Menu, X, Minus, Plus, ChevronRight, Phone, Clock, LogOut, Package,
  Drumstick, Scale, HeartPulse, ShieldCheck, Factory, BadgeCheck, Check, Trash2, Loader2, Send, PawPrint, LayoutGrid,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { StoreProvider, useStore, rub, fmtPhone } from './store'
import {
  contacts, products, catalogMenu, searchHints, benefits, stats, special, checks, posts, contactTopics, faq, pages,
} from './data'

const icons = { Drumstick, Scale, HeartPulse, ShieldCheck, Factory, BadgeCheck }
const blackBtn = 'h-11 rounded-[10px] bg-ink px-5 text-sm font-semibold lowercase text-white hover:bg-[#222]'
const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
const ALL = { kind: 'all', age: 'all', q: '' }

export default function App() {
  const [filter, setFilter] = useState(ALL)
  const [page, setPage] = useState(null)
  const [topic, setTopic] = useState('pick')
  const nav = useMemo(() => ({
    show: (f) => { setFilter({ ...ALL, ...f }); setTimeout(() => scrollTo('catalog'), 30) },
    page: setPage,
    contact: (t) => { if (t) setTopic(t); setTimeout(() => scrollTo('contacts'), 30) },
    go: scrollTo,
  }), [])
  return (
    <StoreProvider>
      <Header filter={filter} setFilter={setFilter} nav={nav} />
      <main>
        <Hero nav={nav} />
        <Benefits />
        <Catalog filter={filter} setFilter={setFilter} />
        <Mission />
        <Special nav={nav} />
        <Checks />
        <Blog />
        <Contacts topic={topic} setTopic={setTopic} />
        <Faq />
      </main>
      <Footer nav={nav} />
      <Panels nav={nav} />
      <Messengers />
      <Dialog open={!!page} onOpenChange={(o) => !o && setPage(null)}>
        <DialogContent className="max-w-[560px] rounded-[20px] p-7">
          <DialogTitle className="text-2xl font-extrabold lowercase">{pages[page]?.title}</DialogTitle>
          <DialogDescription className="sr-only">Информация</DialogDescription>
          <ul className="space-y-3 text-[15px] leading-relaxed">
            {pages[page]?.body.map((t) => <li key={t} className="flex gap-2"><Check className="mt-1 size-4 shrink-0 text-violet-dark" />{t}</li>)}
          </ul>
        </DialogContent>
      </Dialog>
    </StoreProvider>
  )
}

/* ---------------- значки мессенджеров (свои) ---------------- */
function TgIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#27a6e5" />
      <path d="M5.4 11.7l11.1-4.3c.5-.2 1 .1.8.9l-1.9 8.9c-.1.6-.5.8-1 .5l-2.8-2.1-1.4 1.3c-.2.2-.3.3-.6.3l.2-2.9 5.2-4.7c.2-.2 0-.3-.3-.1L8.3 13.6l-2.8-.9c-.6-.2-.6-.6.1-.9z" fill="#fff" />
    </svg>
  )
}
function MaxIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs><linearGradient id="mx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4cc3ff" /><stop offset=".55" stopColor="#5b5cf6" /><stop offset="1" stopColor="#a93cf0" /></linearGradient></defs>
      <rect width="24" height="24" rx="7" fill="url(#mx)" />
      <path d="M12 5.5a6.5 6.5 0 0 0-5.6 9.8L5.6 18.4l3.2-.8A6.5 6.5 0 1 0 12 5.5z" fill="#fff" />
    </svg>
  )
}
function MessengerButtons({ className, size = 'md' }) {
  const h = size === 'lg' ? 'h-12 px-5 text-[15px]' : 'h-10 px-4 text-sm'
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <a href={contacts.telegram} target="_blank" rel="noreferrer" className={cn('flex items-center gap-2 rounded-[10px] bg-white font-semibold shadow-card hover:bg-gray-1', h)}>
        <TgIcon className="size-5" /> написать в telegram
      </a>
      <a href={contacts.max} target="_blank" rel="noreferrer" className={cn('flex items-center gap-2 rounded-[10px] bg-white font-semibold shadow-card hover:bg-gray-1', h)}>
        <MaxIcon className="size-5" /> написать в max
      </a>
    </div>
  )
}

/* ---------------- логотип ---------------- */
function Logo({ light }) {
  return (
    <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="flex shrink-0 items-center gap-2" aria-label="Хвостик — на главную">
      <span className="relative flex size-11 items-center justify-center rounded-[12px] bg-tang text-white">
        <PawPrint className="size-6" strokeWidth={2.2} />
        <svg viewBox="0 0 20 20" className="absolute -right-2 -top-2 size-5" aria-hidden>
          <path d="M3 17c6-1 11-6 13-14" stroke={light ? '#fff' : '#000'} strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      </span>
      <span className={cn('text-[22px] font-extrabold lowercase leading-none tracking-tight', light && 'text-white')}>хвостик</span>
    </a>
  )
}

/* ---------------- шапка ---------------- */
function Header({ filter, setFilter, nav }) {
  const st = useStore()
  const [cat, setCat] = useState(false)
  const catRef = useRef(null)
  useEffect(() => {
    const close = (e) => { if (!catRef.current?.contains(e.target)) setCat(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])
  const top = [
    ['где купить', () => nav.page('where')],
    ['доставка и оплата', () => nav.page('delivery')],
    ['блог', () => nav.go('blog')],
    ['контакты', () => nav.contact()],
  ]
  return (
    <header id="top" className="sticky top-0 z-40 border-b border-gray-2 bg-white">
      <div className="wrap flex h-[68px] items-center gap-4 lg:gap-6">
        <button className="lg:hidden" onClick={() => st.setPanel('menu')} aria-label="Меню"><Menu /></button>
        <Logo />
        <button onClick={() => nav.page('delivery')} className="hidden items-center gap-2 rounded-[10px] bg-gray-1 px-4 py-2.5 text-sm md:flex">
          <MapPin className="size-4 text-violet" /> <span className="text-txt-2">доставка:</span> Москва
        </button>
        <nav className="hidden gap-6 text-sm text-txt-2 xl:flex">
          {top.map(([l, fn]) => <button key={l} onClick={fn} className="hover:text-ink">{l}</button>)}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <a href={contacts.phoneHref} className="mr-3 hidden text-right lg:block">
            <div className="text-[15px] font-semibold">{contacts.phone}</div>
            <div className="text-xs text-txt-2">ежедневно 9:00–21:00</div>
          </a>
          <IconBtn label="Избранное" n={st.fav.length} onClick={() => st.setPanel('fav')}><Heart /></IconBtn>
          <IconBtn label="Личный кабинет" dot={!!st.user} onClick={() => st.setPanel('profile')}><User /></IconBtn>
          <IconBtn label="Корзина" n={st.count} onClick={() => st.setPanel('cart')}><ShoppingBag /></IconBtn>
        </div>
      </div>
      <div className="wrap relative flex gap-3 pb-3" ref={catRef}>
        <button onClick={() => setCat(!cat)} aria-expanded={cat} className={cn(blackBtn, 'flex h-[52px] shrink-0 items-center gap-2 px-4 text-lg sm:px-6')}>
          {cat ? <X className="size-5" /> : <LayoutGrid className="size-5" />} <span className="hidden sm:inline">каталог</span>
        </button>
        <SearchBox filter={filter} setFilter={setFilter} nav={nav} />
        {cat && (
          <div className="absolute left-5 right-5 top-[60px] z-50 grid gap-6 rounded-[16px] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,.15)] sm:grid-cols-2 lg:right-auto lg:w-[640px]">
            {catalogMenu.map((g) => (
              <div key={g.title}>
                <div className="mb-3 text-lg font-extrabold lowercase">{g.title}</div>
                <ul className="space-y-1">
                  {g.items.map((it) => (
                    <li key={it.label}>
                      <button onClick={() => { nav.show(it.f); setCat(false) }} className="flex w-full items-center justify-between rounded-[8px] px-2 py-2 text-left text-[15px] hover:bg-gray-1">
                        {it.label}
                        <span className="text-xs text-txt-2">{countFor(it.f)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
      <nav className="wrap no-scrollbar hidden gap-7 overflow-x-auto pb-3 text-[15px] lowercase lg:flex">
        <button onClick={() => nav.show({ kind: 'cat' })} className="hover:text-violet">кошкам</button>
        <button onClick={() => nav.show({ kind: 'dog' })} className="hover:text-violet">собакам</button>
        <button onClick={() => nav.show({ age: 'young' })} className="hover:text-violet">котятам и щенкам</button>
        <button onClick={() => nav.go('special')} className="hover:text-violet">особые потребности</button>
        <button onClick={() => nav.go('mission')} className="hover:text-violet">о бренде</button>
        <button onClick={() => nav.go('blog')} className="hover:text-violet">блог</button>
        <button onClick={() => nav.contact('pick')} className="hover:text-violet">помощь с выбором</button>
        <button onClick={() => nav.go('faq')} className="hover:text-violet">вопросы</button>
      </nav>
    </header>
  )
}

const matches = (p, f) => {
  const q = (f.q || '').trim().toLowerCase()
  const hay = `${p.line} ${p.name} ${p.taste} ${p.weights.map((w) => w.w).join(' ')}`.toLowerCase()
  return (!f.kind || f.kind === 'all' || p.kind === f.kind) && (!f.age || f.age === 'all' || p.age === f.age) && (!q || q.split(/\s+/).every((w) => hay.includes(w)))
}
const countFor = (f) => products.filter((p) => matches(p, { ...ALL, ...f })).length

function SearchBox({ filter, setFilter, nav }) {
  const [text, setText] = useState(filter.q)
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(-1)
  const box = useRef(null)
  useEffect(() => setText(filter.q), [filter.q])
  useEffect(() => {
    const close = (e) => { if (!box.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])
  const q = text.trim().toLowerCase()
  const found = q ? products.filter((p) => matches(p, { q })).slice(0, 5) : []
  const hints = searchHints.filter((h) => !q || (h.includes(q) && h !== q)).slice(0, q ? 4 : 8)
  const options = [...found.map((p) => ({ t: 'p', p })), ...hints.map((h) => ({ t: 'h', h }))]
  const run = (value) => { nav.show({ q: value }); setOpen(false); setHi(-1) }
  const pick = (o) => (o.t === 'p' ? run(o.p.name.toLowerCase()) : run(o.h))
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHi((h) => Math.min(options.length - 1, h + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(-1, h - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); hi >= 0 && options[hi] ? pick(options[hi]) : run(text) }
    else if (e.key === 'Escape') setOpen(false)
  }
  return (
    <div ref={box} className="relative flex-1">
      <label className="flex h-[52px] items-center gap-3 rounded-[10px] border-2 border-ink px-4">
        <Search className="size-5 shrink-0 text-txt-2" />
        <input value={text} onChange={(e) => { setText(e.target.value); setOpen(true); setHi(-1) }} onFocus={() => setOpen(true)} onKeyDown={onKey}
          role="combobox" aria-expanded={open} aria-controls="search-list" aria-label="Поиск"
          placeholder="поиск: стерилизованных, щенков, говядина" className="w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-txt-2" />
        {text && <button type="button" onClick={() => { setText(''); setFilter((f) => ({ ...f, q: '' })) }} aria-label="Очистить"><X className="size-4 text-txt-2" /></button>}
      </label>
      {open && (
        <div id="search-list" role="listbox" className="absolute inset-x-0 top-[58px] z-50 overflow-hidden rounded-[14px] bg-white py-2 shadow-[0_12px_40px_rgba(0,0,0,.15)]">
          {q && !found.length && <div className="px-4 py-3 text-sm text-txt-2">ничего не нашли по «{text}»</div>}
          {found.map((p, i) => (
            <button key={p.id} role="option" aria-selected={hi === i} onMouseEnter={() => setHi(i)} onClick={() => pick(options[i])}
              className={cn('flex w-full items-center gap-3 px-4 py-2 text-left', hi === i && 'bg-gray-1')}>
              <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-[8px]', p.bg)}><img src={p.img} alt="" className="h-10" /></span>
              <span className="min-w-0 flex-1 text-sm leading-snug"><b>{p.line}</b> <Mark text={p.name} q={q} /></span>
              <span className="shrink-0 text-sm font-bold">от {rub(p.weights[0].price)}</span>
            </button>
          ))}
          {!!hints.length && (
            <div className="px-4 pb-2 pt-3">
              <div className="mb-2 text-xs text-txt-2">{q ? 'уточнить запрос' : 'часто ищут'}</div>
              <div className="flex flex-wrap gap-2">
                {hints.map((h, j) => {
                  const i = found.length + j
                  return (
                    <button key={h} role="option" aria-selected={hi === i} onMouseEnter={() => setHi(i)} onClick={() => run(h)}
                      className={cn('rounded-full px-3 py-1.5 text-sm', hi === i ? 'bg-ink text-white' : 'bg-gray-1')}>
                      <Search className="mr-1 inline size-3.5" />{h}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Mark({ text, q }) {
  const w = q.split(/\s+/)[0]
  const i = w ? text.toLowerCase().indexOf(w) : -1
  if (i < 0) return text
  return <>{text.slice(0, i)}<mark className="bg-violet-soft">{text.slice(i, i + w.length)}</mark>{text.slice(i + w.length)}</>
}

function IconBtn({ children, label, n, dot, onClick }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="relative flex size-11 items-center justify-center rounded-[10px] hover:bg-gray-1 [&_svg]:size-6">
      {children}
      {!!n && <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet px-1 text-[11px] font-bold text-white">{n}</span>}
      {dot && <span className="absolute right-2 top-2 size-2.5 rounded-full border-2 border-white bg-[#22c55e]" />}
    </button>
  )
}

/* ---------------- первый экран ---------------- */
function Hero({ nav }) {
  return (
    <section className="wrap pt-5">
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#fdecef] via-[#fbdde3] to-[#f6c9d2] px-6 py-10 md:px-14 md:py-14">
        <div className="relative z-10 max-w-[540px]">
          <span className="inline-block rounded-full bg-ink px-3 py-1 text-xs font-semibold lowercase text-white">российский производитель</span>
          <h1 className="mt-5 text-[38px] font-extrabold leading-[1.02] tracking-tight md:text-[60px]">Корм, после которого миска пустеет</h1>
          <p className="mt-5 max-w-[460px] text-lg leading-snug md:text-xl">
            Хвостик.МЯУ и Хвостик.ГАВ — сухие корма для кошек и собак. Восемь рецептов: для взрослых, котят, щенков, стерилизованных кошек и мелких пород.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => nav.show({ kind: 'cat' })} className={cn(blackBtn, 'h-[52px] px-7 text-base')}>для кошек</button>
            <button onClick={() => nav.show({ kind: 'dog' })} className="h-[52px] rounded-[10px] bg-white px-7 text-base font-semibold lowercase hover:bg-gray-1">для собак</button>
          </div>
        </div>
        <div className="pointer-events-none mt-8 flex items-end justify-center md:absolute md:bottom-6 md:right-12 md:mt-0">
          <img src="./img/p/myau-steril.png" alt="Упаковка Хвостик.МЯУ" className="relative z-10 w-[130px] -rotate-6 drop-shadow-xl md:w-[200px]" />
          <img src="./img/p/gav-small.png" alt="Упаковка Хвостик.ГАВ" className="-ml-4 w-[130px] rotate-3 drop-shadow-xl md:w-[200px]" />
          <img src="./img/p/myau-kitten.png" alt="" className="-ml-6 hidden w-[170px] rotate-12 drop-shadow-xl lg:block" />
        </div>
      </div>
      <div className="no-scrollbar mt-3 grid grid-flow-col gap-3 overflow-x-auto md:grid-cols-4">
        {[
          ['бесплатная доставка', 'от 2 000 ₽', 'bg-violet text-white', () => nav.page('delivery')],
          ['подбор корма', 'по возрасту и весу', 'bg-gray-1', () => nav.contact('pick')],
          ['заводчикам', 'фасовки до 15 кг', 'bg-ink text-white', () => nav.contact('breeders')],
          ['напишите нам', 'telegram и max', 'bg-[#f6dfe6]', () => nav.contact()],
        ].map(([a, b, c, fn]) => (
          <button key={a} onClick={fn} className={cn('flex min-w-[220px] items-center justify-between rounded-[14px] px-5 py-4 text-left transition hover:opacity-90', c)}>
            <span><span className="block text-[15px] font-semibold lowercase">{a}</span><span className="text-sm opacity-75">{b}</span></span>
            <ChevronRight className="size-5" />
          </button>
        ))}
      </div>
    </section>
  )
}

function SectionTitle({ children, sub }) {
  return (
    <div>
      <h2 className="text-[30px] font-extrabold lowercase leading-none tracking-tight md:text-[40px]">{children}</h2>
      {sub && <p className="mt-3 max-w-[640px] text-[17px] text-txt-2">{sub}</p>}
    </div>
  )
}

/* ---------------- преимущества ---------------- */
function Benefits() {
  return (
    <section className="wrap py-16">
      <SectionTitle>почему «хвостик»</SectionTitle>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b) => {
          const I = icons[b.icon]
          return (
            <div key={b.title} className="flex gap-4 rounded-[16px] bg-gray-1 p-6">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-[14px] bg-violet-soft text-violet-dark"><I className="size-7" /></span>
              <div>
                <h3 className="text-lg font-bold">{b.title}</h3>
                <p className="mt-1 text-[15px] text-txt-2">{b.text}</p>
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-xs text-txt-2">По данным производителя — Саратовского кормового завода (pet-skz.ru).</p>
    </section>
  )
}

/* ---------------- каталог ---------------- */
function Catalog({ filter, setFilter }) {
  const list = useMemo(() => products.filter((p) => matches(p, filter)), [filter])
  const pill = 'h-10 rounded-full border-0 bg-white px-5 text-[15px] lowercase shadow-none data-[state=active]:bg-ink data-[state=active]:text-white'
  return (
    <section id="catalog" className="scroll-mt-44 bg-gray-1 py-16">
      <div className="wrap">
        <SectionTitle>ассортимент</SectionTitle>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Tabs value={filter.kind} onValueChange={(v) => setFilter((f) => ({ ...f, kind: v }))}>
            <TabsList className="h-auto gap-2 bg-transparent p-0">
              {[['all', 'все корма'], ['cat', 'кошкам'], ['dog', 'собакам']].map(([v, l]) => <TabsTrigger key={v} value={v} className={pill}>{l}</TabsTrigger>)}
            </TabsList>
          </Tabs>
          <Tabs value={filter.age} onValueChange={(v) => setFilter((f) => ({ ...f, age: v }))}>
            <TabsList className="h-auto gap-2 bg-transparent p-0">
              {[['all', 'любой возраст'], ['adult', 'взрослым'], ['young', 'котятам и щенкам']].map(([v, l]) => (
                <TabsTrigger key={v} value={v} className={cn(pill, 'h-9 px-4 text-sm data-[state=active]:bg-violet')}>{l}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        {filter.q && (
          <p className="mt-4 text-[15px]">
            по запросу «{filter.q}»: найдено {list.length}{' '}
            <button className="text-violet underline" onClick={() => setFilter((f) => ({ ...f, q: '' }))}>сбросить</button>
          </p>
        )}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} p={p} />)}
          {!list.length && (
            <div className="rounded-[16px] bg-white p-8 text-txt-2 sm:col-span-2">
              ничего не нашли. <button className="text-violet underline" onClick={() => setFilter(ALL)}>показать все корма</button>
            </div>
          )}
        </div>
        <p className="mt-6 text-xs text-txt-2">Рецепты и фасовки — реальный ассортимент марки «Хвостик». Цены демонстрационные.</p>
      </div>
    </section>
  )
}

function ProductCard({ p }) {
  const st = useStore()
  const [vi, setVi] = useState(p.weights.length > 2 ? 1 : 0)
  const [info, setInfo] = useState(false)
  const v = p.weights[vi]
  const qty = st.qtyOf(p.id, v.w)
  const faved = st.fav.includes(p.id)
  return (
    <article className="flex flex-col rounded-[16px] bg-white p-4 shadow-card">
      <div className={cn('relative flex h-[250px] items-center justify-center overflow-hidden rounded-[12px]', p.bg)}>
        <button onClick={() => setInfo(true)} className="flex h-full w-full items-center justify-center p-4" aria-label={`Подробнее: ${p.name}`}>
          <img src={p.img} alt={`${p.line} ${p.taste}`} className="max-h-full w-auto object-contain transition hover:scale-105" />
        </button>
        <span className="absolute left-3 top-3 rounded-[8px] bg-white/90 px-2 py-1 text-xs font-bold lowercase">{p.kind === 'cat' ? 'кошкам' : 'собакам'}</span>
        <FavBtn id={p.id} faved={faved} onClick={() => st.toggleFav(p.id)} />
      </div>
      <div className="mt-3 flex items-baseline gap-2"><span className="text-[22px] font-extrabold">{rub(v.price)}</span></div>
      <h3 className="mt-1 text-[15px] leading-snug"><b>{p.line}</b> {p.name}</h3>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.weights.map((w, i) => (
          <button key={w.w} onClick={() => setVi(i)} className={cn('h-9 rounded-[8px] border px-3 text-sm', i === vi ? 'border-ink bg-ink text-white' : 'border-gray-3 hover:border-ink')}>{w.w}</button>
        ))}
      </div>
      <div className="mt-auto pt-4">
        {qty ? (
          <div className="flex h-11 items-center justify-between rounded-[10px] bg-gray-1">
            <button className="flex size-11 items-center justify-center" onClick={() => st.setQty(`${p.id}|${v.w}`, qty - 1)} aria-label="Меньше"><Minus className="size-4" /></button>
            <span className="text-sm font-semibold">{qty} в корзине</span>
            <button className="flex size-11 items-center justify-center" onClick={() => st.setQty(`${p.id}|${v.w}`, qty + 1)} aria-label="Больше"><Plus className="size-4" /></button>
          </div>
        ) : (
          <Button onClick={() => st.add(p, v)} className={cn(blackBtn, 'w-full gap-2')}><ShoppingBag className="size-4" /> в корзину</Button>
        )}
      </div>
      <Dialog open={info} onOpenChange={setInfo}>
        <DialogContent className="max-w-[760px] rounded-[20px] p-6 sm:max-w-[760px]">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className={cn('flex h-[340px] items-center justify-center rounded-[14px] p-5', p.bg)}><img src={p.img} alt="" className="max-h-full" /></div>
            <div className="flex flex-col">
              <DialogTitle className="text-2xl font-extrabold">{p.line}</DialogTitle>
              <DialogDescription className="mt-1 text-[16px] text-ink">{p.name}</DialogDescription>
              <p className="mt-4 text-[15px] leading-relaxed text-txt-2">{p.text}</p>
              <dl className="mt-4 grid grid-cols-2 gap-y-1 text-sm">
                <dt className="text-txt-2">вкус</dt><dd>{p.taste}</dd>
                <dt className="text-txt-2">тип корма</dt><dd>сухой</dd>
                <dt className="text-txt-2">фасовки</dt><dd>{p.weights.map((w) => w.w).join(', ')}</dd>
                <dt className="text-txt-2">производитель</dt><dd>СКЗ, Саратов</dd>
              </dl>
              <div className="mt-auto pt-5 text-[26px] font-extrabold">{rub(v.price)} <span className="text-base font-normal text-txt-2">· {v.w}</span></div>
              <Button onClick={() => { st.add(p, v); setInfo(false) }} className={cn(blackBtn, 'mt-3 w-full')}>в корзину</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  )
}

function FavBtn({ faved, onClick }) {
  return (
    <button onClick={onClick} aria-label={faved ? 'Убрать из избранного' : 'В избранное'} aria-pressed={faved}
      className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-white/90 hover:bg-white">
      <Heart className={cn('size-5', faved && 'fill-tang text-tang')} />
    </button>
  )
}

/* ---------------- миссия ---------------- */
function Mission() {
  return (
    <section id="mission" className="wrap scroll-mt-44 py-16">
      <div className="grid overflow-hidden rounded-[20px] bg-ink text-white md:grid-cols-[1.2fr_1fr]">
        <div className="p-8 md:p-14">
          <span className="text-sm lowercase text-violet">наша миссия</span>
          <h2 className="mt-4 text-[30px] font-extrabold leading-[1.05] md:text-[44px]">Радовать каждого хвостатого — от первой гранулы до пустой миски</h2>
          <p className="mt-6 max-w-[520px] text-lg text-white/75">
            Корм, который не просто насыщает, а помогает питомцу жить здоровой и активной жизнью. Полнорационные рецепты с натуральным мясом от российского завода.
          </p>
        </div>
        <div className="relative flex min-h-[280px] items-center justify-center bg-violet">
          <div className="grid grid-cols-2 gap-3 p-8 text-center">
            {stats.map(([n, l]) => (
              <div key={l} className="rounded-[14px] bg-white/12 px-4 py-5">
                <div className="text-[30px] font-extrabold leading-none">{n}</div>
                <div className="mt-2 text-sm lowercase text-white/85">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- особые потребности ---------------- */
function Special({ nav }) {
  return (
    <section id="special" className="wrap scroll-mt-44 pb-16">
      <SectionTitle sub="Отдельные рецепты для кошек после стерилизации и для маленьких собак.">особый подход к особым питомцам</SectionTitle>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {special.map((s) => {
          const p = products.find((x) => x.id === s.id)
          return (
            <div key={s.id} className={cn('flex gap-4 overflow-hidden rounded-[20px] p-6 md:p-8', p.bg)}>
              <div className="flex-1">
                <span className="text-sm font-bold">{p.line}</span>
                <h3 className="mt-2 text-2xl font-extrabold leading-tight">{s.title}</h3>
                <ul className="mt-5 space-y-2.5">
                  {s.points.map((x) => <li key={x} className="flex gap-2 text-[15px]"><Check className="mt-0.5 size-4 shrink-0 text-violet-dark" />{x}</li>)}
                </ul>
                <button onClick={() => nav.show({ q: p.id === 'gav-small' ? 'мелких пород' : 'стерилизованных' })} className="mt-6 inline-flex items-center gap-1 font-semibold text-violet-dark">к товару <ChevronRight className="size-4" /></button>
              </div>
              <img src={p.img} alt="" className="w-[36%] max-w-[180px] self-end object-contain drop-shadow-lg" />
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ---------------- контроль качества ---------------- */
function Checks() {
  return (
    <section id="quality" className="scroll-mt-44 bg-gray-1 py-16">
      <div className="wrap">
        <SectionTitle>как проверяют корм</SectionTitle>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {checks.map((c) => (
            <div key={c.n} className="rounded-[16px] bg-white p-6">
              <div className="text-[40px] font-extrabold leading-none text-violet">{c.n}</div>
              <h3 className="mt-4 text-lg font-bold">{c.title}</h3>
              <p className="mt-1 text-[15px] text-txt-2">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- блог ---------------- */
function Blog() {
  const [post, setPost] = useState(null)
  return (
    <section id="blog" className="wrap scroll-mt-44 py-16">
      <SectionTitle>блог о питании</SectionTitle>
      <div className="no-scrollbar mt-8 grid grid-flow-col gap-4 overflow-x-auto pb-2 lg:grid-flow-row lg:grid-cols-4">
        {posts.map((p) => (
          <button key={p.title} onClick={() => setPost(p)} className="group flex min-w-[260px] flex-col overflow-hidden rounded-[16px] border border-gray-2 text-left transition hover:shadow-card">
            <div className={cn('flex h-[150px] items-end justify-center overflow-hidden', p.tone)}>
              <img src={p.img} alt="" className="h-[130px] translate-y-3 transition group-hover:translate-y-0" />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <span className="w-fit rounded-full bg-gray-1 px-2.5 py-0.5 text-xs lowercase">{p.tag}</span>
              <h3 className="mt-3 text-lg font-bold leading-snug">{p.title}</h3>
              <p className="mt-2 text-sm text-txt-2">{p.text}</p>
              <span className="mt-auto flex items-center gap-1 pt-4 text-sm text-txt-2"><Clock className="size-4" />{p.min} мин</span>
            </div>
          </button>
        ))}
      </div>
      <Dialog open={!!post} onOpenChange={(o) => !o && setPost(null)}>
        <DialogContent className="max-w-[580px] rounded-[20px] p-7">
          <span className="w-fit rounded-full bg-gray-1 px-2.5 py-0.5 text-xs lowercase">{post?.tag}</span>
          <DialogTitle className="text-2xl font-extrabold leading-tight">{post?.title}</DialogTitle>
          <DialogDescription className="text-[16px] text-txt-2">{post?.text}</DialogDescription>
          <div className="space-y-3 text-[16px] leading-relaxed">{post?.body.map((t) => <p key={t}>{t}</p>)}</div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

/* ---------------- формы ---------------- */
function LeadForm({ topic, compact, onSubmit, cta = 'отправить', doneText }) {
  const st = useStore()
  const [f, setF] = useState({ name: st.user?.name || '', phone: st.user?.phone || '', msg: '', ok: true })
  const [err, setErr] = useState({})
  const [state, setState] = useState('form')
  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (f.name.trim().length < 2) er.name = 'введите имя'
    if (f.phone.replace(/\D/g, '').length !== 11) er.phone = 'введите телефон полностью'
    if (!f.ok) er.ok = 'нужно согласие'
    setErr(er)
    if (Object.keys(er).length) return
    setState('send')
    setTimeout(() => { onSubmit?.({ name: f.name.trim(), phone: f.phone }); setState('done') }, 700)
  }
  if (state === 'done')
    return (
      <div className="rounded-[16px] bg-white p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-violet text-white"><Check className="size-7" /></div>
        <h3 className="mt-4 text-2xl font-extrabold">спасибо, {f.name.trim()}!</h3>
        <p className="mt-2 text-txt-2">{doneText || 'Менеджер свяжется с вами в ближайшее время.'} Это демо — заявка никуда не ушла.</p>
      </div>
    )
  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field err={err.name}><Input placeholder="имя" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-invalid={!!err.name} className="h-12 rounded-[10px] bg-white text-[15px]" /></Field>
        <Field err={err.phone}><Input placeholder="телефон" inputMode="numeric" value={f.phone} onChange={(e) => setF({ ...f, phone: fmtPhone(e.target.value) })} aria-invalid={!!err.phone} className="h-12 rounded-[10px] bg-white text-[15px]" /></Field>
      </div>
      {!compact && <Textarea placeholder={topic === 'order' ? 'номер заказа и что случилось' : 'сообщение (необязательно)'} value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} className="min-h-24 rounded-[10px] bg-white text-[15px]" />}
      <label className="flex items-start gap-2.5 text-xs text-txt-2">
        <Checkbox checked={f.ok} onCheckedChange={(v) => setF({ ...f, ok: !!v })} className="mt-0.5 data-[state=checked]:border-ink data-[state=checked]:bg-ink" />
        <span>согласен на обработку персональных данных {err.ok && <b className="text-destructive">— {err.ok}</b>}</span>
      </label>
      <Button type="submit" disabled={state === 'send'} className={cn(blackBtn, 'h-12 w-full sm:w-auto sm:px-10')}>
        {state === 'send' ? <Loader2 className="animate-spin" /> : <><Send className="size-4" />{cta}</>}
      </Button>
    </form>
  )
}

function Field({ err, children }) {
  return <label className="block">{children}{err && <span className="mt-1 block text-xs text-destructive">{err}</span>}</label>
}

function Contacts({ topic, setTopic }) {
  return (
    <section id="contacts" className="scroll-mt-44 bg-gray-1 py-16">
      <div className="wrap">
        <SectionTitle>связаться с нами</SectionTitle>
        <Tabs value={topic} onValueChange={setTopic} className="mt-6 gap-6">
          <TabsList className="no-scrollbar h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
            {contactTopics.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="h-10 flex-none rounded-full border-0 bg-white px-5 text-[15px] lowercase shadow-none data-[state=active]:bg-violet data-[state=active]:text-white">{t.label}</TabsTrigger>
            ))}
          </TabsList>
          {contactTopics.map((t) => (
            <TabsContent key={t.id} value={t.id}>
              <div className="grid gap-8 rounded-[20px] bg-white/60 p-6 md:grid-cols-[1fr_1.3fr] md:p-10">
                <div>
                  <h3 className="text-2xl font-extrabold lowercase">{t.label}</h3>
                  <p className="mt-3 text-[17px] leading-relaxed text-txt-2">{t.text}</p>
                  <p className="mt-4 text-[15px]">Заполните форму или напишите в мессенджер — <b>ответим в течение дня</b>.</p>
                  <MessengerButtons className="mt-5" />
                  <div className="mt-6 space-y-2 text-[15px]">
                    <a href={contacts.phoneHref} className="flex items-center gap-2 font-semibold"><Phone className="size-4" />{contacts.phone}</a>
                    <div className="flex items-center gap-2 text-txt-2"><Clock className="size-4" />ежедневно 9:00–21:00 мск</div>
                  </div>
                </div>
                <LeadForm topic={t.id} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}

/* ---------------- вопросы ---------------- */
function Faq() {
  return (
    <section id="faq" className="wrap scroll-mt-44 py-16">
      <SectionTitle>частые вопросы</SectionTitle>
      <Accordion type="single" collapsible className="mt-6 max-w-[900px]">
        {faq.map((f, i) => (
          <AccordionItem key={f.q} value={String(i)} className="border-gray-2">
            <AccordionTrigger className="py-5 text-left text-[17px] font-semibold hover:no-underline">{f.q}</AccordionTrigger>
            <AccordionContent className="pb-5 text-[15px] leading-relaxed text-txt-2">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

/* ---------------- подвал ---------------- */
function Footer({ nav }) {
  const cols = [
    ['покупателям', [['доставка и оплата', () => nav.page('delivery')], ['где купить', () => nav.page('where')], ['возврат и обмен', () => nav.page('returns')], ['частые вопросы', () => nav.go('faq')]]],
    ['о бренде', [['наша миссия', () => nav.go('mission')], ['производство', () => nav.page('production')], ['блог', () => nav.go('blog')], ['заводчикам', () => nav.contact('breeders')]]],
    ['каталог', [['корма для кошек', () => nav.show({ kind: 'cat' })], ['корма для собак', () => nav.show({ kind: 'dog' })], ['котятам и щенкам', () => nav.show({ age: 'young' })], ['мелким породам', () => nav.show({ q: 'мелких пород' })]]],
  ]
  return (
    <footer className="bg-ink pb-24 pt-14 text-white md:pb-10">
      <div className="wrap grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.4fr]">
        <div>
          <Logo light />
          <p className="mt-4 text-sm text-white/60">Сухие корма Хвостик.МЯУ и Хвостик.ГАВ для кошек и собак.</p>
        </div>
        {cols.map(([h, ls]) => (
          <div key={h}>
            <div className="mb-3 font-semibold lowercase">{h}</div>
            <ul className="space-y-2 text-sm text-white/60">
              {ls.map(([l, fn]) => <li key={l}><button onClick={fn} className="text-left hover:text-white">{l}</button></li>)}
            </ul>
          </div>
        ))}
        <div>
          <div className="mb-3 font-semibold lowercase">поговорим про питомцев</div>
          <a href={contacts.phoneHref} className="text-2xl font-bold">{contacts.phone}</a>
          <p className="mt-1 text-sm text-white/60">горячая линия 9:00–21:00 мск</p>
          <div className="mt-4 flex gap-2">
            <a href={contacts.telegram} target="_blank" rel="noreferrer" aria-label="Telegram" className="rounded-[10px] bg-white/10 p-2.5 hover:bg-white/20"><TgIcon className="size-6" /></a>
            <a href={contacts.max} target="_blank" rel="noreferrer" aria-label="MAX" className="rounded-[10px] bg-white/10 p-2.5 hover:bg-white/20"><MaxIcon className="size-6" /></a>
          </div>
        </div>
      </div>
      <div className="wrap mt-10 border-t border-white/10 pt-6 text-xs text-white/40">© 2026 «Хвостик». Производитель кормов — ООО «СКЗ», Саратов. Цены и условия на сайте демонстрационные.</div>
    </footer>
  )
}

/* ---------------- плавающие мессенджеры ---------------- */
function Messengers() {
  const [open, setOpen] = useState(false)
  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-2">
      {open && (
        <div className="flex flex-col gap-2">
          <a href={contacts.telegram} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-white py-2 pl-2 pr-4 text-sm font-semibold shadow-[0_6px_24px_rgba(0,0,0,.18)]"><TgIcon className="size-8" />telegram</a>
          <a href={contacts.max} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-white py-2 pl-2 pr-4 text-sm font-semibold shadow-[0_6px_24px_rgba(0,0,0,.18)]"><MaxIcon className="size-8" />max</a>
        </div>
      )}
      <button onClick={() => setOpen(!open)} aria-label="Написать нам" aria-expanded={open}
        className="flex h-14 items-center gap-2 rounded-full bg-violet px-5 font-semibold lowercase text-white shadow-[0_8px_24px_rgba(108,92,252,.45)] hover:bg-violet-dark">
        {open ? <X className="size-5" /> : <Send className="size-5" />}<span className="hidden sm:inline">написать нам</span>
      </button>
    </div>
  )
}

/* ---------------- боковые панели ---------------- */
function Panels({ nav }) {
  const st = useStore()
  const [checkout, setCheckout] = useState(false)
  const close = () => st.setPanel(null)
  const side = 'flex w-full flex-col gap-0 p-0 sm:max-w-[440px]'
  const head = (t, d) => (
    <SheetHeader className="border-b border-gray-2 p-5">
      <SheetTitle className="text-2xl font-extrabold lowercase">{t}</SheetTitle>
      <SheetDescription>{d}</SheetDescription>
    </SheetHeader>
  )
  const favs = products.filter((p) => st.fav.includes(p.id))
  return (
    <>
      {/* корзина */}
      <Sheet open={st.panel === 'cart'} onOpenChange={(o) => !o && close()}>
        <SheetContent className={side}>
          {head('корзина', st.count ? `${st.count} шт. на ${rub(st.total)}` : 'пока пусто')}
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {!st.items.length && <Empty icon={ShoppingBag} text="добавьте корм из каталога" action={['в каталог', () => { close(); nav.show({}) }]} />}
            {st.items.map((i) => (
              <div key={i.key} className="flex gap-3 rounded-[14px] bg-gray-1 p-3">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-[10px] bg-white p-1"><img src={i.img} alt="" className="max-h-full" /></div>
                <div className="flex flex-1 flex-col">
                  <div className="text-sm leading-snug"><b>{i.line}</b> {i.name} · {i.w}</div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-[8px] bg-white">
                      <button className="flex size-8 items-center justify-center" onClick={() => st.setQty(i.key, i.qty - 1)} aria-label="Меньше"><Minus className="size-3.5" /></button>
                      <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                      <button className="flex size-8 items-center justify-center" onClick={() => st.setQty(i.key, i.qty + 1)} aria-label="Больше"><Plus className="size-3.5" /></button>
                    </div>
                    <span className="font-bold">{rub(i.price * i.qty)}</span>
                  </div>
                </div>
                <button onClick={() => st.setQty(i.key, 0)} aria-label="Удалить" className="self-start text-txt-2 hover:text-ink"><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
          {!!st.items.length && (
            <div className="border-t border-gray-2 p-5">
              <div className="mb-3 rounded-[10px] bg-violet-soft px-3 py-2 text-sm">{st.total >= 2000 ? 'доставка бесплатная' : `до бесплатной доставки ${rub(2000 - st.total)}`}</div>
              <div className="mb-4 flex justify-between text-lg"><span>итого</span><b>{rub(st.total)}</b></div>
              <Button onClick={() => { close(); setCheckout(true) }} className={cn(blackBtn, 'h-12 w-full text-base')}>оформить заказ</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* избранное */}
      <Sheet open={st.panel === 'fav'} onOpenChange={(o) => !o && close()}>
        <SheetContent className={side}>
          {head('избранное', favs.length ? `${favs.length} шт.` : 'пока пусто')}
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {!favs.length && <Empty icon={Heart} text="нажмите ♡ на карточке корма, чтобы сохранить его здесь" action={['в каталог', () => { close(); nav.show({}) }]} />}
            {favs.map((p) => {
              const v = p.weights[p.weights.length > 2 ? 1 : 0]
              return (
                <div key={p.id} className="flex gap-3 rounded-[14px] bg-gray-1 p-3">
                  <div className={cn('flex size-20 shrink-0 items-center justify-center rounded-[10px] p-1', p.bg)}><img src={p.img} alt="" className="max-h-full" /></div>
                  <div className="flex flex-1 flex-col">
                    <div className="text-sm leading-snug"><b>{p.line}</b> {p.name}</div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <span className="font-bold">{rub(v.price)} <span className="text-xs font-normal text-txt-2">· {v.w}</span></span>
                      <button onClick={() => st.add(p, v)} className="rounded-[8px] bg-ink px-3 py-1.5 text-xs font-semibold text-white">{st.qtyOf(p.id, v.w) ? `в корзине: ${st.qtyOf(p.id, v.w)}` : 'в корзину'}</button>
                    </div>
                  </div>
                  <button onClick={() => st.toggleFav(p.id)} aria-label="Убрать из избранного" className="self-start"><Heart className="size-4 fill-tang text-tang" /></button>
                </div>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* личный кабинет */}
      <Sheet open={st.panel === 'profile'} onOpenChange={(o) => !o && close()}>
        <SheetContent className={side}>
          {head('личный кабинет', st.user ? st.user.phone : 'вход по номеру телефона')}
          <div className="flex-1 overflow-y-auto p-5">{st.user ? <Profile nav={nav} /> : <Login />}</div>
        </SheetContent>
      </Sheet>

      {/* мобильное меню */}
      <Sheet open={st.panel === 'menu'} onOpenChange={(o) => !o && close()}>
        <SheetContent side="left" className="flex w-[86%] max-w-[360px] flex-col gap-0 p-0">
          <SheetHeader className="border-b border-gray-2 p-5"><SheetTitle><Logo /></SheetTitle><SheetDescription className="sr-only">Меню</SheetDescription></SheetHeader>
          <div className="flex-1 overflow-y-auto p-5">
            {catalogMenu.map((g) => (
              <div key={g.title} className="mb-5">
                <div className="mb-2 text-lg font-extrabold lowercase">{g.title}</div>
                {g.items.map((it) => <MenuLink key={it.label} onClick={() => { close(); nav.show(it.f) }}>{it.label}</MenuLink>)}
              </div>
            ))}
            <div className="mb-2 text-lg font-extrabold lowercase">информация</div>
            <MenuLink onClick={() => { close(); nav.page('delivery') }}>доставка и оплата</MenuLink>
            <MenuLink onClick={() => { close(); nav.page('where') }}>где купить</MenuLink>
            <MenuLink onClick={() => { close(); nav.go('mission') }}>о бренде</MenuLink>
            <MenuLink onClick={() => { close(); nav.go('blog') }}>блог</MenuLink>
            <MenuLink onClick={() => { close(); nav.go('faq') }}>частые вопросы</MenuLink>
            <MenuLink onClick={() => { close(); nav.contact() }}>контакты</MenuLink>
            <a href={contacts.phoneHref} className="mt-5 block text-xl font-bold">{contacts.phone}</a>
            <MessengerButtons className="mt-4" />
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={checkout} onOpenChange={setCheckout}>
        <DialogContent className="max-w-[520px] rounded-[20px] bg-gray-1 p-7">
          <DialogTitle className="text-2xl font-extrabold lowercase">оформление заказа</DialogTitle>
          <DialogDescription className="text-[15px] text-txt-2">{st.total ? `Сумма ${rub(st.total)}. ` : ''}Оставьте контакты — перезвоним и уточним адрес доставки.</DialogDescription>
          <LeadForm compact cta="подтвердить заказ" doneText="Заказ сохранён в личном кабинете, менеджер перезвонит." onSubmit={(c) => st.placeOrder(c)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

function MenuLink({ children, onClick }) {
  return <button onClick={onClick} className="flex w-full items-center justify-between py-2 text-left text-[15px]">{children}<ChevronRight className="size-4 text-txt-2" /></button>
}

function Empty({ icon: I, text, action }) {
  return (
    <div className="py-14 text-center text-txt-2">
      <I className="mx-auto mb-3 size-12 text-gray-3" />
      <p>{text}</p>
      {action && <button onClick={action[1]} className={cn(blackBtn, 'mt-5')}>{action[0]}</button>}
    </div>
  )
}

function Login() {
  const st = useStore()
  const [f, setF] = useState({ name: '', phone: '', code: '' })
  const [step, setStep] = useState('phone')
  const [err, setErr] = useState('')
  const next = (e) => {
    e.preventDefault()
    if (step === 'phone') {
      if (f.name.trim().length < 2) return setErr('введите имя')
      if (f.phone.replace(/\D/g, '').length !== 11) return setErr('введите телефон полностью')
      setErr(''); setStep('code')
    } else {
      if (f.code.length !== 4) return setErr('введите 4 цифры')
      st.setUser({ name: f.name.trim(), phone: f.phone })
    }
  }
  return (
    <form onSubmit={next} noValidate className="space-y-3">
      <div className="mb-2 rounded-[14px] bg-violet-soft p-4 text-sm">Войдите, чтобы видеть свои заказы и избранное на любом устройстве.</div>
      {step === 'phone' ? (
        <>
          <Input placeholder="имя" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="h-12 rounded-[10px] text-[15px]" />
          <Input placeholder="телефон" inputMode="numeric" value={f.phone} onChange={(e) => setF({ ...f, phone: fmtPhone(e.target.value) })} className="h-12 rounded-[10px] text-[15px]" />
        </>
      ) : (
        <>
          <p className="text-[15px]">Код отправлен на {f.phone}. <button type="button" className="text-violet underline" onClick={() => setStep('phone')}>изменить</button></p>
          <Input autoFocus placeholder="код из смс" inputMode="numeric" maxLength={4} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.replace(/\D/g, '') })} className="h-12 rounded-[10px] text-center text-xl tracking-[.5em]" />
          <p className="text-xs text-txt-2">Демо: подойдут любые 4 цифры, смс не отправляется.</p>
        </>
      )}
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button type="submit" className={cn(blackBtn, 'h-12 w-full text-base')}>{step === 'phone' ? 'получить код' : 'войти'}</Button>
    </form>
  )
}

function Profile({ nav }) {
  const st = useStore()
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-[14px] bg-gray-1 p-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-violet text-lg font-bold text-white">{st.user.name[0]?.toUpperCase()}</span>
        <div className="flex-1"><div className="font-bold">{st.user.name}</div><div className="text-sm text-txt-2">{st.user.phone}</div></div>
        <button onClick={() => st.setUser(null)} className="flex items-center gap-1 text-sm text-txt-2 hover:text-ink"><LogOut className="size-4" />выйти</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => st.setPanel('fav')} className="rounded-[14px] border border-gray-2 p-4 text-left hover:bg-gray-1"><Heart className="mb-2 size-5" /><div className="font-semibold">избранное</div><div className="text-sm text-txt-2">{st.fav.length} шт.</div></button>
        <button onClick={() => st.setPanel('cart')} className="rounded-[14px] border border-gray-2 p-4 text-left hover:bg-gray-1"><ShoppingBag className="mb-2 size-5" /><div className="font-semibold">корзина</div><div className="text-sm text-txt-2">{st.count} шт.</div></button>
      </div>
      <div>
        <div className="mb-3 text-lg font-extrabold lowercase">мои заказы</div>
        {!st.orders.length && <p className="text-sm text-txt-2">Заказов пока нет. <button className="text-violet underline" onClick={() => { st.setPanel(null); nav.show({}) }}>перейти в каталог</button></p>}
        <div className="space-y-2">
          {st.orders.map((o) => (
            <div key={o.n} className="rounded-[14px] border border-gray-2 p-4">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 font-semibold"><Package className="size-4" />заказ №{o.n}</span><span className="rounded-full bg-violet-soft px-2 py-0.5 text-xs">принят</span></div>
              <div className="mt-1 text-sm text-txt-2">{o.date} · {o.items.reduce((s, i) => s + i.qty, 0)} шт. · {rub(o.total)}</div>
              <div className="mt-2 text-xs text-txt-2">{o.items.map((i) => `${i.line} ${i.w} ×${i.qty}`).join(', ')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
