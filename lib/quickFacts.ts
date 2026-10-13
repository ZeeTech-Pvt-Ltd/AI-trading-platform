export type QuickFact = { label: string; value: string };

const DEPOSIT_LABELS = ['Initial Funding', 'Minimum Deposit', 'Minimum deposit', 'Starting Deposit', 'Entry Deposit', 'Starting Amount'];
const UNCONFIRMED =
  /could not (?:independently )?(?:confirm|verify)|couldn.t (?:verify|confirm)|not something we could confirm|no confirmed (?:operator|licen[cs]e|regulator)|operator and regulator|operator or regulator/i;

function text(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Three facts for the top of a review, read from the page's own content so they cannot drift:
 * minimum deposit, who it suits, and whether the operator and regulator could be confirmed.
 */
export function quickFacts(content: string): QuickFact[] {
  const facts: QuickFact[] = [];

  let deposit = '';
  for (const label of DEPOSIT_LABELS) {
    const m = content.match(new RegExp(`<td>${label}</td>\\s*<td>([\\s\\S]*?)</td>`));
    const v = m ? text(m[1]).match(/\$\s?\d[\d,]*(?:\.\d+)?/) : null;
    if (v) {
      deposit = v[0].replace(/\s/g, '');
      break;
    }
  }
  if (!deposit) {
    const m = text(content).match(/minimum (?:deposit|funding)[^$]{0,30}(\$\s?\d[\d,]*)/i);
    if (m) deposit = m[1].replace(/\s/g, '');
  }
  if (deposit) facts.push({ label: 'Minimum deposit', value: deposit });

  const aud = content.match(/bd-section--audience">\s*<h2[^>]*>[\s\S]*?<\/h2>\s*<p class="bd-text">([\s\S]*?)<\/p>([\s\S]*?)<\/section>/);
  if (aud) {
    let t = text(aud[1]);
    if (t.endsWith(':')) {
      const li = aud[2].match(/<li>([\s\S]*?)<\/li>/);
      const item = li ? text(li[1]) : '';
      t = item && /if you/i.test(t) ? `If you ${item.charAt(0).toLowerCase()}${item.slice(1)}` : item;
    }
    const first = t.split(/(?<=[.!?])\s/)[0]?.replace(/[.:]+$/, '') ?? '';
    if (first && first.length >= 12) {
      facts.push({ label: 'Best for', value: first.length > 110 ? first.slice(0, 107).trimEnd() + '...' : first });
    }
  }

  if (UNCONFIRMED.test(text(content))) {
    facts.push({ label: 'Operator and regulator', value: 'Not confirmed' });
  }
  return facts;
}
