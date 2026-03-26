"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-sm text-gray-400">Chargement...</div>
      </div>
    }>
      <ConfirmEmailInner />
    </Suspense>
  );
}

function ConfirmEmailInner() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const message = searchParams.get("message");

  const isSuccess = status === "success";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[400px] text-center">
        <div className={`w-14 h-14 rounded-2xl ${isSuccess ? "bg-green-50" : "bg-red-50"} flex items-center justify-center mb-6 mx-auto`}>
          {isSuccess ? (
            <CheckCircle className="w-7 h-7 text-green-600" />
          ) : (
            <AlertTriangle className="w-7 h-7 text-red-500" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight mb-3">
          {isSuccess ? "Email confirme !" : "Erreur de confirmation"}
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          {isSuccess
            ? "Votre adresse email a ete confirmee avec succes. Vous pouvez maintenant vous connecter."
            : message || "Une erreur est survenue lors de la confirmation de votre email."}
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-950 text-white hover:bg-gray-800 transition-all no-underline"
        >
          {isSuccess ? "Se connecter" : "Retour a la connexion"}
        </Link>
      </div>
    </div>
  );
}
