/**
 * DOM analysis and measurement
 * Extracts actual DOM blocks with precise heights using getBoundingClientRect()
 */
import {
  DOMBlock,
  PageConstraints,
  PageSize,
  MM_TO_PX
} from './types'

export interface DomAnalysisOptions {
  pageSize: PageSize
  marginTop: number
  marginBottom: number
}

/**
 * Analyze DOM structure and extract blocks with actual measurements
 */
export function analyzeDom(
    container: HTMLElement,
    options: DomAnalysisOptions
): DOMBlock[] {
  if (!container) {
    throw new Error('Container element not provided')
  }

  // Säkerställ att options faktiskt skickades med, annars smäller det någon annanstans
  if (!options) {
    throw new Error('Analysis options are required')
  }

  const blocks: DOMBlock[] = []
  let blockId = 0
  let offset = 0

  // Walk through all direct children
  for (const child of container.children) {
    const element = child as HTMLElement

    // Get actual height from DOM - use offsetHeight as fallback for jsdom
    const height = element.getBoundingClientRect().height || element.offsetHeight || 0
    const isRepeatHeader = element.getAttribute('data-repeat-header') === 'true'
    const isKeepTogether = element.getAttribute('data-keep-together') === 'true'

    blocks.push({
      element,
      offset,
      height,
      isRepeatHeader,
      isKeepTogether,
      blockId: `block-${blockId}`
    })

    offset += height
    blockId++
  }

  return blocks
}

/**
 * Calculate page constraints based on page size and margins
 */
export function getPageConstraints(
    pageSize: PageSize,
    marginTop: number,
    marginBottom: number,
    marginLeft: number,
    marginRight: number
): PageConstraints {
  // Convert mm to pixels
  const heightPx = pageSize.height * MM_TO_PX
  const marginTopPx = marginTop * MM_TO_PX
  const marginBottomPx = marginBottom * MM_TO_PX

  return {
    pageSize,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    availableHeight: heightPx - marginTopPx - marginBottomPx
  }
}

/**
 * Find repeat-header block (should be only one)
 */
export function findRepeatHeader(blocks: DOMBlock[]): DOMBlock | null {
  return blocks.find(b => b.isRepeatHeader) || null
}

/**
 * Validate that container and blocks are measurable
 */
export function validateBlocks(blocks: DOMBlock[]): { valid: boolean; reason?: string } {
  if (blocks.length === 0) {
    return { valid: false, reason: 'No blocks found in container' }
  }

  for (const block of blocks) {
    if (block.height <= 0) {
      return { valid: false, reason: `Block ${block.blockId} has invalid height: ${block.height}` }
    }
  }

  return { valid: true }
}