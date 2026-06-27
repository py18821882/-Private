// 订单服务
// 订单创建、查询、状态更新等业务逻辑

import { prisma } from '../prisma'
import { generateOrderNo } from '../utils/order'
import { PAYMENT_CONFIG } from '../config'
import { createWechatOrder } from './wechat'
import { notifyPaymentSuccess, fireNotification } from '../wecom/bot'

// 创建订单
export interface CreateOrderParams {
  assessmentId: string
  amount?: number // 分，不传用默认价格
  payMethod?: 'wechat' | 'alipay'
}

/**
 * 创建订单
 * 如果已有待支付订单，直接返回
 * 如果已有已取消订单，复用并重置为待支付
 */
export async function createOrder(params: CreateOrderParams) {
  const { assessmentId, amount, payMethod = 'wechat' } = params

  // 检查测评是否存在
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
  })

  if (!assessment) {
    throw new Error('测评记录不存在')
  }

  // 查找该测评的现有订单
  const existingOrder = await prisma.order.findFirst({
    where: { assessmentId },
    orderBy: { createdAt: 'desc' },
  })

  if (existingOrder) {
    // 已有待支付订单，直接返回
    if (existingOrder.status === 'pending') {
      return existingOrder
    }

    // 已支付或已退款的订单，不允许重新创建
    if (existingOrder.status === 'paid' || existingOrder.status === 'refunded') {
      throw new Error('该测评已有有效订单，无需重复创建')
    }

    // 已取消的订单，复用并重置为待支付（避免 @unique 冲突）
    if (existingOrder.status === 'cancelled') {
      const orderAmount = amount || PAYMENT_CONFIG.defaultPrice
      const updatedOrder = await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          orderNo: generateOrderNo(),
          amount: orderAmount,
          status: 'pending',
          payMethod,
          payTime: null,
          transactionId: null,
        },
      })

      // 记录支付日志
      await prisma.paymentLog.create({
        data: {
          orderId: updatedOrder.id,
          orderNo: updatedOrder.orderNo,
          type: 'pay',
          method: payMethod,
          amount: orderAmount,
          status: 'pending',
        },
      })

      return updatedOrder
    }
  }

  const orderAmount = amount || PAYMENT_CONFIG.defaultPrice

  // 创建新订单
  const order = await prisma.order.create({
    data: {
      orderNo: generateOrderNo(),
      assessmentId,
      amount: orderAmount,
      status: 'pending',
      payMethod,
    },
  })

  // 记录支付日志
  await prisma.paymentLog.create({
    data: {
      orderId: order.id,
      orderNo: order.orderNo,
      type: 'pay',
      method: payMethod,
      amount: orderAmount,
      status: 'pending',
    },
  })

  return order
}

/**
 * 获取订单详情
 */
export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      assessment: true,
    },
  })
}

/**
 * 根据订单号查询
 */
export async function getOrderByNo(orderNo: string) {
  return prisma.order.findUnique({
    where: { orderNo },
    include: {
      assessment: true,
    },
  })
}

/**
 * 创建微信支付参数
 */
export async function createWechatPayParams(orderId: string, openid?: string, clientIp?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new Error('订单不存在')
  }

  if (order.status !== 'pending') {
    throw new Error('订单状态不正确')
  }

  const result = await createWechatOrder({
    orderNo: order.orderNo,
    amount: order.amount,
    description: '企业AI增长测评报告',
    openid,
    clientIp,
  })

  return {
    orderId: order.id,
    orderNo: order.orderNo,
    amount: order.amount,
    ...result,
  }
}

/**
 * 处理支付成功回调
 */
export async function handlePaymentSuccess(
  orderNo: string,
  transactionId: string,
  payMethod: string,
  rawData?: string
) {
  const order = await prisma.order.findUnique({
    where: { orderNo },
  })

  if (!order) {
    throw new Error('订单不存在')
  }

  if (order.status === 'paid') {
    // 已支付，幂等处理
    return order
  }

  // 更新订单状态
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'paid',
      payMethod,
      payTime: new Date(),
      transactionId,
    },
  })

  // 更新测评的支付状态
  // 仅在 orderId 未设置时才写入 orderId，避免 @unique 冲突
  const assessment = await prisma.assessment.findUnique({
    where: { id: order.assessmentId },
    select: { orderId: true, companyName: true, reportId: true },
  })

  await prisma.assessment.update({
    where: { id: order.assessmentId },
    data: {
      paid: true,
      ...(assessment && !assessment.orderId ? { orderId: order.id } : {}),
    },
  })

  // 记录支付日志
  await prisma.paymentLog.create({
    data: {
      orderId: order.id,
      orderNo,
      type: 'notify',
      method: payMethod,
      amount: order.amount,
      status: 'success',
      rawData,
    },
  })

  // 企业微信通知：支付成功（fire-and-forget）
  if (assessment) {
    fireNotification(notifyPaymentSuccess({
      orderNo: order.orderNo,
      companyName: assessment.companyName,
      amount: order.amount,
      payMethod,
      payTime: new Date(),
      reportId: assessment.reportId || '',
    }))
  }

  return updatedOrder
}

/**
 * 查询订单支付状态
 */
export async function checkOrderStatus(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNo: true,
      status: true,
      amount: true,
      payTime: true,
    },
  })

  if (!order) {
    throw new Error('订单不存在')
  }

  return {
    orderId: order.id,
    orderNo: order.orderNo,
    status: order.status,
    amount: order.amount,
    paid: order.status === 'paid',
    payTime: order.payTime,
  }
}
