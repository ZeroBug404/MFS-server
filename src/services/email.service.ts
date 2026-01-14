import nodemailer from 'nodemailer'
import config from '../config'

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: Number(config.email.port),
    secure: config.email.secure === 'true', // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  })
}

// Send generic email
const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"${config.email.from_name}" <${config.email.from_email}>`,
      to,
      subject,
      html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
}

// Welcome email for new users
const sendWelcomeEmail = async (email: string, name: string, role: string) => {
  const subject = 'Welcome to AmarCash Mobile Financial Service!'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2A5C8A 0%, #27AE60 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #2A5C8A; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to AmarCash!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Thank you for joining AmarCash Mobile Financial Service as a <strong>${role}</strong>!</p>
          <p>Your account has been successfully created. You can now:</p>
          <ul>
            <li>Send and receive money instantly</li>
            <li>Cash in and cash out at agent points</li>
            <li>Track all your transactions</li>
            <li>Manage your account securely</li>
          </ul>
          ${
            role === 'agent'
              ? '<p><strong>Note:</strong> Your agent account is pending approval. You will receive a notification once your account is approved by an administrator.</p>'
              : ''
          }
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The AmarCash Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 AmarCash. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
  return await sendEmail(email, subject, html)
}

// Agent approval notification
const sendAgentApprovalEmail = async (email: string, name: string) => {
  const subject = 'Your Agent Account Has Been Approved!'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #27AE60 0%, #2A5C8A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .badge { display: inline-block; background: #27AE60; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p><span class="badge">APPROVED</span></p>
          <p>Great news! Your agent account has been approved by our administrator.</p>
          <p>You can now:</p>
          <ul>
            <li>Provide cash-in services to users</li>
            <li>Process cash-out requests</li>
            <li>Earn commissions on transactions</li>
            <li>View your performance metrics</li>
          </ul>
          <p>Start serving customers and growing your business with AmarCash!</p>
          <p>Best regards,<br>The AmarCash Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 AmarCash. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  return await sendEmail(email, subject, html)
}

// Transaction notification
const sendTransactionEmail = async (
  email: string,
  name: string,
  transactionDetails: {
    type: string
    amount: number
    recipientName?: string
    senderName?: string
    fee?: number
    newBalance: number
    transactionId: string
    date: string
  }
) => {
  const subject = `Transaction ${transactionDetails.type} - AmarCash`
  const isDebit =
    transactionDetails.type === 'send' || transactionDetails.type === 'cash-out'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${
          isDebit ? '#E74C3C' : '#27AE60'
        }; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .transaction-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${
          isDebit ? '#E74C3C' : '#27AE60'
        }; }
        .amount { font-size: 32px; font-weight: bold; color: ${
          isDebit ? '#E74C3C' : '#27AE60'
        }; margin: 10px 0; }
        .details { margin: 15px 0; }
        .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isDebit ? '💸' : '💰'} Transaction ${
    transactionDetails.type.charAt(0).toUpperCase() +
    transactionDetails.type.slice(1)
  }</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Your transaction has been completed successfully.</p>
          
          <div class="transaction-box">
            <div class="amount">${isDebit ? '-' : '+'} ${
    transactionDetails.amount
  } Taka</div>
            
            <div class="details">
              ${
                transactionDetails.recipientName
                  ? `<div class="details-row"><span>To:</span><span><strong>${transactionDetails.recipientName}</strong></span></div>`
                  : ''
              }
              ${
                transactionDetails.senderName
                  ? `<div class="details-row"><span>From:</span><span><strong>${transactionDetails.senderName}</strong></span></div>`
                  : ''
              }
              ${
                transactionDetails.fee
                  ? `<div class="details-row"><span>Fee:</span><span>${transactionDetails.fee} Taka</span></div>`
                  : ''
              }
              <div class="details-row"><span>New Balance:</span><span><strong>${
                transactionDetails.newBalance
              } Taka</strong></span></div>
              <div class="details-row"><span>Transaction ID:</span><span>${
                transactionDetails.transactionId
              }</span></div>
              <div class="details-row"><span>Date & Time:</span><span>${
                transactionDetails.date
              }</span></div>
            </div>
          </div>
          
          <p>Thank you for using AmarCash!</p>
          <p>Best regards,<br>The AmarCash Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 AmarCash. All rights reserved.</p>
          <p>If you did not authorize this transaction, please contact support immediately.</p>
        </div>
      </div>
    </body>
    </html>
  `
  return await sendEmail(email, subject, html)
}

// Account status change notification
const sendAccountStatusEmail = async (
  email: string,
  name: string,
  status: 'blocked' | 'unblocked'
) => {
  const subject = `Account ${
    status === 'blocked' ? 'Suspended' : 'Reactivated'
  } - AmarCash`
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${
          status === 'blocked' ? '#E74C3C' : '#27AE60'
        }; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert { background: ${
          status === 'blocked' ? '#FFF3CD' : '#D4EDDA'
        }; border-left: 4px solid ${
    status === 'blocked' ? '#E74C3C' : '#27AE60'
  }; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${status === 'blocked' ? '⚠️' : '✅'} Account ${
    status === 'blocked' ? 'Suspended' : 'Reactivated'
  }</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          
          <div class="alert">
            ${
              status === 'blocked'
                ? '<p><strong>Your account has been temporarily suspended.</strong></p><p>You will not be able to perform any transactions until your account is reactivated.</p><p>If you believe this is a mistake, please contact our support team immediately.</p>'
                : '<p><strong>Your account has been reactivated!</strong></p><p>You can now resume using all AmarCash services.</p>'
            }
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The AmarCash Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 AmarCash. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  return await sendEmail(email, subject, html)
}

// PIN change confirmation
const sendPinChangeEmail = async (email: string, name: string) => {
  const subject = 'PIN Changed Successfully - AmarCash'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2A5C8A 0%, #27AE60 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning { background: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 PIN Changed</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Your account PIN has been successfully changed.</p>
          
          <div class="warning">
            <p><strong>⚠️ Security Alert</strong></p>
            <p>If you did not make this change, please contact our support team immediately.</p>
          </div>
          
          <p>For security reasons, please:</p>
          <ul>
            <li>Never share your PIN with anyone</li>
            <li>Use a strong and unique PIN</li>
            <li>Change your PIN regularly</li>
          </ul>
          
          <p>Best regards,<br>The AmarCash Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 AmarCash. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
  return await sendEmail(email, subject, html)
}

export const EmailService = {
  sendEmail,
  sendWelcomeEmail,
  sendAgentApprovalEmail,
  sendTransactionEmail,
  sendAccountStatusEmail,
  sendPinChangeEmail,
}
