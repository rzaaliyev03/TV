export interface Channel {
  id: string;
  name: string;
  streamUrl: string;
  logoUrl?: string;
  category: string;
  country: string;
  quality?: string;
  isFavorite: boolean;
  isWorking: boolean;
  isCustom?: boolean;
  addedAt?: number;
}

export type AspectRatioMode = 'fit' | 'fill' | 'zoom';

export type SortMode = 'default' | 'name-asc' | 'name-desc' | 'recent';

export interface CategoryItem {
  id: string;
  label: string;
  icon?: string;
}
