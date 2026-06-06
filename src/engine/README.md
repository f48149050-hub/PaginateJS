# Pagination Engine

The core logic for detecting page boundaries and protecting content sections.

## Concepts

**Page Boundary**: The physical edge of a page based on:
- Page size (A4, Letter)
- Margins (top, bottom, left, right)
- Actual DOM element heights

**Keep-Together Block**: Content that must not be split across pages:
- Totals sections
- Signature sections
- Custom blocks (data-keep-together="true")

**Repeat Header**: Content duplicated at the top of each page:
- Table headers (data-repeat-header="true")

## Files (Phase 2)

- `types.ts` - Type definitions
- `calculator.ts` - Page boundary calculations
- `analyzer.ts` - DOM analysis and block detection
- `paginator.ts` - Main pagination algorithm
