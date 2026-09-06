import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CardFormValues } from '@/types/card'
import type { DeliveryFormValues } from '@/types/delivery'
import type { Product } from '@/types/product'
import { PaymentSummary } from './PaymentSummary'

const product: Product = {
  id: 'p1',
  title: 'Speaker',
  description: 'A speaker',
  price: 149000,
  currency: 'COP',
  stock: 5,
  images: ['a.jpg'],
  deliveryFee: 9000,
}

const card: CardFormValues = {
  cardNumber: '4242 4242 4242 4242',
  name: 'LUIS CORREA',
  expiry: '12/29',
  cvv: '123',
  installments: 1,
}

const delivery: DeliveryFormValues = {
  fullName: 'Luis Correa',
  documentType: 'CC',
  documentId: '1000099928',
  phone: '3001234567',
  email: 'luis@example.com',
  address: 'Calle 123 #45-67',
  city: 'medellin',
  department: 'antioquia',
}

const noop = () => {}

describe('PaymentSummary', () => {
  it('shows the masked card, delivery address and total (product + base fee + delivery fee)', () => {
    render(
      <PaymentSummary
        isOpen
        onClose={noop}
        onConfirmPayment={noop}
        onEditCard={noop}
        onEditDelivery={noop}
        product={product}
        card={card}
        delivery={delivery}
      />,
    )

    expect(screen.getByText('•••• 4242')).toBeInTheDocument()
    expect(screen.getByText('Calle 123 #45-67, Medellín')).toBeInTheDocument()
    // medellin -> multiplicador 1x: deliveryFee = 9000; total = 149000 + 5000 + 9000
    expect(screen.getByText(/^Pagar \$\s?163\.000$/)).toBeInTheDocument()
  })

  it('calls onEditCard / onEditDelivery when the chips are clicked', async () => {
    const onEditCard = jest.fn()
    const onEditDelivery = jest.fn()
    render(
      <PaymentSummary
        isOpen
        onClose={noop}
        onConfirmPayment={noop}
        onEditCard={onEditCard}
        onEditDelivery={onEditDelivery}
        product={product}
        card={card}
        delivery={delivery}
      />,
    )

    await userEvent.click(screen.getByLabelText('Editar datos de la tarjeta'))
    expect(onEditCard).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByLabelText('Editar dirección de entrega'))
    expect(onEditDelivery).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirmPayment when the pay button is clicked', async () => {
    const onConfirmPayment = jest.fn()
    render(
      <PaymentSummary
        isOpen
        onClose={noop}
        onConfirmPayment={onConfirmPayment}
        onEditCard={noop}
        onEditDelivery={noop}
        product={product}
        card={card}
        delivery={delivery}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /Pagar/ }))

    expect(onConfirmPayment).toHaveBeenCalledTimes(1)
  })

  it('disables the pay button and shows a loading label while submitting', () => {
    render(
      <PaymentSummary
        isOpen
        onClose={noop}
        onConfirmPayment={noop}
        onEditCard={noop}
        onEditDelivery={noop}
        product={product}
        card={card}
        delivery={delivery}
        isSubmitting
      />,
    )

    const payButton = screen.getByRole('button', { name: 'Procesando…' })
    expect(payButton).toBeDisabled()
  })

  it('shows the submit error message when present', () => {
    render(
      <PaymentSummary
        isOpen
        onClose={noop}
        onConfirmPayment={noop}
        onEditCard={noop}
        onEditDelivery={noop}
        product={product}
        card={card}
        delivery={delivery}
        submitError="La tarjeta fue rechazada"
      />,
    )

    expect(screen.getByText('La tarjeta fue rechazada')).toBeInTheDocument()
  })
})
