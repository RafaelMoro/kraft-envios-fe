import { screen, render } from '@testing-library/react'

import { QueryProviderWrapper } from '@/app/QueryProviderWrapper'
import { ResetPasswordCard } from '@/features/Login/ResetPassword/ResetPasswordCard'

describe('ResetPasswordCard', () => {
  it('Show reset password card', () => {
    const mockToggleMessageCardState = jest.fn()
    const mockSlug = 'test-slug'
    render(
      <QueryProviderWrapper>
        <ResetPasswordCard slug={mockSlug} toggleMessageCardState={mockToggleMessageCardState}  />
      </QueryProviderWrapper>
    )
    expect(screen.getByText(/ingresa y confirma tu nueva contraseña para recuperar el acceso\./i)).toBeInTheDocument()
    expect(screen.getByTestId('password')).toBeInTheDocument()
    expect(screen.getByTestId('confirmPassword')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /volver al inicio/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reestablecer contraseña/i })).toBeInTheDocument()
  })
})