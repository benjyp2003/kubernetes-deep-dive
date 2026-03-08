import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

const CodeBlock = ({ code, language = "yaml", title }: CodeBlockProps) => (
  <div className="rounded-xl overflow-hidden border border-border">
    {title && (
      <div className="bg-k8s-navy px-4 py-2 border-b border-border/20 flex items-center justify-between">
        <span className="text-xs font-mono text-k8s-glow/70">{title}</span>
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
      </div>
    )}
    <pre className="k8s-code-block rounded-none border-0 m-0">
      <code>{code}</code>
    </pre>
  </div>
);

export default CodeBlock;
