import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — Waterloot",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        Terms of Use
      </h1>
      <div className="space-y-6 text-sm text-neutral-700 dark:text-neutral-300">
        <p className="text-neutral-500 dark:text-neutral-400">
          Last updated: {new Date().toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            1. Eligibility
          </h2>
          <p>
            Waterloot is exclusively for current University of Waterloo students
            and staff. You must have a valid <strong>@uwaterloo.ca</strong>{" "}
            email address to create an account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            2. Acceptable Use
          </h2>
          <p>You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Post fraudulent, misleading, or illegal listings</li>
            <li>Harass or threaten other users</li>
            <li>Attempt to circumvent our verification systems</li>
            <li>Use the platform for commercial or non-student purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            3. Transactions
          </h2>
          <p>
            Waterloot is a platform that connects buyers and sellers. We are not
            a party to any transaction and are not responsible for the quality,
            safety, or legality of listed items or the accuracy of listings.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            4. Privacy
          </h2>
          <p>
            Your email address is verified but not displayed publicly. It is
            only shared with other users when you choose to &quot;Email
            Seller&quot; on a listing, via a mailto: link on your device.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            5. Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these terms without notice.
          </p>
        </section>

        <p className="text-neutral-500 dark:text-neutral-400">
          By using Waterloot, you agree to these terms. Questions?{" "}
          <a href="/contact" className="text-primary-600 hover:underline dark:text-primary-400">
            Contact us
          </a>
          .
        </p>
      </div>
    </div>
  );
}
