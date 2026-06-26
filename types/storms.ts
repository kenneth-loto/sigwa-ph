export interface IBTraCSRecord {
  sid: string;
  name: string;
  season: number;
  lat: number;
  lon: number;
  wind: number;
  pres: number;
  time: string;
  track_type?: string;
  nature?: string;
}

export interface StormTrackPoint {
  lat: number;
  lon: number;
  windKnots: number;
  timestamp: Date;
  rawTime?: string;
}

export interface TyphoonStorm {
  sid: string;
  name: string;
  season: number;
  trackPoints: StormTrackPoint[];
  totalACE: number;
  peakWind: number;
  parIntervalCount: number;
}

export interface SeasonSummary {
  year: number;
  totalACE: number;
  stormCount: number;
  mostEnergeticStorm: TyphoonStorm | null;
}

export interface LiveAdvisory {
  stormName: string;
  currentWind: number;
  currentLat: number;
  currentLon: number;
  runningACE: number;
  isInsidePAR: boolean;
}

export interface HistoricalMetrics {
  allTimeTopStorm: TyphoonStorm;
  mostActiveSeason: SeasonSummary;
  avgACEPerStorm: number;
  totalStormsOnRecord: number;
}
