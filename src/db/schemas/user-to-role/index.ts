import { role } from '@/db/schemas/role/index'
import { user } from '@/db/schemas/user/index'
import { baseColumns, baseComments, baseFields } from '@/db/shared/index'
import { relations } from 'drizzle-orm'
import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import {
  type Refine,
  createInsertSchema,
  createSelectSchema
} from 'drizzle-typebox'
import { type Static, t } from 'elysia'

export const userToRole = sqliteTable(
  'user_to_role',
  {
    ...baseFields,
    username: text('username')
      .notNull()
      .references(() => user.username),
    roleCode: text('role_code')
      .notNull()
      .references(() => role.roleCode)
  },
  t => {
    return {
      pk: primaryKey({ columns: [t.username, t.roleCode] })
    }
  }
)

export const userRoleRelation = relations(user, ({ many }) => {
  return {
    roles: many(userToRole)
  }
})

export const roleUserRelation = relations(role, ({ many }) => {
  return {
    users: many(userToRole)
  }
})

export const userToRoleRelation = relations(userToRole, ({ one }) => {
  return {
    user: one(user, {
      fields: [userToRole.username],
      references: [user.username]
    }),
    role: one(role, {
      fields: [userToRole.roleCode],
      references: [role.roleCode]
    })
  }
})

export const schemaComments = {
  ...baseComments,
  username: '用户名',
  roleCode: '角色编码'
}

const insertColumns: Refine<typeof userToRole, 'insert'> = {
  ...baseColumns,
  username: t.String({ description: schemaComments.username }),
  roleCode: t.String({ description: schemaComments.roleCode })
}

const selectColumns: Refine<typeof userToRole, 'select'> = insertColumns

export const insertSchema = createInsertSchema(userToRole, insertColumns)
export const selectSchema = createSelectSchema(userToRole, selectColumns)

export type InsertParams = Static<typeof insertSchema>
export type SelectParams = Static<typeof selectSchema>
