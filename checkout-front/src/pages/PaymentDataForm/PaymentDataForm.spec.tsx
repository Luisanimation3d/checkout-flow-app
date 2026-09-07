import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaymentDataForm } from './PaymentDataForm'

// Fecha bien a futuro para no depender de mockear el reloj del sistema
// (evita el roce conocido entre fake timers y los delays internos de userEvent).
const fillValidCard = async () => {
  await userEvent.type(screen.getByLabelText('Número de tarjeta'), '4242424242424242')
  await userEvent.type(screen.getByLabelText('Nombre del titular'), 'LUIS CORREA')
  await userEvent.type(screen.getByLabelText('MM/YY'), '1249')
  await userEvent.type(screen.getByLabelText('CVV'), '123')
}

const fillValidDelivery = async () => {
  await userEvent.type(screen.getByLabelText('Nombre completo'), 'Luis Correa')
  await userEvent.type(screen.getByLabelText('Número de documento'), '1000099928')
  await userEvent.type(screen.getByLabelText('Teléfono'), '3001234567')
  await userEvent.type(screen.getByLabelText('Correo electrónico'), 'luis@example.com')
  await userEvent.type(screen.getByLabelText('Dirección'), 'Calle 123 #45-67')
  await userEvent.selectOptions(screen.getByLabelText('Departamento'), 'antioquia')
  await userEvent.selectOptions(screen.getByLabelText('Ciudad'), 'medellin')
}

describe('PaymentDataForm', () => {
  it('renders nothing when closed', () => {
    render(<PaymentDataForm isOpen={false} onClose={() => {}} onComplete={() => {}} />)

    expect(screen.queryByLabelText('Número de tarjeta')).not.toBeInTheDocument()
  })

  it('keeps "Siguiente" disabled until the card form is fully valid', async () => {
    render(<PaymentDataForm isOpen onClose={() => {}} onComplete={() => {}} />)

    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()

    await fillValidCard()

    expect(screen.getByRole('button', { name: 'Siguiente' })).not.toBeDisabled()
  })

  it('moves to the delivery step, then completes with both forms filled in', async () => {
    // Llena ~11 campos secuenciales con userEvent.type (delay real de tecleo):
    // bajo instrumentación de coverage puede pasar el timeout default de 5s.
    const onComplete = jest.fn()
    render(<PaymentDataForm isOpen onClose={() => {}} onComplete={onComplete} />)

    await fillValidCard()
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument()

    await fillValidDelivery()
    expect(screen.getByRole('button', { name: 'Ver resumen' })).not.toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Ver resumen' }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    const [card, delivery] = onComplete.mock.calls[0]
    expect(card.cardNumber).toBe('4242 4242 4242 4242')
    expect(delivery.fullName).toBe('Luis Correa')
  }, 15000)

  it('returns to the card step when "Volver" is clicked', async () => {
    render(<PaymentDataForm isOpen onClose={() => {}} onComplete={() => {}} />)

    await fillValidCard()
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Volver/ }))

    expect(screen.getByLabelText('Número de tarjeta')).toBeInTheDocument()
  })

  it('opens on the requested initial step (e.g. when retrying a payment)', () => {
    render(
      <PaymentDataForm isOpen initialStep="delivery" onClose={() => {}} onComplete={() => {}} />,
    )

    expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument()
  })
})
