import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, BookOpen, MessageCircle, Home, FileText, User, LogIn, ArrowRight, LogOut, Shield, Mail, Info } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string | number } | null>(null);
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setUserMenuOpen(false);
    setIsOpen(false);
    navigate('/');
    window.location.reload(); // Force refresh to clear state
  };

  const isLoggedIn = !!localStorage.getItem('authToken');

  const navItems = [
    { name: 'Home', icon: <Home className="w-4 h-4" />, href: '/' },
    { name: 'Books', icon: <BookOpen className="w-4 h-4" />, href: '/books' },
    { name: 'Notes', icon: <FileText className="w-4 h-4" />, href: '/notes' },
    { name: 'Community', icon: <MessageCircle className="w-4 h-4" />, href: '/community' },
    { name: 'About', icon: <Info className="w-4 h-4" />, href: '/about' },
  ];

  return (
    <div className={`fixed top-0 w-full z-50 flex justify-center transition-all duration-500 ${scrolled ? 'pt-2' : 'pt-6'}`}>

      <nav className="relative w-[92%] max-w-7xl">

        {/* GEMINI NEON SHIMMER THREAD */}
        <div className="absolute -inset-px rounded-4xl overflow-hidden opacity-80">
          <div className="absolute inset-[-250%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_160deg,#4285f4_180deg,#9b72f3_210deg,#d96570_240deg,transparent_270deg)]" />
        </div>

        {/* INNER GLASS PILL */}
        <div
          className={`
            relative flex flex-col transition-all duration-500 ease-in-out
            bg-[#050505]/95 backdrop-blur-2xl backdrop-saturate-[1.8]
            rounded-4xl
          `}
        >
          <div className="px-8 py-2">
            <div className="flex items-center justify-between h-14">

              {/* LOGO */}
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
                </div>
                <span className="font-bold text-lg tracking-[0.2em] text-white/90 uppercase">
                  EDU<span className="text-blue-500">HUB</span>
                  {(user?.role === 'admin' || user?.role === 1 || user?.role === 2) && (
                    <sup className="text-[10px] text-red-500 ml-1 lowercase tracking-normal">admin</sup>
                  )}
                </span>
              </div>

              {/* DESKTOP NAV */}
              <div className="hidden md:flex items-center gap-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="group relative text-[11px] uppercase tracking-[0.15em] font-semibold text-white/40 hover:text-white transition-all duration-300 py-1"
                  >
                    {item.name}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-500 transition-all duration-300 group-hover:w-full" />
                  </Link>
                ))}
              </div>

              {/* ACTIONS AREA */}
              <div className="flex items-center gap-3">

                {/* DESKTOP USER ICON with Dropdown */}
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button
                    onClick={() => {
                      if (isLoggedIn) {
                        setUserMenuOpen(!userMenuOpen);
                      } else {
                        navigate('/login');
                      }
                    }}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white hover:text-black hover:border-white transition-all duration-300 active:scale-90 group/user relative"
                  >
                    <User className="w-5 h-5" />
                    {isLoggedIn && (
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#050505] rounded-full group-hover/user:border-white transition-colors" />
                    )}
                  </button>

                  {/* USER DROPDOWN MENU */}
                  {userMenuOpen && isLoggedIn && (
                    <div className="absolute right-0 top-14 w-72 bg-[#0a0a0a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info Header */}
                      <div className="p-4 border-b border-gray-800 bg-linear-to-r from-blue-500/10 to-purple-500/10">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {user?.email || ''}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                            {user?.role || 'student'}
                          </span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        {(user?.role === 'admin' || user?.role === 1) && (
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              navigate('/admin');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-purple-400 hover:bg-purple-500/10 rounded-xl transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Panel
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            navigate('/profile');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="md:hidden p-2 text-white/70 hover:bg-white/10 rounded-full transition-colors"
                >
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE DROPDOWN */}
          <div className={`md:hidden overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 space-y-4 border-t border-white/5 bg-black/20">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between group/mob"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-white/60 group-hover/mob:text-blue-400 transition-colors">{item.icon}</span>
                    <span className="tracking-widest uppercase text-[10px] font-bold text-white/40 group-hover/mob:text-white transition-colors">{item.name}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover/mob:opacity-100 -translate-x-2 group-hover/mob:translate-x-0 transition-all text-blue-500" />
                </Link>
              ))}

              {/* MOBILE VIEW - User Section */}
              {isLoggedIn && user ? (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>

                  {(user?.role === 'admin' || user?.role === 1) && (
                    <button
                      onClick={() => { setIsOpen(false); navigate('/admin'); }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-500/20 text-purple-400 text-sm font-semibold"
                    >
                      <Shield className="w-4 h-4" /> Admin Panel
                    </button>
                  )}

                  <button
                    onClick={() => { setIsOpen(false); navigate('/profile'); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500/20 text-blue-400 text-sm font-semibold"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </button>

                  <button
                    onClick={() => { setIsOpen(false); handleLogout(); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm font-semibold"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full mt-4 flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-bold uppercase tracking-tighter text-sm active:scale-95 transition-transform"
                >
                  Get Started <LogIn className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Navbar;