import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";
import { cn } from "../lib/utils";

export function Card({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-panel backdrop-blur",
        className
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.35em] text-ember/80">{eyebrow}</p>
      <div className="space-y-1">
        <h2 className="font-display text-2xl text-white">{title}</h2>
        <p className="max-w-3xl text-sm text-slate-300">{description}</p>
      </div>
    </div>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-ink/80 px-4 py-3 text-sm text-white outline-none transition focus:border-ember/70 focus:ring-2 focus:ring-ember/20",
        className
      )}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-ink/80 px-4 py-3 text-sm text-white outline-none transition focus:border-ember/70 focus:ring-2 focus:ring-ember/20",
        className
      )}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-ink/80 px-4 py-3 text-sm text-white outline-none transition focus:border-ember/70 focus:ring-2 focus:ring-ember/20",
        className
      )}
    />
  );
}

export function Button({
  tone = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "muted" | "danger" }) {
  const tones = {
    primary: "bg-ember text-ink hover:bg-[#ffb04d]",
    muted: "bg-white/10 text-white hover:bg-white/15",
    danger: "bg-danger/90 text-white hover:bg-danger"
  };

  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        tones[tone],
        className
      )}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  const tones = {
    neutral: "bg-white/10 text-slate-200",
    success: "bg-signal/15 text-green-200",
    warning: "bg-ember/15 text-amber-200"
  };
  return <span className={cn("rounded-full px-3 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}
