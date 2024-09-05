import { insertSchema, selectSchema } from '@/db/schemas/resource/index'
import {
  createResource,
  deleteResource,
  findResources,
  getResourceByResoureCode,
  updateResource
} from '@/modules/permission/services/resource'
import type { GuardController } from '@/modules/shared/controllers/index'
import { PageSchema, TimeRangeSchema } from '@/schematics/index'
import { t } from 'elysia'

export const ResourceController = (app: typeof GuardController) => {
  return app.group('/resource', ins => {
    return ins
      .post(
        '/create',
        async ({ body, user }) => {
          const result = await createResource({
            ...body,
            createdBy: user.username
          })
          return result
        },
        {
          detail: { summary: '资源创建' },
          tags: ['Permission'],
          body: insertSchema,
          response: {
            200: t.Pick(selectSchema, ['resourceCode'])
          }
        }
      )
      .post(
        '/update',
        async ({ set, body, user }) => {
          const row = await getResourceByResoureCode(body)
          if (!row) {
            set.status = 'Bad Request'
            throw new Error('Can not find role')
          }
          const result = await updateResource({
            ...body,
            updatedBy: user.username
          })
          return result
        },
        {
          detail: { summary: '资源更新' },
          tags: ['Permission'],
          body: insertSchema,
          response: {
            200: t.Pick(selectSchema, ['resourceCode'])
          }
        }
      )
      .post(
        '/delete',
        async ({ set, body }) => {
          const row = await getResourceByResoureCode(body)
          if (!row) {
            set.status = 'Bad Request'
            throw new Error('Can not find resource')
          }
          const result = await deleteResource({
            resourceCode: body.resourceCode
          })
          return result
        },
        {
          detail: { summary: '资源删除' },
          tags: ['Permission'],
          body: t.Pick(insertSchema, ['resourceCode']),
          response: {
            200: t.Pick(selectSchema, ['resourceCode'])
          }
        }
      )
      .post(
        '/get',
        async ({ set, body }) => {
          const role = await getResourceByResoureCode(body)
          if (!role) {
            set.status = 'Bad Request'
            throw new Error('Can not find resource')
          }
          return role
        },
        {
          detail: { summary: '资源信息' },
          tags: ['Permission'],
          body: t.Pick(selectSchema, ['resourceCode']),
          response: {
            200: selectSchema
          }
        }
      )
      .post(
        '/find',
        async ({ body }) => {
          const result = await findResources(body)
          return result
        },
        {
          detail: { summary: '资源列表' },
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
  })
}
