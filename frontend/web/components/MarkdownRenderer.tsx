'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  asBullets?: boolean;
}

export function MarkdownRenderer({
  content,
  className = '',
  asBullets = false,
}: MarkdownRendererProps) {
  if (!content) return null;

  const parseMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let key = 0;

    // Regex to match **bold**, *italic*, or __underline__
    const regex = /(\*\*.*?\*\*|\*.*?\*|__.*?__)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }

      const matchedText = match[0];
      const innerText = matchedText.slice(2, -2); // Remove surrounding markers

      // Determine the type and render accordingly
      if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        parts.push(<strong key={key++}>{innerText}</strong>);
      } else if (matchedText.startsWith('__') && matchedText.endsWith('__')) {
        parts.push(<u key={key++}>{innerText}</u>);
      } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
        parts.push(<em key={key++}>{matchedText.slice(1, -1)}</em>);
      }

      currentIndex = regex.lastIndex;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts;
  };

  if (asBullets) {
    // Split by newlines and render as bullet points
    const lines = content.split('\n').filter((line) => line.trim());

    if (lines.length === 0) return null;

    return (
      <ul className={`list-disc pl-5 space-y-1 ${className}`}>
        {lines.map((line, index) => (
          <li key={index}>{parseMarkdown(line.trim())}</li>
        ))}
      </ul>
    );
  }

  // Render inline without bullets
  return <div className={className}>{parseMarkdown(content)}</div>;
}

/**
 * Renders markdown for resume PDF with inline styles
 * Supports bold, italic, underline
 */
export function renderMarkdownForResume(
  text: string,
  style: React.CSSProperties = {},
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  let key = 0;

  const regex = /(\*\*.*?\*\*|\*.*?\*|__.*?__)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > currentIndex) {
      parts.push(
        <span key={key++} style={style}>
          {text.substring(currentIndex, match.index)}
        </span>,
      );
    }

    const matchedText = match[0];
    const innerText = matchedText.slice(2, -2);

    if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
      parts.push(
        <strong key={key++} style={style}>
          {innerText}
        </strong>,
      );
    } else if (matchedText.startsWith('__') && matchedText.endsWith('__')) {
      parts.push(
        <u key={key++} style={style}>
          {innerText}
        </u>,
      );
    } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
      parts.push(
        <em key={key++} style={style}>
          {matchedText.slice(1, -1)}
        </em>,
      );
    }

    currentIndex = regex.lastIndex;
  }

  if (currentIndex < text.length) {
    parts.push(
      <span key={key++} style={style}>
        {text.substring(currentIndex)}
      </span>,
    );
  }

  return parts;
}
