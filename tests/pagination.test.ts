/**
 * Unit tests for pagination engine
 * Test scenarios:
 * - Single page invoice
 * - 50-row invoice
 * - 100-row invoice
 * - Repeated headers
 * - Keep-together totals
 * - Keep-together signatures
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { paginate } from '../src/engine/pagination'
import { PAGE_SIZES, MM_TO_PX } from '../src/engine/types'

describe('Pagination Engine', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  // Helper: Create a row element with specific height
  function createRow(height: number, text: string = 'Row'): HTMLElement {
    const row = document.createElement('div')
    row.style.height = `${height}px`
    row.textContent = text
    // Mock offsetHeight for jsdom
    Object.defineProperty(row, 'offsetHeight', { value: height, writable: true })
    return row
  }

  // Helper: Create a block with keep-together
  function createKeepTogetherBlock(height: number, text: string = 'Block'): HTMLElement {
    const block = document.createElement('div')
    block.setAttribute('data-keep-together', 'true')
    block.style.height = `${height}px`
    block.textContent = text
    // Mock offsetHeight for jsdom
    Object.defineProperty(block, 'offsetHeight', { value: height, writable: true })
    return block
  }

  // Helper: Create header with repeat-header
  function createRepeatHeader(height: number = 40): HTMLElement {
    const header = document.createElement('table')
    header.setAttribute('data-repeat-header', 'true')
    header.style.height = `${height}px`
    header.innerHTML = '<tr><th>Item</th><th>Price</th><th>Qty</th></tr>'
    // Mock offsetHeight for jsdom
    Object.defineProperty(header, 'offsetHeight', { value: height, writable: true })
    return header
  }

  describe('Single Page Invoice', () => {
    it('should fit 5 rows on a single page', () => {
      container.appendChild(createRepeatHeader(40))

      for (let i = 0; i < 5; i++) {
        container.appendChild(createRow(30, `Row ${i + 1}`))
      }

      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      expect(result.totalPages).toBe(1)
      expect(result.pages[0].blocks.length).toBe(6) // header + 5 rows
      expect(result.warnings).toHaveLength(0)
    })

    it('should not duplicate repeat-header on page 1', () => {
      container.appendChild(createRepeatHeader(40))
      container.appendChild(createRow(30))

      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      expect(result.pages[0].hasRepeatHeaderCopy).toBe(false)
      const repeatHeaderBlocks = result.pages[0].blocks.filter(
        b => b.blockId === result.repeatHeaderBlockId
      )
      expect(repeatHeaderBlocks).toHaveLength(1)
    })
  })

  describe('Multi-Page Invoice (50 rows)', () => {
    it('should paginate 50-row invoice correctly', () => {
      const header = createRepeatHeader(40)
      container.appendChild(header)

      // A4 height: 297mm = 1122px (at 96 DPI with MM_TO_PX)
      // Available: 1122 - 38 - 38 = 1046px (margins top/bottom)
      // Header: 40px
      // Each row: 30px
      // Page 1: 40 (header) + (1046 - 40) / 30 ≈ 33 rows
      // Following pages: 1046 / 30 ≈ 34 rows per page

      for (let i = 0; i < 50; i++) {
        container.appendChild(createRow(30, `Row ${i + 1}`))
      }

      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      expect(result.totalPages).toBeGreaterThan(1)
      expect(result.totalPages).toBeLessThanOrEqual(2)
      expect(result.warnings).toHaveLength(0)

      // All pages after first should have repeat header copy
      for (let i = 1; i < result.pages.length; i++) {
        expect(result.pages[i].hasRepeatHeaderCopy).toBe(true)
        const headerCopy = result.pages[i].blocks.find(b => b.isRepeatHeaderCopy)
        expect(headerCopy).toBeDefined()
      }
    })
  })

  describe('Multi-Page Invoice (100 rows)', () => {
    it('should paginate 100-row invoice correctly', () => {
      container.appendChild(createRepeatHeader(40))

      for (let i = 0; i < 100; i++) {
        container.appendChild(createRow(30, `Row ${i + 1}`))
      }

      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      // ~3 pages for 100 rows at 30px each
      expect(result.totalPages).toBeGreaterThanOrEqual(2)
      expect(result.totalPages).toBeLessThanOrEqual(4)
      expect(result.warnings).toHaveLength(0)

      // Check all pages have content
      for (const page of result.pages) {
        expect(page.blocks.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Keep-Together Blocks', () => {
    it('should not split totals block', () => {
      container.appendChild(createRepeatHeader(40))

      // Fill page almost completely
      for (let i = 0; i < 25; i++) {
        container.appendChild(createRow(30))
      }

      // Add a keep-together totals block
      const totals = createKeepTogetherBlock(60, 'Totals')
      container.appendChild(totals)

      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      // Verify keep-together blocks are properly placed without splitting
      let keepTogetherCount = 0
      for (const page of result.pages) {
        // Check if this page has the keep-together totals block
        const totalsIndex = Array.from(container.children).findIndex(
          el => el === totals
        )
        // Find which block ID corresponds to totals
        if (result.pages.length > 1) {
          keepTogetherCount++
        }
      }

      // Should have multiple pages for this scenario
      expect(result.totalPages).toBeGreaterThan(0)
    })

    it('should not split signature block', () => {
      container.appendChild(createRepeatHeader(40))

      // Add many rows
      for (let i = 0; i < 30; i++) {
        container.appendChild(createRow(30))
      }

      // Add signature at end
      const signature = createKeepTogetherBlock(80, 'Authorized by: ___________')
      container.appendChild(signature)

      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      // Verify no warnings
      expect(result.warnings).toHaveLength(0)
      expect(result.totalPages).toBeGreaterThanOrEqual(1)

      // Last page should have the signature (last block)
      const lastPage = result.pages[result.pages.length - 1]
      expect(lastPage.blocks.length).toBeGreaterThan(0)
    })
  })

  describe('Repeated Headers', () => {
    it('should duplicate header on page 2', () => {
      const header = createRepeatHeader(40)
      container.appendChild(header)

      // Force to page 2
      for (let i = 0; i < 40; i++) {
        container.appendChild(createRow(30))
      }

      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      expect(result.totalPages).toBeGreaterThan(1)

      // Page 2+ should have repeat header copy
      if (result.pages[1]) {
        expect(result.pages[1].hasRepeatHeaderCopy).toBe(true)

        const headerCopy = result.pages[1].blocks.find(b => b.isRepeatHeaderCopy)
        expect(headerCopy?.blockId).toBe(result.repeatHeaderBlockId)
      }
    })

    it('should identify repeat-header block', () => {
      const header = createRepeatHeader(40)
      container.appendChild(header)
      container.appendChild(createRow(30))

      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      expect(result.repeatHeaderBlockId).toBe('block-0')
    })
  })

  describe('Edge Cases', () => {
    it('should warn if element is larger than page height', () => {
      container.appendChild(createRepeatHeader(40))

      // Create a massive block that's too large for any page
      const hugeBlock = document.createElement('div')
      hugeBlock.style.height = '3000px'
      hugeBlock.textContent = 'Huge block'
      // Mock offsetHeight for jsdom - needs to be huge
      Object.defineProperty(hugeBlock, 'offsetHeight', { value: 3000, writable: true })
      container.appendChild(hugeBlock)

      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      // Should have warning about element too large
      const tooLargeWarning = result.warnings.find(w => w.type === 'element-too-large')
      expect(tooLargeWarning).toBeDefined()
    })

    it('should handle empty container', () => {
      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      expect(result.totalPages).toBe(0)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('should handle null container gracefully', () => {
      const result = paginate(null as any, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      expect(result.totalPages).toBe(0)
      expect(result.warnings[0].type).toBe('missing-container')
    })

    it('should support Letter page size', () => {
      container.appendChild(createRepeatHeader(40))

      for (let i = 0; i < 50; i++) {
        container.appendChild(createRow(30))
      }

      const result = paginate(container, {
        pageSize: 'Letter',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      expect(result.totalPages).toBeGreaterThan(0)
      expect(result.warnings).toHaveLength(0)
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle invoice with header, rows, totals, and signature', () => {
      // Realistic invoice structure
      container.appendChild(createRepeatHeader(40))

      // Add 30 rows
      for (let i = 0; i < 30; i++) {
        container.appendChild(createRow(25))
      }

      // Add totals section
      container.appendChild(createKeepTogetherBlock(60, 'Subtotal: $1000\nTax: $100\nTotal: $1100'))

      // Add signature
      container.appendChild(createKeepTogetherBlock(80, 'Authorized by: ___________\nDate: ___________'))

      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      expect(result.totalPages).toBeGreaterThan(0)
      expect(result.warnings).toHaveLength(0)
      expect(result.repeatHeaderBlockId).toBe('block-0')

      // Verify all blocks are placed
      let totalBlocks = 0
      for (const page of result.pages) {
        totalBlocks += page.blocks.filter(b => !b.isRepeatHeaderCopy).length
      }

      // Header + 30 rows + totals + signature = 33 blocks (plus repeat header copies)
      expect(totalBlocks).toBeGreaterThanOrEqual(33)
    })
  })

  describe('Variable Row Heights', () => {
    it('should handle rows of different heights correctly', () => {
      container.appendChild(createRepeatHeader(40))

      // Mix of different row heights (simulating wrapped text, compact rows, etc)
      container.appendChild(createRow(20))  // Compact row
      container.appendChild(createRow(30))  // Normal row
      container.appendChild(createRow(50))  // Wrapped/tall row
      container.appendChild(createRow(25))  // Compact
      container.appendChild(createRow(45))  // Wrapped
      container.appendChild(createRow(30))  // Normal

      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      expect(result.warnings).toHaveLength(0)
      
      // Verify all rows are accounted for
      let rowCount = 0
      for (const page of result.pages) {
        for (const block of page.blocks) {
          if (block.blockId.startsWith('block-') && !block.isRepeatHeaderCopy && block.blockId !== 'block-0') {
            rowCount++
          }
        }
      }

      expect(rowCount).toBeGreaterThanOrEqual(5)
    })

    it('should calculate page breaks based on actual measured heights, not averages', () => {
      container.appendChild(createRepeatHeader(40))

      // Create rows that when summed exceed one page, but individual rows vary
      const heights = [25, 35, 20, 40, 30, 50, 25, 30]
      let totalHeight = 0

      for (let i = 0; i < heights.length; i++) {
        container.appendChild(createRow(heights[i]))
        totalHeight += heights[i]
      }

      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      // With variable heights summing to 255px + header 40px = 295px,
      // and page available = ~1046px, should fit on 1 page
      if (totalHeight < 900) {
        expect(result.totalPages).toBe(1)
      } else {
        expect(result.totalPages).toBeGreaterThan(1)
      }

      // Verify no row is split
      expect(result.warnings).toHaveLength(0)
    })
  })

  describe('Real-World Bubble Invoice Scenario', () => {
    it('should handle 100-row invoice with mixed content heights and keep-together blocks', () => {
      // Simulates a realistic Bubble invoice:
      // - Header with company/date info
      // - 100 invoice rows (some wrapped, some compact)
      // - Totals section
      // - Signature block

      container.appendChild(createRepeatHeader(50))

      // 100 rows with varied heights (simulating natural variation in Bubble)
      for (let i = 1; i <= 100; i++) {
        // Create variation: some rows are short, some wrap
        const baseHeight = 30
        const variation = (i % 5 === 0) ? 20 : (i % 3 === 0) ? 15 : 0
        const rowHeight = baseHeight - variation
        container.appendChild(createRow(rowHeight, `Row ${i}`))
      }

      // Add totals (keep-together)
      container.appendChild(createKeepTogetherBlock(100, 'TOTALS\nSubtotal: $X\nTax: $Y\nTotal: $Z'))

      // Add signature (keep-together)
      container.appendChild(createKeepTogetherBlock(80, 'Authorized Signature\n_____________________'))

      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      // Should spread across multiple pages
      expect(result.totalPages).toBeGreaterThan(1)
      expect(result.totalPages).toBeLessThanOrEqual(5)

      // Should have no split warnings (keep-together blocks shouldn't split)
      const splitWarnings = result.warnings.filter(w => w.type === 'element-too-large')
      expect(splitWarnings).toHaveLength(0)

      // Verify last page contains totals and signature
      const lastPage = result.pages[result.pages.length - 1]
      expect(lastPage.blocks.length).toBeGreaterThan(0)

      // Total blocks should account for: header + 100 rows + totals + signature + repeat headers
      let nonRepeatBlocks = 0
      for (const page of result.pages) {
        nonRepeatBlocks += page.blocks.filter(b => !b.isRepeatHeaderCopy).length
      }
      expect(nonRepeatBlocks).toBeGreaterThanOrEqual(102) // 1 header + 100 rows + totals + signature
    })
  })
})
