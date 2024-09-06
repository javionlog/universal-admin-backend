import { insertSchema, selectSchema } from '@/db/schemas/role-to-resource/index'
import { get as getResource } from '@/modules/permission/services/resource'
import { getRoleByRoleCode } from '@/modules/permission/services/role'
import {
  createRoleToResource,
  findRoleToResources
} from '@/modules/permission/services/role-to-resource'
import type { GuardController } from '@/modules/shared/controllers/index'
import { PageSchema, TimeRangeSchema } from '@/schematics/index'
import { t } from 'elysia'

export const RoleToResourceController = (app: typeof GuardController) => {
  return app.group('/roleToResource', ins => {
    return ins
      .post(
        '/create',
        async ({ set, body, user }) => {
          const roleResult = await getRoleByRoleCode({
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
          const result = await createRoleToResource({
            ...body,
            createdBy: user.username
          })
          return result
        },
        {
          detail: { summary: '授权资源给角色' },
          tags: ['Permission'],
          body: insertSchema,
          response: {
            200: t.Pick(selectSchema, ['roleCode', 'resourceCode'])
          }
        }
      )
      .post(
        '/find',
        async ({ body }) => {
          const result = await findRoleToResources(body)
          return result
        },
        {
          detail: { summary: '角色资源关系列表' },
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
          const result = await findRoleToResources(body, true)
          return result
        },
        {
          detail: { summary: '角色资源关系所有' },
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
