import { Elysia } from 'elysia'
import { modulePlugin } from './modules/index'
import { globalPlugin } from './setup'

export const app = new Elysia().use(globalPlugin).use(modulePlugin).listen(3000)
