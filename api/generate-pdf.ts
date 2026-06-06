/**
 * POST /api/generate-pdf
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const config = { maxDuration: 60 };

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

export default async function handler(req: Request): Promise<Response> {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    let body: GeneratePDFRequest;
    try {
        body = await req.json();
    } catch {
        return new Response('Invalid JSON body', { status: 400 });
    }

    const { pages, pageSize, marginTop, marginBottom, marginLeft, marginRight } = body;

    if (!pages?.length) {
        return new Response('No pages provided', { status: 400 });
    }

    const html = buildHtml(pages, pageSize);

    let browser;
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: true, // fixed: don't use chromium.headless
        });

        const page = await browser.newPage();

        // fixed: 'networkidle0' removed in newer Puppeteer — use 'load'
        await page.setContent(html, { waitUntil: 'load' });

        // Extra wait for Google Fonts to finish rendering
        await new Promise(resolve => setTimeout(resolve, 1500));

        const pdfUint8Array = await page.pdf({
            format: pageSize === 'Letter' ? 'Letter' : 'A4',
            printBackground: true,
            margin: {
                top:    `${marginTop}mm`,
                bottom: `${marginBottom}mm`,
                left:   `${marginLeft}mm`,
                right:  `${marginRight}mm`,
            },
        });

        // fixed: convert Uint8Array to Buffer so Response accepts it
        const pdfBuffer = Buffer.from(pdfUint8Array);

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="invoice.pdf"',
            },
        });

    } catch (err) {
        console.error('PDF generation error:', err);
        return new Response(`PDF generation failed: ${String(err)}`, {
            status: 500,
            headers: corsHeaders,
        });
    } finally {
        if (browser) await browser.close();
    }
}

function buildHtml(pages: PageData[], pageSize: 'A4' | 'Letter'): string {
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      line-height: 1.5;
      background: white;
      color: #111827;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .pdf-page { page-break-after: always; background: white; }
    .pdf-page:last-child { page-break-after: auto; }
    [data-header-badge],
    .engine-page-break-line,
    .engine-header-copy { display: none !important; }
    @page { size: ${pageSize}; }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
}