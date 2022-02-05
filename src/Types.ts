import * as t from 'io-ts';
import {
  CraftBlock,
  CraftLink,
  DevicePlatform,
} from '@craftdocs/craft-extension-api';

const BaseFilterOptions = t.type({
  filterApplied: t.boolean,
});

export type BaseFilterOptionsType = t.TypeOf<typeof BaseFilterOptions>;

const LinkFilterOptions = t.intersection([
  BaseFilterOptions,
  t.type({
    showInternalLinks: t.boolean,
    showExternalLinks: t.boolean,
  }),
]);

export type LinkFilterOptionsType = t.TypeOf<typeof LinkFilterOptions>;

const TextFilterOptions = t.intersection([
  BaseFilterOptions,
  t.type({
    text: t.string,
  }),
]);

export type TextFilterOptionsType = t.TypeOf<typeof TextFilterOptions>;

const TaskFilterOptions = t.intersection([
  BaseFilterOptions,
  t.type({
    showTaskBlocks: t.boolean,
    showDoneBlocks: t.boolean,
    showCancelledBlocks: t.boolean,
  }),
]);

export type TaskFilterOptionsType = t.TypeOf<typeof TaskFilterOptions>;

const HeaderFilterOptions = t.intersection([
  BaseFilterOptions,
  t.type({
    showHeaderBlocks: t.boolean,
  }),
]);

export type HeaderFilterOptionsType = t.TypeOf<typeof HeaderFilterOptions>;

const ActiveSearchView = t.keyof({
  All: null, Links: null, Tasks: null, Headers: null,
});

export type ActiveSearchViewType = t.TypeOf<typeof ActiveSearchView>;

const SearchFilterRequired = t.type({
  activeSearchViewType: ActiveSearchView,
});

const SearchFiltersOptional = t.partial({
  taskFilter: TaskFilterOptions,
  headerFilter: HeaderFilterOptions,
  linkFilter: LinkFilterOptions,
  textFilter: TextFilterOptions,
  boldFilter: BaseFilterOptions,
  italicsFilter: BaseFilterOptions,
  strikethroughFilter: BaseFilterOptions,
  highlightFilter: BaseFilterOptions,
});

const SearchFilters = t.intersection([SearchFilterRequired, SearchFiltersOptional]);

export type SearchFiltersType = t.TypeOf<typeof SearchFilters>;

export const AccentColorMap = {
  Purple: null,
  Pink: null,
  Blue: null,
  Green: null,
  Yellow: null,
  Grey: null,
};

const AccentColor = t.keyof(AccentColorMap);

export type AccentColorType = t.TypeOf<typeof AccentColor>;

export const SearchInstance = t.type({
  instanceId: AccentColor,
  filters: SearchFilters,
});

export type SearchInstanceType = t.TypeOf<typeof SearchInstance>;

const StyledText = t.keyof({
  title: null,
  subtitle: null,
  heading: null,
  strong: null,
  body: null,
  caption: null,
  card: null,
  page: null,
});

export type StyledTextType = t.TypeOf<typeof StyledText>;

const StyledList = t.keyof({
  none: null, todo: null, done: null, cancelled: null,
});

export type StyledListType = t.TypeOf<typeof StyledList>;

export const PortalBlock = t.type({
  id: t.string,
  parentId: t.string,
  level: t.number,
  fullString: t.string,
  textStyleType: StyledText,
  listStyleType: StyledList,
  craftBlockId: t.string,
  craftBlock: t.unknown,
});

export type PortalBlockType = t.TypeOf<typeof PortalBlock>;

export const SessionData = t.type({
  version: t.string,
  accentColor: AccentColor,
  searchInstances: t.array(SearchInstance),
  starredBlocks: t.array(PortalBlock),
});

export type SessionDataType = t.TypeOf<typeof SessionData>;

export type FilterOptions = TaskFilterOptionsType | LinkFilterOptionsType | TextFilterOptionsType;

export type BlockSnippet = {
  id: string;
  name: string;
  blocks: CraftBlock[];
  createdMs: number;
};

export type SearchPreferences = {
  activeSearchView: ActiveSearchViewType,
  showMainPageResults: boolean,
  showSubPageResults: boolean,
  showStarredBlockResults: boolean,
};

export type PortalResultBase = {
  id: string,
  level: number,
  parentId: string,
  blockId: string,
  portalBlock: PortalBlockType,
};

export type PortalLinkResult = PortalResultBase & {
  type: 'PortalLinkResult',
  link: CraftLink,
  linkText: string,
  preText: string,
  postText: string,
};

export type PortalTextResult = PortalResultBase & {
  type: 'PortalTextResult',
  resultText: string,
  textStyleType: StyledTextType,
  listStyleType: StyledListType
};

export type PortalResultBlock = PortalLinkResult | PortalTextResult;

export type PortalResult = {
  blocks: PortalResultBlock[],
  acrossMultipleBlocks: boolean,
};

export type PortalStore = {
  version: string,
  platformType: DevicePlatform,
  searchPreferences: SearchPreferences,
  searchInstances: SearchInstanceType[],
  accentColor: AccentColorType,
  results: PortalResultBlock [],
  resultsAcrossBlocks: boolean,
  starredBlocks: PortalBlockType [],
  refreshResultsPending: boolean
};

export type PortalMainStore = PortalStore & {
  setRefreshResultsPending: (refreshPending: boolean) => void;
  setAccentColor: (color: AccentColorType) => void;
  setResults: (results: PortalResultBlock[]) => void;
  setShowMainPageResults: (showResults: boolean) => void;
  setShowSubpageResults: (showResults: boolean) => void;
  setShowStarredBlockResults: (showResults: boolean) => void;
  setResultsAcrossMultipleBlocks: (blocks: boolean) => void;
  setPlatform:(platform: DevicePlatform) => void;
  setFilterType:(instanceId: string, filterType: ActiveSearchViewType) => void;
  setSearchInstances: (instances: SearchInstanceType[]) => void;
  setTaskFilter: (instanceId: string, filterOptions: TaskFilterOptionsType) => void;
  setHeaderFilter: (instanceId: string, filterOptions: HeaderFilterOptionsType) => void;
  setLinkFilter: (instanceId: string, filterOptions: LinkFilterOptionsType) => void;
  setTextFilter: (instanceId: string, filterOptions: TextFilterOptionsType) => void;

  addStarredBlock: (starredBlock: PortalBlockType) => void;
  removeStarredBlock: (id: string) => void;
  setStarredBlocks: (blocks: PortalBlockType[]) => void;
  setStarredBlock: (block: PortalBlockType) => void;
};

export type Theme = {
  isLight: boolean,
  primaryBackground: string,
  secondaryBackground: string,
  disabledTextColor: string,
  seperatorColor: string,
  primaryTextColor: string,
  blockHoverBackground: string,
  accentColor: string,
  taskCheckedBackground: string,
  taskUnCheckedBackground: string,
  taskCanceledBackground: string,
  iconColor: string,
  inputTextBorderColor: string,
  placeholderTextColor: string,
  linkTextColor: string,
};
