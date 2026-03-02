import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4">
      <h1 className="text-6xl font-bold text-white">404</h1>
      <p className="mt-4 text-lg text-neutral-300">page not found</p>
      <p className="mt-2 text-sm text-neutral-500">
        the page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/browse"
        className="mt-8 bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
      >
        back to browse
      </Link>
    </div>
  );
}
