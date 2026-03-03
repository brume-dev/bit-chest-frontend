import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export function UpdateProfileSection({ title, children }: Props) {
  return (
    <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6 space-y-4">
      <h2 className="text-sm font-bold text-neutral">{title}</h2>
      {children}
    </div>
  );
}
