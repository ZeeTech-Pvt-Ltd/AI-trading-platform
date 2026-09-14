/**
 * The reviewers shown on the homepage. This is intentionally EMPTY — populate
 * it with real, named people whose backgrounds are verifiable. Fabricated
 * reviewers on a financial review site are a liability, not a shortcut.
 */
export type Reviewer = {
  /** Full name — a real, verifiable person. */
  name: string;

  /** Role on the team, e.g. "Senior Editor" or "Regulatory Reporter". */
  role: string;

  /**
   * One-line, verifiable credential, e.g. "Former FX desk lead, 12 years in
   * regulated brokerage." Must be true and checkable.
   */
  credential: string;

  /**
   * Path or absolute URL to the reviewer's headshot. Rendered at a fixed
   * square size; supply a real photo, not a stock image.
   */
  photo: string;

  /**
   * Link to the reviewer's profile page. The existing author profile route
   * pattern is /author/<slug> — use that, or a path you'll build later.
   */
  profileUrl: string;

  /** Optional social or personal profile link (LinkedIn, X, personal site). */
  socialUrl?: string;
};

/** The list of reviewers (empty until real people are supplied). */
export const reviewers: Reviewer[] = [];
