import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LandingFaq } from '@/features/Landing/LandingFaq'
import { LANDING_FAQS } from '@/shared/constants/landing.constants'

describe('LandingFaq', () => {
  it('opens the first question by default with its answer visible', () => {
    render(<LandingFaq />)

    const firstQuestion = screen.getByRole('button', { name: LANDING_FAQS[0].question })
    expect(firstQuestion).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(LANDING_FAQS[0].answer)).toBeInTheDocument()
  })

  it('keeps every other question closed by default', () => {
    render(<LandingFaq />)

    LANDING_FAQS.slice(1).forEach((item) => {
      const question = screen.getByRole('button', { name: item.question })
      expect(question).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(item.answer)).not.toBeInTheDocument()
    })
  })

  it('opens a second question and closes the first one, keeping only one open at a time', async () => {
    const user = userEvent.setup()
    render(<LandingFaq />)

    const secondQuestion = screen.getByRole('button', { name: LANDING_FAQS[1].question })
    await user.click(secondQuestion)

    expect(secondQuestion).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(LANDING_FAQS[1].answer)).toBeInTheDocument()

    const firstQuestion = screen.getByRole('button', { name: LANDING_FAQS[0].question })
    expect(firstQuestion).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(LANDING_FAQS[0].answer)).not.toBeInTheDocument()
  })

  it('collapses the open question when clicked again', async () => {
    const user = userEvent.setup()
    render(<LandingFaq />)

    const firstQuestion = screen.getByRole('button', { name: LANDING_FAQS[0].question })
    await user.click(firstQuestion)

    expect(firstQuestion).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(LANDING_FAQS[0].answer)).not.toBeInTheDocument()
  })

  it('renders each question as a heading', () => {
    render(<LandingFaq />)

    LANDING_FAQS.forEach((item) => {
      expect(screen.getByRole('heading', { level: 3, name: item.question })).toBeInTheDocument()
    })
  })

  it('is operable by keyboard', async () => {
    const user = userEvent.setup()
    render(<LandingFaq />)

    const secondQuestion = screen.getByRole('button', { name: LANDING_FAQS[1].question })
    secondQuestion.focus()
    await user.keyboard('{Enter}')

    expect(secondQuestion).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(LANDING_FAQS[1].answer)).toBeInTheDocument()
  })
})
