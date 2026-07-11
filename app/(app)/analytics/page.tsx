"use client";

import { LineChart } from "lucide-react";
import { AppPage } from "@/components/layout/app-page";
import { ProGate } from "@/components/shared/pro-gate";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/analytics/overview-tab";
import { JourneyTab } from "@/components/analytics/journey-tab";
import { TrendsTab } from "@/components/analytics/trends-tab";
import { useApp } from "@/lib/context/app-context";

export default function AnalyticsPage() {
  const { user, isPremium } = useApp();

  return (
    <AppPage>
      <h1 className="text-4xl font-bold tracking-tight">{user.firstName}&apos;s Analytics</h1>
      <p className="mt-2 text-muted-foreground">
        Your learning momentum across all journeys.
      </p>

      <div className="mt-8">
        {isPremium ? (
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="journey">Per-journey</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <OverviewTab />
            </TabsContent>
            <TabsContent value="journey" className="mt-6">
              <JourneyTab />
            </TabsContent>
            <TabsContent value="trends" className="mt-6">
              <TrendsTab />
            </TabsContent>
          </Tabs>
        ) : (
          // Free tier: don't even fetch real analytics data behind the blur —
          // just a static placeholder, gated by ProGate.
          <ProGate
            active
            title="Pro plan use only"
            subtitle="Analytics & progress insights are a Pro feature. Upgrade to unlock streaks, trends, and per-journey breakdowns."
          >
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-card/40 p-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary">
                <LineChart className="h-7 w-7" />
              </span>
              <h2 className="text-lg font-semibold">No analytics yet</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                As you study and complete resources, your streaks, trends, and
                per-journey breakdown will appear here.
              </p>
            </div>
          </ProGate>
        )}
      </div>
    </AppPage>
  );
}
