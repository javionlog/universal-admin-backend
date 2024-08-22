import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { Controller as UserController } from './modules/user/controllers/index'

const app = new Elysia()
  .use(swagger({ path: '/swagger' }))
  .use(UserController)
  .listen(3000)

export type App = typeof app
