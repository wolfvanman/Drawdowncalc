export const getLifeExpectancy = (birthYear: number, gender: 'male' | 'female'): number => {
  const lifeExpectancyData: Record<number, { male: number; female: number }> = {
    1940: { male: 71.14, female: 76.85 },
    1945: { male: 72.75, female: 77.85 },
    1950: { male: 76.20, female: 80.85 },
    1955: { male: 77.54, female: 81.94 },
    1960: { male: 78.45, female: 82.85 },
    1965: { male: 79.15, female: 83.45 },
    1970: { male: 80.14, female: 84.20 },
    1975: { male: 80.94, female: 84.93 },
    1980: { male: 81.58, female: 85.55 },
    1985: { male: 82.42, female: 86.27 },
    1990: { male: 83.15, female: 86.79 },
    1995: { male: 84.20, female: 87.62 },
    2000: { male: 85.17, female: 88.42 },
    2005: { male: 85.96, female: 88.75 },
    2010: { male: 86.57, female: 89.08 },
    2015: { male: 86.90, female: 89.86 },
    2020: { male: 87.24, female: 90.31 }
  };

  // Find the closest year in our data
  const years = Object.keys(lifeExpectancyData).map(Number);
  const closestYear = years.reduce((prev, curr) => {
    return Math.abs(curr - birthYear) < Math.abs(prev - birthYear) ? curr : prev;
  });

  return lifeExpectancyData[closestYear][gender];
};

export const calculateChanceOf100 = (currentAge: number): string => {
  // Simplified calculation - could be made more accurate with actual actuarial data
  const baseChance = Math.max(0, 15 - (currentAge - 55) * 0.5);
  return `1 in ${Math.round(100 / baseChance)}`;
};