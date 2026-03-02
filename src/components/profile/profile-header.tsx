"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { updateProfile, updateAvatar, removeAvatar } from "@/actions/profile";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { Calendar, Edit2, Flag, Trash2 } from "lucide-react";
import type { Profile } from "@/lib/types";

interface ProfileHeaderProps {
  profile: Profile;
  isOwn?: boolean;
  approvalPct?: number | null;
  totalRatings?: number;
}

// Defined at module scope (outside ProfileHeader) so its component identity is stable.
// This prevents the Modal's controlled inputs from unmounting/remounting when the
// parent ProfileHeader re-renders (e.g. during avatar upload), which was causing
// the display name field to lose focus after every keystroke.
function ProfileEditButton({ profile }: { profile: Profile }) {
  const [showEdit, setShowEdit] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateProfile({ full_name: fullName, phone });
    setSaving(false);
    setShowEdit(false);
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setShowEdit(true)}>
        edit profile
      </Button>
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="edit profile">
        <div className="space-y-4">
          <Input
            id="edit-full-name"
            label="full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            id="edit-phone"
            label="phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowEdit(false)}>cancel</Button>
            <Button onClick={handleSave} loading={saving}>save changes</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function ProfileHeader({ profile, isOwn, approvalPct, totalRatings }: ProfileHeaderProps) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${profile.id}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      await updateAvatar(publicUrl);
    }
    setUploadingAvatar(false);
  }

  async function handleRemoveAvatar() {
    setRemovingAvatar(true);
    await removeAvatar();
    setRemovingAvatar(false);
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative">
        <Avatar
          src={profile.avatar_url}
          alt={profile.full_name}
          fallback={profile.full_name.split(" ").map((n) => n[0]).join("")}
          size="lg"
        />
        {isOwn && (
          <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center bg-primary-600 text-white hover:bg-primary-700 transition-colors">
            <Edit2 className="h-3.5 w-3.5" />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
          </label>
        )}
      </div>

      <div className="flex-1 text-center sm:text-left">
        <h1 className="brand-name text-2xl font-bold text-white">{profile.full_name.toLowerCase()}</h1>
        <p className="text-sm text-neutral-400">{profile.email}</p>
        {approvalPct != null && totalRatings != null && totalRatings > 0 && (
          <p className="mt-1 text-sm text-neutral-300">
            liked by <span className="font-semibold text-primary-400">{approvalPct}%</span> of buyers
            <span className="ml-1 text-neutral-500">({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})</span>
          </p>
        )}
        <div className="mt-2 flex items-center justify-center gap-1 text-sm text-neutral-500 sm:justify-start">
          <Calendar className="h-3.5 w-3.5" />
          <span>joined {formatDate(profile.created_at)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {isOwn ? (
          <div className="flex flex-col gap-2">
            <ProfileEditButton profile={profile} />
            {profile.avatar_url && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRemoveAvatar}
                loading={removingAvatar}
                className="flex items-center gap-1.5 text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                remove photo
              </Button>
            )}
          </div>
        ) : (
          <Button variant="secondary" size="sm">
            <Flag className="mr-1.5 h-3.5 w-3.5" />
            report
          </Button>
        )}
      </div>
    </div>
  );
}
