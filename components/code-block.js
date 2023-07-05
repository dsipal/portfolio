import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark as theme } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export const CodeBlock = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (

      <div className="my-5 font-mono">
        <SyntaxHighlighter
        style={theme}
        language={match[1]}
        {...props}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
      
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};
