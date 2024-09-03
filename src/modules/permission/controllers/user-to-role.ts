import { insertSchema, selectSchema } from '@/db/schemas/user-to-role/index'
import { getRoleByRoleCode } from '@/modules/permission/services/role'
import {
  createUserToRole,
  findUserToRoles
} from '@/modules/permission/services/user-to-role'
import type { GuardController } from '@/modules/shared/controllers/index'
import { getUserByUsername } from '@/modules/user/services/index'
import { PageSchema, TimeRangeSchema } from '@/schematics/index'
import { t } from 'elysia'

export const UserToRoleController = (app: typeof GuardController) => {
  return app.group('/userToRole', ins => {
    return ins
      .post(
        '/create',
        async ({ set, body, user }) => {
          const userResult = await getUserByUsername({
            username: body.username
          })
          if (!userResult) {
            set.status = 'Bad Request'
            throw new Error('Can not find user')
          }
          const roleResult = await getRoleByRoleCode({
            roleCode: body.roleCode
          })
          if (!roleResult) {
            set.status = 'Bad Request'
            throw new Error('Can not find role')
          }
          const result = await createUserToRole({
            ...body,
            createdBy: user.username
          })
          return result
        },
        {
          type: 'application/json',
          detail: { summary: '授权角色给用户' },
          tags: ['Permission'],
          body: insertSchema,
          response: {
            200: t.Pick(selectSchema, ['username', 'roleCode'])
          }
        }
      )
      .post(
        '/find',
        async ({ body }) => {
          const result = await findUserToRoles(body)
          return result
        },
        {
          type: 'application/json',
          detail: { summary: '用户角色关系列表' },
          tags: ['Permission'],
          body: t.Composite([
            t.Partial(t.Omit(selectSchema, ['createdAt', 'updatedAt'])),
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
      .post(
        '/findAll',
        async ({ body }) => {
          const result = await findUserToRoles(body, true)
          return result
        },
        {
          type: 'application/json',
          detail: { summary: '用户角色关系所有' },
          tags: ['Permission'],
          body: t.Composite([
            t.Partial(t.Omit(selectSchema, ['createdAt', 'updatedAt'])),
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
  })
}
