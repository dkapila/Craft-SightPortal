import { SearchFiltersType } from '../Types';

export const VERSION = '0.1';

export const LOCAL_STORAGE_KEY = 'CraftSightPortal';

export const defaultFilters: SearchFiltersType = {
  activeSearchViewType: 'All',
  textFilter: {
    filterApplied: true,
    text: '',
  },
  linkFilter: {
    filterApplied: false,
    showExternalLinks: false,
    showInternalLinks: false,
  },
  headerFilter: {
    filterApplied: false,
    showHeaderBlocks: false,
  },
  taskFilter: {
    filterApplied: false,
    showCancelledBlocks: false,
    showDoneBlocks: false,
    showTaskBlocks: false,
  },
};
