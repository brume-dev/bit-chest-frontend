import { useState } from "react";
import { Mail, Phone, User } from "lucide-react";
import { useCurrentUser, useUpdateCurrentUser } from "../lib/hooks";
import * as Types from "../types"

function getInitials(user: Types.User) {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
}

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "settings">("personal");
  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading } = useCurrentUser();
  const updateMutation = useUpdateCurrentUser();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Types.UpdateCurrentUserRequest = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
    };
    updateMutation.mutate(data, {
      onSuccess: () => setIsEditing(false),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="h-1.5 w-full bg-secondary" />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center">
              <span className="text-secondary font-bold text-lg">
                {user ? getInitials(user) : "—"}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral">
                {user ? `${user.firstName} ${user.lastName}` : "—"}
              </h1>
              <p className="text-sm text-gray-400">{user?.email ?? "—"}</p>
            </div>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn btn-secondary text-white border-none btn-sm px-5"
            >
              Edit Profile
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-ghost btn-sm px-5 text-gray-500"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-base-200 mb-6">
          <div className="flex gap-6">
            {(["personal", "security", "settings"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-secondary text-secondary"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab === "personal" ? "Personal Details" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "personal" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Section title="Personal Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" id="firstName" icon={<User size={14} />}>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    defaultValue={user?.firstName}
                    disabled={!isEditing}
                    className="input input-bordered w-full text-sm disabled:bg-base-200 disabled:text-neutral disabled:cursor-default"
                  />
                </Field>
                <Field label="Last Name" id="lastName" icon={<User size={14} />}>
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
            </Section>

            <Section title="Contact Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email Address" id="email" icon={<Mail size={14} />}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user?.email}
                    disabled
                    className="input input-bordered w-full text-sm disabled:bg-base-200 disabled:text-neutral disabled:cursor-default"
                  />
                </Field>
                <Field label="Phone Number" id="phoneNumber" icon={<Phone size={14} />}>
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
            </Section>

            {updateMutation.error && (
              <p className="text-error text-xs text-center font-medium">
                {updateMutation.error.message}
              </p>
            )}

            {isEditing && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="btn btn-secondary text-white border-none disabled:bg-gray-300 px-8"
                >
                  {updateMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            )}
          </form>
        )}

        {activeTab === "security" && (
          <div className="text-sm text-gray-400 text-center py-12">Security settings coming soon.</div>
        )}

        {activeTab === "settings" && (
          <div className="text-sm text-gray-400 text-center py-12">App settings coming soon.</div>
        )}
      </div>
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6 space-y-4">
      <h2 className="text-sm font-bold text-neutral">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  id,
  icon,
  children,
}: {
  label: string;
  id: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="form-control w-full">
      <label htmlFor={id} className="label pt-0 pb-1">
        <span className="label-text text-xs font-semibold text-gray-500 flex items-center gap-1">
          {icon}
          {label}
        </span>
      </label>
      {children}
    </div>
  );
}
