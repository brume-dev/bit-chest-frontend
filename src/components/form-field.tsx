import type { ReactNode } from "react";

interface Props {
  label: string;
  id: string;
  icon?: ReactNode;
  children: ReactNode;
}

// Wrapper form field component with label
export function Field({ label, id, icon, children }: Props) {
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
