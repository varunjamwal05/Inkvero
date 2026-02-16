import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { User, Mail, Calendar, Edit2, Save, X } from 'lucide-react';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        bio: '',
        avatar: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/profile/me');
            setProfile(data.data.user);
            setStats(data.data.stats);
            setFormData({
                bio: data.data.user.bio || '',
                avatar: data.data.user.avatar || ''
            });
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.patch('/profile/me', formData);
            setProfile(data.data.user);
            setEditing(false);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to update profile');
        }
    };

    if (loading) return <div className="flex justify-center p-10 text-gray-400">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto mt-24 px-6 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
            >
                {/* Header Decoration */}
                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-4xl md:text-5xl font-heading text-white tracking-tight">My Profile</h1>
                    <div className="h-px flex-1 bg-gradient-to-r from-[#D4AF37]/30 to-transparent ml-8"></div>
                </div>

                {error && <div className="bg-red-500/10 text-red-400 p-3 rounded mb-4 text-sm border border-red-500/20">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Left Column: Avatar & Quick Stats */}
                    <div className="md:col-span-4 flex flex-col items-center space-y-8">
                        {/* Avatar Container */}
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-full overflow-hidden bg-[#0A0A0A] border border-[#D4AF37]/30 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.1)] group-hover:border-[#D4AF37]/60 group-hover:shadow-[0_0_50px_rgba(212,175,55,0.2)] transition-all duration-500">
                                {/* Initials (Always rendered as fallback background) */}
                                <span className="text-5xl text-[#D4AF37] font-heading font-medium">
                                    {profile?.username?.charAt(0).toUpperCase()}
                                </span>

                                {/* Image Overlay */}
                                {profile?.avatar && (
                                    <img
                                        src={profile.avatar}
                                        alt={profile.username}
                                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                                        onError={(e) => e.target.style.opacity = 0}
                                    />
                                )}
                            </div>

                            {/* Edit Button (Floating) */}
                            {!editing && (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="absolute bottom-2 right-2 p-2 bg-[#D4AF37] text-black rounded-full hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg"
                                    title="Edit Profile"
                                >
                                    <Edit2 size={14} />
                                </button>
                            )}
                        </div>

                        <div className="text-center space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/60 font-medium">Member since {new Date(profile?.createdAt).getFullYear()}</p>
                            <div className="flex gap-4 justify-center mt-4">
                                <div className="text-center px-4 py-2 border border-white/5 rounded-sm bg-white/[0.02]">
                                    <span className="block text-xl font-heading text-white">{stats?.completedCount || 0}</span>
                                    <span className="text-[9px] uppercase tracking-wider text-zinc-500">Read</span>
                                </div>
                                <div className="text-center px-4 py-2 border border-white/5 rounded-sm bg-white/[0.02]">
                                    <span className="block text-xl font-heading text-white">{stats?.planCount || 0}</span>
                                    <span className="text-[9px] uppercase tracking-wider text-zinc-500">Radar</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Info & Activity */}
                    <div className="md:col-span-8 space-y-10">
                        {!editing ? (
                            <>
                                {/* Identity Section */}
                                <div className="space-y-2 border-b border-white/5 pb-8">
                                    <h2 className="text-4xl font-heading text-white tracking-wide">{profile?.username}</h2>
                                    <p className="text-sm text-[#D4AF37]/80 font-mono tracking-wide">@{profile?.username.toLowerCase().replace(/\s+/g, '')}</p>
                                    <div className="flex items-center text-zinc-500 text-xs gap-2 pt-2">
                                        <Mail size={12} /> {profile?.email}
                                    </div>
                                </div>

                                {/* About Me as a "Note" */}
                                <div className="relative pl-6 border-l-2 border-[#D4AF37]/20">
                                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4 font-bold">About</h3>
                                    <p className="text-zinc-300 whitespace-pre-wrap text-lg font-serif italic leading-relaxed opacity-90">
                                        "{profile?.bio || "A silent observer of worlds..."}"
                                    </p>
                                </div>

                                {/* Reading Activity */}
                                <div className="pt-4">
                                    <h3 className="text-[11px] uppercase tracking-[0.3em] text-white mb-6 flex items-center gap-4">
                                        Current Read <span className="h-px bg-white/10 flex-1"></span>
                                    </h3>

                                    {stats?.currentlyReading ? (
                                        <div className="group relative bg-[#0A0A0A] border border-white/5 hover:border-[#D4AF37]/30 rounded-sm p-6 flex gap-6 transition-all duration-500 hover:bg-[#0C0C0C]">
                                            <div className="w-20 h-28 bg-zinc-900 shadow-lg shrink-0 overflow-hidden relative">
                                                <img
                                                    src={stats.currentlyReading.book.coverImage}
                                                    alt={stats.currentlyReading.book.title}
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                                                />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h4 className="font-heading text-2xl text-white mb-2 leading-none group-hover:text-[#D4AF37] transition-colors">{stats.currentlyReading.book.title}</h4>
                                                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">by {stats.currentlyReading.book.authors?.[0] || 'Unknown'}</p>
                                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden max-w-[200px]">
                                                    <div className="h-full bg-[#D4AF37] w-1/3"></div> {/* Mock Progress */}
                                                </div>
                                                <span className="text-[9px] text-[#D4AF37]/60 mt-2 tracking-wider uppercase">In Progress</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border border-dashed border-white/10 rounded-sm p-8 text-center bg-white/[0.02]">
                                            <p className="text-sm text-zinc-600 italic font-serif">"The shelf stands empty, waiting for a story."</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleSubmit} className="bg-[#0A0A0A] border border-white/10 p-8 rounded-sm space-y-6">
                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <h3 className="text-lg font-heading text-white">Edit Sanctuary</h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditing(false);
                                            setFormData({ bio: profile.bio || '', avatar: profile.avatar || '' });
                                        }}
                                        className="text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-[#D4AF37]/80 mb-2">Avatar URL</label>
                                    <input
                                        type="text"
                                        value={formData.avatar}
                                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-sm p-3 text-sm text-zinc-300 focus:border-[#D4AF37] focus:outline-none transition-colors"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-[#D4AF37]/80 mb-2">Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-sm p-3 text-sm text-zinc-300 focus:border-[#D4AF37] focus:outline-none h-32 resize-none font-serif italic"
                                        placeholder="Your literary persona..."
                                        maxLength={300}
                                    />
                                    <p className="text-right text-[10px] text-zinc-600 mt-2">{formData.bio.length}/300</p>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        className="bg-[#D4AF37] text-black px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 flex items-center gap-2"
                                    >
                                        <Save size={14} /> Save Changes
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
