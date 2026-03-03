import { MailIcon, PhoneIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { Field } from "../components/form-field";
import { Sidebar } from "../components/sidebar";
import { UpdateProfileSection } from "../components/update-profile-section";
import { getInitials } from "../lib/helpers";
import { useCurrentUser, useUpdateCurrentUser } from "../lib/hooks";
import type { UpdateCurrentUserRequest } from "../types";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: user, isLoading } = useCurrentUser();
  const updateMutation = useUpdateCurrentUser();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-secondary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center">
                <span className="text-secondary font-bold text-lg">{user ? getInitials(user) : "—"}</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral">{user ? `${user.firstName} ${user.lastName}` : "—"}</h1>
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
                  className="btn btn-secondary text-white border-none disabled:bg-gray-300 px-8"
                >
                  {updateMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
