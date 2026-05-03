import { useState } from "react";
import { Link } from "react-router-dom";
import { Envelope, CheckCircle } from "@phosphor-icons/react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { requestPasswordResetLink } from "@/lib/account-api";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export const ForgotPasswordPage = () => {
  useDocumentMeta("Forgot Password | streamXie", "Reset your streamXie password.");
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mapRecoveryError = (message: string) => {
    if (/method or path not allowed/i.test(message)) {
      return "Fitur pemulihan akun belum tersedia saat ini. Coba lagi nanti.";
    }
    return message || "Permintaan gagal diproses. Coba lagi.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);
    if (!email.trim()) return;

    setLoading(true);
    try {
      await requestPasswordResetLink({ email: email.trim() });
      setSubmittedEmail(email.trim());
      setSubmitted(true);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "";
      setError(mapRecoveryError(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link to="/" className="text-foreground transition-colors hover:text-primary">
            <BrandLogo size="md" />
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-950/60 border border-green-700/40">
                <CheckCircle size={28} weight="fill" className="text-green-400" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Check your inbox</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We&#39;ve sent a password reset link to <span className="text-foreground font-medium">{submittedEmail}</span>.
                Check your spam folder if it doesn&#39;t arrive within a few minutes.
              </p>
              <Link
                to="/login"
                className="mt-2 inline-flex items-center rounded-lg bg-gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-foreground">Forgot password?</h1>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Enter your email and we&#39;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="fp-email" className="block text-sm font-medium text-muted-foreground">Email address</label>
                  <div className="relative">
                    <Envelope size={16} weight="duotone" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="fp-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed cinematic-glow"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>

                {error && (
                  <p role="alert" className="rounded-lg border border-red-700/40 bg-red-950/40 px-4 py-2.5 text-xs text-red-400">
                    {error}
                  </p>
                )}
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remembered it?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
