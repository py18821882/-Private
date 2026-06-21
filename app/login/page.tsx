import { LoginForm } from "@/components/login-form";

export default function LoginPage({
  searchParams
}: {
  searchParams: { next?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-white p-6 shadow-2xl">
        <div className="mb-6">
          <div className="text-sm font-semibold text-wine">个人智能体工作台</div>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">访问验证</h1>
          <p className="mt-2 text-sm text-slate-500">公网部署启用单密码保护，用于保护客户资料和模型配置。</p>
        </div>
        <LoginForm nextPath={searchParams.next || "/dashboard"} />
      </div>
    </main>
  );
}
