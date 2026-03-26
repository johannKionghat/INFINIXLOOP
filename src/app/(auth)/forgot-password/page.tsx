"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { InfinixLoopLogo } from "@/components/logo";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "reset" | "done">("email");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
      } else {
        setStep("reset");
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Entrez le code a 6 chiffres");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setStep("done");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-[400px] text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-6 mx-auto">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight mb-3">Mot de passe modifie !</h1>
          <p className="text-sm text-gray-500 mb-8">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-[400px]">
          <div className="flex flex-col items-center mb-10">
            <div className="w-11 h-11 rounded-xl bg-gray-950 flex items-center justify-center mb-5">
              <InfinixLoopLogo size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Nouveau mot de passe</h1>
            <p className="text-sm text-gray-500 mt-1.5 text-center">
              Entrez le code recu a <strong className="text-gray-950">{email}</strong> et choisissez un nouveau mot de passe
            </p>
          </div>

          <form onSubmit={handleReset} className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
            {error && (
              <div className="mb-5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</label>
              <div className="flex justify-center gap-2.5" onPaste={handleCodePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold bg-white border border-gray-200 rounded-xl text-gray-900 outline-none transition-all focus:border-gray-400 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]"
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nouveau mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="--------"
                required
                minLength={6}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-gray-300 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] placeholder:text-gray-400"
              />
            </div>

            <div className="flex flex-col gap-2 mb-6">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirmer</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="--------"
                required
                minLength={6}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-gray-300 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] placeholder:text-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gray-950 text-white text-sm font-medium border-none cursor-pointer transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Mise a jour..." : "Mettre a jour le mot de passe"}
            </button>

            <p className="mt-5 text-center text-xs text-gray-400">
              Verifiez aussi vos spams. Le code expire dans 15 minutes.
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-11 h-11 rounded-xl bg-gray-950 flex items-center justify-center mb-5">
            <InfinixLoopLogo size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Mot de passe oublie</h1>
          <p className="text-sm text-gray-500 mt-1.5 text-center">
            Entrez votre email pour recevoir un code de reinitialisation
          </p>
        </div>

        <form onSubmit={handleSendCode} className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
          {error && (
            <div className="mb-5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 mb-6">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jean@startup.io"
              required
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-gray-300 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gray-950 text-white text-sm font-medium border-none cursor-pointer transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Envoi en cours..." : "Envoyer le code"}
          </button>

          <div className="mt-5 text-center text-sm text-gray-500">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-gray-950 font-medium hover:underline no-underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour a la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
