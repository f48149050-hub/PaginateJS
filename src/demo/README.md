# Demo: Invoice Generator

## manualVerification.html

**Purpose**: Visual verification of the pagination engine before PDF generation.

### How to Use

1. Open `src/demo/manualVerification.html` in a web browser
2. Select the number of invoice rows (10, 25, 50, or 100)
3. Select page size (A4 or Letter)
4. Click "Refresh" to see pagination results
5. Observe:
   - **Left panel**: Rendered invoice with visual page breaks
   - **Right panel**: Pagination analysis showing which rows go on which page

### What It Shows

✅ **Page Boundaries**: Red dashed lines show where pages break

✅ **Row Distribution**: Displays which rows appear on each page

✅ **Keep-Together Blocks**: Highlights totals and signature sections that can't be split

✅ **Header Repetition**: Shows where repeat-headers appear on pages 2+

✅ **Content Height**: Shows actual height used on each page

### Example: 25 Row Invoice

```
Page 1:
- Header (repeated header on this page)
- Rows 1-22
- Total height: ~660px

Page 2:
- Header (repeated)
- Rows 23-25
- Totals (keep-together block)
- Signature (keep-together block)
- Total height: ~386px
```

### Measurement Details

- **Page height**: 1122px (A4 at 96 DPI)
- **Margins**: 10mm top + 10mm bottom = 76px
- **Available height**: 1046px
- **Row height**: ~30px
- **Header height**: ~40px
- **Totals**: ~80px (keep-together)
- **Signature**: ~80px (keep-together)

### Next Steps (Phase 3)

After verifying pagination is correct, Phase 3 will convert this pagination plan into actual PDF pages using jsPDF + html2canvas.
