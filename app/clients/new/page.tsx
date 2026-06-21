import { ClientForm } from "@/components/client-form";
import { PageHeader } from "@/components/page-header";

export default function NewClientPage() {
  return (
    <div>
      <PageHeader title="新增客户" description="先把客户资料录入系统，后续生成分析、话术、报告都会围绕这份资料展开。" />
      <ClientForm />
    </div>
  );
}
