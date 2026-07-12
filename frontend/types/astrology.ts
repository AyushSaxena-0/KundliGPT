import { BirthDetails } from ".";

export interface AstrologyPlanet {
  name: string;
  longitude: number;
  latitude?: number;
  longitude_in_sign?: number;
  degree: number;
  zodiac_sign: string;
  sign: string;
  house: number;
  nakshatra: string;
  pada: number;
  motion: string;
  retrograde: boolean;
  combust: boolean;
  exalted: boolean;
  debilitated: boolean;
  strength: number;
}

export interface AstrologyHouse {
  house_number: number;
  house: number;
  zodiac_sign: string;
  sign: string;
  cusp_longitude: number;
  sign_number: number;
  lord: string;
  occupants: string[];
  strength: number;
  meaning: string;
  interpretation: string;
}

export interface ChartPlacement {
  house: number;
  sign: string;
  planets: string[];
  highlighted?: boolean;
}

export interface DashaPeriod {
  mahadasha: string;
  antardasha: string;
  pratyantar?: string;
  start_date: string;
  end_date: string;
  current: boolean;
  remaining?: string;
}

export interface TransitItem {
  planet: string;
  sign: string;
  house: number;
  exact_date: string;
  importance: "High" | "Medium" | "Low";
  interpretation: string;
}

export interface NakshatraSummary {
  birth_nakshatra: string;
  pada: number;
  lord: string;
  nature: string;
  compatibility: string;
  strength: number;
  description: string;
}

export interface YogaItem {
  name: string;
  detected: boolean;
  confidence: number;
  explanation: string;
  planets: string[];
}

export interface DoshaItem {
  name: string;
  detected: boolean;
  severity: "None" | "Low" | "Medium" | "High";
  explanation: string;
  remedies: string[];
}

export interface StrengthItem {
  planet: string;
  strength: number;
  percentage: number;
  ranking: number;
}

export interface TimelineItem {
  year: number;
  title: string;
  category: string;
  description: string;
  intensity: number;
}

export interface LifeScore {
  score: number;
  trend: "Rising" | "Stable" | "Testing";
  summary: string;
}

export interface AspectItem {
  from: string;
  to: string;
  angle: number;
  type: "Positive" | "Neutral" | "Challenging";
  interpretation: string;
}

export interface AstrologyDashboardData {
  birth_details: BirthDetails;
  planets: AstrologyPlanet[];
  houses: AstrologyHouse[];
  kundli: { ascendant: string; ascendant_longitude: number; placements: ChartPlacement[] };
  south_chart: { placements: ChartPlacement[] };
  western_chart: { ascendant: number; mc: number; ic: number; dsc: number; aspects: AspectItem[] };
  dasha: { current?: DashaPeriod; upcoming?: DashaPeriod; timeline: DashaPeriod[] };
  transits: { today: TransitItem[]; upcoming: TransitItem[] };
  nakshatra: NakshatraSummary;
  yogas: YogaItem[];
  doshas: DoshaItem[];
  strengths: StrengthItem[];
  timeline: TimelineItem[];
  life_scores: Record<string, LifeScore>;
  compatibility: Record<string, string | number>;
  aspect_matrix?: AspectItem[];
  calculation_timestamp?: string;
}
