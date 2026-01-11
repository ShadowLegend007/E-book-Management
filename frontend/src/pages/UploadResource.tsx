import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { Upload, BookOpen, FileText, X, CheckCircle } from 'lucide-react';
import axios from 'axios';

const UploadResource = () => {
    const navigate = useNavigate();
    const [resourceType, setResourceType] = useState<'book' | 'note'>('book');
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        category: '',
        language: 'English',
        year: new Date().getFullYear().toString(),
        pages: '',
        file: null as File | null,
        coverImage: null as File | null,
        documentType: 'PDF', // For notes
    });

    const categories = [
        'Computer Science',
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'History',
        'Literature',
        'Psychology',
        'Business',
        'Engineering',
        'Medicine',
        'Law',
        'Arts',
        'Other'
    ];

    const documentTypes = ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'TXT'];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'file' | 'coverImage') => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, [fileType]: file }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.title || !formData.author || !formData.category || !formData.file || !formData.description) {
            toast.error('Please fill in all required fields and upload a file');
            return;
        }

        // Size validation (10MB)
        if (formData.file.size > 10 * 1024 * 1024) {
            toast.error('File size exceeds 10MB limit');
            return;
        }

        setUploading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('author', formData.author);
            data.append('category', formData.category);
            data.append('description', formData.description || '');
            data.append('language', formData.language);
            data.append('year', formData.year);
            data.append('pages', formData.pages || '');
            data.append('documentType', formData.documentType || '');
            data.append('isABook', String(resourceType === 'book'));
            data.append('file', formData.file);

            if (formData.coverImage) {
                data.append('coverImage', formData.coverImage);
            }

            const token = localStorage.getItem('authToken');

            const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/upload/upload';

            await axios.post(API_URL, data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setUploading(false);
            setUploadSuccess(true);
            toast.success("Resource uploaded successfully! Available for download immediately.");

            // Reset form after 2 seconds and redirect
            setTimeout(() => {
                setUploadSuccess(false);
                setFormData({
                    title: '',
                    author: '',
                    description: '',
                    category: '',
                    language: 'English',
                    year: new Date().getFullYear().toString(),
                    pages: '',
                    file: null,
                    coverImage: null,
                    documentType: 'PDF',
                });
                navigate(resourceType === 'book' ? '/books' : '/notes');
            }, 2000);

        } catch (error: any) {
            console.error(error);
            setUploading(false);
            const msg = error.response?.data?.message || "Upload failed. Please try again.";
            toast.error(msg);
        }
    };

    return (
        <PageTransition className="min-h-screen bg-black text-white">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-32">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold mb-4 tracking-tighter">
                        Upload <span className="text-blue-500">Resource.</span>
                    </h1>
                    <p className="text-xl text-gray-400 font-light">
                        Share your knowledge with the community. Upload books or study notes to help others learn.
                    </p>
                </div>

                {/* Resource Type Selector */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setResourceType('book')}
                        className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${resourceType === 'book'
                            ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                            : 'bg-[#0a0a0a] border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                    >
                        <BookOpen className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-wider text-sm">Upload Book</span>
                    </button>
                    <button
                        onClick={() => setResourceType('note')}
                        className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${resourceType === 'note'
                            ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                            : 'bg-[#0a0a0a] border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                    >
                        <FileText className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-wider text-sm">Upload Note</span>
                    </button>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder={`Enter ${resourceType} title`}
                            required
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Author */}
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                            {resourceType === 'book' ? 'Author' : 'Created By'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleInputChange}
                            placeholder={`Enter ${resourceType === 'book' ? 'author' : 'creator'} name`}
                            required
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Provide a brief description of the content"
                            required
                            rows={4}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                        />
                    </div>

                    {/* Category and Document Type (for notes) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {resourceType === 'note' && (
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                                    Document Type
                                </label>
                                <select
                                    name="documentType"
                                    value={formData.documentType}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                >
                                    {documentTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Language, Year, Pages */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                                Language
                            </label>
                            <input
                                type="text"
                                name="language"
                                value={formData.language}
                                onChange={handleInputChange}
                                placeholder="e.g., English"
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                                Year
                            </label>
                            <input
                                type="text"
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                placeholder="2024"
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                                Pages
                            </label>
                            <input
                                type="number"
                                name="pages"
                                value={formData.pages}
                                onChange={handleInputChange}
                                placeholder="e.g., 250"
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                            {resourceType === 'book' ? 'Book' : 'Note'} File <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                                onChange={(e) => handleFileChange(e, 'file')}
                                className="hidden"
                                id="file-upload"
                                required
                            />
                            <label
                                htmlFor="file-upload"
                                className="flex items-center justify-center gap-3 w-full bg-[#0a0a0a] border-2 border-dashed border-white/10 rounded-xl px-4 py-8 cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all"
                            >
                                <Upload className="w-6 h-6 text-gray-400" />
                                <span className="text-gray-400">
                                    {formData.file ? formData.file.name : 'Click to upload file (PDF, DOC, PPT, etc.)'}
                                </span>
                            </label>
                            {formData.file && (
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                                    className="absolute top-2 right-2 p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Cover Image Upload */}
                    <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                            Cover Image (Optional)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'coverImage')}
                                className="hidden"
                                id="cover-upload"
                            />
                            <label
                                htmlFor="cover-upload"
                                className="flex items-center justify-center gap-3 w-full bg-[#0a0a0a] border-2 border-dashed border-white/10 rounded-xl px-4 py-8 cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all"
                            >
                                <Upload className="w-6 h-6 text-gray-400" />
                                <span className="text-gray-400">
                                    {formData.coverImage ? formData.coverImage.name : 'Click to upload cover image (JPG, PNG, etc.)'}
                                </span>
                            </label>
                            {formData.coverImage && (
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, coverImage: null }))}
                                    className="absolute top-2 right-2 p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 py-4 bg-[#0a0a0a] border border-white/10 text-white rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Upload {resourceType === 'book' ? 'Book' : 'Note'}
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Success Message */}
                {uploadSuccess && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-[#0a0a0a] border border-green-500/20 rounded-2xl p-8 max-w-md mx-4 text-center">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-2">Upload Successful!</h3>
                            <p className="text-gray-400">
                                Your {resourceType} has been uploaded successfully. Redirecting...
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default UploadResource;
