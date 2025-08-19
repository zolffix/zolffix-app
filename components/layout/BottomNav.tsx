
import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { NAV_ITEMS } from '../../constants';
import { Screen } from '../../types';

const BottomNav: React.FC = () => {
    const context = useContext(AppContext);

    if (!context) return null;

    const { activeScreen, setActiveScreen } = context;

    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-gray-900 border-t border-gray-800 z-30">
            <div className="flex justify-around items-center h-16">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => setActiveScreen(item.name as Screen)}
                        className="flex flex-col items-center justify-center text-gray-400 hover:text-cyan-400 transition-colors w-1/5"
                    >
                        {item.icon(activeScreen === item.name)}
                        <span className={`text-xs mt-1 ${activeScreen === item.name ? 'text-cyan-400' : ''}`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;