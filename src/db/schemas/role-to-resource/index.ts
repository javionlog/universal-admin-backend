import { resource } from '@/db/schemas/resource/index'
import { role } from '@/db/schemas/role/index'
import { baseColumns, baseComments, baseFields } from '@/db/shared/index'
import { relations } from 'drizzle-orm'
import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import {
  type Refine,
  createInsertSchema,
  createSelectSchema
} from 'drizzle-typebox'
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
      pk: primaryKey({ columns: [t.roleCode, t.resourceCode] })
    }
  }
)

export const roleResourceRelation = relations(resource, ({ many }) => {
  return {
    resources: many(roleToResource)
  }
})

export const resourceRoleRelation = relations(role, ({ many }) => {
  return {
    roles: many(roleToResource)
  }
})

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

const insertColumns: Refine<typeof roleToResource, 'insert'> = {
  ...baseColumns,
  roleCode: t.String({ description: schemaComments.roleCode }),
  resourceCode: t.String({ description: schemaComments.resourceCode })
}

const selectColumns: Refine<typeof roleToResource, 'select'> = insertColumns

export const insertSchema = createInsertSchema(roleToResource, insertColumns)
export const selectSchema = createSelectSchema(roleToResource, selectColumns)

export type InsertParams = Static<typeof insertSchema>
export type SelectParams = Static<typeof selectSchema>
