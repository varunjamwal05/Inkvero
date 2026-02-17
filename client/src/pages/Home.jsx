import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../utils/imageUtils';

const Home = () => {
    const activities = [
        "Anshika started reading The Alchemist",
        "Harsh joined Midnight Fiction Club",
        "Varun is discussing Dune",
        "Chander bookmarked Atomic Habits",
        "Kiran started reading Pride and Prejudice",
        "Vanshika joined Philosophy Circle",
        "Suryansh completed The Great Gatsby",
        "Labhikesh is reading 1984"
    ];

    const floatingBooks = [
        { src: getImageUrl("book-covers/pg11.jpg"), initial: { top: "12%", left: "8%" }, delay: 0 },
        { src: getImageUrl("book-covers/pg1342.jpg"), initial: { top: "25%", right: "12%" }, delay: 5 },
        { src: getImageUrl("book-covers/pg345.jpg"), initial: { bottom: "18%", left: "18%" }, delay: 2 },
        { src: getImageUrl("book-covers/pg35.jpg"), initial: { bottom: "28%", right: "22%" }, delay: 7 },
        { src: getImageUrl("book-covers/pg132.jpg"), initial: { top: "45%", left: "82%" }, delay: 4 },
        // Additional covers for denser atmosphere
        { src: getImageUrl("book-covers/pg11.jpg"), initial: { top: "5%", left: "45%" }, delay: 1.5 },
        { src: getImageUrl("book-covers/pg1342.jpg"), initial: { bottom: "8%", right: "48%" }, delay: 3.5 },
        { src: getImageUrl("book-covers/pg345.jpg"), initial: { top: "65%", right: "6%" }, delay: 2.5 },
        { src: getImageUrl("book-covers/pg35.jpg"), initial: { top: "78%", left: "4%" }, delay: 6 },
        // Top corners specific
        { src: getImageUrl("book-covers/pg132.jpg"), initial: { top: "8%", right: "5%" }, delay: 0.5 },
        { src: getImageUrl("book-covers/pg11.jpg"), initial: { top: "15%", left: "2%" }, delay: 4.5 },
        { src: getImageUrl("book-covers/pg35.jpg"), initial: { top: "2%", left: "20%" }, delay: 2.2 },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center relative overflow-hidden bg-[#080808] pt-32 pb-12">
            {/* Cinematic Atmosphere Layers */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(140,130,110,0.08)_0%,transparent_50%)]"></div>
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_40%,black_150%)]"></div> {/* Vignette */}
            <div className="grain-overlay opacity-[0.08] !z-[5]"></div>

            {/* Vertical Rhythm Accents */}
            <div className="absolute inset-0 pointer-events-none flex justify-around opacity-[0.03] z-[5]">
                <div className="w-px h-full bg-gradient-to-b from-transparent via-white to-transparent"></div>
                <div className="w-px h-full bg-gradient-to-b from-transparent via-white to-transparent hidden md:block"></div>
                <div className="w-px h-full bg-gradient-to-b from-transparent via-white to-transparent"></div>
            </div>

            {/* Atmospheric Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[15]" >
                {floatingBooks.map((book, index) => (
                    <motion.img
                        key={index}
                        src={book.src}
                        alt=""
                        className="absolute w-20 md:w-28 select-none border border-white/[0.08] shadow-[0_0_30px_rgba(255,255,255,0.05)] opacity-0"
                        initial={{ opacity: 0, y: 0, rotate: 0 }}
                        animate={{
                            y: [0, -15, 0],
                            x: [0, 8, 0],
                            opacity: [0.2, 0.5, 0.2],
                            rotate: [0, 2, -1, 0],
                        }}
                        transition={{
                            duration: 7,
                            ease: "easeInOut",
                            repeat: Infinity,
                            delay: book.delay,
                            times: [0, 0.5, 1]
                        }}
                        style={{ ...book.initial, filter: `blur(${1 + (index % 3)}px) grayscale(0.2)` }}
                    />
                ))}
            </div >

            {/* Environmental Focus Falloff */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black via-transparent to-transparent z-[18]"></div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center top-[-10%] z-0" >
                <div className="w-[1200px] h-[700px] bg-[radial-gradient(circle,rgba(255,245,220,0.04)_0%,transparent_75%)] blur-[100px] opacity-30"></div>
            </div >

            {/* Hero Section */}
            <motion.div
                className="relative z-20 px-6 backface-hidden transform-gpu"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            >
                <div>
                    <span className="inline-block text-[9px] uppercase tracking-[0.6em] text-[#D4AF37]/60 mb-10 font-medium antialiased">Crafted for the Discerning Reader</span>
                    <h1 className="text-6xl md:text-9xl font-heading mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 tracking-tighter leading-[0.85] subpixel-antialiased">
                        A Sanctuary<br />
                        <span className="text-zinc-400/80 relative inline-block pt-2">
                            for Thought
                            <span className="absolute -bottom-4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"></span>
                        </span>
                    </h1>
                </div>

                <p className="text-base md:text-lg text-zinc-600/80 max-w-lg mb-16 mx-auto font-light leading-relaxed tracking-wide antialiased">
                    Indulge in a space where literature is felt, not just read.
                    Host elegant circles, share profound discoveries, and lose yourself in the margins.
                </p>

                <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                    <Link to="/register" className="relative group px-14 py-5 overflow-hidden rounded-sm bg-[#D4AF37] text-[#050505] text-xs font-black uppercase tracking-[0.25em] transition-all duration-500 hover:bg-[#E6C77A] hover:tracking-[0.35em] hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] active:scale-95">
                        Enter Sanctuary
                    </Link>
                    <Link to="/explore" className="group relative px-14 py-5 text-xs font-bold uppercase tracking-[0.25em] text-zinc-300 border border-white/[0.1] rounded-sm transition-all duration-500 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] hover:bg-[#D4AF37]/[0.05] active:scale-95">
                        Explore Grains
                    </Link>
                </div>
            </motion.div>

            {/* Transitional Horizon with Scroll Indicator */}
            <div className="relative w-full flex flex-col items-center mt-20 z-20">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 8, 0] }}
                    transition={{ delay: 2, duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-2 mb-8"
                >
                    <span className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37]/40">Scroll</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-[#D4AF37]/0 via-[#D4AF37]/40 to-[#D4AF37]/0"></div>
                </motion.div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"></div>
            </div>

            {/* Live Activity Strip - Ghosted */}
            <motion.div
                className="w-full relative py-12 overflow-hidden z-20"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 2 }}
                style={{
                    maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)'
                }}
            >
                <div className="flex whitespace-nowrap animate-scrollX w-[200%] opacity-80 hover:opacity-100 transition-opacity duration-700">
                    {[...activities, ...activities].map((activity, index) => (
                        <span key={index} className="inline-block px-16 font-normal text-zinc-300 text-[11px] tracking-[0.4em] uppercase">
                            {activity}
                        </span>
                    ))}
                </div>
            </motion.div>

            {/* Feature Panels - Elevated UI */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-px w-full max-w-7xl px-6 z-20 mb-40"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
            >
                {/* Panel 1 */}
                <div className="relative p-12 bg-[#0A0A0A]/60 backdrop-blur-sm border border-white/[0.03] hover:border-[#D4AF37]/20 hover:bg-[#0C0C0C] hover:shadow-[0_0_40px_rgba(212,175,55,0.03)] transition-all duration-700 group flex flex-col items-center text-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="w-10 h-10 border border-white/[0.05] rounded-sm mb-8 flex items-center justify-center group-hover:border-[#D4AF37]/40 group-hover:scale-110 transition-all duration-700 bg-black/20">
                        <BookOpen size={16} className="text-zinc-600 group-hover:text-[#D4AF37] transition-colors duration-500" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-300 mb-4 group-hover:text-[#D4AF37] transition-colors duration-500">Personal Shelf</h3>
                    <p className="text-zinc-600 text-[13px] font-light leading-relaxed tracking-wide group-hover:text-zinc-400 transition-colors duration-500 max-w-xs">A curated reflection of your journey. Elegant, non-intrusive, and profoundly yours.</p>
                </div>

                {/* Panel 2 */}
                <div className="relative p-12 bg-[#0A0A0A]/60 backdrop-blur-sm border border-white/[0.03] hover:border-[#D4AF37]/20 hover:bg-[#0C0C0C] hover:shadow-[0_0_40px_rgba(212,175,55,0.03)] transition-all duration-700 group flex flex-col items-center text-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="w-10 h-10 border border-white/[0.05] rounded-sm mb-8 flex items-center justify-center group-hover:border-[#D4AF37]/40 group-hover:scale-110 transition-all duration-700 bg-black/20">
                        <BookOpen size={16} className="text-zinc-600 group-hover:text-[#D4AF37] transition-colors duration-500" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-300 mb-4 group-hover:text-[#D4AF37] transition-colors duration-500">Discourse</h3>
                    <p className="text-zinc-600 text-[13px] font-light leading-relaxed tracking-wide group-hover:text-zinc-400 transition-colors duration-500 max-w-xs">Synchronous reading with a refined circle. Where thoughts resonate in high-fidelity.</p>
                </div>

                {/* Panel 3 */}
                <div className="relative p-12 bg-[#0A0A0A]/60 backdrop-blur-sm border border-white/[0.03] hover:border-[#D4AF37]/20 hover:bg-[#0C0C0C] hover:shadow-[0_0_40px_rgba(212,175,55,0.03)] transition-all duration-700 group flex flex-col items-center text-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="w-10 h-10 border border-white/[0.05] rounded-sm mb-8 flex items-center justify-center group-hover:border-[#D4AF37]/40 group-hover:scale-110 transition-all duration-700 bg-black/20">
                        <BookOpen size={16} className="text-zinc-600 group-hover:text-[#D4AF37] transition-colors duration-500" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-300 mb-4 group-hover:text-[#D4AF37] transition-colors duration-500">Grains</h3>
                    <p className="text-zinc-600 text-[13px] font-light leading-relaxed tracking-wide group-hover:text-zinc-400 transition-colors duration-500 max-w-xs">Unearth hidden masterpieces at wait. Intentional discovery without the noise of algorithms.</p>
                </div>
            </motion.div>
        </div >
    );
};

export default Home;
