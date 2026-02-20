import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, Compass, LogOut } from 'lucide-react';
import JoinGroupModal from './JoinGroupModal';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [openJoin, setOpenJoin] = useState(false);
    const [openProfile, setOpenProfile] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setOpenProfile(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="fixed w-full top-0 z-50 transition-all duration-700 bg-gradient-to-b from-[#050505]/80 via-[#050505]/40 to-transparent backdrop-blur-[1px]">
            <div className="w-full px-8 lg:px-12 flex items-center justify-between h-24">
                <div className="flex items-center">
                    <Link to="/" className="flex items-center space-x-4 group opacity-80 hover:opacity-100 transition-opacity duration-500">
                        <BookOpen className="h-5 w-5 text-zinc-500 group-hover:text-[#D4AF37] transition-colors duration-500" />
                        <span className="font-heading text-lg font-bold tracking-[0.25em] text-zinc-400 group-hover:text-zinc-200 transition-colors uppercase">Inkvero</span>
                    </Link>
                </div>

                <div className="flex items-center gap-12">
                    <div className="hidden md:flex items-center space-x-12">
                        <Link to="/explore" className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-[#D4AF37] active:scale-95 active:text-[#b99628] transition-all duration-300 font-medium">
                            Library
                        </Link>
                        {user && (
                            <>
                                <Link to="/dashboard" className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-[#D4AF37] active:scale-95 active:text-[#b99628] transition-all duration-300 font-medium">
                                    My Shelf
                                </Link>
                                <button
                                    onClick={() => setOpenJoin(true)}
                                    className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-[#D4AF37] active:scale-95 active:text-[#b99628] transition-all duration-300 font-medium"
                                >
                                    Join Circle
                                </button>
                            </>
                        )}
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-8 flex items-center space-x-6">
                            {user ? (
                                <div className="relative group/profile" ref={profileRef}>
                                    <button
                                        onClick={() => setOpenProfile(!openProfile)}
                                        className="flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.08] text-[#D4AF37] font-medium overflow-hidden border border-white/[0.15] hover:border-[#D4AF37]/50 hover:bg-white/[0.12] transition-all duration-300 focus:outline-none shadow-sm"
                                    >
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="profile"
                                                className="w-full h-full object-cover opacity-100 hover:opacity-90 transition-opacity"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        ) : null}
                                        <span style={{ display: user.avatar ? 'none' : 'block' }} className="text-xs tracking-wider">{user.username?.[0]?.toUpperCase()}</span>
                                    </button>

                                    {openProfile && (
                                        <div className="absolute right-0 mt-6 w-56 bg-[#0a0a0a] border border-white/[0.08] rounded-sm shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="px-5 py-3 border-b border-white/[0.03] mb-2">
                                                <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Signed in as</p>
                                                <p className="text-xs text-zinc-300 font-light mt-1 truncate tracking-wide">{user.username}</p>
                                            </div>
                                            <Link
                                                to="/profile"
                                                className="block px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-200 transition-colors"
                                                onClick={() => setOpenProfile(false)}
                                            >
                                                Profile
                                            </Link>
                                            <Link
                                                to="/my-uploads"
                                                className="block px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-200 transition-colors"
                                                onClick={() => setOpenProfile(false)}
                                            >
                                                My Uploads
                                            </Link>
                                            <Link
                                                to="/groups"
                                                className="block px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-200 transition-colors"
                                                onClick={() => setOpenProfile(false)}
                                            >
                                                My Circles
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setOpenProfile(false);
                                                    handleLogout();
                                                }}
                                                className="block w-full text-left px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/60 hover:bg-white/[0.02] hover:text-[#D4AF37] transition-colors border-t border-white/[0.03] mt-2"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-8">
                                    <Link to="/login" className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-[#D4AF37] active:scale-95 active:text-[#b99628] transition-all duration-300 font-medium">Login</Link>
                                    <Link to="/register" className="px-8 py-3 bg-white/[0.03] border border-white/[0.05] text-zinc-400 text-[9px] font-bold uppercase tracking-[0.25em] hover:bg-white/[0.08] hover:text-white hover:border-white/[0.1] active:scale-95 transition-all duration-300 rounded-sm shadow-sm">Join</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {openJoin && <JoinGroupModal onClose={() => setOpenJoin(false)} />}
        </nav >
    );
};

export default Navbar;
