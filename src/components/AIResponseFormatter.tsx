'use client';

import React, { useState } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import diff from 'react-syntax-highlighter/dist/esm/languages/prism/diff';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { Toast } from '@/lib/Toast';

// Languages not listed here still render, just without colours
const LANGUAGES: Record<string, unknown> = {
  bash,
  sh: bash,
  shell: bash,
  css,
  diff,
  go,
  java,
  javascript,
  js: javascript,
  json,
  jsx,
  markdown,
  md: markdown,
  markup,
  html: markup,
  xml: markup,
  python,
  py: python,
  rust,
  sql,
  tsx,
  typescript,
  ts: typescript,
  yaml,
  yml: yaml,
};
Object.entries(LANGUAGES).forEach(([name, lang]) =>
  SyntaxHighlighter.registerLanguage(name, lang)
);

interface AIResponseFormatterProps {
  answer: string;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      Toast.error('Could not copy to clipboard');
    }
  };

  return (
    <div className="my-2 rounded-lg overflow-hidden border border-border">
      <div className="px-4 py-2 text-xs font-mono border-b flex items-center justify-between bg-zinc-800 text-zinc-300 border-zinc-700">
        <span className="font-semibold">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-zinc-700 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus} // always dark theme
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          background: '#1e1e1e', // force dark background
        }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// Defined once so react-markdown gets stable component references
const markdownComponents: Components = {
  // Fenced blocks arrive as <pre><code class="language-x">; inline code is
  // a bare <code> handled below.
  pre({ children }) {
    const child = React.Children.toArray(children)[0];
    if (React.isValidElement<{ className?: string; children?: React.ReactNode }>(child)) {
      const language =
        /language-([\w-]+)/.exec(child.props.className ?? '')?.[1] ?? 'text';
      const code = String(child.props.children ?? '').replace(/\n$/, '');
      return <CodeBlock language={language} code={code} />;
    }
    return <pre>{children}</pre>;
  },
  code({ children }) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-sm break-words">
        {children}
      </code>
    );
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:opacity-80"
      >
        {children}
      </a>
    );
  },
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="my-2 list-disc pl-5 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal pl-5 space-y-1">{children}</ol>
  ),
  h1: ({ children }) => (
    <h1 className="mt-4 mb-2 text-lg font-semibold">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-4 mb-2 text-base font-semibold">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-3 mb-1 text-sm font-semibold">{children}</h3>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-4 border-border pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-border" />,
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border bg-muted px-2 py-1 font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-2 py-1">{children}</td>
  ),
};

export const AIResponseFormatter = React.memo(function AIResponseFormatter({
  answer,
}: AIResponseFormatterProps) {
  return (
    <div className="p-2 text-sm leading-relaxed text-foreground whitespace-normal">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {answer}
      </ReactMarkdown>
    </div>
  );
});
