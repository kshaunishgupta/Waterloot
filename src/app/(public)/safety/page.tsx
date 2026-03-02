import { Shield, MapPin, AlertTriangle, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety Tips — Waterloot",
};

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary-600 dark:text-primary-500" />
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Safety Tips
        </h1>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-500" />
            Meet in Safe Places
          </h2>
          <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li>Always meet in well-lit, public areas on campus</li>
            <li>Suggest a public spot like SLC, DC Library, or the Student Life Centre</li>
            <li>Avoid meeting in private residences for first-time transactions</li>
            <li>Consider bringing a friend if meeting someone for the first time</li>
          </ul>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
            Verify Before You Buy
          </h2>
          <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li>Inspect items carefully before completing the transaction</li>
            <li>Test electronics and verify they work as described</li>
            <li>Check textbooks for excessive highlighting or missing pages</li>
            <li>Ask for photos of any specific details you care about</li>
          </ul>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            Watch Out For Scams
          </h2>
          <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li>Be wary of prices that seem too good to be true</li>
            <li>Never send money in advance for items you haven&apos;t seen</li>
            <li>Prefer cash or in-person e-Transfer for transactions</li>
            <li>Report suspicious listings using the &quot;Report&quot; button</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
