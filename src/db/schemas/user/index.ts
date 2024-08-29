import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import {
  type Refine,
  createInsertSchema,
  createSelectSchema
} from 'drizzle-typebox'
import { type Static, t } from 'elysia'

export const user = sqliteTable('user', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').unique().notNull(),
  password: text('password').notNull(),
  status: text('status').default('N'),
  isAdmin: text('is_admin').default('N'),
  sort: integer('sort').default(0),
  delFlag: text('del_flag').default('N'),
  lastSignInAt: integer('last_sign_in_at'),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by')
})

export const schemaComment = {
  username: '用户名',
  password: '密码',
  status: '状态，启用(Y)/禁用(N)',
  isAdmin: '是否管理员，是(Y)/否(N)',
  sort: '排序',
  delFlag: '删除标记，已删除(Y)/未删除(N)',
  lastSignInAt: '最后登录时间',
  createdAt: '创建时间',
  updatedAt: '更新时间',
  createdBy: '创建人',
  updatedBy: '更新人'
}

type InsertColumns = Refine<typeof user, 'insert'>
const insertColumns: InsertColumns = {
  username: t.String({ description: schemaComment.username, minLength: 2 }),
  password: t.String({ description: schemaComment.password, minLength: 6 }),
  status: t.Union([t.Literal('Y'), t.Literal('N')], {
    description: schemaComment.status,
    default: 'N'
  }),
  isAdmin: t.Union([t.Literal('Y'), t.Literal('N')], {
    description: schemaComment.isAdmin,
    default: 'N'
  }),
  sort: t.Number({ description: schemaComment.sort, default: 0 }),
  delFlag: t.Union([t.Literal('Y'), t.Literal('N')], {
    description: schemaComment.delFlag,
    default: 'N'
  }),
  lastSignInAt: t.String({ description: schemaComment.lastSignInAt }),
  createdAt: t.String({ description: schemaComment.createdAt }),
  updatedAt: t.String({ description: schemaComment.updatedAt }),
  createdBy: t.String({ description: schemaComment.createdBy }),
  updatedBy: t.String({ description: schemaComment.updatedBy })
}

type SelectColumns = Refine<typeof user, 'select'>
const selectColumns: SelectColumns = {
  ...insertColumns,
  username: t.String({ description: schemaComment.username }),
  password: t.String({ description: schemaComment.password })
}

export const insertUserSchema = createInsertSchema(user, insertColumns)

export const selectUserSchema = createSelectSchema(user, selectColumns)

export type InsertUserParams = Static<typeof insertUserSchema>
export type SelectUserParams = Static<typeof selectUserSchema>
