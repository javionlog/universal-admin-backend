import { baseColumns, baseComments, commonFields } from '@/db/shared/index'
import { BOOL_MAP } from '@/modules/shared/constants/indext'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import {
  type Refine,
  createInsertSchema,
  createSelectSchema
} from 'drizzle-typebox'
import { type Static, t } from 'elysia'

export const user = sqliteTable('user', {
  ...commonFields,
  username: text('username').unique().notNull(),
  password: text('password').notNull(),
  isAdmin: text('is_admin').default(BOOL_MAP.no),
  lastSignInAt: integer('last_sign_in_at')
})

export const schemaComments = {
  ...baseComments,
  username: '用户名',
  password: '密码',
  isAdmin: '是否管理员，是(Y)/否(N)',
  lastSignInAt: '最后登录时间'
}

const insertColumns: Refine<typeof user, 'insert'> = {
  ...baseColumns,
  username: t.String({ description: schemaComments.username }),
  password: t.String({ description: schemaComments.password }),
  isAdmin: t.Union([t.Literal(BOOL_MAP.yes), t.Literal(BOOL_MAP.no)], {
    description: schemaComments.isAdmin,
    default: BOOL_MAP.no
  }),
  lastSignInAt: t.Number({ description: schemaComments.lastSignInAt })
}

const selectColumns: Refine<typeof user, 'select'> = insertColumns

export const insertSchema = createInsertSchema(user, insertColumns)
export const selectSchema = createSelectSchema(user, selectColumns)

export type InsertParams = Static<typeof insertSchema>
export type SelectParams = Static<typeof selectSchema>
