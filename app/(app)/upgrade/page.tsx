"use client";

import { AppPage } from "@/components/layout/app-page";
import { PricingPlans } from "@/components/pricing/pricing-plans";

export default function UpgradePage() {
  return (
    <AppPage showMemoryAgent={false}>
      <PricingPlans mode="app" />
    </AppPage>
  );
}
