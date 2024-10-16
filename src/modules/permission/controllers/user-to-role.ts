import { uniqueKey as roleUniqueKey } from '@/db/schemas/role/index'
import { insertSchema, selectSchema } from '@/db/schemas/user-to-role/index'
import { uniqueKey as userUniqueKey } from '@/db/schemas/user/index'
import { gain as getRole } from '@/modules/permission/services/role'
import { create, find } from '@/modules/permission/services/user-to-role'
import type { GuardController } from '@/modules/shared/controllers/index'
import { gain as getUser } from '@/modules/user/services/index'
import { PageSchema, TimeRangeSchema } from '@/schematics/index'
import { t } from 'elysia'

const tags = ['Permission']

export const UserToRoleController = (app: typeof GuardController) => {
  return app.group('/userToRole', ins => {
    return ins
      .post(
        '/create',
        async ({ set, body, user }) => {
          const userResult = await getUser({
            [userUniqueKey]: body[userUniqueKey]
          })
          if (!userResult) {
            set.status = 'Bad Request'
            throw new Error('Can not find user')
          }
          const roleResult = await getRole({
            [roleUniqueKey]: body[roleUniqueKey]
          })
          if (!roleResult) {
            set.status = 'Bad Request'
            throw new Error('Can not find role')
          }
          const result = await create({
            ...body,
            createdBy: user[userUniqueKey],
            updatedBy: user[userUniqueKey]
          })
          return result
        },
        {
          tags,
          detail: { summary: '授权角色给用户' },
          body: insertSchema,
          response: {
            200: selectSchema
          }
        }
      )
      .post(
        '/find',
        async ({ body }) => {
          const result = await find(body)
          return result
        },
        {
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
          const result = await find(body, true)
          return result
        },
        {
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
