import { ChevronDown, X } from 'lucide-react'
import { Popover } from 'radix-ui'

import type { SelectOption } from '../Select/Select'
import styles from './MultiSelect.module.css'

interface MultiSelectProps<T extends string> {
  /** Accessible name of the whole control, e.g. "Profiles". */
  label: string
  placeholder: string
  options: readonly SelectOption<T>[]
  selected: ReadonlySet<T>
  onChange: (selected: ReadonlySet<T>) => void
}

/**
 * Chips for the selected options, each removable, plus a clear-all button and a dropdown of
 * checkboxes. The buttons sit side by side, never inside one another, so each stays reachable.
 */
export function MultiSelect<T extends string>({
  label,
  placeholder,
  options,
  selected,
  onChange,
}: MultiSelectProps<T>) {
  const chosen = options.filter((option) => selected.has(option.value))

  const toggle = (value: T) => {
    const next = new Set(selected)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    onChange(next)
  }

  return (
    <Popover.Root>
      {/* The whole control anchors the dropdown, so it opens under the chips, not the chevron. */}
      <Popover.Anchor className={styles.control} role="group" aria-label={label}>
        <ul className={styles.chips}>
          {chosen.length === 0 && <li className={styles.placeholder}>{placeholder}</li>}
          {chosen.map((option) => (
            <li key={option.value} className={styles.chip}>
              {option.label}
              <button
                type="button"
                className={styles.chipRemove}
                aria-label={`Remove ${option.label}`}
                onClick={() => {
                  toggle(option.value)
                }}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        {chosen.length > 0 && (
          <button
            type="button"
            className={`${styles.iconButton ?? ''} ${styles.clear ?? ''}`}
            aria-label={`Clear all ${label.toLowerCase()}`}
            onClick={() => {
              onChange(new Set())
            }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
        <span className={styles.divider} aria-hidden="true" />
        <Popover.Trigger
          className={`${styles.iconButton ?? ''} ${styles.chevron ?? ''}`}
          aria-label={`Choose ${label.toLowerCase()}`}
        >
          <ChevronDown size={16} aria-hidden="true" />
        </Popover.Trigger>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content className={styles.content} align="start" sideOffset={4}>
          <fieldset className={styles.options}>
            <legend className={styles.legend}>{label}</legend>
            {options.map((option) => (
              <label key={option.value} className={styles.option}>
                <input
                  type="checkbox"
                  checked={selected.has(option.value)}
                  onChange={() => {
                    toggle(option.value)
                  }}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
