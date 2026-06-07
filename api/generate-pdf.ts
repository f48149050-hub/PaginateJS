import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
    maxDuration: 30,
};

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

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const token = process.env.BROWSERLESS_TOKEN;

    if (!token) {
        return res.status(500).send('BROWSERLESS_TOKEN not configured');
    }

    const { pages, pageSize } = req.body as GeneratePDFRequest;

    if (!pages?.length) {
        return res.status(400).send('No pages provided');
    }

    const html = buildHtml(pages, pageSize);

    try {
        const browserlessRes = await fetch(
            `https://production-sfo.browserless.io/pdf?token=${token}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    html,
                }),
            }
        );

        if (!browserlessRes.ok) {
            const errorText = await browserlessRes.text();

            console.error('Browserless status:', browserlessRes.status);
            console.error('Browserless error:', errorText);

            return res
                .status(500)
                .send(`PDF generation failed: ${errorText}`);
        }

        const pdfBuffer = await browserlessRes.arrayBuffer();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="document.pdf"'
        );

        return res.status(200).send(Buffer.from(pdfBuffer));
    } catch (err) {
        console.error('PDF generation error:', err);

        return res
            .status(500)
            .send(`PDF generation failed: ${String(err)}`);
    }
}

function buildHtml(
    pages: PageData[],
    pageSize: 'A4' | 'Letter'
): string {
    const pagesHtml = pages
        .map(
            (page) => `
      <div class="pdf-page">
        ${page.headerHtml}
        ${page.contentHtml}
      </div>
    `
        )
        .join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: sans-serif;
    font-size: 11px;
    line-height: 1.5;
    background: white;
    color: #111827;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

.pdf-page {
  width: 210mm;
  height: 297mm;
  padding: 20mm 15mm 20mm 15mm; /* exempel */
  box-sizing: border-box;
  overflow: hidden;
  background: white;
  page-break-after: always;
}
  .pdf-page:last-child {
    page-break-after: auto;
  }

  [data-header-badge],
  .engine-page-break-line,
  .engine-header-copy {
    display: none !important;
  }

  @page {
    size: ${pageSize};
  }
</style>
</head>
<body>
${pagesHtml}
</body>
</html>
`;
}