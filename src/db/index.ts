import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { role } from './schemas/role/index'
import { userToRole } from './schemas/user-to-role/index'
import { user } from './schemas/user/index'

const schema = {
  user,
  role,
  userToRole
}

const sqlite = new Database('sqlite.db')
export const db = drizzle(sqlite, { schema })
