/**
 * Save Migrations — version upgrade functions
 */

export type MigrationFn = (data: any) => any;

const migrations: Record<number, MigrationFn> = {
  // Example: migrate from v0 to v1
  // 0: (data) => ({ ...data, newField: 'default' }),
};

export function runMigrations(data: any, fromVersion: number, toVersion: number): any {
  let current = data;
  for (let v = fromVersion; v < toVersion; v++) {
    const fn = migrations[v];
    if (fn) {
      console.log(`Running migration v${v} → v${v + 1}`);
      current = fn(current);
    }
  }
  return current;
}
