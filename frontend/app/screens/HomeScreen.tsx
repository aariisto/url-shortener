'use client';

import { useState, useEffect } from 'react';
import { urlService, type Url } from '../services/urlService';

export default function HomeScreen() {
  const [original, setOriginal] = useState('');
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadUrls();
  }, []);

  const loadUrls = async () => {
    const data = await urlService.fetchUrls();
    setUrls(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newUrl = await urlService.createUrl(original);
      setUrls([newUrl, ...urls]);
      setOriginal('');
    } catch (err) {
      setError('Please enter a valid URL');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (shortUrl: string, id: string) => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
          URL Shortener
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter your long URL
              </label>
              <input
                id="url"
                type="url"
                value={original}
                onChange={(e) => setOriginal(e.target.value)}
                placeholder="https://example.com/very/long/url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-600"
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Your URLs ({urls.length})
          </h2>

          {urls.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No URLs yet. Create your first one above!
            </p>
          ) : (
            <div className="space-y-4">
              {urls.map((url) => (
                <div
                  key={url.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 mb-1">Original:</p>
                      <p className="text-sm text-gray-900 truncate mb-3">
                        {url.original}
                      </p>

                      <p className="text-sm text-gray-500 mb-1">Short URL:</p>
                      <div className="flex items-center gap-2">
                        <a
                          href={url.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {url.shortUrl}
                        </a>
                        <button
                          onClick={() => copyToClipboard(url.shortUrl, url.id)}
                          className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                        >
                          {copiedId === url.id ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-blue-600">
                        {url.clicks}
                      </div>
                      <div className="text-xs text-gray-500">clicks</div>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(url.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
