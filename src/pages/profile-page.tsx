import { KeyRoundIcon, MailIcon, PhoneIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { Field } from "../components/form-field";
import { UpdateProfileSection } from "../components/update-profile-section";
import { getInitials } from "../lib/helpers";
import { useChangePassword, useCurrentUser, useUpdateCurrentUser } from "../lib/hooks";
import type { UpdateCurrentUserRequest } from "../lib/types";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  const { data: user, isLoading } = useCurrentUser();
  const updateMutation = useUpdateCurrentUser();
  const changePasswordMutation = useChangePassword();

  function updateProfileAction(formData: FormData) {
    const data: UpdateCurrentUserRequest = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
    };
    updateMutation.mutate(data, {
      onSuccess: () => setIsEditing(false),
    });
  }

  function handleChangePassword() {
    setPasswordError("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
      {
        onSuccess: () => {
          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="bg-slate-50 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-secondary" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center shrink-0">
              <span className="text-secondary font-bold text-base sm:text-lg">{user ? getInitials(user) : "—"}</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-neutral truncate">
                {user ? `${user.firstName} ${user.lastName}` : "—"}
              </h1>
              <p className="text-sm text-gray-400 truncate">{user?.email ?? "—"}</p>
            </div>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn btn-secondary text-white border-none btn-sm px-5 self-start sm:self-auto"
            >
              Edit Profile
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-ghost btn-sm px-5 text-gray-500 self-start sm:self-auto"
            >
              Cancel
            </button>
          )}
        </div>

        <form action={updateProfileAction} className="space-y-4">
          <UpdateProfileSection title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" id="firstName" icon={<UserIcon size={14} />}>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  defaultValue={user?.firstName}
                  disabled={!isEditing}
                  className="input input-bordered w-full text-sm disabled:bg-base-200 disabled:text-neutral disabled:cursor-default"
                />
              </Field>
              <Field label="Last Name" id="lastName" icon={<UserIcon size={14} />}>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  defaultValue={user?.lastName}
                  disabled={!isEditing}
                  className="input input-bordered w-full text-sm disabled:bg-base-200 disabled:text-neutral disabled:cursor-default"
                />
              </Field>
            </div>
          </UpdateProfileSection>

          <UpdateProfileSection title="Contact Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email Address" id="email" icon={<MailIcon size={14} />}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.email}
                  disabled
                  className="input input-bordered w-full text-sm disabled:bg-base-200 disabled:text-neutral disabled:cursor-default"
                />
              </Field>
              <Field label="Phone Number" id="phoneNumber" icon={<PhoneIcon size={14} />}>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  defaultValue={user?.phoneNumber}
                  disabled={!isEditing}
                  className="input input-bordered w-full text-sm disabled:bg-base-200 disabled:text-neutral disabled:cursor-default"
                />
              </Field>
            </div>
          </UpdateProfileSection>

          {updateMutation.error && (
            <p className="text-error text-xs text-center font-medium">{updateMutation.error.message}</p>
          )}

          {isEditing && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="btn btn-secondary text-white border-none disabled:bg-gray-300 w-full sm:w-auto px-8"
              >
                {updateMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : "Save Changes"}
              </button>
            </div>
          )}
        </form>

        {/* Change Password — separate from the profile form */}
        <div className="mt-4">
          <UpdateProfileSection title="Change Password">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Current Password" id="currentPassword" icon={<KeyRoundIcon size={14} />}>
                <input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="input input-bordered w-full text-sm"
                />
              </Field>

              <div />

              <Field label="New Password" id="newPassword" icon={<KeyRoundIcon size={14} />}>
                <input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                  placeholder="••••••••"
                  className={`input input-bordered w-full text-sm ${
                    passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                      ? "input-error"
                      : ""
                  }`}
                />
              </Field>

              <Field label="Confirm New Password" id="confirmPassword" icon={<KeyRoundIcon size={14} />}>
                <input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  className={`input input-bordered w-full text-sm ${
                    passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                      ? "input-error"
                      : ""
                  }`}
                />
              </Field>
            </div>

            {/* Inline mismatch hint */}
            {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
              <p className="text-error text-xs mt-2">Passwords do not match.</p>
            )}

            {/* Validation / API errors */}
            {(passwordError || changePasswordMutation.error) && (
              <p className="text-error text-xs mt-2 font-medium">
                {passwordError || changePasswordMutation.error?.message}
              </p>
            )}

            {changePasswordMutation.isSuccess && (
              <p className="text-success text-xs mt-2 font-medium">Password updated successfully.</p>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending}
                className="btn btn-secondary text-white border-none disabled:bg-gray-300 w-full sm:w-auto px-8"
              >
                {changePasswordMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </UpdateProfileSection>
        </div>
      </div>
    </div>
  );
}
