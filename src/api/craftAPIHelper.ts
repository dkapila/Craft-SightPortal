import {
  ApiResponse,
  BlockLocation,
  CraftBlock,
  CraftBlockInsert,
  CraftTextBlock,
  Environment,
} from '@craftdocs/craft-extension-api';

class CraftAPIHelper {
  private isDevMode: boolean = false;

  constructor() {
    if ((window as any).craftDev) {
      this.isDevMode = true;
    }
  }

  public static onEnvironmentUpdated(callback: (env: Environment) => void): void {
    craft.env.setListener((env) => {
      callback(env);
    });
  }

  public static async getFromSession(storageKey: string) {
    return craft.storageApi.get(storageKey);
  }

  public static async saveToSession(storageKey: string, data: string) {
    return craft.storageApi.put(storageKey, data);
  }

  public static craftBlockToMarkdown(blocks: CraftBlock[]) {
    return craft.markdown.craftBlockToMarkdown(blocks, 'common', { tableSupported: false });
  }

  public static async openURL(url: string) {
    return craft.editorApi.openURL(url);
  }

  public static async navigateToBlockId(blockId: string): Promise<ApiResponse<void>> {
    return craft.editorApi.navigateToBlockId(blockId);
  }

  public static async addBLocks(
    blocks: CraftBlockInsert[],
    location?: BlockLocation,
  ): Promise<ApiResponse<CraftBlock[]>> {
    return craft.dataApi.addBlocks(blocks, location);
  }

  public async getCurrentPageId(): Promise<string> {
    const data = await this.getCurrentPageBlocks();
    if (data.status === 'success') {
      return data.data.id;
    }

    throw new Error('No Current Page found');
  }

  public static async getSelectedBlocks() {
    return craft.editorApi.getSelection();
  }

  public async getLatestSelectedBlockLocation(): Promise<BlockLocation | null> {
    const currentPageId = await this.getCurrentPageId();
    const selectionRes = await CraftAPIHelper.getSelectedBlocks();
    if (selectionRes.status === 'success' && selectionRes.data.length > 0) {
      const blockIdToInsertAfter = selectionRes.data[selectionRes.data.length - 1].id;
      return CraftAPIHelper.afterBlockLocation(currentPageId, blockIdToInsertAfter);
    }

    return null;
  }

  public static afterBlockLocation(currentPageId: string, blockIdToInsertAfter: string) {
    return craft.location.afterBlockLocation(currentPageId, blockIdToInsertAfter);
  }

  public static openUrl(urlString: string) {
    craft.editorApi.openURL(urlString);
  }

  public async getCurrentPageBlocks(): Promise<ApiResponse<CraftTextBlock>> {
    if (!this.isDevMode) {
      return craft.dataApi.getCurrentPage();
    }

    return craft.dataApi.getCurrentPage();
  }
}

export default CraftAPIHelper;
