/** biome-ignore-all lint/a11y/noStaticElementInteractions: <> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <> */
import { Eye, EyeOff, Lock, Mail, Phone, RefreshCw, ShieldCheck, User, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useCreateUser, useUpdateUser } from "../lib/hooks";
import type { User as UserType } from "../lib/types";

type Mode = "create" | "edit";

interface UserModalProps {
  mode: Mode;
  user?: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Nested form field component for modal
function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="form-control w-full">
      <label htmlFor={id} className="label pt-0 pb-1">
        <span className="label-text text-xs font-semibold text-base-content/60 uppercase tracking-wide">{label}</span>
      </label>
      {children}
    </div>
  );
}

// Generate random password string
function generatePassword(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  // Build string from random character indices
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((n) => chars[n % chars.length])
    .join("");
}

// Modal for creating or editing users
export default function UserModal({ mode, user, isOpen, onClose, onSuccess }: UserModalProps) {
  // Determine if editing existing user
  const isEdit = mode === "edit";
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  // Check if either mutation is pending
  const isPending = createMutation.isPending || updateMutation.isPending;
  // Get error from either mutation
  const errorMessage = (createMutation.error ?? updateMutation.error)?.message ?? null;

  // Reset form when modal closes
  useEffect(() => {
    // Skip if modal not open
    if (!isOpen) return;
    createMutation.reset();
    updateMutation.reset();
    setShowPassword(false);
    setPassword("");
    setCopied(false);
    if (!isEdit) formRef.current?.reset();
  }, [isOpen, createMutation.reset]);

  // Handle password generation click
  function handleGenerate() {
    const newPassword = generatePassword(12);
    setPassword(newPassword);
    setShowPassword(true);
    setCopied(false);
  }

  // Copy password to clipboard
  function handleCopy() {
    // Abort if no password to copy
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    // Clear copied status after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default form submission
    e.preventDefault();

    // Extract form field values
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const role = formData.get("roles") as "user" | "admin";

    // Determine if updating or creating
    if (isEdit && user) {
      updateMutation.mutate(
        { id: user.id, data: { firstName, lastName, email, phoneNumber, role } },
        {
          onSuccess: () => {
            onSuccess();
            onClose();
          },
        },
      );
    } else {
      createMutation.mutate(
        { firstName, lastName, email, phoneNumber, role, password },
        {
          onSuccess: () => {
            onSuccess();
            onClose();
          },
        },
      );
    }
  };

  // Hide modal if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md mx-4 bg-base-100 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-linear-to-r from-primary via-secondary to-accent" />

        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div>
            <h2 className="text-lg font-bold text-primary">{isEdit ? "Edit User" : "Create User"}</h2>
            <p className="text-xs text-base-content/50 mt-0.5">
              {isEdit ? `Updating ${user?.firstName} ${user?.lastName}` : "Fill in the details to add a new client"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-base-content/40 hover:text-base-content"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" id="firstName">
              <label className="input input-bordered flex items-center gap-2">
                <User className="w-4 h-4 text-base-content/40 shrink-0" />
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  placeholder="John"
                  className="grow text-sm"
                  defaultValue={user?.firstName ?? ""}
                  required
                />
              </label>
            </Field>
            <Field label="Last Name" id="lastName">
              <label className="input input-bordered flex items-center gap-2">
                <User className="w-4 h-4 text-base-content/40 shrink-0" />
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  className="grow text-sm"
                  defaultValue={user?.lastName ?? ""}
                  required
                />
              </label>
            </Field>
          </div>

          <Field label="Email" id="email">
            <label className="input input-bordered flex items-center gap-2">
              <Mail className="w-4 h-4 text-base-content/40 shrink-0" />
              <input
                id="email"
                type="email"
                name="email"
                placeholder="john@example.com"
                className="grow text-sm"
                defaultValue={user?.email ?? ""}
                required
              />
            </label>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone Number" id="phoneNumber">
              <label className="input input-bordered flex items-center gap-2">
                <Phone className="w-4 h-4 text-base-content/40 shrink-0" />
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  placeholder="+33 6 00 00 00"
                  className="grow text-sm"
                  defaultValue={user?.phoneNumber ?? ""}
                />
              </label>
            </Field>
            <Field label="Role" id="roles">
              <label className="input input-bordered flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-base-content/40 shrink-0" />
                <select
                  id="roles"
                  name="roles"
                  className="grow text-sm bg-transparent"
                  defaultValue={user?.roles?.[0]?.includes("ADMIN") ? "admin" : "user"}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </Field>
          </div>

          {!isEdit && (
            <Field label="Password" id="password">
              {/* Input row */}
              <div className="relative">
                <label className="input input-bordered flex items-center gap-2 pr-10">
                  <Lock className="w-4 h-4 text-base-content/40 shrink-0" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className="grow text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-base-content/40 hover:text-base-content"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              {/* Generator row */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="btn btn-xs btn-outline border-base-300 text-base-content/60 hover:border-secondary hover:text-secondary gap-1.5 rounded-full"
                >
                  <RefreshCw size={11} />
                  Generate
                </button>

                {password && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`btn btn-xs rounded-full transition-all ${copied
                        ? "btn-success text-white border-none"
                        : "btn-outline border-base-300 text-base-content/60 hover:border-primary hover:text-primary"
                      }`}
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                )}
              </div>
            </Field>
          )}

          {errorMessage && <p className="text-error text-xs text-center font-medium">{errorMessage}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1 rounded-full text-base-content/60">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary flex-1 rounded-full text-white disabled:bg-gray-300"
            >
              {isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
