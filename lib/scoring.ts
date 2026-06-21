type ScoringInput = {
  revenue?: string | null;
  profit?: string | null;
  financingNeed?: boolean | null;
  maNeed?: boolean | null;
  summitInterest?: boolean | null;
  paidAssessmentInterest?: boolean | null;
  bossDemand?: string | null;
};

function parseAmount(value?: string | null) {
  if (!value) return 0;
  const normalized = value.replace(/,/g, "").trim();
  const match = normalized.match(/[\d.]+/);
  if (!match) return 0;
  const number = Number(match[0]);
  if (Number.isNaN(number)) return 0;
  if (normalized.includes("亿")) return number * 10000;
  if (normalized.includes("万")) return number;
  return number;
}

export function scoreClient(input: ScoringInput) {
  let score = 20;
  const revenue = parseAmount(input.revenue);
  const profit = parseAmount(input.profit);

  if (revenue >= 3000) score += 18;
  else if (revenue >= 1000) score += 10;
  if (profit >= 300) score += 14;
  else if (profit > 0) score += 7;
  if (input.maNeed) score += 18;
  if (input.financingNeed) score += 10;
  if (input.summitInterest) score += 12;
  if (input.paidAssessmentInterest) score += 15;
  if (input.bossDemand && /退出|并购|入股|融资|接班|转型|上市|国资/.test(input.bossDemand)) score += 10;

  const closeProbability = Math.min(95, score);
  const level = closeProbability >= 70 ? "A" : closeProbability >= 45 ? "B" : "C";
  return { level, closeProbability };
}
