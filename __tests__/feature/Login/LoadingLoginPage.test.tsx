import { LoadingLoginPage } from "@/features/Login/LoadingLoginPage";
import { FORGOT_PASSWORD_ROUTE } from "@/shared/constants/global.constants";
import { render, screen } from "@testing-library/react";

describe('<LoadingLoginPage />', () => {
  it('renders loading state correctly', () => {
    render(<LoadingLoginPage />);

    expect(screen.getByRole('heading', { name: /bienvenido de vuelta/i })).toBeInTheDocument();
    expect(screen.getByText(/ingrese sus credenciales para entrar a su cuenta\./i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /¿olvidaste tu contraseña\?/i })).toHaveAttribute('href', FORGOT_PASSWORD_ROUTE);
    expect(screen.getByRole('link', { name: /registrarse/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeDisabled();
  });
})