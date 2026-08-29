"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { work } from "@/lib/content";
import { isDocumentVisible, MOTION_OK } from "@/lib/motion";
import type { WorkCase, WorkFamily } from "@/lib/work";
import { familyLayers } from "@/lib/work";
import { Reveal } from "./reveal";
import { ScrollPanel } from "./scroll-panel";
import { ButtonGhost, ButtonPrimary, Tag, TextLink } from "./ui";
import { WorkLive, hostOf } from "./work-live";
import { CaseBeat, CaseTimeline } from "./case-timeline";
import { CaseGallery } from "./case-gallery";

gsap.registerPlugin(ScrollTrigger);

function motionOk() {
  return isDocumentVisible() && window.matchMedia(MOTION_OK).matches;
}

function BackChevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[0.6em] w-[0.6em] shrink-0"
      aria-hidden
    >
      <path d="M15.5 4.5 8 12l7.5 7.5" />
    </svg>
  );
}

function VoltageLead({ text }: { text: string }) {
  const match = /^(\S+\s+\S+)([\s\S]*)$/.exec(text);
  if (!match) return text;
  return (
    <>
      <span className="text-voltage">{match[1]}</span>
      {match[2]}
    </>
  );
}

function CaseBeats({ project }: { project: WorkCase }) {
  return (
    <>
      <CaseTimeline>
        <CaseBeat title={work.beats.problem}>
          <p className="text-muted max-w-[46ch] text-body">
            <VoltageLead text={project.task} />
          </p>
        </CaseBeat>

        <CaseBeat title={work.beats.did}>
          {project.approach.map((step) => (
            <div
              key={step.label}
              className="border-line border-t py-8 first:border-t-0 first:pt-0 last:pb-0"
            >
              <h3 className="font-display text-heading-sm">{step.label}</h3>
              <p className="text-muted mt-4 max-w-[46ch] text-body">{step.body}</p>
            </div>
          ))}
        </CaseBeat>

        <CaseBeat title={work.beats.changed}>
          <p className="text-fg max-w-[46ch] text-body">{project.outcome}</p>
          {project.outcomeFacts.map((fact) => (
            <div
              key={fact.label}
              className="border-line mt-10 max-w-[46ch] border-t pt-8 first-of-type:mt-12"
            >
              <p className="font-display text-heading-lg">{fact.value}</p>
              <p className="text-muted mt-3 font-mono text-caption uppercase">
                {fact.label}
              </p>
            </div>
          ))}
        </CaseBeat>

        <CaseBeat title={work.beats.stack}>
          <ul>
            {project.stack.map((tool) => (
              <li
                key={tool}
                className="border-line text-muted border-t py-5 font-mono text-caption uppercase first:border-t-0 first:pt-0"
              >
                {tool}
              </li>
            ))}
          </ul>
        </CaseBeat>
      </CaseTimeline>

      <CaseGallery
        slug={project.slug}
        heading={work.frames}
        shots={[project.image, ...project.gallery].filter(Boolean)}
      />
    </>
  );
}

/**
 * One engagement as a normal case page. The mint tag is the hub itself
 * (SaaS). Ash tags to the right swap in the low-level case for that surface.
 * The switcher is inside the fading stage so it leaves and comes back with
 * the rest of the material, mint on the new layer.
 */
export function WorkHub({ family }: { family: WorkFamily }) {
  const layers = familyLayers(family);
  const [active, setActive] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const beatsRef = useRef<HTMLDivElement>(null);
  const tweening = useRef(false);
  const skipTween = useRef(true);

  const targets = () =>
    [stageRef.current, beatsRef.current].filter(
      (el): el is HTMLDivElement => Boolean(el),
    );

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    const index = layers.findIndex((layer) => layer.id === id);
    if (index >= 0 && index !== active) {
      skipTween.current = true;
      setActive(index);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (skipTween.current) {
      skipTween.current = false;
      tweening.current = false;
      return;
    }

    const els = targets();
    if (!els.length) {
      tweening.current = false;
      return;
    }

    if (!motionOk()) {
      gsap.set(els, { clearProps: "opacity,visibility,transform" });
      tweening.current = false;
      ScrollTrigger.refresh();
      return;
    }

    gsap.fromTo(
      els,
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        ease: "power3.out",
        overwrite: true,
        onComplete: () => {
          gsap.set(els, { clearProps: "opacity,visibility,transform" });
          tweening.current = false;
          ScrollTrigger.refresh();
          const tag = document.getElementById(`hub-layer-${layers[active].id}`);
          const focus = document.activeElement;
          if (
            tag &&
            (focus === document.body ||
              (focus instanceof HTMLElement &&
                focus.id.startsWith("hub-layer-")))
          ) {
            tag.focus();
          }
        },
      },
    );

    return () => {
      gsap.killTweensOf(els);
    };
  }, [active]);

  const go = (index: number) => {
    if (index === active || tweening.current) return;
    const id = layers[index]?.id;
    if (id) window.history.replaceState(null, "", `#${id}`);

    const els = targets();
    if (!els.length || !motionOk()) {
      setActive(index);
      return;
    }

    tweening.current = true;
    gsap.to(els, {
      autoAlpha: 0,
      y: 20,
      duration: 0.32,
      ease: "power3.out",
      overwrite: true,
      onComplete: () => setActive(index),
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = layers.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown")
      next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    go(next);
    document.getElementById(`hub-layer-${layers[next].id}`)?.focus();
  };

  const layer = layers[active];
  if (!layer) return null;
  const project = layer.project;
  const kicker =
    family.kind === "self" ? "Self-initiated" : family.sector;
  const host = hostOf(project.url);

  return (
    <>
      <section className="min-h-[88svh] overflow-x-clip pt-[calc(var(--spacing-nav)+24px)] pb-section">
        <Reveal className="shell">
          <Link
            href="/work"
            className="reveal font-display text-faint hover:text-fg inline-flex items-center gap-3 text-heading-sm transition-colors"
          >
            <BackChevron />
            {work.more}
          </Link>
        </Reveal>

        <div className="shell mt-12 lg:mt-16">
          <div
            ref={stageRef}
            className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12"
          >
            <div className="lg:col-span-7">
              <WorkLive item={project} reveal={false} />
              <div className="mt-6 lg:hidden">
                <ButtonGhost href={project.url} external className="w-full">
                  {`${work.visit} · ${host}`}
                </ButtonGhost>
              </div>
            </div>

            <div className="lg:col-span-5">
              <p className="text-faint font-mono text-caption uppercase">
                {kicker} · {family.year}
                {family.client ? ` · ${family.client}` : ""}
              </p>
              <h1 className="font-display mt-6 max-w-[16ch] text-heading-lg">
                {project.title}
              </h1>
              <p className="text-fg mt-8 max-w-[46ch] text-lead">
                {project.summary}
              </p>

              <div
                role="tablist"
                aria-label={work.layers.legend}
                onKeyDown={onKeyDown}
                className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-3"
              >
                {layers.map((item, i) => {
                  const on = i === active;
                  return (
                    <Tag
                      key={item.id}
                      muted={!on}
                      selected={on}
                      id={`hub-layer-${item.id}`}
                      tabIndex={on ? 0 : -1}
                      onClick={() => go(i)}
                    >
                      {item.label}
                    </Tag>
                  );
                })}
                <span className="text-faint font-mono text-caption uppercase">
                  {project.role}
                </span>
              </div>

              <div className="mt-8 hidden lg:block">
                <TextLink href={project.url} external>
                  {`${work.visit} · ${host}`}
                </TextLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ScrollPanel tone="dark" terminal cursor={false}>
        <section className="py-section">
          <div ref={beatsRef} className="shell">
            <CaseBeats project={project} />
          </div>
        </section>

        <section className="py-section-lg">
          <Reveal className="shell">
            <h2 className="reveal font-display max-w-[18ch] text-heading-lg">
              {work.close.headline}
            </h2>
            <p className="reveal text-muted mt-8 max-w-[46ch] text-lead">
              {work.close.body}
            </p>
            <div className="reveal mt-12">
              <ButtonPrimary href={work.close.cta.href}>
                {work.close.cta.label}
              </ButtonPrimary>
            </div>
          </Reveal>
        </section>
      </ScrollPanel>
    </>
  );
}
