import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ChangeEventHandler } from 'react'
import { FloatingInput } from './FloatingInput'

describe('FloatingInput', () => {
  it('renders the label associated with the input', () => {
    render(<FloatingInput id="email" label="Correo" value="" onChange={() => {}} />)

    expect(screen.getByLabelText('Correo')).toBeInTheDocument()
  })

  it('shows the trailing icon when provided', () => {
    render(
      <FloatingInput
        id="email"
        label="Correo"
        value=""
        onChange={() => {}}
        trailingIcon={<span data-testid="icon" />}
      />,
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('shows the helper text only when status is invalid', () => {
    const { rerender } = render(
      <FloatingInput id="email" label="Correo" value="" onChange={() => {}} helperText="Correo inválido" />,
    )
    expect(screen.queryByText('Correo inválido')).not.toBeInTheDocument()

    rerender(
      <FloatingInput
        id="email"
        label="Correo"
        value="bad"
        onChange={() => {}}
        status="invalid"
        helperText="Correo inválido"
      />,
    )
    expect(screen.getByText('Correo inválido')).toBeInTheDocument()
  })

  it('calls onChange as the user types', async () => {
    let value = ''
    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      value = event.target.value
    }
    const { rerender } = render(
      <FloatingInput id="email" label="Correo" value={value} onChange={handleChange} />,
    )

    await userEvent.type(screen.getByLabelText('Correo'), 'a')
    rerender(<FloatingInput id="email" label="Correo" value={value} onChange={handleChange} />)

    expect(value).toBe('a')
  })

  it('calls onFocus/onBlur handlers', async () => {
    let focused = false
    let blurred = false
    render(
      <FloatingInput
        id="email"
        label="Correo"
        value=""
        onChange={() => {}}
        onFocus={() => {
          focused = true
        }}
        onBlur={() => {
          blurred = true
        }}
      />,
    )

    const input = screen.getByLabelText('Correo')
    await userEvent.click(input)
    expect(focused).toBe(true)

    await userEvent.tab()
    expect(blurred).toBe(true)
  })
})
