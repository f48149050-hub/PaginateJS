import React, { useState } from 'react';
// Korrigerad sökväg eftersom 'views' och 'components' ligger i samma 'PlatformRoot'-mapp:
import { LivePreviewDoc } from '../components/LivePreviewDoc';
import { PaginationResult, PageSizeType } from '../../../engine/types'; // Gå upp till src/

export const InteractiveDemo: React.FC = () => {
  const [rowCount, setRowCount] = useState<number>(20);
  const [pageSize, setPageSize] = useState<PageSizeType>('A4');
  const [marginTop, setMarginTop] = useState<number>(15);
  const [marginBottom, setMarginBottom] = useState<number>(15);

  const [telemetryBlueprint, setTelemetryBlueprint] = useState<PaginationResult | null>(null);
  const [observedBlockCount, setObservedBlockCount] = useState<number>(0);

  return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Control Console */}
        <div className="rounded-xl border border-gray-900 bg-gray-950/40 p-6 flex flex-wrap gap-6 items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-syne text-xl font-bold text-white">Live Blueprint Playground</h1>
            <p className="text-xs font-dmsans text-gray-400">
              Adjust document parameters to execute the real pagination layout planning algorithm.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col gap-1">
              <span className="font-dmmono text-[9px] text-gray-500 uppercase tracking-wider">Dynamic Item Count</span>
              <select
                  value={rowCount}
                  onChange={(e) => setRowCount(Number(e.target.value))}
                  className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:border-purple-500 font-dmsans outline-none"
              >
                <option value={8}>8 Item Rows</option>
                <option value={20}>20 Item Rows</option>
                <option value={45}>45 Item Rows</option>
                <option value={90}>90 Item Rows</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-dmmono text-[9px] text-gray-500 uppercase tracking-wider">Target Page Format</span>
              <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as PageSizeType)}
                  className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:border-purple-500 font-dmsans outline-none"
              >
                <option value="A4">A4 Layout Sheet</option>
                <option value="Letter">US Letter Sheet</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-dmmono text-[9px] text-gray-500 uppercase tracking-wider">Top Margin (mm)</span>
              <input
                  type="number"
                  value={marginTop}
                  onChange={(e) => setMarginTop(Math.max(0, Number(e.target.value)))}
                  className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 w-16 text-xs text-gray-300 focus:border-purple-500 font-dmmono outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-dmmono text-[9px] text-gray-500 uppercase tracking-wider">Bottom Margin (mm)</span>
              <input
                  type="number"
                  value={marginBottom}
                  onChange={(e) => setMarginBottom(Math.max(0, Number(e.target.value)))}
                  className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 w-16 text-xs text-gray-300 focus:border-purple-500 font-dmmono outline-none"
              />
            </div>
          </div>
        </div>

        {/* Side-by-Side Application Workspace Layout */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">

          {/* Left Side: Real DOM Document Container Viewport */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border border-gray-900 rounded-xl overflow-hidden bg-gray-950/20 shadow-xl">
              <div className="bg-gray-950 px-4 py-3 border-b border-gray-900 flex justify-between items-center text-xs">
                <span className="font-syne font-bold text-gray-400">Live Visual Blueprint Document Canvas</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-dmmono text-purple-400">ACTIVE REGION</span>
              </div>
              <div className="p-6 max-h-[600px] overflow-y-auto custom-scroll bg-gray-900/10">
                <LivePreviewDoc
                    rowCount={rowCount}
                    pageSize={pageSize}
                    marginTop={marginTop}
                    marginBottom={marginBottom}
                    marginLeft={10}
                    marginRight={10}
                    onUpdateBlueprint={(blueprint, blockCount) => {
                      setTelemetryBlueprint(blueprint);
                      setObservedBlockCount(blockCount);
                    }}
                />
              </div>
            </div>
            <div className="p-4 rounded-xl border border-gray-900 bg-gray-950/40 text-xs text-gray-500 font-dmsans leading-relaxed">
              <span className="font-bold text-gray-300 block font-syne mb-0.5">Implementation Notice:</span>
              To implement this layout model in your codebase, position repeating loop lists directly within the master tracking element. This approach ensures correct height calculations for child blocks.
            </div>
          </div>

          {/* Right Side: Telemetry Monitor Log Dashboard */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-900 bg-gray-950 text-center space-y-0.5 shadow-md">
                <span className="block text-[9px] text-gray-500 font-dmmono uppercase tracking-wider">Computed Pages</span>
                <span className="text-2xl font-syne font-extrabold text-purple-400">{telemetryBlueprint?.totalPages || 0}</span>
              </div>
              <div className="p-4 rounded-xl border border-gray-900 bg-gray-950 text-center space-y-0.5 shadow-md">
                <span className="block text-[9px] text-gray-500 font-dmmono uppercase tracking-wider">Measured Blocks</span>
                <span className="text-2xl font-syne font-extrabold text-indigo-400">{observedBlockCount}</span>
              </div>
            </div>

            {/* Real Engine JSON Output Log Screen */}
            <div className="border border-gray-900 rounded-xl overflow-hidden bg-gray-950 shadow-2xl">
              <div className="bg-gray-950 px-4 py-2.5 border-b border-gray-900 flex justify-between items-center text-xs">
                <span className="font-dmmono font-medium text-gray-400">ENGINE_OUTPUT_STREAM.json</span>
                <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(telemetryBlueprint, null, 2))}
                    className="text-[10px] font-dmsans text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Copy JSON Stream
                </button>
              </div>
              <div className="p-4 overflow-x-auto custom-scroll max-h-[460px] font-dmmono text-xs text-emerald-400 leading-relaxed bg-black/30">
                {telemetryBlueprint ? (
                    <pre>{JSON.stringify({
                      library_version: "0.1.0",
                      page_size_format: pageSize,
                      computed_meta: {
                        allocated_pages: telemetryBlueprint.totalPages,
                        header_block_id: telemetryBlueprint.repeatHeaderBlockId
                      },
                      warnings: telemetryBlueprint.warnings,
                      pages_blueprint: telemetryBlueprint.pages.map(p => ({
                        pageIndex: p.pageNumber,
                        measured_height: `${p.contentHeight.toFixed(1)}px`, // STRÄNGEN ÄR FIXAD HÄR!
                        header_cloned: p.hasRepeatHeaderCopy,
                        assigned_blocks: p.blocks
                      }))
                    }, null, 2)}</pre>
                ) : (
                    <span className="text-gray-600 italic">Waiting for telemetry calculations...</span>
                )}
              </div>
            </div>

            {/* Internal Warnings Logger Screen */}
            <div className="rounded-xl border border-gray-900 bg-gray-950/20 p-4 space-y-2">
              <h4 className="font-syne text-xs font-bold text-gray-400 uppercase tracking-wider">Engine Process Logs</h4>
              {telemetryBlueprint && telemetryBlueprint.warnings.length > 0 ? (
                  <div className="space-y-1.5">
                    {telemetryBlueprint.warnings.map((w, i) => (
                        <div key={i} className="p-2 rounded border border-red-900/40 bg-red-950/20 text-xs font-dmmono text-red-400">
                          <strong>[{w.type.toUpperCase()}]:</strong> {w.message}
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="text-xs text-gray-500 font-dmsans italic bg-gray-950 px-3 py-2.5 rounded border border-gray-900 text-center">
                    Success: Zero dimension runtime discrepancies tracked. Element flows match calculated boundary limits.
                  </div>
              )}
            </div>

          </div>
        </div>
      </div>
  );
};

export default InteractiveDemo;