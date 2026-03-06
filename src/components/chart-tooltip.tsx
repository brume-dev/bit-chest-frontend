interface Props {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

export function ChartTooltip({ active, payload, label }: Props) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-base-100 border border-base-200 rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-neutral">{label}</p>
      <p className="text-secondary font-bold">{payload[0].value} new users</p>
    </div>
  );
}
