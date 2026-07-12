import { AstrologyDashboardData, AspectItem } from "../types/astrology";

export const planetGlyphs: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

export const zodiacGlyphs = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];

export const strengthTone = (value: number) => {
  if (value >= 75) return "text-emerald-300 bg-emerald-400/10 border-emerald-400/30";
  if (value >= 50) return "text-amber-200 bg-amber-400/10 border-amber-400/30";
  return "text-rose-300 bg-rose-400/10 border-rose-400/30";
};

export const getHousePlanets = (data: AstrologyDashboardData, house: number) =>
  data.planets.filter((planet) => planet.house === house).map((planet) => planet.name);

export const getAspectMatrix = (data: AstrologyDashboardData): AspectItem[] => {
  if (data.aspect_matrix?.length) return data.aspect_matrix;
  return data.western_chart.aspects;
};

export const formatDegree = (degree: number) => `${degree.toFixed(2)} deg`;

export const canGenerateChart = (birthDetails: {
  name?: unknown;
  date_of_birth?: unknown;
  time_of_birth?: unknown;
  place_of_birth?: unknown;
}) =>
  Boolean(
    birthDetails?.name &&
      birthDetails?.date_of_birth &&
      birthDetails?.time_of_birth &&
      birthDetails?.place_of_birth
  );
