import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import type { CardField, CardFormValues } from '@/types/card'
import { CardForm } from './CardForm'

const initialValues: CardFormValues = {
  cardNumber: '',
  name: '',
  expiry: '',
  cvv: '',
  installments: 1,
}

const ControlledCardForm = ({
  onFieldFocus = () => {},
  onFieldBlur = () => {},
}: {
  onFieldFocus?: (field: CardField) => void
  onFieldBlur?: () => void
}) => {
  const [values, setValues] = useState(initialValues)
  return (
    <CardForm values={values} onChange={setValues} onFieldFocus={onFieldFocus} onFieldBlur={onFieldBlur} />
  )
}

describe('CardForm', () => {
  it('formats the card number into groups of 4 as the user types', async () => {
    render(<ControlledCardForm />)

    await userEvent.type(screen.getByLabelText('Número de tarjeta'), '4242424242424242')

    expect(screen.getByLabelText('Número de tarjeta')).toHaveValue('4242 4242 4242 4242')
  })

  it('uppercases the cardholder name as typed', async () => {
    render(<ControlledCardForm />)

    await userEvent.type(screen.getByLabelText('Nombre del titular'), 'luis correa')

    expect(screen.getByLabelText('Nombre del titular')).toHaveValue('LUIS CORREA')
  })

  it('formats the expiry as MM/YY', async () => {
    render(<ControlledCardForm />)

    await userEvent.type(screen.getByLabelText('MM/YY'), '1229')

    expect(screen.getByLabelText('MM/YY')).toHaveValue('12/29')
  })

  it('strips non-digit characters from the cvv and caps its length', async () => {
    render(<ControlledCardForm />)

    await userEvent.type(screen.getByLabelText('CVV'), '12a3456')

    expect(screen.getByLabelText('CVV')).toHaveValue('123')
  })

  it('lets the user pick the number of installments', async () => {
    render(<ControlledCardForm />)

    await userEvent.selectOptions(screen.getByLabelText('Cuotas'), '6')

    expect(screen.getByLabelText('Cuotas')).toHaveValue('6')
  })

  it('reports focus/blur per field', async () => {
    const onFieldFocus = jest.fn()
    const onFieldBlur = jest.fn()
    render(<ControlledCardForm onFieldFocus={onFieldFocus} onFieldBlur={onFieldBlur} />)

    await userEvent.click(screen.getByLabelText('Número de tarjeta'))
    expect(onFieldFocus).toHaveBeenCalledWith('cardNumber')

    await userEvent.tab()
    expect(onFieldBlur).toHaveBeenCalled()
  })
})
