import { render, screen } from '@testing-library/react'
import type { CardFormValues } from '@/types/card'
import { CreditCard } from './CreditCard'

const values: CardFormValues = {
  cardNumber: '4242 4242 4242 4242',
  name: 'LUIS CORREA',
  expiry: '12/29',
  cvv: '123',
  installments: 1,
}

describe('CreditCard', () => {
  it('shows the padded card number and cardholder name', () => {
    render(<CreditCard values={values} activeField={null} />)

    expect(screen.getByText('4242 4242 4242 4242')).toBeInTheDocument()
    expect(screen.getByText('LUIS CORREA')).toBeInTheDocument()
    expect(screen.getByText('12/29')).toBeInTheDocument()
  })

  it('shows a placeholder name when none is typed yet', () => {
    render(<CreditCard values={{ ...values, name: '' }} activeField={null} />)

    expect(screen.getByText('NOMBRE APELLIDO')).toBeInTheDocument()
  })

  it('masks the CVV on the back face', () => {
    render(<CreditCard values={{ ...values, cvv: '1' }} activeField="cvv" />)

    expect(screen.getByText('1XX')).toBeInTheDocument()
  })

  it('shows a placeholder card number when empty', () => {
    render(<CreditCard values={{ ...values, cardNumber: '' }} activeField={null} />)

    expect(screen.getByText('XXXX XXXX XXXX XXXX')).toBeInTheDocument()
  })
})
