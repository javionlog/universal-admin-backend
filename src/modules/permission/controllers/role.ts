import { selectSchema as resourceSelectSchema } from '@/db/schemas/resource/index'
import { insertSchema, selectSchema } from '@/db/schemas/role/index'
import { selectSchema as userSelectSchema } from '@/db/schemas/user/index'
import type { GuardController } from '@/global/controllers/index'
import {
  create,
  find,
  findResources,
  get,
  getResources,
  getUsers,
  remove,
  update
} from '@/modules/permission/services/role'
import { PageSchema, QueryAllSchema, TimeRangeSchema } from '@/schematics/index'
import { t } from 'elysia'

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
        async ({ body }) => {
          const result = await remove(body)
          return result
        },
        {
          tags,
          detail: { summary: `${summaryPrefix}删除` },
          body: t.Pick(selectSchema, ['roleCode']),
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
          body: t.Pick(selectSchema, ['roleCode']),
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
            t.Partial(t.Omit(selectSchema, ['id', 'createdAt', 'updatedAt'])),
            QueryAllSchema,
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
        '/getUsers',
        async ({ body }) => {
          const result = await getUsers(body, { isReturnAll: body.isReturnAll })
          return result
        },
        {
          tags,
          detail: { summary: `获取${summaryPrefix}的用户列表` },
          body: t.Composite([
            t.Pick(selectSchema, ['roleCode']),
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
        '/getResources',
        async ({ body }) => {
          const result = await getResources(body, {
            isReturnAll: body.isReturnAll
          })
          return result
        },
        {
          tags,
          detail: { summary: `获取${summaryPrefix}的资源列表` },
          body: t.Composite([
            t.Pick(selectSchema, ['roleCode']),
            QueryAllSchema,
            PageSchema
          ]),
          response: {
            200: t.Object({
              records: t.Array(resourceSelectSchema),
              total: t.Number()
            })
          }
        }
      )
      .post(
        '/findResources',
        async ({ body }) => {
          const result = await findResources(body, {
            isReturnAll: body.isReturnAll
          })
          return result
        },
        {
          tags,
          detail: { summary: `查询${summaryPrefix}的资源列表` },
          body: t.Composite([
            t.Partial(t.Pick(selectSchema, ['roleCode', 'roleName'])),
            QueryAllSchema,
            PageSchema
          ]),
          response: {
            200: t.Object({
              records: t.Array(resourceSelectSchema),
              total: t.Number()
            })
          }
        }
      )
  })
}
