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

const ArticleFontSize = t.keyof({
  Small: null, Medium: null, Large: null,
});

export type ArticleFontSizeType = t.TypeOf<typeof ArticleFontSize>;

const ActiveView = t.keyof({
  SearchView: null, FrequencyView: null,
});

export type ActiveViewType = t.TypeOf<typeof ActiveView>;

const SortOrder = t.keyof({
  None: null, Ascending: null, Descending: null,
});

const FrequencyColumnName = t.keyof({
  word: null,
  length: null,
  frequency: null,
});

export type FrequencyColumnNameType = t.TypeOf<typeof FrequencyColumnName>;

const FrequencyColumn = t.type({
  sortOrder: SortOrder,
  type: FrequencyColumnName,
});

const FrequencyFilter = t.type({
  includeSubPages: t.boolean,
  includeStopWords: t.boolean,
  frequencyColumns: t.array(FrequencyColumn),
});

export type FrequencyFilterType = t.TypeOf<typeof FrequencyFilter>;

const SearchFilterRequired = t.type({
  activeSearchViewType: ActiveSearchView,
  activeViewType: ActiveView,
  frequencyFilter: FrequencyFilter,
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
  spaceId: t.string,
  level: t.number,
  fullString: t.string,
  textStyleType: StyledText,
  listStyleType: StyledList,
  craftBlockId: t.string,
  craftBlock: t.unknown,
});

export type PortalBlockType = t.TypeOf<typeof PortalBlock>;

const MediaPlayerRequired = t.type({
  onlyAudio: t.boolean,
  isActive: t.boolean,
});

const MediaPlayerOptional = t.partial({
  activeMediaUrl: t.string,
});

const MediaPlayer = t.intersection([MediaPlayerRequired, MediaPlayerOptional]);

export type MediaPlayerType = t.TypeOf<typeof MediaPlayer>;

const ArticleRequired = t.type({
  isActive: t.boolean,
});

const ArticleOptional = t.partial({
  activeUrl: t.string,
  articleComfortMode: t.boolean,
});

const Article = t.intersection([ArticleRequired, ArticleOptional]);

export type ArticleType = t.TypeOf<typeof Article>;

export const SessionData = t.type({
  version: t.string,
  accentColor: AccentColor,
  searchInstances: t.array(SearchInstance),
  starredBlocks: t.array(PortalBlock),
  mediaPlayer: MediaPlayer,
  article: Article,
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
  showMainPageResults: boolean,
  showSubPageResults: boolean,
  showStarredBlockResults: boolean,
};

export type PortalResultBase = {
  id: string,
  level: number,
  parentId: string,
  blockId: string,
  spaceId: string,
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
  fullString: string,
  textStyleType: StyledTextType,
  listStyleType: StyledListType
};

export type PortalResultBlock = PortalLinkResult | PortalTextResult;

export type PortalResult = {
  blocks: PortalResultBlock[],
  acrossMultipleBlocks: boolean,
};

export type NotificationType = {
  text: string,
  isShown: boolean,
};

export type FrequencyResult = {
  word: string,
  length: number,
  frequency: number,
  id: string,
};

export type ParsedArticle = null | {
  title: string;
  byline: string;
  dir: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  siteName: string;
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
  refreshResultsPending: boolean,
  mediaPlayer: MediaPlayerType,
  article: ArticleType,
  articleLoading: boolean,
  parsedArticle: ParsedArticle,
  notificaiton: NotificationType,
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
  setView:(instanceId: string, viewType: ActiveViewType) => void;
  setSearchInstances: (instances: SearchInstanceType[]) => void;
  setTaskFilter: (instanceId: string, filterOptions: TaskFilterOptionsType) => void;
  setHeaderFilter: (instanceId: string, filterOptions: HeaderFilterOptionsType) => void;
  setLinkFilter: (instanceId: string, filterOptions: LinkFilterOptionsType) => void;
  setTextFilter: (instanceId: string, filterOptions: TextFilterOptionsType) => void;
  setFrequencyFilter: (instanceId: string, filterOptions: FrequencyFilterType) => void;
  setMedia: (mediaPlayer: MediaPlayerType) => void;
  setArticle: (article: ArticleType) => void;
  setParsedArticle: (article: ParsedArticle) => void;
  clearNotification: () => void;
  setNotification: (item: NotificationType) => void;
  addStarredBlock: (starredBlock: PortalBlockType) => void;
  removeStarredBlock: (id: string) => void;
  setStarredBlocks: (blocks: PortalBlockType[]) => void;
  setStarredBlock: (block: PortalBlockType) => void;
  setArticleLoading: (isLoading: boolean) => void;
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
  toggleSwitchDisabledBackground: string,
  invertedPrimaryBackground: string,
  invertedPrimaryTextColor: string,
  mediaPlayerBackground: string,
};
