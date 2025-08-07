// Matematik ifodalarni LaTeX formatga o'tkazish uchun utility

export const convertMathToLatex = (text: string): string => {
  if (!text) return text;

  let result = text;

  // Oddiy matematik belgilar
  const mathPatterns = [
    // Darajalar
    { pattern: /(\d+)\^(\d+)/g, replacement: '$1^{$2}' },
    { pattern: /(\w+)\^(\d+)/g, replacement: '$1^{$2}' },
    
    // Ildizlar
    { pattern: /sqrt\(([^)]+)\)/g, replacement: '\\sqrt{$1}' },
    { pattern: /cbrt\(([^)]+)\)/g, replacement: '\\sqrt[3]{$1}' },
    
    // Kasrlar
    { pattern: /(\d+)\/(\d+)/g, replacement: '\\frac{$1}{$2}' },
    
    // Trigonometrik funksiyalar
    { pattern: /sin\(([^)]+)\)/g, replacement: '\\sin($1)' },
    { pattern: /cos\(([^)]+)\)/g, replacement: '\\cos($1)' },
    { pattern: /tan\(([^)]+)\)/g, replacement: '\\tan($1)' },
    
    // Logarifmlar
    { pattern: /log\(([^)]+)\)/g, replacement: '\\log($1)' },
    { pattern: /ln\(([^)]+)\)/g, replacement: '\\ln($1)' },
    
    // Integral va differensial
    { pattern: /int\(([^)]+)\)/g, replacement: '\\int $1 dx' },
    { pattern: /d\/([^)]+)\)/g, replacement: '\\frac{d}{d$1}' },
    
    // Limit
    { pattern: /lim\(([^)]+)\)/g, replacement: '\\lim_{$1}' },
    
    // Yig'indi va ko'paytma
    { pattern: /sum\(([^)]+)\)/g, replacement: '\\sum_{$1}' },
    { pattern: /prod\(([^)]+)\)/g, replacement: '\\prod_{$1}' },
    
    // Infinit
    { pattern: /infinity/g, replacement: '\\infty' },
    { pattern: /inf/g, replacement: '\\infty' },
    
    // Pi
    { pattern: /pi/g, replacement: '\\pi' },
    
    // Alfa, beta, gamma
    { pattern: /alpha/g, replacement: '\\alpha' },
    { pattern: /beta/g, replacement: '\\beta' },
    { pattern: /gamma/g, replacement: '\\gamma' },
    
    // Tengsizliklar
    { pattern: /<=/g, replacement: '\\leq' },
    { pattern: />=/g, replacement: '\\geq' },
    { pattern: /!=/g, replacement: '\\neq' },
    
    // Matematik operatorlar
    { pattern: /->/g, replacement: '\\rightarrow' },
    { pattern: /<-/g, replacement: '\\leftarrow' },
    { pattern: /<=>/g, replacement: '\\leftrightarrow' },
    
    // To'plamlar
    { pattern: /in/g, replacement: '\\in' },
    { pattern: /notin/g, replacement: '\\notin' },
    { pattern: /subset/g, replacement: '\\subset' },
    { pattern: /supset/g, replacement: '\\supset' },
  ];

  // Har bir pattern ni qo'llash
  mathPatterns.forEach(({ pattern, replacement }) => {
    result = result.replace(pattern, replacement);
  });

  // Matematik ifodalarni $ belgilari bilan o'rash
  const mathExpressions = [
    // Tengliklar
    /(\d+[\+\-\*\/\^]\d+)/g,
    /([a-zA-Z][\+\-\*\/\^][a-zA-Z0-9])/g,
    /(\d+[a-zA-Z])/g,
    /([a-zA-Z]\d+)/g,
    
    // Formulalar
    /([a-zA-Z]+\s*=\s*[^=]+)/g,
    /([a-zA-Z]+\s*[+\-*/]\s*[a-zA-Z0-9]+)/g,
    
    // Trigonometrik va boshqa funksiyalar
    /(sin|cos|tan|log|ln|sqrt|cbrt|int|lim|sum|prod)\([^)]+\)/g,
    
    // Darajalar va ildizlar
    /(\d+\^\d+)/g,
    /(\w+\^\d+)/g,
    /(sqrt|cbrt)\([^)]+\)/g,
  ];

  // Matematik ifodalarni topib, $ bilan o'rash
  mathExpressions.forEach(pattern => {
    result = result.replace(pattern, (match) => {
      // Agar allaqachon $ bilan o'ralgan bo'lsa, o'zgartirmaslik
      if (match.includes('$')) return match;
      return `$${match}$`;
    });
  });

  return result;
};

// Matnni LaTeX formatga o'tkazish va render qilish uchun
export const processMathText = (text: string): string => {
  if (!text) return text;
  
  // Matematik ifodalarni LaTeX formatga o'tkazish
  const processedText = convertMathToLatex(text);
  
  return processedText;
}; 