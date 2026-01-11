import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import { Mail, Send, MessageCircle, Users } from 'lucide-react';

const Community = () => {
  return (
    <PageTransition className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-32">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold tracking-tighter mb-6">
            Our <span className="text-blue-500">Community.</span>
          </h1>
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
            Connect with us through official community channels. More features
            are coming soon.
          </p>
        </div>

        {/* Community Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Email */}
          <a
            href="mailto:rudranaryan2005@gmail.com"
            className="group p-8 bg-[#050505] border border-white/5 rounded-3xl hover:border-blue-500/30 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Mail className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
              Email
            </h3>
            <p className="text-sm text-gray-500">
              rudranaryan2005@gmail.com
            </p>
          </a>

          {/* Telegram */}
          <div className="p-8 bg-[#050505] border border-white/5 rounded-3xl opacity-50 cursor-not-allowed">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <Send className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              Telegram Community
            </h3>
            <p className="text-sm text-gray-600">Not created yet</p>
          </div>

          {/* Discord */}
          <div className="p-8 bg-[#050505] border border-white/5 rounded-3xl opacity-50 cursor-not-allowed">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <MessageCircle className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              Discord Server
            </h3>
            <p className="text-sm text-gray-600">Not created yet</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-24 text-center text-gray-600 text-sm font-light">
          <Users className="w-5 h-5 mx-auto mb-3" />
          Building a respectful academic community — step by step.
        </div>
      </main>
    </PageTransition>
  );
};

export default Community;
