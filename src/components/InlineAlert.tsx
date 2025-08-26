"use client";

export function InlineAlert({
  kind,
  children,
}: {
  kind: "success" | "error";
  children: React.ReactNode;
}) {
  const cls =
    kind === "success"
      ? "border-green-200 bg-green-50 text-green-800"
      : "border-red-200 bg-red-50 text-red-700";
  return (
    <div className={`mb-4 rounded-md border px-3 py-2 text-sm ${cls}`}>{children}</div>
  );
}
