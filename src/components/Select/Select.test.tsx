import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Select } from './Select'

const options = [
  { value: 'be', label: 'Belgium' },
  { value: 'fr', label: 'France' },
] as const

type Value = (typeof options)[number]['value']

function renderSelect(value: Value) {
  const onValueChange = vi.fn<(value: Value) => void>()
  render(<Select label="Market" value={value} options={options} onValueChange={onValueChange} />)
  return onValueChange
}

describe('Select', () => {
  it('shows the selected option under its accessible name', () => {
    renderSelect('be')

    expect(screen.getByRole('combobox', { name: 'Market' })).toHaveTextContent('Belgium')
  })

  it('reports the option picked from the list', async () => {
    const onValueChange = renderSelect('be')

    await userEvent.click(screen.getByRole('combobox', { name: 'Market' }))
    await userEvent.click(screen.getByRole('option', { name: 'France' }))

    expect(onValueChange).toHaveBeenCalledWith('fr')
  })
})
