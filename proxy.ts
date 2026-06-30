import { NextResponse, type NextRequest } from "next/server";

// 公开访问的路径（H5 端所有页面都公开）
const PUBLIC_PATHS = [
  "/",
  "/assessment",
  "/login",
  "/api/auth/login",
  "/api/assessments",
  "/api/orders",
  "/api/payment",
  "/api/reports",
];

// 判断路径是否公开
function isPublicPath(pathname: string): boolean {
  // 首页
  if (pathname === "/") return true;

  // 测评相关页面
  if (pathname.startsWith("/assessment")) return true;

  // 报告相关页面
  if (pathname.startsWith("/report")) return true;

  // 登录页
  if (pathname.startsWith("/login")) return true;

  // 所有 API 接口都公开（业务 API 自己做鉴权）
  if (pathname.startsWith("/api/")) return true;

  // 静态资源
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|html)$/)) return true;

  return false;
}

export function proxy(request: NextRequest) {
  const appPassword = process.env.APP_PASSWORD;
  // 如果没有配置密码，直接放行
  if (!appPassword) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // 公开路径直接放行
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 检查是否已认证（管理后台用）
  const authed = request.cookies.get("workbench_auth")?.value === appPassword;
  if (authed) return NextResponse.next();

  // 未认证跳转到登录页
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"]
};
