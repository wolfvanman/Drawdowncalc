interface Projection {
  year: number;
  currentAge: number;
  fundValue: number;
  fundValue2: number;
  fundValue5: number;
  fundValue8: number;
}

export const calculateProjections = (
  initialFund: number,
  annualIncome: number,
  years: number,
  startAge: number
): Projection[] => {
  const projections: Projection[] = [];
  const fundCharge = 0.0055; // 0.55% annual charge

  let fundValue2 = initialFund;
  let fundValue5 = initialFund;
  let fundValue8 = initialFund;

  for (let year = 0; year <= years; year++) {
    projections.push({
      year,
      currentAge: startAge + year,
      fundValue: fundValue5, // Default 5% for single line
      fundValue2: Math.max(0, fundValue2),
      fundValue5: Math.max(0, fundValue5),
      fundValue8: Math.max(0, fundValue8)
    });

    // Calculate next year values with different growth rates
    fundValue2 = (fundValue2 - annualIncome) * (1 + 0.02 - fundCharge);
    fundValue5 = (fundValue5 - annualIncome) * (1 + 0.05 - fundCharge);
    fundValue8 = (fundValue8 - annualIncome) * (1 + 0.08 - fundCharge);
  }

  return projections;
};