
export enum ClothingCategory {
  TOP = 'TOP_ONLY',
  BOTTOM = 'BOTTOM_ONLY',
  FULL = 'FULL_BODY',
  SHOES = 'FOOTWEAR'
}

export interface MorphState {
  baseImage: string | null;
  clothingImage: string | null; // This is the cropped version
  rawClothingImage: string | null; // This is the original uploaded version for re-cropping
  prompt: string;
  category: ClothingCategory;
  resultImage: string | null;
  isProcessing: boolean;
  status: string;
  error: string | null;
}

export enum MorphStatus {
  IDLE = 'SYSTEM_IDLE',
  UPLOADING = 'RECEIVING_BITSTREAM',
  PROCESSING = 'SYNTHESIZING_ENTITIES',
  COMPLETED = 'MORPH_COMPLETE',
  FAILED = 'KERNEL_PANIC'
}
