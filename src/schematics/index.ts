import {
  DEFAULT_PAGE_INDEXX,
  DEFAULT_PAGE_SIZE
} from '@/global/constants/indext'
import { t } from 'elysia'

export const PageSchema = t.Partial(
  t.Object({
    pageIndex: t.Number({
      description: '第几页',
      default: DEFAULT_PAGE_INDEXX
    }),
    pageSize: t.Number({
      description: '每页多少条',
      default: DEFAULT_PAGE_SIZE
    })
  })
)

export const TimeRangeSchema = t.Partial(
  t.Object({
    createdFrom: t.Number({ description: '创建时间开始' }),
    createdTo: t.Number({ description: '创建时间结束' }),
    updatedFrom: t.Number({ description: '更新时间开始' }),
    updatedTo: t.Number({ description: '更新时间结束' })
  })
)

export const QueryAllSchema = t.Partial(
  t.Object({ isReturnAll: t.Boolean({ description: '是否返回全部数据' }) })
)
