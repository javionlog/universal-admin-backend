import { role, uniqueKey as roleUniqueKey } from '@/db/schemas/role/index'
import { user, uniqueKey as userUniqueKey } from '@/db/schemas/user/index'
import { baseColumns, baseComments, commonFields } from '@/db/shared/index'
import { relations } from 'drizzle-orm'
import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { type Static, t } from 'elysia'

export const userToRole = sqliteTable(
  'user_to_role',
  {
    ...commonFields,
    [userUniqueKey]: text('username')
      .notNull()
      .references(() => user[userUniqueKey]),
    [roleUniqueKey]: text('role_code')
      .notNull()
      .references(() => role[roleUniqueKey])
  },
  t => {
    return {
      userToRoleUnique: uniqueIndex('user_to_role_unique').on(
        t[userUniqueKey],
        t[roleUniqueKey]
      )
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
      fields: [userToRole[userUniqueKey]],
      references: [user[userUniqueKey]]
    }),
    role: one(role, {
      fields: [userToRole[roleUniqueKey]],
      references: [role[roleUniqueKey]]
    })
  }
})

export const schemaComments = {
  ...baseComments,
  [userUniqueKey]: '用户名',
  [roleUniqueKey]: '角色编码'
}

const insertColumns = {
  ...baseColumns,
  [userUniqueKey]: t.String({ description: schemaComments[userUniqueKey] }),
  [roleUniqueKey]: t.String({ description: schemaComments[roleUniqueKey] })
}

const selectColumns = insertColumns

export const insertSchema = createInsertSchema(userToRole, insertColumns)
export const selectSchema = createSelectSchema(userToRole, selectColumns)

export type InsertParams = Static<typeof insertSchema>
export type SelectParams = Static<typeof selectSchema>
