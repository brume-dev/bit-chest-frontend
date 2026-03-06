export function CryptoAvatar({ abbr }: { abbr: string }) {
	// Simple colorful avatar based on abbreviation
	const colors: Record<string, string> = {
		BTC: "bg-amber-500",
		ETH: "bg-indigo-500",
		USDT: "bg-teal-500",
		SOL: "bg-purple-500",
		BNB: "bg-yellow-400",
		ADA: "bg-blue-500",
		XRP: "bg-sky-500",
	};
	const bg = colors[abbr] ?? "bg-neutral";
	return (
		<div
			className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}
		>
			<span className="text-white text-[10px] font-bold">
				{abbr.slice(0, 3)}
			</span>
		</div>
	);
}
