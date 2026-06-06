/**
 * Main pagination algorithm
 * Places DOM blocks onto pages respecting keep-together and repeat-header rules
 */

import { assertLicense } from './license.ts'

import {
    DOMBlock,
    PageConstraints,
    PaginationOptions,
    PaginationPage,
    PaginationResult,
    PaginationWarning,
    PAGE_SIZES
} from './types'

import {
    analyzeDom,
    getPageConstraints,
    findRepeatHeader,
    validateBlocks
} from './domAnalyzer'

/**
 * Main pagination function
 * Returns a plan of which blocks go on which pages
 */
export function paginate(
    container: HTMLElement,
    options: PaginationOptions
): PaginationResult {
    // Check license — free users get a console warning, invalid keys throw
    assertLicense()

    // 1. Validate input
    if (!container) {
        return {
            pages: [],
            totalPages: 0,
            warnings: [
                {
                    type: 'missing-container',
                    blockId: 'root',
                    message: 'No container element provided'
                }
            ],
            repeatHeaderBlockId: null
        }
    }

    // 2. Analyze DOM
    const pageSize = PAGE_SIZES[options.pageSize]
    const blocks = analyzeDom(container, {
        pageSize,
        marginTop: options.marginTop,
        marginBottom: options.marginBottom
    })

    const validation = validateBlocks(blocks)
    const warnings: PaginationWarning[] = []

    if (!validation.valid) {
        return {
            pages: [],
            totalPages: 0,
            warnings: [
                {
                    type: 'unmeasurable',
                    blockId: 'root',
                    message: validation.reason || 'Unable to measure blocks'
                }
            ],
            repeatHeaderBlockId: null
        }
    }

    // 3. Get page constraints
    const constraints = getPageConstraints(
        pageSize,
        options.marginTop,
        options.marginBottom,
        options.marginLeft,
        options.marginRight
    )

    // 4. Find repeat-header block
    const repeatHeader = findRepeatHeader(blocks)
    const repeatHeaderId = repeatHeader?.blockId || null

    // 5. Paginate
    const pages = paginateBlocks(blocks, constraints, repeatHeader, warnings)

    return {
        pages,
        totalPages: pages.length,
        warnings,
        repeatHeaderBlockId: repeatHeaderId
    }
}

/**
 * Core pagination algorithm
 * Places blocks onto pages following rules:
 * - Keep-together blocks must not be split
 * - Repeat-header appears on top of pages 2+
 * - Warning if block > page height
 */
function paginateBlocks(
    blocks: DOMBlock[],
    constraints: PageConstraints,
    repeatHeader: DOMBlock | null,
    warnings: PaginationWarning[]
): PaginationPage[] {
    const pages: PaginationPage[] = []
    let currentPage: PaginationPage = {
        pageNumber: 1,
        blocks: [],
        contentHeight: 0,
        hasRepeatHeaderCopy: false
    }

    // Header height (used for subsequent pages)
    const headerHeight = repeatHeader?.height || 0

    // Add repeat-header to page 1 if it exists
    if (repeatHeader) {
        currentPage.blocks.push({
            blockId: repeatHeader.blockId,
            isRepeatHeaderCopy: false
        })
        currentPage.contentHeight += headerHeight
    }

    for (const block of blocks) {
        // Skip repeat-header itself (already added above)
        if (block.isRepeatHeader) {
            continue
        }

        // Check if block is larger than available page height
        if (block.height > constraints.availableHeight) {
            warnings.push({
                type: 'element-too-large',
                blockId: block.blockId,
                message: `Block ${block.blockId} is ${block.height}px tall but page only has ${constraints.availableHeight}px available`
            })
        }

        // Calculate available space on current page
        const headerHeightOnPage = currentPage.pageNumber > 1 && repeatHeader ? headerHeight : 0
        const usedHeight = currentPage.contentHeight
        const availableSpace = constraints.availableHeight - usedHeight - headerHeightOnPage

        // Decide: fit on current page or move to next?
        const blockFits = block.height <= availableSpace

        if (blockFits || (block.isKeepTogether && currentPage.blocks.length === (repeatHeader ? 1 : 0))) {
            // Block fits, add it to current page
            currentPage.blocks.push({
                blockId: block.blockId,
                isRepeatHeaderCopy: false
            })
            currentPage.contentHeight += block.height
        } else if (block.isKeepTogether && currentPage.blocks.length > (repeatHeader ? 1 : 0)) {
            // Keep-together block doesn't fit: move to next page
            pages.push(currentPage)

            currentPage = {
                pageNumber: pages.length + 1,
                blocks: [],
                contentHeight: 0,
                hasRepeatHeaderCopy: repeatHeader !== null
            }

            // Add repeat header copy if needed
            if (repeatHeader) {
                currentPage.blocks.push({
                    blockId: repeatHeader.blockId,
                    isRepeatHeaderCopy: true
                })
                currentPage.contentHeight += headerHeight
            }

            // Now add the block
            currentPage.blocks.push({
                blockId: block.blockId,
                isRepeatHeaderCopy: false
            })
            currentPage.contentHeight += block.height
        } else {
            // Regular block doesn't fit: move to next page
            pages.push(currentPage)

            currentPage = {
                pageNumber: pages.length + 1,
                blocks: [],
                contentHeight: 0,
                hasRepeatHeaderCopy: repeatHeader !== null
            }

            // Add repeat header copy if needed
            if (repeatHeader) {
                currentPage.blocks.push({
                    blockId: repeatHeader.blockId,
                    isRepeatHeaderCopy: true
                })
                currentPage.contentHeight += headerHeight
            }

            // Now add the block
            currentPage.blocks.push({
                blockId: block.blockId,
                isRepeatHeaderCopy: false
            })
            currentPage.contentHeight += block.height
        }
    }

    // Don't forget last page
    if (currentPage.blocks.length > 0) {
        pages.push(currentPage)
    }

    return pages
}