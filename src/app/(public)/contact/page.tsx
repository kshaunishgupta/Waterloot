import { Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "contact — waterloot",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold text-white">contact us</h1>
      <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-950">
            <Mail className="h-6 w-6 text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-white">get in touch</p>
            <p className="text-sm text-neutral-400">we&apos;re happy to help</p>
          </div>
        </div>
        <p className="text-sm text-neutral-300">
          waterloot is a student-run project. if you have questions, feedback,
          or want to report a bug, feel free to reach out at{" "}
          <a
            href="https://outlook.office.com/mail/deeplink/compose?to=waterloothelp%40gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary-400 hover:underline"
          >
            waterloothelp@gmail.com
          </a>
          .
        </p>
        <p className="mt-4 text-sm text-neutral-300">
          for urgent safety concerns or to report a user, please use the
          &quot;report&quot; feature on any listing or profile page, or email us
          directly.
        </p>
      </div>
    </div>
  );
}
