import { useState } from 'react';
import api from '../api/axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthBackground from '../components/AuthBackground';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            const res = await api.post(`/auth/reset-password/${token}`, { password });
            setMessage(res.data.message);
            // Optional: Redirect after delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex items-center justify-center relative overflow-hidden">
            <AuthBackground />

            <div className="card w-full max-w-md bg-[#050505]/80 backdrop-blur-xl border border-white/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.7)] rounded-sm p-8 md:p-12 relative z-10 transition-all duration-500 hover:border-[#D4AF37]/20">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-heading text-highlight">Reset Password</h2>
                    <p className="text-secondary/60 mt-2">Enter your new password below</p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-red-900/20 border border-red-500/50 text-red-400 text-sm px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
                        >
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-green-900/20 border border-green-500/50 text-green-400 text-sm px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
                        >
                            <CheckCircle size={16} />
                            <span>{message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!message && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="block px-4 pb-2.5 pt-5 w-full text-sm text-secondary bg-transparent rounded-lg border border-white/10 appearance-none focus:outline-none focus:ring-0 focus:border-[#C9A25F] peer caret-[#C9A25F] pr-10"
                                placeholder=" "
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                            <label
                                htmlFor="password"
                                className="absolute text-sm text-white/50 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-[#C9A25F]"
                            >
                                New Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-3.5 mt-4 flex items-center justify-center gap-2 transition-all duration-150 hover:-translate-y-[1px] active:translate-y-[1px] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                'Set New Password'
                            )}
                        </button>
                    </form>
                )}

                {message && (
                    <p className="mt-8 text-center text-sm text-secondary/60">
                        Redirecting to login... <br />
                        <Link to="/login" className="text-highlight hover:text-white underline transition-colors">Click here if not redirected</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
