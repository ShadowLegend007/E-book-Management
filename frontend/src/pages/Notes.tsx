import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import NoteCard from '../components/notes/NoteCard';
import NoteFilter from '../components/notes/NoteFilter';
import { Loader2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const API_BASE_URL = 'http://localhost:8000/api';

interface Note {
    id: string;
    uploadId: string;
    title: string;
    author: string;
    category: string;
    imageUrl: string;
    type: string;
    pdfUrl: string;
    downloads?: number;
    rating?: string;
}

const ITEMS_PER_LOAD = 10;

const NotesPage = () => {
    const [allNotes, setAllNotes] = useState<Note[]>([]);
    const [displayedNotes, setDisplayedNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const observerTarget = useRef<HTMLDivElement>(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Fetch notes from API
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/upload/getBook?type=note`);
                const data = await response.json();

                if (data.success && data.resources) {
                    const mappedNotes = data.resources.map((r: any) => ({
                        id: r.id,
                        uploadId: r.uploadId,
                        title: r.title,
                        author: r.author,
                        category: r.category,
                        imageUrl: r.coverFile ? `${API_BASE_URL.replace('/api', '')}${r.coverFile}` : 'https://via.placeholder.com/300x400?text=Notes',
                        pdfUrl: r.bookFile ? `${API_BASE_URL.replace('/api', '')}${r.bookFile}` : '#',
                        type: r.documentType || 'PDF',
                        downloads: Math.floor(Math.random() * 1000),
                        rating: (Math.random() * 2 + 3).toFixed(1)
                    }));
                    setAllNotes(mappedNotes);
                }
            } catch (err) {
                console.error('Failed to fetch notes:', err);
                setError('Failed to load notes');
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, []);

    // Filter & Sort Logic
    const filteredNotes = useMemo(() => {
        let result = allNotes.filter(note => {
            const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.author.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        result.sort((a, b) => a.title.localeCompare(b.title));
        return result;
    }, [allNotes, searchQuery, selectedCategory]);

    // Reset displayed notes when filters change
    useEffect(() => {
        setDisplayedNotes(filteredNotes.slice(0, ITEMS_PER_LOAD));
        setHasMore(filteredNotes.length > ITEMS_PER_LOAD);
    }, [filteredNotes]);

    // Load more function
    const loadMore = useCallback(() => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        setTimeout(() => {
            const currentLength = displayedNotes.length;
            const nextNotes = filteredNotes.slice(currentLength, currentLength + ITEMS_PER_LOAD);
            setDisplayedNotes(prev => [...prev, ...nextNotes]);
            setHasMore(currentLength + nextNotes.length < filteredNotes.length);
            setLoadingMore(false);
        }, 500);
    }, [loadingMore, hasMore, displayedNotes.length, filteredNotes]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loadingMore, loadMore]);

    return (
        <PageTransition className="min-h-screen bg-black text-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-32">

                {/* Header Section */}
                <div className="mb-16">
                    <h1 className="text-5xl font-bold mb-4 tracking-tighter">
                        Study <span className="text-blue-500">Notes.</span>
                    </h1>
                    <p className="text-xl text-gray-400 font-light max-w-2xl">
                        Access comprehensive study notes shared by students. Filter by subject, search for specific topics, and accelerate your learning.
                    </p>
                </div>

                {/* Controls Section */}
                <div className="flex flex-col md:flex-row gap-6 mb-12 items-start md:items-end justify-between">

                    <div className="flex-1 w-full md:max-w-2xl">
                        <NoteFilter
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="bg-blue-900/20 border border-blue-500/20 px-6 py-2 rounded-xl h-full flex flex-col justify-center min-h-[46px]">
                            <p className="text-blue-400 text-[10px] uppercase tracking-widest font-bold text-center">
                                {filteredNotes.length} Notes
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <span className="ml-3 text-gray-400">Loading notes...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-[#050505] rounded-3xl border border-red-500/20">
                            <p className="text-red-400 text-lg">{error}</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                {displayedNotes.map((note) => (
                                    <NoteCard key={note.id} note={note} />
                                ))}
                            </div>

                            {/* Empty State */}
                            {displayedNotes.length === 0 && (
                                <div className="text-center py-20 bg-[#0a0a0a] rounded-3xl border border-white/5 border-dashed">
                                    <p className="text-gray-500 text-lg">No notes found matching your criteria.</p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                        className="mt-4 text-blue-500 hover:text-blue-400 font-bold text-sm uppercase tracking-wide"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}

                            {/* Infinite Scroll Trigger */}
                            {hasMore && displayedNotes.length > 0 && (
                                <div ref={observerTarget} className="mt-12 flex items-center justify-center py-8">
                                    {loadingMore && (
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span className="text-sm font-medium">Loading more notes...</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default NotesPage;
