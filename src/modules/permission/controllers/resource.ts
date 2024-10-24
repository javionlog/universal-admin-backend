import {
  insertSchema,
  resourceNodeSchema,
  selectSchema
} from '@/db/schemas/resource/index'
import { selectSchema as roleSelectSchema } from '@/db/schemas/role/index'
import { selectSchema as userSelectSchema } from '@/db/schemas/user/index'
import type { GuardController } from '@/global/controllers/index'
import {
  create,
  find,
  findRoles,
  findTree,
  findUsers,
  get,
  remove,
  update
} from '@/modules/permission/services/resource'
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
          const result = await remove({
            id: body.id
          })
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
          tags,
          detail: { summary: `${summaryPrefix}列表` },
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
          detail: { summary: `${summaryPrefix}全部` },
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
      .post(
        '/findTree',
        async () => {
          const result = await findTree()
          return result
        },
        {
          tags,
          detail: { summary: `${summaryPrefix}树` },
          response: {
            200: t.Array(resourceNodeSchema)
          }
        }
      )
      .post(
        '/findUsers',
        async ({ body }) => {
          const result = await findUsers(body)
          return result
        },
        {
          tags,
          detail: { summary: `${summaryPrefix}拥有的用户列表` },
          body: t.Composite([
            t.Pick(selectSchema, ['resourceCode']),
            PageSchema
          ]),
          response: {
            200: t.Object({
              records: t.Array(t.Omit(userSelectSchema, ['password'])),
              total: t.Number()
            })
          }
        }
      )
      .post(
        '/findAllUsers',
        async ({ body }) => {
          const result = await findUsers(body, true)
          return result
        },
        {
          tags,
          detail: { summary: `${summaryPrefix}拥有的用户全部` },
          body: t.Composite([t.Pick(selectSchema, ['resourceCode'])]),
          response: {
            200: t.Object({
              records: t.Array(t.Omit(userSelectSchema, ['password'])),
              total: t.Number()
            })
          }
        }
      )
      .post(
        '/findRoles',
        async ({ body }) => {
          const result = await findRoles(body)
          return result
        },
        {
          tags,
          detail: { summary: `${summaryPrefix}拥有的角色列表` },
          body: t.Composite([
            t.Pick(selectSchema, ['resourceCode']),
            PageSchema
          ]),
          response: {
            200: t.Object({
              records: t.Array(roleSelectSchema),
              total: t.Number()
            })
          }
        }
      )
      .post(
        '/findAllRoles',
        async ({ body }) => {
          const result = await findRoles(body, true)
          return result
        },
        {
          tags,
          detail: { summary: `${summaryPrefix}拥有的角色全部` },
          body: t.Composite([t.Pick(selectSchema, ['resourceCode'])]),
          response: {
            200: t.Object({
              records: t.Array(roleSelectSchema),
              total: t.Number()
            })
          }
        }
      )
  })
}
