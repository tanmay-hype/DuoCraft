import {
  LockKeyhole,
  Sparkles,
  UserRoundX,
} from "lucide-react";

const values = [
  {
    title: "Actually personal",
    description:
      "Your words, photos, names, memories, and details are what make the gift. The template is only the beginning.",
    icon: Sparkles,
  },
  {
    title: "No account required",
    description:
      "You should not need another password just to make someone smile. Start creating without signing up.",
    icon: UserRoundX,
  },
  {
    title: "Made to be private",
    description:
      "Finished gifts are shared through private, hard-to-guess links instead of public profile pages.",
    icon: LockKeyhole,
  },
];

export function WhyDuoCraft() {
  return (
    <section
      id="why-duocraft"
      className="scroll-mt-20 py-20 sm:py-28"
    >
      <div className="page-shell">
        <div
          className="
            overflow-hidden
            rounded-[2.5rem_1.5rem_3rem_1.8rem]
            bg-berry
            px-7
            py-12
            text-paper
            sm:px-12
            sm:py-16
            lg:px-16
          "
        >
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="script text-2xl text-champagne-soft">
                why DuoCraft?
              </p>

              <h2
                className="
                  serif
                  mt-3
                  max-w-md
                  text-4xl
                  font-semibold
                  leading-[1.02]
                  tracking-[-0.045em]
                  sm:text-5xl
                "
              >
                Because meaningful shouldn&apos;t feel
                mass-produced.
              </h2>

              <p className="mt-6 max-w-md leading-7 text-paper/70">
                We give you the structure. You bring the
                part nobody else can copy: your story.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {values.map((value) => {
                const Icon = value.icon;

                return (
                  <article
                    key={value.title}
                    className="
                      rounded-[1.5rem_1rem_1.8rem_1.2rem]
                      border border-paper/10
                      bg-paper/5
                      p-6
                    "
                  >
                    <Icon
                      className="size-6 text-champagne-soft"
                      strokeWidth={1.5}
                    />

                    <h3 className="serif mt-7 text-xl font-semibold">
                      {value.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-paper/65">
                      {value.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}