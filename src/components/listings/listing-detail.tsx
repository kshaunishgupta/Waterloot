"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Mail,
  Flag,
  Pencil,
  BookOpen,
  CheckCircle,
  RotateCcw,
  Trash2,
  Instagram,
  Phone,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, formatDate, formatCondition } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { saveListing, unsaveListing } from "@/actions/saved";
import { markAsSold, reactivateListing, deleteListing } from "@/actions/listings";
import { getSellerEmail } from "@/actions/contact";
import { createReport } from "@/actions/reports";
import { REPORT_REASONS } from "@/lib/constants";
import { ModDeleteButton } from "@/components/ui/mod-delete-button";
import type { ListingWithDetails } from "@/lib/types";

interface ListingDetailProps {
  listing: ListingWithDetails;
  currentUserId: string | null;
  isSaved: boolean;
  isAdmin?: boolean;
}

const conditionBadgeClass: Record<string, string> = {
  new: "bg-blue-900 border-blue-700 text-blue-300",
  like_new: "bg-blue-800 border-blue-600 text-blue-300",
  good: "bg-blue-700 border-blue-500 text-blue-200",
  fair: "bg-blue-600 border-blue-400 text-blue-100",
};

const categoryBadgeClass = "bg-violet-900 border-violet-700 text-violet-300";

// ─── Report Modal ────────────────────────────────────────────────────────────
// Defined at module scope so its identity is stable — prevents input focus
// loss when the parent ListingDetail re-renders.
function ReportModal({
  isOpen,
  onClose,
  listingId,
  reportedUserId,
}: {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  reportedUserId: string;
}) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (!reason) { setError("please select a reason"); return; }
    setSubmitting(true);
    setError(null);
    const result = await createReport({
      listing_id: listingId,
      reported_user_id: reportedUserId,
      reason,
      description: description.trim() || undefined,
    });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(onClose, 1500);
    }
  }

  function handleClose() {
    setReason("");
    setDescription("");
    setError(null);
    setSuccess(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="report listing">
      {success ? (
        <div className="py-6 text-center text-sm font-medium text-green-400">
          the report has been submitted. thank you.
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
              reason
            </label>
            <select
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">select a reason...</option>
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label.toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
              details (optional)
            </label>
            <textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="any additional context..."
              className="w-full resize-none border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleClose} disabled={submitting}>
              cancel
            </Button>
            <Button variant="destructive" onClick={handleSubmit} loading={submitting}>
              submit report
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Email Options Modal ─────────────────────────────────────────────────────
function EmailModal({
  isOpen,
  onClose,
  sellerEmail,
  subject,
}: {
  isOpen: boolean;
  onClose: () => void;
  sellerEmail: string;
  subject: string;
}) {
  const [copied, setCopied] = useState(false);

  const encodedTo = encodeURIComponent(sellerEmail);
  const encodedSubject = encodeURIComponent(subject);
  const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodedTo}&subject=${encodedSubject}`;
  const mailtoUrl = `mailto:${sellerEmail}?subject=${encodedSubject}`;

  function handleCopy() {
    navigator.clipboard.writeText(sellerEmail).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="contact seller">
      <div className="space-y-5">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            seller email
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100">
              {sellerEmail}
            </code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-400 transition-colors hover:border-neutral-500 hover:text-white"
            >
              {copied ? (
                <><Check className="h-3.5 w-3.5 text-green-400" /> copied</>
              ) : (
                <><Copy className="h-3.5 w-3.5" /> copy</>
              )}
            </button>
          </div>
        </div>

        <a
          href={outlookUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="block"
        >
          <Button variant="default" className="w-full gap-2">
            <Mail className="h-4 w-4" />
            open in outlook
          </Button>
        </a>
      </div>
    </Modal>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ListingDetail({
  listing,
  currentUserId,
  isSaved: initialSaved,
  isAdmin = false,
}: ListingDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [emailData, setEmailData] = useState<{ email: string; subject: string } | null>(null);

  const isOwner = !!currentUserId && listing.seller_id === currentUserId;
  const isLoggedIn = !!currentUserId;
  const isTextbook = listing.isbn || listing.book_title || listing.book_author;
  const isSold = listing.status === "sold";
  const hasContactInfo = listing.instagram || listing.discord || listing.contact_phone;

  const handleSaveToggle = () => {
    setActionError(null);
    const previousState = saved;
    setSaved(!saved);
    startTransition(async () => {
      const result = saved
        ? await unsaveListing(listing.id)
        : await saveListing(listing.id);
      if (result.error) {
        setSaved(previousState);
        setActionError(result.error);
      }
    });
  };

  const handleEmailSeller = () => {
    setActionError(null);
    startTransition(async () => {
      const result = await getSellerEmail(listing.id);
      if (result.error) {
        setActionError(result.error);
      } else if (result.email) {
        setEmailData({ email: result.email, subject: result.subject ?? "" });
      }
    });
  };

  const handleMarkAsSold = () => {
    setActionError(null);
    startTransition(async () => {
      const result = await markAsSold(listing.id);
      if (result.error) setActionError(result.error);
    });
  };

  const handleReactivate = () => {
    setActionError(null);
    startTransition(async () => {
      const result = await reactivateListing(listing.id);
      if (result.error) setActionError(result.error);
    });
  };

  const handleDelete = () => {
    setActionError(null);
    startTransition(async () => {
      const result = await deleteListing(listing.id);
      if (result && result.error) {
        setActionError(result.error);
        setShowDeleteModal(false);
      }
    });
  };

  return (
    <div className="space-y-8">
      {actionError && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {actionError}
        </div>
      )}

      {isSold && (
        <div className="border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-400">
          This listing has been marked as sold.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] overflow-hidden border border-gray-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800">
              {listing.images && listing.images.length > 0 ? (
                <Image
                  src={listing.images[selectedImage]}
                  alt={`${listing.title} - Image ${selectedImage + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400 dark:text-neutral-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {listing.images.map((url, index) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative h-16 w-16 shrink-0 overflow-hidden border-2 transition-colors",
                      selectedImage === index
                        ? "border-primary-600"
                        : "border-gray-200 hover:border-gray-300 dark:border-neutral-700 dark:hover:border-neutral-500"
                    )}
                  >
                    <Image src={url} alt={`Thumbnail ${index + 1}`} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + Price + Badges */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">{listing.title.toLowerCase()}</h1>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-500">{formatPrice(listing.price).toLowerCase()}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge className={conditionBadgeClass[listing.condition] ?? "bg-neutral-800 border-neutral-600 text-neutral-300"}>
                {formatCondition(listing.condition).toLowerCase()}
              </Badge>
              {listing.category && (
                <Badge className={categoryBadgeClass}>{listing.category.name.toLowerCase()}</Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-neutral-500">listed {formatDate(listing.created_at)}</p>
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-neutral-100">description</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-neutral-300">{listing.description}</p>
          </div>

          {/* Textbook details */}
          {isTextbook && (
            <div className="border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-neutral-100">
                <BookOpen className="h-4 w-4" />textbook details
              </h2>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {listing.isbn && <div><dt className="font-medium text-gray-500 dark:text-neutral-400">isbn</dt><dd className="mt-0.5 text-gray-900 dark:text-neutral-100">{listing.isbn}</dd></div>}
                {listing.book_author && <div><dt className="font-medium text-gray-500 dark:text-neutral-400">author</dt><dd className="mt-0.5 text-gray-900 dark:text-neutral-100">{listing.book_author}</dd></div>}
                {listing.book_edition && <div><dt className="font-medium text-gray-500 dark:text-neutral-400">edition</dt><dd className="mt-0.5 text-gray-900 dark:text-neutral-100">{listing.book_edition}</dd></div>}
                {listing.course_code && <div><dt className="font-medium text-gray-500 dark:text-neutral-400">course code</dt><dd className="mt-0.5 text-gray-900 dark:text-neutral-100">{listing.course_code}</dd></div>}
              </dl>
            </div>
          )}

          {/* Additional contact */}
          {isLoggedIn && !isOwner && hasContactInfo && (
            <div className="border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-neutral-100">contact</h2>
              <div className="space-y-2">
                {listing.instagram && (
                  <a href={`https://instagram.com/${listing.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:underline dark:text-primary-400">
                    <Instagram className="h-4 w-4" />@{listing.instagram.replace("@", "")}
                  </a>
                )}
                {listing.discord && (
                  <p className="flex items-center gap-2 text-sm text-gray-700 dark:text-neutral-300">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.053a19.909 19.909 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>
                    {listing.discord}
                  </p>
                )}
                {listing.contact_phone && (
                  <a href={`tel:${listing.contact_phone}`} className="flex items-center gap-2 text-sm text-primary-600 hover:underline dark:text-primary-400">
                    <Phone className="h-4 w-4" />{listing.contact_phone}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="space-y-3 border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            {isOwner ? (
              <>
                <Link href={`/listings/${listing.id}/edit`} className="block">
                  <Button variant="default" size="lg" className="w-full gap-2"><Pencil className="h-4 w-4" />edit listing</Button>
                </Link>
                {isSold ? (
                  <Button variant="secondary" size="lg" className="w-full gap-2" onClick={handleReactivate} loading={isPending}>
                    <RotateCcw className="h-4 w-4" />reactivate listing
                  </Button>
                ) : (
                  <Button variant="secondary" size="lg" className="w-full gap-2" onClick={handleMarkAsSold} loading={isPending}>
                    <CheckCircle className="h-4 w-4" />mark as sold
                  </Button>
                )}
                <Button variant="destructive" size="lg" className="w-full gap-2" onClick={() => setShowDeleteModal(true)}>
                  <Trash2 className="h-4 w-4" />delete listing
                </Button>
              </>
            ) : isLoggedIn ? (
              <>
                <Button variant="default" size="lg" className="w-full gap-2" onClick={handleEmailSeller} loading={isPending} disabled={isSold}>
                  <Mail className="h-4 w-4" />contact
                </Button>
                <Button variant="secondary" size="lg" className="w-full gap-2" onClick={handleSaveToggle} disabled={isPending}>
                  <Heart className={cn("h-4 w-4", saved && "fill-red-500 text-red-500")} />
                  {saved ? "saved" : "save listing"}
                </Button>
              </>
            ) : (
              <>
                <Link href={`/login?next=/listings/${listing.id}`} className="block">
                  <Button variant="default" size="lg" className="w-full gap-2" disabled={isSold}><Mail className="h-4 w-4" />sign in to contact seller</Button>
                </Link>
                <Link href={`/login?next=/listings/${listing.id}`} className="block">
                  <Button variant="secondary" size="lg" className="w-full gap-2"><Heart className="h-4 w-4" />sign in to save</Button>
                </Link>
              </>
            )}

            {/* Report button — inline modal, NOT a broken /report route */}
            {!isOwner && isLoggedIn && (
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <Flag className="h-4 w-4" />report listing
              </button>
            )}

            {/* Mod remove — visible only to admins */}
            {isAdmin && (
              <div className="pt-1">
                <ModDeleteButton
                  type="listing"
                  id={listing.id}
                  className="w-full justify-center"
                />
              </div>
            )}
          </div>

          {isLoggedIn ? (
            <div className="border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">seller</h2>
              <div className="flex items-center gap-3">
                <Avatar src={listing.seller.avatar_url} alt={listing.seller.full_name} fallback={listing.seller.full_name?.charAt(0)?.toUpperCase()} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900 dark:text-neutral-100">{listing.seller.full_name.toLowerCase()}</p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    member since {new Date(listing.seller.created_at).toLocaleDateString("en-CA", { month: "long", year: "numeric" }).toLowerCase()}
                  </p>
                </div>
              </div>
              <Link href={`/profile/${listing.seller.id}`} className="mt-4 block">
                <Button variant="secondary" size="sm" className="w-full">view profile</Button>
              </Link>
            </div>
          ) : (
            <div className="border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                <Link href={`/login?next=/listings/${listing.id}`} className="font-medium text-primary-600 hover:underline dark:text-primary-400">sign in</Link>{" "}
                to view seller info and contact.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="delete listing">
        <p className="text-sm text-gray-600 dark:text-neutral-300">
          Are you sure you want to delete <strong className="text-gray-900 dark:text-neutral-100">{listing.title}</strong>?
          This action cannot be undone and all images will be permanently removed.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isPending}>cancel</Button>
          <Button variant="destructive" onClick={handleDelete} loading={isPending}>delete listing</Button>
        </div>
      </Modal>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        listingId={listing.id}
        reportedUserId={listing.seller_id}
      />

      {/* Email Options Modal */}
      {emailData && (
        <EmailModal
          isOpen={true}
          onClose={() => setEmailData(null)}
          sellerEmail={emailData.email}
          subject={emailData.subject}
        />
      )}
    </div>
  );
}
