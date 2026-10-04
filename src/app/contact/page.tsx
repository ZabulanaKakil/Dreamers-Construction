"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { company } from "@/data/company";
import { WEB3FORMS_ACCESS_KEY } from "@/data/site-config";
import { Reveal } from "@/components/ui/Reveal";
import { FormField } from "@/components/ui/FormField";
import { FilterChip } from "@/components/ui/FilterChip";
import { FilterChipRow } from "@/components/ui/FilterChipRow";
import { PageHeader } from "@/components/ui/PageHeader";
import { PremiumTextarea } from "@/components/ui/PremiumTextarea";

const ENQUIRY_TYPES = [
  ["general", "General"],
  ["project", "Project / tender"],
  ["landowner", "Landowner"],
  ["buyer", "Buyer"],
] as const;

type EnquiryType = (typeof ENQUIRY_TYPES)[number][0];

function parseType(value: string | null): EnquiryType | null {
  return ENQUIRY_TYPES.some(([id]) => id === value) ? (value as EnquiryType) : null;
}

function typeLabel(type: EnquiryType): string {
  return ENQUIRY_TYPES.find(([id]) => id === type)?.[1] ?? "General";
}

type FormState = { name: string; email: string; phone: string; message: string };

function mailtoHref(type: EnquiryType, form: FormState): string {
  const subject = `${typeLabel(type)} enquiry from ${form.name}`;
  const body = [
    form.message,
    "",
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    form.phone ? `Phone: ${form.phone}` : "",
  ]
    .filter((line, i) => i < 2 || line)
    .join("\n");
  return `mailto:${company.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function ContactForm() {
  const searchParams = useSearchParams();
  const [pickedType, setType] = useState<EnquiryType | null>(null);
  const type = pickedType ?? parseType(searchParams.get("type")) ?? "general";
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "mailto">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!WEB3FORMS_ACCESS_KEY) {
      window.location.href = mailtoHref(type, form);
      setStatus("mailto");
      return;
    }

    const botcheck = new FormData(e.currentTarget).get("botcheck");
    if (botcheck) return;

    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `${typeLabel(type)} enquiry — ${company.name} website`,
          from_name: form.name,
          enquiry_type: typeLabel(type),
          ...form,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.message || "The message could not be sent.");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(
        `${err instanceof Error ? err.message : "The message could not be sent."} Please email or call us directly.`,
      );
    }
  };

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div>
        <PageHeader
          label="Contact"
          title="Get in Touch"
          intro="Reach out for project enquiries, tenders, landowner partnerships, or residential work."
        />

        <Reveal delay={0.1}>
          <div className="mt-10 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">Phone</p>
              <a
                href={company.contact.phoneHref}
                className="mt-1 block text-lg text-accent hover:underline"
              >
                {company.contact.phone}
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">Email</p>
              <a
                href={`mailto:${company.contact.email}`}
                className="mt-1 block break-all text-lg hover:text-accent"
              >
                {company.contact.email}
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">Address</p>
              <p className="mt-1 text-muted">{company.contact.address}</p>
              <div className="mt-3 overflow-hidden rounded-[var(--radius-md)] border border-border">
                <iframe
                  title="Dreamer's Construction office map"
                  src={company.contact.mapsEmbedUrl}
                  className="h-48 w-full border-0 sm:h-56"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <a
                href={company.contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-accent hover:underline"
              >
                Open in Google Maps / directions →
              </a>
            </div>
            <a
              href={company.contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-block"
            >
              WhatsApp
            </a>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.15}>
        <form onSubmit={handleSubmit} className="ui-panel p-5 sm:p-6">
          <div className="space-y-2">
            <span className="form-label mb-2 w-full">
              Enquiry type <span className="form-label-tag">[required]</span>
            </span>
            <FilterChipRow>
              {ENQUIRY_TYPES.map(([value, label]) => (
                <FilterChip key={value} active={type === value} onClick={() => setType(value)}>
                  {label}
                </FilterChip>
              ))}
            </FilterChipRow>
          </div>

          {status === "sent" || status === "mailto" ? (
            <div className="mt-8 py-8 text-center" role="status">
              <p className="font-semibold text-accent">
                {status === "sent" ? "Message sent — thank you" : "Your email app should open now"}
              </p>
              <p className="mt-2 text-sm text-muted">
                {status === "sent"
                  ? "We usually reply within 1–2 business days."
                  : `If it did not open, email us at ${company.contact.email}.`}
              </p>
              <button
                type="button"
                className="btn-outline btn-sm mt-6"
                onClick={() => {
                  setStatus("idle");
                  setForm({ name: "", email: "", phone: "", message: "" });
                }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              {error && (
                <p
                  className="mt-4 rounded-[var(--radius-md)] border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <input
                type="checkbox"
                name="botcheck"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
              />
              <div className="mt-8 space-y-4">
                <FormField label="Name" htmlFor="name" required>
                  <input
                    id="name"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="ui-input"
                  />
                </FormField>
                <FormField label="Email" htmlFor="email" required>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="ui-input"
                  />
                </FormField>
                <FormField label="Phone" htmlFor="phone">
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="ui-input"
                  />
                </FormField>
                <FormField label="Message" htmlFor="message" required>
                  <PremiumTextarea
                    id="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(value) => setForm({ ...form, message: value })}
                    maxWords={1000}
                    placeholder="Share your enquiry details..."
                  />
                </FormField>
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-primary mt-6 w-full"
              >
                {status === "sending" ? "Sending..." : "Send Enquiry"}
              </button>
              <div className="mt-6 border-t border-border pt-5 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  What happens next
                </p>
                <ol className="mt-3 space-y-2 text-sm text-muted">
                  <li>1. We review your enquiry and match it to the right team.</li>
                  <li>2. You receive a reply within 1–2 business days.</li>
                  <li>3. We schedule a call or site visit if needed.</li>
                </ol>
              </div>
            </>
          )}
        </form>
      </Reveal>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="page-band">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<p className="text-muted">Loading...</p>}>
          <ContactForm />
        </Suspense>
      </div>
    </div>
  );
}
