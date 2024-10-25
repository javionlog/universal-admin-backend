import { insertSchema, selectSchema } from '@/db/schemas/user-to-role/index'
import type { GuardController } from '@/global/controllers/index'
import {
  create,
  find,
  remove
} from '@/modules/permission/services/user-to-role'
import { PageSchema, TimeRangeSchema } from '@/schematics/index'
import { t } from 'elysia'

const tags = ['Permission']

export const UserToRoleController = (app: typeof GuardController) => {
  return app.group('/userToRole', ins => {
    return ins
      .post(
        '/create',
        async ({ body, user }) => {
          const result = await create({
            ...body,
            createdBy: user.username,
            updatedBy: user.username
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
        '/remove',
        async ({ body }) => {
          const result = await remove(body)
          return result
        },
        {
          tags,
          detail: { summary: '删除用户角色' },
          body: t.Pick(selectSchema, ['username', 'roleCode']),
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
          const result = await find(body, { isReturnAll: true })
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
