import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // SSL
  secure: true, // true for 465
  auth: {
    user: "feastio.connect@gmail.com",
    pass: "mjhhcqhaidnvasuh",
  },
});

export const COLORS = {
  primary: "#00C674",
  primaryLight: "#7CFCC3",
  primaryDark: "#00B366",
  accent: "#E3FFF3",
  greyLight: "#F8F9FA",
  greyMedium: "#E9ECEF",
  greyWarm: "#F5F5F3",
  greyCool: "#F1F3F4",
  greyMint: "#F0F4F1",
  greyNeutral: "#F6F6F6",
  white: "#FFFFFF",
  textPrimary: "#2D3748",
  textSecondary: "#718096",
  sage: "#9CAF88",
  sageLight: "#E8F5E8",
  background: "#FFFFFF",
  cardBackground: "#f8f9fb",
  google: "#DB4437",
  facebook: "#1877F2",
};

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Feastio" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "OTP Verfication Code",
    html: `
     <!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: ${COLORS.textPrimary};
      max-width: 480px;
      margin: 0 auto;
      padding: 15px;
      background-color: ${COLORS.background};
    }
    .container {
      background: ${COLORS.primaryLight};
      padding: 2px;
      border-radius: 12px;
    }
    .content {
      background: ${COLORS.white};
      padding: 25px;
      border-radius: 10px;
    }
    .header {
      text-align: center;
      margin-bottom: 25px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: ${COLORS.primary};
      margin-bottom: 5px;
    }
    .tagline {
      color: ${COLORS.textSecondary};
      font-size: 13px;
    }
    .otp-container {
      background: ${COLORS.accent};
      border: 2px dashed ${COLORS.primary};
      border-radius: 10px;
      padding: 18px;
      text-align: center;
      margin: 25px 0;
    }
    .otp-code {
      font-size: 32px;
      font-weight: bold;
      color: ${COLORS.primaryDark};
      letter-spacing: 6px;
      font-family: 'Courier New', monospace;
      margin: 10px 0;
    }
    .note {
      font-size: 12px;
      color: ${COLORS.textSecondary};
    }
    .welcome-banner {
      background: ${COLORS.greyMint};
      border-left: 4px solid ${COLORS.primary};
      padding: 12px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 13px;
      color: ${COLORS.textPrimary};
    }
    ul {
      padding-left: 20px;
      margin: 10px 0;
      font-size: 13px;
      color: ${COLORS.textSecondary};
    }
    .footer {
      text-align: center;
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid ${COLORS.greyMedium};
      color: ${COLORS.textSecondary};
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="header">
        <div class="logo">Feastio</div>
        <div class="tagline">Eat smarter. Live better.</div>
      </div>

       <h2 style="text-align: center;">Welcome to Feastio</h2>
      <p>Hello,</p>
      <p>Thank you for joining Feastio! To complete your account setup, please verify your email address using the OTP below:</p>

      <div class="otp-container">
        <p>Your Verification Code:</p>
        <div class="otp-code">${otp}</div>
        <p class="note">This code will expire in 10 minutes</p>
      </div>

      <div class="welcome-banner">
        <strong>Welcome aboard!</strong> Once verified, you'll have access to personalized nutrition tracking, smart meal recommendations, and insights to help you live healthier.
      </div>

      <p>For your security:</p>
      <ul>
        <li>Don't share this OTP with anyone</li>
        <li>This OTP is valid for 10 minutes only</li>
        <li>Use this OTP only on the Feastio mobile app</li>
        <li>Complete verification to unlock all features</li>
      </ul>

      <div class="footer">
        <p>This email was sent from Feastio. For any questions, contact our support team.</p>
        <p>&copy; 2025 Feastio. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
    text: `
     Welcome to Feastio - Account Verification

Hello,

Thank you for joining Feastio! Please verify your account with the OTP below.

Your Verification Code: ${otp}

This code will expire in 10 minutes.

For security, don't share this OTP with anyone.

Welcome aboard! Once verified, you'll have access to personalized nutrition tracking and smart meal recommendations.

- Feastio Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Registration OTP email sent:", info.response);
  } catch (err) {
    console.error("Error sending registration OTP email:", err);
    throw err;
  }
};

export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const sendPasswordResetOTP = async (email, otp, username = "User") => {
  const mailOptions = {
    from: `"Feastio" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP - Feastio",
    html: `
     <!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: ${COLORS.textPrimary};
      max-width: 480px;
      margin: 0 auto;
      padding: 15px;
      background-color: ${COLORS.background};
    }
    .container {
      background: ${COLORS.primaryLight};
      padding: 2px;
      border-radius: 12px;
    }
    .content {
      background: ${COLORS.white};
      padding: 25px;
      border-radius: 10px;
    }
    .header {
      text-align: center;
      margin-bottom: 25px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: ${COLORS.primary};
      margin-bottom: 5px;
    }
    .tagline {
      color: ${COLORS.textSecondary};
      font-size: 13px;
    }
    .otp-container {
      background: ${COLORS.accent};
      border: 2px dashed ${COLORS.primary};
      border-radius: 10px;
      padding: 18px;
      text-align: center;
      margin: 25px 0;
    }
    .otp-code {
      font-size: 32px;
      font-weight: bold;
      color: ${COLORS.primaryDark};
      letter-spacing: 6px;
      font-family: 'Courier New', monospace;
      margin: 10px 0;
    }
    .note {
      font-size: 12px;
      color: ${COLORS.textSecondary};
    }
    .warning {
      background: ${COLORS.sageLight};
      border-left: 4px solid ${COLORS.sage};
      padding: 12px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 13px;
    }
    ul {
      padding-left: 20px;
      margin: 10px 0;
      font-size: 13px;
      color: ${COLORS.textSecondary};
    }
    .footer {
      text-align: center;
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid ${COLORS.greyMedium};
      color: ${COLORS.textSecondary};
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="header">
        <div class="logo">Feastio</div>
        <div class="tagline">Eat smarter. Live better.</div>
      </div>

      <h2 style="text-align: center;">Password Reset Request</h2>
      <p>Hello ${username},</p>
      <p>We received a request to reset your password. Use the OTP below to reset it securely:</p>

      <div class="otp-container">
        <p>Your OTP Code:</p>
        <div class="otp-code">${otp}</div>
        <p class="note">This code will expire in 10 minutes</p>
      </div>

      <div class="warning">
        <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
      </div>

      <p>For your security:</p>
      <ul>
        <li>Don't share this OTP with anyone</li>
        <li>This OTP is valid for 10 minutes only</li>
        <li>Use this OTP only on the Feastio mobile app</li>
      </ul>

      <div class="footer">
        <p>This email was sent from Feastio. For any questions, contact our support team.</p>
        <p>&copy; 2025 Feastio. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
    text: `
     Password Reset OTP - Feastio

Hello ${username},

We received a request to reset your password.

Your OTP Code: ${otp}

This code will expire in 10 minutes.

If you didn't request this password reset, please ignore this email.

For security, don't share this OTP with anyone.

- Feastio Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent:", info.response);
  } catch (err) {
    console.error("Error sending OTP email:", err);
    throw err;
  }
};
