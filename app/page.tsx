import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ScrollPanel } from "@/components/scroll-panel";
import { Problem } from "@/components/problem";
import { Statement } from "@/components/statement";
import { Product } from "@/components/product";
import { Pillars } from "@/components/pillars";
import { Cases } from "@/components/cases";
import { Stack } from "@/components/stack";
import { Services } from "@/components/services";
import { Banners } from "@/components/banners";
import { Brief } from "@/components/brief";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      {/* Nav is deliberately OUTSIDE SmoothScroll — see the note in
          components/smooth-scroll.tsx. Inside, it would stop being fixed. */}
      <Nav />
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
            <Cases />
            <Stack />
            <Services />
            <Banners />
            <Brief />
          </ScrollPanel>
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
