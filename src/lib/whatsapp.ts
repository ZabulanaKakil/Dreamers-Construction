import { company } from "@/data/company";

/** Digits-only WhatsApp id from a wa.me URL or phone string. */
export function whatsappPhoneDigits(
  phoneOrUrl: string = company.contact.whatsapp,
): string {
  const fromUrl = phoneOrUrl.match(/wa\.me\/(\d+)/i)?.[1];
  if (fromUrl) return fromUrl;
  return phoneOrUrl.replace(/\D/g, "");
}

/** Build a WhatsApp deep link with optional prefilled message. */
export function buildWaLink(
  phone: string = company.contact.whatsapp,
  text?: string,
): string {
  const digits = whatsappPhoneDigits(phone);
  const base = `https://wa.me/${digits}`;
  if (!text?.trim()) return base;
  return `${base}?text=${encodeURIComponent(text.trim())}`;
}

export function listingWhatsAppText(opts: {
  title: string;
  href: string;
  siteOrigin?: string;
}): string {
  const origin =
    opts.siteOrigin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const url = opts.href.startsWith("http")
    ? opts.href
    : `${origin}${opts.href.startsWith("/") ? "" : "/"}${opts.href}`;
  return `Hi Dreamer's — I'm interested in ${opts.title}. ${url}`;
}
