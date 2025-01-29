import React, { useState } from 'react';
import { Info } from 'lucide-react';
import InputForm from './InputForm';
import Results from './Results';
import { calculateProjections } from '../utils/calculations';
import { getLifeExpectancy, calculateChanceOf100 } from '../utils/lifeExpectancy';

export type CalculatorInputs = {
  currentAge: number;
  retirementAge: number;
  pensionFund: number;
  monthlyIncome: number;
  taxFreeCash: number;
  gender: 'male' | 'female';
};

const Calculator: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  
  const handleCalculate = (inputs: CalculatorInputs) => {
    const lifeExpectancy = getLifeExpectancy(new Date().getFullYear() - inputs.currentAge, inputs.gender);
    const chanceOf100 = calculateChanceOf100(inputs.currentAge);
    
    const taxFreeCashAmount = (inputs.pensionFund * inputs.taxFreeCash) / 100;
    const remainingFund = inputs.pensionFund - taxFreeCashAmount;
    
    const projections = calculateProjections(
      remainingFund,
      inputs.monthlyIncome * 12,
      100 - inputs.retirementAge,
      inputs.retirementAge
    );
    
    setResults({
      projections,
      taxFreeCashAmount,
      remainingFund,
      lifeExpectancy,
      age: inputs.retirementAge,
      chanceOf100,
      inputs
    });
  };

  return (
    <div className="pension-calculator max-w-4xl mx-auto p-6">
      <div className="header text-white p-4 rounded-t-lg">
        <h1 className="text-2xl font-bold">
          <span className="text-white">PENSION DRAWDOWN</span>{' '}
          <span className="accent-text">CALCULATOR</span>
        </h1>
      </div>
      
      <div className="bg-white rounded-b-lg shadow-lg p-6">
        {!results ? (
          <>
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-800 mt-1" />
                <p className="text-sm text-blue-800">
                  If you're 55 or older, drawdown lets you access your pension flexibly. Take up to 25% tax-free and keep the rest invested. Use our calculator to plan your retirement income.
                </p>
              </div>
            </div>
            <InputForm onCalculate={handleCalculate} />
          </>
        ) : (
          <Results results={results} onReset={() => setResults(null)} />
        )}
      </div>
    </div>
  );
};

export default Calculator;