import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      {children}
      {hint ? <span className="text-faint mt-1 block text-caption">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`studio-field ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="studio-select-wrap">
      <select {...props} className={`studio-select ${props.className ?? ""}`} />
    </span>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
  );
}
