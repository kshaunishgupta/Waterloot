import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Waterloot",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        About Waterloot
      </h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-neutral-700 dark:text-neutral-300">
        <p>
          Waterloot is a peer-to-peer marketplace built exclusively for
          University of Waterloo students. Our mission is to make buying and
          selling within the UWaterloo community safe, simple, and accessible.
        </p>
        <p>
          Every account is verified with a <strong>@uwaterloo.ca</strong> email
          address, so you always know you&apos;re dealing with a fellow student.
          No strangers, no scammers — just Warriors helping Warriors.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          What can you do on Waterloot?
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Buy and sell textbooks, electronics, furniture, and more</li>
          <li>Post &quot;Wanted&quot; listings to find items you need</li>
          <li>Connect with sellers directly via email or social media</li>
          <li>Leave reviews for sellers to build community trust</li>
        </ul>
        <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
          Waterloot is a student-built project. If you have feedback or
          questions, please reach out via the{" "}
          <a href="/contact" className="text-primary-600 hover:underline dark:text-primary-400">
            contact page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
