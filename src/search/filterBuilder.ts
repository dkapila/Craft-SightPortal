import {
  CraftBlock,
  CraftTextBlock, CraftTextRun, CraftUrl,
} from '@craftdocs/craft-extension-api';

import {
  LinkFilterOptionsType,
  PortalBlockType,
  TextFilterOptionsType,
  TaskFilterOptionsType,
  HeaderFilterOptionsType,
} from 'src/Types';

import CraftAPIHelper from '../api/craftAPIHelper';

class FilterBuilder {
  private filteredBlocks: PortalBlockType[];

  private textFoundAcrossMultipleBlocks: boolean;

  constructor(records: PortalBlockType[]) {
    this.filteredBlocks = records;
    this.textFoundAcrossMultipleBlocks = false;
  }

  withTextFilter(textFilterOptions: TextFilterOptionsType) {
    const searchText = textFilterOptions.text.toLowerCase().trim();
    if (searchText.length === 0) {
      return this;
    }

    const filteredBlocksClone = [...this.filteredBlocks];
    const fullText = this.filteredBlocks.map((block) => block.fullString).join('\n').toLowerCase();

    this.filteredBlocks = this.filteredBlocks
      .filter((block: PortalBlockType) => {
        const blockText = block.fullString.toLowerCase();
        const markdownText = CraftAPIHelper.craftBlockToMarkdown(
          [block.craftBlock as CraftBlock],
        ).split('\n\n')[0].toLowerCase();
        const wordList = searchText.split(' ');

        let blockContainsText = true;

        wordList.forEach((word) => {
          if ((blockText.indexOf(word) >= 0) || (markdownText.indexOf(word)) >= 0) {
            return;
          }

          blockContainsText = false;
        });

        return blockContainsText;
      }).sort((a, b) => {
        const blockAText = a.fullString.toLowerCase();
        const blockBText = b.fullString.toLowerCase();

        const stringAContainsFullFilterText = (blockAText.indexOf(searchText) >= 0);
        const stringBContainsFullFilterText = (blockBText.indexOf(searchText) >= 0);

        if (stringAContainsFullFilterText && !stringBContainsFullFilterText) {
          return -1;
        }
        if (!stringAContainsFullFilterText && stringBContainsFullFilterText) {
          return 1;
        }

        return 0;
      });

    if (this.filteredBlocks.length === 0) {
      const wordList = searchText.split(' ');
      let acrossBlocks = true;
      wordList.forEach((word) => {
        if ((fullText.indexOf(word) >= 0) || (fullText.indexOf(word)) >= 0) {
          return;
        }

        acrossBlocks = false;
      });

      if (acrossBlocks) {
        this.textFoundAcrossMultipleBlocks = true;
        this.filteredBlocks = [...filteredBlocksClone];

        this.filteredBlocks = this.filteredBlocks.filter((block) => {
          const blockText = block.fullString.toLowerCase();
          const markdownText = CraftAPIHelper.craftBlockToMarkdown(
            [block.craftBlock as CraftBlock],
          ).split('\n\n')[0].toLowerCase();

          let blockContainsText = false;

          wordList.forEach((word) => {
            if ((blockText.indexOf(word) >= 0) || (markdownText.indexOf(word)) >= 0) {
              blockContainsText = true;
            }
          });

          return blockContainsText;
        });
      }
    }

    return this;
  }

  withLinkFilter(linkFilterOptions: LinkFilterOptionsType) {
    this.filteredBlocks = this.filteredBlocks.filter((block: PortalBlockType) => {
      if ((<CraftUrl>block.craftBlock).url) {
        return true;
      }

      const links = (<CraftTextBlock>block.craftBlock).content
        .filter((item: CraftTextRun) => item.link).filter((item) => {
          if (!item.link) {
            return false;
          }

          switch (item.link.type) {
            case 'blockLink': {
              if (linkFilterOptions.showInternalLinks) {
                return true;
              }
              break;
            }
            case 'url': {
              if (linkFilterOptions.showInternalLinks && (<CraftUrl>item.link)?.url.startsWith('craftdocs://')) {
                return true;
              }

              if (linkFilterOptions.showExternalLinks && !(<CraftUrl>item.link)?.url.startsWith('craftdocs://')) {
                return true;
              }
              break;
            }
            default: {
              break;
            }
          }

          return false;
        });

      return (links.length > 0);
    });

    return this;
  }

  withHeaderFilter(headerFilterOptions: HeaderFilterOptionsType) {
    const validBlockStyles = ['title', 'subtitle', 'heading', 'strong', 'card', 'page'];

    this.filteredBlocks = this.filteredBlocks
      .filter((block) => {
        if (headerFilterOptions.showHeaderBlocks) {
          if (validBlockStyles.indexOf(block.textStyleType) >= 0) {
            return true;
          }
        }

        return false;
      });

    return this;
  }

  withTaskFilter(taskFilterOptions: TaskFilterOptionsType) {
    this.filteredBlocks = this.filteredBlocks.filter((item) => {
      if ((item.listStyleType === 'done') && taskFilterOptions.showDoneBlocks) {
        return true;
      }
      if ((item.listStyleType === 'cancelled') && taskFilterOptions.showCancelledBlocks) {
        return true;
      }
      if ((item.listStyleType === 'todo') && taskFilterOptions.showTaskBlocks) {
        return true;
      }

      return false;
    });

    return this;
  }

  build() {
    return {
      blocks: this.filteredBlocks,
      acrossMultipleBlocks: this.textFoundAcrossMultipleBlocks,
    };
  }
}

export default FilterBuilder;
