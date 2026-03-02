"use client";

import { useState } from "react";
import { Mail, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface WantedContactButtonProps {
  email: string;
  postTitle: string;
}

function ContactModal({
  isOpen,
  onClose,
  email,
  subject,
}: {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  subject: string;
}) {
  const [copied, setCopied] = useState(false);

  const encodedTo = encodeURIComponent(email);
  const encodedSubject = encodeURIComponent(subject);
  const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodedTo}&subject=${encodedSubject}`;

  function handleCopy() {
    navigator.clipboard.writeText(email).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="contact poster">
      <div className="space-y-5">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            poster email
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100">
              {email}
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

export function WantedContactButton({ email, postTitle }: WantedContactButtonProps) {
  const [open, setOpen] = useState(false);
  const subject = `Re: ${postTitle} on Waterloot`;

  return (
    <>
      <Button variant="default" size="lg" className="w-full gap-2" onClick={() => setOpen(true)}>
        <Mail className="h-4 w-4" />
        contact
      </Button>
      <ContactModal
        isOpen={open}
        onClose={() => setOpen(false)}
        email={email}
        subject={subject}
      />
    </>
  );
}
