/**
 * Data integrity checks, run in CI before every build:
 *  - flat-slug collisions against reserved section routes
 *  - stale facts (lastVerified > 90 days) with --report-stale
 *  - dangling references between collections
 *
 * Filled in as collections land; currently a no-op so the pipeline is green
 * from day one.
 */
const reportStale = process.argv.includes('--report-stale');

console.log(`check-data: no collections defined yet (${reportStale ? 'stale report' : 'validation'} mode)`);
process.exit(0);
