/**
 * The evaluation criteria that the homepage "How we review" summary and the
 * full methodology page both read. Keeping them in this single file means the
 * two can never drift apart.
 *
 * This list is intentionally empty — the criteria will be filled in by the
 * editorial team. Add entries that reflect what we actually test; do not claim
 * a methodology we don't follow.
 */
export type MethodologyCriterion = {
  /**
   * Short label for the criterion, shown on both the summary and the full page
   * (for example: "Transparency", "Safety", "Fees", "Withdrawals").
   */
  label: string;

  /**
   * One-line description of what we check under this criterion. Used verbatim
   * in the summary; the full page can expand on it in its own prose.
   */
  description: string;
};

/** The shared list of evaluation criteria (empty until written). */
export const methodologyCriteria: MethodologyCriterion[] = [];
