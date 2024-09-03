import { role } from '@/db/schemas/role/index'
import { user } from '@/db/schemas/user/index'
import { relations } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import {
  type Refine,
  createInsertSchema,
  createSelectSchema
} from 'drizzle-typebox'
import { type Static, t } from 'elysia'

export const userToRole = sqliteTable(
  'user_to_role',
  {
    username: text('username')
      .notNull()
      .references(() => user.username),
    roleCode: text('role_code')
      .notNull()
      .references(() => role.roleCode),
    delFlag: text('del_flag').default('N'),
    createdAt: integer('created_at'),
    updatedAt: integer('updated_at'),
    createdBy: text('created_by'),
    updatedBy: text('updated_by')
  },
  t => {
    return {
      pk: primaryKey({ columns: [t.username, t.roleCode] })
    }
  }
)

export const userRoleRelation = relations(user, ({ many }) => {
  return {
    roles: many(userToRole)
  }
})

export const roleUserRelation = relations(role, ({ many }) => {
  return {
    users: many(userToRole)
  }
})

export const userToRoleRelation = relations(userToRole, ({ one }) => {
  return {
    user: one(user, {
      fields: [userToRole.username],
      references: [user.username]
    }),
    role: one(role, {
      fields: [userToRole.roleCode],
      references: [role.roleCode]
    })
  }
})
export const schemaComment = {
  username: '用户名',
  roleCode: '角色编码',
  delFlag: '删除标记，已删除(Y)/未删除(N)',
  createdAt: '创建时间',
  updatedAt: '更新时间',
  createdBy: '创建人',
  updatedBy: '更新人'
}

const insertColumns: Refine<typeof userToRole, 'insert'> = {
  username: t.String({ description: schemaComment.username }),
  roleCode: t.String({ description: schemaComment.roleCode }),
  delFlag: t.Union([t.Literal('Y'), t.Literal('N')], {
    description: schemaComment.delFlag,
    default: 'N'
  }),
  createdAt: t.Number({ description: schemaComment.createdAt }),
  updatedAt: t.Number({ description: schemaComment.updatedAt }),
  createdBy: t.String({ description: schemaComment.createdBy }),
  updatedBy: t.String({ description: schemaComment.updatedBy })
}

const selectColumns: Refine<typeof userToRole, 'select'> = insertColumns

export const insertSchema = createInsertSchema(userToRole, insertColumns)
export const selectSchema = createSelectSchema(userToRole, selectColumns)

export type InsertParams = Static<typeof insertSchema>
export type SelectParams = Static<typeof selectSchema>
