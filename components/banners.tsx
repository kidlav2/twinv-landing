import { banners } from "@/lib/content";
import { ButtonPrimary, ButtonGhost, SectionLabel } from "./ui";
import { Reveal } from "./reveal";

export function Banners() {
  const { primary, secondary } = banners;

  return (
    <section id="contact" className="py-section">
      <Reveal className="shell">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* A dark surface inside a light zone: marking it `tone-dark` flips the
              text roles and the button fill without any per-element overrides. */}
          <div className="reveal tone-dark bg-carbon rounded-card flex flex-col p-8 sm:p-12">
            <SectionLabel>{primary.eyebrow}</SectionLabel>
            <h2 className="font-display mt-6 text-heading">
              {primary.headline}
            </h2>
            <p className="text-muted mt-5 flex-1 text-sub">{primary.body}</p>
            <div className="mt-10">
              <ButtonPrimary href={primary.cta.href}>
                {primary.cta.label}
              </ButtonPrimary>
            </div>
          </div>

          <div
            id="about"
            className="reveal bg-paper rounded-card flex flex-col p-8 sm:p-12"
          >
            <SectionLabel>{secondary.eyebrow}</SectionLabel>
            <h2 className="font-display mt-6 text-heading">
              {secondary.headline}
            </h2>
            <p className="text-muted mt-5 flex-1 text-sub">{secondary.body}</p>
            <div className="mt-10">
              <ButtonGhost href={secondary.cta.href}>
                {secondary.cta.label}
              </ButtonGhost>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
