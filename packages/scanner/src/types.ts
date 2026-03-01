export interface DetectionResult {
  pluginId: string;
  confidence: 'high' | 'medium' | 'low';
  sources: string[];
}

export interface ScanResult {
  projectName: string;
  projectPath: string;
  detections: DetectionResult[];
  unknownServices: Array<{ id: string; sources: string[] }>;
}
