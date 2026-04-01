import * as migration_20260322_233123_initial from './20260322_233123_initial'
import * as migration_20260401_000000_oauth_providers from './20260401_000000_oauth_providers'

export const migrations = [
  {
    up: migration_20260322_233123_initial.up,
    down: migration_20260322_233123_initial.down,
    name: '20260322_233123_initial',
  },
  {
    up: migration_20260401_000000_oauth_providers.up,
    down: migration_20260401_000000_oauth_providers.down,
    name: '20260401_000000_oauth_providers',
  },
]
