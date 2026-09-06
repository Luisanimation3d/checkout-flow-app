import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import type { DeliveryFormValues } from '@/types/delivery'
import { DeliveryForm } from './DeliveryForm'

const initialValues: DeliveryFormValues = {
  fullName: '',
  documentType: 'CC',
  documentId: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  department: '',
}

const ControlledDeliveryForm = () => {
  const [values, setValues] = useState(initialValues)
  return <DeliveryForm values={values} onChange={setValues} />
}

describe('DeliveryForm', () => {
  it('lets the user fill the full name', async () => {
    render(<ControlledDeliveryForm />)

    await userEvent.type(screen.getByLabelText('Nombre completo'), 'John Doe')

    expect(screen.getByLabelText('Nombre completo')).toHaveValue('John Doe')
  })

  it('strips non-digit characters from the document id', async () => {
    render(<ControlledDeliveryForm />)

    await userEvent.type(screen.getByLabelText('Número de documento'), '10a00b09992c8')

    expect(screen.getByLabelText('Número de documento')).toHaveValue('1000099928')
  })

  it('caps the phone at 10 digits, stripping non-digit input', async () => {
    render(<ControlledDeliveryForm />)

    await userEvent.type(screen.getByLabelText('Teléfono'), '300-123-4567-999')

    expect(screen.getByLabelText('Teléfono')).toHaveValue('3001234567')
  })

  it('accepts an email address', async () => {
    render(<ControlledDeliveryForm />)

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'john@example.com')

    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('john@example.com')
  })

  it('disables the city select until a department is chosen', () => {
    render(<ControlledDeliveryForm />)

    expect(screen.getByLabelText('Ciudad')).toBeDisabled()
  })

  it('resets the city and enables the select once a department is chosen', async () => {
    render(<ControlledDeliveryForm />)

    await userEvent.selectOptions(screen.getByLabelText('Departamento'), 'antioquia')

    expect(screen.getByLabelText('Ciudad')).not.toBeDisabled()
    expect(screen.getByRole('option', { name: 'Medellín' })).toBeInTheDocument()
  })

  it('shows only the cities for the selected department', async () => {
    render(<ControlledDeliveryForm />)

    await userEvent.selectOptions(screen.getByLabelText('Departamento'), 'valle-del-cauca')

    expect(screen.getByRole('option', { name: 'Cali' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Medellín' })).not.toBeInTheDocument()
  })
})
