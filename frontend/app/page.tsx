import { Nav } from "@/components/nav";
import { BackToTop } from "@/components/back-to-top";
import { Hero } from "@/components/hero";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ScrollPanel } from "@/components/scroll-panel";
import { Problem } from "@/components/problem";
import { Statement } from "@/components/statement";
import { Product } from "@/components/product";
import { Pillars } from "@/components/pillars";
import { Work } from "@/components/work";
import { Stack } from "@/components/stack";
import { Services } from "@/components/services";
import { Brief } from "@/components/brief";
import { Footer } from "@/components/footer";
import { FooterZone } from "@/components/footer-zone";

export default function Home() {
  return (
    <>
      {/* Nav (and BackToTop, same reason) is deliberately OUTSIDE
          SmoothScroll — see the note in components/smooth-scroll.tsx.
          Inside, it would stop being fixed. */}
      <Nav />
      <BackToTop />
      <SmoothScroll>
        <main>
          <Hero />

          {/* The black panel widens over the hero and holds the argument.
            Pillars is deliberately the last thing in it. */}
          <ScrollPanel tone="dark">
            <Problem />
            <Statement />
            <Product />
            <Pillars />
          </ScrollPanel>

          {/* …then the light panel does the same over the black, and the page
            returns to canvas for the proof and the offer. */}
          <ScrollPanel tone="light">
            <Work />
            <Stack />
            <Services />
            <Brief />
          </ScrollPanel>
        </main>
        {/* Dark band per DESIGN.md. Not inside the light ScrollPanel — a
            <footer> in a <section> would be that section's footer. The band
            is compact, so it never reaches the nav; the bar stays with the
            light panel still sitting under it. */}
        <FooterZone>
          <Footer flush />
        </FooterZone>
      </SmoothScroll>
    </>
  );
}
