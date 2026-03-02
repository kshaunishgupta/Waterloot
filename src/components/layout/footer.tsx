import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "about" },
  { href: "/safety", label: "safety" },
  { href: "/contact", label: "contact" },
  { href: "/terms", label: "terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm text-neutral-500">
          &copy; {new Date().getFullYear()}{" "}
          <span className="brand-name">Waterloot</span>{" "}
          &mdash; just students helping students
        </p>
        <nav className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-500 transition-colors hover:text-neutral-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
