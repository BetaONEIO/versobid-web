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
  `
};