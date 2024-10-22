import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { resource, resourceRelation } from './schemas/resource/index'
import {
  roleToResource,
  roleToResourceRelation
} from './schemas/role-to-resource/index'
import { role, roleRelation } from './schemas/role/index'
import { userToRole, userToRoleRelation } from './schemas/user-to-role/index'
import { user, userRelation } from './schemas/user/index'

const schema = {
  user,
  role,
  resource,
  userToRole,
  roleToResource,
  userRelation,
  roleRelation,
  resourceRelation,
  userToRoleRelation,
  roleToResourceRelation
}

const sqlite = new Database('sqlite.db')
export const db = drizzle(sqlite, { schema })
