'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Lightbulb } from 'lucide-react';

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div
      className="prose prose-invert max-w-none
        prose-headings:text-brand-beige
        prose-strong:text-brand-beige
        prose-a:text-brand-mint prose-a:no-underline hover:prose-a:underline
        prose-li:marker:text-brand-mint"
    >
      <ReactMarkdown
        components={{
          pre({ children }) {
            return <>{children}</>;
          },
          code({ className, children, ...rest }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeText = String(children).replace(/\n$/, '');

            if (!match) {
              return (
                <code className="bg-black/30 text-brand-beige px-1.5 py-0.5 rounded text-sm font-mono" {...rest}>
                  {children}
                </code>
              );
            }

            return (
              <SyntaxHighlighter
                language={match[1]}
                style={vscDarkPlus}
                PreTag="div"
                customStyle={{ margin: '1rem 0', borderRadius: '0.75rem', fontSize: '0.85rem' }}
              >
                {codeText}
              </SyntaxHighlighter>
            );
          },
          blockquote({ children }) {
            return (
              <div className="not-prose flex gap-3 bg-brand-mint/10 border border-brand-mint/30 rounded-xl px-4 py-3 my-4">
                <Lightbulb className="text-brand-mint shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-[#c8c8c0] [&>p]:m-0 [&>p+p]:mt-2">{children}</div>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
