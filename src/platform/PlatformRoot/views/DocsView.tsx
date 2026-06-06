import React from 'react';
import { CodeWindow } from '../components/CodeWindow';

export const DocsView: React.FC = () => {
  const quickstartBlock = `import { paginate } from 'smart-pdf-exporter';

const targetElement = document.getElementById('invoice-element');

// Evaluates boundaries against real layout viewports
const results = paginate(targetElement, {
  pageSize: 'A4',         // 'A4' or 'Letter' choices
  marginTop: 15,          // Expressed in millimeters
  marginBottom: 15,
  marginLeft: 10,
  marginRight: 10
});

console.log('Total Generated Pages Assigned:', results.totalPages);`;

  const standardHtmlBlock = `<div id="invoice-element">
  <div data-repeat-header="true" class="billing-header">
    <h3>Enterprise Statement Header</h3>
  </div>

  <div class="table-row">Row Record Component 01</div>
  <div class="table-row">Row Record Component 02</div>

  <div data-keep-together="true" class="totals-panel">
    <p>Consolidated Balance Summary Totals</p>
  </div>
</div>`;

  return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-4">

          <aside className="hidden lg:block space-y-1">
            <h4 className="font-dmmono text-[9px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">Manual Guide</h4>
            <nav className="space-y-0.5 font-dmsans text-xs font-medium">
              <a href="#welcome" className="block px-3 py-2 text-purple-400 bg-purple-950/30 rounded-md border border-purple-900/30">Getting Started</a>
              <a href="#tracking" className="block px-3 py-2 text-gray-400 hover:text-white transition-colors">Layout Attributes</a>
              <a href="#constraints" className="block px-3 py-2 text-gray-400 hover:text-white transition-colors">Engine Constraints</a>
            </nav>
          </aside>

          <div className="lg:col-span-3 space-y-10 max-w-3xl">
            <section id="welcome" className="space-y-3">
              <h2 className="font-syne text-xl font-bold text-white border-b border-gray-900 pb-2">Getting Started</h2>
              <p className="text-xs font-dmsans text-gray-400 leading-relaxed">
                Smart PDF Exporter operates exclusively as a client-side layout pre-flight validation utility.
                By polling browser container scales, it structures an absolute plan map before downstream files are built.
              </p>
              <CodeWindow code={quickstartBlock} filename="src/index.ts" language="typescript" />
            </section>

            <section id="tracking" className="space-y-3">
              <h2 className="font-syne text-xl font-bold text-white border-b border-gray-900 pb-2">Layout Tracking Attributes</h2>
              <p className="text-xs font-dmsans text-gray-400 leading-relaxed">
                Configure node matching behaviors directly inside raw template markup elements.
                The internal analysis engine reads these parameters directly from standard attribute lookups.
              </p>
              <CodeWindow code={standardHtmlBlock} filename="index.html" language="html" />
            </section>

            <section id="constraints" className="space-y-3">
              <h3 className="font-syne text-sm font-bold text-purple-300 uppercase tracking-wider">Engine Spacing Rules</h3>
              <div className="space-y-2 text-xs font-dmsans text-gray-400 leading-relaxed">
                <p>
                  <strong className="text-gray-200">1. Flattened Child Parsing:</strong> The algorithm evaluates only the direct children collection of the supplied master node container element, skipping header clones on the original layout index.
                </p>
                <p>
                  <strong className="text-gray-200">2. Millimeter to Pixel Ratios:</strong> Page ceiling heights convert physical properties into layout values using a strict ratio definition (3.78 x mm).
                </p>
                <p>
                  <strong className="text-gray-200">3. Scale Verification Safeties:</strong> If any row returns a height metric of <code className="bg-gray-900 px-1 py-0.5 rounded text-red-400 font-dmmono text-[11px]">0px</code>, the execution pass flags a layout failure to prevent infinite processing loops.
                </p>
              </div>
            </section>
          </div>

        </div>
      </div>
  );
};
