import {
  insertSchema,
  selectSchema,
  uniqueKey
} from '@/db/schemas/resource/index'
import {
  create,
  find,
  get,
  remove,
  update
} from '@/modules/permission/services/resource'
import type { GuardController } from '@/modules/shared/controllers/index'
import { PageSchema, TimeRangeSchema } from '@/schematics/index'
import { t } from 'elysia'

const notFoundMessage = 'Can not find resource'
const summaryPrefix = '资源'
const tags = ['Permission']

export const ResourceController = (app: typeof GuardController) => {
  return app.group('/resource', ins => {
    return ins
      .post(
        '/create',
        async ({ body, user }) => {
          const result = await create({
            ...body,
            createdBy: user.username
          })
          return result
        },
        {
          tags,
          detail: { summary: `${summaryPrefix}创建` },
          body: insertSchema,
          response: {
            200: selectSchema
          }
        }
      )
      .post(
        '/update',
        async ({ set, body, user }) => {
          const row = await get(body)
          if (!row) {
            set.status = 'Bad Request'
            throw new Error(notFoundMessage)
          }
          const result = await update({
            ...body,
            updatedBy: user.username
          })
          return result
        },
        {
          tags,
          detail: { summary: `${summaryPrefix}更新` },
          body: selectSchema,
          response: {
            200: selectSchema
          }
        }
      )
      .post(
        '/remove',
        async ({ set, body }) => {
          const row = await get(body)
          if (!row) {
            set.status = 'Bad Request'
            throw new Error(notFoundMessage)
          }
          const result = await remove({
            resourceCode: body.resourceCode
          })
          if (!result) {
            set.status = 'Bad Request'
            throw new Error('Can not find resource')
          }
          return result
        },
        {
          tags,
          detail: { summary: `${summaryPrefix}删除` },
          body: t.Pick(selectSchema, [uniqueKey]),
          response: {
            200: selectSchema
          }
        }
      )
      .post(
        '/get',
        async ({ set, body }) => {
          const role = await get(body)
          if (!role) {
            set.status = 'Bad Request'
            throw new Error(notFoundMessage)
          }
          return role
        },
        {
          tags,
          detail: { summary: `${summaryPrefix}信息` },
          body: t.Pick(selectSchema, [uniqueKey]),
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
          detail: { summary: `${summaryPrefix}列表` },
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
  })
}
