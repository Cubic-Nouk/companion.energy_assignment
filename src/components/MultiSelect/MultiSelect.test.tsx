import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MultiSelect } from './MultiSelect'

const options = [
  { value: 'base', label: 'Base' },
  { value: 'peak', label: 'Peak' },
  { value: 'offPeak', label: 'Off-Peak' },
] as const

type Value = (typeof options)[number]['value']

function renderMultiSelect(selected: Value[]) {
  const onChange = vi.fn<(next: ReadonlySet<Value>) => void>()
  render(
    <MultiSelect
      label="Profiles"
      placeholder="No profile"
      options={options}
      selected={new Set(selected)}
      onChange={onChange}
    />,
  )
  return onChange
}

describe('MultiSelect', () => {
  it('shows one chip per selected option', () => {
    renderMultiSelect(['base', 'peak'])

    expect(screen.getByRole('button', { name: 'Remove Base' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Peak' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove Off-Peak' })).not.toBeInTheDocument()
  })

  it('removes one option from its chip', async () => {
    const onChange = renderMultiSelect(['base', 'peak'])

    await userEvent.click(screen.getByRole('button', { name: 'Remove Base' }))

    expect(onChange).toHaveBeenCalledWith(new Set(['peak']))
  })

  it('clears every option at once', async () => {
    const onChange = renderMultiSelect(['base', 'peak'])

    await userEvent.click(screen.getByRole('button', { name: 'Clear all profiles' }))

    expect(onChange).toHaveBeenCalledWith(new Set())
  })

  it('shows the placeholder and no clear button when nothing is selected', () => {
    renderMultiSelect([])

    expect(screen.getByText('No profile')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear all profiles' })).not.toBeInTheDocument()
  })

  it('adds an option from the dropdown', async () => {
    const onChange = renderMultiSelect(['base'])

    await userEvent.click(screen.getByRole('button', { name: 'Choose profiles' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Off-Peak' }))

    expect(onChange).toHaveBeenCalledWith(new Set(['base', 'offPeak']))
  })
})
