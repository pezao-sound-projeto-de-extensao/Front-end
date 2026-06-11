export function StatusBadge({ text, type }) {
    const styles = {
        green: "bg-green-100 text-green-700",
        yellow: "bg-yellow-100 text-orange-700",
        red: "bg-red-100 text-red-700",
        outline: "bg-zinc-100 text-neutral-600"
    };

    return (
        <span className={`px-2 py-1 rounded-md text-xs font-bold ${styles[type]}`}>
            {text}
        </span>
    );
};