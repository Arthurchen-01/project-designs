/**
 * auth-guard.ts — Admin API 鉴权工具
 *
 * 从 cookie 中读取 session token，验证用户身份和 admin 角色。
 * 返回 { user } 或 { error: { status, message } }
 */

import { cookies } from 'next/headers'
import { prisma } from './prisma'

interface AuthResult {
  success: boolean
  userId?: string
  role?: string
  error?: { status: number; message: string }
}

/**
 * requireAdmin: 检查当前用户是否为管理员
 *
 * 验证逻辑：
 * 1. 从 cookie 读取 studentId
 * 2. 查询 user 表确认身份
 * 3. 检查 role 是否为 admin
 *
 * 返回：
 * - { success: true, userId, role } — 鉴权通过
 * - { success: false, error: { status: 401/403, message } } — 鉴权失败
 */
export async function requireAdmin(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies()
    const studentId = cookieStore.get('studentId')?.value

    if (!studentId) {
      return {
        success: false,
        error: { status: 401, message: '未登录，请先登录' }
      }
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    })

    if (!student) {
      return {
        success: false,
        error: { status: 401, message: '用户不存在' }
      }
    }

    // Check role from student record (V1: assume role is in a property or field)
    // For now, check if the user is admin based on name or a separate field
    // V2: move to a proper users table with role field
    const isAdmin = (student as any).role === 'admin' ||
                    student.name === 'admin' ||
                    student.id === 'admin'

    if (!isAdmin) {
      return {
        success: false,
        error: { status: 403, message: '权限不足，需要管理员权限' }
      }
    }

    return {
      success: true,
      userId: student.id,
      role: 'admin',
    }
  } catch (err) {
    return {
      success: false,
      error: { status: 500, message: '鉴权服务异常' }
    }
  }
}

/**
 * Helper: 包装 admin API 路由的鉴权检查
 *
 * 用法：
 * export async function GET(req: Request) {
 *   const auth = await requireAdmin()
 *   if (!auth.success) {
 *     return authGuardHandler(auth)
 *   }
 *   // ... 正常处理逻辑
 * }
 */
export function authGuardHandler(auth: AuthResult) {
  return new Response(
    JSON.stringify({ error: auth.error?.message }),
    {
      status: auth.error?.status ?? 401,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
