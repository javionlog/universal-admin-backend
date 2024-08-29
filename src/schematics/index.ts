import {
  defaultPageIndex,
  defaultPageSize
} from '@/modules/shared/constants/indext'
import { t } from 'elysia'

export const PageSchema = t.Partial(
  t.Object({
    pageIndex: t.Number({ description: '第几页', default: defaultPageIndex }),
    pageSize: t.Number({ description: '每页多少条', default: defaultPageSize })
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
