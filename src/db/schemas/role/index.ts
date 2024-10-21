import { baseColumns, baseComments, commonFields } from '@/db/shared/index'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import {
  type Refine,
  createInsertSchema,
  createSelectSchema
} from 'drizzle-typebox'
import { type Static, t } from 'elysia'

export const uniqueKey = 'roleCode'

export const role = sqliteTable('role', {
  ...commonFields,
  [uniqueKey]: text('role_code').unique().notNull(),
  roleName: text('role_name').notNull()
})

export const schemaComments = {
  ...baseComments,
  [uniqueKey]: '角色编码',
  roleName: '角色名称'
}

const insertColumns = {
  ...baseColumns,
  [uniqueKey]: t.String({ description: schemaComments[uniqueKey] }),
  roleName: t.String({ description: schemaComments.roleName })
}

const selectColumns = insertColumns

export const insertSchema = createInsertSchema(
  role,
  insertColumns as Refine<typeof role, 'insert'>
)
export const selectSchema = createSelectSchema(
  role,
  selectColumns as Refine<typeof role, 'select'>
)

export type InsertParams = Static<typeof insertSchema>
export type SelectParams = Static<typeof selectSchema>
