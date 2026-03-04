import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import UserModal from "../components/userModal";
import { useDeleteUser, useUsers } from "../lib/hooks";
import type { User } from "../lib/types";

type ModalState = { isOpen: false } | { isOpen: true; mode: "create" } | { isOpen: true; mode: "edit"; user: User };

function ActionButtons({
  onEdit,
  onDelete,
  isPending,
}: {
  onEdit: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={onEdit}
        className="btn btn-sm btn-circle btn-outline border-base-200 text-base-content/50 hover:bg-base-200 hover:text-primary hover:border-base-300"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onDelete}
        disabled={isPending}
        className="btn btn-sm btn-circle btn-outline border-base-200 text-base-content/50 hover:bg-error/10 hover:text-error hover:border-error/30"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center mt-8 gap-1">
      <button
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="btn btn-sm btn-ghost btn-circle text-base-content/50 hover:bg-base-200 disabled:opacity-50"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-sm text-base-content/60 px-4 font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="btn btn-sm btn-ghost btn-circle text-base-content/50 hover:bg-base-200 disabled:opacity-50"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

const ITEMS_PER_PAGE = 8;

export default function ClientsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState<ModalState>({ isOpen: false });

  const { data: users = [], isLoading, isError, error } = useUsers();
  const deleteMutation = useDeleteUser();

  const filteredUsers = users.filter(({ firstName = "", lastName = "", email }) => {
    const search = searchTerm.toLowerCase();
    return `${firstName} ${lastName}`.toLowerCase().includes(search) || email.toLowerCase().includes(search);
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <span className="loading loading-spinner loading-lg text-secondary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="text-error text-center p-4 bg-error/10 rounded-xl">Error loading users: {error?.message}</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex bg-base-200 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-primary">Clients Management</h1>

            <div className="flex flex-col sm:flex-row w-full md:w-auto items-center gap-3">
              <label className="input input-bordered flex items-center gap-2 w-full sm:w-64 h-10 rounded-full pl-4">
                <Search className="w-4 h-4 text-base-content/40 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="grow text-sm"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </label>

              <button
                onClick={() => setModal({ isOpen: true, mode: "create" })}
                className="btn btn-secondary text-white rounded-full h-10 min-h-10 px-6 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" /> Create User
              </button>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 overflow-hidden">
            <ul className="divide-y divide-base-200 p-2 md:hidden">
              {paginatedUsers.length === 0 ? (
                <li className="p-4 text-center text-base-content/50">No users found.</li>
              ) : (
                paginatedUsers.map((user) => (
                  <li key={user.id} className="flex items-center justify-between p-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {user.firstName} {user.lastName}
                      </span>
                      <button className="text-xs text-secondary hover:underline text-left mt-1">View more</button>
                    </div>
                    <ActionButtons
                      onEdit={() => setModal({ isOpen: true, mode: "edit", user })}
                      onDelete={() => handleDelete(String(user.id))}
                      isPending={deleteMutation.isPending}
                    />
                  </li>
                ))
              )}
            </ul>

            <div className="hidden md:block overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-200 text-base-content/60 border-b border-base-200">
                    <th className="font-semibold py-4">Name</th>
                    <th className="font-semibold py-4">Email</th>
                    <th className="font-semibold py-4">Balance</th>
                    <th className="font-semibold py-4 w-32 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-base-content/50">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr key={user.id} className="border-b border-base-100 hover:bg-base-200/50 transition-colors">
                        <td className="py-4 font-medium">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="py-4 text-secondary">{user.email}</td>
                        <td className="py-4 text-base-content/70">
                          {new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(
                            Number(user.balance) || 0,
                          )}
                        </td>
                        <td className="py-4 text-center">
                          <ActionButtons
                            onEdit={() => setModal({ isOpen: true, mode: "edit", user })}
                            onDelete={() => handleDelete(String(user.id))}
                            isPending={deleteMutation.isPending}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
        </div>
      </div>

      <UserModal
        isOpen={modal.isOpen}
        mode={modal.isOpen ? modal.mode : "create"}
        user={modal.isOpen && modal.mode === "edit" ? modal.user : null}
        onClose={() => setModal({ isOpen: false })}
        onSuccess={() => {}}
      />
    </>
  );
}
