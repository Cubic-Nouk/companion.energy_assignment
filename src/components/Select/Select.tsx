import { Check, ChevronDown } from 'lucide-react'
import { Select as RadixSelect } from 'radix-ui'

import styles from './Select.module.css'

export interface SelectOption<T extends string> {
  value: T
  label: string
}

interface SelectProps<T extends string> {
  /** Accessible name; the visible text is the selected option. */
  label: string
  value: T
  options: readonly SelectOption<T>[]
  onValueChange: (value: T) => void
}

export function Select<T extends string>({ label, value, options, onValueChange }: SelectProps<T>) {
  return (
    <RadixSelect.Root
      value={value}
      onValueChange={(next) => {
        const option = options.find((o) => o.value === next)
        if (option) onValueChange(option.value)
      }}
    >
      <RadixSelect.Trigger className={styles.trigger} aria-label={label}>
        <RadixSelect.Value />
        <RadixSelect.Icon className={styles.icon}>
          <ChevronDown size={16} aria-hidden="true" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className={styles.content} position="popper" sideOffset={4}>
          <RadixSelect.Viewport>
            {options.map((option) => (
              <RadixSelect.Item key={option.value} value={option.value} className={styles.item}>
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className={styles.indicator}>
                  <Check size={14} aria-hidden="true" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
