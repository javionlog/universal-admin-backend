import { insertSchema, selectSchema } from '@/db/schemas/role-to-resource/index'
import type { GuardController } from '@/global/controllers/index'
import { get as getResource } from '@/modules/permission/services/resource'
import { get as getRole } from '@/modules/permission/services/role'
import {
  create,
  find,
  remove
} from '@/modules/permission/services/role-to-resource'
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
            roleCode: body.roleCode
          })
          if (!roleResult) {
            set.status = 'Bad Request'
            throw new Error('Can not find role')
          }
          const resourceResult = await getResource({
            resourceCode: body.resourceCode
          })
          if (!resourceResult) {
            set.status = 'Bad Request'
            throw new Error('Can not find resource')
          }
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
        async ({ set, body }) => {
          const result = await remove(body)
          if (!result) {
            set.status = 'Bad Request'
            throw new Error('Can not find role to resource')
          }
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
