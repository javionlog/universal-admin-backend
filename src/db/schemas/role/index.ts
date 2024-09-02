import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import {
  type Refine,
  createInsertSchema,
  createSelectSchema
} from 'drizzle-typebox'
import { type Static, t } from 'elysia'

export const role = sqliteTable('role', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  roleCode: text('role_code').unique().notNull(),
  roleName: text('role_name').notNull(),
  status: text('status').default('N'),
  remark: text('remark'),
  sort: integer('sort').default(0),
  delFlag: text('del_flag').default('N'),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by')
})

export const schemaComment = {
  roleCode: '角色编码',
  roleName: '角色名',
  status: '状态，启用(Y)/禁用(N)',
  remark: '备注',
  sort: '排序',
  delFlag: '删除标记，已删除(Y)/未删除(N)',
  createdAt: '创建时间',
  updatedAt: '更新时间',
  createdBy: '创建人',
  updatedBy: '更新人'
}

const insertColumns: Refine<typeof role, 'insert'> = {
  roleCode: t.String({ description: schemaComment.roleCode, minLength: 2 }),
  roleName: t.String({ description: schemaComment.roleName }),
  status: t.Union([t.Literal('Y'), t.Literal('N')], {
    description: schemaComment.status,
    default: 'N'
  }),
  remark: t.Optional(
    t.String({
      description: schemaComment.remark
    })
  ),
  sort: t.Number({ description: schemaComment.sort, default: 0 }),
  delFlag: t.Union([t.Literal('Y'), t.Literal('N')], {
    description: schemaComment.delFlag,
    default: 'N'
  }),
  createdAt: t.Number({ description: schemaComment.createdAt }),
  updatedAt: t.Number({ description: schemaComment.updatedAt }),
  createdBy: t.String({ description: schemaComment.createdBy }),
  updatedBy: t.String({ description: schemaComment.updatedBy })
}

const selectColumns: Refine<typeof role, 'select'> = {
  ...insertColumns,
  roleCode: t.String({ description: schemaComment.roleCode })
}

export const insertSchema = createInsertSchema(role, insertColumns)
export const selectSchema = createSelectSchema(role, selectColumns)

export type InsertParams = Static<typeof insertSchema>
export type SelectParams = Static<typeof selectSchema>
