import { userToRole } from '@/db/schemas/user-to-role/index'
import { baseColumns, baseComments, baseFields } from '@/db/shared/index'
import { WHETHER_TYPE } from '@/global/constants/indext'
import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { type Static, t } from 'elysia'

export const user = sqliteTable('user', {
  ...baseFields,
  status: text('status').notNull().default(WHETHER_TYPE.no),
  username: text('username').unique().notNull(),
  password: text('password').notNull(),
  isAdmin: text('is_admin').notNull().default(WHETHER_TYPE.no),
  lastSignInAt: integer('last_sign_in_at')
})

export const userRelation = relations(user, ({ many }) => {
  return {
    roles: many(userToRole)
  }
})

export const schemaComments = {
  ...baseComments,
  status: '状态，启用(Y)/禁用(N)',
  username: '用户名',
  password: '密码',
  isAdmin: '是否管理员，是(Y)/否(N)',
  lastSignInAt: '最后登录时间'
}

const insertColumns = {
  ...baseColumns,
  status: t.Union([t.Literal(WHETHER_TYPE.yes), t.Literal(WHETHER_TYPE.no)], {
    description: schemaComments.status,
    default: WHETHER_TYPE.no
  }),
  username: t.String({ description: schemaComments.username }),
  password: t.String({ description: schemaComments.password }),
  isAdmin: t.Union([t.Literal(WHETHER_TYPE.yes), t.Literal(WHETHER_TYPE.no)], {
    description: schemaComments.isAdmin,
    default: WHETHER_TYPE.no
  }),
  lastSignInAt: t.Number({ description: schemaComments.lastSignInAt })
}

const selectColumns = insertColumns

export const insertSchema = createInsertSchema(user, insertColumns)
export const selectSchema = createSelectSchema(user, selectColumns)

export type InsertParams = Static<typeof insertSchema>
export type SelectParams = Static<typeof selectSchema>
