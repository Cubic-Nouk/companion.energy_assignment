/** Two-letter avatar label: first letter of the first name and of the last name. */
export function getInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0)
  const last = lastName.trim().charAt(0)
  return `${first}${last}`.toUpperCase()
}
