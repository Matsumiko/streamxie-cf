import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeSlash, LockKey, Envelope, User } from "@phosphor-icons/react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { useAuth } from "@/hooks/use-auth";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export const RegisterPage = () => {
  useDocumentMeta("Create Account | streamXie", "Create your streamXie account and start streaming.");
  const { register, isPending } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      await register({ name, email, password });
      navigate("/");
    } catch {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
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
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link to="/" className="text-foreground transition-colors hover:text-primary">
            <BrandLogo size="md" />
          </Link>
          <p className="text-sm text-muted-foreground">Start streaming in seconds.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
          <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight text-foreground">Create Account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Full name</label>
              <div className="relative">
                <User size={16} weight="duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aster View"
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="block text-sm font-medium text-muted-foreground">Email address</label>
              <div className="relative">
                <Envelope size={16} weight="duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password" className="block text-sm font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <LockKey size={16} weight="duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
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

            {/* Konfirmasi kata sandi */}
            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-muted-foreground">Confirm password</label>
              <div className="relative">
                <LockKey size={16} weight="duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-700/40 bg-red-950/40 px-4 py-2.5 text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full rounded-lg bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed cinematic-glow"
            >
              {isPending ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
