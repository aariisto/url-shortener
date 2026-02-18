const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Url {
  id: string;
  original: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
}

export const urlService = {
  async fetchUrls(): Promise<Url[]> {
    try {
      const response = await fetch(`${API_URL}/url`);
      if (!response.ok) {
        throw new Error('Failed to fetch URLs');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Error fetching URLs:', err);
      return [];
    }
  },

  async createUrl(original: string): Promise<Url> {
    const response = await fetch(`${API_URL}/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ original }),
    });

    if (!response.ok) {
      throw new Error('Invalid URL');
    }

    return response.json();
  },
};
