import {
  resourceNodeSchema,
  selectSchema as resourceSelectSchema
} from '@/db/schemas/resource/index'
import { selectSchema as roleSelectSchema } from '@/db/schemas/role/index'
import { insertSchema, selectSchema } from '@/db/schemas/user/index'
import { GuardController } from '@/global/controllers/index'
import {
  create,
  find,
  findResourceTree,
  findResources,
  findRoles,
  get,
  getResources,
  getRoles,
  remove,
  update
} from '@/modules/user/services/index'
import { PageSchema, QueryAllSchema, TimeRangeSchema } from '@/schematics/index'
import { password } from 'bun'
import { t } from 'elysia'

const summaryPrefix = '用户'
const tags = ['User']

export const Controller = GuardController.group('/user', app => {
  return app
    .post(
      '/create',
      async ({ body }) => {
        const hashPassword = await password.hash(body.password, {
          algorithm: 'bcrypt',
          cost: 10
        })
        const result = await create({
          ...body,
          password: hashPassword,
          createdBy: body.username,
          updatedBy: body.username
        })
        return result
      },
      {
        tags,
        detail: { summary: `${summaryPrefix}创建` },
        body: insertSchema,
        response: {
          200: t.Omit(selectSchema, ['password'])
        }
      }
    )
    .post(
      '/update',
      async ({ body, user }) => {
        const result = await update({ ...body, updatedBy: user.username })
        return result
      },
      {
        tags,
        detail: { summary: `${summaryPrefix}更新` },
        body: selectSchema,
        response: {
          200: t.Omit(selectSchema, ['password'])
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
        body: t.Pick(selectSchema, ['username']),
        response: {
          200: t.Omit(selectSchema, ['password'])
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
        body: t.Pick(selectSchema, ['username']),
        response: {
          200: t.Omit(selectSchema, ['password'])
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
        detail: { summary: `${summaryPrefix}列表` },
        tags: ['User'],
        body: t.Composite([
          t.Partial(
            t.Omit(selectSchema, [
              'id',
              'password',
              'lastSignInAt',
              'createdAt',
              'updatedAt'
            ])
          ),
          QueryAllSchema,
          PageSchema,
          TimeRangeSchema
        ]),
        response: {
          200: t.Object({
            records: t.Array(t.Omit(selectSchema, ['password'])),
            total: t.Number()
          })
        }
      }
    )
    .post(
      '/getRoles',
      async ({ body }) => {
        const result = await getRoles(body)
        return result
      },
      {
        tags,
        detail: { summary: `获取${summaryPrefix}的角色列表` },
        body: t.Composite([t.Pick(selectSchema, ['username']), PageSchema]),
        response: {
          200: t.Object({
            records: t.Array(roleSelectSchema),
            total: t.Number()
          })
        }
      }
    )
    .post(
      '/getResources',
      async ({ body }) => {
        const result = await getResources(body)
        return result
      },
      {
        tags,
        detail: { summary: `获取${summaryPrefix}的资源列表` },
        body: t.Composite([t.Pick(selectSchema, ['username']), PageSchema]),
        response: {
          200: t.Object({
            records: t.Array(resourceSelectSchema),
            total: t.Number()
          })
        }
      }
    )
    .post(
      '/findRoles',
      async ({ body }) => {
        const result = await findRoles(body, { isReturnAll: body.isReturnAll })
        return result
      },
      {
        tags,
        detail: { summary: `查询${summaryPrefix}的角色列表` },
        body: t.Composite([
          t.Partial(t.Pick(selectSchema, ['username'])),
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
          t.Partial(t.Pick(selectSchema, ['username'])),
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
      '/findResourceTree',
      async ({ body }) => {
        const result = await findResourceTree(body)
        return result
      },
      {
        tags,
        detail: { summary: `${summaryPrefix}资源树` },
        body: t.Pick(selectSchema, ['username']),
        response: {
          200: t.Array(resourceNodeSchema)
        }
      }
    )
})
