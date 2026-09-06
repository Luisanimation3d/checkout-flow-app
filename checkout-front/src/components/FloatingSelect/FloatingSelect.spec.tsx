import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FloatingSelect } from './FloatingSelect'

const options = [
  { value: 'CC', label: 'Cédula' },
  { value: 'CE', label: 'Cédula extranjería' },
]

describe('FloatingSelect', () => {
  it('renders every option plus the placeholder', () => {
    const { container } = render(
      <FloatingSelect id="docType" label="Tipo" options={options} placeholder="Selecciona" value="" onChange={() => {}} />,
    )

    expect(screen.getByRole('option', { name: 'Cédula' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Cédula extranjería' })).toBeInTheDocument()
    // El placeholder es un <option hidden>: queda fuera del árbol de accesibilidad
    // a propósito, así que se verifica directo en el DOM en vez de con getByRole.
    expect(container.querySelector('option[value=""]')).toHaveTextContent('Selecciona')
  })

  it('calls onChange when a new option is selected', async () => {
    const onChange = jest.fn()
    render(
      <FloatingSelect id="docType" label="Tipo" options={options} value="CC" onChange={onChange} />,
    )

    await userEvent.selectOptions(screen.getByLabelText('Tipo'), 'CE')

    expect(onChange).toHaveBeenCalled()
  })

  it('can be disabled', () => {
    render(
      <FloatingSelect id="docType" label="Tipo" options={options} value="CC" onChange={() => {}} disabled />,
    )

    expect(screen.getByLabelText('Tipo')).toBeDisabled()
  })
})
