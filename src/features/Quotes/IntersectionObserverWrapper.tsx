"use client"
import { ReactNode, useEffect, useRef } from "react";

interface ActionBarIntersectionObserverProps {
  children: ReactNode;
  setIntersecting: (isIntersecting: boolean) => void;
}

export const IntersectionObserverWrapper = ({ children, setIntersecting }: ActionBarIntersectionObserverProps) => {
  const ref = useRef(null)
  const observer = useRef<IntersectionObserver | null>(null)

  const disconnect = () => {
    if (observer.current && observer.current.disconnect) {
      observer.current.disconnect()
    }
  }

  useEffect(() => {
    return () => disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ref.current) return

    observer.current = new IntersectionObserver(async ([entry]) => {
      if (!entry || entry.intersectionRatio < 0) return
      setIntersecting(entry.isIntersecting)
    })
    observer.current.observe(ref.current)
  }, [ref, setIntersecting])

  return (
    <article data-testid="action-bar-intersection-observer" ref={ref}>
      {children}
    </article>
  )
}