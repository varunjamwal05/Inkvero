import { createContext, useContext, useState } from 'react';

const BookTransitionContext = createContext();

export const useBookTransition = () => useContext(BookTransitionContext);

export const BookTransitionProvider = ({ children }) => {
    const [transitionData, setTransitionData] = useState(null);

    const startTransition = (data) => {
        setTransitionData(data);
    };

    const clearTransition = () => {
        setTransitionData(null);
    };

    return (
        <BookTransitionContext.Provider value={{ transitionData, startTransition, clearTransition }}>
            {children}
        </BookTransitionContext.Provider>
    );
};
