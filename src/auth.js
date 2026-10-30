// Вход в личный кабинет по коду: защита от ботов и выбор канала доставки кода.
//
// Как это будет работать с настоящим сервисом:
// 1. Браузер получает токен Яндекс SmartCaptcha (невидимая проверка, российский сервис)
//    и отправляет его на сервер вместе с номером: POST /api/auth/send-code { phone, captcha }.
// 2. Сервер проверяет токен капчи, лимиты по номеру и IP, затем смотрит,
//    привязан ли к номеру Telegram или Max. Если привязан — код уходит туда (бесплатно),
//    если нет — по смс через подключённый смс-сервис.
// 3. Ответ сервера: { channel: 'telegram' | 'max' | 'sms', resendIn: 60 }.
// Пока сервера нет, всё ниже работает в демо-режиме прямо в браузере.
// Важно: проверки в браузере — первый барьер, обойти их можно. Настоящие лимиты
// и проверка капчи обязательно должны дублироваться на сервере.

export const authConfig = {
  api: '', // адрес сервера, например 'https://api.hvostik.ru'; пусто — демо-режим
  smartCaptchaKey: '', // ключ клиента Яндекс SmartCaptcha; пусто — капча не загружается
  resendSeconds: 60, // пауза перед повторной отправкой кода
  maxSendsPerHour: 3, // сколько раз за час можно запросить код на один номер
  maxWrongCodes: 5, // после стольких неверных кодов вход блокируется
  lockMinutes: 15,
  minFillMs: 1500, // форму, заполненную быстрее, считаем заполненной ботом
}

export const channelNames = { telegram: 'Telegram', max: 'Max', sms: 'смс' }

const digits = (phone) => phone.replace(/\D/g, '')
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* пусто */ } }

/* ---- привязка мессенджеров (демо: хранится в браузере, на сервере — в базе) ---- */
export function linkedChannels(phone) {
  return read('hv-linked', {})[digits(phone)] || []
}
export function setLinked(phone, channel, on) {
  const all = read('hv-linked', {})
  const cur = new Set(all[digits(phone)] || [])
  on ? cur.add(channel) : cur.delete(channel)
  all[digits(phone)] = [...cur]
  write('hv-linked', all)
  return all[digits(phone)]
}
// Куда отправлять код: сначала Telegram, потом Max, иначе смс
export const pickChannel = (linked) => (linked.includes('telegram') ? 'telegram' : linked.includes('max') ? 'max' : 'sms')

/* ---- лимиты ---- */
function limits(phone) {
  const all = read('hv-auth', {})
  return { all, l: all[digits(phone)] || { sends: [], wrong: 0, lockUntil: 0 } }
}
const save = (phone, all, l) => { all[digits(phone)] = l; write('hv-auth', all) }

export function lockLeft(phone) {
  const { l } = limits(phone)
  return Math.max(0, Math.ceil((l.lockUntil - Date.now()) / 1000))
}

/* ---- Яндекс SmartCaptcha: загружается только если указан ключ ---- */
let captchaReady
function loadCaptcha() {
  if (!authConfig.smartCaptchaKey) return Promise.resolve(null)
  captchaReady ||= new Promise((ok, fail) => {
    const s = document.createElement('script')
    s.src = 'https://smartcaptcha.yandexcloud.net/captcha.js?render=onload'
    s.async = true
    s.onload = () => ok(window.smartCaptcha)
    s.onerror = fail
    document.head.appendChild(s)
  })
  return captchaReady
}
async function captchaToken() {
  const sc = await loadCaptcha()
  if (!sc) return null
  const box = document.createElement('div')
  document.body.appendChild(box)
  return new Promise((ok) => {
    const id = sc.render(box, { sitekey: authConfig.smartCaptchaKey, invisible: true, hideShield: true, callback: (t) => { box.remove(); ok(t) } })
    sc.execute(id)
  })
}

/* ---- отправка кода ---- */
// trap — скрытое поле-ловушка (человек его не видит и не заполняет), startedAt — когда открыли форму
export async function sendCode(phone, { trap = '', startedAt = 0 } = {}) {
  if (trap) return { error: 'Не удалось отправить код. Попробуйте ещё раз.' }
  if (Date.now() - startedAt < authConfig.minFillMs) return { error: 'Слишком быстро. Проверьте данные и нажмите ещё раз.' }
  const { all, l } = limits(phone)
  const now = Date.now()
  if (l.lockUntil > now) return { error: `Слишком много попыток. Попробуйте через ${Math.ceil((l.lockUntil - now) / 60000)} мин.` }
  l.sends = l.sends.filter((t) => now - t < 3600e3)
  const last = l.sends.at(-1)
  if (last && now - last < authConfig.resendSeconds * 1000) return { error: 'Код уже отправлен, подождите немного.', resendIn: Math.ceil((authConfig.resendSeconds * 1000 - (now - last)) / 1000) }
  if (l.sends.length >= authConfig.maxSendsPerHour) return { error: 'Код можно запросить не больше 3 раз в час. Попробуйте позже.' }

  const captcha = await captchaToken()
  let res
  if (authConfig.api) {
    const r = await fetch(`${authConfig.api}/api/auth/send-code`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: digits(phone), captcha }) })
    res = await r.json()
    if (!r.ok) return { error: res.error || 'Не удалось отправить код' }
  } else {
    // демо: код генерируется в браузере и показывается на экране
    const code = String(Math.floor(1000 + Math.random() * 9000))
    sessionStorage.setItem('hv-demo-code', code)
    res = { channel: pickChannel(linkedChannels(phone)), resendIn: authConfig.resendSeconds, demoCode: code }
  }
  l.sends.push(now)
  save(phone, all, l)
  return res
}

/* ---- проверка кода ---- */
export async function checkCode(phone, code) {
  const { all, l } = limits(phone)
  if (l.lockUntil > Date.now()) return { error: 'Вход временно заблокирован. Попробуйте позже.' }
  let ok
  if (authConfig.api) {
    const r = await fetch(`${authConfig.api}/api/auth/check-code`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: digits(phone), code }) })
    ok = r.ok
  } else ok = code === sessionStorage.getItem('hv-demo-code')
  if (ok) { l.wrong = 0; save(phone, all, l); sessionStorage.removeItem('hv-demo-code'); return { ok: true } }
  l.wrong += 1
  if (l.wrong >= authConfig.maxWrongCodes) { l.lockUntil = Date.now() + authConfig.lockMinutes * 60e3; l.wrong = 0; save(phone, all, l); return { error: `Неверный код. Вход заблокирован на ${authConfig.lockMinutes} минут.` } }
  save(phone, all, l)
  return { error: `Неверный код. Осталось попыток: ${authConfig.maxWrongCodes - l.wrong}` }
}
