import { baseColumns, baseComments, commonFields } from '@/db/shared/index'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import {
  type Refine,
  createInsertSchema,
  createSelectSchema
} from 'drizzle-typebox'
import { type Static, t } from 'elysia'

export const role = sqliteTable('role', {
  ...commonFields,
  roleCode: text('role_code').unique().notNull(),
  roleName: text('role_name').notNull()
})

export const schemaComments = {
  ...baseComments,
  roleCode: '角色编码',
  roleName: '角色名称'
}

const insertColumns: Refine<typeof role, 'insert'> = {
  ...baseColumns,
  roleCode: t.String({ description: schemaComments.roleCode }),
  roleName: t.String({ description: schemaComments.roleName })
}

const selectColumns: Refine<typeof role, 'select'> = insertColumns

export const insertSchema = createInsertSchema(role, insertColumns)
export const selectSchema = createSelectSchema(role, selectColumns)

export type InsertParams = Static<typeof insertSchema>
export type SelectParams = Static<typeof selectSchema>
