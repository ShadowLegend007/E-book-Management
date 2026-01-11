import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import PDFPreviewModal from '../../components/PDFPreviewModal';
import { FileText, Heart, Share2, ArrowLeft, Loader2, Lock } from 'lucide-react';
import PageTransition from '../../components/PageTransition';

const API_BASE_URL = 'http://localhost:8000/api';

const NoteDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

                const [noteRes, favRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/upload/${id}`),
                    token ? fetch(`${API_BASE_URL}/favorites`, { headers }) : Promise.resolve(null)
                ]);

                const noteData = await noteRes.json();
                const favData = favRes ? await favRes.json() : { favorites: [] };

                if (noteData.success) {
                    setNote(noteData.resource);
                    if (favData.success) {
                        setIsFavorite(favData.favorites.includes(noteData.resource.uploadId));
                    }
                } else {
                    setError('Note not found');
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
                setError('Failed to load note details');
            } finally {
                setLoading(false);
            }
        };

        const token = localStorage.getItem('authToken');
        setIsLoggedIn(!!token);

        if (id) fetchData();
    }, [id]);

    const toggleFavorite = async () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/favorites/${note.uploadId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setIsFavorite(data.isFavorite);
            }
        } catch (error) {
            console.error("Failed to toggle favorite", error);
        }
    };

    const handleReadNow = () => {
        if (!note.bookFile) {
            alert("No file available for this note.");
            return;
        }

        if (isLoggedIn) {
            // Full access: Open PDF in new tab
            const fullUrl = `${API_BASE_URL.replace('/api', '')}${note.bookFile}`;
            window.open(fullUrl, '_blank', 'noopener,noreferrer');
        } else {
            // Guest access: Preview
            setShowPreview(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                </div>
            </div>
        );
    }

    if (error || !note) {
        return (
            <PageTransition className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)] space-y-4">
                    <h2 className="text-2xl font-bold text-red-500">{error || "Note not found"}</h2>
                    <button onClick={() => navigate('/notes')} className="px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        Back to Library
                    </button>
                </div>
            </PageTransition>
        );
    }

    // Construct full URLs
    const noteCover = note.coverFile ? `${API_BASE_URL.replace('/api', '')}${note.coverFile}` : 'https://via.placeholder.com/300x400?text=Notes';
    const notePdf = note.bookFile ? `${API_BASE_URL.replace('/api', '')}${note.bookFile}` : '';

    return (
        <PageTransition className="min-h-screen bg-black text-white">
            <Navbar />

            {showPreview && notePdf && (
                <PDFPreviewModal
                    fileUrl={notePdf}
                    title={note.title}
                    onClose={() => setShowPreview(false)}
                    maxPages={10}
                />
            )}

            <div className="relative pt-32 pb-20 px-6 max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/notes')}
                    className="absolute top-24 left-6 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Notes
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Left: Note Cover & Actions */}
                    <div className="space-y-6">
                        <div className="aspect-[2/3] w-full relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-white/5">
                            <img
                                src={noteCover}
                                alt={note.title}
                                className="w-full h-full object-cover"
                            />
                            {/* Type Badge Overlay */}
                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-full text-xs uppercase tracking-widest font-bold text-blue-400">
                                {note.documentType || 'PDF'}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleReadNow}
                                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${isLoggedIn ? 'bg-white text-black hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                            >
                                <FileText className="w-4 h-4" /> {isLoggedIn ? "Read Now" : "Preview (10 Pages)"}
                            </button>

                            {!isLoggedIn && (
                                <p className="text-xs text-center text-gray-500">
                                    <Lock className="w-3 h-3 inline mr-1" /> Login to read full note
                                </p>
                            )}

                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={toggleFavorite}
                                    className={`py-3 border text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2 ${isFavorite ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-[#111] border-white/10'}`}
                                >
                                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} /> {isFavorite ? 'Saved' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest">
                                    {note.category}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{note.title}</h1>
                            <p className="text-xl text-gray-400 font-light">by <span className="text-white">{note.author}</span></p>
                        </div>

                        <div className="h-px w-full bg-white/5" />

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Description</h3>
                            <p className="text-gray-300 leading-relaxed text-lg font-light">
                                {note.description || "No description available."}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                            <div className="p-4 bg-[#111] rounded-2xl border border-white/5">
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Format</p>
                                <p className="font-bold">{note.documentType || 'PDF'}</p>
                            </div>
                            <div className="p-4 bg-[#111] rounded-2xl border border-white/5">
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Year</p>
                                <p className="font-bold">{note.year || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-[#111] rounded-2xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors group">
                                <div className="flex items-center justify-center h-full text-gray-500 group-hover:text-white">
                                    <Share2 className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default NoteDetailsPage;
