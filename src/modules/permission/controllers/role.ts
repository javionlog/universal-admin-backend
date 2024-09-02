import { insertSchema, selectSchema } from '@/db/schemas/role/index'
import {
  createRole,
  deleteRole,
  findRoles,
  getRoleByRoleCode,
  updateRole
} from '@/modules/permission/services/role'
import type { GuardController } from '@/modules/shared/controllers/index'
import { PageSchema, TimeRangeSchema } from '@/schematics/index'
import { t } from 'elysia'

export const RoleController = (app: typeof GuardController) => {
  return app
    .post(
      '/createRole',
      async ({ body, user }) => {
        const role = await createRole({ ...body, createdBy: user.username })
        return role
      },
      {
        type: 'application/json',
        detail: { summary: '角色创建' },
        tags: ['Permission'],
        body: insertSchema,
        response: {
          200: t.Pick(selectSchema, ['roleCode'])
        }
      }
    )
    .post(
      '/updateRole',
      async ({ set, body, user }) => {
        const row = await getRoleByRoleCode(body)
        if (!row) {
          set.status = 'Bad Request'
          throw new Error('Can not find role')
        }
        const result = await updateRole({ ...body, updatedBy: user.username })
        return result
      },
      {
        type: 'application/json',
        detail: { summary: '角色更新' },
        tags: ['Permission'],
        body: insertSchema,
        response: {
          200: t.Pick(selectSchema, ['roleCode'])
        }
      }
    )
    .post(
      '/deleteRole',
      async ({ set, body }) => {
        const row = await getRoleByRoleCode(body)
        if (!row) {
          set.status = 'Bad Request'
          throw new Error('Can not find role')
        }
        const result = await deleteRole({ roleCode: body.roleCode })
        return result
      },
      {
        type: 'application/json',
        detail: { summary: '角色删除' },
        tags: ['Permission'],
        body: t.Pick(insertSchema, ['roleCode']),
        response: {
          200: t.Pick(selectSchema, ['roleCode'])
        }
      }
    )
    .post(
      '/getRole',
      async ({ set, body }) => {
        const role = await getRoleByRoleCode(body)
        if (!role) {
          set.status = 'Bad Request'
          throw new Error('Can not find role')
        }
        return role
      },
      {
        type: 'application/json',
        detail: { summary: '角色信息' },
        tags: ['Permission'],
        body: t.Pick(selectSchema, ['roleCode']),
        response: {
          200: selectSchema
        }
      }
    )
    .post(
      '/findRoles',
      async ({ body }) => {
        const result = await findRoles(body)
        return result
      },
      {
        type: 'application/json',
        detail: { summary: '角色列表' },
        tags: ['Permission'],
        body: t.Composite([
          t.Partial(t.Omit(selectSchema, ['id', 'createdAt', 'updatedAt'])),
          PageSchema,
          TimeRangeSchema
        ]),
        response: {
          200: t.Object({
            records: t.Array(selectSchema),
            total: t.Number()
          })
        }
      }
    )
}
