"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Flame,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import EmberEyeArtwork from "@/components/EmberEyeArtwork";

export default function RedesignedLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 600);
      } else {
        setError(json.error || "Invalid security credentials or account locked.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDFAF4] text-[#2A1810] select-none">
      {/* Left Half: Chocolate-900 with grain and Halftone Ember Eye */}
      <div className="md:w-1/2 bg-[#2A1810] text-[#FDFAF4] p-10 md:p-16 flex flex-col justify-between border-r border-[#3B2418] relative overflow-hidden">
        {/* Top Logo */}
        <Link href="/" className="flex items-center gap-3 z-10">
          <div className="w-9 h-9 rounded-xl bg-[#CC5500] text-white flex items-center justify-center shadow-lg">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif font-bold text-xl text-[#FDFAF4] tracking-tight">
              EmberWatch
            </span>
            <span className="block text-[10px] font-mono text-[#D9C3A5]">
              ADMIN SECURITY CONSOLE
            </span>
          </div>
        </Link>

        {/* Center Artwork & Stat Quote */}
        <div className="my-auto py-12 flex flex-col items-center text-center space-y-6 z-10">
          <EmberEyeArtwork size={320} interactive={true} />

          <blockquote className="font-display text-2xl md:text-3xl text-[#FDFAF4] leading-snug max-w-md">
            &ldquo;Mean time to detect fell{" "}
            <span className="italic text-[#CC5500]">63%</span> after continuous watchlist correlation.&rdquo;
          </blockquote>

          <p className="text-xs font-mono text-[#D9C3A5]">
            DEFENSIVE INTELLIGENCE SYSTEM • GROUNDED WITH REAL TIME TELEMETRY
          </p>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#7A5C48] z-10 border-t border-[#3B2418] pt-4">
          <span>ZERO FABRICATED DATA</span>
          <span>ROLE-BASED ACCESS CONTROL</span>
        </div>
      </div>

      {/* Right Half: Cream Form Card */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md space-y-6 bg-white p-8 md:p-10 rounded-3xl border border-[#EBDDC6] warm-shadow-lg">
          <div>
            <div className="eyebrow text-[#CC5500] mb-1">SECURE CONSOLE</div>
            <h2 className="text-3xl font-display font-bold text-[#2A1810]">
              Sign in to <span className="italic font-normal text-[#CC5500]">EmberWatch.</span>
            </h2>
            <p className="text-xs text-[#7A5C48] mt-1 font-sans">
              Enter your enterprise security credentials to access the intelligence console.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#F6DDD6] border border-[#E2B7AE] text-xs font-medium text-[#A8321C] animate-shake">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-[#E3ECDD] border border-[#B5CCA9] text-xs font-medium text-[#6B8F5E] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Authenticated! Launching command dashboard...
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#4E3324] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A5C48]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@organization.com"
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#EBDDC6] bg-[#FDFAF4] text-[#2A1810] focus:outline-none focus:ring-2 focus:ring-[#CC5500]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4E3324] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A5C48]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-[#EBDDC6] bg-[#FDFAF4] text-[#2A1810] focus:outline-none focus:ring-2 focus:ring-[#CC5500]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A5C48] hover:text-[#2A1810]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#7A5C48]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded accent-[#CC5500]" />
                <span>Keep session active</span>
              </label>
              <span className="text-[#CC5500] hover:underline cursor-pointer">Forgot password?</span>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#CC5500] text-white hover:bg-[#B04A00] transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Authenticating..."
              ) : success ? (
                "Verified"
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Enter Command Center
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs text-[#7A5C48] hover:text-[#CC5500] transition-colors"
            >
              ← Back to public homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
