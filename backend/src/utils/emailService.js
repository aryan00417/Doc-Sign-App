const nodemailer = require('nodemailer')

const sendSignatureRequestEmail = async ({ 
  toEmail, 
  toName, 
  documentTitle, 
  signLink, 
  senderName,
  senderEmail,
  senderPassword
}) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: senderEmail,
      pass: senderPassword
    }
  })

  const mailOptions = {
    from: `"DocuSign App" <${senderEmail}>`,
    to: toEmail,
    subject: `${senderName} has requested your review on "${documentTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✍️ Document Review Request</h1>
        </div>
        <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px;">Hi <strong>${toName}</strong>,</p>
          <p style="color: #374151;">
            <strong>${senderName}</strong> has sent you a signed document for review:
          </p>
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">📄 ${documentTitle}</p>
          </div>
          <a href="${signLink}"
             style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px;
                    border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Review Document
          </a>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
            This link is unique. Do not share it with others.
          </p>
        </div>
      </div>
    `
  }

  await transporter.sendMail(mailOptions)
}

module.exports = { sendSignatureRequestEmail }