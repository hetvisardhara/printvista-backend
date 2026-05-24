const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// ── MIDDLEWARE ──
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://print-vista.vercel.app",
    ],
    methods: ["GET", "POST"],
  })
);

// ── MONGODB CONNECTION ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✓ Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ── ENQUIRY SCHEMA ──
const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  service: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Enquiry = mongoose.model("Enquiry", enquirySchema);

// ── HEALTH CHECK ──
app.get("/", (req, res) => {
  res.json({ status: "PrintVista API is running ✓" });
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
    const enquiry = new Enquiry({
      name,
      company,
      phone,
      email,
      service,
      message,
    });

    await enquiry.save();

    res.status(200).json({
      success: true,
      message: "Enquiry received! We'll get back to you within 24 hours.",
    });

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save enquiry. Please try again or call us directly.",
    });
  }
});

// ── VIEW ALL ENQUIRIES (simple admin endpoint) ──
app.get("/api/enquiries", async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch enquiries." });
  }
});

// ── START SERVER ──
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});