import { prisma } from '../prisma'
import { generateOrderNo } from '../utils/order'
import { PAYMENT_CONFIG } from '../config'
import { createWechatOrder } from './wechat'
import { notifyPaymentSuccess, fireNotification } from '../wecom/bot'

export interface CreateOrderParams {
  assessmentId: string
  amount?: number
  payMethod?: 'wechat' | 'alipay'
}

export async function createOrder(params: CreateOrderParams) {
  const { assessmentId, amount, payMethod = 'wechat' } = params

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
  })

  if (!assessment) {
    throw new Error('项目记录不存在')
  }

  const existingOrder = await prisma.order.findFirst({
    where: { assessmentId },
    orderBy: { createdAt: 'desc' },
  })

  if (existingOrder) {
    if (existingOrder.status === 'pending') return existingOrder
    if (existingOrder.status === 'paid' || existingOrder.status === 'refunded') {
      throw new Error('该项目已有有效订单，无需重复创建')
    }

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
  const order = await prisma.order.create({
    data: {
      orderNo: generateOrderNo(),
      assessmentId,
      amount: orderAmount,
      status: 'pending',
      payMethod,
    },
  })

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

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { assessment: true },
  })
}

export async function getOrderByNo(orderNo: string) {
  return prisma.order.findUnique({
    where: { orderNo },
    include: { assessment: true },
  })
}

export async function createWechatPayParams(orderId: string, openid?: string, clientIp?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })

  if (!order) throw new Error('订单不存在')
  if (order.status !== 'pending') throw new Error('订单状态不正确')

  const result = await createWechatOrder({
    orderNo: order.orderNo,
    amount: order.amount,
    description: '中科商业咨询企业资本合作初步评估报告',
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

export async function handlePaymentSuccess(
  orderNo: string,
  transactionId: string,
  payMethod: string,
  rawData?: string
) {
  const order = await prisma.order.findUnique({ where: { orderNo } })
  if (!order) throw new Error('订单不存在')
  if (order.status === 'paid') return order

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'paid',
      payMethod,
      payTime: new Date(),
      transactionId,
    },
  })

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

  if (!order) throw new Error('订单不存在')

  return {
    orderId: order.id,
    orderNo: order.orderNo,
    status: order.status,
    amount: order.amount,
    paid: order.status === 'paid',
    payTime: order.payTime,
  }
}

