"use client";

import { useEffect, useMemo, useState } from "react";
import { BirthDetails } from "../types";
import { AstrologyDashboardData } from "../types/astrology";
import { api } from "../lib/api";
import { canGenerateChart } from "../lib/chartCalculations";

export function useAstrologyDashboard(birthDetails: BirthDetails) {
  const [data, setData] = useState<AstrologyDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartKey = useMemo(() => JSON.stringify(birthDetails || {}), [birthDetails]);
  const isReady = useMemo(() => canGenerateChart(birthDetails || {}), [birthDetails]);

  useEffect(() => {
    if (!isReady) {
      setData(null);
      return;
    }

    const controller = new AbortController();
    
    const loadChart = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const chart = await api.generateChart(birthDetails, controller.signal);
        setData(chart);
      } catch (err: any) {
        // Ignore AbortController cancellations
        if (
          err?.name === "AbortError" ||
          err?.code === "ABORT_ERR" ||
          err?.name === "CanceledError" ||
          err?.message === "The user aborted a request." ||
          err?.message === "The operation was aborted."
        ) {
          return;
        }
        console.error(err);
        setError(err?.message || "Could not generate chart.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadChart();

    return () => {
      controller.abort();
    };
  }, [chartKey, isReady, birthDetails]);

  return { data, isLoading, error, isReady };
}
