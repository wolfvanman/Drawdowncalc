import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '../utils/format';

interface ResultsProps {
  results: {
    projections: any[];
    taxFreeCashAmount: number;
    remainingFund: number;
    lifeExpectancy: number;
    age: number;
    inputs: {
      taxFreeCash: number;
      monthlyIncome: number;
      pensionFund: number;
    };
  };
  onReset: () => void;
}

const DEFAULT_STATE_PENSION_WEEKLY = 221.20;
const STATE_PENSION_AGE = 67;
const INFLATION_RATE = 0.02; // 2% annual inflation

const Results: React.FC<ResultsProps> = ({ results, onReset }) => {
  const [monthlyIncome, setMonthlyIncome] = useState(results.inputs.monthlyIncome);
  const [chosenGrowthRate, setChosenGrowthRate] = useState(5);
  const [includeStatePension, setIncludeStatePension] = useState(false);
  const [statePensionWeekly, setStatePensionWeekly] = useState(DEFAULT_STATE_PENSION_WEEKLY);
  const [adjustForInflation, setAdjustForInflation] = useState(false);
  
  const { 
    projections: initialProjections, 
    taxFreeCashAmount, 
    remainingFund, 
    lifeExpectancy, 
    age
  } = results;

  const projections = React.useMemo(() => {
    const getAdjustedIncome = (currentAge: number, yearsPassed: number) => {
      const baseIncome = monthlyIncome * 12;
      const inflationAdjustedIncome = adjustForInflation 
        ? baseIncome * Math.pow(1 + INFLATION_RATE, yearsPassed)
        : baseIncome;

      if (!includeStatePension || currentAge < STATE_PENSION_AGE) {
        return inflationAdjustedIncome;
      }
      const statePensionYearly = statePensionWeekly * 52;
      return Math.max(0, inflationAdjustedIncome - statePensionYearly);
    };

    let poorFund = remainingFund;
    let chosenFund = remainingFund;
    let goodFund = remainingFund;
    
    return initialProjections.map((_, index) => {
      const currentAge = age + index;
      const annualDrawdown = getAdjustedIncome(currentAge, index);
      
      const result = {
        currentAge,
        poorScenario: Math.max(0, poorFund),
        chosenScenario: Math.max(0, chosenFund),
        goodScenario: Math.max(0, goodFund)
      };

      poorFund = (poorFund - annualDrawdown) * (1 - 0.01 - 0.0055);
      chosenFund = (chosenFund - annualDrawdown) * (1 + (chosenGrowthRate/100) - 0.0055);
      goodFund = (goodFund - annualDrawdown) * (1 + 0.08 - 0.0055);

      return result;
    });
  }, [monthlyIncome, chosenGrowthRate, remainingFund, age, initialProjections, includeStatePension, statePensionWeekly, adjustForInflation]);

  const getOutcome = (scenario: 'poorScenario' | 'chosenScenario' | 'goodScenario') => {
    const lastNonZero = [...projections].reverse()
      .find(p => p[scenario] > 0);
    return {
      age: lastNonZero ? lastNonZero.currentAge : age,
      finalAmount: lastNonZero ? lastNonZero[scenario] : 0
    };
  };

  const poorOutcome = getOutcome('poorScenario');
  const chosenOutcome = getOutcome('chosenScenario');
  const goodOutcome = getOutcome('goodScenario');

  const scenarioTextStyles = "!text-white [&>*]:!text-white";

  const getMonthlyIncomeAtAge = (currentAge: number, yearsPassed: number = 0) => {
    let income = monthlyIncome;
    if (adjustForInflation) {
      income *= Math.pow(1 + INFLATION_RATE, yearsPassed);
    }
    if (includeStatePension && currentAge >= STATE_PENSION_AGE) {
      const statePensionMonthly = (statePensionWeekly * 52) / 12;
      return Math.max(0, income - statePensionMonthly);
    }
    return income;
  };

  const currentMonthlyIncome = getMonthlyIncomeAtAge(age);
  const futureMonthlyIncome = getMonthlyIncomeAtAge(STATE_PENSION_AGE, STATE_PENSION_AGE - age);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Your drawdown forecast</h2>
      
      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
        <p className="text-sm text-blue-800">
          Your average life expectancy is {lifeExpectancy} years old.
        </p>
        <p className="text-sm text-blue-800">
          You have chosen to take {formatCurrency(taxFreeCashAmount)} ({results.inputs.taxFreeCash}%) as tax-free cash from your pension of {formatCurrency(results.inputs.pensionFund)}.
        </p>
      </div>

      <h3 className="text-lg font-semibold text-gray-700">Example Returns</h3>

      <div className="grid grid-cols-3 gap-4">
        <div className={`warning-scenario p-4 rounded-lg ${scenarioTextStyles}`}>
          <h3 className="!text-white font-semibold text-lg mb-2">Poor (-1%)</h3>
          <p className="!text-white text-sm opacity-80 mb-2">Age your pension money could run out:</p>
          <p className="!text-white text-3xl font-bold mb-1">{poorOutcome.age}</p>
          <p className="!text-white text-sm opacity-80 mb-2">years old</p>
          <p className="!text-white text-sm font-medium">Amount left:</p>
          <p className="!text-white text-lg font-semibold">{formatCurrency(poorOutcome.finalAmount)}</p>
        </div>
        <div className={`chosen-scenario p-4 rounded-lg ${scenarioTextStyles}`}>
          <h3 className="!text-white font-semibold text-lg mb-2">Chosen ({chosenGrowthRate}%)</h3>
          <p className="!text-white text-sm opacity-80 mb-2">Age your pension money could run out:</p>
          <p className="!text-white text-3xl font-bold mb-1">{chosenOutcome.age}</p>
          <p className="!text-white text-sm opacity-80 mb-2">years old</p>
          <p className="!text-white text-sm font-medium">Amount left:</p>
          <p className="!text-white text-lg font-semibold">{formatCurrency(chosenOutcome.finalAmount)}</p>
        </div>
        <div className={`good-scenario p-4 rounded-lg ${scenarioTextStyles}`}>
          <h3 className="!text-white font-semibold text-lg mb-2">Good (8%)</h3>
          <p className="!text-white text-sm opacity-80 mb-2">Age your pension money could run out:</p>
          <p className="!text-white text-3xl font-bold mb-1">{goodOutcome.age}</p>
          <p className="!text-white text-sm opacity-80 mb-2">years old</p>
          <p className="!text-white text-sm font-medium">Amount left:</p>
          <p className="!text-white text-lg font-semibold">{formatCurrency(goodOutcome.finalAmount)}</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Monthly Income Required
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">£</span>
            </div>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-[#cca877] focus:ring-[#cca877]"
            />
          </div>
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="inflationAdjust"
              checked={adjustForInflation}
              onChange={(e) => setAdjustForInflation(e.target.checked)}
              className="h-4 w-4 text-[#cca877] focus:ring-[#cca877] border-gray-300 rounded"
            />
            <label htmlFor="inflationAdjust" className="ml-2 block text-sm text-gray-700">
              Increase income with inflation (2% per year)
            </label>
          </div>
          {adjustForInflation && (
            <p className="text-sm text-gray-500 mt-1">
              Your income will increase by 2% each year to keep up with inflation
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Chosen Growth Rate: {chosenGrowthRate}%
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={chosenGrowthRate}
            onChange={(e) => setChosenGrowthRate(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="statePension"
              checked={includeStatePension}
              onChange={(e) => setIncludeStatePension(e.target.checked)}
              className="h-4 w-4 text-[#cca877] focus:ring-[#cca877] border-gray-300 rounded"
            />
            <label htmlFor="statePension" className="ml-2 block text-sm text-gray-700">
              Include UK State Pension from age {STATE_PENSION_AGE}
            </label>
          </div>
          
          {includeStatePension && (
            <div className="space-y-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Weekly State Pension Amount
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">£</span>
                  </div>
                  <input
                    type="number"
                    value={statePensionWeekly}
                    onChange={(e) => setStatePensionWeekly(Number(e.target.value))}
                    step="0.01"
                    className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-[#cca877] focus:ring-[#cca877]"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Annual amount: {formatCurrency(statePensionWeekly * 52)}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  The money you would need to withdraw from your pension at {STATE_PENSION_AGE} would reduce from {formatCurrency(currentMonthlyIncome)} to {formatCurrency(futureMonthlyIncome)} as your State Pension begins.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={projections} 
              margin={{ top: 5, right: 30, left: 50, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="currentAge" 
                label={{ value: 'Age', position: 'bottom', offset: 40 }}
                interval={4}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => `£${(value/1000000).toFixed(1)}M`}
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Fund Value', 
                  angle: -90, 
                  position: 'insideLeft', 
                  offset: -35
                }}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value as number)}
                labelFormatter={(label) => `Age ${label}`}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <ReferenceLine y={0} stroke="#666" />
              <ReferenceLine
                x={lifeExpectancy}
                stroke="#666"
                strokeDasharray="3 3"
                label={{ value: 'Life Expectancy', position: 'top' }}
              />
              <ReferenceLine
                x={STATE_PENSION_AGE}
                stroke="#22c55e"
                strokeDasharray="3 3"
                label={{ 
                  value: 'State Pension Age', 
                  position: 'top',
                  fill: '#22c55e'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="poorScenario" 
                name="Poor (-1%)" 
                stroke="var(--pc-warning)"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="chosenScenario" 
                name={`Chosen (${chosenGrowthRate}%)`} 
                stroke="var(--pc-secondary)"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="goodScenario" 
                name="Good (8%)" 
                stroke="var(--pc-primary)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-lg text-center relative border-2 border-black">
        <h3 className="text-lg font-semibold mb-4">
          Want to see how we can make your money last longer?
        </h3>
        <a
          href="https://calendly.com/pensiontransferspecialist/15min"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-[#cca877] !text-white rounded-md hover:bg-[#b89665] focus:outline-none focus:ring-2 focus:ring-[#cca877] focus:ring-offset-2"
        >
          Book a FREE chat
        </a>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={onReset}
          className="px-6 py-2 !text-white rounded-md hover:bg-[#b89665] focus:outline-none focus:ring-2 focus:ring-[#cca877] focus:ring-offset-2"
        >
          Start Again
        </button>
      </div>
    </div>
  );
};

export default Results;