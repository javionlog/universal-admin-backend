import { resource } from '@/db/schemas/resource/index'
import { role } from '@/db/schemas/role/index'
import { baseColumns, baseComments, baseFields } from '@/db/shared/index'
import { relations } from 'drizzle-orm'
import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { type Static, t } from 'elysia'

export const roleToResource = sqliteTable(
  'role_to_resource',
  {
    ...baseFields,
    roleCode: text('role_code')
      .notNull()
      .references(() => role.roleCode),
    resourceCode: text('resource_code')
      .notNull()
      .references(() => resource.resourceCode)
  },
  t => {
    return {
      roleToResourceUnique: uniqueIndex('role_to_resource_unique').on(
        t.roleCode,
        t.resourceCode
      )
    }
  }
)

export const roleToResourceRelation = relations(roleToResource, ({ one }) => {
  return {
    role: one(role, {
      fields: [roleToResource.roleCode],
      references: [role.roleCode]
    }),
    resource: one(resource, {
      fields: [roleToResource.resourceCode],
      references: [resource.resourceCode]
    })
  }
})

export const schemaComments = {
  ...baseComments,
  roleCode: '角色编码',
  resourceCode: '资源编码'
}

const insertColumns = {
  ...baseColumns,
  roleCode: t.String({ description: schemaComments.roleCode }),
  resourceCode: t.String({
    description: schemaComments.resourceCode
  })
}

const selectColumns = insertColumns

export const insertSchema = createInsertSchema(roleToResource, insertColumns)
export const selectSchema = createSelectSchema(roleToResource, selectColumns)

export type InsertParams = Static<typeof insertSchema>
export type SelectParams = Static<typeof selectSchema>
