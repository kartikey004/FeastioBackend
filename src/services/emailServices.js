import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // SSL
  secure: true, // true for 465
  auth: {
    user: "nutrisense.connect@gmail.com",
    pass: "wpctwoelrerkfuon",
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
    from: `"NutriSense" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "OTP Verification Code",
    html: `
<div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 20px; background: ${
      COLORS.greyNeutral
    }; border-radius: 12px; border: 1px solid ${COLORS.greyMedium};">

  <!-- Header -->
  <div style="text-align: center; padding-bottom: 20px;">
    <h1 style="color: ${
      COLORS.primaryDark
    }; margin: 0; font-size: 24px;">NutriSense</h1>
    <p style="color: ${
      COLORS.textSecondary
    }; margin: 6px 0 0; font-size: 14px;">Eat smarter. Live better.</p>
  </div>

  <!-- Content Box -->
  <div style="background: ${
    COLORS.white
  }; padding: 20px; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);">
    <h2 style="color: ${
      COLORS.textPrimary
    }; font-size: 18px; margin: 0 0 14px;">Password Reset Request</h2>
    
    <p style="color: ${
      COLORS.textPrimary
    }; font-size: 14px; line-height: 1.6; margin: 0 0 18px;">
      Hi ${username},<br>
      We received a request to reset your password. Use the One-Time Password (OTP) below to reset it securely:
    </p>
    
    <!-- OTP Box -->
    <div style="text-align: center; margin: 24px 0;">
      <span style="display: inline-block; font-size: 26px; font-weight: bold; color: ${
        COLORS.white
      }; background: ${
      COLORS.primary
    }; padding: 12px 28px; border-radius: 8px; letter-spacing: 6px;">
        ${otp}
      </span>
    </div>

    <p style="color: ${
      COLORS.textPrimary
    }; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
      This OTP is valid for <b>10 minutes</b>. Please do not share it with anyone for security reasons.
    </p>

    <div style="background: ${COLORS.sageLight}; border-left: 4px solid ${
      COLORS.sage
    }; padding: 12px; margin: 20px 0; border-radius: 4px; font-size: 13px; color: ${
      COLORS.textSecondary
    };">
      <strong>Security Notice:</strong> If you didn’t request this password reset, you can safely ignore this email. Your account remains secure.
    </div>

    <ul style="padding-left: 20px; margin: 10px 0; font-size: 13px; color: ${
      COLORS.textSecondary
    };">
      <li>Do not share this OTP with anyone</li>
      <li>This OTP is valid for 10 minutes only</li>
      <li>Use this OTP only in the NutriSense mobile app</li>
    </ul>

  </div>

  <!-- Footer -->
  <p style="font-size: 11px; color: ${
    COLORS.textSecondary
  }; text-align: center; margin-top: 20px;">
    © ${new Date().getFullYear()} NutriSense. All rights reserved.
  </p>

</div>
`,
    text: `
Password Reset OTP - NutriSense

Hi ${username},

We received a request to reset your password.

Your OTP Code: ${otp}

This OTP is valid for 10 minutes. Do not share it with anyone.

If you didn’t request this password reset, ignore this email.

- NutriSense Team
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

export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP email
export const sendPasswordResetOTP = async (email, otp, username = "User") => {
  const mailOptions = {
    from: `"NutriSense" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP - NutriSense",
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
        <div class="logo">NutriSense</div>
        <div class="tagline">Eat smarter. Live better.</div>
      </div>

      <h2>Password Reset Request</h2>
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
        <li>Use this OTP only on the NutriSense mobile app</li>
      </ul>

      <div class="footer">
        <p>This email was sent from NutriSense. For any questions, contact our support team.</p>
        <p>&copy; 2025 NutriSense. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
    text: `
     Password Reset OTP - NutriSense

Hello ${username},

We received a request to reset your password.

Your OTP Code: ${otp}

This code will expire in 10 minutes.

If you didn't request this password reset, please ignore this email.

For security, don't share this OTP with anyone.

- NutriSense Team
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
