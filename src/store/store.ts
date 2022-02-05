import { DevicePlatform } from '@craftdocs/craft-extension-api';
import create from 'zustand';
import { defaultFilters, VERSION } from '../config/config';

import {
  PortalMainStore,
  TaskFilterOptionsType,
  LinkFilterOptionsType,
  TextFilterOptionsType,
  SearchInstanceType,
  ActiveSearchViewType,
  PortalResultBlock,
  AccentColorType,
  HeaderFilterOptionsType,
  PortalBlockType,
} from '../Types';

const usePortalStore = create<PortalMainStore>((set) => ({
  platformType: 'Mac',
  results: [],
  resultsAcrossBlocks: false,
  starredBlocks: [],
  refreshResultsPending: false,
  setResults: (results: PortalResultBlock[]) => {
    set(() => ({
      results,
    }));
  },
  version: VERSION,
  accentColor: 'Blue',
  searchInstances: [
    { instanceId: 'Blue', filters: { ...defaultFilters } },
    { instanceId: 'Green', filters: { ...defaultFilters } },
    { instanceId: 'Grey', filters: { ...defaultFilters } },
    { instanceId: 'Pink', filters: { ...defaultFilters } },
    { instanceId: 'Purple', filters: { ...defaultFilters } },
    { instanceId: 'Yellow', filters: { ...defaultFilters } },
  ],
  setSearchInstances: (instances: SearchInstanceType[]) => {
    set(() => ({
      searchInstances: instances,
    }));
  },
  searchPreferences: {
    activeSearchView: 'All',
    showSubPageResults: true,
    showMainPageResults: true,
    showStarredBlockResults: true,
  },
  setRefreshResultsPending: (resultsPending: boolean) => {
    set(() => ({
      refreshResultsPending: resultsPending,
    }));
  },
  setAccentColor: (color: AccentColorType) => {
    set(() => ({
      accentColor: color,
    }));
  },
  setPlatform: (platform: DevicePlatform) => {
    set(() => ({
      platformType: platform,
    }));
  },
  setShowStarredBlockResults: (showResults: boolean) => {
    set((state) => ({
      searchPreferences: { ...state.searchPreferences, showStarredBlockResults: showResults },
    }));
  },
  setShowMainPageResults: (showResults: boolean) => {
    set((state) => ({
      searchPreferences: { ...state.searchPreferences, showMainPageResults: showResults },
    }));
  },
  setResultsAcrossMultipleBlocks: (acrossMultipleBlocks: boolean) => {
    set(() => ({
      resultsAcrossBlocks: acrossMultipleBlocks,
    }));
  },
  setShowSubpageResults: (showResults: boolean) => {
    set((state) => ({
      searchPreferences: { ...state.searchPreferences, showSubPageResults: showResults },
    }));
  },
  setFilterType: (instanceId: string, filterType: ActiveSearchViewType) => {
    set((state) => ({
      searchInstances: state.searchInstances.map((instance) => {
        if (!(instance.instanceId === instanceId)) {
          return instance;
        }

        return {
          ...instance,
          filters: {
            ...instance.filters,
            activeSearchViewType: filterType,
          },
        };
      }),
    }));
  },
  setHeaderFilter: (instanceId: string, filterOptions: HeaderFilterOptionsType) => {
    set((state) => ({
      searchInstances: state.searchInstances.map((instance) => {
        if (!(instance.instanceId === instanceId)) {
          return instance;
        }

        return {
          ...instance,
          filters: {
            ...instance.filters,
            headerFilter: filterOptions,
          },
        };
      }),
    }));
  },
  setTaskFilter: (instanceId: string, filterOptions: TaskFilterOptionsType) => {
    set((state) => ({
      searchInstances: state.searchInstances.map((instance) => {
        if (!(instance.instanceId === instanceId)) {
          return instance;
        }

        return {
          ...instance,
          filters: {
            ...instance.filters,
            taskFilter: filterOptions,
          },
        };
      }),
    }));
  },
  setLinkFilter: (instanceId: string, filterOptions: LinkFilterOptionsType) => {
    set((state) => ({
      searchInstances: state.searchInstances.map((instance) => {
        if (!(instance.instanceId === instanceId)) {
          return instance;
        }

        return {
          ...instance,
          filters: {
            ...instance.filters,
            linkFilter: filterOptions,
          },
        };
      }),
    }));
  },
  addStarredBlock: (starredBlock: PortalBlockType) => {
    set((state) => {
      const blocks = [...state.starredBlocks];
      blocks.push(starredBlock);
      return ({
        starredBlocks: blocks,
      });
    });
  },
  setStarredBlocks: (blocks: PortalBlockType[]) => {
    set(() => ({
      starredBlocks: blocks,
    }));
  },
  removeStarredBlock: (id: string) => {
    set((state) => ({
      starredBlocks: state.starredBlocks.filter((item) => item.id !== id),
    }));
  },
  setStarredBlock: (block: PortalBlockType) => {
    set((state) => ({
      starredBlocks: state.starredBlocks.map((item) => {
        if (item.craftBlockId !== block.craftBlockId) {
          return { ...item };
        }

        return { ...block };
      }),
    }));
  },
  setTextFilter: (instanceId: string, filterOptions: TextFilterOptionsType) => {
    set((state) => ({
      searchInstances: state.searchInstances.map((instance) => {
        if (!(instance.instanceId === instanceId)) {
          return instance;
        }

        return {
          ...instance,
          filters: {
            ...instance.filters,
            textFilter: filterOptions,
          },
        };
      }),
    }));
  },
}));

export default usePortalStore;
