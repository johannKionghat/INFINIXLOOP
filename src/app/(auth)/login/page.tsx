"use client";

import { useState } from "react";
import Link from "next/link";
import { InfinixLoopLogo } from "@/components/logo";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/overview");
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-11 h-11 rounded-xl bg-gray-950 flex items-center justify-center mb-5">
            <InfinixLoopLogo size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight">
            Connexion
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Accedez a votre workspace InfinixLoop
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
          {error && (
            <div className="mb-5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

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
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-gray-300 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gray-950 text-white text-sm font-medium border-none cursor-pointer transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <div className="mt-5 text-center text-sm text-gray-500">
            Pas encore de compte ?{" "}
            <Link href="/signup" className="text-gray-950 font-medium hover:underline no-underline">
              Creer un compte
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
