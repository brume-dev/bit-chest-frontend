/** biome-ignore-all lint/a11y/noStaticElementInteractions: <> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <> */
import { Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, User, X } from "lucide-react";
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

export default function UserModal({ mode, user, isOpen, onClose, onSuccess }: UserModalProps) {
  const isEdit = mode === "edit";
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const isPending = createMutation.isPending || updateMutation.isPending;
  const errorMessage = (createMutation.error ?? updateMutation.error)?.message ?? null;

  useEffect(() => {
    if (!isOpen) return;
    createMutation.reset();
    updateMutation.reset();
    setShowPassword(false);
    if (!isEdit) formRef.current?.reset();
  }, [isOpen, createMutation.reset]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const password = formData.get("password") as string;
    const role = formData.get("roles") as "user" | "admin";

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
              <div className="relative">
                <label className="input input-bordered flex items-center gap-2 pr-10">
                  <Lock className="w-4 h-4 text-base-content/40 shrink-0" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className="grow text-sm"
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
