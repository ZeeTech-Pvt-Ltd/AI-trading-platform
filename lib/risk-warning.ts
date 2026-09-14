/**
 * Per-market risk warnings for the footer. This is intentionally EMPTY — the
 * wording is standing legal text that has to be accurate for each market's
 * regulator, so it must be supplied, not invented.
 */
export type RiskWarning = {
  /**
   * Market key this wording applies to. Use lower-case keys: "uk", "au", "eu",
   * "us", "ca", "za", "in". Include one entry with the key "default" for routes
   * that have no market (the current homepage).
   */
  market: string;

  /**
   * Standing risk warning for this market. E.g. FCA framing for "uk", ASIC for
   * "au", ESMA for "eu", "not available to US residents" for "us". Legal text —
   * write it to match the market's actual requirements.
   */
  text: string;
};

/**
 * Per-market risk warnings. Empty until the legal wording is supplied. The
 * footer looks up the route's market and falls back to the "default" entry.
 */
export const riskWarnings: RiskWarning[] = [];
