import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { QUOTE_CATEGORIES } from '../../constants';
import { Quote } from '../../types';
import QuoteCard from '../QuoteCard';
import { AppContext } from '../../App';

const mockQuotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
];

const getImageUrl = (keywords: string): string => {
    const processedKeywords = keywords.replace(/[^a-zA-Z0-9\s,]/g, '').replace(/\s+/g, ',');
    return `https://source.unsplash.com/1080x1080/?${encodeURIComponent(processedKeywords)}`;
};

const generateMockQuote = (category: string): Quote => {
    const randomMock = mockQuotes[Math.floor(Math.random() * mockQuotes.length)];
    return {
        id: `quote-${Date.now()}-${Math.random()}`,
        text: randomMock.text,
        author: randomMock.author,
        category,
        imageUrl: getImageUrl(`${category},dark,cinematic`),
        imageKeyword: category,
    };
};

const QuotesScreen: React.FC = () => {
    const context = useContext(AppContext);

    const getInitialCategory = useCallback(() => {
        if (context?.favoriteCategories && context.favoriteCategories.length > 0) {
            return context.favoriteCategories[Math.floor(Math.random() * context.favoriteCategories.length)];
        }
        return QUOTE_CATEGORIES[Math.floor(Math.random() * QUOTE_CATEGORIES.length)];
    }, [context?.favoriteCategories]);

    const [selectedCategory, setSelectedCategory] = useState(getInitialCategory);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const isLoadingRef = useRef(false);

    const fetchAndSetQuotes = useCallback((count = 1, replace = false) => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;
        setIsLoading(true);

        setTimeout(() => {
            const newQuotes = Array.from({ length: count }).map(() => generateMockQuote(selectedCategory));
            if (replace) {
                setQuotes(newQuotes);
            } else {
                setQuotes(prevQuotes => [...prevQuotes, ...newQuotes]);
            }
            setIsLoading(false);
            isLoadingRef.current = false;
        }, 500);
    }, [selectedCategory]);

    useEffect(() => {
        setQuotes([]);
        fetchAndSetQuotes(3, true);
    }, [selectedCategory, fetchAndSetQuotes]);

    const handleRefresh = useCallback(() => {
       fetchAndSetQuotes(3, true);
    }, [fetchAndSetQuotes]);

    const { setRefreshCallback } = context!;
    useEffect(() => {
        if (setRefreshCallback) {
            setRefreshCallback(handleRefresh);
        }
        return () => {
            if (setRefreshCallback) {
                setRefreshCallback(() => {});
            }
        };
    }, [handleRefresh, setRefreshCallback]);

    const Loader = () => (
        <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <p className="ml-3 text-gray-400">Generating new quote...</p>
        </div>
    );

    return (
        <div className="p-2 md:p-4">
            <h2 className="text-lg font-semibold text-gray-300 px-2 mb-4">Categories</h2>
            <div className="px-2 pb-4">
                <div className="flex overflow-x-auto space-x-2 pb-2 -mx-2 px-2 no-scrollbar">
                    {QUOTE_CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                                selectedCategory === category
                                ? 'bg-cyan-500 text-gray-900'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading && quotes.length === 0 ? (
                <Loader />
            ) : (
                <InfiniteScroll
                    dataLength={quotes.length}
                    next={() => fetchAndSetQuotes(1)}
                    hasMore={true}
                    loader={<Loader />}
                    scrollableTarget="main-content"
                    className="space-y-4"
                >
                    {quotes.map((quote) => (
                        <QuoteCard key={quote.id} quote={quote} />
                    ))}
                </InfiniteScroll>
            )}
        </div>
    );
};

export default QuotesScreen;
