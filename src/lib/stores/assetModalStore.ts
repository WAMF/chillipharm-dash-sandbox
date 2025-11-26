import { writable, derived } from 'svelte/store';
import type { AssetRecord } from '../types';

interface AssetModalState {
  showDetail: boolean;
  showList: boolean;
  selectedAsset: AssetRecord | null;
  listTitle: string;
  listAssets: AssetRecord[];
}

const initialState: AssetModalState = {
  showDetail: false,
  showList: false,
  selectedAsset: null,
  listTitle: '',
  listAssets: []
};

function createAssetModalStore() {
  const { subscribe, set, update } = writable<AssetModalState>(initialState);

  return {
    subscribe,

    openAssetDetail(asset: AssetRecord) {
      update(state => ({
        ...state,
        showDetail: true,
        selectedAsset: asset
      }));
    },

    openAssetList(title: string, assets: AssetRecord[]) {
      update(state => ({
        ...state,
        showList: true,
        listTitle: title,
        listAssets: assets
      }));
    },

    closeDetail() {
      update(state => ({
        ...state,
        showDetail: false,
        selectedAsset: null
      }));
    },

    closeList() {
      update(state => ({
        ...state,
        showList: false,
        listTitle: '',
        listAssets: []
      }));
    },

    closeAll() {
      set(initialState);
    },

    viewAssetFromList(asset: AssetRecord) {
      update(state => ({
        ...state,
        showDetail: true,
        selectedAsset: asset
      }));
    }
  };
}

export const assetModalStore = createAssetModalStore();
