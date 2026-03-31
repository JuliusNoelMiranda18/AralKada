'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

// Initialize mermaid outside the component to avoid re-initialization
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    themeVariables: {
      primaryColor: '#F5F2ED', // pal-paper
      primaryTextColor: '#354024', // pal-kombu
      primaryBorderColor: '#3D2B1F', // pal-cafenoir
      lineColor: '#3D2B1F',
      secondaryColor: '#E6D5B8', // pal-tan
      tertiaryColor: '#F5F5DC', // pal-bone
    },
    fontFamily: 'var(--font-nunito), sans-serif',
  });
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const sanitizeChart = (text: string) => {
    if (!text) return '';
    
    // Fix common AI hallucinations in Mermaid
    let sanitized = text
      .trim()
      // Fix arrow label syntax: |label|> -> |label|
      .replace(/\|([^|]+)\|>/g, '|$1| ')
      // Fix unclosed brackets or extra characters at end of line
      .replace(/\][A-Z0-9 -]+$/gm, ']')
      // Ensure no trailing dashes or weird characters after node ends
      .replace(/([\]})])\s*[A-Za-z0-9 -]+$/gm, '$1')
      // Fix "graph TD;" (the semicolon is sometimes problematic)
      .replace(/^graph (TD|LR|BT|RL);/i, 'graph $1')
      // Handle fully duplicated node definitions like B[Server]B[Server]
      .replace(/([A-Za-z0-9_-]+\[[^\]]+\])\s*\1/g, '$1')
      .replace(/([A-Za-z0-9_-]+\(\([^)]+\)\))\s*\1/g, '$1')
      .replace(/([A-Za-z0-9_-]+\{[^}]+\})\s*\1/g, '$1')
      // Handle the case where AI repeats the node ID after the label: E[Chlorophyll]E
      .replace(/([A-Za-z0-9_-]+)(\s*(?:\[[^\]]*\]|\([^)]*\)|\(\([^)]*\)\)|\{[^}]*\}))\s*\1\b/g, '$1$2')
      // Ensure no trailing spaces or weird chars at the very end of labels
      .replace(/\[\s*(.*?)\s*\]/g, '[$1]')
      // Auto-quote labels that contain special characters like parentheses if they aren't already quoted
      .replace(/([A-Za-z0-9_-]+)\[([^"\]]*[\(\)][^"\]]*)\]/g, '$1["$2"]');

    return sanitized;
  };

  useEffect(() => {
    const renderDiagram = async () => {
      if (!chart || !ref.current) {
        setSvg('');
        return;
      }

      const sanitizedChart = sanitizeChart(chart);

      try {
        setError(null);
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, sanitizedChart);
        setSvg(svg);
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        // Fallback: try one more aggressive fix if it fails
        try {
           const emergencyFix = sanitizedChart
             .split('\n')
             .filter(line => line.includes('-->') || line.includes('---') || line.trim().match(/^[A-Za-z0-9]/))
             .join('\n');
           const id2 = `mermaid-retry-${Math.random().toString(36).substring(2, 9)}`;
           const { svg: svg2 } = await mermaid.render(id2, emergencyFix);
           setSvg(svg2);
           setError(null);
        } catch (innerErr) {
           setError('Failed to render diagram. Please check the syntax.');
        }
      }
    };

    renderDiagram();
  }, [chart, ref]);

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-600 text-xs font-bold italic">
        ⚠️ {error}
        <pre className="mt-2 p-2 bg-red-100 rounded text-[10px] overflow-x-auto">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div 
      ref={ref} 
      className={`mermaid-container flex justify-center w-full overflow-x-auto py-4 ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidDiagram;
