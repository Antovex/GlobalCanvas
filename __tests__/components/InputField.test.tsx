import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import InputField from '@/components/InputField'

// Test wrapper component to provide form context
const TestWrapper = ({ children, defaultValues = {} }) => {
  const methods = useForm({ defaultValues })
  return (
    <form>
      {children(methods)}
    </form>
  )
}

describe('InputField Component', () => {
  test('renders input field with label', () => {
    render(
      <TestWrapper>
        {(methods) => (
          <InputField
            label="Test Label"
            name="testField"
            register={methods.register}
          />
        )}
      </TestWrapper>
    )

    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  test('displays default value correctly', () => {
    render(
      <TestWrapper defaultValues={{ testField: 'default value' }}>
        {(methods) => (
          <InputField
            label="Test Label"
            name="testField"
            register={methods.register}
            defaultValue="default value"
          />
        )}
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('default value')
  })

  test('handles different input types', () => {
    render(
      <TestWrapper>
        {(methods) => (
          <InputField
            label="Email Field"
            name="email"
            type="email"
            register={methods.register}
          />
        )}
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })

  test('displays error message when provided', () => {
    const mockError = {
      message: 'This field is required',
      type: 'required'
    }

    render(
      <TestWrapper>
        {(methods) => (
          <InputField
            label="Test Field"
            name="testField"
            register={methods.register}
            error={mockError}
          />
        )}
      </TestWrapper>
    )

    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByText('This field is required')).toHaveClass('text-red-400')
  })

  test('applies custom className correctly', () => {
    render(
      <TestWrapper>
        {(methods) => (
          <InputField
            label="Test Field"
            name="testField"
            register={methods.register}
            classname="custom-class"
          />
        )}
      </TestWrapper>
    )

    const container = screen.getByText('Test Field').closest('div')
    expect(container).toHaveClass('custom-class')
  })

  test('handles user input correctly', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        {(methods) => (
          <InputField
            label="Test Field"
            name="testField"
            register={methods.register}
          />
        )}
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'test input')
    
    expect(input).toHaveValue('test input')
  })

  test('applies input props correctly', () => {
    render(
      <TestWrapper>
        {(methods) => (
          <InputField
            label="Test Field"
            name="testField"
            register={methods.register}
            inputProps={{
              placeholder: 'Enter text here',
              maxLength: 50,
              disabled: true
            }}
          />
        )}
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', 'Enter text here')
    expect(input).toHaveAttribute('maxLength', '50')
    expect(input).toBeDisabled()
  })
})