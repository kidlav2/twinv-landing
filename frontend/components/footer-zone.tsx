import type { ReactNode } from "react";

/**
 * The carbon band the footer sits in. DESIGN.md: compact dark band, even
 * when the page above is canvas.
 *
 * Not a ScrollPanel, and not a nav-tone writer. The band is shorter than
 * the leftover viewport, so its top never reaches `--nav-height` — flipping
 * `data-nav-tone` here would paint a carbon bar over the light section still
 * sitting under the nav. Pages whose last zone is already black (terminal
 * ScrollPanel, AboutStage) keep that writer; this just continues the colour.
 */
export function FooterZone({
  children,
  dark = true,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className={dark ? "tone-dark bg-carbon" : undefined}>{children}</div>
  );
}
