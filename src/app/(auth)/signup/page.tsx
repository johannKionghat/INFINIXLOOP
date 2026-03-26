"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { InfinixLoopLogo } from "@/components/logo";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "code" | "done">("form");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setStep("code");
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Entrez le code a 6 chiffres");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
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
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-[400px] text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-6 mx-auto">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight mb-3">Compte confirme !</h1>
          <p className="text-sm text-gray-500 mb-8">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  if (step === "code") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-[400px]">
          <div className="flex flex-col items-center mb-10">
            <div className="w-11 h-11 rounded-xl bg-gray-950 flex items-center justify-center mb-5">
              <InfinixLoopLogo size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Verifiez votre email</h1>
            <p className="text-sm text-gray-500 mt-1.5 text-center">
              Un code a 6 chiffres a ete envoye a <strong className="text-gray-950">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerify} className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
            {error && (
              <div className="mb-5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-center gap-2.5 mb-6" onPaste={handleCodePaste}>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gray-950 text-white text-sm font-medium border-none cursor-pointer transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verification..." : "Confirmer"}
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
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-11 h-11 rounded-xl bg-gray-950 flex items-center justify-center mb-5">
            <InfinixLoopLogo size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Creer un compte</h1>
          <p className="text-sm text-gray-500 mt-1.5">Lancez votre business IA en quelques minutes</p>
        </div>

        <form onSubmit={handleSignup} className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
          {error && (
            <div className="mb-5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 mb-5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jean Dupont"
              required
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-gray-300 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-2 mb-5">
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

          <div className="flex flex-col gap-2 mb-6">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mot de passe</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gray-950 text-white text-sm font-medium border-none cursor-pointer transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creation..." : "Creer mon compte"}
          </button>

          <div className="mt-5 text-center text-sm text-gray-500">
            Deja un compte ?{" "}
            <Link href="/login" className="text-gray-950 font-medium hover:underline no-underline">
              Se connecter
            </Link>
          </div>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          En creant un compte, vous acceptez les conditions d&apos;utilisation.
        </p>
      </div>
    </div>
  );
}
