/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface NumberSpinnerProps {
  id?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  isArabic?: boolean;
  onChange: (val: number) => void;
}

export default function NumberSpinner({
  id,
  value,
  min,
  max,
  step = 1,
  unit = '',
  isArabic = false,
  onChange
}: NumberSpinnerProps) {
  const [inputValue, setInputValue] = useState<string>(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleIncrement = () => {
    const nextVal = Math.min(max, value + step);
    onChange(nextVal);
    setInputValue(String(nextVal));
  };

  const handleDecrement = () => {
    const nextVal = Math.max(min, value - step);
    onChange(nextVal);
    setInputValue(String(nextVal));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    let parsed = parseFloat(inputValue);
    if (isNaN(parsed)) {
      parsed = value; // Fallback to current value
    }
    const clamped = Math.min(max, Math.max(min, parsed));
    onChange(clamped);
    setInputValue(String(clamped));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
      e.currentTarget.blur();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 w-32 relative group hover:border-zinc-700 hover:bg-zinc-950 transition-all duration-300"
      id={id || "number-spinner-container"}
    >
      {/* Up Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className="p-1 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-zinc-900 transition disabled:opacity-30 disabled:hover:text-zinc-500 disabled:hover:bg-transparent"
        aria-label="Increase value"
      >
        <ChevronUp size={20} className="stroke-[2.5]" />
      </button>

      {/* Middle Editable Field */}
      <div className="flex items-center justify-center my-1.5 w-full relative">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full text-center bg-transparent border-none text-2xl font-mono font-black text-white focus:outline-none focus:ring-0 p-0 selection:bg-emerald-500 selection:text-zinc-950"
        />
        {unit && (
          <span className="absolute bottom-[-14px] text-[10px] font-mono text-zinc-600 font-bold uppercase pointer-events-none">
            {unit}
          </span>
        )}
      </div>

      {/* Down Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="p-1 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-zinc-900 transition disabled:opacity-30 disabled:hover:text-zinc-500 disabled:hover:bg-transparent mt-3"
        aria-label="Decrease value"
      >
        <ChevronDown size={20} className="stroke-[2.5]" />
      </button>
    </div>
  );
}
