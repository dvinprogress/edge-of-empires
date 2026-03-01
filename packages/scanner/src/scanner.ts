import { basename } from 'path';
import { collectPackageDeps, collectEnvKeys, collectConfigFiles } from './collectors.js';
import { matchPackageDeps, matchEnvKeys, matchConfigFiles } from './matchers.js';
import type { DetectionResult, ScanResult } from './types.js';

const CONFIDENCE_RANK: Record<DetectionResult['confidence'], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function mergeDetections(all: DetectionResult[]): DetectionResult[] {
  const byPlugin = new Map<string, DetectionResult>();

  for (const detection of all) {
    const existing = byPlugin.get(detection.pluginId);
    if (existing === undefined) {
      byPlugin.set(detection.pluginId, { ...detection, sources: [...detection.sources] });
    } else {
      // Keep highest confidence
      if (CONFIDENCE_RANK[detection.confidence] > CONFIDENCE_RANK[existing.confidence]) {
        existing.confidence = detection.confidence;
      }
      // Merge sources, deduplicate
      for (const source of detection.sources) {
        if (!existing.sources.includes(source)) {
          existing.sources.push(source);
        }
      }
    }
  }

  return Array.from(byPlugin.values());
}

function mergeUnknowns(
  all: Array<{ id: string; sources: string[] }>
): Array<{ id: string; sources: string[] }> {
  const byId = new Map<string, string[]>();

  for (const item of all) {
    const existing = byId.get(item.id);
    if (existing === undefined) {
      byId.set(item.id, [...item.sources]);
    } else {
      for (const source of item.sources) {
        if (!existing.includes(source)) {
          existing.push(source);
        }
      }
    }
  }

  return Array.from(byId.entries()).map(([id, sources]) => ({ id, sources }));
}

export async function scanProject(projectPath: string): Promise<ScanResult> {
  const projectName = basename(projectPath);

  // 1. Collect raw data from all three collectors
  const deps = collectPackageDeps(projectPath);
  const envKeys = collectEnvKeys(projectPath);
  const configFiles = collectConfigFiles(projectPath);

  // 2. Apply all three matchers
  const fromPackages = matchPackageDeps(deps);
  const fromEnv = matchEnvKeys(envKeys);
  const fromConfigs = matchConfigFiles(configFiles);

  // 3. Merge results: deduplicate by pluginId, keep highest confidence, combine all sources
  const allKnown = [...fromPackages.known, ...fromEnv.known, ...fromConfigs];
  const detections = mergeDetections(allKnown);

  // 4. Separate known plugins from unknown services
  const allUnknown = [...fromPackages.unknown, ...fromEnv.unknown];
  const unknownServices = mergeUnknowns(allUnknown);

  // 5. Return ScanResult
  return {
    projectName,
    projectPath,
    detections,
    unknownServices,
  };
}
