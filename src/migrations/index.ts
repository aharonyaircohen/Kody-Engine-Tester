import * as migration_20260322_233123_initial from './20260322_233123_initial'
import * as migration_20260405_000000_add_users_permissions_lastLogin from './20260405_000000_add_users_permissions_lastLogin'
import * as migration_20260407_000000_add_auth_token_fields from './20260407_000000_add_auth_token_fields'

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
    up: migration_20260407_000000_add_auth_token_fields.up,
    down: migration_20260407_000000_add_auth_token_fields.down,
    name: '20260407_000000_add_auth_token_fields',
  },
]
