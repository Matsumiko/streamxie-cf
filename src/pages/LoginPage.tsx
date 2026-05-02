import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeSlash, LockKey, Envelope } from "@phosphor-icons/react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { useAuth } from "@/hooks/use-auth";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export const LoginPage = () => {
  useDocumentMeta("Sign In | streamXie", "Sign in to your streamXie account.");
  const { login, isPending } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      await login({ email, password });
      navigate("/");
    } catch {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Latar belakang gradien */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link to="/" className="text-foreground transition-colors hover:text-primary">
            <BrandLogo size="md" />
          </Link>
          <p className="text-sm text-muted-foreground">Welcome back. Sign in to continue.</p>
        </div>

        {/* Kartu form */}
        <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
          <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight text-foreground">Sign In</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
                Email address
              </label>
              <div className="relative">
                <Envelope size={16} weight="duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>

            {/* Kata sandi */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LockKey size={16} weight="duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Pesan error */}
            {error && (
              <p className="rounded-lg border border-red-700/40 bg-red-950/40 px-4 py-2.5 text-xs text-red-400">
                {error}
              </p>
            )}

            {/* Tombol submit */}
            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full rounded-lg bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed cinematic-glow"
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&#39;t have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
