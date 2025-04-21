export type EmailTemplate = typeof EMAIL_TEMPLATES[keyof typeof EMAIL_TEMPLATES];

export interface EmailTemplateParams {
  name?: string;
  confirmation_link?: string;
  reset_link?: string;
  item_title?: string;
  bid_amount?: string;
  seller_name?: string;
  payment_link?: string;
  item_link?: string;
  current_year: number;
}

const welcomeTemplates = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to VersoBid - Verify Your Email</title>
          <style>
              /* Reset styles */
              body {
                  margin: 0;
                  padding: 0;
                  -webkit-text-size-adjust: 100%;
                  -ms-text-size-adjust: 100%;
                  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
              }
  
              /* Container styles */
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
              }
  
              /* Header styles */
              .header {
                  background-color: #4F46E5;
                  padding: 40px 20px;
                  text-align: center;
                  border-radius: 8px 8px 0 0;
              }
  
              .header h1 {
                  color: #ffffff;
                  margin: 0;
                  font-size: 28px;
                  font-weight: 700;
              }
  
              /* Content styles */
              .content {
                  padding: 40px 20px;
                  background-color: #ffffff;
                  border-radius: 0 0 8px 8px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
  
              /* Verification box styles */
              .verification-box {
                  background-color: #FEF3C7;
                  border: 1px solid #F59E0B;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 20px 0;
                  text-align: center;
              }
  
              /* Button styles */
              .button {
                  display: inline-block;
                  padding: 14px 32px;
                  background-color: #4F46E5;
                  color: #ffffff !important;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: 600;
                  margin: 20px 0;
              }
  
              /* Feature list styles */
              .features {
                  background-color: #F3F4F6;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                  opacity: 0.8;
              }
  
              .features h3 {
                  margin-top: 0;
                  color: #1F2937;
              }
  
              /* Footer styles */
              .footer {
                  margin-top: 40px;
                  text-align: center;
                  color: #6B7280;
                  font-size: 14px;
                  padding: 20px;
                  border-top: 1px solid #E5E7EB;
              }
  
              /* Responsive styles */
              @media screen and (max-width: 600px) {
                  .container {
                      width: 100% !important;
                  }
                  
                  .content {
                      padding: 20px;
                  }
                  
                  .button {
                      display: block;
                      text-align: center;
                      margin: 20px auto;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Welcome to VersoBid!</h1>
              </div>
              
              <div class="content">
                  <h2 style="color: #1F2937; margin-top: 0;">Hi {{params.to_name}},</h2>
                  
                  <div class="verification-box">
                      <h3 style="color: #B45309; margin-top: 0;">Please Verify Your Email</h3>
                      <p style="color: #92400E;">
                          To access all VersoBid features, please verify your email address by clicking the button below:
                      </p>
                      <a href="{{params.verification_link}}" class="button" style="background-color: #F59E0B;">
                          Verify Email Address
                      </a>
                  </div>
  
                  <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
                      Once verified, you'll have access to these great features:
                  </p>
  
                  <div class="features">
                      <h3>With VersoBid, you can:</h3>
                      <ul style="color: #4B5563; padding-left: 20px;">
                          <li>Post items you want to buy</li>
                          <li>Receive competitive bids from sellers</li>
                          <li>Make secure payments through our platform</li>
                          <li>Track your transactions easily</li>
                      </ul>
                  </div>
  
                  <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
                      After verifying your email, you can sign in using this link:
                  </p>
  
                  <a href="{{params.login_url}}" class="button">
                      Sign In
                  </a>
  
                  <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
                      If you have any questions, feel free to reach out to our support team at {{params.support_email}}.
                  </p>
  
                  <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin-top: 20px;">
                      <p style="color: #4B5563; font-size: 14px; margin: 0;">
                          If you didn't create an account with VersoBid, you can safely ignore this email.
                      </p>
                  </div>
  
                  <div class="footer">
                      <p style="margin-bottom: 10px;">
                          Best regards,<br>
                          The VersoBid Team
                      </p>
                      <p style="margin: 0; color: #9CA3AF;">
                          © {{params.current_year}} VersoBid. All rights reserved.
                      </p>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `

export const EMAIL_TEMPLATES = {
  WELCOME: welcomeTemplates,
  PASSWORD_RESET: 'password-reset',
  NEW_BID: 'new-bid',
  BID_ACCEPTED: 'bid-accepted'
} as const;