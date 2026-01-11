import React, { useEffect, useState } from 'react';
import { getUser } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, BookOpen, Heart, Loader2 } from 'lucide-react';
import BookCard from '../../components/books/BookCard';
import NoteCard from '../../components/notes/NoteCard';
import PageTransition from '../../components/PageTransition';

const API_BASE_URL = 'http://localhost:8000/api';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUserData] = useState<any>(null);
    const [myUploads, setMyUploads] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'uploads' | 'favorites'>('uploads');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            const userData = getUser();
            if (!userData) {
                navigate('/login');
                return;
            }
            setUserData(userData);

            try {
                const token = localStorage.getItem('authToken');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [uploadsRes, favoritesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/upload/user/my-uploads`, { headers }),
                    fetch(`${API_BASE_URL}/favorites/resources`, { headers })
                ]);

                const uploadsData = await uploadsRes.json();
                const favoritesData = await favoritesRes.json();

                if (uploadsData.success) {
                    setMyUploads(uploadsData.resources.map((r: any) => ({
                        ...r,
                        imageUrl: r.coverFile ? `${API_BASE_URL.replace('/api', '')}${r.coverFile}` : (r.isABook ? 'https://via.placeholder.com/300x400?text=No+Cover' : 'https://via.placeholder.com/300x400?text=Notes'),
                        pdfUrl: r.bookFile ? `${API_BASE_URL.replace('/api', '')}${r.bookFile}` : '#',
                        // For uploads, we need to check if they are in favorites to set isFavorite correctly
                        // simpler optimization: just pass isFavorite=false for now or cross-check
                        isFavorite: favoritesData.success ? favoritesData.resources.some((f: any) => f.uploadId === r.uploadId) : false
                    })));
                }

                if (favoritesData.success) {
                    setFavorites(favoritesData.resources.map((r: any) => ({
                        ...r,
                        imageUrl: r.coverFile ? `${API_BASE_URL.replace('/api', '')}${r.coverFile}` : (r.isABook ? 'https://via.placeholder.com/300x400?text=No+Cover' : 'https://via.placeholder.com/300x400?text=Notes'),
                        pdfUrl: r.bookFile ? `${API_BASE_URL.replace('/api', '')}${r.bookFile}` : '#',
                        isFavorite: true
                    })));
                }

            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

    if (!user) return null;

    return (
        <PageTransition className="min-h-screen bg-black text-white pt-24 px-6 md:px-12 pb-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <User className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tighter">My <span className="text-blue-500">Profile</span></h1>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition"
                    >
                        Return
                    </button>
                </div>

                {/* Main Grid: Info & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {/* User Details Card */}
                    <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 space-y-8 h-fit">
                        <div className="flex justify-between items-center border-b border-white/5 pb-6">
                            <h3 className="text-xl font-bold">Account Details</h3>
                            <button className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">Edit</button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Name</p>
                                    <p className="text-lg font-medium">{user.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Email</p>
                                    <p className="text-lg font-medium break-all md:break-normal">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-green-500/20 group-hover:text-green-400 transition-colors">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Role</p>
                                    <p className="text-lg font-medium capitalize">{user.role}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <h4 className="text-red-500 font-bold uppercase tracking-wider text-xs mb-4">Danger Zone</h4>
                            <DeleteButton />
                        </div>
                    </div>

                    {/* Stats / Counts - Placeholder or summary */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-8 rounded-3xl bg-linear-to-br from-blue-500/10 to-transparent border border-blue-500/20 flex flex-col justify-center items-center gap-2">
                            <BookOpen className="w-10 h-10 text-blue-400 mb-2" />
                            <h4 className="text-4xl font-bold">{myUploads.length}</h4>
                            <p className="text-blue-200/60 uppercase tracking-widest text-xs font-bold">Total Uploads</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-linear-to-br from-red-500/10 to-transparent border border-red-500/20 flex flex-col justify-center items-center gap-2">
                            <Heart className="w-10 h-10 text-red-400 mb-2" />
                            <h4 className="text-4xl font-bold">{favorites.length}</h4>
                            <p className="text-red-200/60 uppercase tracking-widest text-xs font-bold">Favorites Saved</p>
                        </div>
                    </div>
                </div>

                {/* Activity Tabs */}
                <div className="mb-8 flex items-center gap-6 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('uploads')}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'uploads' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        My Uploads
                        {activeTab === 'uploads' && <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'favorites' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        Favorites
                        {activeTab === 'favorites' && <span className="absolute bottom-0 left-0 w-full h-1 bg-red-500 rounded-t-full" />}
                    </button>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="min-h-[300px]">
                        {activeTab === 'uploads' && (
                            myUploads.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {myUploads.map((item) => (
                                        item.isABook ?
                                            <BookCard key={item.id} book={item} /> :
                                            <NoteCard key={item.id} note={{ ...item, type: item.documentType, downloads: 0 }} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-[#0a0a0a] rounded-3xl border border-white/5 border-dashed">
                                    <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                                    <p>You haven't uploaded any resources yet.</p>
                                    <button onClick={() => navigate('/upload')} className="mt-4 text-blue-500 font-bold hover:underline">Share a Resource</button>
                                </div>
                            )
                        )}

                        {activeTab === 'favorites' && (
                            favorites.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {favorites.map((item) => (
                                        item.isABook ?
                                            <BookCard key={item.id} book={item} /> :
                                            <NoteCard key={item.id} note={{ ...item, type: item.documentType, downloads: 0 }} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-[#0a0a0a] rounded-3xl border border-white/5 border-dashed">
                                    <Heart className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No favorites saved yet.</p>
                                    <button onClick={() => navigate('/books')} className="mt-4 text-red-500 font-bold hover:underline">Explore Books</button>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </PageTransition>
    );
};


const DeleteButton = () => {
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete your account? This cannot be undone!")) {
            setIsDeleting(true);
            try {
                const { deleteAccount, logout } = await import('../../services/authService');
                const { toast } = await import('react-toastify');

                const result = await deleteAccount();

                if (result.success) {
                    toast.success("Your account has been deleted successfully.");
                    logout();
                    setTimeout(() => navigate('/signup'), 1500);
                } else {
                    toast.error(result.message || "Failed to delete account.");
                    setIsDeleting(false);
                }
            } catch (error) {
                const { toast } = await import('react-toastify');
                toast.error("Something went wrong. Please try again.");
                setIsDeleting(false);
            }
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold uppercase tracking-widest"
        >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
        </button>
    );
};

export default ProfilePage;
