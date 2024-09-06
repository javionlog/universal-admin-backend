import { BOOL_MAP } from '@/modules/shared/constants/indext'
import { integer, text } from 'drizzle-orm/sqlite-core'
import { t } from 'elysia'

export const baseFields = {
  status: text('status').notNull().default(BOOL_MAP.no),
  remark: text('remark').notNull().default(''),
  sort: integer('sort').notNull().default(0),
  delFlag: text('del_flag').notNull().default(BOOL_MAP.no),
  createdAt: integer('created_at').notNull().default(Date.now()),
  updatedAt: integer('updated_at').notNull().default(Date.now()),
  createdBy: text('created_by').notNull().default(''),
  updatedBy: text('updated_by').notNull().default('')
}

export const commonFields = {
  ...baseFields,
  id: integer('id').primaryKey({ autoIncrement: true })
}

export const baseComments = {
  status: '状态，启用(Y)/禁用(N)',
  remark: '备注',
  sort: '排序',
  delFlag: '删除标记，已删除(Y)/未删除(N)',
  createdAt: '创建时间',
  updatedAt: '更新时间',
  createdBy: '创建人',
  updatedBy: '更新人'
}

export const baseColumns = {
  status: t.Union([t.Literal(BOOL_MAP.yes), t.Literal(BOOL_MAP.no)], {
    description: baseComments.status,
    default: BOOL_MAP.no
  }),
  remark: t.Optional(
    t.String({
      description: baseComments.remark,
      default: ''
    })
  ),
  sort: t.Number({ description: baseComments.sort, default: 0 }),
  delFlag: t.Union([t.Literal(BOOL_MAP.yes), t.Literal(BOOL_MAP.no)], {
    description: baseComments.delFlag,
    default: BOOL_MAP.no
  }),
  createdAt: t.Number({
    description: baseComments.createdAt,
    default: Date.now()
  }),
  updatedAt: t.Number({
    description: baseComments.updatedAt,
    default: Date.now()
  }),
  createdBy: t.String({ description: baseComments.createdBy, default: '' }),
  updatedBy: t.String({ description: baseComments.updatedBy, default: '' })
}
