import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/AuthForms";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect("/account");
  return (
    <div className="container-x flex justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-navy-900">Welcome back</h1>
        <p className="mb-6 text-sm text-slate-500">Sign in to see your points, cashback and orders.</p>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
