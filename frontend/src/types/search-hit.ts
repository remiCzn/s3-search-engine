export type BleveHit = {
  id: string;
  score?: number;
  fields?: Record<string, unknown>;
};

export type BleveResponse = {
  hits?: BleveHit[];
  total_hits?: number;
  took?: number;
};