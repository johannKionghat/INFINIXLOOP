"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { InfinixLoopLogo } from "@/components/logo";
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-sm text-gray-400">Chargement...</div>
      </div>
    }>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-[400px] text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6 mx-auto">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight mb-3">
            Lien invalide
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Ce lien de reinitialisation est invalide ou a expire.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-950 text-white hover:bg-gray-800 transition-all no-underline"
          >
            Refaire une demande
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
      } else {
        setDone(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-[400px] text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-6 mx-auto">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight mb-3">
            Mot de passe modifie
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Votre mot de passe a ete mis a jour avec succes. Vous allez etre redirige vers la page de connexion...
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-950 text-white hover:bg-gray-800 transition-all no-underline"
          >
            Se connecter
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
            Nouveau mot de passe
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 text-center">
            Choisissez un nouveau mot de passe pour votre compte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
          {error && (
            <div className="mb-5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

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
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirmer le mot de passe</label>
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
