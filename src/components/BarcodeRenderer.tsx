import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeRendererProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
  lineColor?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  width = 1.6,
  height = 42,
  displayValue = true,
  fontSize = 12,
  className = '',
  lineColor = '#000000',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue,
          fontSize,
          font: 'JetBrains Mono, monospace',
          textMargin: 3,
          margin: 4,
          lineColor,
          background: 'transparent',
        });
      } catch (err) {
        console.warn('JsBarcode render error:', err);
      }
    }
  }, [value, width, height, displayValue, fontSize, lineColor]);

  if (!value) return null;

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <svg ref={svgRef} className="max-w-full h-auto overflow-visible" />
    </div>
  );
};
