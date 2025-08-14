// Matematik ifodalarni LaTeX formatga o'tkazish uchun utility

export const convertMathToLatex = (text: string): string => {
  if (!text) return text;

  let result = text;

  // Avval mavjud $ belgilarini vaqtincha almashtirish
  const dollarPlaceholder = '__DOLLAR_PLACEHOLDER__';
  result = result.replace(/\$/g, dollarPlaceholder);

  // Matematik belgilar va ifodalarni to'g'rilash
  const mathPatterns = [
    // Darajalar - improved patterns
    { pattern: /(\w+)\^{(\d+)}/g, replacement: '$1^{$2}' },
    { pattern: /(\w+)\^(\d+)/g, replacement: '$1^{$2}' },
    { pattern: /(\d+)\^{(\d+)}/g, replacement: '$1^{$2}' },
    { pattern: /(\d+)\^(\d+)/g, replacement: '$1^{$2}' },
    
    // Pastki indekslar
    { pattern: /(\w+)_{(\w+)}/g, replacement: '$1_{$2}' },
    { pattern: /(\w+)_(\d+)/g, replacement: '$1_{$2}' },
    
    // Ildizlar
    { pattern: /\\sqrt\[(\d+)\]\{([^}]+)\}/g, replacement: '\\sqrt[$1]{$2}' },
    { pattern: /sqrt\[(\d+)\]\(([^)]+)\)/g, replacement: '\\sqrt[$1]{$2}' },
    { pattern: /sqrt\(([^)]+)\)/g, replacement: '\\sqrt{$1}' },
    { pattern: /cbrt\(([^)]+)\)/g, replacement: '\\sqrt[3]{$1}' },
    
    // Kasrlar
    { pattern: /\\frac\{([^}]+)\}\{([^}]+)\}/g, replacement: '\\frac{$1}{$2}' },
    { pattern: /(\d+)\/(\d+)/g, replacement: '\\frac{$1}{$2}' },
    { pattern: /\(([^)]+)\)\/\(([^)]+)\)/g, replacement: '\\frac{$1}{$2}' },
    
    // Trigonometrik funksiyalar
    { pattern: /sin\(([^)]+)\)/g, replacement: '\\sin($1)' },
    { pattern: /cos\(([^)]+)\)/g, replacement: '\\cos($1)' },
    { pattern: /tan\(([^)]+)\)/g, replacement: '\\tan($1)' },
    
    // Logarifmlar
    { pattern: /log\(([^)]+)\)/g, replacement: '\\log($1)' },
    { pattern: /ln\(([^)]+)\)/g, replacement: '\\ln($1)' },
    
    // Integral va differensial
    { pattern: /int\(([^)]+)\)/g, replacement: '\\int $1 \\, dx' },
    { pattern: /d\/dx\(([^)]+)\)/g, replacement: '\\frac{d}{dx}($1)' },
    
    // Limit
    { pattern: /lim\(([^)]+)\)/g, replacement: '\\lim_{$1}' },
    
    // Yig'indi va ko'paytma
    { pattern: /sum\(([^)]+)\)/g, replacement: '\\sum_{$1}' },
    { pattern: /prod\(([^)]+)\)/g, replacement: '\\prod_{$1}' },
    
    // Matematik konstantalar
    { pattern: /\binfinity\b/g, replacement: '\\infty' },
    { pattern: /\binf\b/g, replacement: '\\infty' },
    { pattern: /\bpi\b/g, replacement: '\\pi' },
    
    // Yunon harflari
    { pattern: /\balpha\b/g, replacement: '\\alpha' },
    { pattern: /\bbeta\b/g, replacement: '\\beta' },
    { pattern: /\bgamma\b/g, replacement: '\\gamma' },
    { pattern: /\bdelta\b/g, replacement: '\\delta' },
    { pattern: /\bepsilon\b/g, replacement: '\\epsilon' },
    { pattern: /\btheta\b/g, replacement: '\\theta' },
    { pattern: /\blambda\b/g, replacement: '\\lambda' },
    { pattern: /\bmu\b/g, replacement: '\\mu' },
    { pattern: /\bsigma\b/g, replacement: '\\sigma' },
    { pattern: /\bomega\b/g, replacement: '\\omega' },
    
    // Tengsizliklar
    { pattern: /<=/g, replacement: '\\leq' },
    { pattern: />=/g, replacement: '\\geq' },
    { pattern: /!=/g, replacement: '\\neq' },
    { pattern: /±/g, replacement: '\\pm' },
    { pattern: /∓/g, replacement: '\\mp' },
    
    // Strelkalar
    { pattern: /->/g, replacement: '\\rightarrow' },
    { pattern: /<-/g, replacement: '\\leftarrow' },
    { pattern: /<=>/g, replacement: '\\leftrightarrow' },
    
    // To'plamlar
    { pattern: /\bin\b/g, replacement: '\\in' },
    { pattern: /\bnotin\b/g, replacement: '\\notin' },
    { pattern: /\bsubset\b/g, replacement: '\\subset' },
    { pattern: /\bsupset\b/g, replacement: '\\supset' },
    { pattern: /\bunion\b/g, replacement: '\\cup' },
    { pattern: /\bintersection\b/g, replacement: '\\cap' },
  ];

  // Har bir pattern ni qo'llash
  mathPatterns.forEach(({ pattern, replacement }) => {
    result = result.replace(pattern, replacement);
  });

  // Dollar belgilarni qaytarish
  result = result.replace(new RegExp(dollarPlaceholder, 'g'), '$');

  return result;
};

// Matnda matematik ifodalarni aniqlash
const detectMathExpressions = (text: string): boolean => {
  const mathIndicators = [
    /\^{?\d+}?/,           // Darajalar
    /_{?\w+}?/,            // Pastki indekslar
    /\\[a-zA-Z]+/,         // LaTeX komandalar
    /\\frac/,              // Kasrlar
    /\\sqrt/,              // Ildizlar
    /\\sum|\\prod|\\int/,  // Integral, sum, prod
    /\\alpha|\\beta|\\gamma|\\delta/,  // Yunon harflari
    /\\leq|\\geq|\\neq/,   // Tengsizliklar
    /\\infty|\\pi/,        // Konstantalar
    /\d+\/\d+/,            // Oddiy kasrlar
    /[a-zA-Z]\d+/,         // O'zgaruvchilar indeks bilan
    /\d+[a-zA-Z]/,         // Sonlar harf bilan
  ];

  return mathIndicators.some(pattern => pattern.test(text));
};

// Matematik ifodalarni $ bilan o'rash
const wrapMathExpressions = (text: string): string => {
  if (!text) return text;

  // Agar allaqachon $ bilan o'ralgan bo'lsa, o'zgartirmaslik
  if (text.includes('$')) {
    return text;
  }

  // Agar matematik ifoda bo'lsa, uni $ bilan o'rash
  if (detectMathExpressions(text)) {
    // Agar matn uzun bo'lsa va matematik ifodalar bor bo'lsa, display math ishlatish
    if (text.length > 20 || text.includes('\\frac') || text.includes('\\sqrt') || text.includes('\\sum')) {
      return `$$${text}$$`;
    } else {
      return `$${text}$`;
    }
  }

  return text;
};

// Maxsus holatlarni handle qilish
const handleSpecialCases = (text: string): string => {
  let result = text;

  // $27x$^{6} kabi noto'g'ri formatlarni tuzatish
  result = result.replace(/\$(\d+)([a-zA-Z]+)\$\^{?(\d+)}?/g, '$1$2^{$3}');
  result = result.replace(/\$(\d+)([a-zA-Z]+)\$/g, '$1$2');
  
  // Qo'sh $ belgilarni tuzatish
  result = result.replace(/\$+/g, '$');
  
  // Bo'sh $ belgilarni olib tashlash
  result = result.replace(/\$\s*\$/g, '');
  
  return result;
};

// Asosiy processing funksiya
export const processMathText = (text: string): string => {
  if (!text) return text;

  try {
    // 1. Maxsus holatlarni tuzatish
    let processedText = handleSpecialCases(text);
    
    // 2. Matematik ifodalarni LaTeX formatga o'tkazish
    processedText = convertMathToLatex(processedText);
    
    // 3. Matematik ifodalarni $ bilan o'rash (agar kerak bo'lsa)
    processedText = wrapMathExpressions(processedText);
    
    return processedText;
  } catch (error) {
    console.warn('Math processing error:', error);
    return text;
  }
};

// Matnni tozalash funksiyasi
export const cleanMathText = (text: string): string => {
  if (!text) return text;
  
  return text
    .replace(/\s+/g, ' ')           // Ko'p bo'shliqlarni kamaytirish
    .replace(/\$+/g, '$')           // Ko'p $ belgilarni kamaytirish
    .replace(/\$\s+\$/g, '')        // Bo'sh $ belgilarni olib tashlash
    .trim();
};

// Debug uchun funksiya
export const debugMathText = (text: string): void => {
  console.log('Original text:', text);
  console.log('Has math indicators:', detectMathExpressions(text));
  console.log('After LaTeX conversion:', convertMathToLatex(text));
  console.log('Final processed:', processMathText(text));
};