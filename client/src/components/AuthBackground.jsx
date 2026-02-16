import { useMemo } from 'react';

// Using quality Unsplash book covers
const COVERS = [
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1585044433842-51000b0c96c4?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1533327325824-76bc4e6295cd?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1531988042242-7419f1543055?auto=format&fit=crop&w=300&q=80'
];

const AuthBackground = () => {
    const bubbles = useMemo(() => {
        return Array.from({ length: 35 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            initialTop: `${Math.random() * 100}%`,
            cover: COVERS[Math.floor(Math.random() * COVERS.length)],
            duration: `${80 + Math.random() * 60}s`, // Slower
            delay: `-${Math.random() * 100}s`,
            rotate: -6 + Math.random() * 12,
            scale: 0.4 + Math.random() * 0.4,
            opacity: 0.32 + Math.random() * 0.18 // Adjusted opacity range 0.32 - 0.5
        }));
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden bg-[#050505] z-0 pointer-events-none">
            {/* CSS Animation */}
            <style>
                {`
                    @keyframes driftUp {
                        from { transform: translateY(110vh); }
                        to { transform: translateY(-120vh); }
                    }
                `}
            </style>

            {bubbles.map((item) => (
                <div
                    key={item.id}
                    className="absolute top-0 will-change-transform"
                    style={{
                        left: item.left,
                        // We animate the Y position from 110vh to -120vh to ensure it crosses the screen
                        // But to have them scattered initially, we use negative delay heavily and standard animation.
                        animation: `driftUp ${item.duration} linear infinite`,
                        animationDelay: item.delay,
                        opacity: item.opacity,
                    }}
                >
                    {/* Inner Transformation for Scale/Rotate that doesn't conflict with slide animation */}
                    <div
                        className="w-32 md:w-48 aspect-[2/3] rounded shadow-2xl bg-zinc-800"
                        style={{
                            transform: `scale(${item.scale}) rotate(${item.rotate}deg)`,
                            backgroundImage: `url(${item.cover})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                            filter: 'brightness(1.08) contrast(1.12) saturate(1.05)' // Soft contrast lift
                        }}
                    />
                </div>
            ))}

            {/* Dark Overlays with Reduced Strength and Blur Depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#000_100%)] opacity-80" />
        </div>
    );
};

export default AuthBackground;
