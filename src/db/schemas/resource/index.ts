import { baseColumns, baseComments, commonFields } from '@/db/shared/index'
import { BOOL_MAP, RESOURCE_TYPE } from '@/modules/shared/constants/indext'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox'
import { type Static, t } from 'elysia'

export const uniqueKey = 'resourceCode'

export const resource = sqliteTable('resource', {
  ...commonFields,
  parentId: integer('parent_id').notNull(),
  [uniqueKey]: text('resource_code').unique().notNull(),
  resourceName: text('resource_name').notNull(),
  resourceType: text('resource_type').notNull(),
  path: text('path'),
  activePath: text('active_path'),
  component: text('component'),
  icon: text('icon'),
  isLink: text('is_link').notNull(),
  isCache: text('is_cache').notNull(),
  isAffix: text('is_affix').notNull(),
  isHide: text('is_hide').notNull()
})

export const schemaComments = {
  ...baseComments,
  parentId: '父 ID',
  [uniqueKey]: '资源编码',
  resourceName: '资源名称',
  resourceType: '资源类型，菜单(Menu)/页面(Page)/元素(Element)',
  path: '页面路径',
  activePath: '激活路径',
  component: '组件路径',
  icon: '图标',
  isLink: '是否外链，是(Y)/否(N)',
  isCache: '是否缓存，是(Y)/否(N)',
  isAffix: '是否固定，是(Y)/否(N)',
  isHide: '是否隐藏，是(Y)/否(N)'
}

const insertColumns = {
  ...baseColumns,
  parentId: t.Number({ description: schemaComments.parentId, default: 0 }),
  [uniqueKey]: t.String({ description: schemaComments[uniqueKey] }),
  resourceName: t.String({ description: schemaComments.resourceName }),
  resourceType: t.Union(
    [
      t.Literal(RESOURCE_TYPE.menu),
      t.Literal(RESOURCE_TYPE.page),
      t.Literal(RESOURCE_TYPE.element)
    ],
    {
      description: schemaComments.resourceType,
      default: RESOURCE_TYPE.menu
    }
  ),
  path: t.Union([t.Null(), t.String({ description: schemaComments.path })]),
  activePath: t.Union([
    t.Null(),
    t.String({ description: schemaComments.activePath })
  ]),
  component: t.Union([
    t.Null(),
    t.String({ description: schemaComments.component })
  ]),
  icon: t.Union([t.Null(), t.String({ description: schemaComments.icon })]),
  isLink: t.Union([t.Literal(BOOL_MAP.yes), t.Literal(BOOL_MAP.no)], {
    description: schemaComments.isLink,
    default: BOOL_MAP.no
  }),
  isCache: t.Union([t.Literal(BOOL_MAP.yes), t.Literal(BOOL_MAP.no)], {
    description: schemaComments.isCache,
    default: BOOL_MAP.no
  }),
  isAffix: t.Union([t.Literal(BOOL_MAP.yes), t.Literal(BOOL_MAP.no)], {
    description: schemaComments.isAffix,
    default: BOOL_MAP.no
  }),
  isHide: t.Union([t.Literal(BOOL_MAP.yes), t.Literal(BOOL_MAP.no)], {
    description: schemaComments.isHide,
    default: BOOL_MAP.no
  })
}

const selectColumns = insertColumns

export const insertSchema = createInsertSchema(resource, insertColumns)

export const selectSchema = createSelectSchema(resource, selectColumns)

export const resourceNodeSchema = t.Recursive(
  self => {
    return t.Composite([
      selectSchema,
      t.Object({
        children: t.Array(self)
      })
    ])
  },
  { $id: 'resourceNodeSchema' }
)

export type InsertParams = Static<typeof insertSchema>
export type SelectParams = Static<typeof selectSchema>
export type ResourceNode = Static<typeof resourceNodeSchema>
