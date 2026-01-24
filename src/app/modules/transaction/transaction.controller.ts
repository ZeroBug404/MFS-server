import { Request, Response } from 'express'

import httpStatus from 'http-status'
import PDFDocument from 'pdfkit-table'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../utils/responseHandler'
import { Transaction } from './transaction.model'
import { TransactionService } from './transaction.service'
import { TransactionStatisticsService } from './transaction.statistics.service'

const sendMoney = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body, 'req.body')

  const result = await TransactionService.sendMoney(
    req.body.senderId,
    req.body.recipientPhone,
    req.body.amount
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Send money successfully',
    data: result,
  })
})

const cashIn = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.body, 'req.body');

  const result = await TransactionService.cashIn(
    req.body.agentId,
    req.body.recipientPhone,
    req.body.amount
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cash-in successfully',
    data: result,
  })
})

const agentCashIn = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.body, 'req.body');

  const result = await TransactionService.agentCashIn(
    req.body.adminId,
    req.body.recipientPhone,
    req.body.amount
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cash-in successfully',
    data: result,
  })
})

const cashOut = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.body, 'req.body');

  const result = await TransactionService.cashOut(
    req.body.userId,
    req.body.agentPhone,
    req.body.amount
  )

  console.log(result, 'result')

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cash-out successfully',
    data: result,
  })
})

const getHistory = async (req: Request, res: Response) => {
  console.log(req.query)

  const transactions = await TransactionService.getTransactions(req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User history get successfully',
    data: transactions,
  })
}

const adminGetTransactions = async (req: Request, res: Response) => {
  const transactions = await Transaction.find()
    .populate('from to', 'name mobile role')
    .sort({ createdAt: -1 })
  res.json({ success: true, data: transactions })
}

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.query.userId as string)
  const role = (req.user as any)?.role || (req.query.role as string)

  let stats

  if (role === 'admin') {
    stats = await TransactionStatisticsService.getAdminDashboardStats()
  } else if (role === 'agent') {
    stats = await TransactionStatisticsService.getAgentDashboardStats(userId)
  } else {
    stats = await TransactionStatisticsService.getUserDashboardStats(userId)
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard statistics retrieved successfully',
    data: stats,
  })
})

const getSystemMetrics = catchAsync(async (req: Request, res: Response) => {
  const timeRange = (req.query.timeRange as string) || '7d'

  const metrics = await TransactionStatisticsService.getSystemMetrics(timeRange)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'System metrics retrieved successfully',
    data: metrics,
  })
})

const downloadStatement = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId;
  const { startDate, endDate, type } = req.query;

  if (!startDate || !endDate) {
    throw new Error('Start date and end date are required');
  }

  const transactions = await TransactionService.getStatement(
    userId,
    startDate as string,
    endDate as string
  );

  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  
  const disposition = type === 'view' ? 'inline' : 'attachment';
  res.setHeader(
    'Content-Disposition',
    `${disposition}; filename=statement-${startDate}-${endDate}.pdf`
  );

  doc.pipe(res);

  // Add content to PDF
  doc.fontSize(20).text('Transaction Statement', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Period: ${startDate} to ${endDate}`, { align: 'center' });
  doc.moveDown();

  const table = {
    title: 'Statement Details',
    headers: [
      'Date',
      'TrxID',
      'Type',
      'Amount',
      'Fee',
      'Counterparty'
    ],
    rows: transactions.map((t: any) => {
        const isSender = t.from._id.toString() === userId;
        const type = t.type;
        const counterparty = isSender ? t.to?.phoneNo : t.from?.phoneNo;
        
        return [
            new Date(t.createdAt).toLocaleDateString(),
            t.transactionId,
            type,
            t.amount.toString(),
            t.fee.toString(),
            counterparty || 'N/A'
        ]
    }),
  };

  // @ts-ignore
  await doc.table(table, {
    prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
    prepareRow: () => doc.font('Helvetica').fontSize(10),
  });

  doc.end();
});

export const TransactionController = {
  sendMoney,
  cashIn,
  agentCashIn,
  cashOut,
  getHistory,
  adminGetTransactions,
  getDashboardStats,
  getSystemMetrics,
  downloadStatement,
}
