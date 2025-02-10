import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useToast } from '../hooks/useToast';

const AiNewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/crypto-news');
        if (!response.ok) throw new Error('Failed to fetch news');
        const articles = await response.json();
        setNews(articles);
      } catch (error) {
        console.error('Error fetching news:', error);
        showError('Failed to load crypto news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-primary mb-8">Latest Crypto News</h1>
        <div className="space-y-8">
          {news.map((article, index) => (
            <article key={index} className="bg-background-secondary rounded-lg shadow-lg p-6 border border-primary/10">
              <h2 className="text-2xl font-bold text-primary mb-2">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-hover">
                  {article.title}
                </a>
              </h2>
              <p className="text-primary/60 mb-4">
                {article.source} • {article.publishedAt}
              </p>
              <p className="text-primary/80">{article.summary}</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-primary hover:text-primary-hover"
              >
                Read more →
              </a>
            </article>
          ))}
          {news.length === 0 && (
            <p className="text-center text-primary/60">No news articles available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiNewsPage;