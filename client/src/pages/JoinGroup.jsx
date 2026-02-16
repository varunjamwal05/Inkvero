import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Users, BookOpen, AlertCircle } from 'lucide-react';

const JoinGroup = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                const { data } = await api.get(`/groups/invite/${code}`);
                setGroup(data.data);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Invalid invite link');
            } finally {
                setLoading(false);
            }
        };
        fetchPreview();
    }, [code]);

    const handleJoin = async () => {
        setJoining(true);
        try {
            const { data } = await api.post('/groups/join', { inviteCode: code });
            // Redirect to group dashboard
            navigate(`/groups/${data.data._id}`);
        } catch (err) {
            console.error(err);
            // If already member, just redirect
            if (err.response?.data?.message === 'Already a member') {
                navigate(`/groups/${group._id}`);
            } else {
                setError(err.response?.data?.message || 'Failed to join group');
            }
        } finally {
            setJoining(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-pulse text-highlight">Loading invite details...</div>
        </div>
    );

    if (error) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
                <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
                <h2 className="text-2xl font-heading mb-2">Invitation Error</h2>
                <p className="text-gray-400 mb-6">{error}</p>
                <button onClick={() => navigate('/dashboard')} className="btn-outline">Go to Dashboard</button>
            </div>
        </div>
    );

    return (
        <div className="max-w-md mx-auto mt-20 p-8 card border border-white/10 text-center">
            <h1 className="text-gray-400 text-sm uppercase tracking-widest mb-2">You've been invited to</h1>
            <h2 className="text-3xl font-heading text-white mb-6">{group?.name}</h2>

            <div className="bg-white/5 rounded-lg p-6 mb-8">
                <div className="flex justify-center mb-4">
                    <img
                        src={group?.currentBook?.coverUrl || group?.currentBook?.files?.cover || 'https://placehold.co/150x220?text=Cover'}
                        alt="Current Read"
                        className="w-24 h-36 object-cover rounded shadow-lg"
                    />
                </div>
                <h3 className="font-medium text-lg mb-1">{group?.currentBook?.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{group?.currentBook?.author}</p>

                <div className="flex items-center justify-center gap-2 text-sm text-accent">
                    <Users size={16} /> <span>{group?.memberCount} Members</span>
                </div>
            </div>

            <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full btn-primary py-3 text-lg"
            >
                {joining ? 'Joining...' : 'Join Group'}
            </button>
        </div>
    );
};

export default JoinGroup;
