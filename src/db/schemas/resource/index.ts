import { baseColumns, baseComments, commonFields } from '@/db/shared/index'
import { BOOL_MAP, RESOURCE_TYPE } from '@/modules/shared/constants/indext'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import {
  type Refine,
  createInsertSchema,
  createSelectSchema
} from 'drizzle-typebox'
import { type Static, t } from 'elysia'

export const uniqueKey = 'resourceCode'
export const primaryKey = 'id'

export const resource = sqliteTable('resource', {
  ...commonFields,
  parentId: integer('parent_id').notNull().default(0),
  resourceCode: text('resource_code').unique().notNull().default(''),
  resourceName: text('resource_name').notNull().default(''),
  resourceType: text('resource_type').notNull().default(RESOURCE_TYPE.menu),
  path: text('path').notNull().default(''),
  activePath: text('active_path').notNull().default(''),
  component: text('component').notNull().default(''),
  icon: text('icon').notNull().default(''),
  isLink: text('is_link').notNull().default(BOOL_MAP.no),
  isCache: text('is_cache').notNull().default(BOOL_MAP.no),
  isAffix: text('is_affix').notNull().default(BOOL_MAP.no),
  isHide: text('is_hide').notNull().default(BOOL_MAP.no)
})

export const schemaComments = {
  ...baseComments,
  parentId: '父 ID',
  resourceCode: '资源编码',
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

const insertColumns: Refine<typeof resource, 'insert'> = {
  ...baseColumns,
  parentId: t.Number({ description: schemaComments.parentId, default: 0 }),
  resourceCode: t.String({ description: schemaComments.resourceCode }),
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
  path: t.String({ description: schemaComments.path, default: '' }),
  activePath: t.String({ description: schemaComments.activePath, default: '' }),
  component: t.String({ description: schemaComments.component, default: '' }),
  icon: t.String({ description: schemaComments.icon, default: '' }),
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

const selectColumns: Refine<typeof resource, 'select'> = insertColumns

export const insertSchema = createInsertSchema(resource, insertColumns)
export const selectSchema = createSelectSchema(resource, selectColumns)

export type InsertParams = Static<typeof insertSchema>
export type SelectParams = Static<typeof selectSchema>
