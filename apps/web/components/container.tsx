import { cn } from "@/lib/utils";

export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...props} />;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("py-12 sm:py-16", className)}>
      {eyebrow && <p className="mb-3 text-sm font-medium text-brand">{eyebrow}</p>}
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
      {description && (
        <p className="mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">{description}</p>
      )}
    </header>
  );
}
