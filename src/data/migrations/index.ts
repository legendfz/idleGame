/**
 * 存档迁移脚本注册
 */
export interface Migration {
  version: number;
  migrate: (state: Record<string, unknown>) => Record<string, unknown>;
}

export const migrations: Migration[] = [
  // Future migrations go here
  // { version: 2, migrate: (state) => { ... return state; } }
];

export function applyMigrations(state: Record<string, unknown>, fromVersion: number): Record<string, unknown> {
  let current = state;
  for (const m of migrations) {
    if (m.version > fromVersion) {
      current = m.migrate(current);
    }
  }
  return current;
}
