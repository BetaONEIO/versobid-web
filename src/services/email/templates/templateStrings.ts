export const emailTemplates = {
  'test': `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>VersoBid Test Email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>VersoBid Test Email</h1>
        </div>
        <div class="content">
          <h2>Hello {{ params.name }}!</h2>
          <p>This is a test email from VersoBid.</p>
          <p>Timestamp: {{ params.timestamp }}</p>
        </div>
      </div>
    </body>
    </html>
  `,
  'welcome': `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to VersoBid</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4F46E5;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to VersoBid!</h1>
        </div>
        <div class="content">
          <h2>Hi {{ params.name }},</h2>
          <p>Thank you for joining VersoBid! We're excited to have you as part of our community.</p>
          <p>With VersoBid, you can:</p>
          <ul>
            <li>Post items you want to buy</li>
            <li>Receive competitive bids from sellers</li>
            <li>Make secure payments through our platform</li>
          </ul>
          <a href="{{ params.dashboard_link }}" class="button">Get Started</a>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The VersoBid Team</p>
        </div>
      </div>
    </body>
    </html>
  `,
  'bid-notification': `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Bid Received</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4F46E5;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Bid Received</h1>
        </div>
        <div class="content">
          <h2>You've received a new bid!</h2>
          <p>A bid has been placed on your item: {{ params.item_title }}</p>
          <p>Bid amount: {{ params.bid_amount }}</p>
          <a href="{{ params.item_link }}" class="button">View Bid</a>
          <p>Best regards,<br>The VersoBid Team</p>
        </div>
      </div>
    </body>
    </html>
  `
};