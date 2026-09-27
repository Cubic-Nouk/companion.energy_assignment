import currentUser from '../../data/currentUser.json'

export interface User {
  firstName: string
  lastName: string
  email: string
}

/** The signed-in user. Stands in for the session API; the record lives in data/currentUser.json. */
export const CURRENT_USER: User = currentUser
