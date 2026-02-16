import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const location = useLocation();
    // Normalize path to ignore trailing slashes and query params
    const path = location.pathname.toLowerCase().replace(/\/$/, '');
    const isAuthPage = ['/login', '/register'].includes(path) || path.startsWith('/login') || path.startsWith('/register');

    const isHomePage = path === '' || path === '/';

    return (
        <div className={`min-h-screen flex flex-col text-secondary font-body overflow-x-hidden ${isAuthPage ? 'h-screen overflow-hidden' : 'bg-background'}`}>
            {!isAuthPage && <Navbar />}
            <div className="flex-grow flex flex-col relative">
                {/* For Auth pages, we remove vertical padding to allow exact centering and verify full height */}
                <main className={`flex-grow w-full flex flex-col ${isAuthPage ? '' : (isHomePage ? '' : 'pt-32 pb-12')}`}>
                    {children}
                </main>
            </div>
            {!isAuthPage && (
                <div className="relative">
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-black/40 pointer-events-none -mt-24"></div>
                    <footer className="w-full px-6 lg:px-10 bg-black/40 pt-16 pb-12 text-center text-sm text-zinc-500/60 backdrop-blur-sm border-t border-white/[0.02]">
                        <p className="font-light tracking-wide">&copy; {new Date().getFullYear()} Inkvero. A Social Reading Community.</p>

                        <div className="w-12 h-px bg-white/[0.05] mx-auto my-8"></div>

                        <p className="text-[11px] text-[#D4AF37]/80 mb-4 tracking-[0.2em] uppercase font-medium max-w-xs mx-auto leading-relaxed">A quiet place for loud minds.</p>
                        <p className="text-[10px] text-zinc-700/50 font-mono tracking-wider">
                            EST. 2024 • THE ART OF SLOW READING
                        </p>
                    </footer>
                </div>
            )}
        </div>
    );
};

export default Layout;
