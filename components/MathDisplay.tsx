
import React, { useEffect, useRef } from 'react';

interface MathDisplayProps {
  tex: string;
  className?: string;
}

const MathDisplay: React.FC<MathDisplayProps> = ({ tex, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fix for MathJax global property access error in TypeScript by casting window to any
    const mathJax = (window as any).MathJax;
    if (mathJax && containerRef.current) {
      // In a real app we'd use a more robust MathJax React wrapper, 
      // but for this standalone demo, we use the global instance.
      mathJax.typesetPromise([containerRef.current]).catch((err: any) => console.log(err));
    }
  }, [tex]);

  return (
    <div ref={containerRef} className={`math-container ${className}`}>
      {`\\[ ${tex} \\]`}
    </div>
  );
};

export default MathDisplay;
