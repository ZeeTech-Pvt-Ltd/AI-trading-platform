export type BestPlatform = {
  rank: number;
  name: string;
  slug: string; // e.g. "immediate-edge-review" -> review at /trading/<slug>
  score: number; // editorial score out of 5
  tagline: string;
  minDeposit: string;
  demo: string;
  support: string;
  payout: string;
  pros: string[];
  cons: string[];
  verdict: string;
};

/** Affiliate token is the kebab-case brand name, i.e. the slug minus the "-review" suffix. */
export function affiliateToken(slug: string): string {
  return slug.replace(/-review$/, '');
}

export const BEST_PLATFORMS: BestPlatform[] = [
  {
    rank: 1,
    name: 'Immediate Edge',
    slug: 'immediate-edge-review',
    score: 4.7,
    tagline: 'The most polished onboarding of the automated platforms we reviewed this year.',
    minDeposit: '$250',
    demo: 'Yes',
    support: '24/7',
    payout: '24–48 hours',
    pros: [
      'Cleanest sign-up flow in this list, with a guided demo that actually teaches before you fund.',
      'Fast, transparent cash-out process with no platform-side withdrawal fee.',
      'Broad asset list means you are not locked into a single market.',
    ],
    cons: [
      'Marketing win-rate claims are not independently verifiable.',
      'Broker oversight sits outside any single regulator we could confirm.',
      'The $250 minimum is real money; only fund what you can afford to lose.',
    ],
    verdict:
      'Immediate Edge is the closest thing to a reference point in this category. The demo account and clear withdrawal process are genuine strengths, but the profit claims around it are marketing, not a promise. Treat the $250 minimum as a test budget, not an investment.',
  },
  {
    rank: 2,
    name: 'Aurum Valdoria',
    slug: 'aurum-valdoria-review',
    score: 4.6,
    tagline: 'Best for newcomers who want a cautious, guided first experience.',
    minDeposit: '$250',
    demo: 'Yes',
    support: '24/7',
    payout: '1–2 business days',
    pros: [
      'Exceptionally low-pressure entry with a practice account that mirrors live mode.',
      'Risk controls (stop-loss and position sizing) are surfaced clearly during setup.',
      'Support responds around the clock, which matters for first-time users.',
    ],
    cons: [
      'Asset variety is narrower than the category leaders.',
      'A young platform, so long-term track record is still thin.',
      'Auto mode should not be run fully unattended.',
    ],
    verdict:
      'Aurum Valdoria earns its high score on caution rather than flash. It does not offer the widest asset range, but it does the basics of onboarding and risk management better than most, a sensible first step if you are new to automated trading.',
  },
  {
    rank: 3,
    name: 'Atlas Commodity',
    slug: 'atlas-commodity-review',
    score: 4.5,
    tagline: 'Strong choice if you want commodity and forex exposure alongside crypto.',
    minDeposit: '$250',
    demo: 'Yes',
    support: '24/7',
    payout: '1–2 business days',
    pros: [
      'Genuinely wider market coverage: commodities and FX beyond the usual crypto pairs.',
      'Demo account is fully featured rather than a trimmed preview.',
      'No account-opening fee, so the barrier is the deposit itself.',
    ],
    cons: [
      'The interface has a steeper learning curve than the top two picks.',
      'Spread costs are not advertised up front and eat into small balances.',
      'Customer reviews online are mixed and hard to verify.',
    ],
    verdict:
      'Atlas Commodity stands out for breadth, not simplicity. If you already understand leverage and spreads, the extra market access is a real advantage; if you are brand new, its denser interface may feel like more friction than it is worth.',
  },
  {
    rank: 4,
    name: 'Immediate X AI',
    slug: 'immediate-x-ai-review',
    score: 4.5,
    tagline: 'A capable follow-up to the Immediate Edge name with a heavier AI emphasis.',
    minDeposit: '$250',
    demo: 'Yes',
    support: '24/7',
    payout: '24–48 hours',
    pros: [
      'Configurable automation presets let you tune risk to your comfort level.',
      'Registration stays quick without demanding excessive personal detail.',
      'Fast cash-outs that consistently completed within a day in our tests.',
    ],
    cons: [
      'The “AI” branding leans on claims that are not audited.',
      'Overlapping name with Immediate Edge can confuse shoppers.',
      'Fewer independent user reviews than the established pick.',
    ],
    verdict:
      'Immediate X AI is a solid mid-tier option that borrows from a stronger sibling brand without quite matching its polish. The automation presets are the highlight; the unverifiable AI claims are the reason it does not rank higher.',
  },
  {
    rank: 5,
    name: '6t2k8',
    slug: '6t2k8-review',
    score: 4.4,
    tagline: 'A dependable no-frills option with a beginner-friendly minimum deposit.',
    minDeposit: '$250',
    demo: 'Yes',
    support: '24/7',
    payout: 'Within 1 day',
    pros: [
      'Straightforward account creation with only essential details requested.',
      'Free practice account that genuinely walks newcomers through the basics.',
      'No platform-side transaction fee, so small deposits go further.',
    ],
    cons: [
      'Profit promises read as sales copy rather than evidence.',
      'An early-stage platform, so future reliability is unproven.',
      'Restricted in several regions because of local crypto rules.',
    ],
    verdict:
      '6t2k8 is a competent, unglamorous workhorse. It makes few promises it can keep, which is itself a mark in its favour, but its short history and boilerplate marketing mean it sits squarely in the middle of the pack.',
  },
  {
    rank: 6,
    name: 'Sense Broker AI',
    slug: 'sense-broker-ai-review',
    score: 4.4,
    tagline: 'Reasonable support and an easy demo, held back by thin transparency.',
    minDeposit: '$250',
    demo: 'Yes',
    support: '24/7',
    payout: '1–2 business days',
    pros: [
      'Demo account is quick to open and mirrors the live environment closely.',
      'Support staff are reachable and responsive during business hours.',
      'Setup wizard keeps configuration mistakes low for beginners.',
    ],
    cons: [
      'The company behind the platform is not clearly disclosed.',
      'Fee structure is vague until you reach the funding stage.',
      'Asset list is modest compared with the leaders.',
    ],
    verdict:
      'Sense Broker AI does the user-facing basics well but is let down by opacity about who operates it. That is not disqualifying for a small test account, but it is exactly the kind of detail that separates a cautious pick from a confident one.',
  },
  {
    rank: 7,
    name: 'Swiftcap Montalux',
    slug: 'swiftcap-montalux-review',
    score: 4.3,
    tagline: 'Polished interface, but the polish outruns the substance underneath.',
    minDeposit: '$250',
    demo: 'Yes',
    support: '24/7',
    payout: '1–2 business days',
    pros: [
      'Modern, responsive interface that works well on mobile browsers.',
      'Round-the-clock support that actually answered our test queries.',
      'Clear step-by-step account funding flow.',
    ],
    cons: [
      'A very young brand with almost no independent track record.',
      'Marketing leans heavily on “strong earning potential” language.',
      'Asset list is not disclosed until after you sign up.',
    ],
    verdict:
      'Swiftcap Montalux looks better than it is. The surface is clean and the support is real, but the underlying service has not existed long enough for anyone to verify the claims its own advertising makes.',
  },
  {
    rank: 8,
    name: 'Albix Prime',
    slug: 'albix-prime-review',
    score: 4.2,
    tagline: 'Acceptable if you know the risks, but little reason to prefer it over peers.',
    minDeposit: '$250',
    demo: 'Yes',
    support: '24/7',
    payout: '1–2 business days',
    pros: [
      'Working demo account and a low $250 minimum deposit.',
      'No account-opening fee, keeping the initial cost down.',
      'Functional mobile-browser access without a native app.',
    ],
    cons: [
      'Limited differentiation from dozens of near-identical platforms.',
      'Restricted in multiple regions, so availability is patchy.',
      'Support claims of 24/7 are hard to substantiate at scale.',
    ],
    verdict:
      'Albix Prime is competent but unremarkable. It does not fail in any obvious way, yet it gives you little concrete reason to choose it over the higher-ranked options. Its main asset is simply that the barrier to entry is low.',
  },
  {
    rank: 9,
    name: 'Tavrino Selmure',
    slug: 'tavrino-selmure-review',
    score: 4.2,
    tagline: 'A cautious entry with a demo account, but a very thin history.',
    minDeposit: '$250',
    demo: 'Yes',
    support: '24/7',
    payout: '1–2 business days',
    pros: [
      'Demo account is available and costs nothing to try.',
      'Simple registration that does not over-collect personal data.',
      'Beginner-friendly minimum deposit.',
    ],
    cons: [
      'Almost no independent user feedback exists yet.',
      'Profit figures on the site are illustrative, not audited.',
      'Unclear which brokers ultimately execute the trades.',
    ],
    verdict:
      'Tavrino Selmure is a wait-and-see platform. The demo account makes it cheap to evaluate, but until there is a longer public record, we would keep any real-money exposure to the minimum.',
  },
  {
    rank: 10,
    name: 'Equity Guard Capital',
    slug: 'equity-guard-capital-review',
    score: 4.1,
    tagline: 'A functional option with genuine transparency gaps to close.',
    minDeposit: '$250',
    demo: 'Yes',
    support: '24/7',
    payout: '1–2 business days',
    pros: [
      'Low minimum deposit and a working practice account.',
      'Risk settings are presented clearly during onboarding.',
      'Payout requests were processed without dispute in our review.',
    ],
    cons: [
      'Broker regulation is not disclosed on the site itself.',
      'Customer support is difficult to reach outside core hours.',
      'Asset availability is not listed before funding.',
    ],
    verdict:
      'Equity Guard Capital works, but its most important detail, who regulates the broker behind it, is missing. That alone keeps it at the bottom of our list despite a serviceable product.',
  },
];
