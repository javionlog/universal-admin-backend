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
  findTree,
  get,
  getRoles,
  getUsers,
  remove,
  update
} from '@/modules/permission/services/resource'
import { PageSchema, QueryAllSchema, TimeRangeSchema } from '@/schematics/index'
import { t } from 'elysia'

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
        async ({ body }) => {
          const result = await remove(body)
          return result
        },
        {
          tags,
          detail: { summary: `${summaryPrefix}删除` },
          body: t.Pick(selectSchema, ['resourceCode']),
          response: {
            200: selectSchema
          }
        }
      )
      .post(
        '/get',
        async ({ body }) => {
          const result = await get(body)
          return result
        },
        {
          tags,
          detail: { summary: `${summaryPrefix}信息` },
          body: t.Pick(selectSchema, ['resourceCode']),
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
          detail: { summary: `${summaryPrefix}列表` },
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
      .post(
        '/findTree',
        async ({ body }) => {
          const result = await findTree(body)
          return result
        },
        {
          tags,
          detail: { summary: `${summaryPrefix}树` },
          body: t.Composite([
            t.Partial(t.Omit(selectSchema, ['createdAt', 'updatedAt'])),
            TimeRangeSchema
          ]),
          response: {
            200: t.Array(resourceNodeSchema)
          }
        }
      )
      .post(
        '/getUsers',
        async ({ body }) => {
          const result = await getUsers(body, { isReturnAll: body.isReturnAll })
          return result
        },
        {
          tags,
          detail: { summary: `获取${summaryPrefix}的用户列表` },
          body: t.Composite([
            t.Pick(selectSchema, ['resourceCode']),
            QueryAllSchema,
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
        '/getRoles',
        async ({ body }) => {
          const result = await getRoles(body, { isReturnAll: body.isReturnAll })
          return result
        },
        {
          tags,
          detail: { summary: `获取${summaryPrefix}的角色列表` },
          body: t.Composite([
            t.Pick(selectSchema, ['resourceCode']),
            QueryAllSchema,
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
  })
}
