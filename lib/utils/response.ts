// API 响应格式工具
// 统一前后端响应格式

export interface ApiResponse<T = any> {
  success: boolean
  code: number
  message: string
  data?: T
  timestamp: number
}

// 成功响应
export function successResponse<T>(data?: T, message: string = 'success'): ApiResponse<T> {
  return {
    success: true,
    code: 0,
    message,
    data,
    timestamp: Date.now(),
  }
}

// 失败响应
export function errorResponse(
  message: string,
  code: number = 500,
  data?: any
): ApiResponse {
  return {
    success: false,
    code,
    message,
    data,
    timestamp: Date.now(),
  }
}

// 参数校验错误
export function validationError(message: string, errors?: any): ApiResponse {
  return errorResponse(message, 400, errors)
}

// 未授权
export function unauthorizedError(message: string = '未授权访问'): ApiResponse {
  return errorResponse(message, 401)
}

// 资源不存在
export function notFoundError(message: string = '资源不存在'): ApiResponse {
  return errorResponse(message, 404)
}
