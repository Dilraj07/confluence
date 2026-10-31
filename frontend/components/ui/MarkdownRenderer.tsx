'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-katex-wrapper leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-sm sm:text-base font-serif font-bold text-[#1c1b1a] mt-3 mb-2 border-b border-[#f0ece4] pb-1" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xs sm:text-sm font-serif font-semibold text-[#1c1b1a] mt-2.5 mb-1.5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs font-serif font-semibold text-[#1c1b1a] mt-2 mb-1" {...props} />
          ),
          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
          li: ({ node, ...props }) => <li className="pl-0.5 leading-relaxed" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 border-[#2a72de] pl-3 py-1 my-2 italic bg-[#f4ede2]/60 text-stone-700 rounded-r text-xs" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            return (
              <code className="px-1.5 py-0.5 rounded bg-[#f4ede2] font-mono text-[11px] text-[#2a72de] font-medium" {...props}>
                {children}
              </code>
            );
          },
          strong: ({ node, ...props }) => <strong className="font-semibold text-[#1c1b1a]" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-stone-800" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

