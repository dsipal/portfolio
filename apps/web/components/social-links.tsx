import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FileTextIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { About } from "@/lib/schemas";

export function SocialLinks({ about, className }: { about: About | null; className?: string }) {
  const links = [
    { href: about?.github, label: "GitHub", icon: FaGithub },
    { href: about?.linkedIn, label: "LinkedIn", icon: FaLinkedin },
    { href: about?.resumeUrl, label: "Résumé", icon: FileTextIcon },
  ].filter((l): l is typeof l & { href: string } => Boolean(l.href));

  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {links.map(({ href, label, icon: Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Icon className="size-5" />
          </a>
        </li>
      ))}
    </ul>
  );
}
