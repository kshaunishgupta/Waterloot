import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="border border-neutral-700 bg-neutral-900 p-8 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-primary-900/30">
        <Mail className="h-8 w-8 text-primary-400" />
      </div>
      <h1 className="text-2xl font-bold text-white">
        check your email
      </h1>
      <p className="mt-3 text-sm text-neutral-400">
        we sent a verification link to your email address. click the link to
        verify your account and start using waterloot.
      </p>
      <div className="mt-6 bg-neutral-800 p-4 text-left text-sm text-neutral-400">
        <p className="font-medium text-neutral-300">
          didn&apos;t receive the email?
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Check your spam or junk folder</li>
          <li>Make sure you entered your email correctly</li>
          <li>
            Try{" "}
            <Link href="/signup" className="text-primary-600 hover:underline">
              signing up again
            </Link>
          </li>
        </ul>
      </div>
      <div className="mt-8">
        <Link
          href="/login"
          className="text-sm font-medium text-primary-600 hover:underline"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
