'use client'

import { ReactNode, useEffect, useRef } from 'react'

interface RevealOnScrollProps {
  children: ReactNode
  className?: string
}

export const RevealOnScroll = ({ children, className }: RevealOnScrollProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') return

    if (element.getBoundingClientRect().top <= window.innerHeight) return

    element.setAttribute('data-reveal', '')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        element.setAttribute('data-reveal', 'in')
        observer.unobserve(element)
      },
      { threshold: 0.12 }
    )
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
