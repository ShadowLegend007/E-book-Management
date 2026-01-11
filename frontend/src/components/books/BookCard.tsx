
import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookProps {
  id: string;
  uploadId: string;
  title: string;
  author: string;
  category: string;
  imageUrl: string;
  pdfUrl: string;
  isFavorite?: boolean;
}

const BookCard = ({ book }: { book: BookProps }) => {
  const navigate = useNavigate();
  const [favorite, setFavorite] = useState(book.isFavorite || false);
  const [loadingFav, setLoadingFav] = useState(false);

  const handleClick = () => {
    navigate(`/books/${book.uploadId}`);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Redirect to login or show toast
      navigate('/login');
      return;
    }

    try {
      setLoadingFav(true);
      // Optimistic update
      setFavorite(!favorite);

      await fetch(`http://localhost:8000/api/favorites/${book.uploadId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Failed to toggle favorite", error);
      setFavorite(!favorite); // Revert
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
    >

      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={book.imageUrl || 'https://via.placeholder.com/300x400?text=No+Cover'}
          alt={book.title}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/300x400?text=No+Cover';
          }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Category Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[9px] uppercase tracking-widest font-bold text-white/80">
          {book.category}
        </div>

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur-md text-white/70 hover:bg-white hover:text-red-500 hover:scale-110 transition-all duration-300 z-10"
        >
          {loadingFav ? <Loader2 className="w-4 h-4 animate-spin" /> :
            <Heart className={`w-4 h-4 ${favorite ? 'fill-red-500 text-red-500' : ''}`} />
          }
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-white font-bold text-sm mb-1 truncate leading-tight group-hover:text-blue-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-gray-400 text-[10px] uppercase tracking-wider font-medium truncate">
          by {book.author}
        </p>
      </div>
    </div>
  );
};

export default BookCard;
