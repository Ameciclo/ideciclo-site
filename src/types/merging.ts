
export interface MergedSegmentInfo {
  id: string;
  name: string;
  type: string;
  length: number;
  originalGeometry?: any;
}

export interface UnmergeAction {
  segmentId: string;
  mergedSegmentId: string;
}
