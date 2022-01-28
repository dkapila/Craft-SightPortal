import {
  ApiResponse,
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

  public static async addBLocks(blocks: CraftBlockInsert[]): Promise<ApiResponse<CraftBlock[]>> {
    return craft.dataApi.addBlocks(blocks);
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
