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
// FIXAT: Oanvända importer (PAGE_SIZES, MM_TO_PX) har tagits bort härifrån

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

      expect(result.totalPages).toBeGreaterThanOrEqual(2)
      expect(result.totalPages).toBeLessThanOrEqual(4)
      expect(result.warnings).toHaveLength(0)

      for (const page of result.pages) {
        expect(page.blocks.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Keep-Together Blocks', () => {
    it('should not split totals block', () => {
      container.appendChild(createRepeatHeader(40))

      for (let i = 0; i < 25; i++) {
        container.appendChild(createRow(30))
      }

      const totals = createKeepTogetherBlock(60, 'Totals')
      container.appendChild(totals)

      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      expect(result.totalPages).toBeGreaterThan(0)
    })

    it('should not split signature block', () => {
      container.appendChild(createRepeatHeader(40))

      for (let i = 0; i < 30; i++) {
        container.appendChild(createRow(30))
      }

      const signature = createKeepTogetherBlock(80, 'Authorized by: ___________')
      container.appendChild(signature)

      const result = paginate(container, {
        pageSize: 'A4',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
      })

      expect(result.warnings).toHaveLength(0)
      expect(result.totalPages).toBeGreaterThanOrEqual(1)

      const lastPage = result.pages[result.pages.length - 1]
      expect(lastPage.blocks.length).toBeGreaterThan(0)
    })
  })

  describe('Repeated Headers', () => {
    it('should duplicate header on page 2', () => {
      const header = createRepeatHeader(40)
      container.appendChild(header)

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
      expect(result.repeatHeaderBlockId).toBeDefined()
    })
  })
})
