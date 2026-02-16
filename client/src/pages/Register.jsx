import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthBackground from '../components/AuthBackground';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await register(username, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex items-center justify-center relative overflow-hidden">
            <AuthBackground />

            {/* 1. Background Depth - Removed to use AuthBackground */}
            {/* <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(201,162,95,0.12)_0%,transparent_55%)]"></div> */}

            {/* 2. Auth Card Polish */}
            {/* 2. Auth Card Polish - Softened Borders */}
            <div className="card w-full max-w-md bg-[#050505]/80 backdrop-blur-xl border border-white/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.7)] rounded-sm p-8 md:p-12 relative z-10 transition-all duration-500 hover:border-[#D4AF37]/20">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-heading text-highlight">Join Inkvero</h2>
                    <p className="text-secondary/60 mt-1">Start your reading adventure</p>
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
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 3. Floating Label Input - Username */}
                    <div className="relative group">
                        <input
                            type="text"
                            id="username"
                            className="block px-4 pb-2.5 pt-5 w-full text-sm text-secondary bg-transparent rounded-lg border border-white/10 appearance-none focus:outline-none focus:ring-0 focus:border-[#C9A25F] peer caret-[#C9A25F]"
                            placeholder=" "
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <label
                            htmlFor="username"
                            className="absolute text-sm text-white/50 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-[#C9A25F]"
                        >
                            Username
                        </label>
                    </div>

                    {/* 3. Floating Label Input - Email */}
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

                    {/* 3. & 4. Floating Label Input - Password & Toggle */}
                    <div className="relative group">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className="block px-4 pb-2.5 pt-5 w-full text-sm text-secondary bg-transparent rounded-lg border border-white/10 appearance-none focus:outline-none focus:ring-0 focus:border-[#C9A25F] peer caret-[#C9A25F] pr-10"
                            placeholder=" "
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label
                            htmlFor="password"
                            className="absolute text-sm text-white/50 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-[#C9A25F]"
                        >
                            Password
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* 5. Button Interaction */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary py-3.5 mt-4 flex items-center justify-center gap-2 transition-all duration-150 hover:-translate-y-[1px] active:translate-y-[1px] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-secondary/60">
                    Already a member? <Link to="/login" className="text-accent hover:text-highlight font-medium transition-colors">Sign in</Link>
                </p>

                {/* 7. Footer Micro Text */}
                <p className="text-xs text-white/40 text-center mt-6 tracking-wide">
                    Join readers building a better reading habit.
                </p>
            </div>
        </div>
    );
};

export default Register;
