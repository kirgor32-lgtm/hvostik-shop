import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search, ShoppingBag, Heart, User, Menu, X, Minus, Plus, ChevronRight, Phone, Clock, LogOut, Package,
  Drumstick, Scale, HeartPulse, ShieldCheck, Factory, BadgeCheck, Check, Trash2, Loader2, Send, Truck, Sparkles, PawPrint, Cookie,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { StoreProvider, useStore, rub, fmtPhone } from './store'
import { RouterProvider, useRoute, Link } from './router'
import { sendCode, checkCode, linkedChannels, setLinked, channelNames } from './auth'
import {
  BASE, contacts, seller, products, kinds, searchHints, benefits, stats, checks, posts, contactTopics, faq, pages,
  productPath, minPrice, img, declaration, manufacturer, minAll,
} from './data'

const icons = { Drumstick, Scale, HeartPulse, ShieldCheck, Factory, BadgeCheck }
const inkBtn = 'h-11 rounded-[10px] bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-2'
const ALL = { kind: 'all', age: 'all', q: '' }
const byId = (id) => products.find((p) => p.id === id)
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1)
const kg = (w) => parseFloat(w.replace(',', '.')) / (w.includes('кг') ? 1 : 1000)
const perKg = (v) => Math.round(v.price / kg(v.w))
const IMG = { width: 240, height: 528 } // размеры фото упаковок (против сдвига вёрстки)

export default function App({ path = '' }) {
  return (
    <RouterProvider initialPath={path}>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </RouterProvider>
  )
}

function Shell() {
  const { route, navigate } = useRoute()
  const [filter, setFilter] = useState(ALL)
  const [topic, setTopic] = useState('pick')
  const nav = useMemo(() => ({
    show: (f) => { setFilter({ ...ALL, ...f }); navigate('', { hash: 'catalog' }) },
    contact: (t) => { if (t) setTopic(t); navigate(pages.contacts.path, { hash: 'form' }) },
  }), [navigate])
  let page
  switch (route.type) {
    case 'home': page = <Home filter={filter} setFilter={setFilter} nav={nav} topic={topic} setTopic={setTopic} />; break
    case 'kind': page = <KindPage kind={route.kind} />; break
    case 'product': page = <ProductPage p={byId(route.id)} />; break
    case 'blog': page = <BlogPage />; break
    case 'post': page = <PostPage post={posts.find((x) => x.slug === route.slug)} />; break
    case 'page': page = <TextPage id={route.page} topic={topic} setTopic={setTopic} />; break
    default: page = <NotFound />
  }
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3">К содержимому</a>
      <Header filter={filter} nav={nav} />
      <main id="main">{page}</main>
      <Footer nav={nav} />
      <Panels nav={nav} />
      <Messengers />
      <CookieBanner />
    </>
  )
}

/* ---------------- значки мессенджеров ---------------- */
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
function MessengerButtons({ className }) {
  const c = 'flex h-11 items-center gap-2 rounded-[10px] bg-white px-4 text-sm font-semibold shadow-card hover:bg-gray-1'
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <a href={contacts.telegram} target="_blank" rel="noopener nofollow" className={c}><TgIcon className="size-5" /> Написать в Telegram</a>
      <a href={contacts.max} target="_blank" rel="noopener nofollow" className={c}><MaxIcon className="size-5" /> Написать в Max</a>
    </div>
  )
}

/* ---------------- логотип: тот же значок, что и иконка вкладки ---------------- */
function Logo({ light, onClick }) {
  return (
    <Link to="" onClick={onClick} className="flex shrink-0 items-center gap-2.5" aria-label="Хвостик — на главную">
      <img src={`${BASE}${light ? 'logo-light.svg' : 'favicon.svg'}`} alt="" width="44" height="44" className="size-10 sm:size-11" />
      <span className={cn('text-[22px] font-extrabold leading-none tracking-tight', light && 'text-white')}>Хвостик</span>
    </Link>
  )
}

/* ---------------- шапка ---------------- */
const mainNav = [
  ['Кошкам', kinds.cat.path],
  ['Собакам', kinds.dog.path],
  ['Доставка и оплата', pages.delivery.path],
  ['О бренде', pages.about.path],
  ['Блог', pages.blog.path],
  ['Вопросы', pages.faq.path],
  ['Контакты', pages.contacts.path],
]

function Header({ filter, nav }) {
  const st = useStore()
  return (
    <header className="sticky top-0 z-40 border-b border-gray-2 bg-white">
      <div className="wrap flex h-[64px] items-center gap-3 lg:h-[72px] lg:gap-6">
        {/* бургер — только на телефонах и планшетах */}
        <button className="-ml-2 flex size-11 items-center justify-center lg:hidden" onClick={() => st.setPanel('menu')} aria-label="Открыть меню"><Menu /></button>
        <Logo />
        <div className="hidden flex-1 lg:block"><SearchBox filter={filter} nav={nav} /></div>
        <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
          <a href={contacts.phoneHref} className="mr-3 hidden text-right xl:block">
            <div className="whitespace-nowrap text-[15px] font-semibold">{contacts.phone}</div>
            <div className="text-xs text-txt-2">{contacts.hours}</div>
          </a>
          <IconBtn label="Избранное" n={st.fav.length} onClick={() => st.setPanel('fav')}><Heart /></IconBtn>
          <IconBtn label="Личный кабинет" dot={!!st.user} onClick={() => st.setPanel('profile')}><User /></IconBtn>
          <IconBtn label="Корзина" n={st.count} onClick={() => st.setPanel('cart')}><ShoppingBag /></IconBtn>
        </div>
      </div>
      <div className="wrap pb-3 lg:hidden"><SearchBox filter={filter} nav={nav} /></div>
      {/* меню разделов — только на компьютере */}
      <nav aria-label="Разделы" className="wrap hidden gap-8 pb-3 text-[15px] lg:flex">
        {mainNav.map(([l, to]) => <Link key={to} to={to} className="hover:text-violet-dark">{l}</Link>)}
      </nav>
    </header>
  )
}

const matches = (p, f) => {
  const q = (f.q || '').trim().toLowerCase()
  const hay = `${p.line} ${p.name} ${p.taste} ${p.ageLabel} ${p.weights.map((w) => w.w).join(' ')}`.toLowerCase()
  const age = !f.age || f.age === 'all' || (f.age === 'kitten' ? p.kind === 'cat' && p.age === 'young' : f.age === 'puppy' ? p.kind === 'dog' && p.age === 'young' : p.age === f.age)
  return (!f.kind || f.kind === 'all' || p.kind === f.kind) && age && (!q || q.split(/\s+/).every((w) => hay.includes(w)))
}

function SearchBox({ filter, nav }) {
  const { navigate } = useRoute()
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
  const pick = (o) => { setOpen(false); setHi(-1); o.t === 'p' ? navigate(productPath(o.p)) : run(o.h) }
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHi((h) => Math.min(options.length - 1, h + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(-1, h - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); hi >= 0 && options[hi] ? pick(options[hi]) : run(text) }
    else if (e.key === 'Escape') setOpen(false)
  }
  return (
    <div ref={box} role="search" className="relative">
      <label className="flex h-12 items-center gap-3 rounded-[10px] border-2 border-gray-3 px-4 focus-within:border-violet lg:h-[50px]">
        <Search className="size-5 shrink-0 text-txt-2" />
        <input value={text} onChange={(e) => { setText(e.target.value); setOpen(true); setHi(-1) }} onFocus={() => setOpen(true)} onKeyDown={onKey}
          type="search" role="combobox" aria-expanded={open} aria-controls="search-list" aria-autocomplete="list" aria-label="Поиск корма"
          placeholder="Поиск: котята, щенки, говядина…" className="w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-txt-2 [&::-webkit-search-cancel-button]:hidden" />
        {text && <button type="button" onClick={() => setText('')} aria-label="Очистить"><X className="size-4 text-txt-2" /></button>}
      </label>
      {open && (
        <div id="search-list" role="listbox" className="absolute inset-x-0 top-[56px] z-50 overflow-hidden rounded-[14px] bg-white py-2 shadow-[0_12px_40px_rgba(46,44,56,.18)]">
          {q && !found.length && <div className="px-4 py-3 text-sm text-txt-2">Ничего не нашли по «{text}»</div>}
          {found.map((p, i) => (
            <button key={p.id} role="option" aria-selected={hi === i} onMouseEnter={() => setHi(i)} onClick={() => pick(options[i])}
              className={cn('flex w-full items-center gap-3 px-4 py-2 text-left', hi === i && 'bg-gray-1')}>
              <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-[8px]', p.bg)}><img src={img(p.id)} alt="" className="h-10 w-auto" /></span>
              <span className="min-w-0 flex-1 text-sm leading-snug"><b>{p.line}</b> <Mark text={p.name} q={q} /></span>
              <span className="shrink-0 text-sm font-bold">от {rub(minPrice(p))}</span>
            </button>
          ))}
          {!!hints.length && (
            <div className="px-4 pb-2 pt-3">
              <div className="mb-2 text-xs text-txt-2">{q ? 'Уточнить запрос' : 'Часто ищут'}</div>
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
      {!!n && <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-dark px-1 text-[11px] font-bold text-white">{n}</span>}
      {dot && <span className="absolute right-2 top-2 size-2.5 rounded-full border-2 border-white bg-[#22c55e]" />}
    </button>
  )
}

/* ---------------- общие куски ---------------- */
function SectionTitle({ children, sub, as: H = 'h2' }) {
  return (
    <div>
      <H className="text-balance text-[28px] font-extrabold leading-[1.05] tracking-tight md:text-[40px]">{children}</H>
      {sub && <p className="mt-3 max-w-[680px] text-[17px] text-txt-2">{sub}</p>}
    </div>
  )
}

function Crumbs({ items }) {
  return (
    <nav aria-label="Навигационная цепочка" className="wrap pt-5 text-sm text-txt-2">
      <ol className="flex flex-wrap items-center gap-1">
        <li><Link to="" className="inline-block py-1 hover:text-ink">Главная</Link></li>
        {items.map(([l, to], i) => (
          <li key={l} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" />
            {i === items.length - 1 ? <span aria-current="page" className="text-ink">{l}</span> : <Link to={to} className="inline-block py-1 hover:text-ink">{l}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* ---------------- главная ---------------- */
function Home({ filter, setFilter, nav, topic, setTopic }) {
  return (
    <>
      <Hero nav={nav} />
      <Benefits />
      <Catalog filter={filter} setFilter={setFilter} title="Ассортимент" />
      <Mission />
      <Checks />
      <BlogStrip />
      <Contacts topic={topic} setTopic={setTopic} />
      <FaqList limit={4} />
      <SeoText />
    </>
  )
}

function Hero({ nav }) {
  return (
    <section className="wrap pt-5">
      <div className="relative flex items-center gap-2 overflow-hidden rounded-[20px] bg-gradient-to-r from-[#fdeef1] via-[#fbe2e7] to-[#f6d2da] px-4 py-5 sm:block sm:px-6 sm:py-10 md:px-14 md:py-14">
        <div className="relative z-10 min-w-0 flex-1 sm:max-w-[560px]">
          <span className="hidden rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink sm:inline-block">Бесплатная доставка по Санкт-Петербургу</span>
          <h1 className="text-[21px] font-extrabold leading-[1.15] tracking-tight sm:mt-5 sm:text-[34px] sm:leading-[1.1] md:text-[54px]">Корма «Хвостик» для кошек и собак в Санкт-Петербурге</h1>
          <p className="mt-1.5 text-[13px] text-txt-2 sm:hidden">8 рецептов · от {minAll} ₽ · бесплатная доставка</p>
          <p className="mt-5 hidden max-w-[470px] text-lg leading-snug sm:block md:text-xl">
            Хвостик.МЯУ и Хвостик.ГАВ — восемь сухих рецептов: для взрослых, котят, щенков, стерилизованных кошек и мелких пород. От {minAll} ₽.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
            <Link to={kinds.cat.path} className={cn(inkBtn, 'flex h-10 items-center justify-center px-3 text-[14px] sm:h-[52px] sm:px-7 sm:text-base')}>Корм для кошек</Link>
            <Link to={kinds.dog.path} className="flex h-10 items-center justify-center rounded-[10px] bg-white px-3 text-[14px] font-semibold hover:bg-gray-1 sm:h-[52px] sm:px-7 sm:text-base">Корм для собак</Link>
          </div>
        </div>
        <div className="pointer-events-none flex shrink-0 items-center justify-center sm:absolute sm:inset-x-0 sm:bottom-0 sm:top-0 sm:items-end sm:justify-end sm:pb-6 sm:pr-12 md:pr-12">
          <img src={img('myau-steril')} {...IMG} alt="Упаковка корма Хвостик.МЯУ для стерилизованных кошек" fetchPriority="high" className="relative z-10 h-auto w-[95px] -rotate-6 drop-shadow-lg sm:w-[120px] md:w-[190px]" />
          <img src={img('gav-small')} {...IMG} alt="Упаковка корма Хвостик.ГАВ для собак мелких пород" fetchPriority="high" className="-ml-3 h-auto w-[95px] rotate-3 drop-shadow-lg sm:-ml-4 sm:w-[120px] md:w-[190px]" />
          <img src={img('myau-kitten')} {...IMG} alt="" className="-ml-3 hidden h-auto w-[80px] rotate-12 drop-shadow-lg sm:block sm:-ml-6 sm:w-[160px] lg:block" />
        </div>
      </div>
      <div className="no-scrollbar mt-3 grid grid-flow-col gap-3 overflow-x-auto md:grid-cols-4">
        {[
          ['Бесплатная доставка', 'до пунктов 5Post', Truck, pages.delivery.path],
          ['Подбор корма', 'по возрасту и весу', Sparkles, null, 'pick'],
          ['Заводчикам', 'фасовки до 15 кг', PawPrint, null, 'breeders'],
          ['Напишите нам', 'в Telegram и Max', Send, pages.contacts.path],
        ].map(([a, b, I, to, t]) => {
          const inner = (
            <>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-violet-dark"><I className="size-5" /></span>
              <span className="flex-1"><span className="block text-[15px] font-semibold">{a}</span><span className="text-sm text-txt-2">{b}</span></span>
              <ChevronRight className="size-5 text-txt-2" />
            </>
          )
          const cls = 'flex min-w-[220px] items-center gap-3 rounded-[14px] bg-gray-1 px-3 py-3 text-left sm:min-w-[240px] sm:px-4 sm:py-4 transition-colors hover:bg-gray-2'
          return to ? <Link key={a} to={to} className={cls}>{inner}</Link> : <button key={a} onClick={() => nav.contact(t)} className={cls}>{inner}</button>
        })}
      </div>
    </section>
  )
}

function Benefits() {
  return (
    <section className="wrap py-16">
      <SectionTitle>Почему «Хвостик»</SectionTitle>
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
    </section>
  )
}

function Catalog({ filter, setFilter, title, fixedKind, as }) {
  const list = useMemo(() => products.filter((p) => matches(p, { ...filter, kind: fixedKind || filter.kind })), [filter, fixedKind])
  const kind = fixedKind || filter.kind
  // «котятам» и «щенкам» — отдельные кнопки; показываем только подходящие к выбранному виду
  const ages = [['all', 'Любой возраст'], ['adult', 'Взрослым'], ...(kind !== 'dog' ? [['kitten', 'Котятам']] : []), ...(kind !== 'cat' ? [['puppy', 'Щенкам']] : [])]
  const setKind = (v) => setFilter((f) => ({ ...f, kind: v, age: (v === 'cat' && f.age === 'puppy') || (v === 'dog' && f.age === 'kitten') ? 'all' : f.age }))
  return (
    <section id="catalog" className="scroll-mt-44 bg-gray-1 py-14">
      <div className="wrap">
        {title && <SectionTitle as={as}>{title}</SectionTitle>}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          {!fixedKind && <Pills label="Для кого" value={filter.kind} onChange={setKind} items={[['all', 'Все корма'], ['cat', 'Кошкам'], ['dog', 'Собакам']]} />}
          <Pills label="Возраст" small value={filter.age} onChange={(v) => setFilter((f) => ({ ...f, age: v }))} items={ages} />
        </div>
        {filter.q && (
          <p className="mt-4 text-[15px]">
            По запросу «{filter.q}»: найдено {list.length}{' '}
            <button className="text-violet-dark underline" onClick={() => setFilter((f) => ({ ...f, q: '' }))}>сбросить</button>
          </p>
        )}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} p={p} />)}
          {!list.length && (
            <div className="col-span-2 rounded-[16px] bg-white p-8 text-txt-2">
              Ничего не нашли. <button className="text-violet-dark underline" onClick={() => setFilter(ALL)}>показать все корма</button>
            </div>
          )}
        </div>
        <p className="mt-6 text-xs text-txt-2">Цены указаны в рублях с НДС. Доставка до пунктов выдачи 5Post в Санкт-Петербурге — бесплатно.</p>
      </div>
    </section>
  )
}

// Фильтры — простые кнопки-переключатели (вкладки здесь не нужны: под ними нет отдельных панелей)
function Pills({ label, items, value, onChange, small }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {items.map(([v, l]) => (
        <button key={v} aria-pressed={value === v} onClick={() => onChange(v)}
          className={cn('rounded-full transition-colors', small ? 'h-9 px-4 text-sm' : 'h-10 px-5 text-[15px]',
            value === v ? (small ? 'bg-violet-dark text-white' : 'bg-ink text-white') : 'bg-white text-ink hover:bg-gray-2')}>{l}</button>
      ))}
    </div>
  )
}

function ProductCard({ p }) {
  const st = useStore()
  const [vi, setVi] = useState(p.weights.length > 2 ? 1 : 0)
  const v = p.weights[vi]
  const qty = st.qtyOf(p.id, v.w)
  const faved = st.fav.includes(p.id)
  return (
    <article className="flex flex-col rounded-[16px] bg-white p-3 shadow-card sm:p-4">
      <div className={cn('relative flex h-[190px] items-center justify-center overflow-hidden rounded-[12px] sm:h-[250px]', p.bg)}>
        <Link to={productPath(p)} className="flex h-full w-full items-center justify-center p-3 sm:p-4" tabIndex={-1} aria-hidden>
          <img src={img(p.id)} {...IMG} loading="lazy" alt={`${p.line} — ${p.short}, ${p.taste}`} className="h-full w-auto object-contain transition hover:scale-105" />
        </Link>
        <span className="absolute left-2 top-2 rounded-[8px] bg-white/90 px-2 py-1 text-xs font-bold sm:left-3 sm:top-3">{p.kind === 'cat' ? 'Кошкам' : 'Собакам'}</span>
        <FavBtn faved={faved} onClick={() => st.toggleFav(p.id)} />
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
        <span className="text-[19px] font-extrabold sm:text-[22px]">{rub(v.price)}</span>
        <span className="text-xs text-txt-2">{rub(perKg(v))}/кг</span>
      </div>
      <h3 className="mt-1 text-sm leading-snug sm:text-[15px]">
        <Link to={productPath(p)} className="hover:text-violet-dark"><b>{p.line}</b> {p.name}</Link>
      </h3>
      {p.composition && <p className="mt-1 line-clamp-1 text-xs text-txt-2">{p.composition.top}</p>}
      <div className="mt-auto flex gap-1.5 pt-3" role="group" aria-label="Фасовка">
        {p.weights.map((w, i) => (
          <button key={w.w} onClick={() => setVi(i)} aria-pressed={i === vi} className={cn('h-9 min-w-0 flex-1 whitespace-nowrap rounded-[8px] border px-1 text-sm sm:flex-none sm:px-3', i === vi ? 'border-ink bg-ink text-white' : 'border-gray-3 hover:border-ink')}>{w.w}</button>
        ))}
      </div>
      <div className="pt-3">
        <Buy p={p} v={v} qty={qty} />
      </div>
    </article>
  )
}

function Buy({ p, v, qty, big }) {
  const st = useStore()
  return qty ? (
    <div className={cn('flex items-center justify-between rounded-[10px] bg-gray-1', big ? 'h-[52px]' : 'h-11')}>
      <button className="flex size-11 items-center justify-center" onClick={() => st.setQty(`${p.id}|${v.w}`, qty - 1)} aria-label="Меньше"><Minus className="size-4" /></button>
      <span className="text-sm font-semibold">{qty} в корзине</span>
      <button className="flex size-11 items-center justify-center" onClick={() => st.setQty(`${p.id}|${v.w}`, qty + 1)} aria-label="Больше"><Plus className="size-4" /></button>
    </div>
  ) : (
    <Button onClick={() => st.add(p, v)} className={cn(inkBtn, 'w-full gap-2', big && 'h-[52px] text-base')}><ShoppingBag className="size-4" /> В корзину</Button>
  )
}

function FavBtn({ faved, onClick, className }) {
  return (
    <button onClick={onClick} aria-label={faved ? 'Убрать из избранного' : 'В избранное'} aria-pressed={faved}
      className={cn('absolute right-2 top-2 flex size-10 items-center justify-center rounded-full bg-white/90 hover:bg-white sm:right-3 sm:top-3', className)}>
      <Heart className={cn('size-5', faved && 'fill-tang text-tang')} />
    </button>
  )
}

function Mission() {
  return (
    <section className="wrap py-16">
      <div className="grid overflow-hidden rounded-[20px] bg-ink text-white md:grid-cols-[1.2fr_1fr]">
        <div className="p-8 md:p-14">
          <span className="text-sm lowercase text-[#c9c2ff]">Наша миссия</span>
          <h2 className="mt-4 text-[28px] font-extrabold leading-[1.08] md:text-[42px]">Радовать каждого хвостатого — от первой гранулы до пустой миски</h2>
          <p className="mt-6 max-w-[520px] text-lg text-white/80">
            Корм, который не просто насыщает, а помогает питомцу жить здоровой и активной жизнью. Полнорационные рецепты с натуральным мясом от российского завода.
          </p>
          <Link to={pages.about.path} className="mt-6 inline-flex items-center gap-1 font-semibold text-[#c9c2ff] hover:text-white">О бренде и производителе <ChevronRight className="size-4" /></Link>
        </div>
        <div className="flex min-h-[260px] items-center justify-center bg-violet-dark">
          <div className="grid grid-cols-2 gap-3 p-8 text-center">
            {stats.map(([n, l]) => (
              <div key={l} className="rounded-[14px] bg-white/12 px-4 py-5">
                <div className="text-[28px] font-extrabold leading-none">{n}</div>
                <div className="mt-2 text-sm lowercase text-white">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Checks() {
  return (
    <section className="bg-gray-1 py-16">
      <div className="wrap">
        <SectionTitle>Как проверяют корм</SectionTitle>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {checks.map((c) => (
            <div key={c.n} className="rounded-[16px] bg-white p-6">
              <div className="text-[40px] font-extrabold leading-none text-violet-dark">{c.n}</div>
              <h3 className="mt-4 text-lg font-bold">{c.title}</h3>
              <p className="mt-1 text-[15px] text-txt-2">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PostCard({ p, H = 'h3' }) {
  return (
    <Link to={`blog/${p.slug}/`} className="group flex min-w-[260px] flex-col overflow-hidden rounded-[16px] border border-gray-2 bg-white text-left transition hover:shadow-card">
      <div className={cn('flex h-[150px] items-end justify-center overflow-hidden', p.tone)}>
        <img src={img(p.img)} {...IMG} loading="lazy" alt="" className="h-[130px] w-auto translate-y-3 transition group-hover:translate-y-0" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="w-fit rounded-full bg-gray-1 px-2.5 py-0.5 text-xs lowercase">{p.tag}</span>
        <H className="mt-3 text-lg font-bold leading-snug">{p.title}</H>
        <p className="mt-2 text-sm text-txt-2">{p.text}</p>
        <span className="mt-auto flex items-center gap-1 pt-4 text-sm text-txt-2"><Clock className="size-4" />{p.min} мин</span>
      </div>
    </Link>
  )
}

// Кнопка «Все статьи»: пока ведёт на страницу блога, когда появится канал в Дзене — укажите contacts.dzen
function AllPosts({ className }) {
  const cls = cn('inline-flex h-11 shrink-0 items-center gap-1 rounded-[10px] bg-gray-1 px-5 text-sm font-semibold transition-colors hover:bg-gray-2', className)
  const inner = <>Все статьи <ChevronRight className="size-4" /></>
  return contacts.dzen ? <a href={contacts.dzen} target="_blank" rel="noopener" className={cls}>{inner}</a> : <Link to={pages.blog.path} className={cls}>{inner}</Link>
}

function BlogStrip() {
  return (
    <section className="wrap py-16">
      <div className="flex items-end justify-between gap-4">
        <SectionTitle>Блог о питании</SectionTitle>
        <AllPosts className="hidden sm:inline-flex" />
      </div>
      <div className="no-scrollbar mt-8 grid grid-flow-col gap-4 overflow-x-auto pb-2 lg:grid-flow-row lg:grid-cols-4">
        {posts.map((p) => <PostCard key={p.slug} p={p} />)}
      </div>
      <AllPosts className="mt-4 w-full justify-center sm:hidden" />
    </section>
  )
}

/* ---------------- формы ---------------- */
function Consent({ checked, onChange, err }) {
  return (
    <label className="flex items-start gap-2.5 text-xs text-txt-2">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} className="mt-0.5 data-[state=checked]:border-ink data-[state=checked]:bg-ink" />
      <span>
        Даю <Link to={pages.consent.path} className="underline hover:text-ink">согласие на обработку персональных данных</Link> и принимаю{' '}
        <Link to={pages.privacy.path} className="underline hover:text-ink">политику конфиденциальности</Link>
        {err && <b className="text-destructive"> — {err}</b>}
      </span>
    </label>
  )
}

function LeadForm({ topic, compact, onSubmit, cta = 'Отправить', doneText }) {
  const st = useStore()
  // галочка согласия НЕ стоит заранее — согласие должно быть активным действием (152-ФЗ)
  const [f, setF] = useState({ name: st.user?.name || '', phone: st.user?.phone || '', msg: '', ok: false })
  const [err, setErr] = useState({})
  const [state, setState] = useState('form')
  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (f.name.trim().length < 2) er.name = 'Введите имя'
    if (f.phone.replace(/\D/g, '').length !== 11) er.phone = 'Введите телефон полностью'
    if (!f.ok) er.ok = 'нужно согласие'
    setErr(er)
    if (Object.keys(er).length) return
    setState('send')
    setTimeout(() => { onSubmit?.({ name: f.name.trim(), phone: f.phone }); setState('done') }, 700)
  }
  if (state === 'done')
    return (
      <div className="rounded-[16px] bg-white p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-violet-dark text-white"><Check className="size-7" /></div>
        <h3 className="mt-4 text-2xl font-extrabold">Спасибо, {f.name.trim()}!</h3>
        <p className="mt-2 text-txt-2">{doneText || 'Менеджер свяжется с вами в ближайшее время.'} Это демо — заявка никуда не ушла.</p>
      </div>
    )
  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field err={err.name} label="Имя"><Input autoComplete="name" placeholder="Имя" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-invalid={!!err.name} className="h-12 rounded-[10px] bg-white text-[15px]" /></Field>
        <Field err={err.phone} label="Телефон"><Input type="tel" autoComplete="tel" placeholder="Телефон" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: fmtPhone(e.target.value) })} aria-invalid={!!err.phone} className="h-12 rounded-[10px] bg-white text-[15px]" /></Field>
      </div>
      {!compact && <Textarea aria-label="Сообщение" placeholder={topic === 'order' ? 'Номер заказа и что случилось' : 'Сообщение (необязательно)'} value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} className="min-h-24 rounded-[10px] bg-white text-[15px]" />}
      <Consent checked={f.ok} onChange={(ok) => setF({ ...f, ok })} err={err.ok} />
      <Button type="submit" disabled={state === 'send'} className={cn(inkBtn, 'h-12 w-full sm:w-auto sm:px-10')}>
        {state === 'send' ? <Loader2 className="animate-spin" /> : <><Send className="size-4" />{cta}</>}
      </Button>
    </form>
  )
}

function Field({ err, label, children }) {
  return <label className="block"><span className="sr-only">{label}</span>{children}{err && <span className="mt-1 block text-xs text-destructive">{err}</span>}</label>
}

function Contacts({ topic, setTopic, as = 'h2', title = 'Связаться с нами' }) {
  return (
    <section id="form" className="scroll-mt-44 bg-gray-1 py-16">
      <div className="wrap">
        <SectionTitle as={as}>{title}</SectionTitle>
        <Tabs value={topic} onValueChange={setTopic} className="mt-6 gap-6">
          <TabsList className="no-scrollbar h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0 group-data-horizontal/tabs:h-auto">
            {contactTopics.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="h-10 flex-none rounded-full border-0 bg-white px-5 text-[15px] text-ink shadow-none data-[state=active]:bg-violet-dark data-[state=active]:text-white">{t.label}</TabsTrigger>
            ))}
          </TabsList>
          {contactTopics.map((t) => (
            <TabsContent key={t.id} value={t.id}>
              <div className="grid gap-8 rounded-[20px] bg-white/60 p-6 md:grid-cols-[1fr_1.3fr] md:p-10">
                <div>
                  <h3 className="text-2xl font-extrabold">{cap(t.label)}</h3>
                  <p className="mt-3 text-[17px] leading-relaxed text-txt-2">{t.text}</p>
                  <p className="mt-4 text-[15px]">Заполните форму или напишите в мессенджер — <b>ответим в течение дня</b>.</p>
                  <MessengerButtons className="mt-5" />
                  <div className="mt-6 space-y-2 text-[15px]">
                    <a href={contacts.phoneHref} className="flex items-center gap-2 font-semibold"><Phone className="size-4" />{contacts.phone}</a>
                    <div className="flex items-center gap-2 text-txt-2"><Clock className="size-4" />{contacts.hours}</div>
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

// Вопросы — нативный <details>: ответы есть в HTML, поисковик их видит
function FaqList({ limit, as = 'h2', title = 'Частые вопросы' }) {
  const list = limit ? faq.slice(0, limit) : faq
  return (
    <section className="wrap py-16">
      <SectionTitle as={as}>{title}</SectionTitle>
      <div className="mt-6 max-w-[900px] divide-y divide-gray-2 border-y border-gray-2">
        {list.map((f) => (
          <details key={f.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}<Plus className="size-5 shrink-0 transition group-open:rotate-45" />
            </summary>
            <p className="pb-5 text-[15px] leading-relaxed text-txt-2">{f.a}</p>
          </details>
        ))}
      </div>
      {limit && <Link to={pages.faq.path} className="mt-5 inline-flex items-center gap-1 font-semibold text-violet-dark">Все вопросы <ChevronRight className="size-4" /></Link>}
    </section>
  )
}

function SeoText() {
  return (
    <section className="wrap pb-16">
      <div className="max-w-[900px] text-[15px] leading-relaxed text-txt-2">
        <h2 className="mb-3 text-xl font-bold text-ink">Купить корм «Хвостик» в Санкт-Петербурге</h2>
        <p>
          В нашем магазине — вся линейка сухих кормов «Хвостик» от Саратовского кормового завода: четыре рецепта Хвостик.МЯУ для кошек и четыре рецепта Хвостик.ГАВ для собак.
          Корма для кошек продаются в пакетах 1,5 кг и 10 кг, для собак — 2 кг, 10 кг и 15 кг. Доставка бесплатная: привезём заказ в пункт выдачи 5Post в Санкт-Петербурге — постамат или кассу «Пятёрочки» и «Перекрёстка».
        </p>
      </div>
    </section>
  )
}

/* ---------------- категория ---------------- */
function KindPage({ kind }) {
  const k = kinds[kind]
  const [filter, setFilter] = useState(ALL)
  useEffect(() => setFilter(ALL), [kind])
  return (
    <>
      <Crumbs items={[[k.menu, k.path]]} />
      <div className="wrap pb-8 pt-4">
        <h1 className="text-[30px] font-extrabold leading-tight tracking-tight md:text-[44px]">{k.h1}</h1>
        <p className="mt-3 max-w-[760px] text-[17px] text-txt-2">{k.intro}</p>
      </div>
      <Catalog filter={filter} setFilter={setFilter} fixedKind={kind} title={`Все рецепты ${kinds[kind].h1.split(' ').pop()}`} />
      <section className="wrap py-14">
        <h2 className="text-2xl font-extrabold">Другие корма</h2>
        <Link to={kinds[kind === 'cat' ? 'dog' : 'cat'].path} className="mt-3 inline-flex items-center gap-1 font-semibold text-violet-dark">
          {kinds[kind === 'cat' ? 'dog' : 'cat'].h1} <ChevronRight className="size-4" />
        </Link>
      </section>
    </>
  )
}

/* ---------------- карточка товара ---------------- */
function ProductPage({ p }) {
  const st = useStore()
  const k = kinds[p.kind]
  const [vi, setVi] = useState(p.weights.length > 2 ? 1 : 0)
  useEffect(() => setVi(p.weights.length > 2 ? 1 : 0), [p])
  const v = p.weights[vi]
  const related = products.filter((x) => x.kind === p.kind && x.id !== p.id)
  const specs = [
    ['Вкус', p.taste],
    ['Для кого', p.ageLabel],
    ['Тип корма', 'сухой полнорационный'],
    ['Фасовки', p.weights.map((w) => w.w).join(', ')],
    ['Штрихкод', v.gtin],
    ['Срок годности', '18 месяцев'],
    ['Производитель', manufacturer],
    ['Декларация', declaration],
    ['Маркировка', '«Честный знак»'],
  ]
  return (
    <>
      <Crumbs items={[[k.menu, k.path], [cap(p.short), productPath(p)]]} />
      <article className="wrap grid gap-8 pb-14 pt-5 md:grid-cols-[1fr_1.05fr] lg:gap-14">
        <div className={cn('relative flex h-[360px] items-center justify-center rounded-[20px] p-6 md:h-[520px]', p.bg)}>
          <img src={img(p.id)} {...IMG} fetchPriority="high" alt={`Упаковка ${p.line} — ${p.short}, ${p.taste}`} className="h-full w-auto object-contain drop-shadow-xl" />
          <FavBtn faved={st.fav.includes(p.id)} onClick={() => st.toggleFav(p.id)} className="right-4 top-4 sm:right-4 sm:top-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-violet-dark">{p.line}</span>
          <h1 className="mt-2 text-[28px] font-extrabold leading-[1.1] tracking-tight md:text-[36px]">{p.name}</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-txt-2">{p.text}</p>
          <div className="mt-6 text-sm text-txt-2">Фасовка</div>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Фасовка">
            {p.weights.map((w, i) => (
              <button key={w.w} onClick={() => setVi(i)} aria-pressed={i === vi} className={cn('flex h-14 flex-col items-start justify-center rounded-[10px] border px-4 text-left', i === vi ? 'border-ink bg-ink text-white' : 'border-gray-3 hover:border-ink')}>
                <span className="text-[15px] font-semibold">{w.w}</span>
                <span className={cn('text-xs', i === vi ? 'text-white/75' : 'text-txt-2')}>{rub(w.price)}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-[34px] font-extrabold leading-none">{rub(v.price)}</span>
            <span className="text-sm text-txt-2">{rub(perKg(v))}/кг</span>
          </div>
          <div className="mt-5 max-w-[420px]"><Buy p={p} v={v} qty={st.qtyOf(p.id, v.w)} big /></div>
          <div className="mt-5 flex items-start gap-3 rounded-[14px] bg-gray-1 p-4 text-sm">
            <Truck className="mt-0.5 size-5 shrink-0 text-violet-dark" />
            <div>Бесплатная доставка до пунктов выдачи 5Post в Санкт-Петербурге. <Link to={pages.delivery.path} className="text-violet-dark underline">Условия доставки</Link></div>
          </div>
          <h2 className="mt-8 text-xl font-extrabold">Характеристики</h2>
          <dl className="mt-3 grid grid-cols-[minmax(110px,auto)_1fr] gap-x-6 gap-y-2 text-[15px]">
            {specs.map(([a, b]) => <div key={a} className="contents"><dt className="text-txt-2">{a}</dt><dd>{b}</dd></div>)}
          </dl>
          <h2 className="mt-8 text-xl font-extrabold">Описание</h2>
          <p className="mt-3 text-[15px] leading-relaxed">{p.more}</p>
          {p.composition ? (
            <>
              <h2 className="mt-8 text-xl font-extrabold">Состав</h2>
              <p className="mt-3 text-[15px] leading-relaxed">{p.composition.full}</p>
              <h2 className="mt-8 text-xl font-extrabold">Гарантированный анализ, на 100 г</h2>
              <dl className="mt-3 grid grid-cols-[minmax(110px,auto)_1fr] gap-x-6 gap-y-2 text-[15px]">
                <div className="contents"><dt className="text-txt-2">Белки</dt><dd>{p.composition.analysis.protein}</dd></div>
                <div className="contents"><dt className="text-txt-2">Жиры</dt><dd>{p.composition.analysis.fat}</dd></div>
                <div className="contents"><dt className="text-txt-2">Клетчатка</dt><dd>{p.composition.analysis.fiber}</dd></div>
                <div className="contents"><dt className="text-txt-2">Зола</dt><dd>{p.composition.analysis.ash}</dd></div>
                <div className="contents"><dt className="text-txt-2">Влажность</dt><dd>{p.composition.analysis.moisture}</dd></div>
              </dl>
              <p className="mt-3 text-sm text-txt-2">Таблица суточной нормы — на упаковке. Свежая вода должна быть в доступе всегда.</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-txt-2">Состав, гарантированный анализ и таблица суточной нормы указаны на упаковке. Свежая вода должна быть в доступе всегда.</p>
          )}
        </div>
      </article>
      <section className="bg-gray-1 py-14">
        <div className="wrap">
          <h2 className="text-[26px] font-extrabold md:text-[32px]">Другие корма {p.line}</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{related.map((x) => <ProductCard key={x.id} p={x} />)}</div>
        </div>
      </section>
    </>
  )
}

/* ---------------- блог ---------------- */
function BlogPage() {
  return (
    <>
      <Crumbs items={[['Блог', pages.blog.path]]} />
      <section className="wrap pb-16 pt-4">
        <SectionTitle as="h1" sub={pages.blog.desc}>{pages.blog.h1}</SectionTitle>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{posts.map((p) => <PostCard key={p.slug} p={p} H="h2" />)}</div>
      </section>
    </>
  )
}

function PostPage({ post }) {
  const rel = post.rel.map(byId)
  return (
    <>
      <Crumbs items={[['Блог', pages.blog.path], [post.title, `blog/${post.slug}/`]]} />
      <article className="wrap max-w-[820px] pb-12 pt-4">
        <span className="rounded-full bg-gray-1 px-2.5 py-0.5 text-xs lowercase">{post.tag} · {post.min} мин</span>
        <h1 className="mt-4 text-[30px] font-extrabold leading-tight tracking-tight md:text-[42px]">{post.title}</h1>
        <p className="mt-4 text-lg text-txt-2">{post.text}</p>
        <div className="mt-6 space-y-4 text-[17px] leading-relaxed">{post.body.map((t) => <p key={t}>{t}</p>)}</div>
      </article>
      <section className="bg-gray-1 py-14">
        <div className="wrap">
          <h2 className="text-2xl font-extrabold">Корма по теме</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{rel.map((x) => <ProductCard key={x.id} p={x} />)}</div>
        </div>
      </section>
    </>
  )
}

/* ---------------- текстовые страницы ---------------- */
function TextPage({ id, topic, setTopic }) {
  const pg = pages[id]
  if (id === 'faq') return <><Crumbs items={[[pg.h1, pg.path]]} /><FaqList as="h1" title={pg.h1} /></>
  if (id === 'contacts')
    return (
      <>
        <Crumbs items={[[pg.h1, pg.path]]} />
        <section className="wrap pb-10 pt-4">
          <SectionTitle as="h1" sub="Интернет-магазин кормов «Хвостик» в Санкт-Петербурге. Отвечаем на вопросы о корме, заказе и доставке.">{pg.h1}</SectionTitle>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[16px] bg-gray-1 p-6">
              <div className="text-sm text-txt-2">Телефон</div>
              <a href={contacts.phoneHref} className="mt-1 block text-xl font-bold">{contacts.phone}</a>
              <div className="mt-1 text-sm text-txt-2">{contacts.hours}</div>
            </div>
            <div className="rounded-[16px] bg-gray-1 p-6">
              <div className="text-sm text-txt-2">Мессенджеры</div>
              <MessengerButtons className="mt-3" />
            </div>
            <div className="rounded-[16px] bg-gray-1 p-6">
              <div className="text-sm text-txt-2">Продавец</div>
              <div className="mt-1 text-[15px]">{seller.name}<br />ОГРН {seller.ogrn}, ИНН {seller.inn}<br />{seller.address}</div>
              <div className="mt-2 text-sm"><a href={`mailto:${contacts.email}`} className="underline">{contacts.email}</a></div>
            </div>
          </div>
        </section>
        <Contacts topic={topic} setTopic={setTopic} title="Написать нам" />
      </>
    )
  return (
    <>
      <Crumbs items={[[pg.h1, pg.path]]} />
      <section className="wrap max-w-[860px] pb-16 pt-4">
        <SectionTitle as="h1">{pg.h1}</SectionTitle>
        <div className="mt-8 space-y-6">
          {pg.body.map(([h, t]) => (
            <div key={h}>
              <h2 className="text-xl font-bold">{h}</h2>
              <p className="mt-2 text-[16px] leading-relaxed text-txt-2">{t}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function NotFound() {
  return (
    <section className="wrap py-24 text-center">
      <h1 className="text-[40px] font-extrabold">Страница не найдена</h1>
      <p className="mt-3 text-lg text-txt-2">Возможно, корм переехал на другой адрес.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to={kinds.cat.path} className={cn(inkBtn, 'flex items-center')}>Корм для кошек</Link>
        <Link to={kinds.dog.path} className={cn(inkBtn, 'flex items-center')}>Корм для собак</Link>
      </div>
    </section>
  )
}

/* ---------------- подвал ---------------- */
function Footer({ nav }) {
  const cols = [
    ['Покупателям', [['Доставка и оплата', pages.delivery.path], ['Возврат и обмен', pages.returns.path], ['Частые вопросы', pages.faq.path], ['Контакты', pages.contacts.path]]],
    ['О бренде', [['О бренде и заводе', pages.about.path], ['Блог о питании', pages.blog.path], ['Заводчикам', null, 'breeders'], ['Оптовым покупателям', null, 'sales']]],
    ['Каталог', [['Корм для кошек', kinds.cat.path], ['Корм для собак', kinds.dog.path], ['Корм для котят', productPath(byId('myau-kitten'))], ['Корм для щенков', productPath(byId('gav-puppy'))]]],
  ]
  return (
    <footer className="bg-ink pb-24 pt-14 text-white md:pb-10">
      <div className="wrap grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.4fr]">
        <div>
          <Logo light />
          <p className="mt-4 text-sm text-white/70">Сухие корма Хвостик.МЯУ и Хвостик.ГАВ с бесплатной доставкой до пунктов 5Post в Санкт-Петербурге.</p>
        </div>
        {cols.map(([h, ls]) => (
          <div key={h}>
            <div className="mb-3 font-semibold">{h}</div>
            <ul className="space-y-1 text-sm text-white/70">
              {ls.map(([l, to, t]) => (
                <li key={l}>{to ? <Link to={to} className="inline-block py-1.5 hover:text-white">{l}</Link> : <button onClick={() => nav.contact(t)} className="py-1.5 text-left hover:text-white">{l}</button>}</li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <div className="mb-3 font-semibold">Поговорим про питомцев</div>
          <a href={contacts.phoneHref} className="text-2xl font-bold">{contacts.phone}</a>
          <p className="mt-1 text-sm text-white/70">{contacts.hours}</p>
          <div className="mt-4 flex gap-2">
            <a href={contacts.telegram} target="_blank" rel="noopener nofollow" aria-label="Telegram" className="rounded-[10px] bg-white/10 p-2.5 hover:bg-white/20"><TgIcon className="size-6" /></a>
            <a href={contacts.max} target="_blank" rel="noopener nofollow" aria-label="Max" className="rounded-[10px] bg-white/10 p-2.5 hover:bg-white/20"><MaxIcon className="size-6" /></a>
          </div>
        </div>
      </div>
      <div className="wrap mt-10 space-y-2 border-t border-white/10 pt-6 text-xs text-white/55">
        <p>Продавец: {seller.name}, ОГРН {seller.ogrn}, ИНН {seller.inn}, {seller.address}. Производитель кормов — {manufacturer}.</p>
        <p>
          Цены указаны в рублях с НДС. Сайт носит информационный характер и не является публичной офертой.{' '}
          <Link to={pages.privacy.path} className="underline hover:text-white">Политика конфиденциальности</Link> ·{' '}
          <Link to={pages.consent.path} className="underline hover:text-white">Согласие на обработку данных</Link>
        </p>
        <p>© 2026 «Хвостик», Санкт-Петербург. Демонстрационный сайт.{' '}<button onClick={() => window.dispatchEvent(new Event('hv-cookies'))} className="underline hover:text-white">Настройки cookie</button></p>
      </div>
    </footer>
  )
}

/* ---------------- плавающие мессенджеры ---------------- */
function Messengers() {
  const [open, setOpen] = useState(false)
  const box = useRef(null)
  useEffect(() => {
    if (!open) return
    const out = (e) => { if (!box.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', out)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', out); document.removeEventListener('keydown', esc) }
  }, [open])
  const item = 'flex w-full items-center gap-2 rounded-full bg-white py-2 pl-2 pr-4 text-sm font-semibold shadow-[0_6px_24px_rgba(46,44,56,.2)] hover:bg-gray-1'
  return (
    <div ref={box} className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-2">
      {open && (
        <div className="grid w-[156px] gap-2">
          <a href={contacts.telegram} target="_blank" rel="noopener nofollow" onClick={() => setOpen(false)} className={item}><TgIcon className="size-8" />Telegram</a>
          <a href={contacts.max} target="_blank" rel="noopener nofollow" onClick={() => setOpen(false)} className={item}><MaxIcon className="size-8" />Max</a>
        </div>
      )}
      <button onClick={() => setOpen(!open)} aria-label={open ? 'Закрыть' : 'Написать нам'} aria-expanded={open}
        className="flex size-12 items-center justify-center gap-2 rounded-full bg-violet-dark font-semibold text-white shadow-[0_8px_24px_rgba(82,66,214,.4)] hover:bg-[#4535c4] sm:h-14 sm:w-auto sm:px-5">
        {open ? <X className="size-5" /> : <Send className="size-5" />}<span className="hidden sm:inline">{open ? 'Закрыть' : 'Написать нам'}</span>
      </button>
    </div>
  )
}

/* ---------------- баннер cookie и персональных данных (152-ФЗ) ---------------- */
function CookieBanner() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    try { if (!localStorage.getItem('hv-cookies')) setShow(true) } catch { setShow(true) }
    const reopen = () => setShow(true)
    window.addEventListener('hv-cookies', reopen)
    return () => window.removeEventListener('hv-cookies', reopen)
  }, [])
  const save = (v) => { try { localStorage.setItem('hv-cookies', JSON.stringify({ v, at: new Date().toISOString() })) } catch { /* пусто */ } setShow(false) }
  if (!show) return null
  const policy = <Link to={pages.privacy.path} className="text-violet-dark underline">политике конфиденциальности</Link>
  return (
    <div role="region" aria-label="Cookie и персональные данные"
      className="fixed inset-x-2 bottom-2 z-50 rounded-[14px] bg-white p-3 shadow-[0_8px_30px_rgba(46,44,56,.22)] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-[460px] sm:rounded-[16px] sm:p-5">
      {/* телефон: одна короткая строка и две маленькие кнопки */}
      <div className="flex items-center gap-2 sm:hidden">
        <p className="flex-1 text-[12px] leading-snug text-txt-2">Мы используем cookie и обрабатываем персональные данные. Подробнее — в {policy}.</p>
        <button onClick={() => save('all')} className="h-10 shrink-0 rounded-[10px] bg-ink px-5 text-[14px] font-semibold text-white">Ок</button>
      </div>
      {/* компьютер и планшет */}
      <div className="hidden sm:block">
        <div className="flex gap-3">
          <Cookie className="mt-0.5 size-6 shrink-0 text-violet-dark" aria-hidden />
          <div>
            <div className="font-bold">Мы используем cookie</div>
            <p className="mt-1 text-sm text-txt-2">Используем cookie и обрабатываем персональные данные, чтобы работали корзина и личный кабинет. Подробнее — в {policy}.</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={() => save('all')} className={cn(inkBtn, 'flex-1')}>Принять</Button>
          <Button onClick={() => save('necessary')} variant="ghost" className="h-11 flex-1 rounded-[10px] bg-gray-1 text-sm font-semibold hover:bg-gray-2">Только необходимые</Button>
        </div>
      </div>
    </div>
  )
}

/* ---------------- боковые панели ---------------- */
function Panels({ nav }) {
  const st = useStore()
  const close = () => st.setPanel(null)
  const side = 'flex w-full flex-col gap-0 p-0 sm:max-w-[440px]'
  const head = (t, d) => (
    <SheetHeader className="border-b border-gray-2 p-5">
      <SheetTitle className="text-2xl font-extrabold">{t}</SheetTitle>
      <SheetDescription>{d}</SheetDescription>
    </SheetHeader>
  )
  const favs = products.filter((p) => st.fav.includes(p.id))
  const toCatalog = ['В каталог', () => { close(); nav.show({}) }]
  return (
    <>
      <Sheet open={st.panel === 'cart'} onOpenChange={(o) => !o && close()}>
        <SheetContent className={side}>
          {head('Корзина', st.count ? `${st.count} шт. на ${rub(st.total)}` : 'Пока пусто')}
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {!st.items.length && <Empty icon={ShoppingBag} text="добавьте корм из каталога" action={toCatalog} />}
            {st.items.map((i) => (
              <div key={i.key} className="flex gap-3 rounded-[14px] bg-gray-1 p-3">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-[10px] bg-white p-1"><img src={img(i.id)} alt="" className="max-h-full w-auto" /></div>
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
              <div className="mb-3 flex items-center gap-2 rounded-[10px] bg-violet-soft px-3 py-2 text-sm"><Truck className="size-4 text-violet-dark" />Бесплатная доставка до пункта 5Post</div>
              <div className="mb-4 flex justify-between text-lg"><span>Итого</span><b>{rub(st.total)}</b></div>
              <Button onClick={() => { close(); st.setCheckout(true) }} className={cn(inkBtn, 'h-12 w-full text-base')}>Оформить заказ</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={st.panel === 'fav'} onOpenChange={(o) => !o && close()}>
        <SheetContent className={side}>
          {head('Избранное', favs.length ? `${favs.length} шт.` : 'Пока пусто')}
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {!favs.length && <Empty icon={Heart} text="нажмите ♡ на карточке корма, чтобы сохранить его здесь" action={toCatalog} />}
            {favs.map((p) => {
              const v = p.weights[p.weights.length > 2 ? 1 : 0]
              return (
                <div key={p.id} className="flex gap-3 rounded-[14px] bg-gray-1 p-3">
                  <div className={cn('flex size-20 shrink-0 items-center justify-center rounded-[10px] p-1', p.bg)}><img src={img(p.id)} alt="" className="max-h-full w-auto" /></div>
                  <div className="flex flex-1 flex-col">
                    <Link to={productPath(p)} onClick={close} className="text-sm leading-snug hover:text-violet-dark"><b>{p.line}</b> {p.name}</Link>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <span className="font-bold">{rub(v.price)} <span className="text-xs font-normal text-txt-2">· {v.w}</span></span>
                      <button onClick={() => st.add(p, v)} className="rounded-[8px] bg-ink px-3 py-1.5 text-xs font-semibold text-white">{st.qtyOf(p.id, v.w) ? `В корзине: ${st.qtyOf(p.id, v.w)}` : 'В корзину'}</button>
                    </div>
                  </div>
                  <button onClick={() => st.toggleFav(p.id)} aria-label="Убрать из избранного" className="self-start"><Heart className="size-4 fill-tang text-tang" /></button>
                </div>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={st.panel === 'profile'} onOpenChange={(o) => !o && close()}>
        <SheetContent className={side}>
          {head('Личный кабинет', st.user ? st.user.phone : 'Вход по номеру телефона')}
          <div className="flex-1 overflow-y-auto p-5">{st.user ? <Profile nav={nav} /> : <Login />}</div>
        </SheetContent>
      </Sheet>

      {/* мобильное меню (бургер) */}
      <Sheet open={st.panel === 'menu'} onOpenChange={(o) => !o && close()}>
        <SheetContent side="left" className="flex w-[86%] max-w-[360px] flex-col gap-0 p-0">
          <SheetHeader className="border-b border-gray-2 p-5"><SheetTitle asChild><div><Logo onClick={close} /></div></SheetTitle><SheetDescription className="sr-only">Меню сайта</SheetDescription></SheetHeader>
          <nav aria-label="Меню" className="flex-1 overflow-y-auto p-5">
            <div className="mb-2 text-lg font-extrabold">Каталог</div>
            <MenuLink to={kinds.cat.path} onClick={close}>Корм для кошек</MenuLink>
            <MenuLink to={kinds.dog.path} onClick={close}>Корм для собак</MenuLink>
            <MenuLink to={productPath(byId('myau-kitten'))} onClick={close}>Для котят</MenuLink>
            <MenuLink to={productPath(byId('gav-puppy'))} onClick={close}>Для щенков</MenuLink>
            <MenuLink to={productPath(byId('myau-steril'))} onClick={close}>Для стерилизованных кошек</MenuLink>
            <MenuLink to={productPath(byId('gav-small'))} onClick={close}>Для мелких пород собак</MenuLink>
            <div className="mb-2 mt-5 text-lg font-extrabold">Информация</div>
            <MenuLink to={pages.delivery.path} onClick={close}>Доставка и оплата</MenuLink>
            <MenuLink to={pages.returns.path} onClick={close}>Возврат и обмен</MenuLink>
            <MenuLink to={pages.about.path} onClick={close}>О бренде</MenuLink>
            <MenuLink to={pages.blog.path} onClick={close}>Блог</MenuLink>
            <MenuLink to={pages.faq.path} onClick={close}>Частые вопросы</MenuLink>
            <MenuLink to={pages.contacts.path} onClick={close}>Контакты</MenuLink>
            <a href={contacts.phoneHref} className="mt-5 block text-xl font-bold">{contacts.phone}</a>
            <div className="text-sm text-txt-2">{contacts.hours}</div>
            <MessengerButtons className="mt-4" />
          </nav>
        </SheetContent>
      </Sheet>

      <Dialog open={st.checkout} onOpenChange={st.setCheckout}>
        <DialogContent className="max-w-[520px] rounded-[20px] bg-gray-1 p-7">
          <DialogTitle className="text-2xl font-extrabold">Оформление заказа</DialogTitle>
          <DialogDescription className="text-[15px] text-txt-2">{st.total ? `Сумма ${rub(st.total)}. ` : ''}Оставьте контакты — перезвоним и поможем выбрать пункт выдачи 5Post. Доставка бесплатная.</DialogDescription>
          <LeadForm compact cta="Подтвердить заказ" doneText="Заказ сохранён в личном кабинете, менеджер перезвонит." onSubmit={(c) => st.placeOrder(c)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

function MenuLink({ to, onClick, children }) {
  return <Link to={to} onClick={onClick} className="flex w-full items-center justify-between py-2 text-left text-[15px]">{children}<ChevronRight className="size-4 text-txt-2" /></Link>
}

function Empty({ icon: I, text, action }) {
  return (
    <div className="py-14 text-center text-txt-2">
      <I className="mx-auto mb-3 size-12 text-gray-3" />
      <p>{text}</p>
      {action && <button onClick={action[1]} className={cn(inkBtn, 'mt-5')}>{action[0]}</button>}
    </div>
  )
}

function Login() {
  const st = useStore()
  const [f, setF] = useState({ name: '', phone: '', code: '', ok: false, trap: '' })
  const [step, setStep] = useState('phone')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(null) // { channel, demoCode }
  const [wait, setWait] = useState(0)
  const started = useRef(Date.now())
  useEffect(() => {
    if (!wait) return
    const t = setTimeout(() => setWait(wait - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])
  const request = async () => {
    setBusy(true)
    const res = await sendCode(f.phone, { trap: f.trap, startedAt: started.current })
    setBusy(false)
    if (res.resendIn) setWait(res.resendIn)
    if (res.error) return setErr(res.error)
    setErr(''); setSent(res); setF((x) => ({ ...x, code: '' })); setStep('code')
  }
  const next = async (e) => {
    e.preventDefault()
    if (busy) return
    if (step === 'phone') {
      if (f.name.trim().length < 2) return setErr('Введите имя')
      if (f.phone.replace(/\D/g, '').length !== 11) return setErr('Введите телефон полностью')
      if (!f.ok) return setErr('Нужно согласие на обработку данных')
      return request()
    }
    if (f.code.length !== 4) return setErr('Введите 4 цифры')
    setBusy(true)
    const res = await checkCode(f.phone, f.code)
    setBusy(false)
    if (res.error) return setErr(res.error)
    st.setUser({ name: f.name.trim(), phone: f.phone })
  }
  const where = sent?.channel === 'sms' ? `по смс на ${f.phone}` : `в ${channelNames[sent?.channel]} — аккаунт, привязанный к ${f.phone}`
  return (
    <form onSubmit={next} noValidate className="space-y-3">
      <div className="mb-2 rounded-[14px] bg-violet-soft p-4 text-sm">Войдите, чтобы видеть свои заказы и избранное. Если к номеру привязан Telegram или Max, код придёт туда.</div>
      {step === 'phone' ? (
        <>
          <Input aria-label="Имя" autoComplete="name" placeholder="Имя" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="h-12 rounded-[10px] text-[15px]" />
          <Input aria-label="Телефон" type="tel" autoComplete="tel" placeholder="Телефон" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: fmtPhone(e.target.value) })} className="h-12 rounded-[10px] text-[15px]" />
          {/* поле-ловушка для ботов: людям не видно */}
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.trap} onChange={(e) => setF({ ...f, trap: e.target.value })} className="absolute -left-[9999px] h-px w-px opacity-0" />
          <Consent checked={f.ok} onChange={(ok) => setF({ ...f, ok })} />
        </>
      ) : (
        <>
          <p className="text-[15px]">Код отправлен {where}. <button type="button" className="text-violet-dark underline" onClick={() => { setStep('phone'); setErr('') }}>Изменить номер</button></p>
          <Input aria-label="Код" autoFocus placeholder="Код" inputMode="numeric" autoComplete="one-time-code" maxLength={4} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.replace(/\D/g, '') })} className="h-12 rounded-[10px] text-center text-xl tracking-[.5em]" />
          {sent?.demoCode && <p className="text-xs text-txt-2">Демо: сообщения пока не отправляются, ваш код — {sent.demoCode}</p>}
          <button type="button" disabled={wait > 0 || busy} onClick={request} className="text-sm text-violet-dark underline disabled:text-txt-2 disabled:no-underline">
            {wait > 0 ? `Отправить код повторно через ${wait} с` : 'Отправить код повторно'}
          </button>
        </>
      )}
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
      <Button type="submit" disabled={busy} className={cn(inkBtn, 'h-12 w-full text-base')}>{busy ? <Loader2 className="size-5 animate-spin" /> : step === 'phone' ? 'Получить код' : 'Войти'}</Button>
    </form>
  )
}

// Привязка мессенджеров: после привязки коды для входа приходят туда, а не по смс
function LinkedMessengers() {
  const st = useStore()
  const [linked, setL] = useState(() => linkedChannels(st.user.phone))
  const toggle = (c) => setL(setLinked(st.user.phone, c, !linked.includes(c)))
  return (
    <div className="rounded-[14px] border border-gray-2 p-4">
      <div className="font-semibold">Коды для входа</div>
      <p className="mt-1 text-sm text-txt-2">Привяжите мессенджер — коды будут приходить туда, а не по смс.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[['telegram', TgIcon], ['max', MaxIcon]].map(([c, I]) => {
          const on = linked.includes(c)
          return (
            <button key={c} type="button" onClick={() => toggle(c)} aria-pressed={on}
              className={cn('flex h-11 items-center justify-center gap-2 rounded-[10px] text-sm font-semibold transition-colors', on ? 'bg-violet-soft text-violet-dark' : 'bg-gray-1 hover:bg-gray-2')}>
              <I className="size-6" />{channelNames[c]}{on && <span className="flex items-center gap-0.5 text-xs font-medium"><Check className="size-3.5" />подключён</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Profile({ nav }) {
  const st = useStore()
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-[14px] bg-gray-1 p-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-violet-dark text-lg font-bold text-white">{st.user.name[0]?.toUpperCase()}</span>
        <div className="min-w-0 flex-1"><div className="font-bold">{st.user.name}</div><div className="whitespace-nowrap text-sm text-txt-2">{st.user.phone}</div></div>
        <button onClick={() => st.setUser(null)} className="flex items-center gap-1 text-sm text-txt-2 hover:text-ink"><LogOut className="size-4" />Выйти</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => st.setPanel('fav')} className="rounded-[14px] border border-gray-2 p-4 text-left hover:bg-gray-1"><Heart className="mb-2 size-5" /><div className="font-semibold">Избранное</div><div className="text-sm text-txt-2">{st.fav.length} шт.</div></button>
        <button onClick={() => st.setPanel('cart')} className="rounded-[14px] border border-gray-2 p-4 text-left hover:bg-gray-1"><ShoppingBag className="mb-2 size-5" /><div className="font-semibold">Корзина</div><div className="text-sm text-txt-2">{st.count} шт.</div></button>
      </div>
      <LinkedMessengers />
      <div>
        <div className="mb-3 text-lg font-extrabold">Мои заказы</div>
        {!st.orders.length && <p className="text-sm text-txt-2">Заказов пока нет. <button className="text-violet-dark underline" onClick={() => { st.setPanel(null); nav.show({}) }}>Перейти в каталог</button></p>}
        <div className="space-y-2">
          {st.orders.map((o) => (
            <div key={o.n} className="rounded-[14px] border border-gray-2 p-4">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 font-semibold"><Package className="size-4" />Заказ №{o.n}</span><span className="rounded-full bg-violet-soft px-2 py-0.5 text-xs">Принят</span></div>
              <div className="mt-1 text-sm text-txt-2">{o.date} · {o.items.reduce((s, i) => s + i.qty, 0)} шт. · {rub(o.total)}</div>
              <div className="mt-2 text-xs text-txt-2">{o.items.map((i) => `${i.line} ${i.w} ×${i.qty}`).join(', ')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
