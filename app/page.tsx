import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AuthForm } from "@/components/auth/AuthForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/classes");

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img
            src="/icons/logo.webp"
            alt="Brigade Lakefront"
            className="w-50 h-20 rounded-2xl mx-auto mb-4 object-cover"
          />
          <h1 className="text-2xl font-bold text-gray-900">BLF</h1>
          <p className="text-gray-500 mt-1 text-sm leading-relaxed">
            Find classes happening in our community — dance, music, sports, and more.
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
