import React from 'react';

interface CodeWindowProps {
  code: string;
  language?: string;
  filename?: string;
}

export const CodeWindow: React.FC<CodeWindowProps> = ({ code, language = 'typescript', filename }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-950/40 shadow-2xl backdrop-blur-sm">
      {filename && (
        <div className="flex items-center justify-between border-b border-gray-900 bg-gray-950 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-800" />
              <span className="h-2.5 w-2.5 rounded-full bg-gray-800" />
              <span className="h-2.5 w-2.5 rounded-full bg-gray-800" />
            </div>
            <span className="font-dmmono text-xs text-gray-500 ml-2">{filename}</span>
          </div>
          <span className="font-dmmono text-[10px] tracking-wider uppercase text-gray-600">{language}</span>
        </div>
      )}
      <div className="overflow-x-auto p-5 custom-scroll max-h-[450px]">
        <pre className="font-dmmono text-xs leading-relaxed text-gray-300 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};