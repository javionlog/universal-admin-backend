import {
  resource,
  uniqueKey as resourceUniqueKey
} from '@/db/schemas/resource/index'
import { role, uniqueKey as roleUniqueKey } from '@/db/schemas/role/index'
import { baseColumns, baseComments, commonFields } from '@/db/shared/index'
import { relations } from 'drizzle-orm'
import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import {
  type Refine,
  createInsertSchema,
  createSelectSchema
} from 'drizzle-typebox'
import { type Static, t } from 'elysia'

export const roleToResource = sqliteTable(
  'role_to_resource',
  {
    ...commonFields,
    [roleUniqueKey]: text('role_code')
      .notNull()
      .references(() => role[roleUniqueKey]),
    [resourceUniqueKey]: text('resource_code')
      .notNull()
      .references(() => resource[resourceUniqueKey])
  },
  t => {
    return {
      roleToResourceUnique: uniqueIndex('role_to_resource_unique').on(
        t[roleUniqueKey],
        t[resourceUniqueKey]
      )
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
      fields: [roleToResource[roleUniqueKey]],
      references: [role[roleUniqueKey]]
    }),
    resource: one(resource, {
      fields: [roleToResource[resourceUniqueKey]],
      references: [resource[resourceUniqueKey]]
    })
  }
})

export const schemaComments = {
  ...baseComments,
  [roleUniqueKey]: '角色编码',
  [resourceUniqueKey]: '资源编码'
}

const insertColumns = {
  ...baseColumns,
  [roleUniqueKey]: t.String({ description: schemaComments[roleUniqueKey] }),
  [resourceUniqueKey]: t.String({
    description: schemaComments[resourceUniqueKey]
  })
}

const selectColumns = insertColumns

export const insertSchema = createInsertSchema(
  roleToResource,
  insertColumns as Refine<typeof roleToResource, 'insert'>
)
export const selectSchema = createSelectSchema(
  roleToResource,
  selectColumns as Refine<typeof roleToResource, 'select'>
)

export type InsertParams = Static<typeof insertSchema>
export type SelectParams = Static<typeof selectSchema>
