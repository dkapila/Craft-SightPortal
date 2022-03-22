import { CraftTextBlock, CraftTextRun, CraftUrlBlock } from '@craftdocs/craft-extension-api';
import { PortalBlockType, PortalLinkResult } from 'src/Types';

class LinkResultsConverter {
  private blocks: PortalBlockType[];

  constructor(_blocks: PortalBlockType[]) {
    this.blocks = _blocks;
  }

  execute() {
    const results: PortalLinkResult[] = [];

    this.blocks.forEach((block) => {
      if ((block.craftBlock as CraftUrlBlock).url) {
        const { url } = block.craftBlock as CraftUrlBlock;
        if (!url) {
          return;
        }

        results.push({
          portalBlock: block,
          spaceId: block.spaceId,
          id: block.id,
          type: 'PortalLinkResult',
          parentId: block.parentId,
          level: block.level,
          blockId: block.craftBlockId,
          linkText: block.fullString,
          link: { type: 'url', url },
          preText: '',
          postText: '',
        });

        return;
      }

      const { content } = <CraftTextBlock>block.craftBlock;

      content.forEach((item: CraftTextRun) => {
        if (item.link) {
          results.push({
            portalBlock: block,
            spaceId: block.spaceId,
            id: block.id,
            type: 'PortalLinkResult',
            parentId: block.parentId,
            level: block.level,
            blockId: block.craftBlockId,
            linkText: item.text,
            link: item.link,
            preText: LinkResultsConverter.getPreText(block.fullString, item.text),
            postText: LinkResultsConverter.getPostText(block.fullString, item.text),
          });
        }
      });
    });

    return results;
  }

  private static getPreText(full_string: string, link_text: string) {
    let preText = '';
    const numberIndex = full_string.indexOf(link_text);

    if (numberIndex < 70) {
      preText = full_string.substring(0, numberIndex);
    } else {
      preText = full_string.substring((numberIndex - 70), numberIndex);
      const firstWordIndex = preText.indexOf(' ');
      preText = `...${preText.substring(firstWordIndex + 1, preText.length)}`;
    }

    return preText;
  }

  private static getPostText(full_string: string, link_text: string) {
    let postText = '';
    const numberIndex = full_string.indexOf(link_text);
    const endingIndex = numberIndex + link_text.length + 1;
    const textLength = full_string.length;
    if ((textLength - endingIndex) < 70) {
      postText = full_string.substring(endingIndex - 1, full_string.length);
    } else {
      const endingTextIndex = endingIndex + 70;
      postText = full_string.substring(endingIndex - 1, endingTextIndex);
      const lastWordIndex = postText.lastIndexOf(' ');
      postText = `${postText.substring(0, lastWordIndex)}...`;
    }

    return postText;
  }
}

export default LinkResultsConverter;
