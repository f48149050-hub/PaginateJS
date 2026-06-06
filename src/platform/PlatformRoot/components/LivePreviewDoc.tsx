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

// Realistic invoice items — shows real business value, not tech jargon
const INVOICE_ITEMS = [
  { desc: 'UI Design — Homepage & Onboarding Flow',          hrs: 8,  rate: 180 },
  { desc: 'Frontend Development — React Dashboard',           hrs: 12, rate: 150 },
  { desc: 'Backend API — REST Endpoints',                     hrs: 10, rate: 165 },
  { desc: 'Database Architecture & Migration',                hrs: 5,  rate: 200 },
  { desc: 'Mobile App — iOS Integration',                     hrs: 7,  rate: 175 },
  { desc: 'QA Testing & Bug Fixes',                           hrs: 4,  rate: 130 },
  { desc: 'DevOps — CI/CD Pipeline Setup',                    hrs: 6,  rate: 185 },
  { desc: 'Security Audit & Penetration Test',                hrs: 3,  rate: 250 },
  { desc: 'Performance Optimisation — Core Web Vitals',       hrs: 5,  rate: 170 },
  { desc: 'Technical Documentation & Handover',               hrs: 4,  rate: 140 },
  { desc: 'Client Training Sessions (×3)',                    hrs: 3,  rate: 160 },
  { desc: 'Monthly Maintenance & Support',                    hrs: 8,  rate: 145 },
  { desc: 'Analytics Dashboard Integration',                  hrs: 6,  rate: 165 },
  { desc: 'Stripe Payment Integration',                       hrs: 4,  rate: 175 },
  { desc: 'Code Review & Refactoring Sprint',                 hrs: 5,  rate: 155 },
];

// Inline badge — sits next to the invoice title, never overlaps content
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

// Amber badge — top-right, inside the block's own padding so it never covers row content
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const run = async () => {
      // Font readiness guard — without this, getBoundingClientRect returns
      // fallback-font heights and page breaks land in the wrong places
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      if (cancelled) return;

      // Clean up all previously injected markers before re-running
      container.querySelectorAll('.engine-page-break-line, .engine-header-copy')
          .forEach(el => el.remove());

      try {
        const enginePlan = paginate(container, {
          pageSize, marginTop, marginBottom, marginLeft, marginRight
        });

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

          // 1 — Page break divider line
          const breakEl = document.createElement('div');
          breakEl.className = 'engine-page-break-line';
          breakEl.style.cssText = `
            border-top: 2px dashed #f87171;
            padding: 12px 24px 6px;
            display: flex;
            align-items: center;
            gap: 12px;
            background: linear-gradient(180deg, rgba(248,113,113,0.04) 0%, transparent 100%);
          `;
          breakEl.innerHTML = `
            <div style="flex:1;height:1px;background:rgba(248,113,113,0.2)"></div>
            <div style="
              font-family:'DM Mono',monospace; font-size:9px;
              letter-spacing:0.08em; color:#f87171;
              background:rgba(248,113,113,0.06);
              border:1px solid rgba(248,113,113,0.25);
              padding:3px 14px; border-radius:6px;
              white-space:nowrap; text-transform:uppercase; font-weight:600;
            ">── Page ${page.pageNumber} starts here ──</div>
            <div style="flex:1;height:1px;background:rgba(248,113,113,0.2)"></div>
          `;
          target.parentNode.insertBefore(breakEl, target);

          // 2 — Visual header copy so the viewer can SEE it repeating
          if (headerEl) {
            const copy = headerEl.cloneNode(true) as HTMLElement;
            copy.className = 'engine-header-copy';
            copy.style.cssText = `
              outline: 2px solid rgba(6,182,212,0.4);
              outline-offset: -2px;
              position: relative;
              background: rgba(6,182,212,0.01);
            `;
            // Update the badge to show which page this copy is for
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

  const rows = Array.from({ length: rowCount }, (_, i) => {
    const item = INVOICE_ITEMS[i % INVOICE_ITEMS.length];
    const suffix = i >= INVOICE_ITEMS.length
        ? ` (×${Math.floor(i / INVOICE_ITEMS.length) + 1})`
        : '';
    return {
      id: i + 1,
      desc: item.desc + suffix,
      hrs: item.hrs,
      rate: item.rate,
      amount: item.hrs * item.rate
    };
  });

  const subtotal = rows.reduce((s, r) => s + r.amount, 0);
  const tax      = Math.round(subtotal * 0.1);
  const total    = subtotal + tax;

  return (
      <div className="w-full bg-white text-gray-900 rounded-xl shadow-2xl select-none overflow-hidden">
        <div ref={containerRef} className="w-full" style={{ fontSize: 11, lineHeight: 1.5 }}>

          {/* ── BLOCK 1: Repeat Header ── */}
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
                  {/* data-header-badge is read by the engine when cloning this header */}
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

            {/* Column headers — inside repeat header so they repeat too */}
            <div style={{
              display: 'grid', gridTemplateColumns: '4fr 1fr 1.2fr 1.2fr',
              padding: '5px 0', borderTop: '1px solid #e5e7eb',
              fontSize: 9, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: '#9ca3af', fontFamily: "'DM Mono', monospace",
            }}>
              <div>Description</div>
              <div style={{ textAlign: 'center' }}>Hrs</div>
              <div style={{ textAlign: 'right' }}>Rate</div>
              <div style={{ textAlign: 'right' }}>Amount</div>
            </div>
          </div>

          {/* ── BLOCKS 2…N: Invoice rows ── */}
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

          {/* ── BLOCK N+1: Totals (keep-together) ── */}
          <div
              data-keep-together="true"
              style={{ padding: '16px 24px', background: '#fafafa', borderTop: '2px solid #111827', position: 'relative' }}
          >
            <div style={AMBER_BADGE}>⚓ Keep together</div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, paddingTop: 4 }}>
              {[
                { label: 'Subtotal',   val: `$${subtotal.toLocaleString()}` },
                { label: 'VAT (10%)', val: `$${tax.toLocaleString()}` },
              ].map(({ label, val }) => (
                  <div key={label} style={{ display: 'flex', gap: 40, color: '#4b5563', fontSize: 10 }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", minWidth: 90, textAlign: 'right' }}>{val}</span>
                  </div>
              ))}
              <div style={{
                display: 'flex', gap: 40, fontSize: 13, fontWeight: 700, color: '#111827',
                borderTop: '1px solid #e5e7eb', paddingTop: 6, marginTop: 2,
              }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif" }}>Total Due</span>
                <span style={{ fontFamily: "'DM Mono', monospace", minWidth: 90, textAlign: 'right' }}>
                ${total.toLocaleString()}
              </span>
              </div>
            </div>
          </div>

          {/* ── BLOCK N+2: Signature (keep-together) ── */}
          <div
              data-keep-together="true"
              style={{ padding: '16px 24px 24px', position: 'relative', background: '#ffffff' }}
          >
            <div style={AMBER_BADGE}>⚓ Keep together</div>

            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: '#9ca3af',
              marginBottom: 12, marginTop: 8,
              fontFamily: "'DM Mono', monospace",
            }}>
              Authorised Signature
            </div>
            <div style={{ borderBottom: '1px solid #9ca3af', width: 220, marginBottom: 6 }} />
            <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
              Name & Date · Meridian Studio AB
            </div>
          </div>

        </div>
      </div>
  );
};