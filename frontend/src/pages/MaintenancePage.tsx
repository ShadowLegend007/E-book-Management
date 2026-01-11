import { Hammer, Cog, ShieldAlert, ArrowLeft } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const MaintenancePage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "System Lockdown | EduHub";
        return () => { document.title = "EduHub"; };
    }, []);

    return (
        <PageTransition className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-blue-500/30">
            {/* Atmospheric Gemini Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

            <div className="max-w-xl w-full text-center space-y-12 relative z-10">
                {/* Animated Icon Cluster */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    <div className="relative flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 mx-auto shadow-2xl">
                        <ShieldAlert className="w-10 h-10 text-blue-500 animate-bounce" />
                    </div>

                    {/* Decorative Orbital Icons */}
                    <div className="absolute -top-4 -right-4 p-3 bg-white/5 border border-white/10 rounded-2xl animate-[spin_10s_linear_infinite]">
                        <Cog className="w-4 h-4 text-blue-400 opacity-40" />
                    </div>
                    <div className="absolute -bottom-2 -left-6 p-3 bg-white/5 border border-white/10 rounded-2xl animate-[spin_8s_linear_infinite_reverse]">
                        <Hammer className="w-4 h-4 text-indigo-400 opacity-40" />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Security Lockdown Active</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-light text-white tracking-tighter leading-none">
                        Structural <span className="font-semibold">Updates</span>
                    </h1>

                    <p className="text-white/40 font-medium text-lg leading-relaxed max-w-md mx-auto">
                        EduHub is currently undergoing scheduled maintenance to enhance core intelligence. We'll be back online shortly.
                    </p>
                </div>

                {/* Action / Return */}
                <div className="pt-8">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-3 mx-auto px-8 py-4 rounded-2xl bg-white text-black font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Check Status
                    </button>
                </div>

                {/* System ID Tag */}
                <div className="pt-12 flex flex-col items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10">Matrix Engine v1.0.4</p>
                    <div className="w-12 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
                </div>
            </div>

            {/* Custom Keyframes for Animations */}
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
        </PageTransition>
    );
};

export default MaintenancePage;
