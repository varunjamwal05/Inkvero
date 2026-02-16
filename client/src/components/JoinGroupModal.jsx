
import { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { X, Users, BookOpen } from 'lucide-react';

const JoinGroupModal = ({ onClose }) => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!code.trim()) {
            setError('Please enter a code');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/groups/join', { inviteCode: code });
            onClose();
            // Optional: Show success toast
            navigate(`/groups/${data.data._id}`);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Invalid or expired invite code');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* 2. Background Atmosphere - Dim Radial Focus */}
            <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.75)_70%)] backdrop-blur-[2px] animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* 1. Modal Surface - Paper Card Look */}
            {/* 6. Entrance Animation - Scale & Fade */}
            <div
                className="relative w-full max-w-sm overflow-hidden rounded-lg bg-gradient-to-b from-[#111] via-[#151515] to-[#121212] p-8 shadow-[0_40px_90px_rgba(0,0,0,0.65)] ring-1 ring-[#d4af37]/20 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 ease-out"
                style={{
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -12px 30px rgba(0,0,0,0.35), 0 40px 90px rgba(0,0,0,0.65)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 7. Close Button - Subtle & Ritualistic */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-white/50 transition-all duration-300 hover:rotate-90 hover:text-[#d4af37] hover:opacity-100"
                >
                    <X size={18} />
                </button>

                {/* 3. Title Typography - Ceremonial */}
                <div className="mb-8 text-center">
                    <h2
                        className="font-heading text-2xl tracking-[0.06em] text-[#E6C77A]"
                        style={{ textShadow: '0 0 18px rgba(212,175,55,0.18)' }}
                    >
                        Join the Circle
                    </h2>
                    <p className="mt-2 text-sm text-white/55">
                        Enter your invitation code below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* 4. Invite Code Input - Engraved Signature Field */}
                    <div className="relative group">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="INVITE CODE"
                            maxLength={6}
                            className="w-full rounded bg-[#0f0f0f] border border-[#d4af37]/35 py-4 text-center font-heading text-xl uppercase tracking-[0.35em] text-[#E6C77A] placeholder-[#E6C77A]/28 transition-all duration-300 focus:border-[#d4af37] focus:outline-none focus:shadow-[0_0_0_2px_rgba(212,175,55,0.12),0_0_25px_rgba(212,175,55,0.15)]"
                            autoFocus
                        />
                        {/* Bottom Highlight Line Animation on Focus (could be done via peer/focus classes, keeping simple for now) */}
                    </div>

                    {error && <p className="text-center text-xs text-red-400/90 animate-pulse">{error}</p>}

                    {/* 5. Enter Group Button - Ritual Feel */}
                    <button
                        type="submit"
                        disabled={loading || code.length < 3}
                        className="w-full rounded bg-gradient-to-r from-[#9c6b34] to-[#b98544] py-3 font-medium text-[#f4e6c3] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl active:translate-y-[1px] active:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:brightness-75"
                    >
                        {loading ? 'Connecting...' : 'Enter Group'}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default JoinGroupModal;
