export interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  rawCifra: string;
  category: string;
  createdAt?: number;
}

export interface ViewerPreferences {
  theme: 'light' | 'dark' | 'stage'; // 'stage' is super high contrast (yellow on pure black, perfect for stage performers)
  fontSize: number; // in pixels or level
  preferFlats: boolean;
  autoScrollSpeed: number; // 0 = stopped, 1-10 = speeds
  customKeyBindings: {
    nextPage: string[];
    prevPage: string[];
  };
}
