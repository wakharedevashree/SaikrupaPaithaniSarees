import nodemailer from 'nodemailer';

console.log('📧 Email Configuration Check:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Loaded' : 'MISSING');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'MISSING');

// Create transporter with better error handling
let transporter = null;

try {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email credentials are missing in environment variables');
  } else {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify the configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email configuration error:', error.message);
        transporter = null;
      } else {
        console.log('✅ Email server is ready to send messages');
      }
    });
  }
} catch (error) {
  console.error('❌ Email service initialization failed:', error.message);
  transporter = null;
}

// Helper function to calculate expected delivery date
function getExpectedDeliveryDate(shippingMethod) {
  const today = new Date();
  let deliveryDays;
  
  switch(shippingMethod) {
    case 'express':
      deliveryDays = 3;
      break;
    case 'free':
      deliveryDays = 10;
      break;
    case 'standard':
    default:
      deliveryDays = 7;
      break;
  }
  
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + deliveryDays);
  
  return deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Email templates
function generatePaymentSuccessEmailTemplate(customerName, orderNumber, totalAmount, orderData) {
  const itemsList = orderData.items.map(item => 
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toLocaleString()}</td>
    </tr>`
  ).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #800000; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f4e3; padding: 20px; border-radius: 0 0 8px 8px; }
    .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    .success-badge { background: #d4ffd4; color: #2d5016; padding: 10px; border-radius: 5px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛍️ SaiKrupa Paithani</h1>
      <p>Traditional Elegance, Modern Style</p>
    </div>
    
    <div class="content">
      <div class="success-badge">
        <h2>✅ Payment Successful!</h2>
        <p>Thank you for your purchase, ${customerName}!</p>
      </div>
      
      <div class="order-details">
        <h3>Order Confirmation #${orderNumber}</h3>
        <p>Your payment has been processed successfully and your order is confirmed.</p>
        
        <h4>📦 Order Summary</h4>
        <table>
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>
        
        <div style="text-align: right; margin-top: 15px; font-weight: bold;">
          <p>Total Amount: ₹${totalAmount.toLocaleString()}</p>
        </div>
        
        <h4>🚚 Shipping Details</h4>
        <p>
          <strong>Address:</strong><br>
          ${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}<br>
          ${orderData.shippingAddress.address}<br>
          ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}<br>
          <strong>Phone:</strong> ${orderData.shippingAddress.phone}
        </p>
        
        <p>
          <strong>Shipping Method:</strong> ${orderData.shippingMethod}<br>
          <strong>Expected Delivery:</strong> ${getExpectedDeliveryDate(orderData.shippingMethod)}
        </p>
      </div>
      
      <div style="background: #e8f4ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>📞 Need Help?</h4>
        <p>If you have any questions about your order, please contact us:</p>
        <p>📧 Email: diyawakhare27@gmail.com<br>
           📞 Phone: +91 98765 43210</p>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2025 SaiKrupa Paithani. All rights reserved.</p>
      <p>Bringing traditional Maharashtrian elegance to your doorstep</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateCODEmailTemplate(customerName, orderNumber, totalAmount, orderData) {
  const itemsList = orderData.items.map(item => 
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toLocaleString()}</td>
    </tr>`
  ).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #800000; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f4e3; padding: 20px; border-radius: 0 0 8px 8px; }
    .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    .cod-badge { background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛍️ SaiKrupa Paithani</h1>
      <p>Traditional Elegance, Modern Style</p>
    </div>
    
    <div class="content">
      <div class="cod-badge">
        <h2>📦 Order Confirmed!</h2>
        <p>Thank you for your order, ${customerName}!</p>
      </div>
      
      <div class="order-details">
        <h3>Cash on Delivery Order #${orderNumber}</h3>
        <p>Your order has been confirmed and will be shipped soon. Please keep the exact amount ready for delivery.</p>
        
        <h4>💰 Payment Due on Delivery</h4>
        <p style="font-size: 18px; font-weight: bold; color: #800000; text-align: center;">
          ₹${totalAmount.toLocaleString()}
        </p>
        
        <h4>📦 Order Summary</h4>
        <table>
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>
        
        <h4>🚚 Shipping Details</h4>
        <p>
          <strong>Delivery Address:</strong><br>
          ${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}<br>
          ${orderData.shippingAddress.address}<br>
          ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}<br>
          <strong>Contact:</strong> ${orderData.shippingAddress.phone}
        </p>
        
        <p>
          <strong>Shipping Method:</strong> ${orderData.shippingMethod}<br>
          <strong>Expected Delivery:</strong> ${getExpectedDeliveryDate(orderData.shippingMethod)}
        </p>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h5>💡 Important COD Instructions:</h5>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Please keep exact change ready</li>
            <li>Inspect the package before payment</li>
            <li>Our delivery executive will provide a receipt</li>
          </ul>
        </div>
      </div>
      
      <div style="background: #e8f4ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>📞 Need Help?</h4>
        <p>If you have any questions about your order, please contact us:</p>
        <p>📧 Email: diyawakhare27@gmail.com<br>
           📞 Phone: +91 98765 43210</p>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2025 SaiKrupa Paithani. All rights reserved.</p>
      <p>Bringing traditional Maharashtrian elegance to your doorstep</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Send email function
async function sendEmail(to, subject, htmlContent) {
  if (!transporter) {
    console.warn('❌ Email transporter not available. Cannot send email.');
    throw new Error('Email service not configured');
  }

  try {
    const mailOptions = {
      from: {
        name: 'SaiKrupa Paithani',
        address: process.env.EMAIL_USER
      },
      to: to,
      subject: subject,
      html: htmlContent,
    };

    console.log('📤 Attempting to send email to:', to);
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to);
    console.log('📨 Message ID:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw error;
  }
}

// Main email sending function
export async function sendOrderConfirmationEmail(emailData) {
  const { to, subject, orderId, orderNumber, customerName, orderData, paymentMethod, totalAmount } = emailData;

  try {
    console.log('🎯 Starting email sending process for order:', orderNumber);
    
    if (!transporter) {
      const errorMsg = 'Email service not configured. Transporter is null.';
      console.error('❌', errorMsg);
      return { success: false, message: errorMsg };
    }

    const emailContent = paymentMethod === 'cod' 
      ? generateCODEmailTemplate(customerName, orderNumber, totalAmount, orderData)
      : generatePaymentSuccessEmailTemplate(customerName, orderNumber, totalAmount, orderData);

    await sendEmail(to, subject, emailContent);
    
    console.log('🎉 Email process completed successfully for order:', orderNumber);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('💥 Email sending process failed:', error.message);
    return { success: false, message: 'Failed to send email', error: error.message };
  }
}

export default {
  sendOrderConfirmationEmail
};