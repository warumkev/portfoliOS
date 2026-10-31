"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";
import { PROFILE } from "@/config/profile";

type Status = "idle" | "sending" | "success" | "error";

export default function ContactApp() {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
          company: formData.get("company"),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="app-scroll h-full overflow-y-auto">
      <div className="mx-auto max-w-xl px-6 py-7 sm:px-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Get in touch</h1>
          <p className="text-muted">
            Or write directly to{" "}
            <a href={`mailto:${PROFILE.links.email}`} className="text-foreground underline-offset-2 hover:underline">
              {PROFILE.links.email}
            </a>
            .
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate={false}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="mb-1 block text-sm font-medium">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                maxLength={120}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1 block text-sm font-medium">
                E-mail
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={200}
                className="field"
              />
            </div>
          </div>
          <div>
            <label htmlFor="contact-message" className="mb-1 block text-sm font-medium">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={6}
              required
              maxLength={5000}
              className="field resize-y"
            />
          </div>
          {/* Honeypot: bots fill it, humans never see it. */}
          <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="contact-company">Company</label>
            <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={16} aria-hidden="true" />
            {status === "sending" ? "Sending…" : "Send message"}
          </button>
        </form>

        <div aria-live="polite" className="mt-4 min-h-10">
          <AnimatePresence mode="wait">
            {status === "success" && (
              <motion.p
                key="ok"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm"
              >
                <CheckCircle2 size={16} className="text-success" aria-hidden="true" />
                Thanks. Your message is on its way.
              </motion.p>
            )}
            {status === "error" && (
              <motion.p
                key="err"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm"
              >
                <AlertCircle size={16} className="text-destructive" aria-hidden="true" />
                Sending failed. Please try again or use e-mail.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
