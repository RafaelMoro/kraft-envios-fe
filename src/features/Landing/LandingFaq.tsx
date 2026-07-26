'use client'

import { useState } from 'react'
import { LANDING_FAQS } from '@/shared/constants/landing.constants'

export const LandingFaq = () => {
  const [openIndex, setOpenIndex] = useState<number>(0)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index)
  }

  return (
    <section id="faq" className="scroll-mt-24 bg-gray-50">
      <div className="mx-auto max-w-[860px] px-7 py-16">
        <span className="text-xs uppercase tracking-widest text-primary-700">FAQ</span>
        <h2 className="mt-2 text-3xl font-black tracking-tight">Preguntas frecuentes</h2>

        <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
          {LANDING_FAQS.map((item, index) => {
            const isOpen = openIndex === index

            return (
              <div key={item.question} className="py-4">
                <h3>
                  <button
                    type="button"
                    id={`faq-question-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    onClick={() => toggle(index)}
                    className="flex w-full items-center justify-between gap-4 text-left text-base font-semibold text-gray-900"
                  >
                    <span>{item.question}</span>
                    <span aria-hidden="true" className="text-xl text-primary-700">
                      {isOpen ? '×' : '+'}
                    </span>
                  </button>
                </h3>
                {isOpen && (
                  <p
                    id={`faq-panel-${index}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    className="mt-3 text-pretty text-gray-600"
                  >
                    {item.answer}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
