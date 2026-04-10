import * as migration_20260322_233123_initial from './20260322_233123_initial'
import * as migration_20260405_000000_add_users_permissions_lastLogin from './20260405_000000_add_users_permissions_lastLogin'
import * as migration_20260410_000000_add_password_history_and_role from './20260410_000000_add_password_history_and_role'

export const migrations = [
  {
    up: migration_20260322_233123_initial.up,
    down: migration_20260322_233123_initial.down,
    name: '20260322_233123_initial',
  },
  {
    up: migration_20260405_000000_add_users_permissions_lastLogin.up,
    down: migration_20260405_000000_add_users_permissions_lastLogin.down,
    name: '20260405_000000_add_users_permissions_lastLogin',
  },
  {
    up: migration_20260410_000000_add_password_history_and_role.up,
    down: migration_20260410_000000_add_password_history_and_role.down,
    name: '20260410_000000_add_password_history_and_role',
  },
]
