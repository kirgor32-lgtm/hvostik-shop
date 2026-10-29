import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { BASE } from './data'
import { match, head, applyHead, stripBase } from './seo'

const RouteCtx = createContext(null)
export const useRoute = () => useContext(RouteCtx)
export const href = (path = '') => BASE + path

export function RouterProvider({ initialPath, children }) {
  const [route, setRoute] = useState(() => match(initialPath))
  const navigate = useCallback((path, opts = {}) => {
    const r = match(path)
    window.history.pushState({}, '', href(r.path) + (opts.hash ? '#' + opts.hash : ''))
    setRoute(r)
    applyHead(head(r))
    if (opts.hash) setTimeout(() => document.getElementById(opts.hash)?.scrollIntoView({ behavior: 'smooth' }), 40)
    else window.scrollTo({ top: 0 })
  }, [])
  useEffect(() => {
    const onPop = () => { const r = match(stripBase(location.pathname)); setRoute(r); applyHead(head(r)) }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return <RouteCtx.Provider value={{ route, navigate }}>{children}</RouteCtx.Provider>
}

// Настоящая ссылка <a href> — поисковики видят адрес, а клики работают без перезагрузки
export function Link({ to, hash, onClick, children, ...rest }) {
  const { navigate } = useRoute()
  return (
    <a
      href={href(to) + (hash ? '#' + hash : '')}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        navigate(to, { hash })
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
