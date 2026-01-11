import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login, setToken, setUser } from "../../services/authService";
import PageTransition from "../../components/PageTransition";

const LoadingPage = () => {
  return (
    <div className="fixed inset-0 h-screen w-screen bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />

        <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-25 blur-2xl animate-pulse" />
      </div>

      <p className="absolute bottom-24 text-gray-300 tracking-widest text-sm animate-pulse">
        Loading • Please Wait
      </p>
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await login({ email, password });

      if (response.success && response.token) {
        setToken(response.token);
        if (response.user) {
          setUser(response.user);
        }
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection." + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isLoading && <LoadingPage />}
      <PageTransition className="w-full h-screen flex bg-black text-white selection:bg-blue-500/30 selection:text-blue-200">
        {/* LEFT IMAGE SECTION */}
        <div className="relative w-1/2 h-full hidden md:flex overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src="https://i.pinimg.com/736x/b6/45/7a/b6457a4f6c939f2f624a5ea4afbfe4c9.jpg"
            alt="education"
            className="w-full h-full object-cover transition-transform duration-1000 md:hover:scale-105"
          />
          {/* Gradient Blend - No Glow Effect as requested */}
          <div className="absolute inset-0 bg-linear-to-r from-black via-black/50 to-transparent z-20" />
          <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-blue-600/30 to-transparent blur-3xl z-30 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-1 bg-linear-to-b from-transparent via-blue-500/50 to-transparent z-40" />

          {/* Floating Quote */}
          <div className="absolute bottom-12 left-12 max-w-lg z-30">
            <div className="w-12 h-1 bg-blue-500 mb-6" />
            <p className="text-3xl font-light italic text-gray-200 leading-relaxed">
              "The roots of education are bitter, but the fruit is sweet."
            </p>
            <p className="mt-4 text-gray-400 font-mono text-sm uppercase tracking-widest">
              — Aristotle
            </p>
          </div>
        </div>

        {/* RIGHT FORM SECTION */}
        <div className="w-full md:w-1/2 h-full flex flex-col px-6 sm:px-12 lg:px-20 py-12 relative overflow-y-auto">
          {/* Background Ambience */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

          {/* HEADER */}
          <div className="flex items-center justify-between mb-24 relative z-10 px-1">
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <span className="font-bold text-lg tracking-[0.2em] text-white/90 uppercase">
                EDU<span className="text-blue-500">HUB</span>
              </span>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
          </div>

          {/* MAIN FORM CONTENT */}
          <div className="max-w-md w-full my-auto mx-auto relative z-10">
            <div className="mb-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tighter">
                Welcome <br />
                <span className="text-blue-500">back.</span>
              </h2>
              <p className="text-gray-400 text-lg font-light">
                Sign in to continue your journey.
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                {success}
              </div>
            )}

            {/* INPUTS */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="group relative">
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 ml-4">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    required
                    disabled={isLoading}
                    className="w-full bg-[#050505] text-white border border-gray-800 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-gray-900/50 transition-all placeholder:text-gray-700 font-light"
                  />
                </div>
              </div>

              <div className="group relative">
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 ml-4">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#050505] text-white border border-gray-800 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-gray-900/50 transition-all placeholder:text-gray-700 font-light"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* BUTTON WITH GEMINI BORDER */}
              <div className="relative group mt-8">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-2xl opacity-25 blur transition duration-500 group-hover:opacity-100 group-hover:duration-200" />
                <button className="relative w-full bg-black text-white py-4 rounded-xl font-semibold uppercase tracking-widest text-sm flex items-center justify-center gap-2 leading-none">
                  Sign In <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* FOOTER */}
            <p className="text-gray-500 mt-8 text-center font-light">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-white font-medium hover:text-blue-400 transition-all underline underline-offset-4 decoration-blue-500/30"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default LoginPage;
