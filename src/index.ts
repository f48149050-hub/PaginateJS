/**
 * Smart PDF Exporter
 * Clean PDF generation for Bubble
 */

export const version = '0.1.0'

// Core pagination engine
export { paginate } from './engine/pagination'
export { analyzeDom, getPageConstraints, findRepeatHeader, validateBlocks } from './engine/domAnalyzer'

// Types
export type {
  PageSize,
  PageSizeType,
  PageConstraints,
  DOMBlock,
  PageBlock,
  PaginationPage,
  PaginationWarning,
  PaginationResult,
  PaginationOptions
} from './engine/types'
export { PAGE_SIZES, MM_TO_PX } from './engine/types'
