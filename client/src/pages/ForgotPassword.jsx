import { useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthBackground from '../components/AuthBackground';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex items-center justify-center relative overflow-hidden">
            <AuthBackground />

            <div className="card w-full max-w-md bg-[#050505]/80 backdrop-blur-xl border border-white/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.7)] rounded-sm p-8 md:p-12 relative z-10 transition-all duration-500 hover:border-[#D4AF37]/20">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-heading text-highlight">Forgot Password?</h2>
                    <p className="text-secondary/60 mt-2">Enter your email to receive a reset link</p>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <input
                            type="email"
                            id="email"
                            className="block px-4 pb-2.5 pt-5 w-full text-sm text-secondary bg-transparent rounded-lg border border-white/10 appearance-none focus:outline-none focus:ring-0 focus:border-[#C9A25F] peer caret-[#C9A25F]"
                            placeholder=" "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label
                            htmlFor="email"
                            className="absolute text-sm text-white/50 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-[#C9A25F]"
                        >
                            Email Address
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary py-3.5 mt-4 flex items-center justify-center gap-2 transition-all duration-150 hover:-translate-y-[1px] active:translate-y-[1px] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-secondary/60">
                    <Link to="/login" className="text-white/60 hover:text-white flex items-center justify-center gap-2 transition-colors">
                        <ArrowLeft size={14} /> Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
