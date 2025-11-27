// src/components/ui/Spinner.tsx

interface SpinnerProps {
  size?: "sm" | "md";
}

export function Spinner({ size = "md" }: SpinnerProps) {
  const dimension = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div
      className={`inline-block ${dimension} animate-spin rounded-full border-2 border-brand-500 border-t-transparent`}
      aria-label="Cargando"
    />
  );
}
