import "server-only";
import { createElement } from "react";
import type { IconType } from "react-icons";
import * as fa6 from "react-icons/fa6";

const icons = fa6 as unknown as Record<string, IconType | undefined>;

const pascal = (name: string) =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

/**
 * Component name for an icon picked with the CMS fontawesome field, which
 * stores "<style> <name>" ("fa-solid code", "fa-brands github",
 * "fa-regular star"). Solid and brand icons share the `Fa` prefix in
 * react-icons/fa6; regular ones are `FaReg`.
 */
export function faIconName(value: string | null | undefined) {
  const [style, name] = value?.trim().split(/\s+/) ?? [];
  if (!name) return null;
  const prefix =
    style === "fa-regular" ? "FaReg" : style === "fa-solid" || style === "fa-brands" ? "Fa" : null;
  return prefix ? `${prefix}${pascal(name)}` : null;
}

/** The react-icons component for a CMS icon value, or undefined when it doesn't exist */
export function resolveFaIcon(value: string | null | undefined) {
  const name = faIconName(value);
  return name ? icons[name] : undefined;
}

/** Renders a CMS-picked Font Awesome icon on the server; unknown values render nothing */
export function FaIcon({ value, className }: { value: string | null | undefined; className?: string }) {
  const Icon = resolveFaIcon(value);
  // A lookup in a static module, not a component created per render
  return Icon ? createElement(Icon, { "aria-hidden": true, className }) : null;
}
