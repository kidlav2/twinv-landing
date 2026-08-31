"use client";

import { useEffect, useRef, useState } from "react";
import { brief } from "@/lib/content";
import {
  isEmail,
  isPhone,
  submitBrief,
  type BriefBudget,
  type BriefGoal,
  type BriefSource,
} from "@/lib/brief";
import { Reveal } from "./reveal";
import { BriefShapes } from "./brief-shapes";

type FieldName =
  | "goal"
  | "message"
  | "name"
  | "email"
  | "phone"
  | "budget"
  | "source"
  | "sourceOther";
type Errors = Partial<Record<FieldName, string>>;

/**
 * The closing section: artwork on the left, the brief form on the right.
 * The split starts at `xl` so a laptop still gets both, not only a 27" monitor.
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
 * ARIA of our own. Budget and source are native <select>s — longer labels
 * than the goal chips, and a custom list would be a second dropdown language
 * on a form that otherwise uses the platform.
 */
export function Brief() {
  const [goal, setGoal] = useState<BriefGoal>(brief.goals[0].id as BriefGoal);
  const [site, setSite] = useState("");
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState<BriefBudget | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<BriefSource | "">("");
  const [sourceOther, setSourceOther] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">(
    "idle",
  );

  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

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
        setBudget("");
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!goal) next.goal = brief.errors.goal;
    if (!message.trim()) next.message = brief.errors.message;
    if (goal !== "demo" && !budget) next.budget = brief.errors.budget;
    if (!name.trim()) next.name = brief.errors.name;
    if (!email.trim()) next.email = brief.errors.email;
    else if (!isEmail(email)) next.email = brief.errors.emailFormat;
    if (!phone.trim()) next.phone = brief.errors.phone;
    else if (!isPhone(phone)) next.phone = brief.errors.phoneFormat;
    if (!source) next.source = brief.errors.source;
    else if (source === "other" && !sourceOther.trim()) {
      next.sourceOther = brief.errors.sourceOther;
    }
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
      phone: phone.trim(),
      ...(goal === "demo" ? {} : { budget: budget as BriefBudget }),
      source: source as BriefSource,
      sourceOther: source === "other" ? sourceOther.trim() : undefined,
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
  const inputField = `${field} min-h-11`;
  const label = "text-faint font-mono text-caption uppercase";

  return (
    <section
      id="contact"
      className="py-section lg:flex lg:min-h-[calc(100dvh-var(--nav-height))] lg:flex-col lg:justify-center"
    >
      <Reveal className="shell">
        <div className="grid items-center gap-10 xl:grid-cols-2 xl:gap-12">
          {/* Art first in the DOM so it sits left. Hidden only below xl —
              a 13–15" laptop is 1280–1512px, which is xl, not 2xl; parking
              the shapes behind 2xl left the form full-bleed on those
              screens and dropped the only motion in the section. */}
          <div className="reveal hidden xl:block">
            <BriefShapes />
          </div>

          <div>
            {state === "sent" ? (
              <div className="reveal max-w-[46ch]" role="status">
                <h2
                  ref={doneRef}
                  tabIndex={-1}
                  className="font-display text-heading-lg"
                >
                  {brief.success.headline}
                </h2>
                <p className="text-muted mt-5 text-sub">{brief.success.body}</p>
              </div>
            ) : (
              <>
                <div className="reveal max-w-[46ch]">
                  <p className={label}>{brief.eyebrow}</p>
                  <h2 className="font-display mt-3 text-heading-lg">
                    {brief.headline}
                  </h2>
                  <p className="text-muted mt-3 text-pretty text-sub">
                    {brief.sub}
                  </p>
                </div>

                <form
                  ref={formRef}
                  noValidate
                  onSubmit={onSubmit}
                  className="reveal mt-4 flex flex-col gap-3"
                >
                  <fieldset>
                    <legend className={label}>{brief.goalLegend}</legend>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {brief.goals.map((g, i) => (
                        <label key={g.id} className="cursor-pointer">
                          <input
                            type="radio"
                            name="goal"
                            value={g.id}
                            checked={goal === g.id}
                            data-field={i === 0 ? "goal" : undefined}
                            onChange={() => {
                              const next = g.id as BriefGoal;
                              setGoal(next);
                              const allowed =
                                next === "demo"
                                  ? []
                                  : brief.fields.budget.byGoal[next].map(
                                      (o) => o.id,
                                    );
                              if (!allowed.includes(budget)) setBudget("");
                            }}
                            className="peer sr-only"
                          />
                          {/* Same chip motif as Stack, one job further on: hairline
                          at rest, filled when chosen. */}
                          <span className="border-line-strong rounded-tag peer-checked:bg-fg peer-checked:text-canvas peer-checked:border-fg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 inline-flex min-h-11 items-center border px-4 py-2 text-body font-medium transition-colors duration-200">
                            {g.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <label htmlFor="brief-message" className={label}>
                      {prompt.label}
                    </label>
                    <textarea
                      id="brief-message"
                      data-field="message"
                      rows={3}
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
                      className={`mt-2 min-h-16 resize-y ${field}`}
                    />
                    <FieldError id="brief-message-e" message={errors.message} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
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
                        className={`mt-2 ${inputField}`}
                      />
                    </div>

                    {goal !== "demo" ? (
                      <FieldSelect
                        id="brief-budget"
                        field="budget"
                        label={brief.fields.budget.label}
                        placeholder={brief.fields.budget.placeholder}
                        value={budget}
                        options={brief.fields.budget.byGoal[goal]}
                        error={errors.budget}
                        className={inputField}
                        onChange={(value) => {
                          setBudget(value as BriefBudget | "");
                          clearIfFixed("budget", !!value);
                        }}
                      />
                    ) : null}

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
                        className={`mt-2 ${inputField}`}
                      />
                      <FieldError id="brief-name-e" message={errors.name} />
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
                        className={`mt-2 ${inputField}`}
                      />
                      <FieldError id="brief-email-e" message={errors.email} />
                    </div>

                    <div>
                      <label htmlFor="brief-phone" className={label}>
                        {brief.fields.phone.label}
                      </label>
                      <input
                        id="brief-phone"
                        data-field="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          clearIfFixed("phone", isPhone(e.target.value));
                        }}
                        placeholder={brief.fields.phone.placeholder}
                        aria-invalid={!!errors.phone}
                        aria-describedby={
                          errors.phone ? "brief-phone-e" : undefined
                        }
                        className={`mt-2 ${inputField}`}
                      />
                      <FieldError id="brief-phone-e" message={errors.phone} />
                    </div>

                    <FieldSelect
                      id="brief-source"
                      field="source"
                      label={brief.fields.source.label}
                      placeholder={brief.fields.source.placeholder}
                      value={source}
                      options={brief.fields.source.options}
                      error={errors.source}
                      className={inputField}
                      onChange={(value) => {
                        setSource(value as BriefSource | "");
                        if (value !== "other") {
                          setSourceOther("");
                          clearIfFixed("sourceOther", true);
                        }
                        clearIfFixed("source", !!value);
                      }}
                    />
                  </div>

                  {source === "other" ? (
                    <div>
                      <label htmlFor="brief-source-other" className={label}>
                        {brief.fields.source.other.label}
                      </label>
                      <input
                        id="brief-source-other"
                        data-field="sourceOther"
                        type="text"
                        value={sourceOther}
                        onChange={(e) => {
                          setSourceOther(e.target.value);
                          clearIfFixed("sourceOther", !!e.target.value.trim());
                        }}
                        placeholder={brief.fields.source.other.placeholder}
                        aria-invalid={!!errors.sourceOther}
                        aria-describedby={
                          errors.sourceOther
                            ? "brief-source-other-e"
                            : undefined
                        }
                        className={`mt-2 ${inputField}`}
                      />
                      <FieldError
                        id="brief-source-other-e"
                        message={errors.sourceOther}
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-5">
                    <button
                      type="submit"
                      disabled={state === "sending"}
                      className="btn-primary rounded-btn inline-flex min-h-11 items-center justify-center px-6 py-3 text-body font-medium transition-colors duration-200 disabled:opacity-60"
                    >
                      {state === "sending" ? brief.sending : brief.submit}
                    </button>
                    <p className="text-faint text-body-sm">{brief.note}</p>
                  </div>

                  {state === "failed" ? (
                    <p role="alert" className="text-body-sm text-fg">
                      {brief.errors.submit}
                    </p>
                  ) : null}
                </form>
              </>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-body-sm text-muted">
      {message}
    </p>
  );
}

function FieldSelect({
  id,
  field,
  label,
  placeholder,
  value,
  options,
  error,
  className,
  onChange,
}: {
  id: string;
  field: FieldName;
  label: string;
  placeholder: string;
  value: string;
  options: readonly { id: string; label: string }[];
  error?: string;
  className: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-e`;
  return (
    <div>
      <label
        htmlFor={id}
        className="text-faint font-mono text-caption uppercase"
      >
        {label}
      </label>
      <select
        id={id}
        data-field={field}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`brief-select mt-2 cursor-pointer ${className}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
