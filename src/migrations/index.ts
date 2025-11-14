import * as migration_20251107_183841_initial from './20251107_183841_initial';
import * as migration_20251114_164316 from './20251114_164316';

export const migrations = [
  {
    up: migration_20251107_183841_initial.up,
    down: migration_20251107_183841_initial.down,
    name: '20251107_183841_initial',
  },
  {
    up: migration_20251114_164316.up,
    down: migration_20251114_164316.down,
    name: '20251114_164316'
  },
];
