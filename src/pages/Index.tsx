import { motion } from "framer-motion";
import { ArrowRight, BookOpen, HeartHandshake, ShieldCheck, Sparkles, Stethoscope, Users } from "lucide-react";

const services = [
  {
    title: "24/7 Compassionate Support",
    description: "Trained caregivers available day and night for medication reminders, mobility assistance, and personal care.",
    icon: HeartHandshake,
  },
  {
    title: "Health & Wellness Monitoring",
    description: "Daily wellness checks, fall-awareness routines, and structured activity plans that keep residents active and safe.",
    icon: Stethoscope,
  },
  {
    title: "Family Connected Care",
    description: "Clear family updates, progress notes, and direct communication so loved ones always stay informed.",
    icon: Users,
  },
];

const resources = [
  {
    title: "Aging in Place and Older Adults' Care",
    type: "Care Research",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9357416/",
  },
  {
    title: "Older Adults and Health Service Access",
    type: "Guide",
    href: "https://www.mdpi.com/1660-4601/21/5/539",
  },
  {
    title: "Home-Based Care and Policy Insights",
    type: "Family Resource",
    href: "https://www.healthaffairs.org/doi/10.1377/hlthaff.2020.01470",
  },
  {
    title: "Advances in Elderly Home Care Strategies",
    type: "Clinical Blog",
    href: "https://www.frontiersin.org/journals/medicine/articles/10.3389/fmed.2023.1251978/full",
  },
];

const gallery = [
  {
    src: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=1200&q=80",
    alt: "Caregiver smiling with an elderly resident",
  },
  {
    src: "https://images.unsplash.com/photo-1513673054901-2b5f51551112?auto=format&fit=crop&w=1200&q=80",
    alt: "Nurse helping a senior with daily activities",
  },
  {
    src: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80",
    alt: "Elderly residents socializing in a bright lounge",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-[28rem] w-[28rem] rounded-full bg-warning/25 blur-3xl" />
        <div className="absolute left-1/3 top-[38rem] h-80 w-80 rounded-full bg-success/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-heading font-extrabold tracking-tight sm:text-2xl">Guardian Companion</h1>
              <p className="text-xs text-muted-foreground">Dignified aging, heartfelt care</p>
            </div>
          </div>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Book A Visit
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      <main className="container space-y-20 pb-20 pt-8 sm:pt-14">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid gap-8 lg:grid-cols-2 lg:items-center"
        >
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-warning" />
              Premium Elderly Care Home
            </span>
            <h2 className="max-w-xl text-4xl font-heading font-extrabold leading-tight sm:text-5xl">
              A Beautiful Place To Age With Comfort, Safety, And Joy.
            </h2>
            <p className="max-w-xl text-lg text-muted-foreground">
              From personalized care plans to lively social activities, we help seniors thrive while families feel peace of mind.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:translate-y-[-1px]"
              >
                Explore Services
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#resources"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-6 py-3 font-semibold transition hover:bg-card"
              >
                Read Our Blogs
                <BookOpen className="h-4 w-4" />
              </a>
            </div>
            <div className="grid max-w-lg grid-cols-3 gap-3 pt-2 text-center">
              <div className="rounded-2xl border border-border bg-card/70 p-4">
                <p className="text-2xl font-heading font-extrabold">15+</p>
                <p className="text-xs text-muted-foreground">Years Experience</p>
              </div>
              <div className="rounded-2xl border border-border bg-card/70 p-4">
                <p className="text-2xl font-heading font-extrabold">98%</p>
                <p className="text-xs text-muted-foreground">Family Satisfaction</p>
              </div>
              <div className="rounded-2xl border border-border bg-card/70 p-4">
                <p className="text-2xl font-heading font-extrabold">24/7</p>
                <p className="text-xs text-muted-foreground">On-site Care</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-5 top-8 hidden h-24 w-24 rounded-2xl bg-warning/30 blur-2xl sm:block" />
            <div className="grid gap-4 sm:grid-cols-2">
              <img
                src={gallery[0].src}
                alt={gallery[0].alt}
                className="h-60 w-full rounded-3xl object-cover shadow-xl sm:h-full"
              />
              <div className="space-y-4">
                <img
                  src={gallery[1].src}
                  alt={gallery[1].alt}
                  className="h-40 w-full rounded-3xl object-cover shadow-lg"
                />
                <img
                  src={gallery[2].src}
                  alt={gallery[2].alt}
                  className="h-40 w-full rounded-3xl object-cover shadow-lg"
                />
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="services"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-3xl font-heading font-extrabold sm:text-4xl">Care Services Built Around Every Resident</h3>
            <ShieldCheck className="hidden h-9 w-9 text-success sm:block" />
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.article
                  key={service.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="group rounded-3xl border border-border bg-card/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h4 className="mb-3 text-xl font-heading font-bold">{service.title}</h4>
                  <p className="text-muted-foreground">{service.description}</p>
                </motion.article>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6 rounded-3xl border border-border bg-card/85 p-6 sm:p-10 lg:grid-cols-5"
        >
          <div className="lg:col-span-3">
            <h3 className="mb-3 text-3xl font-heading font-extrabold">Designed For Independence, Backed By Expert Care</h3>
            <p className="mb-6 text-muted-foreground">
              Every resident receives a personalized support plan with clinical oversight, joyful daily routines, and family-first communication.
            </p>
            <ul className="space-y-3 text-sm text-foreground">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                Licensed staff and emergency-ready protocols
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                Brain and body wellness programs every day
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                Weekly family updates and simple communication tools
              </li>
            </ul>
          </div>
          <div className="rounded-3xl bg-secondary p-6 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Start Your Care Journey</p>
            <p className="mt-3 text-2xl font-heading font-extrabold">Access Your Personalized Care Dashboard</p>
            <a
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 font-semibold text-background"
            >
              Login To Continue
            </a>
          </div>
        </motion.section>

        <motion.section
          id="resources"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Learning Hub</p>
              <h3 className="text-3xl font-heading font-extrabold">Blogs, Guides, And Family Resources</h3>
            </div>
            <a href="#contact" className="text-sm font-semibold text-primary hover:underline">
              Talk To Our Team
            </a>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {resources.map((item, index) => (
              <motion.a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="group rounded-2xl border border-border bg-card/75 p-5 transition hover:border-primary/50 hover:bg-card"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.17em] text-muted-foreground">{item.type}</p>
                <h4 className="mb-3 font-heading text-xl font-bold">{item.title}</h4>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Read article
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </motion.a>
            ))}
          </div>
        </motion.section>

        <section id="contact" className="rounded-3xl border border-border bg-foreground px-6 py-10 text-background sm:px-10">
          <p className="text-sm uppercase tracking-[0.2em] text-background/75">Visit Guardian Companion</p>
          <h3 className="mt-3 max-w-2xl text-3xl font-heading font-extrabold sm:text-4xl">
            Schedule A Tour And See Why Families Trust Our Care Home.
          </h3>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="mailto:hello@guardiancompanion.care" className="rounded-full bg-background px-6 py-3 font-semibold text-foreground">
              Email Us
            </a>
            <a href="tel:+18005551234" className="rounded-full border border-background/40 px-6 py-3 font-semibold text-background">
              Call Now
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
