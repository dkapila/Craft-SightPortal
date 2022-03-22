import {
  ApiResponse, CraftBlock, CraftBlockInsert, CraftTextBlock, CraftTextRun,
} from '@craftdocs/craft-extension-api';
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

  if (block.type === 'urlBlock' && block.url) {
    const fullString = block.title ? block.title : block.url;

    traversed_block_list.push({
      craftBlockId: block.id,
      textStyleType: 'body',
      listStyleType: 'none',
      id: uuidv4(),
      spaceId: block.spaceId ? block.spaceId : '',
      craftBlock: block,
      fullString,
      ...{ level },
      parentId: parent_block_id,
    });
  }

  if (block.type === 'textBlock') {
    traversed_block_list.push({
      craftBlockId: block.id,
      textStyleType: (block as CraftTextBlock).style.textStyle,
      listStyleType: listType,
      id: uuidv4(),
      spaceId: block.spaceId ? block.spaceId : '',
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

export const navigateToBlock = (blockId: string, spaceId: string) => {
  CraftAPIHelper.openUrl(`craftdocs://open?blockId=${blockId}&spaceId=${spaceId}`);
};

export const getUrlsFromSelectedBlocks = async () => {
  const result = await CraftAPIHelper.getSelectedBlocks();
  if (result.status !== 'success') {
    throw new Error(result.message);
  }

  const selectedBlocks = result.data;
  const urls: string[] = [];
  selectedBlocks.forEach((block) => {
    if (block.type === 'urlBlock' && block.url) {
      urls.push(block.url);
    }

    if (block.type === 'textBlock') {
      (<CraftTextBlock>block).content.forEach((item) => {
        if (item.link && item.link.type === 'url') {
          urls.push(item.link.url);
        }
      });
    }
  });

  return urls;
};

export const getYoutubeLink = (urls: string[]) => {
  const link = urls.filter((url) => {
    // https://stackoverflow.com/a/28735961
    const p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if (url.match(p)) {
      return true;
    }

    return false;
  });

  if (link.length > 0) {
    const timeStamp = new URLSearchParams(link[0].split('?')[1]).get('t');
    const videoId = new URLSearchParams(link[0].split('?')[1]).get('v');
    let formattedLink = `${link[0].split('?')[0]}?v=${videoId}`;

    if (timeStamp) {
      formattedLink = `${formattedLink}&t=${timeStamp}`;
    }

    return formattedLink;
  }

  return null;
};

export const insertNewBlock = async (
  craftBlocksToInsert: CraftBlockInsert [],
): Promise<ApiResponse<CraftBlock[]>> => {
  const latestBlockLocation = await new CraftAPIHelper().getLatestSelectedBlockLocation();

  if (latestBlockLocation) {
    return CraftAPIHelper.addBLocks(craftBlocksToInsert, latestBlockLocation);
  }

  return CraftAPIHelper.addBLocks(craftBlocksToInsert);
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
