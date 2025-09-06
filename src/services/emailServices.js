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

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"NutriSense" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "OTP Verification Code",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #F8F9FA; border-radius: 12px; border: 1px solid #E9ECEF;">
      
      <div style="text-align: center; padding-bottom: 20px;">
        <h1 style="color: #00B366; margin: 0; font-size: 24px;">NutriSense</h1>
        <p style="color: #718096; margin: 6px 0 0; font-size: 14px;">Smart Nutrition. Simplified.</p>
      </div>

      <div style="background: #FFFFFF; padding: 20px; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);">
        <h2 style="color: #2D3748; font-size: 18px; margin: 0 0 14px;">Welcome to NutriSense</h2>
        
        <p style="color: #2D3748; font-size: 14px; line-height: 1.6; margin: 0 0 18px;">
          Hi there,<br>
          Thanks for signing up with <b>NutriSense</b>. Please use the One-Time Password (OTP) below to verify your email:
        </p>
        
    
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 26px; font-weight: bold; color: #FFFFFF; background: #00C674; padding: 12px 28px; border-radius: 8px; letter-spacing: 4px;">
            ${otp}
          </span>
        </div>

        <p style="color: #2D3748; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
          This code is valid for <b>10 minutes</b>. Please do not share it with anyone for security reasons.
        </p>

        <p style="color: #718096; font-size: 12px; margin-top: 22px;">
          If you didn’t request this code, you can safely ignore this email.
        </p>
      </div>

      <p style="font-size: 11px; color: #A0AEC0; text-align: center; margin-top: 20px;">
        © ${new Date().getFullYear()} NutriSense. All rights reserved.
      </p>
    </div>
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
