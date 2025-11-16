import * as migration_20251107_183841_initial from './20251107_183841_initial';
import * as migration_20251114_164316 from './20251114_164316';
import * as migration_20251116_145416_add_sentiment_to_response_items from './20251116_145416_add_sentiment_to_response_items';
import * as migration_20251116_152916 from './20251116_152916';

export const migrations = [
  {
    up: migration_20251107_183841_initial.up,
    down: migration_20251107_183841_initial.down,
    name: '20251107_183841_initial',
  },
  {
    up: migration_20251114_164316.up,
    down: migration_20251114_164316.down,
    name: '20251114_164316',
  },
  {
    up: migration_20251116_145416_add_sentiment_to_response_items.up,
    down: migration_20251116_145416_add_sentiment_to_response_items.down,
    name: '20251116_145416_add_sentiment_to_response_items',
  },
  {
    up: migration_20251116_152916.up,
    down: migration_20251116_152916.down,
    name: '20251116_152916'
  },
];
