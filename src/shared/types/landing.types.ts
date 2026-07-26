export interface LandingValueBullet {
  num: string
  title: string
  body: string
}

export interface LandingStep {
  num: string
  title: string
  body: string
}

export interface LandingFeature {
  tag: string
  title: string
  body: string
  bullets: readonly string[]
}

export interface LandingAudience {
  title: string
  body: string
}

export interface LandingFaqItem {
  question: string
  answer: string
}
