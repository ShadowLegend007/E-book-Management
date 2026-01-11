import { ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from 'react-toastify';
import PageTransition from "../../components/PageTransition";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

    const handleSendOtp = async () => {
        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                setIsOtpSent(true);
                toast.success(`OTP sent to ${email}`);
            } else {
                toast.error(data.message || "Failed to send OTP");
                if (data.redirect) {
                    toast.info("Redirecting to signup page...");
                    setTimeout(() => navigate(data.redirect), 3000);
                }
            }
        } catch (error) {
            toast.error("Failed to connect to server");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!otp) {
            toast.error("Please enter the OTP.");
            return;
        }
        if (otp.length !== 4) {
            toast.error("Please enter a valid 4-digit OTP.");
            return;
        }
        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, password: newPassword })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Password reset successfully! Redirecting to login...");
                setTimeout(() => navigate('/login'), 2000);
            } else {
                toast.error(data.message || "Failed to reset password");
            }
        } catch (error) {
            toast.error("Failed to connect to server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageTransition className="w-full h-screen flex bg-black text-white selection:bg-blue-500/30 selection:text-blue-200">

            {/* LEFT IMAGE SECTION */}
            <div className="relative w-1/2 h-full hidden md:flex overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <img
                    src="https://i.pinimg.com/736x/b6/45/7a/b6457a4f6c939f2f624a5ea4afbfe4c9.jpg"
                    alt="education"
                    className="w-full h-full object-cover transition-transform duration-1000 md:hover:scale-105"
                />
                {/* Gradient Blend */}
                <div className="absolute inset-0 bg-linear-to-r from-black via-black/50 to-transparent z-20" />
                <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-blue-600/30 to-transparent blur-3xl z-30 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-1 bg-linear-to-b from-transparent via-blue-500/50 to-transparent z-40" />

                {/* Floating Quote */}
                <div className="absolute bottom-12 left-12 max-w-lg z-30">
                    <div className="w-12 h-1 bg-blue-500 mb-6" />
                    <p className="text-3xl font-light italic text-gray-200 leading-relaxed">
                        "Failure is simply the opportunity to begin again, this time more intelligently."
                    </p>
                    <p className="mt-4 text-gray-400 font-mono text-sm uppercase tracking-widest">— Henry Ford</p>
                </div>
            </div>

            {/* RIGHT FORM SECTION */}
            <div className="w-full md:w-1/2 h-full flex flex-col px-6 sm:px-12 lg:px-20 py-12 relative overflow-y-auto">

                {/* Background Ambience */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

                {/* HEADER */}
                <div className="flex items-center justify-between mb-24 relative z-10 px-1">
                    <div
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 group cursor-pointer"
                    >
                        <span className="font-bold text-lg tracking-[0.2em] text-white/90 uppercase">
                            EDU<span className="text-blue-500">HUB</span>
                        </span>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </button>
                </div>

                {/* MAIN FORM CONTENT */}
                <div className="max-w-md w-full my-auto mx-auto relative z-10">
                    <div className="mb-10">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tighter">
                            Forgot <br />
                            <span className="text-blue-500">password?</span>
                        </h2>
                        <p className="text-gray-400 text-lg font-light">
                            {isOtpSent
                                ? "Enter the OTP sent to your email and set a new password."
                                : "Don't worry, we'll send you reset instructions."}
                        </p>
                    </div>

                    {/* INPUTS */}
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        {/* Email Field with Send OTP Button */}
                        <div className="group relative">
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 ml-4">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="student@university.edu"
                                    className="w-full bg-[#050505] text-white border border-gray-800 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-gray-900/50 transition-all placeholder:text-gray-700 font-light pr-24"
                                    disabled={isOtpSent}
                                />
                                {!isOtpSent && (
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={isLoading}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Sending...' : 'Send OTP'}
                                    </button>
                                )}
                                {isOtpSent && (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-xs font-bold uppercase tracking-wider">
                                        Sent
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* OTP and Password Fields */}
                        {isOtpSent && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                                {/* OTP Input */}
                                <div className="group relative">
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 ml-4">OTP Code</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={4}
                                        placeholder="Enter 4-digit OTP"
                                        className="w-full bg-[#050505] text-white border border-gray-800 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-gray-900/50 transition-all placeholder:text-gray-700 font-light tracking-widest"
                                    />
                                </div>

                                {/* New Password */}
                                <div className="group relative">
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 ml-4">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="w-full bg-[#050505] text-white border border-gray-800 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-gray-900/50 transition-all placeholder:text-gray-700 font-light"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="group relative">
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 ml-4">Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="w-full bg-[#050505] text-white border border-gray-800 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-gray-900/50 transition-all placeholder:text-gray-700 font-light"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BUTTON WITH GEMINI BORDER */}
                        <div className="relative group mt-8">
                            <div className="absolute -inset-1 bg-linear-to-r from-cyan-400 to-fuchsia-500 rounded-2xl opacity-25 blur transition duration-500 group-hover:opacity-100 group-hover:duration-200" />
                            <button
                                onClick={isOtpSent ? handleSubmit : handleSendOtp}
                                disabled={isLoading}
                                className="relative w-full bg-black text-white py-4 rounded-xl font-semibold uppercase tracking-widest text-sm flex items-center justify-center gap-2 leading-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Processing...' : (isOtpSent ? "Set New Password" : "Send OTP")} {!isLoading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </form>

                    {/* FOOTER */}
                    <p className="text-gray-500 mt-8 text-center font-light">
                        Remember your password?{" "}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-white font-medium hover:text-blue-400 transition-all underline underline-offset-4 decoration-blue-500/30"
                        >
                            Log in
                        </button>
                    </p>
                </div>
            </div>
        </PageTransition>
    );
};

export default ForgotPassword;
