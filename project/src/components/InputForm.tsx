import React, { useState } from 'react';
import { CalculatorInputs } from './Calculator';

interface InputFormProps {
  onCalculate: (inputs: CalculatorInputs) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onCalculate }) => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    currentAge: 55,
    retirementAge: 60,
    pensionFund: 0,
    monthlyIncome: 0,
    taxFreeCash: 0,
    gender: 'male'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate the grown pension fund based on years until retirement
    const yearsUntilRetirement = inputs.retirementAge - inputs.currentAge;
    const growthRate = 0.05; // 5% default growth rate
    const grownPensionFund = inputs.pensionFund * Math.pow(1 + growthRate, yearsUntilRetirement);
    
    onCalculate({
      ...inputs,
      pensionFund: grownPensionFund
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Current Age
          </label>
          <input
            type="number"
            name="currentAge"
            required
            min="0"
            max="100"
            value={inputs.currentAge}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#cca877] focus:ring-[#cca877]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Intended Retirement Age
          </label>
          <input
            type="number"
            name="retirementAge"
            required
            min={inputs.currentAge}
            max="100"
            value={inputs.retirementAge}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#cca877] focus:ring-[#cca877]"
          />
          {inputs.retirementAge <= inputs.currentAge && (
            <p className="mt-1 text-sm text-red-600">
              Retirement age must be greater than current age
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Current Pension Fund Size
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">£</span>
            </div>
            <input
              type="number"
              name="pensionFund"
              required
              min="0"
              value={inputs.pensionFund || ''}
              onChange={handleInputChange}
              placeholder="Required"
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-[#cca877] focus:ring-[#cca877] bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Monthly Income Required at Retirement
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">£</span>
            </div>
            <input
              type="number"
              name="monthlyIncome"
              required
              min="0"
              value={inputs.monthlyIncome || ''}
              onChange={handleInputChange}
              placeholder="Required"
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-[#cca877] focus:ring-[#cca877] bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tax-Free Cash (%) - Max 25%
          </label>
          <input
            type="range"
            name="taxFreeCash"
            min="0"
            max="25"
            value={inputs.taxFreeCash}
            onChange={handleInputChange}
            className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="block mt-1 text-sm text-gray-600">
            {inputs.taxFreeCash}%
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="gender"
            value="male"
            checked={inputs.gender === 'male'}
            onChange={handleInputChange}
            className="form-radio h-4 w-4 text-[#cca877]"
          />
          <span className="ml-2">Male</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="gender"
            value="female"
            checked={inputs.gender === 'female'}
            onChange={handleInputChange}
            className="form-radio h-4 w-4 text-[#cca877]"
          />
          <span className="ml-2">Female</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={inputs.retirementAge <= inputs.currentAge}
        className="w-full md:w-auto px-6 py-2 bg-[#cca877] text-white rounded-md hover:bg-[#b89665] focus:outline-none focus:ring-2 focus:ring-[#cca877] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Calculate
      </button>
    </form>
  );
};

export default InputForm;