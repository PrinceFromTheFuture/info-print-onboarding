"use client";
import { useEffect } from "react";
import dayjs from "dayjs";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc";


export function VisitReporter() {
  const trpc = useTRPC();
  const { mutate } = useMutation(trpc.reportVisit.mutationOptions());

  useEffect(() => {
    const LAST_REPORT_KEY = "lastReportTime";
    const REPORT_INTERVAL_MINUTES = 10;

    const lastReport = localStorage.getItem(LAST_REPORT_KEY);
    const now = dayjs();

    const isMobile = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(
      navigator.userAgent
    );

    const shouldReport =
      !lastReport ||
      now.diff(dayjs(Number(lastReport)), "minute") >= REPORT_INTERVAL_MINUTES;

    if (shouldReport) {
      mutate(
        { type: isMobile ? "mobile" : "desktop" },
        {
          onSuccess: () => {
            localStorage.setItem(LAST_REPORT_KEY, String(now.valueOf()));
            console.log(
              `✅ Reported visit from ${isMobile ? "mobile" : "desktop"}`
            );
          },
          onError: (err) => {
            console.error("❌ Report failed:", err);
          },
        }
      );
    } else {
      console.log("⏳ Skipped — last report was less than 10 minutes ago.");
    }
  }, [mutate]);

  return null;
}
