import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "@/components/settings-form";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const setting = await db.userSetting.findFirst({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <PageHeader title="设置" description="配置 OpenAI-compatible API，可切换 DeepSeek / 通义千问 / Kimi / 智谱等兼容接口。" />
      <SettingsForm setting={JSON.parse(JSON.stringify(setting || {}))} />
    </div>
  );
}
