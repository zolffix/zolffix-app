import React, { useContext, useMemo } from 'react';
import { Quote } from '../types';
import { AppContext } from '../App';

interface QuoteCardProps {
    quote: Quote;
    isInteractive?: boolean;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, isInteractive = true }) => {
    const context = useContext(AppContext);

    const isLiked = useMemo(() => {
        return context?.likedQuotes.some(q => q.id === quote.id);
    }, [context?.likedQuotes, quote.id]);
    
    const isSaved = useMemo(() => {
        return context?.savedQuotes.some(q => q.id === quote.id);
    }, [context?.savedQuotes, quote.id]);

    const handleLikeToggle = () => {
        if (!context) return;
        context.toggleQuoteLiked(quote);
    };

    const handleSaveToggle = () => {
        if (!context) return;
        context.toggleQuoteSaved(quote);
    };
    
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Zolffix Quote',
                    text: `"${quote.text}" - ${quote.author}`,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            alert('Share feature is not supported on this browser.');
        }
    };

    const handleDownload = () => {
        alert("Download feature coming soon! For now, you can screenshot this beautiful quote.");
    };

    return (
        <div className="w-full">
            <div className="relative w-full aspect-square bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-xl overflow-hidden shadow-lg shadow-black/50 flex flex-col p-8 text-center text-white">
                <img src={quote.imageUrl} alt="Cinematic background for a quote" className="absolute top-0 left-0 w-full h-full object-cover opacity-60 z-0" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 via-black/20 to-black/70 z-10"></div>
                <div className="relative z-20 flex flex-col justify-between flex-grow w-full">
                    <div className="flex-grow flex items-center justify-center py-8">
                        <div>
                            <p className="text-2xl md:text-3xl font-serif italic break-words">“{quote.text}”</p>
                            <p className="mt-4 text-lg text-gray-300">— {quote.author}</p>
                        </div>
                    </div>
                </div>
            </div>
             {isInteractive && (
                <div className="mt-4 w-full">
                    <div className="flex justify-around items-center max-w-sm mx-auto">
                        <button onClick={handleLikeToggle} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isLiked ? 'text-red-500' : 'text-gray-300'}>
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                        <button onClick={handleSaveToggle} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isSaved ? 'text-cyan-400' : 'text-gray-300'}>
                                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
                            </svg>
                        </button>
                        <button onClick={handleShare} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" x2="12" y1="2" y2="15"></line>
                            </svg>
                        </button>
                        <button onClick={handleDownload} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuoteCard;