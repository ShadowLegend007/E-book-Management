import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import BookCard from '../components/books/BookCard';
import BookFilter from '../components/books/BookFilter';
import { Loader2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const API_BASE_URL = 'http://localhost:8000/api';

interface Book {
  id: string;
  uploadId: string;
  title: string;
  author: string;
  category: string;
  imageUrl: string;
  pdfUrl: string;
  isFavorite?: boolean;
}

const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    "Physics",
    "Chemistry",
    "Mathematics",
    "Zoology",
    "Botany",
    "Computer Science",
    "Microbiology"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

        const [booksRes, favRes] = await Promise.all([
          fetch(`${API_BASE_URL}/upload/getBook?type=book`, { headers }),
          token ? fetch(`${API_BASE_URL}/favorites`, { headers }) : Promise.resolve(null)
        ]);

        const booksData = await booksRes.json();
        const favData = favRes ? await favRes.json() : { favorites: [] };

        if (booksData.success && booksData.resources) {
          const mappedBooks = booksData.resources.map((r: any) => ({
            id: r.id,
            uploadId: r.uploadId,
            title: r.title,
            author: r.author,
            category: r.category,
            imageUrl: r.coverFile ? `${API_BASE_URL.replace('/api', '')}${r.coverFile}` : 'https://via.placeholder.com/300x400?text=No+Cover',
            pdfUrl: r.bookFile ? `${API_BASE_URL.replace('/api', '')}${r.bookFile}` : '#',
            isFavorite: favData.favorites?.includes(r.uploadId) || false
          }));
          setBooks(mappedBooks);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter Logic
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        book.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, selectedCategory]);

  return (
    <PageTransition className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-32">
        {/* Header Section */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-4 tracking-tighter">
            Digital <span className="text-blue-500">Library.</span>
          </h1>
          <p className="text-xl text-gray-400 font-light max-w-2xl">
            Access our curated collection of essential engineering and science books. All available in high-quality PDF format.
          </p>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-start md:items-end justify-between">
          <div className="flex-1 w-full md:max-w-3xl">
            <BookFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
            />
          </div>

          <div className="bg-blue-900/20 border border-blue-500/20 px-6 py-2 rounded-xl h-[56px] flex flex-col justify-center min-w-[120px]">
            <p className="text-blue-400 text-[10px] uppercase tracking-widest font-bold text-center">
              {filteredBooks.length} Results
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-400">Loading books...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-[#050505] rounded-3xl border border-red-500/20">
              <p className="text-red-400 text-lg">{error}</p>
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredBooks.map((book) => (
                <div key={book.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20 bg-[#050505] rounded-3xl border border-white/5 border-dashed">
              <p className="text-gray-500 text-lg mb-4">No books found matching your criteria.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="text-blue-500 hover:text-blue-400 font-bold text-xs uppercase tracking-widest transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default BooksPage;