import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  vscDarkPlus,
  prism,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

interface AIResponseFormatterProps {
  answer: string;
}

export const AIResponseFormatter: React.FC<AIResponseFormatterProps> = ({
  answer,
}) => {
  const { theme } = useTheme();

  // Function to parse markdown-style formatting (bold, italic, etc.)
  const parseMarkdownText = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    // Regex to match **bold**, *italic*, and other patterns
    const markdownRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    while ((match = markdownRegex.exec(text)) !== null) {
      // Add text before markdown
      if (match.index > lastIndex) {
        parts.push(
          <span key={`plain-${keyIndex++}`}>
            {text.slice(lastIndex, match.index)}
          </span>
        );
      }

      const matchedText = match[0];

      // Handle **bold**
      if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        parts.push(
          <strong
            key={`bold-${keyIndex++}`}
            className="font-semibold text-foreground"
          >
            {matchedText.slice(2, -2)}
          </strong>
        );
      }
      // Handle *italic*
      else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
        parts.push(
          <em key={`italic-${keyIndex++}`} className="italic">
            {matchedText.slice(1, -1)}
          </em>
        );
      }
      // Handle `inline code`
      else if (matchedText.startsWith('`') && matchedText.endsWith('`')) {
        parts.push(
          <code
            key={`inline-code-${keyIndex++}`}
            className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-sm"
          >
            {matchedText.slice(1, -1)}
          </code>
        );
      }

      lastIndex = match.index + matchedText.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`plain-${keyIndex++}`}>{text.slice(lastIndex)}</span>
      );
    }

    return parts.length > 0 ? parts : [text];
  };

  // Function to parse text and extract code blocks
  const parseContent = (text: string) => {
    const parts: React.ReactNode[] = [];
    // Match code blocks with optional language identifier
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block (with markdown parsing)
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {parseMarkdownText(textBefore)}
          </span>
        );
      }

      // Add code block
      const language = match[1] || 'text';
      const code = match[2].trim();
      const isDark = theme === 'dark';

      parts.push(
        <div
          key={`code-${match.index}`}
          className="my-2 rounded-lg overflow-hidden border border-border"
        >
          <div
            className={`px-4 py-2 text-xs font-mono border-b flex items-center justify-between ${
              isDark
                ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                : 'bg-zinc-100 text-zinc-700 border-zinc-300'
            }`}
          >
            <span className="font-semibold">{language}</span>
          </div>
          <SyntaxHighlighter
            language={language}
            style={isDark ? vscDarkPlus : prism}
            customStyle={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              background: isDark ? '#1e1e1e' : '#fafafa',
            }}
            showLineNumbers
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text (with markdown parsing)
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {parseMarkdownText(remainingText)}
        </span>
      );
    }

    return parts.length > 0 ? (
      parts
    ) : (
      <span className="whitespace-pre-wrap">{parseMarkdownText(text)}</span>
    );
  };

  return (
    <div className="p-2 space-y-4">
      <div className="text-sm leading-relaxed text-foreground">
        {parseContent(answer)}
      </div>

      {/* {sources && sources.length > 0 && (
        <div className="pt-3 border-t border-border">
          <p className="font-medium text-foreground mb-2 flex items-center gap-2">
            <span>📚</span> Sources:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
            {sources.map((src: string, i: number) => (
              <li key={i} className="leading-relaxed">
                {src}
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  );
};
