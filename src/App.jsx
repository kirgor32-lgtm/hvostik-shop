import { useMemo, useState } from 'react'
import {
  Search, ShoppingBag, Heart, User, MapPin, Menu, X, Star, Minus, Plus, ChevronRight, Phone, Clock,
  Drumstick, Scale, HeartPulse, ShieldCheck, Factory, Smile, Check, Trash2, Loader2, Send, PawPrint,
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
import { CartProvider, useCart, rub } from './cart'
import { topLinks, categories, products, benefits, special, checks, posts, contactTopics, faq } from './data'

const icons = { Drumstick, Scale, HeartPulse, ShieldCheck, Factory, Smile }
const blackBtn = 'h-11 rounded-[10px] bg-ink px-5 text-sm font-semibold lowercase text-white hover:bg-[#222]'

export default function App() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  return (
    <CartProvider>
      <Header query={query} setQuery={setQuery} setTab={setTab} />
      <main>
        <Hero setTab={setTab} />
        <Benefits />
        <Catalog query={query} setQuery={setQuery} tab={tab} setTab={setTab} />
        <Mission />
        <Special />
        <Checks />
        <Blog />
        <Contacts />
        <Faq />
      </main>
      <Footer />
      <Cart />
    </CartProvider>
  )
}

/* ---------------- логотип (свой) ---------------- */
function Logo({ light }) {
  return (
    <a href="#top" className="flex items-center gap-2" aria-label="Хвостик — на главную">
      <span className="relative flex size-11 items-center justify-center rounded-[12px] bg-tang text-white">
        <PawPrint className="size-6" strokeWidth={2.2} />
        <svg viewBox="0 0 20 20" className="absolute -right-2 -top-2 size-5" aria-hidden>
          <path d="M3 17c6-1 11-6 13-14" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      </span>
      <span className={cn('text-[22px] font-extrabold lowercase leading-none tracking-tight', light && 'text-white')}>хвостик</span>
    </a>
  )
}

/* ---------------- шапка ---------------- */
function Header({ query, setQuery, setTab }) {
  const cart = useCart()
  const [menu, setMenu] = useState(false)
  const go = (c) => { if (c.tab) setTab(c.tab); setMenu(false) }
  return (
    <header id="top" className="sticky top-0 z-40 bg-white">
      <div className="wrap flex h-[68px] items-center gap-6">
        <button className="lg:hidden" onClick={() => setMenu(!menu)} aria-label="Меню">{menu ? <X /> : <Menu />}</button>
        <Logo />
        <button className="hidden items-center gap-2 rounded-[10px] bg-gray-1 px-4 py-2.5 text-sm md:flex">
          <MapPin className="size-4 text-violet" /> <span className="text-txt-2">доставка:</span> Москва
        </button>
        <nav className="hidden gap-6 text-sm text-txt-2 xl:flex">
          {topLinks.map((l) => <a key={l} href="#contacts" className="hover:text-ink">{l}</a>)}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <a href="tel:88000000000" className="mr-3 hidden text-right lg:block">
            <div className="text-[15px] font-semibold">8 800 000-00-00</div>
            <div className="text-xs text-txt-2">ежедневно 9:00–21:00</div>
          </a>
          <IconBtn label="Избранное" n={cart.fav.length}><Heart /></IconBtn>
          <IconBtn label="Профиль"><User /></IconBtn>
          <IconBtn label="Корзина" n={cart.count} onClick={() => cart.setOpen(true)}><ShoppingBag /></IconBtn>
        </div>
      </div>
      <div className="wrap flex gap-3 pb-3">
        <a href="#catalog" className={cn(blackBtn, 'flex h-[52px] items-center gap-2 px-6 text-lg')}>
          <Menu className="size-5" /> каталог
        </a>
        <label className="flex h-[52px] flex-1 items-center gap-3 rounded-[10px] border-2 border-ink px-4">
          <Search className="size-5 text-txt-2" />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setTab('all') }}
            onKeyDown={(e) => e.key === 'Enter' && document.getElementById('catalog')?.scrollIntoView()}
            placeholder="поиск по кормам: курица, говядина, стерилизованные…" className="w-full bg-transparent text-[15px] outline-none placeholder:text-txt-2" />
        </label>
      </div>
      <nav className={cn('wrap no-scrollbar gap-7 overflow-x-auto border-b border-gray-2 pb-3 text-[15px] lowercase', menu ? 'flex flex-col gap-3' : 'hidden lg:flex')}>
        {categories.map((c) => (
          <a key={c.label} href={c.href} onClick={() => go(c)} className={cn('whitespace-nowrap hover:text-violet', c.hot && 'font-semibold text-tang')}>
            {c.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

function IconBtn({ children, label, n, onClick }) {
  return (
    <button onClick={onClick} aria-label={label} className="relative flex size-11 items-center justify-center rounded-[10px] hover:bg-gray-1 [&_svg]:size-6">
      {children}
      {!!n && <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet px-1 text-[11px] font-bold text-white">{n}</span>}
    </button>
  )
}

/* ---------------- первый экран ---------------- */
function Hero({ setTab }) {
  return (
    <section className="wrap pt-5">
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#fdecef] via-[#fbdde3] to-[#f6c9d2] px-6 py-10 md:px-14 md:py-14">
        <div className="relative z-10 max-w-[560px]">
          <span className="inline-block rounded-full bg-ink px-3 py-1 text-xs font-semibold lowercase text-white">российский производитель</span>
          <h1 className="mt-5 text-[38px] font-extrabold leading-[1.02] tracking-tight md:text-[60px]">
            Корм, после которого миска пустеет
          </h1>
          <p className="mt-5 max-w-[460px] text-lg leading-snug md:text-xl">
            «Хвостик» — сухие корма для кошек и собак. Мясо в основе рецепта и натуральные ингредиенты для пищеварения и иммунитета.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#catalog" onClick={() => setTab('cat')} className={cn(blackBtn, 'flex h-[52px] items-center px-7 text-base')}>для кошек</a>
            <a href="#catalog" onClick={() => setTab('dog')} className="flex h-[52px] items-center rounded-[10px] bg-white px-7 text-base font-semibold lowercase hover:bg-gray-1">для собак</a>
          </div>
        </div>
        <div className="pointer-events-none mt-8 flex items-end justify-center gap-2 md:absolute md:bottom-0 md:right-10 md:mt-0 md:h-full md:items-center">
          <img src="./img/myau.png" alt="Упаковка Хвостик.Мяу" className="w-[150px] -rotate-6 mix-blend-multiply md:w-[250px]" />
          <img src="./img/gav.png" alt="Упаковка Хвостик.Гав" className="w-[150px] rotate-6 mix-blend-multiply md:w-[250px]" />
        </div>
        <div className="absolute right-6 top-6 z-10 flex size-[92px] rotate-12 flex-col items-center justify-center rounded-full bg-tang text-white md:right-[44%] md:top-10">
          <span className="text-[28px] font-extrabold leading-none">−15%</span>
          <span className="text-[11px] lowercase">на «мяу»</span>
        </div>
      </div>
      <div className="no-scrollbar mt-3 grid grid-flow-col gap-3 overflow-x-auto md:grid-cols-4">
        {[
          ['бесплатная доставка', 'от 2 000 ₽', 'bg-violet text-white'],
          ['подбор корма', 'за 5 минут', 'bg-gray-1'],
          ['заводчикам', 'особые условия', 'bg-ink text-white'],
          ['пробник', 'в каждом заказе', 'bg-myau/50'],
        ].map(([a, b, c]) => (
          <a key={a} href={a === 'подбор корма' || a === 'заводчикам' ? '#contacts' : '#catalog'} className={cn('flex min-w-[220px] items-center justify-between rounded-[14px] px-5 py-4 transition hover:opacity-90', c)}>
            <span><span className="block text-[15px] font-semibold lowercase">{a}</span><span className="text-sm opacity-75">{b}</span></span>
            <ChevronRight className="size-5" />
          </a>
        ))}
      </div>
    </section>
  )
}

/* ---------------- преимущества ---------------- */
function Benefits() {
  return (
    <section className="wrap py-16">
      <SectionTitle>почему «хвостик»</SectionTitle>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b, i) => {
          const I = icons[b.icon]
          return (
            <div key={b.title} className="flex gap-4 rounded-[16px] bg-gray-1 p-6">
              <span className={cn('flex size-14 shrink-0 items-center justify-center rounded-[14px]', 'bg-violet-soft text-violet-dark')}>
                <I className="size-7" />
              </span>
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

function SectionTitle({ children, more, href }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-[30px] font-extrabold lowercase leading-none tracking-tight md:text-[40px]">{children}</h2>
      {more && <a href={href} className="flex items-center gap-1 text-[15px] font-semibold text-violet hover:text-violet-dark">{more}<ChevronRight className="size-4" /></a>}
    </div>
  )
}

/* ---------------- каталог ---------------- */
function Catalog({ query, setQuery, tab, setTab }) {
  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => (tab === 'all' || p.kind === tab || p.kind === 'all') && (!q || (p.line + ' ' + p.name + ' ' + p.text).toLowerCase().includes(q)))
  }, [query, tab])
  return (
    <section id="catalog" className="scroll-mt-44 bg-gray-1 py-16">
      <div className="wrap">
        <SectionTitle>ассортимент</SectionTitle>
        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList className="h-auto gap-2 bg-transparent p-0">
            {[['all', 'все корма'], ['cat', 'кошкам'], ['dog', 'собакам']].map(([v, l]) => (
              <TabsTrigger key={v} value={v} className="h-10 rounded-full border-0 bg-white px-5 text-[15px] lowercase shadow-none data-[state=active]:bg-ink data-[state=active]:text-white">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {query && (
          <p className="mt-4 text-[15px]">
            по запросу «{query}»: найдено {list.length}{' '}
            <button className="text-violet underline" onClick={() => setQuery('')}>сбросить</button>
          </p>
        )}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} p={p} />)}
          {!list.length && <div className="rounded-[16px] bg-white p-8 text-txt-2 sm:col-span-2">ничего не нашли — попробуйте «курица» или «говядина»</div>}
          <div className="flex flex-col justify-between rounded-[16px] bg-violet p-6 text-white">
            <div>
              <span className="text-sm opacity-80">скоро</span>
              <h3 className="mt-2 text-2xl font-bold leading-tight">Новые вкусы: лосось и ягнёнок</h3>
              <p className="mt-2 text-[15px] opacity-85">Сообщим, когда появятся в продаже.</p>
            </div>
            <a href="#contacts" className="mt-6 flex h-11 items-center justify-center rounded-[10px] bg-white text-sm font-semibold lowercase text-ink">узнать первым</a>
          </div>
        </div>
        <p className="mt-6 text-xs text-txt-2">Цены демонстрационные.</p>
      </div>
    </section>
  )
}

function ProductImage({ p, className }) {
  if (p.img === 'duo')
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <img src="./img/myau.png" alt="" className="h-[78%] -rotate-6 mix-blend-multiply" />
        <img src="./img/gav.png" alt="" className="-ml-8 h-[78%] rotate-6 mix-blend-multiply" />
      </div>
    )
  return <img src={p.img} alt={p.line} className={cn('object-contain mix-blend-multiply', className)} />
}

function ProductCard({ p }) {
  const cart = useCart()
  const [vi, setVi] = useState(p.weights.length > 1 ? 1 : 0)
  const [info, setInfo] = useState(false)
  const v = p.weights[vi]
  const qty = cart.qtyOf(p.id, v.w)
  const faved = cart.fav.includes(p.id)
  const tone = { sun: 'bg-tang text-white', violet: 'bg-violet text-white', black: 'bg-ink text-white' }[p.badge.tone]
  return (
    <article className="flex flex-col rounded-[16px] bg-white p-4 shadow-card">
      <div className={cn('relative flex h-[240px] items-center justify-center overflow-hidden rounded-[12px]', p.bg)}>
        <button onClick={() => setInfo(true)} className="h-full w-full p-3" aria-label={`Подробнее: ${p.line}`}>
          <ProductImage p={p} className="mx-auto h-full" />
        </button>
        <span className={cn('absolute left-3 top-3 rounded-[8px] px-2 py-1 text-xs font-bold lowercase', tone)}>{p.badge.text}</span>
        <button onClick={() => cart.toggleFav(p.id)} aria-label="В избранное" aria-pressed={faved}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/80 hover:bg-white">
          <Heart className={cn('size-5', faved && 'fill-tang text-tang')} />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-1 text-sm">
        <Star className="size-4 fill-tang text-tang" /> <b>{p.rating.toFixed(1)}</b> <span className="text-txt-2">· {p.reviews} отзывов</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[22px] font-extrabold">{rub(v.price)}</span>
        {v.old && <span className="text-sm text-txt-2 line-through">{rub(v.old)}</span>}
      </div>
      <h3 className="mt-1 text-[15px] leading-snug"><b>{p.line}</b> {p.name}</h3>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.weights.map((w, i) => (
          <button key={w.w} onClick={() => setVi(i)}
            className={cn('rounded-[8px] border px-2.5 py-1 text-sm', i === vi ? 'border-ink bg-ink text-white' : 'border-gray-3 hover:border-ink')}>
            {w.w}
          </button>
        ))}
      </div>
      <div className="mt-auto pt-4">
        {qty ? (
          <div className="flex h-11 items-center justify-between rounded-[10px] bg-gray-1">
            <button className="flex size-11 items-center justify-center" onClick={() => cart.setQty(`${p.id}|${v.w}`, qty - 1)} aria-label="Меньше"><Minus className="size-4" /></button>
            <span className="text-sm font-semibold">{qty} в корзине</span>
            <button className="flex size-11 items-center justify-center" onClick={() => cart.setQty(`${p.id}|${v.w}`, qty + 1)} aria-label="Больше"><Plus className="size-4" /></button>
          </div>
        ) : (
          <Button onClick={() => cart.add(p, v)} className={cn(blackBtn, 'w-full gap-2')}><ShoppingBag className="size-4" /> в корзину</Button>
        )}
      </div>
      <Dialog open={info} onOpenChange={setInfo}>
        <DialogContent className="max-w-[720px] rounded-[20px] p-6 sm:max-w-[720px]">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className={cn('flex h-[300px] items-center justify-center rounded-[14px] p-4', p.bg)}><ProductImage p={p} className="h-full" /></div>
            <div>
              <DialogTitle className="text-2xl font-extrabold">{p.line}</DialogTitle>
              <DialogDescription className="mt-1 text-[15px] text-ink">{p.name}</DialogDescription>
              <p className="mt-4 text-[15px] leading-relaxed text-txt-2">{p.text}</p>
              <div className="mt-5 text-[26px] font-extrabold">{rub(v.price)} <span className="text-base font-normal text-txt-2">· {v.w}</span></div>
              <Button onClick={() => { cart.add(p, v); setInfo(false) }} className={cn(blackBtn, 'mt-4 w-full')}>в корзину</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  )
}

/* ---------------- миссия ---------------- */
function Mission() {
  return (
    <section id="mission" className="wrap scroll-mt-44 py-16">
      <div className="grid overflow-hidden rounded-[20px] bg-ink text-white md:grid-cols-[1.2fr_1fr]">
        <div className="p-8 md:p-14">
          <span className="text-sm lowercase text-violet">наша миссия</span>
          <h2 className="mt-4 text-[30px] font-extrabold leading-[1.05] md:text-[44px]">Радовать каждого хвостатого — от первой ложки до пустой миски</h2>
          <p className="mt-6 max-w-[520px] text-lg text-white/75">
            Мы делаем корм, который не просто насыщает, а помогает питомцу жить долго и активно. Вкусно, полезно и по честной цене — потому что сами кормим им своих котов и собак.
          </p>
        </div>
        <div className="relative flex min-h-[280px] items-center justify-center bg-violet">
          <PawPrint className="absolute left-6 top-6 size-16 text-white/15" />
          <PawPrint className="absolute bottom-8 right-10 size-24 rotate-12 text-white/15" />
          <div className="grid grid-cols-2 gap-3 p-8 text-center">
            {[['2', 'линейки кормов'], ['6', 'фасовок'], ['100%', 'партий в лаборатории'], ['0', 'красителей']].map(([n, l]) => (
              <div key={l} className="rounded-[14px] bg-white/10 px-4 py-5">
                <div className="text-[34px] font-extrabold leading-none">{n}</div>
                <div className="mt-2 text-sm lowercase text-white/80">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- особые потребности ---------------- */
function Special() {
  return (
    <section id="special" className="wrap scroll-mt-44 pb-16">
      <SectionTitle>особый подход к особым питомцам</SectionTitle>
      <p className="mt-3 max-w-[640px] text-[17px] text-txt-2">Рецепты под конкретные задачи: после стерилизации и для маленьких собак с большим запасом энергии.</p>
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
                <a href="#catalog" className="mt-6 inline-flex items-center gap-1 font-semibold text-violet-dark">к товару <ChevronRight className="size-4" /></a>
              </div>
              <img src={p.img} alt="" className="w-[38%] max-w-[190px] self-end object-contain mix-blend-multiply" />
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
    <section className="bg-gray-1 py-16">
      <div className="wrap">
        <SectionTitle>как мы проверяем корм</SectionTitle>
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
      <SectionTitle more="все статьи" href="#blog">блог о питании</SectionTitle>
      <div className="no-scrollbar mt-8 grid grid-flow-col gap-4 overflow-x-auto pb-2 lg:grid-flow-row lg:grid-cols-4">
        {posts.map((p) => (
          <button key={p.title} onClick={() => setPost(p)} className="group flex min-w-[260px] flex-col overflow-hidden rounded-[16px] border border-gray-2 text-left transition hover:shadow-card">
            <div className={cn('flex h-[150px] items-center justify-center', p.tone)}>
              <PawPrint className="size-14 text-ink/20 transition group-hover:scale-110" />
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
        <DialogContent className="max-w-[520px] rounded-[20px] p-7">
          <DialogTitle className="text-2xl font-extrabold leading-tight">{post?.title}</DialogTitle>
          <DialogDescription className="text-[16px] leading-relaxed text-txt-2">{post?.text} Полная статья появится здесь, когда подключим блог.</DialogDescription>
        </DialogContent>
      </Dialog>
    </section>
  )
}

/* ---------------- связаться ---------------- */
const fmtPhone = (raw) => {
  let d = raw.replace(/\D/g, '')
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

function LeadForm({ topic, compact, onDone, cta = 'отправить' }) {
  const [f, setF] = useState({ name: '', phone: '', msg: '', ok: true })
  const [err, setErr] = useState({})
  const [st, setSt] = useState('form')
  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (f.name.trim().length < 2) er.name = 'введите имя'
    if (f.phone.replace(/\D/g, '').length !== 11) er.phone = 'введите телефон полностью'
    if (!f.ok) er.ok = 'нужно согласие'
    setErr(er)
    if (Object.keys(er).length) return
    setSt('send'); setTimeout(() => { setSt('done'); onDone?.() }, 800)
  }
  if (st === 'done')
    return (
      <div className="rounded-[16px] bg-white p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-violet text-white"><Check className="size-7" /></div>
        <h3 className="mt-4 text-2xl font-extrabold">спасибо, {f.name.trim()}!</h3>
        <p className="mt-2 text-txt-2">Менеджер свяжется с вами в ближайшее время. Это демо — заявка никуда не ушла.</p>
      </div>
    )
  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field err={err.name}><Input placeholder="имя" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-invalid={!!err.name} className="h-12 rounded-[10px] bg-white text-[15px]" /></Field>
        <Field err={err.phone}><Input placeholder="телефон" inputMode="numeric" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value ? fmtPhone(e.target.value) : '' })} aria-invalid={!!err.phone} className="h-12 rounded-[10px] bg-white text-[15px]" /></Field>
      </div>
      {!compact && <Textarea placeholder={topic === 'order' ? 'номер заказа и что случилось' : 'сообщение (необязательно)'} value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} className="min-h-24 rounded-[10px] bg-white text-[15px]" />}
      <label className="flex items-start gap-2.5 text-xs text-txt-2">
        <Checkbox checked={f.ok} onCheckedChange={(v) => setF({ ...f, ok: !!v })} className="mt-0.5 data-[state=checked]:border-ink data-[state=checked]:bg-ink" />
        <span>согласен на обработку персональных данных {err.ok && <b className="text-destructive">— {err.ok}</b>}</span>
      </label>
      <Button type="submit" disabled={st === 'send'} className={cn(blackBtn, 'h-12 w-full sm:w-auto sm:px-10')}>
        {st === 'send' ? <Loader2 className="animate-spin" /> : <><Send className="size-4" />{cta}</>}
      </Button>
    </form>
  )
}

function Field({ err, children }) {
  return <label className="block">{children}{err && <span className="mt-1 block text-xs text-destructive">{err}</span>}</label>
}

function Contacts() {
  return (
    <section id="contacts" className="scroll-mt-44 bg-gray-1 py-16">
      <div className="wrap">
        <SectionTitle>связаться с нами</SectionTitle>
        <Tabs defaultValue="pick" className="mt-6 gap-6">
          <TabsList className="no-scrollbar h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0">
            {contactTopics.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="h-10 flex-none rounded-full border-0 bg-white px-5 text-[15px] lowercase shadow-none data-[state=active]:bg-violet data-[state=active]:text-white">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {contactTopics.map((t) => (
            <TabsContent key={t.id} value={t.id}>
              <div className="grid gap-8 rounded-[20px] bg-white/60 p-6 md:grid-cols-[1fr_1.3fr] md:p-10">
                <div>
                  <h3 className="text-2xl font-extrabold lowercase">{t.label}</h3>
                  <p className="mt-3 text-[17px] leading-relaxed text-txt-2">{t.text}</p>
                  <p className="mt-4 text-[15px]">Заполните форму — менеджер <b>обязательно свяжется с вами</b>.</p>
                  <div className="mt-6 space-y-2 text-[15px]">
                    <a href="tel:88000000000" className="flex items-center gap-2 font-semibold"><Phone className="size-4" />8 800 000-00-00</a>
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
function Footer() {
  return (
    <footer className="bg-ink pb-10 pt-14 text-white">
      <div className="wrap grid gap-10 md:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-sm text-white/60">Корма для кошек и собак. Демо-сайт магазина.</p>
        </div>
        {[
          ['покупателям', ['доставка и оплата', 'где купить', 'возврат', 'вопросы']],
          ['о компании', ['о бренде', 'производство', 'блог', 'заводчикам']],
        ].map(([h, ls]) => (
          <div key={h}>
            <div className="mb-3 font-semibold lowercase">{h}</div>
            <ul className="space-y-2 text-sm text-white/60">{ls.map((l) => <li key={l}><a href="#contacts" className="hover:text-violet">{l}</a></li>)}</ul>
          </div>
        ))}
        <div>
          <div className="mb-3 font-semibold lowercase">поговорим про питомцев</div>
          <a href="tel:88000000000" className="text-2xl font-bold">8 800 000-00-00</a>
          <p className="mt-1 text-sm text-white/60">горячая линия 9:00–21:00 мск</p>
        </div>
      </div>
      <div className="wrap mt-10 border-t border-white/10 pt-6 text-xs text-white/40">© 2026 «Хвостик». Цены и условия на сайте демонстрационные.</div>
    </footer>
  )
}

/* ---------------- корзина ---------------- */
function Cart() {
  const cart = useCart()
  const [checkout, setCheckout] = useState(false)
  const free = 2000
  return (
    <>
      <Sheet open={cart.open} onOpenChange={cart.setOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[440px]">
          <SheetHeader className="border-b border-gray-2 p-5">
            <SheetTitle className="text-2xl font-extrabold lowercase">корзина</SheetTitle>
            <SheetDescription>{cart.count ? `${cart.count} шт. на ${rub(cart.total)}` : 'пока пусто'}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {!cart.items.length && (
              <div className="py-16 text-center text-txt-2">
                <ShoppingBag className="mx-auto mb-3 size-12 text-gray-3" />
                добавьте корм из каталога
              </div>
            )}
            {cart.items.map((i) => (
              <div key={i.key} className="flex gap-3 rounded-[14px] bg-gray-1 p-3">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-[10px] bg-white p-1">
                  <ProductImage p={{ img: i.img, line: i.line }} className="h-full" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="text-sm leading-snug"><b>{i.line}</b> · {i.w}</div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-[8px] bg-white">
                      <button className="flex size-8 items-center justify-center" onClick={() => cart.setQty(i.key, i.qty - 1)} aria-label="Меньше"><Minus className="size-3.5" /></button>
                      <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                      <button className="flex size-8 items-center justify-center" onClick={() => cart.setQty(i.key, i.qty + 1)} aria-label="Больше"><Plus className="size-3.5" /></button>
                    </div>
                    <span className="font-bold">{rub(i.price * i.qty)}</span>
                  </div>
                </div>
                <button onClick={() => cart.setQty(i.key, 0)} aria-label="Удалить" className="self-start text-txt-2 hover:text-ink"><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
          {!!cart.items.length && (
            <div className="border-t border-gray-2 p-5">
              <div className="mb-3 rounded-[10px] bg-violet-soft px-3 py-2 text-sm">
                {cart.total >= free ? '🎉 доставка бесплатная' : `до бесплатной доставки ${rub(free - cart.total)}`}
              </div>
              <div className="mb-4 flex justify-between text-lg"><span>итого</span><b>{rub(cart.total)}</b></div>
              <Button onClick={() => { cart.setOpen(false); setCheckout(true) }} className={cn(blackBtn, 'h-12 w-full text-base')}>оформить заказ</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Dialog open={checkout} onOpenChange={setCheckout}>
        <DialogContent className="max-w-[520px] rounded-[20px] bg-gray-1 p-7">
          <DialogTitle className="text-2xl font-extrabold lowercase">оформление заказа</DialogTitle>
          <DialogDescription className="text-[15px] text-txt-2">Сумма {rub(cart.total)}. Оставьте контакты — перезвоним и уточним адрес доставки.</DialogDescription>
          <LeadForm compact cta="подтвердить заказ" onDone={cart.clear} />
        </DialogContent>
      </Dialog>
    </>
  )
}
