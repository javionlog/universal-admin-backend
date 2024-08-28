import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { t } from 'elysia'

export const user = sqliteTable('user', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').unique().notNull(),
  password: text('password').notNull()
})

export const schemaComment = {
  username: '用户名',
  password: '密码'
}

export const insertUserSchema = createInsertSchema(user, {
  username: t.String({ description: schemaComment.username, minLength: 2 }),
  password: t.String({ description: schemaComment.password, minLength: 6 })
})

export const selectUserSchema = createSelectSchema(user, {
  username: t.String({ description: schemaComment.username }),
  password: t.String({ description: schemaComment.password })
})
