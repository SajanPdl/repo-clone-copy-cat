
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

// Define MathJax interface to fix TypeScript errors
interface MathJaxHub {
  Config: (config: any) => void;
  Queue: (tasks: any[]) => void;
}

interface MathJaxType {
  Hub: MathJaxHub;
}

// Extend Window interface to include MathJax
declare global {
  interface Window {
    MathJax?: MathJaxType;
  }
}

interface LatexEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const commonFormulas = [
  { label: 'Quadratic Formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}' },
  { label: 'Pythagorean Theorem', latex: 'a^2 + b^2 = c^2' },
  { label: 'Area of Circle', latex: 'A = \\pi r^2' },
  { label: 'Binomial Theorem', latex: '(x+y)^n = \\sum_{k=0}^{n} {n \\choose k}x^{n-k}y^k' },
  { label: 'Derivative', latex: '\\frac{d}{dx}f(x) = \\lim_{h \\to 0}\\frac{f(x+h) - f(x)}{h}' },
  { label: 'Integral', latex: '\\int_a^b f(x) \\, dx = F(b) - F(a)' }
];

const LatexEditor: React.FC<LatexEditorProps> = ({ value, onChange }) => {
  const [showHelp, setShowHelp] = useState(false);
  
  // Load MathJax script dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.MathJax) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML';
      script.async = true;
      document.head.appendChild(script);
      
      script.onload = () => {
        // Configure MathJax
        if (window.MathJax) {
          window.MathJax.Hub.Config({
            tex2jax: {
              inlineMath: [['$', '$'], ['\\(', '\\)']],
              displayMath: [['$$', '$$'], ['\\[', '\\]']],
              processEscapes: true
            }
          });
        }
      };
    }
    
    // Typeset math when value changes
    if (window.MathJax) {
      window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]);
    }
  }, [value]);
  
  const insertSymbol = (symbol: string) => {
    onChange(value + symbol);
  };
  
  const insertFormula = (formula: string) => {
    onChange(formula);
  };
  
  return (
    <div className="space-y-3">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter LaTeX formula, e.g., \frac{-b \pm \sqrt{b^2-4ac}}{2a}"
        className="font-mono"
        rows={3}
      />
      
      <div className="flex flex-wrap gap-2 mt-2">
        <button 
          type="button" 
          className="px-2 py-1 border rounded text-sm"
          onClick={() => insertSymbol('\\frac{}{}')}
        >
          ∕
        </button>
        <button 
          type="button" 
          className="px-2 py-1 border rounded text-sm"
          onClick={() => insertSymbol('\\sqrt{}')}
        >
          √
        </button>
        <button 
          type="button" 
          className="px-2 py-1 border rounded text-sm"
          onClick={() => insertSymbol('^{}')}
        >
          x²
        </button>
        <button 
          type="button" 
          className="px-2 py-1 border rounded text-sm"
          onClick={() => insertSymbol('\\sum_{i=0}^{n}')}
        >
          ∑
        </button>
        <button 
          type="button" 
          className="px-2 py-1 border rounded text-sm"
          onClick={() => insertSymbol('\\int_{a}^{b}')}
        >
          ∫
        </button>
        <button 
          type="button" 
          className="px-2 py-1 border rounded text-sm"
          onClick={() => insertSymbol('\\infty')}
        >
          ∞
        </button>
        <button 
          type="button" 
          className="px-2 py-1 border rounded text-sm"
          onClick={() => insertSymbol('\\pi')}
        >
          π
        </button>
        <button 
          type="button" 
          className="px-2 py-1 border rounded text-sm"
          onClick={() => insertSymbol('\\alpha')}
        >
          α
        </button>
        <button 
          type="button" 
          className="px-2 py-1 border rounded text-sm"
          onClick={() => insertSymbol('\\beta')}
        >
          β
        </button>
        <button 
          type="button" 
          className="px-2 py-1 border rounded text-sm"
          onClick={() => insertSymbol('\\theta')}
        >
          θ
        </button>
        <button 
          type="button" 
          className="px-2 py-1 border rounded text-sm font-bold text-primary"
          onClick={() => setShowHelp(!showHelp)}
        >
          {showHelp ? 'Hide Help' : 'Show Help'}
        </button>
      </div>
      
      {showHelp && (
        <div className="mt-3 border rounded p-3 bg-gray-50 dark:bg-gray-800 text-sm">
          <div className="font-medium mb-2">Common LaTeX Formulas:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {commonFormulas.map((formula, index) => (
              <button
                key={index}
                className="text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => insertFormula(formula.latex)}
              >
                <div className="font-medium text-xs mb-1">{formula.label}:</div>
                <div dangerouslySetInnerHTML={{ __html: `$$${formula.latex}$$` }} />
              </button>
            ))}
          </div>
          
          <div className="mt-3 font-medium">LaTeX Tips:</div>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Use <code>\frac{"{num}"}{"{denom}"}</code> for fractions</li>
            <li>Use <code>\sqrt{"{expr}"}</code> for square roots</li>
            <li>Use <code>^{"{pow}"}</code> for superscripts and <code>_{"{sub}"}</code> for subscripts</li>
            <li>Greek letters: <code>\alpha</code>, <code>\beta</code>, <code>\pi</code>, etc.</li>
            <li>For more complex formulas, please refer to LaTeX documentation</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LatexEditor;
