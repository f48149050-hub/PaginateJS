# Smart PDF Exporter

Clean PDF generation for Bubble invoices, quotes, and reports.

Never get cut-off invoices again.

## Problem

Bubble developers frequently export invoices, quotes, reports, receipts, and purchase orders to PDF. Most solutions cut rows in half, split totals across pages, or split signatures onto separate pages.

## Solution

A production-ready Bubble plugin that generates clean multi-page PDFs with:

- Automatic page break detection
- Repeated table headers
- Protected totals sections
- Protected signature sections
- Automatic page numbering

## Phases

- Phase 1: Project structure
- Phase 2: Pagination engine
- Phase 3: PDF generation
- Phase 4: Bubble plugin wrapper
- Phase 5: Demo invoice generator
- Phase 6: Documentation

## Quick Start

```bash
npm install
npm run dev
npm test
```

## Directory Structure

```
src/
├── components/     # React components
├── engine/         # Pagination engine (core logic)
├── bubble/         # Bubble plugin integration
├── demo/           # Demo invoice generator
└── index.ts        # Main export
tests/              # Unit tests
docs/               # Documentation
```
