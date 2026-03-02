"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";
import {
  Menu,
  X,
  Megaphone,
  Plus,
  User,
  LogOut,
  Heart,
  ShoppingBag,
  Settings,
  ChevronDown,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
}

interface NavbarProps {
  user?: NavbarUser | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [postDropdownOpen, setPostDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const postDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAvatarDropdownOpen(false);
      }
      if (postDropdownRef.current && !postDropdownRef.current.contains(event.target as Node)) {
        setPostDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  const navLinkClass = (href: string) =>
    cn(
      "px-3 py-2 text-sm font-medium transition-colors",
      pathname === href || pathname.startsWith(href + "/")
        ? "bg-neutral-800 text-white"
        : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
    );

  const mobileNavLinkClass = (href: string) =>
    cn(
      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
      pathname === href || pathname.startsWith(href + "/")
        ? "bg-neutral-800 text-white"
        : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
    );

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left: Logo + Brand */}
        <Link
          href="/browse"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo.png"
            alt="Waterloot logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="brand-name text-2xl font-extrabold tracking-tight text-primary-500">
            Waterloot
          </span>
        </Link>

        {/* Center: Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          <Link href="/browse" className={navLinkClass("/browse")}>
            browse
          </Link>
          <Link href="/wanted" className={cn(navLinkClass("/wanted"), "flex items-center gap-1.5")}>
            <Megaphone className="h-4 w-4" />
            wanted
          </Link>

          {/* Post dropdown */}
          <div className="relative" ref={postDropdownRef}>
            <button
              onClick={() => setPostDropdownOpen((p) => !p)}
              className="flex items-center gap-1.5 bg-primary-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              post
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {postDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right border border-neutral-700 bg-neutral-900 py-1 shadow-xl">
                <Link
                  href="/listings/new"
                  onClick={() => setPostDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-200 transition-colors hover:bg-neutral-800"
                >
                  <Tag className="h-4 w-4 text-primary-400" />
                  post a listing
                </Link>
                <Link
                  href="/wanted/new"
                  onClick={() => setPostDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-200 transition-colors hover:bg-neutral-800"
                >
                  <Megaphone className="h-4 w-4 text-primary-400" />
                  post to wanted
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Auth / Avatar */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAvatarDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 transition-colors hover:bg-neutral-800"
                aria-expanded={avatarDropdownOpen}
                aria-haspopup="true"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="h-8 w-8 object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center bg-primary-900 text-sm font-medium text-primary-300 brand-name">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>

              {avatarDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right border border-neutral-700 bg-neutral-900 py-1 shadow-lg">
                  <div className="border-b border-neutral-700 px-4 py-3">
                    <p className="text-sm font-medium text-white brand-name">{user.full_name}</p>
                    <p className="text-xs text-neutral-400 capitalize">{user.role}</p>
                  </div>
                  <Link href="/profile" onClick={() => setAvatarDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-neutral-800">
                    <User className="h-4 w-4" />profile
                  </Link>
                  <Link href="/saved" onClick={() => setAvatarDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-neutral-800">
                    <Heart className="h-4 w-4" />saved
                  </Link>
                  <Link href="/settings" onClick={() => setAvatarDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-neutral-800">
                    <Settings className="h-4 w-4" />settings
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" onClick={() => setAvatarDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-neutral-800">
                      <ShoppingBag className="h-4 w-4" />admin panel
                    </Link>
                  )}
                  <div className="border-t border-neutral-700">
                    <button
                      onClick={async () => { setAvatarDropdownOpen(false); await signOut(); }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-neutral-800"
                    >
                      <LogOut className="h-4 w-4" />logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white">
                log in
              </Link>
              <Link href="/signup" className="bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700">
                sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile: Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-neutral-400 transition-colors hover:bg-neutral-800 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      {/* Mobile: Slide-out Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={closeMobileMenu} aria-hidden="true" />
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-neutral-950 shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-4">
              <span className="brand-name text-xl font-extrabold text-primary-500">Waterloot</span>
              <button onClick={closeMobileMenu} className="p-2 text-neutral-400 transition-colors hover:bg-neutral-800" aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col overflow-y-auto px-4 py-4">
              {user && (
                <div className="mb-4 flex items-center gap-3 bg-neutral-900 p-3">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="h-10 w-10 object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center bg-primary-900 text-sm font-medium text-primary-300 brand-name">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white brand-name">{user.full_name}</p>
                    <p className="text-xs text-neutral-400 capitalize">{user.role}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Link href="/browse" onClick={closeMobileMenu} className={mobileNavLinkClass("/browse")}>
                  browse
                </Link>
                <Link href="/wanted" onClick={closeMobileMenu} className={mobileNavLinkClass("/wanted")}>
                  <Megaphone className="h-5 w-5" />wanted
                </Link>
              </div>

              <hr className="my-3 border-neutral-800" />

              {/* Post section */}
              <p className="mb-2 px-3 text-xs font-semibold text-neutral-500">post something</p>
              <div className="space-y-1">
                <Link href="/listings/new" onClick={closeMobileMenu} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white">
                  <Tag className="h-5 w-5 text-primary-400" />post a listing
                </Link>
                <Link href="/wanted/new" onClick={closeMobileMenu} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white">
                  <Megaphone className="h-5 w-5 text-primary-400" />post to wanted
                </Link>
              </div>

              {user && (
                <>
                  <hr className="my-3 border-neutral-800" />
                  <div className="space-y-1">
                    <Link href="/profile" onClick={closeMobileMenu} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800">
                      <User className="h-5 w-5" />profile
                    </Link>
                    <Link href="/saved" onClick={closeMobileMenu} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800">
                      <Heart className="h-5 w-5" />saved
                    </Link>
                    <Link href="/settings" onClick={closeMobileMenu} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800">
                      <Settings className="h-5 w-5" />settings
                    </Link>
                  </div>
                  <hr className="my-3 border-neutral-800" />
                  <button
                    onClick={async () => { closeMobileMenu(); await signOut(); }}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
                  >
                    <LogOut className="h-5 w-5" />logout
                  </button>
                </>
              )}

              {!user && (
                <>
                  <hr className="my-3 border-neutral-800" />
                  <div className="space-y-2">
                    <Link href="/login" onClick={closeMobileMenu} className="block w-full border border-neutral-700 px-4 py-2.5 text-center text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800">
                      log in
                    </Link>
                    <Link href="/signup" onClick={closeMobileMenu} className="block w-full bg-primary-600 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-primary-700">
                      sign up
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
