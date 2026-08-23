import { problem } from "@/lib/content";
import { Reveal } from "./reveal";

export function Problem() {
  return (
    <section id="process" className="py-32">
      <Reveal className="shell">
        <div className="grid gap-12 md:grid-cols-3 md:gap-10">
          {problem.items.map((item) => (
            <div key={item.key} className="reveal">
              <h2 className="font-display text-display">{item.key}</h2>
              <p className="text-fg mt-6 text-lead">{item.body}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
