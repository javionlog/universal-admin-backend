import { roleToResource } from '@/db/schemas/role-to-resource/index'
import { userToRole } from '@/db/schemas/user-to-role/index'
import { baseColumns, baseComments, baseFields } from '@/db/shared/index'
import { BOOL_MAP } from '@/global/constants/indext'
import { relations } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { type Static, t } from 'elysia'

export const role = sqliteTable('role', {
  ...baseFields,
  status: text('status').notNull().default(BOOL_MAP.no),
  roleCode: text('role_code').unique().notNull(),
  roleName: text('role_name').notNull()
})

export const roleRelation = relations(role, ({ many }) => {
  return {
    users: many(userToRole),
    resources: many(roleToResource)
  }
})

export const schemaComments = {
  ...baseComments,
  status: '状态，启用(Y)/禁用(N)',
  roleCode: '角色编码',
  roleName: '角色名称'
}

const insertColumns = {
  ...baseColumns,
  status: t.Union([t.Literal(BOOL_MAP.yes), t.Literal(BOOL_MAP.no)], {
    description: schemaComments.status,
    default: BOOL_MAP.no
  }),
  roleCode: t.String({ description: schemaComments.roleCode }),
  roleName: t.String({ description: schemaComments.roleName })
}

const selectColumns = insertColumns

export const insertSchema = createInsertSchema(role, insertColumns)
export const selectSchema = createSelectSchema(role, selectColumns)

export type InsertParams = Static<typeof insertSchema>
export type SelectParams = Static<typeof selectSchema>
