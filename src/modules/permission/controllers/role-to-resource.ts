import { insertSchema, selectSchema } from '@/db/schemas/role-to-resource/index'
import type { GuardController } from '@/global/controllers/index'
import {
  create,
  find,
  remove
} from '@/modules/permission/services/role-to-resource'
import { PageSchema, QueryAllSchema, TimeRangeSchema } from '@/schematics/index'
import { t } from 'elysia'

const tags = ['Permission']

export const RoleToResourceController = (app: typeof GuardController) => {
  return app.group('/roleToResource', ins => {
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
          detail: { summary: '授权资源给角色' },
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
          detail: { summary: '删除角色资源' },
          body: t.Pick(selectSchema, ['roleCode', 'resourceCode']),
          response: {
            200: selectSchema
          }
        }
      )
      .post(
        '/find',
        async ({ body }) => {
          const result = await find(body, { isReturnAll: body.isReturnAll })
          return result
        },
        {
          tags,
          detail: { summary: '角色资源关系列表' },
          body: t.Composite([
            t.Partial(t.Omit(selectSchema, ['createdAt', 'updatedAt'])),
            QueryAllSchema,
            TimeRangeSchema,
            PageSchema
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
