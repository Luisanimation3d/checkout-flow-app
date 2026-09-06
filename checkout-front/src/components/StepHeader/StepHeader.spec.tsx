import { render, screen } from '@testing-library/react'
import { StepHeader } from './StepHeader'

describe('StepHeader', () => {
  it('renders the icon, title and subtitle', () => {
    render(
      <StepHeader icon={<span data-testid="icon" />} title="Datos de tarjeta" subtitle="Ingresa tu tarjeta" />,
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Datos de tarjeta' })).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu tarjeta')).toBeInTheDocument()
  })
})
