import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { resource } from './schemas/resource/index'
import { roleToResource } from './schemas/role-to-resource/index'
import { role } from './schemas/role/index'
import { userToRole } from './schemas/user-to-role/index'
import { user } from './schemas/user/index'

const schema = {
  user,
  role,
  resource,
  userToRole,
  roleToResource
}

const sqlite = new Database('sqlite.db')
export const db = drizzle(sqlite, { schema })
