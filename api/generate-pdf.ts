import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { maxDuration: 30 };

interface PageData {
    headerHtml: string;
    contentHtml: string;
}

interface GeneratePDFRequest {
    pages: PageData[];
    pageSize: 'A4' | 'Letter';
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const token = process.env.BROWSERLESS_TOKEN;
    if (!token) return res.status(500).send('BROWSERLESS_TOKEN not configured');

    const {
        pages,
        pageSize,
    } = req.body as GeneratePDFRequest;

    if (!pages?.length) return res.status(400).send('No pages provided');

    const html = buildHtml(pages, pageSize);

    try {
        const browserlessRes = await fetch(
            `https://production-sfo.browserless.io/pdf?token=${token}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    html,
                    options: {
                        printBackground: true,
                        preferCSSPageSize: true,
                        // Margins are handled by @page CSS to match what the engine calculated
                    },
                    // Wait for network idle so ALL Google Fonts finish loading
                    // before Browserless measures any text
                    gotoOptions: {
                        waitUntil: 'networkidle2',
                        timeout: 20000,
                    },
                }),
            }
        );

        if (!browserlessRes.ok) {
            const errorText = await browserlessRes.text();
            console.error('Browserless error:', errorText);
            return res.status(500).send(`PDF generation failed: ${errorText}`);
        }

        const pdfBuffer = await browserlessRes.arrayBuffer();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
        return res.status(200).send(Buffer.from(pdfBuffer));

    } catch (err) {
        console.error('PDF generation error:', err);
        return res.status(500).send(`PDF generation failed: ${String(err)}`);
    }
}

function buildHtml(
    pages: PageData[],
    pageSize: 'A4' | 'Letter',
): string {
    const pagesHtml = pages
        .map(page => `
      <div class="pdf-page">
        ${page.headerHtml}
        ${page.contentHtml}
      </div>`)
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <!--
    ALL THREE fonts must be loaded — the pagination engine measured
    element heights using these exact fonts in the browser.
    If any font falls back to Arial/Helvetica, text reflows,
    row heights change, and page breaks drift.
  -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      line-height: 1.5;
      background: white;
      color: #111827;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /*
      NO fixed height. NO overflow: hidden.
      The pagination engine already determined what content goes on each page.
      Each .pdf-page div contains exactly the right blocks — let them flow
      naturally. page-break-after tells Chrome where to cut the PDF.
    */
.pdf-page {
    width: 210mm;
    height: 297mm;
    overflow: hidden;
    background: white;
    page-break-after: always;
}

    .pdf-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    /* Hide preview-only annotation elements */
    [data-header-badge],
    .engine-page-break-line,
    .engine-header-copy {
      display: none !important;
    }

    /*
      @page margins must match exactly what the pagination engine used.
      The engine calculated available height as:
        (pageHeight × MM_TO_PX) - (marginTop × MM_TO_PX) - (marginBottom × MM_TO_PX)
      So Browserless must use the same margins when rendering.
    */
    @page {
      size: ${pageSize};
      margin: 0;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
}