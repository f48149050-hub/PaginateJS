/**
 * Type definitions for pagination engine
 */

export type PageSizeType = 'A4' | 'Letter'

export interface PageSize {
  width: number   // mm
  height: number  // mm
}

export interface PageConstraints {
  pageSize: PageSize
  marginTop: number     // mm
  marginBottom: number  // mm
  marginLeft: number    // mm
  marginRight: number   // mm
  availableHeight: number  // calculated: height - top - bottom
}

export interface DOMBlock {
  element: HTMLElement
  offset: number  // top position relative to container
  height: number
  isRepeatHeader: boolean
  isKeepTogether: boolean
  blockId: string  // unique identifier
}

export interface PageBlock {
  blockId: string
  isRepeatHeaderCopy: boolean  // true if this is a duplicate header on page 2+
}

export interface PaginationPage {
  pageNumber: number
  blocks: PageBlock[]
  contentHeight: number  // total height of content on this page
  hasRepeatHeaderCopy: boolean
}

export interface PaginationWarning {
  type: 'element-too-large' | 'unmeasurable' | 'missing-container'
  blockId: string
  message: string
}

export interface PaginationResult {
  pages: PaginationPage[]
  totalPages: number
  warnings: PaginationWarning[]
  repeatHeaderBlockId: string | null
}

export interface PaginationOptions {
  pageSize: PageSizeType
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
}

// Page dimensions in mm (at 96 DPI)
export const PAGE_SIZES: Record<PageSizeType, PageSize> = {
  A4: {
    width: 210,
    height: 297
  },
  Letter: {
    width: 215.9,
    height: 279.4
  }
}

// Convert mm to pixels (96 DPI)
export const MM_TO_PX = 3.78
