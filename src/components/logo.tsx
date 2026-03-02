import { Wallet } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-3 px-6 py-8">
      <div className="p-2 bg-primary rounded-lg text-primary-content">
        <Wallet size={24} />
      </div>
      <span className="text-xl font-bold tracking-tight">Bit Chest</span>
    </div>
  );
}
