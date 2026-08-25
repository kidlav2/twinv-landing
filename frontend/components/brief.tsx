"use client";

import { useEffect, useRef, useState } from "react";
import { brief } from "@/lib/content";
import { isEmail, submitBrief, type BriefGoal } from "@/lib/brief";
import { Reveal } from "./reveal";
import { BriefShapes } from "./brief-shapes";

type FieldName = "goal" | "message" | "name" | "email";
type Errors = Partial<Record<FieldName, string>>;

/**
 * The closing section: artwork on the left, the brief form on the right.
 *
 * It carries `id="contact"` because it IS the contact section now. It replaced
 * a pair of cards — "Start a project" and "About us" — that sat here before.
 * The first was a button that led to this very form, so the page asked twice
 * for the same thing; the second has moved out to a future /about page. Every
 * "start a project" / "book a demo" / pillar / service link lands here.
 *
 * Knows nothing about transport — `submitBrief` in lib/brief.ts owns that, and
 * `app/api/brief/route.ts` owns where it lands (Gmail on Vercel, FastAPI in
 * local dev). This file is UX only: what is asked, in what order, and what
 * happens when it goes wrong. The message field's title and placeholder come
 * from `brief.goals[].prompt` for the selected goal — the copy lives in
 * lib/content.ts, not here.
 *
 * The goal is a real radio group rather than styled buttons, so arrow keys
 * move between options and a screen reader announces "2 of 4" without any
 * ARIA of our own.
 */
export function Brief() {
  const [goal, setGoal] = useState<BriefGoal>(brief.goals[0].id as BriefGoal);
  const [site, setSite] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">(
    "idle",
  );

  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLParagraphElement>(null);

  /**
   * "Book a demo" in the nav points at this section and carries
   * data-brief-goal, so arriving from it lands on the matching option instead
   * of the default. A delegated listener rather than routing state: the link
   * is a plain in-page anchor and the smooth-scroll handler already owns its
   * click.
   */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-brief-goal]");
      const wanted = el?.getAttribute("data-brief-goal");
      if (wanted && brief.goals.some((g) => g.id === wanted)) {
        setGoal(wanted as BriefGoal);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!goal) next.goal = brief.errors.goal;
    if (!message.trim()) next.message = brief.errors.message;
    if (!name.trim()) next.name = brief.errors.name;
    if (!email.trim()) next.email = brief.errors.email;
    else if (!isEmail(email)) next.email = brief.errors.emailFormat;
    return next;
  };

  /** Once a field has complained, it re-checks as you type — but a field that
   *  has not complained yet stays quiet until submit. Validating everything on
   *  every keystroke shouts at people who are simply not finished. */
  const clearIfFixed = (field: FieldName, ok: boolean) => {
    setErrors((prev) => {
      if (!prev[field] || !ok) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0] as FieldName;
      formRef.current
        ?.querySelector<HTMLElement>(`[data-field="${first}"]`)
        ?.focus();
      return;
    }

    setState("sending");
    const result = await submitBrief({
      goal,
      site: site.trim() || undefined,
      message: message.trim(),
      name: name.trim(),
      email: email.trim(),
    });
    setState(result.ok ? "sent" : "failed");
  };

  // Success replaces the form, so focus has to be moved deliberately or it is
  // left on a button that no longer exists.
  useEffect(() => {
    if (state === "sent") doneRef.current?.focus();
  }, [state]);

  const prompt =
    brief.goals.find((g) => g.id === goal)?.prompt ?? brief.goals[0].prompt;

  const field =
    "bg-paper border-line-strong rounded-btn text-fg w-full border px-4 py-3 text-body";
  const label = "text-faint font-mono text-caption uppercase";

  return (
    <section id="contact" className="py-section">
      <Reveal className="shell">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Art first in the DOM so it sits left without order utilities. It
              is aria-hidden and holds nothing focusable, so reading order and
              tab order are unaffected. Hidden below lg: at the foot of a phone
              screen the form should be the whole section, not a decoration
              the reader has to scroll past. */}
          <div className="reveal hidden lg:block">
            <BriefShapes />
          </div>

          <div>
            <div className="reveal max-w-[46ch]">
              <p className={label}>{brief.eyebrow}</p>
              <h2 className="font-display mt-6 text-heading-lg">
                {brief.headline}
              </h2>
              <p className="text-muted mt-5 text-sub">{brief.sub}</p>
            </div>

            {state === "sent" ? (
              <div className="reveal mt-10 max-w-[46ch]">
                <p
                  ref={doneRef}
                  tabIndex={-1}
                  role="status"
                  className="font-display text-heading"
                >
                  {brief.success.headline}
                </p>
                <p className="text-muted mt-4 text-sub">{brief.success.body}</p>
              </div>
            ) : (
              <form
                ref={formRef}
                noValidate
                onSubmit={onSubmit}
                className="reveal mt-10 flex flex-col gap-8"
              >
                <fieldset>
                  <legend className={label}>{brief.goalLegend}</legend>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {brief.goals.map((g, i) => (
                      <label key={g.id} className="cursor-pointer">
                        <input
                          type="radio"
                          name="goal"
                          value={g.id}
                          checked={goal === g.id}
                          data-field={i === 0 ? "goal" : undefined}
                          onChange={() => setGoal(g.id as BriefGoal)}
                          className="peer sr-only"
                        />
                        {/* Same chip motif as Stack, one job further on: hairline
                        at rest, filled when chosen. */}
                        <span className="border-line-strong rounded-tag peer-checked:bg-fg peer-checked:text-canvas peer-checked:border-fg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 inline-flex items-center border px-6 py-3 text-body font-medium transition-colors duration-200">
                          {g.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="brief-site" className={label}>
                    {brief.fields.site.label}{" "}
                    <span className="text-faint normal-case">
                      ({brief.fields.site.hint})
                    </span>
                  </label>
                  <input
                    id="brief-site"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    placeholder={brief.fields.site.placeholder}
                    className={`mt-3 ${field}`}
                  />
                </div>

                <div>
                  <label htmlFor="brief-message" className={label}>
                    {prompt.label}
                  </label>
                  <textarea
                    id="brief-message"
                    data-field="message"
                    rows={4}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      clearIfFixed("message", !!e.target.value.trim());
                    }}
                    placeholder={prompt.placeholder}
                    aria-invalid={!!errors.message}
                    aria-describedby={
                      errors.message ? "brief-message-e" : undefined
                    }
                    className={`mt-3 resize-y ${field}`}
                  />
                  {errors.message && (
                    <p
                      id="brief-message-e"
                      role="alert"
                      className="mt-2 text-body-sm text-muted"
                    >
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Two-up on a full-width tablet, back to one at lg where this
                column is only half the shell, two-up again at xl once it is
                wide enough to hold them. */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div>
                    <label htmlFor="brief-name" className={label}>
                      {brief.fields.name.label}
                    </label>
                    <input
                      id="brief-name"
                      data-field="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearIfFixed("name", !!e.target.value.trim());
                      }}
                      aria-invalid={!!errors.name}
                      aria-describedby={
                        errors.name ? "brief-name-e" : undefined
                      }
                      className={`mt-3 ${field}`}
                    />
                    {errors.name && (
                      <p
                        id="brief-name-e"
                        role="alert"
                        className="mt-2 text-body-sm text-muted"
                      >
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="brief-email" className={label}>
                      {brief.fields.email.label}
                    </label>
                    <input
                      id="brief-email"
                      data-field="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearIfFixed("email", isEmail(e.target.value));
                      }}
                      aria-invalid={!!errors.email}
                      aria-describedby={
                        errors.email ? "brief-email-e" : undefined
                      }
                      className={`mt-3 ${field}`}
                    />
                    {errors.email && (
                      <p
                        id="brief-email-e"
                        role="alert"
                        className="mt-2 text-body-sm text-muted"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5">
                  <button
                    type="submit"
                    disabled={state === "sending"}
                    className="btn-primary rounded-btn inline-flex items-center justify-center px-6 py-4 text-body font-medium transition-colors duration-200 disabled:opacity-60"
                  >
                    {state === "sending" ? brief.sending : brief.submit}
                  </button>
                  <p className="text-faint text-body-sm">{brief.note}</p>
                </div>

                {state === "failed" && (
                  <p role="alert" className="text-body-sm text-fg">
                    {brief.errors.submit}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
