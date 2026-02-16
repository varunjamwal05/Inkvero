import { motion } from 'framer-motion';
import { useBookTransition } from '../context/BookTransitionContext';
import { useEffect } from 'react';

const BookOpenOverlay = () => {
    const { transitionData, clearTransition } = useBookTransition();

    useEffect(() => {
        if (transitionData) {
            const timer = setTimeout(() => {
                clearTransition();
            }, 800); // Clear after animation completes
            return () => clearTimeout(timer);
        }
    }, [transitionData, clearTransition]);

    if (!transitionData) return null;

    const { rect, imageSrc } = transitionData;

    return (
        <motion.div
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
            initial={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
            animate={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            exit={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            <motion.img
                src={imageSrc}
                alt="Opening Book"
                className="absolute object-cover shadow-2xl rounded"
                initial={{
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    opacity: 1
                }}
                animate={{
                    top: '50%',
                    left: '50%',
                    x: '-50%',
                    y: '-50%',
                    width: '400px', // Target width
                    height: '600px', // Target height
                    opacity: 0, // Fade out as it opens into the new page
                    scale: 1.2
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
        </motion.div>
    );
};

export default BookOpenOverlay;
