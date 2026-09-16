import {
  Gift,
  HeartHandshake,
  Send,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose the feeling",
    description:
      "Start with the kind of moment you want to create — birthday, love, gratitude, memories, or something harder to say.",
    icon: Gift,
  },
  {
    number: "02",
    title: "Make it yours",
    description:
      "Add their name, your words, favorite photos, and the small details that only mean something to the two of you.",
    icon: HeartHandshake,
  },
  {
    number: "03",
    title: "Send the surprise",
    description:
      "Once it is ready, you get a private link you can send when the moment feels right.",
    icon: Send,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 py-20 sm:py-28"
    >
      <div className="page-shell">
        <div className="max-w-2xl">
          <p className="script text-2xl text-rose">
            easy to make, lovely to open
          </p>

          <h2 className="serif mt-2 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
            From your idea to
            <span className="text-berry">
              {" "}their screen.
            </span>
          </h2>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                className={`
                  relative
                  overflow-hidden
                  rounded-[2rem_1.3rem_2.2rem_1.5rem]
                  border border-line
                  bg-paper
                  p-7
                  shadow-[var(--shadow-paper)]
                  sm:p-8
                  ${index === 1 ? "lg:translate-y-8" : ""}
                `}
              >
                <span className="absolute right-6 top-5 serif text-6xl font-semibold text-rose-soft/20">
                  {step.number}
                </span>

                <div className="grid size-12 place-items-center rounded-[45%_55%_50%_50%] bg-rose/10 text-berry">
                  <Icon
                    className="size-5"
                    strokeWidth={1.6}
                  />
                </div>

                <h3 className="serif mt-10 text-2xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-ink-soft">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}