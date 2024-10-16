import { uniqueKey as resourceUniqueKey } from '@/db/schemas/resource/index'
import { insertSchema, selectSchema } from '@/db/schemas/role-to-resource/index'
import { uniqueKey as roleUniqueKey } from '@/db/schemas/role/index'
import { uniqueKey as userUniqueKey } from '@/db/schemas/user/index'
import { primaryKey } from '@/db/shared/index'
import { gain as getResource } from '@/modules/permission/services/resource'
import { gain as getRole } from '@/modules/permission/services/role'
import {
  create,
  find,
  remove
} from '@/modules/permission/services/role-to-resource'
import type { GuardController } from '@/modules/shared/controllers/index'
import { PageSchema, TimeRangeSchema } from '@/schematics/index'
import { t } from 'elysia'

const tags = ['Permission']

export const RoleToResourceController = (app: typeof GuardController) => {
  return app.group('/roleToResource', ins => {
    return ins
      .post(
        '/create',
        async ({ set, body, user }) => {
          const roleResult = await getRole({
            [roleUniqueKey]: body[roleUniqueKey]
          })
          if (!roleResult) {
            set.status = 'Bad Request'
            throw new Error('Can not find role')
          }
          const resourceResult = await getResource({
            [resourceUniqueKey]: body[resourceUniqueKey]
          })
          if (!resourceResult) {
            set.status = 'Bad Request'
            throw new Error('Can not find resource')
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
          detail: { summary: '授权资源给角色' },
          body: insertSchema,
          response: {
            200: selectSchema
          }
        }
      )
      .post(
        '/remove',
        async ({ set, body }) => {
          const result = await remove({
            [primaryKey]: body[primaryKey]
          })
          if (!result) {
            set.status = 'Bad Request'
            throw new Error('Can not find role to resource')
          }
          return result
        },
        {
          tags,
          detail: { summary: '删除角色资源' },
          body: t.Pick(selectSchema, [primaryKey]),
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
          tags,
          detail: { summary: '角色资源关系列表' },
          body: t.Composite([
            t.Partial(t.Omit(selectSchema, ['createdAt', 'updatedAt'])),
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
      .post(
        '/findAll',
        async ({ body }) => {
          const result = await find(body, true)
          return result
        },
        {
          tags,
          detail: { summary: '角色资源关系全部' },
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
