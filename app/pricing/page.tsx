import { MarketingShell } from "@/components/layout/marketing-shell";
import { PricingPlans } from "@/components/pricing/pricing-plans";

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <PricingPlans mode="public" />
      </section>
    </MarketingShell>
  );
}
