import { BOOL_MAP } from '@/modules/shared/constants/indext'
import { create as createUser } from '@/modules/user/services/index'
import { password } from 'bun'

const init = async () => {
  const adminUsername = 'admin'
  const adminPassword = '123456'
  const hashPassword = await password.hash(adminPassword, {
    algorithm: 'bcrypt',
    cost: 10
  })
  await createUser({
    username: adminUsername,
    password: hashPassword,
    createdBy: adminUsername,
    updatedBy: adminUsername,
    isAdmin: BOOL_MAP.yes
  })
}

init()
