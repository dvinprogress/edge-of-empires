export { scanProject } from './scanner.js';
export { generateWorldConfig } from './generator.js';
export type { ScanResult, DetectionResult } from './types.js';

// CLI mode when run directly
if (process.argv[1]?.includes('scanner')) {
  const projectPath = process.argv[2];
  if (!projectPath) {
    console.error('Usage: npx tsx packages/scanner/src/index.ts <project-path>');
    process.exit(1);
  }
  const { scanProject } = await import('./scanner.js');
  const { generateWorldConfig } = await import('./generator.js');
  const scan = await scanProject(projectPath);
  const config = generateWorldConfig(scan);
  console.log(JSON.stringify(config, null, 2));
}
