import { CraftBlock, CraftTextBlock, CraftTextRun } from '@craftdocs/craft-extension-api';
import { v4 as uuidv4 } from 'uuid';
import { PortalBlockType, StyledListType } from 'src/Types';
import CraftAPIHelper from '../api/craftAPIHelper';

export const getBlockString = (block: CraftBlock) => (block as CraftTextBlock)
  .content.map((item: CraftTextRun) => item.text).join('');

export const parseBlocks = (
  block: CraftBlock,
  parent_block_id: string,
  level: number,
  traversed_block_list: PortalBlockType[],
): PortalBlockType[] => {
  let listType: StyledListType = 'none';
  if (block.listStyle.type === 'todo') {
    switch (block.listStyle.state) {
      case 'canceled':
        listType = 'cancelled';
        break;
      case 'checked':
        listType = 'done';
        break;
      case 'unchecked':
        listType = 'todo';
        break;
      default:
        listType = 'none';
        break;
    }
  }

  if (block.type === 'textBlock') {
    traversed_block_list.push({
      craftBlockId: block.id,
      textStyleType: (block as CraftTextBlock).style.textStyle,
      listStyleType: listType,
      id: uuidv4(),
      fullString: getBlockString(block),
      craftBlock: block,
      ...{ level },
      parentId: parent_block_id,
    });
  }

  if (!(<CraftTextBlock>block).subblocks || (<CraftTextBlock>block).subblocks.length === 0) {
    return traversed_block_list;
  }

  if ((<CraftTextBlock>block).subblocks && (<CraftTextBlock>block).subblocks.length > 0) {
    (<CraftTextBlock>block).subblocks.forEach((subblock: CraftBlock) => {
      parseBlocks(subblock, block.id, level + 1, traversed_block_list);
    });
  }

  return traversed_block_list;
};

export const getRandomBlock: () => Promise<PortalBlockType | null> = async () => {
  const response = await new CraftAPIHelper().getCurrentPageBlocks();
  if (response.status === 'success' && response.data) {
    const blocks = parseBlocks(response.data, '', 0, []);
    blocks.shift();
    const random = Math.floor(Math.random() * blocks.length);
    const randomBlock = blocks[random];
    return randomBlock;
  }

  return null;
};
