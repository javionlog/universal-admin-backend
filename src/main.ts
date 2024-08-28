import { Elysia } from 'elysia'
import { modulePlugin } from './modules/index'
import { globalPlugin } from './setup'

const app = new Elysia().use(globalPlugin).use(modulePlugin).listen(3000)

export type App = typeof app
