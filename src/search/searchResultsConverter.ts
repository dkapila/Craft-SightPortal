import { PortalBlockType, PortalTextResult } from 'src/Types';

class SearchResultsConverter {
  private blocks: PortalBlockType[];

  constructor(_blocks: PortalBlockType[]) {
    this.blocks = _blocks;
  }

  execute() {
    const results: PortalTextResult[] = [];

    this.blocks.forEach((block: PortalBlockType) => {
      const { fullString } = block;
      const resultText = (fullString.length > 250) ? `${fullString.substring(0, 250)}...` : fullString;

      results.push({
        portalBlock: block,
        id: block.id,
        type: 'PortalTextResult',
        textStyleType: block.textStyleType,
        parentId: block.parentId,
        level: block.level,
        blockId: block.craftBlockId,
        resultText,
        listStyleType: block.listStyleType,
      });
    });

    return results;
  }
}

export default SearchResultsConverter;
