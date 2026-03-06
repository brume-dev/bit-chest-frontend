export function StatCard({
	label,
	value,
	sub,
	positive,
	icon: Icon,
}: {
	label: string;
	value: string;
	sub?: string | null;
	positive?: boolean | null;
	icon: React.ElementType;
}) {
	return (
		<div className="card bg-base-100 border border-base-200 shadow-sm p-5 flex flex-col gap-3">
			<div className="flex items-center gap-2 text-neutral/50">
				<Icon size={15} />
				<span className="text-xs font-medium uppercase tracking-widest">
					{label}
				</span>
			</div>
			<p className="text-2xl sm:text-3xl font-bold text-neutral">{value}</p>
			{sub !== undefined && sub !== null && (
				<span
					className={`text-xs font-semibold ${
						positive === true
							? "text-success"
							: positive === false
								? "text-error"
								: "text-neutral/40"
					}`}
				>
					{sub}
				</span>
			)}
		</div>
	);
}
