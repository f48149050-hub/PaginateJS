import React, { useEffect, useRef, useState } from 'react';
import { paginate } from '../../../engine/pagination';
import { analyzeDom } from '../../../engine/domAnalyzer';
import { PAGE_SIZES, PaginationResult, PageSizeType } from '../../../engine/types';

interface LivePreviewDocProps {
  rowCount: number;
  pageSize: PageSizeType;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  onUpdateBlueprint?: (result: PaginationResult, blockCount: number) => void;
}

const INVOICE_ITEMS = [
  { desc: 'UI Design — Homepage & Onboarding Flow',       hrs: 8,  rate: 180 },
  { desc: 'Frontend Development — React Dashboard',        hrs: 12, rate: 150 },
  { desc: 'Backend API — REST Endpoints',                  hrs: 10, rate: 165 },
  { desc: 'Database Architecture & Migration',             hrs: 5,  rate: 200 },
  { desc: 'Mobile App — iOS Integration',                  hrs: 7,  rate: 175 },
  { desc: 'QA Testing & Bug Fixes',                        hrs: 4,  rate: 130 },
  { desc: 'DevOps — CI/CD Pipeline Setup',                 hrs: 6,  rate: 185 },
  { desc: 'Security Audit & Penetration Test',             hrs: 3,  rate: 250 },
  { desc: 'Performance Optimisation — Core Web Vitals',    hrs: 5,  rate: 170 },
  { desc: 'Technical Documentation & Handover',            hrs: 4,  rate: 140 },
  { desc: 'Client Training Sessions (×3)',                 hrs: 3,  rate: 160 },
  { desc: 'Monthly Maintenance & Support',                 hrs: 8,  rate: 145 },
  { desc: 'Analytics Dashboard Integration',               hrs: 6,  rate: 165 },
  { desc: 'Stripe Payment Integration',                    hrs: 4,  rate: 175 },
  { desc: 'Code Review & Refactoring Sprint',              hrs: 5,  rate: 155 },
];

const CYAN_BADGE_INLINE: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 9,
  letterSpacing: '0.06em',
  color: '#06b6d4',
  background: 'rgba(6,182,212,0.06)',
  border: '1px solid rgba(6,182,212,0.25)',
  padding: '2px 8px',
  borderRadius: 4,
  textTransform: 'uppercase',
  display: 'inline-flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
};

const AMBER_BADGE: React.CSSProperties = {
  position: 'absolute',
  top: 8,
  right: 12,
  fontFamily: "'DM Mono', monospace",
  fontSize: 9,
  letterSpacing: '0.06em',
  color: '#d97706',
  background: 'rgba(217,119,6,0.06)',
  border: '1px solid rgba(217,119,6,0.25)',
  padding: '2px 8px',
  borderRadius: 4,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

export const LivePreviewDoc: React.FC<LivePreviewDocProps> = ({
                                                                rowCount, pageSize, marginTop, marginBottom, marginLeft, marginRight,
                                                                onUpdateBlueprint
                                                              }) => {
  const containerRef   = useRef<HTMLDivElement>(null);
  const lastResultRef  = useRef<PaginationResult | null>(null);
  const [, setForceUpdate] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // ── Engine run ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    const run = async () => {
      if (document.fonts?.ready) await document.fonts.ready;
      if (cancelled) return;

      container.querySelectorAll('.engine-page-break-line, .engine-header-copy')
          .forEach(el => el.remove());

      try {
        const enginePlan = paginate(container, {
          pageSize, marginTop, marginBottom, marginLeft, marginRight
        });

        lastResultRef.current = enginePlan;

        const parsedBlocks = analyzeDom(container, {
          pageSize: PAGE_SIZES[pageSize], marginTop, marginBottom
        });

        const nodeMap = new Map<string, HTMLElement>();
        for (const b of parsedBlocks) nodeMap.set(b.blockId, b.element);

        const headerEl = container.querySelector('[data-repeat-header="true"]') as HTMLElement | null;

        for (const page of enginePlan.pages) {
          if (page.pageNumber === 1) continue;
          const firstBlock = page.blocks.find(b => !b.isRepeatHeaderCopy);
          if (!firstBlock) continue;
          const target = nodeMap.get(firstBlock.blockId);
          if (!target?.parentNode) continue;

          const breakEl = document.createElement('div');
          breakEl.className = 'engine-page-break-line';
          breakEl.style.cssText = `
            border-top: 2px dashed #f87171;
            padding: 12px 24px 6px;
            display: flex; align-items: center; gap: 12px;
            background: linear-gradient(180deg, rgba(248,113,113,0.04) 0%, transparent 100%);
          `;
          breakEl.innerHTML = `
            <div style="flex:1;height:1px;background:rgba(248,113,113,0.2)"></div>
            <div style="font-family:'DM Mono',monospace;font-size:9px;letter-spacing:0.08em;color:#f87171;
              background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.25);
              padding:3px 14px;border-radius:6px;white-space:nowrap;text-transform:uppercase;font-weight:600;">
              ── Page ${page.pageNumber} starts here ──
            </div>
            <div style="flex:1;height:1px;background:rgba(248,113,113,0.2)"></div>
          `;
          target.parentNode.insertBefore(breakEl, target);

          if (headerEl) {
            const copy = headerEl.cloneNode(true) as HTMLElement;
            copy.className = 'engine-header-copy';
            copy.style.cssText = `outline:2px solid rgba(6,182,212,0.4);outline-offset:-2px;position:relative;background:rgba(6,182,212,0.01);`;
            const badge = copy.querySelector('[data-header-badge]') as HTMLElement | null;
            if (badge) {
              badge.textContent = `↺ Header copy — page ${page.pageNumber}`;
              badge.style.color = '#0891b2';
              badge.style.background = 'rgba(6,182,212,0.1)';
              badge.style.borderColor = 'rgba(6,182,212,0.4)';
            }
            target.parentNode.insertBefore(copy, target);
          }
        }

        if (onUpdateBlueprint) {
          onUpdateBlueprint(enginePlan, parsedBlocks.length);
        }
      } catch (err) {
        console.error('Pagination engine error:', err);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [rowCount, pageSize, marginTop, marginBottom, marginLeft, marginRight]);

  useEffect(() => {
    const t = setTimeout(() => setForceUpdate(p => p + 1), 60);
    return () => clearTimeout(t);
  }, [rowCount]);

  // ── PDF Export ──────────────────────────────────────────────────────────────
  const exportPDF = async () => {
    const container = containerRef.current;
    const result    = lastResultRef.current;
    if (!container || !result) return;

    setExporting(true);
    setExportError(null);

    try {
      // Get fresh block measurements (without injected markers)
      const blocks = analyzeDom(container, {
        pageSize: PAGE_SIZES[pageSize], marginTop, marginBottom
      });

      // Build blockId → clean HTML map
      const blockHtmlMap = new Map<string, string>();
      for (const block of blocks) {
        // Clone element so we don't mutate the live DOM
        const clone = block.element.cloneNode(true) as HTMLElement;
        // Remove any injected engine markers that leaked in
        clone.querySelectorAll('.engine-page-break-line, .engine-header-copy')
            .forEach(el => el.remove());
        blockHtmlMap.set(block.blockId, clone.outerHTML);
      }

      const headerBlockId = result.repeatHeaderBlockId;
      const headerHtml    = headerBlockId ? (blockHtmlMap.get(headerBlockId) ?? '') : '';

      // Build per-page data for the server
      const pages = result.pages.map(page => {
        const contentHtml = page.blocks
            .filter(b => !b.isRepeatHeaderCopy && b.blockId !== headerBlockId)
            .map(b => blockHtmlMap.get(b.blockId) ?? '')
            .join('');
        console.log(
            result.pages.map(p => ({
              blocks: p.blocks.length,
              height: p.contentHeight
            }))
        );
        return {headerHtml, contentHtml};
      });

      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages,
          pageSize,
          marginTop,
          marginBottom,
          marginLeft,
          marginRight,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error ${res.status}`);
      }

      // Download the PDF
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'invoice.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('PDF export error:', err);
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  // ── Row data ────────────────────────────────────────────────────────────────
  const rows = Array.from({ length: rowCount }, (_, i) => {
    const item   = INVOICE_ITEMS[i % INVOICE_ITEMS.length];
    const suffix = i >= INVOICE_ITEMS.length
        ? ` (×${Math.floor(i / INVOICE_ITEMS.length) + 1})`
        : '';
    return { id: i + 1, desc: item.desc + suffix, hrs: item.hrs, rate: item.rate, amount: item.hrs * item.rate };
  });

  const subtotal = rows.reduce((s, r) => s + r.amount, 0);
  const tax      = Math.round(subtotal * 0.1);
  const total    = subtotal + tax;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
      <div className="w-full space-y-3">

        {/* Export button — sits above the invoice */}
        <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-dmmono">
          {lastResultRef.current
              ? `${lastResultRef.current.totalPages} page${lastResultRef.current.totalPages !== 1 ? 's' : ''} calculated`
              : 'Calculating…'}
        </span>
          <div className="flex items-center gap-3">
            {exportError && (
                <span className="text-xs text-red-400 font-dmmono">{exportError}</span>
            )}
            <button
                onClick={exportPDF}
                disabled={exporting || !lastResultRef.current}
                className={`
              px-4 py-2 rounded-lg text-xs font-bold font-dmsans transition-all
              flex items-center gap-2
              ${exporting || !lastResultRef.current
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30'}
            `}
            >
              {exporting ? (
                  <>
                    <span className="animate-spin">⟳</span>
                    Generating PDF…
                  </>
              ) : (
                  <>
                    ↓ Export PDF
                  </>
              )}
            </button>
          </div>
        </div>

        {/* Invoice document */}
        <div className="w-full bg-white text-gray-900 rounded-xl shadow-2xl select-none overflow-hidden">
          <div ref={containerRef} className="w-full" style={{ fontSize: 11, lineHeight: 1.5 }}>

            {/* BLOCK 1: Repeat Header */}
            <div
                data-repeat-header="true"
                style={{ padding: '16px 24px 0', borderBottom: '2px solid #111827', position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: '#111827' }}>
                    INVOICE
                  </span>
                    <span data-header-badge style={CYAN_BADGE_INLINE}>↺ Repeats on every page</span>
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#6b7280', marginTop: 4 }}>
                    INV-2026-0041 · Issued 4 Jun 2026 · Due 18 Jun 2026
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 10, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                  <div style={{ fontWeight: 700, color: '#111827' }}>Meridian Studio AB</div>
                  <div style={{ color: '#6b7280' }}>To: Northfield Corp Ltd</div>
                </div>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: '4fr 1fr 1.2fr 1.2fr',
                padding: '5px 0', borderTop: '1px solid #e5e7eb',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#9ca3af',
                fontFamily: "'DM Mono', monospace",
              }}>
                <div>Description</div>
                <div style={{ textAlign: 'center' }}>Hrs</div>
                <div style={{ textAlign: 'right' }}>Rate</div>
                <div style={{ textAlign: 'right' }}>Amount</div>
              </div>
            </div>

            {/* BLOCKS 2…N: Invoice rows */}
            {rows.map(row => (
                <div
                    key={row.id}
                    style={{
                      display: 'grid', gridTemplateColumns: '4fr 1fr 1.2fr 1.2fr',
                      padding: '8px 24px', borderBottom: '1px solid #f3f4f6',
                      color: '#374151', alignItems: 'center',
                    }}
                >
                  <div style={{ fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{row.desc}</div>
                  <div style={{ textAlign: 'center', color: '#9ca3af', fontFamily: "'DM Mono', monospace" }}>{row.hrs}h</div>
                  <div style={{ textAlign: 'right', color: '#9ca3af', fontFamily: "'DM Mono', monospace" }}>${row.rate}/h</div>
                  <div style={{ textAlign: 'right', fontWeight: 600, color: '#111827', fontFamily: "'DM Mono', monospace" }}>
                    ${row.amount.toLocaleString()}
                  </div>
                </div>
            ))}

            {/* BLOCK N+1: Totals */}
            <div
                data-keep-together="true"
                style={{ padding: '16px 24px', background: '#fafafa', borderTop: '2px solid #111827', position: 'relative' }}
            >
              <div style={AMBER_BADGE}>⚓ Keep together</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, paddingTop: 4 }}>
                {[
                  { label: 'Subtotal',  val: `$${subtotal.toLocaleString()}` },
                  { label: 'VAT (10%)', val: `$${tax.toLocaleString()}` },
                ].map(({ label, val }) => (
                    <div key={label} style={{ display: 'flex', gap: 40, color: '#4b5563', fontSize: 10 }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", minWidth: 90, textAlign: 'right' }}>{val}</span>
                    </div>
                ))}
                <div style={{ display: 'flex', gap: 40, fontSize: 13, fontWeight: 700, color: '#111827', borderTop: '1px solid #e5e7eb', paddingTop: 6, marginTop: 2 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif" }}>Total Due</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", minWidth: 90, textAlign: 'right' }}>
                  ${total.toLocaleString()}
                </span>
                </div>
              </div>
            </div>

            {/* BLOCK N+2: Signature */}
            <div
                data-keep-together="true"
                style={{ padding: '16px 24px 24px', position: 'relative', background: '#ffffff' }}
            >
              <div style={AMBER_BADGE}>⚓ Keep together</div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 12, marginTop: 8, fontFamily: "'DM Mono', monospace" }}>
                Authorised Signature
              </div>
              <div style={{ borderBottom: '1px solid #9ca3af', width: 220, marginBottom: 6 }} />
              <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
                Name & Date · Meridian Studio AB
              </div>
            </div>

          </div>
        </div>
      </div>
  );
};