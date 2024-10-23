import { insertSchema, selectSchema } from '@/db/schemas/role/index'
import type { GuardController } from '@/global/controllers/index'
import {
  create,
  find,
  get,
  remove,
  update
} from '@/modules/permission/services/role'
import { PageSchema, TimeRangeSchema } from '@/schematics/index'
import { t } from 'elysia'

const notFoundMessage = 'Can not find role'
const summaryPrefix = '角色'
const tags = ['Permission']

export const RoleController = (app: typeof GuardController) => {
  return app.group('/role', ins => {
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
          detail: { summary: `${summaryPrefix}创建` },
          body: insertSchema,
          response: {
            200: selectSchema
          }
        }
      )
      .post(
        '/update',
        async ({ body, user }) => {
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
          const result = await remove({ id: body.id })
          if (!result) {
            set.status = 'Bad Request'
            throw new Error(notFoundMessage)
          }
          return result
        },
        {
          tags,
          detail: { summary: `${summaryPrefix}删除` },
          body: t.Pick(selectSchema, ['id']),
          response: {
            200: selectSchema
          }
        }
      )
      .post(
        '/get',
        async ({ set, body }) => {
          const result = await get(body)
          if (!result) {
            set.status = 'Bad Request'
            throw new Error(notFoundMessage)
          }
          return result
        },
        {
          tags,
          detail: { summary: `${summaryPrefix}信息` },
          body: t.Pick(selectSchema, ['id']),
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
  })
}
