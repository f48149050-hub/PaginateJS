import React from 'react';
import { LivePreviewDoc } from '../components/LivePreviewDoc';
import { CodeWindow } from '../components/CodeWindow';

interface LandingViewProps {
  setView: (view: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ setView }) => {
  const codeSnippet = `import { paginate } from 'paginatejs';

const container = document.getElementById('invoice');

const result = paginate(container, {
  pageSize: 'A4',
  marginTop: 10,
  marginBottom: 10,
  marginLeft: 15,
  marginRight: 15
});

// Exactly which blocks land on which page — before any PDF is generated
console.log(result.totalPages, result.pages);`;

  return (
      <div className="py-16 space-y-24">

        {/* ── Hero ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">

          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs text-purple-400 font-dmmono">
            <span className="flex h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            Early Access — PDF export coming soon
          </div>

          <h1 className="font-syne text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-4xl mx-auto leading-[1.1]">
            See Exactly Where Your Document{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
            Breaks Before Export.
          </span>
          </h1>

          <p className="font-dmsans text-base text-gray-400 max-w-xl mx-auto">
            Add two data attributes to your HTML. PaginateJS measures your real DOM heights,
            keeps totals and signatures together, and shows you exactly which rows land on
            which page — before you generate a single PDF.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
                onClick={() => setView('demo')}
                className="rounded-xl bg-purple-600 px-6 py-3 font-dmsans text-xs font-semibold text-white shadow-xl shadow-purple-900/40 transition-transform hover:scale-[1.01] hover:bg-purple-500"
            >
              Try the Live Demo
            </button>
            <button
                onClick={() => setView('docs')}
                className="rounded-xl border border-gray-800 bg-gray-900/40 px-6 py-3 font-dmsans text-xs font-semibold text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
              Read the Docs
            </button>
          </div>

          {/* Live preview embedded in hero */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="rounded-xl border border-gray-800 bg-gray-900/20 p-2 shadow-2xl backdrop-blur-sm">
              <div className="rounded-lg border border-gray-900 bg-gray-950 px-4 py-2 flex items-center justify-between text-xs font-dmmono text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-gray-400">Live engine — real DOM measurements</span>
                </div>
                <span className="text-purple-400 font-medium text-[10px]">PAGINATEJS RUNNING</span>
              </div>
              <div className="p-4 max-h-[350px] overflow-y-auto custom-scroll bg-gray-950/20 rounded-b-xl">
                <LivePreviewDoc
                    rowCount={8}
                    pageSize="A4"
                    marginTop={12}
                    marginBottom={12}
                    marginLeft={10}
                    marginRight={10}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-syne text-2xl font-bold tracking-tight text-white">What it does</h2>
            <p className="text-gray-400 font-dmsans text-sm max-w-xl mx-auto">
              CSS page breaks are hints. PaginateJS measures your actual elements and calculates
              the layout mathematically.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-xl border border-gray-900 bg-gray-900/40 p-6 space-y-3 hover:border-purple-500/10 transition-all group">
              <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20 text-xs font-dmmono">RH</div>
              <h3 className="font-syne text-base font-bold text-white group-hover:text-purple-300 transition-colors">Repeat Headers</h3>
              <p className="text-xs font-dmsans text-gray-400 leading-relaxed">
                Add <code className="font-dmmono text-[11px] text-purple-400 bg-purple-950/40 px-1 py-0.5 rounded">data-repeat-header="true"</code> to your
                column header row. It automatically appears at the top of every page after the first.
              </p>
            </div>

            <div className="rounded-xl border border-gray-900 bg-gray-900/40 p-6 space-y-3 hover:border-purple-500/10 transition-all group">
              <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20 text-xs font-dmmono">KT</div>
              <h3 className="font-syne text-base font-bold text-white group-hover:text-purple-300 transition-colors">Keep-Together Blocks</h3>
              <p className="text-xs font-dmsans text-gray-400 leading-relaxed">
                Add <code className="font-dmmono text-[11px] text-purple-400 bg-purple-950/40 px-1 py-0.5 rounded">data-keep-together="true"</code> to your
                totals or signature block. It moves to the next page as a unit — never split in half.
              </p>
            </div>

            <div className="rounded-xl border border-gray-900 bg-gray-900/40 p-6 space-y-3 hover:border-purple-500/10 transition-all group">
              <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20 text-xs font-dmmono">LP</div>
              <h3 className="font-syne text-base font-bold text-white group-hover:text-purple-300 transition-colors">Live Preview</h3>
              <p className="text-xs font-dmsans text-gray-400 leading-relaxed">
                See page breaks update in real time as your content changes. Know exactly where
                page 2 starts before you generate anything — no more generate-and-check loops.
              </p>
            </div>

            <div className="rounded-xl border border-gray-900 bg-gray-900/40 p-6 space-y-3 hover:border-purple-500/10 transition-all group">
              <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20 text-xs font-dmmono">DM</div>
              <h3 className="font-syne text-base font-bold text-white group-hover:text-purple-300 transition-colors">Real DOM Measurements</h3>
              <p className="text-xs font-dmsans text-gray-400 leading-relaxed">
                Uses <code className="font-dmmono text-[11px] text-purple-400 bg-purple-950/40 px-1 py-0.5 rounded">getBoundingClientRect()</code> on
                your actual rendered elements. Not guesses. Not estimations. Pixel-accurate heights
                from the browser itself.
              </p>
            </div>

            <div className="rounded-xl border border-gray-900 bg-gray-900/40 p-6 space-y-3 hover:border-purple-500/10 transition-all group">
              <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20 text-xs font-dmmono">FA</div>
              <h3 className="font-syne text-base font-bold text-white group-hover:text-purple-300 transition-colors">Works Everywhere</h3>
              <p className="text-xs font-dmsans text-gray-400 leading-relaxed">
                React, Vue, Svelte, Bubble, plain JavaScript — if it runs in a browser and renders
                HTML, PaginateJS can measure it. No framework lock-in.
              </p>
            </div>

            <div className="rounded-xl border border-gray-900 bg-gray-900/40 p-6 space-y-3 hover:border-purple-500/10 transition-all group">
              <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20 text-xs font-dmmono">JP</div>
              <h3 className="font-syne text-base font-bold text-white group-hover:text-purple-300 transition-colors">JSON Layout Plan</h3>
              <p className="text-xs font-dmsans text-gray-400 leading-relaxed">
                Returns a plain JSON object — total pages, which blocks land where, any warnings.
                Pass it straight into your PDF generator or use it to drive your own preview UI.
              </p>
            </div>

          </div>
        </section>

        {/* ── Code sample ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="font-syne text-2xl font-bold tracking-tight text-white">
                Two attributes. One function call.
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed font-dmsans">
                Point the engine at your invoice container. It walks your DOM, measures every
                element, and returns a complete page plan in milliseconds.
              </p>
              <ul className="space-y-2.5 font-dmsans text-xs text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold mt-0.5">✓</span>
                  Works on any HTML — variable row counts, images, custom fonts
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold mt-0.5">✓</span>
                  Flags oversized elements with a warning instead of silently breaking
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold mt-0.5">✓</span>
                  Use the result with any PDF library — Puppeteer, jsPDF, or your own renderer
                </li>
              </ul>
            </div>
            <CodeWindow code={codeSnippet} filename="invoice.ts" language="typescript" />
          </div>
        </section>

        {/* ── Use cases ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-gray-900 pt-16 space-y-6">
          <h3 className="font-syne text-xl font-bold text-white text-center">Who uses it</h3>
          <div className="grid gap-6 md:grid-cols-2">

            <div className="p-5 rounded-xl border border-gray-900 bg-gray-900/10 space-y-2">
              <h4 className="font-syne text-sm font-bold text-purple-400">Invoice generation in Bubble and no-code tools</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-dmsans">
                Bubble builders shipping invoicing apps to clients. The engine ensures column
                headers repeat on every page and totals never get split in half — automatically,
                regardless of how many line items the invoice has.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-gray-900 bg-gray-900/10 space-y-2">
              <h4 className="font-syne text-sm font-bold text-purple-400">Any app with dynamic document output</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-dmsans">
                Reports, contracts, statements, packing slips — anything where the content changes
                per user and you need the PDF to look correct every time without manual adjustment.
              </p>
            </div>

          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-gray-900 pt-10 text-center text-[11px] font-dmmono text-gray-600">
          <p>&copy; 2026 PaginateJS. DOM-aware pagination engine. All rights reserved.</p>
        </footer>

      </div>
  );
};

export default LandingView;