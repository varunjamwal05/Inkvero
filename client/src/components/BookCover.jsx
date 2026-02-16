import { useRef, useState, useCallback } from 'react';

const BookCover = ({ src, alt, className = '', imgClassName = '', style = {}, ...props }) => {
    const containerRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const requestRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
        if (!isHovered || !containerRef.current) return;

        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        // Calculate percentages (-1 to 1)
        const xPct = (x / width - 0.5) * 2;
        const yPct = (y / height - 0.5) * 2;

        // update rotation
        const rotateX = -yPct * 4; // Max 4deg
        const rotateY = xPct * 4;

        // update light sheen position (0 to 100%)
        const sheenX = (x / width) * 100;

        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        requestRef.current = requestAnimationFrame(() => {
            if (containerRef.current) {
                containerRef.current.style.setProperty('--rotate-x', `${rotateX}deg`);
                containerRef.current.style.setProperty('--rotate-y', `${rotateY}deg`);
                containerRef.current.style.setProperty('--sheen-x', `${sheenX}%`);
            }
        });
    }, [isHovered]);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        if (containerRef.current) {
            // Reset to default
            containerRef.current.style.setProperty('--rotate-x', '0deg');
            containerRef.current.style.setProperty('--rotate-y', '0deg');
            containerRef.current.style.setProperty('--sheen-x', '50%'); // Reset sheen to center or off?
        }
    };

    // Construct wrapper classes. We need to pass the layout classes (w/h) to the container.
    // transform-style: preserve-3d is important for the 3D effect.
    return (
        <div
            ref={containerRef}
            className={`relative perspective-container cursor-pointer select-none ${className}`}
            style={{
                perspective: '800px',
                transformStyle: 'preserve-3d',
                ...style
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className="w-full h-full relative transition-all duration-300 ease-out will-change-transform book-3d-content"
                style={{
                    transform: isHovered
                        ? 'rotateX(var(--rotate-x)) rotateY(var(--rotate-y)) translateY(-6px) scale(1.04)'
                        : 'rotateX(0deg) rotateY(0deg) translateY(0) scale(1)',
                    boxShadow: isHovered
                        ? '0 20px 30px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
                        : '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                    transitionTimingFunction: isHovered ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'ease-out'
                }}
            >
                <img
                    src={src}
                    alt={alt}
                    className={`w-full h-full object-cover rounded-md block bg-gray-800 ${imgClassName}`}
                    draggable={false}
                    {...props}
                />

                {/* Paper Light Sheen Overlay */}
                <div
                    className="absolute inset-0 rounded-md pointer-events-none mix-blend-plus-lighter z-10 transition-opacity duration-300"
                    style={{
                        background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.0) 60%)',
                        opacity: isHovered ? 1 : 0,
                        transform: 'translateX(calc(var(--sheen-x) * 1% - 50%))', // Move gradient
                        backgroundSize: '200% 100%'
                    }}
                />

                {/* Edge Highlight (Inner Border logic) */}
                <div className="absolute inset-0 rounded-md border border-white/10 pointer-events-none z-20"></div>
            </div>
        </div>
    );
};

export default BookCover;
