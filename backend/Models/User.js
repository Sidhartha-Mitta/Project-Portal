import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ✅ Profile schema with defaults
const profileSchema = new mongoose.Schema(
  {
    bio: { type: String, default: "This is a sample bio." },
    linkedin: { type: String, default: "https://linkedin.com/in/example" },
    github: { type: String, default: "https://github.com/example" },
    skills: { type: [String], default: ["React", "Node.js"] },
    rating: { type: Number, default: 3 },
    experience: { type: String, default: "No experience yet" },
    education: { type: String, default: "B.Tech CSE - RGUKT Basar" },
    designation: { type: String, default: "Student" },
    branch: { type: String, default: "CSE" },
    studentId: { type: String, default: "B21CS0000" },
    // Resume and additional student details
    resume: {
      filename: { type: String },
      url: { type: String },
      uploadedAt: { type: Date, default: Date.now }
    },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    cgpa: { type: Number, min: 0, max: 10 },
    yearOfStudy: { type: String, enum: ["1st", "2nd", "3rd", "4th", "Graduate"], default: "3rd" },
    portfolio: { type: String, default: "" },
    certifications: [{
      name: String,
      issuer: String,
      date: Date,
      url: String
    }],
    projects: [{
      title: String,
      description: String,
      technologies: [String],
      githubUrl: String,
      liveUrl: String,
      completedAt: Date
    }],
    // Industry-specific fields
    companyName: { type: String, default: "" },
    companyWebsite: { type: String, default: "" },
    companySize: { type: String, enum: ["1-10", "11-50", "51-200", "201-500", "500+"], default: "1-10" },
    industry: { type: String, default: "" }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "industry", "admin"],
      required: true,
    },
    avatar: { type: String, default: "" },
    profile: { type: profileSchema, default: () => ({}) }, // ✅ defaults ensured
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Hide password when returning JSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
