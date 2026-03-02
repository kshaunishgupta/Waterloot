"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4">
      <h1 className="text-2xl font-bold text-white">
        something went wrong
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        an unexpected error occurred. please try again.
      </p>
      <button
        onClick={reset}
        className="mt-8 bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
      >
        try again
      </button>
    </div>
  );
}
