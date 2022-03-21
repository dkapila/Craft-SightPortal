import {
  PortalResultBlock,
  SearchFiltersType,
  PortalBlockType,
  PortalResult,
  PortalTextResult,
} from '../Types';
import CraftAPIHelper from '../api/craftAPIHelper';
import FilterBuilder from './filterBuilder';
import SearchResultsConverter from './SearchResultsConverter';
import LinkResultsConverter from './linkResultsConverter';
import { parseBlocks } from '../utils/block';

export const applyFilters = (
  blocks: PortalBlockType[],
  searchFilters: SearchFiltersType,
): PortalResult => {
  let filterBuilder = new FilterBuilder(blocks);

  if (searchFilters.linkFilter && searchFilters.linkFilter.filterApplied) {
    filterBuilder = filterBuilder.withLinkFilter(searchFilters.linkFilter);
  }

  if (searchFilters.textFilter && searchFilters.textFilter.filterApplied) {
    filterBuilder = filterBuilder.withTextFilter(searchFilters.textFilter);
  }

  if (searchFilters.headerFilter && searchFilters.headerFilter.filterApplied) {
    filterBuilder = filterBuilder.withHeaderFilter(searchFilters.headerFilter);
  }

  if (searchFilters.taskFilter && searchFilters.taskFilter.filterApplied) {
    filterBuilder = filterBuilder.withTaskFilter(searchFilters.taskFilter);
  }

  const filteredResults = filterBuilder.build();

  let results: PortalResultBlock[] = [];
  if (searchFilters.linkFilter && searchFilters.linkFilter.filterApplied) {
    results = new LinkResultsConverter(filteredResults.blocks).execute();
  } else {
    results = new SearchResultsConverter(filteredResults.blocks).execute();
  }

  return {
    blocks: results,
    acrossMultipleBlocks: filteredResults.acrossMultipleBlocks,
  };
};

const getBlocksInCurrentPage = async (
  craftAPIHelper: CraftAPIHelper,
  searchFilters?: SearchFiltersType,
): Promise<PortalResult> => {
  const results = await craftAPIHelper.getCurrentPageBlocks();
  let blocksInPage: PortalTextResult[] = [];
  let resultBlocks: PortalResult = {
    blocks: [],
    acrossMultipleBlocks: false,
  };

  if (results.status === 'success') {
    const { data } = results;
    const blocks = parseBlocks(data, '', 0, []);

    if (searchFilters) {
      resultBlocks = applyFilters(blocks, searchFilters);
      return resultBlocks;
    }

    blocksInPage = new SearchResultsConverter(blocks).execute();
  }

  resultBlocks.blocks = blocksInPage;
  return resultBlocks;
};

export default getBlocksInCurrentPage;
