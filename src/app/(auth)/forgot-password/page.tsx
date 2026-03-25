"use client";

import { useState } from "react";
import Link from "next/link";
import { InfinixLoopLogo } from "@/components/logo";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await resetPassword(email);
      if (result.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-[400px] text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 mx-auto">
            <Mail className="w-7 h-7 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight mb-3">
            Email envoye
          </h1>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Un lien de reinitialisation a ete envoye a{" "}
            <strong className="text-gray-950">{email}</strong>.
            Verifiez votre boite de reception et cliquez sur le lien pour
            choisir un nouveau mot de passe.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-950 text-white hover:bg-gray-800 transition-all no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour a la connexion
          </Link>
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
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight">
            Mot de passe oublie
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 text-center">
            Entrez votre email et nous vous enverrons un lien pour reinitialiser votre mot de passe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
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
            {loading ? "Envoi en cours..." : "Envoyer le lien"}
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
