import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import '../styles/MathRenderer.css';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const renderMathContent = (text: string) => {
    if (!text) return text;

    // Block math ($$...$$)
    const blockMathRegex = /\$\$(.*?)\$\$/g;
    // Inline math ($...$)
    const inlineMathRegex = /\$(.*?)\$/g;

    let result: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // Block math ni topish
    while ((match = blockMathRegex.exec(text)) !== null) {
      // Block math dan oldingi oddiy matn
      if (match.index > lastIndex) {
        result.push(text.slice(lastIndex, match.index));
      }

      // Block math ni render qilish
      try {
        const mathHtml = katex.renderToString(match[1], {
          displayMode: true,
          throwOnError: false,
          errorColor: '#cc0000',
        });
        result.push(
          <div 
            key={`block-${match.index}`}
            className="my-4 text-center"
            dangerouslySetInnerHTML={{ __html: mathHtml }}
          />
        );
      } catch (error) {
        // Xatolik bo'lsa, oddiy matn ko'rsatish
        result.push(<span key={`block-error-${match.index}`} className="text-red-500">$${match[1]}$</span>);
      }

      lastIndex = match.index + match[0].length;
    }

    // Qolgan matnni inline math bilan ishlash
    const remainingText = text.slice(lastIndex);
    if (remainingText) {
      const inlineParts = remainingText.split(inlineMathRegex);
      inlineParts.forEach((part, index) => {
        if (index % 2 === 0) {
          // Oddiy matn
          if (part) {
            result.push(<span key={`text-${lastIndex + index}`}>{part}</span>);
          }
        } else {
          // Inline math
          try {
            const mathHtml = katex.renderToString(part, {
              displayMode: false,
              throwOnError: false,
              errorColor: '#cc0000',
            });
            result.push(
              <span 
                key={`inline-${lastIndex + index}`}
                dangerouslySetInnerHTML={{ __html: mathHtml }}
              />
            );
          } catch (error) {
            // Xatolik bo'lsa, oddiy matn ko'rsatish
            result.push(<span key={`inline-error-${lastIndex + index}`} className="text-red-500">${part}$</span>);
          }
        }
      });
    }

    return result;
  };

  return (
    <div className={`math-content ${className}`}>
      {renderMathContent(content)}
    </div>
  );
};

// Inline math uchun alohida komponent
export const InlineMath: React.FC<{ children: string; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  try {
    const mathHtml = katex.renderToString(children, {
      displayMode: false,
      throwOnError: false,
      errorColor: '#cc0000',
    });
    return (
      <span 
        className={`inline-math ${className}`}
        dangerouslySetInnerHTML={{ __html: mathHtml }}
      />
    );
  } catch (error) {
    return (
      <span className={`inline-math error ${className}`}>
        ${children}$
      </span>
    );
  }
};

// Block math uchun alohida komponent
export const BlockMath: React.FC<{ children: string; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  try {
    const mathHtml = katex.renderToString(children, {
      displayMode: true,
      throwOnError: false,
      errorColor: '#cc0000',
    });
    return (
      <div 
        className={`block-math text-center my-4 ${className}`}
        dangerouslySetInnerHTML={{ __html: mathHtml }}
      />
    );
  } catch (error) {
    return (
      <div className={`block-math error text-center my-4 ${className}`}>
        $${children}$$
      </div>
    );
  }
}; 