/* ============================================================
   YHCIC — CONTENT CONFIGURATION
   Single source of truth for editable content.
   Replace values here; components read from window.YHCIC.
   ============================================================ */
window.YHCIC = {

  club: {
    name: "Young Harris College Investment Club",
    short: "YHCIC",
    college: "Young Harris College",
    location: "Young Harris, GA",
    year: "2026",
    tagline: "Student-led research. Long-term thinking.",
    footerWords: ["Discipline", "Perspective", "Progress"]
  },

  /* ---- Social / contact -----------------------------------
     Replace with real URLs. Placeholders are marked.        */
  social: {
    groupMe:   { label: "GroupMe",   href: "https://groupme.com/join_group/117609260/PAyikBkY", note: "Join the club conversation.",  placeholder: false },
    instagram: { label: "Instagram", href: "https://www.instagram.com/yhcinvestmentclub",           note: "Events, research and club activity.", placeholder: false },
    email:     { label: "Email",     href: "mailto:yhcic@yhc.edu",                                 note: "Reach the officer team.",        placeholder: true }
  },

  /* ---- Application form -----------------------------------
     endpoint: set to a POST URL (Formspree, Netlify, API…) to
     enable real submission. While null, the form validates and
     reports that no backend is connected — it never fakes a save. */
  application: {
    endpoint: "https://formspree.io/f/xkjgonaa",
    /* While endpoint is null the form opens the applicant's mail client
       with everything pre-filled and addressed here. Replace with the
       real officer inbox. */
    email: "yhcic@yhc.edu",
    graduationYears: ["2027", "2028", "2029", "2030", "2031"],
    interests: [
      "Equity Research",
      "Portfolio Strategy",
      "Financial Markets",
      "Data & Analytics",
      "Economics",
      "Leadership / Operations"
    ],
    referralSources: [
      "A friend or member",
      "Professor or advisor",
      "Club fair / campus event",
      "Instagram",
      "GroupMe",
      "This website",
      "Other"
    ]
  },

  /* ---- Market board -----------------------------------------
     isLive=false → static, labelled Illustrative — nothing is faked.
     To go live: create a free key at finnhub.io/register (no card,
     client-side CORS works out of the box), paste it as apiKey below,
     and set isLive to true. Every row then polls its `ticker` on
     refreshMs and the tag switches to Live automatically.
     Note: free-tier quote APIs don't expose raw index levels, so the
     two index rows track them via their benchmark ETFs (SPY for the
     S&P 500, QQQ for the Nasdaq-100) — standard practice, called out
     here for honesty.
     A client-side key is visible to anyone who views the page source —
     inherent to a no-backend static site. Use a free-tier key meant
     for exactly this, never a paid/high-limit one.               */
  market: {
    isLive: true,
    provider: "finnhub",
    apiKey: "danbtmpr01qr00orb2s0danbtmpr01qr00orb2sg",
    refreshMs: 60000,
    rows: [
      { symbol: "S&P 500", ticker: "SPY",  value: "5,137.08",  change: "+1.24%", dir: 1, spark: [12, 14, 11, 15, 18, 16, 21, 19, 24, 27] },
      { symbol: "NASDAQ",  ticker: "QQQ",  value: "16,274.94", change: "+0.93%", dir: 1, spark: [16, 13, 15, 14, 18, 17, 20, 23, 21, 26] },
      { symbol: "AAPL",    ticker: "AAPL", value: "189.32",    change: "+0.71%", dir: 1, spark: [10, 12, 12, 15, 13, 17, 16, 20, 22, 23] },
      { symbol: "MSFT",    ticker: "MSFT", value: "415.10",    change: "+0.62%", dir: 1, spark: [14, 12, 16, 15, 19, 18, 17, 22, 24, 25] }
    ]
  },

  /* ---- Goals: investment principles ---------------------- */
  goals: [
    { n: "01", stage: "Foundation", title: "Build financial literacy",      body: "A shared vocabulary for markets, instruments and risk — before anyone touches a thesis." },
    { n: "02", stage: "Method", title: "Develop research discipline",   body: "Structured work: sources, assumptions, valuation, and a written record that can be challenged." },
    { n: "03", stage: "Judgment", title: "Create investment conviction",  body: "Positions defended on evidence, sized to the strength of the argument, revisited when facts change." },
    { n: "04", stage: "Exposure", title: "Connect students with markets", body: "Live coverage, earnings cycles, macro releases and practitioners who work in them." },
    { n: "05", stage: "Compounding", title: "Build long-term skills",        body: "Analytical habits that outlast the club: modeling, judgment, communication, ownership." }
  ],

  /* ---- Projects ------------------------------------------ */
  projects: [
    { title: "Equity Research",     status: "In Development", code: "01 / RES", body: "Single-name coverage with written theses, valuation work and a committee review before publication.", href: "#projects" },
    { title: "Market Outlook",      status: "In Development", code: "02 / MAC", body: "A recurring read on rates, growth and positioning, written by members and archived each term.",        href: "#projects" },
    { title: "Investment Thesis",   status: "Planned",        code: "03 / THS", body: "Long-form arguments: the variant view, what has to be true, and what would prove us wrong.",           href: "#projects" },
    { title: "Portfolio Model",     status: "Planned",        code: "04 / PTF", body: "A tracked model portfolio with stated mandate, constraints and attribution reporting.",                href: "#projects" },
    { title: "Financial Education", status: "Active",         code: "05 / EDU", body: "Sessions for members with no finance background — statements, screening, and how markets clear.",     href: "#projects" },
    { title: "Data & Analytics",    status: "Active",         code: "06 / DAT", body: "Screening tools, return series and dashboards built by members studying analytics.",                   href: "#projects" }
  ],

  /* ---- Members (placeholder roster) ---------------------- */
  members: [
    { name: "Placeholder Name", role: "President",      major: "Finance",            focus: "Portfolio strategy",  linkedin: null },
    { name: "Placeholder Name", role: "Vice President", major: "Economics",          focus: "Macro & rates",       linkedin: null },
    { name: "Martín Ruales",    role: "Research Lead",  major: "Business Analytics", focus: "Data & equity research", linkedin: null },
    { name: "Placeholder Name", role: "Portfolio Lead", major: "Business",           focus: "Allocation & risk",   linkedin: null },
    { name: "Placeholder Name", role: "Analyst",        major: "Accounting",         focus: "Consumer & retail",   linkedin: null },
    { name: "Placeholder Name", role: "Analyst",        major: "Mathematics",        focus: "Quantitative screens", linkedin: null }
  ],

  /* ---- Locked modules under Portfolio & Research --------- */
  locked: [
    { title: "Portfolio Model",    state: "In Development",  body: "Mandate, constraints and holdings are being defined before anything is published." },
    { title: "Research Archive",   state: "Publishing Soon", body: "A permanent record of member research, indexed by sector and date." },
    { title: "Investment Theses",  state: "In Development",  body: "Members are building the club's first research releases." },
    { title: "Market Notes",       state: "Planned",         body: "Short-form observations tied to the week's releases and earnings." }
  ],

  /* ---- Decorative editorial metadata --------------------- */
  motifs: ["Q3 OUTLOOK", "LONG-TERM THINKING", "RESEARCH", "DISCIPLINE", "MARKETS", "CONVICTION", "RISK", "ALLOCATION", "THESIS", "DATA", "ANALYSIS"]
};
