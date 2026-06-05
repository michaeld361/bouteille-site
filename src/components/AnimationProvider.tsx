'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export default function AnimationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenisRef = useRef<any>(null)
  const rafRef = useRef<number>(0)
  const revealObserverRef = useRef<IntersectionObserver | null>(null)

  // ── Reveal system (native IntersectionObserver — runs on every page) ──
  useEffect(() => {
    // Create a single IntersectionObserver for all reveal elements
    revealObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const delay = (Number(el.dataset.delay) || 0) * 0.15
            if (delay > 0) {
              setTimeout(() => el.classList.add('visible'), delay * 1000)
            } else {
              el.classList.add('visible')
            }
            revealObserverRef.current?.unobserve(el)
          }
        })
      },
      { threshold: 0.05 }
    )

    function observeRevealElements() {
      // Generic .reveal elements
      document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
        revealObserverRef.current?.observe(el)
      })

      // Sub-page elements (staggered by index within their group)
      const subElements = document.querySelectorAll(
        '.event-card:not(.visible), .menu-item:not(.visible), .team-member:not(.visible), .wine-item:not(.visible)'
      )
      subElements.forEach((el, i) => {
        const htmlEl = el as HTMLElement
        if (!htmlEl.dataset.delay) {
          htmlEl.dataset.delay = String((i % 4) * 0.5)
        }
        htmlEl.classList.add('reveal')
        revealObserverRef.current?.observe(el)
      })
    }

    // Run immediately
    observeRevealElements()

    // Also run after a short delay to catch any late-rendered content
    const timer = setTimeout(observeRevealElements, 100)

    return () => {
      clearTimeout(timer)
      revealObserverRef.current?.disconnect()
    }
  }, [pathname]) // Re-run on every page navigation

  // ── Lenis + GSAP extras (init once) ──
  useEffect(() => {
    async function initExtras() {
      const { default: gsap } = await import('gsap')
      const { default: Lenis } = await import('lenis')

      const lenis = new Lenis({
        duration: 2.0,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.8,
      })
      lenisRef.current = lenis

      function raf(time: number) {
        lenis.raf(time)
        rafRef.current = requestAnimationFrame(raf)
      }
      rafRef.current = requestAnimationFrame(raf)

      // Marquee skew on velocity
      const marqueeTrack = document.querySelector('.marquee__track') as HTMLElement
      if (marqueeTrack) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lenis.on('scroll', (e: any) => {
          const vel = Math.abs(e.velocity)
          const skew = Math.min(vel * 0.5, 4)
          marqueeTrack.style.transform = `translateX(var(--marquee-x, 0)) skewX(${-skew}deg)`
        })
      }

      // Magnetic hover (desktop only)
      if (!window.matchMedia('(max-width: 768px)').matches) {
        document.querySelectorAll('[data-magnetic]').forEach((el) => {
          el.addEventListener('mousemove', (e: Event) => {
            const mouseEvent = e as MouseEvent
            const rect = (el as HTMLElement).getBoundingClientRect()
            const dx = mouseEvent.clientX - (rect.left + rect.width / 2)
            const dy = mouseEvent.clientY - (rect.top + rect.height / 2)
            gsap.to(el, { x: dx * 0.4, y: dy * 0.4, duration: 0.3, ease: 'power2.out' })
          })
          el.addEventListener('mouseleave', () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' })
          })
        })
      }

      // Nav scroll state
      const nav = document.querySelector('.nav')
      if (nav) {
        const sentinel = document.createElement('div')
        sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;'
        document.body.prepend(sentinel)
        new IntersectionObserver(([e]) => {
          nav.classList.toggle('scrolled', !e.isIntersecting)
        }, { threshold: 0, rootMargin: '-72px 0px 0px 0px' }).observe(sentinel)
      }
    }

    initExtras()

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (lenisRef.current) lenisRef.current.destroy()
    }
  }, [])

  return <>{children}</>
}
