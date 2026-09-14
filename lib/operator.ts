/**
 * The legal entity that operates this site, shown in the footer. Intentionally
 * EMPTY — the company name, registration number and registered address are
 * factual/legal details that must be supplied, not invented.
 */
export type OperatorEntity = {
  /** Registered company name of the operator. */
  companyName: string;
  /** Company/registration number, exactly as issued. */
  registrationNumber: string;
  /** Registered office address. */
  registeredAddress: string;
};

/**
 * The site operator. Empty until the real legal details are supplied. The
 * footer only renders this line when `companyName` is non-empty.
 */
export const operatorEntity: OperatorEntity = {
  companyName: '',
  registrationNumber: '',
  registeredAddress: '',
};
