const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ── MIDDLEWARE ──
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://print-vista.vercel.app", // ← replace with your actual frontend URL after deploy
    ],
    methods: ["GET", "POST"],
  })
);

// ── EMAIL TRANSPORTER ──
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,     // your Gmail address
    pass: process.env.EMAIL_PASS,     // Gmail App Password (NOT your real password)
  },
});

// ── HEALTH CHECK ──
app.get("/", (req, res) => {
  res.json({ status: "Print Vista API is running ✓" });
});

// ── CONTACT / QUOTE FORM ENDPOINT ──
app.post("/api/contact", async (req, res) => {
  const { name, company, phone, email, service, message } = req.body;

  // Basic validation
  if (!name || !phone || !service || !message) {
    return res.status(400).json({
      success: false,
      error: "Name, phone, service and message are required.",
    });
  }

  try {
    // ── Email TO Print Vista (notification) ──
    await transporter.sendMail({
      from: `"Print Vista Website" <${process.env.EMAIL_USER}>`,
      to: process.env.NOTIFY_EMAIL, // info@printvista.com
      subject: `New Quote Request — ${service} | ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
          
          <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 32px 40px;">
            <h1 style="color: #fff; margin: 0; font-size: 22px; letter-spacing: -0.5px;">
              New Quote Request
            </h1>
            <p style="color: rgba(255,255,255,0.75); margin: 8px 0 0; font-size: 14px;">
              Received from printvista.com
            </p>
          </div>

          <div style="padding: 40px;">
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #888; font-size: 13px; width: 140px;">NAME</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #111;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #888; font-size: 13px;">COMPANY</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #111;">${company || "—"}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #888; font-size: 13px;">PHONE</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #2563eb;">
                  <a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #888; font-size: 13px;">EMAIL</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #111;">
                  <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email || "—"}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #888; font-size: 13px;">SERVICE</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #111;">
                  <span style="background: #eff6ff; color: #2563eb; padding: 4px 12px; border-radius: 99px; font-size: 13px; font-weight: 600;">
                    ${service}
                  </span>
                </td>
              </tr>
            </table>

            <div style="margin-top: 28px;">
              <p style="color: #888; font-size: 13px; margin-bottom: 10px;">MESSAGE</p>
              <div style="background: #f8fafc; border-radius: 10px; padding: 20px; color: #333; line-height: 1.8; font-size: 15px;">
                ${message}
              </div>
            </div>

            <div style="margin-top: 32px; text-align: center;">
              <a href="tel:${phone}" style="display: inline-block; background: #111; color: #fff; padding: 14px 32px; border-radius: 99px; text-decoration: none; font-size: 15px; font-weight: 600;">
                Call Back ${name} →
              </a>
            </div>

          </div>

          <div style="background: #fafafa; padding: 20px 40px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #aaa; font-size: 12px; margin: 0;">
              © 2026 Print Vista  — printvista.com
            </p>
          </div>

        </div>
      `,
    });

    // ── Auto-reply TO the client ──
    if (email) {
      await transporter.sendMail({
        from: `"Print Vista" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "We received your enquiry — Print Vista",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
            
            <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 32px 40px;">
              <h1 style="color: #fff; margin: 0; font-size: 22px;">
                Thank you, ${name}!
              </h1>
              <p style="color: rgba(255,255,255,0.75); margin: 8px 0 0; font-size: 14px;">
                We've received your enquiry.
              </p>
            </div>

            <div style="padding: 40px;">
              <p style="color: #333; font-size: 16px; line-height: 1.8;">
                Hi ${name},<br/><br/>
                Thank you for reaching out to <strong>Print Vistas</strong>. We've received your enquiry for <strong>${service}</strong> and our team will get back to you within <strong>24 hours</strong>.
              </p>

              <div style="background: #f8fafc; border-radius: 12px; padding: 24px 28px; margin: 28px 0;">
                <h3 style="font-size: 15px; margin: 0 0 16px; color: #111;">Your Enquiry Summary</h3>
                <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Service:</strong> ${service}</p>
                <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Phone:</strong> ${phone}</p>
                <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Message:</strong> ${message}</p>
              </div>

              <p style="color: #555; font-size: 15px; line-height: 1.8;">
                For urgent requirements, you can also reach us directly:<br/>
                📞 <a href="tel:+919426272081" style="color: #2563eb;">+91 98765 43210</a> (Abc Patel)<br/>
                📞 <a href="tel:+919825982727" style="color: #2563eb;">+91 98765 43210</a> (Abc Patel)
              </p>
            </div>

            <div style="background: #fafafa; padding: 20px 40px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #111; font-weight: 700; margin: 0 0 4px;">PrintVista</p>
              <p style="color: #aaa; font-size: 12px; margin: 0;">
                Plot No. 58, Vishwakarma Estate, Surat, Gujarat
              </p>
            </div>

          </div>
        `,
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry sent successfully! We'll get back to you within 24 hours.",
    });

  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send email. Please try again or call us directly.",
    });
  }
});

// ── START SERVER ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});