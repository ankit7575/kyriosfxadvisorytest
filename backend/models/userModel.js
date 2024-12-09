const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const { Schema } = mongoose;

// Helper function to generate a 7-character referral ID
const generateReferralId = () => {
  return `REF-${Math.random().toString(36).substr(2, 7).toUpperCase()}`; // Generates a 7-character referral ID
};

// User schema definition
const userSchema = new Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxLength: [100, 'Name cannot be longer than 100 characters'],
    minLength: [3, 'Name must be at least 3 characters long']
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true,
    validate: {
      validator: function(v) {
        return validator.isEmail(v); // Use validator to check if email is valid
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  emailVerified: { 
    type: Boolean, 
    default: false
  },
  phone: { 
    type: String, 
    required: true, 
    trim: true, 
    
  },
  
  password: { 
    type: String, 
    required: true, 
    minLength: [6, 'Password must be at least 6 characters long'],
  },
  referralId: { 
    type: String, 
    unique: true, 
    default: generateReferralId,  // Automatically generates a 7-character referral ID
    trim: true, 
    minLength: [7, 'Referral ID must be at least 7 characters long']
  },
  referralbyId: { 
    type: String, 
    default: null, 
    trim: true 
  },
  otpVerified: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: ['active', 'hold'], 
    default: 'hold' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Number,
  },
  referral: {
    directReferral: [{
      user: { type: String, required: true }, // Store user name directly
      name:{ type: String, required: false },
      history: [{
        fortnightlyProfit: [{
          history: [{
            date: { type: Date, required: true },
            fortnightlyProfit: { type: Number, required: true },
            directIncentive: { type: Number, required: true },
            profitEntryId: { type: String, default: uuidv4 } // Added profitEntryId
          }]
        }],
        createdAt: { type: Date, required: true }
      }]
    }],
    stage2Referral: [{
      user: { type: String, required: true }, // Store user name directly
      name:{ type: String, required: false },
      history: [{
        fortnightlyProfit: [{
          history: [{
            date: { type: Date, required: true },
            fortnightlyProfit: { type: Number, required: true },
            stage2Incentive: { type: Number, required: true },
            profitEntryId: { type: String, default: uuidv4 } // Added profitEntryId
          }]
        }],
        createdAt: { type: Date, required: true }
      }]
    }],
    stage3Referral: [{
      user: { type: String, required: true }, // Store user name directly
      name:{ type: String, required: false },
      history: [{
        fortnightlyProfit: [{
          history: [{
            date: { type: Date, required: true },
            fortnightlyProfit: { type: Number, required: true },
            stage3Incentive: { type: Number, required: true },
            profitEntryId: { type: String, default: uuidv4 } // Added profitEntryId
          }]
        }],
        createdAt: { type: Date, required: true }
      }]
    }]
  },
  fortnightlyProfit: [{
    history: [{
      profitEntryId: { type: String, default: uuidv4 }, // Added profitEntryId
      date: { type: Date, required: true },
      fortnightlyProfit: { type: Number, required: true }
    }]
  }],
  profile: {
    dob: { 
      type: Date 
    },
    country: { 
      type: String, 
      trim: true 
    },
    mt5Id: { 
      type: String, 
      unique: true, 
      sparse: true, 
      trim: true 
    },
    brokerName: { 
      type: String, 
      trim: true 
    },
    plan: { 
      type: String, 
      enum: ['plana', 'planb', 'planc'],
      default: null // Set a default plan
    },
    capital: { 
      type: Number,
      default: 0,
    },
  },
  verification: {
    adminVerified: { 
      type: Boolean, 
      default: false 
    },
    verificationStatus: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
  },

  role: {
    type: String,
    enum: ['admin', 'referral', 'trader'],
    default: 'referral',
  },
  payoutRequest: {
    history: [{
      status: { 
        type: String, 
        enum: ['pending', 'paid'], 
        default: 'pending' 
      },
      amountRequested: { 
        type: Number 
      },
      dateRequested: { 
        type: Date, 
        default: Date.now 
      },
    }],
  },
  passwordResetToken: String,  
  passwordResetExpires: Date,  
});

// User registration logic (make sure password is hashed)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
      return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});




// Compare Password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};


// JWT generation method on User schema
userSchema.methods.getJWTToken = function () {
  // Generate JWT token for the user
  const token = jwt.sign(
    { id: this._id }, // Include the user ID in the payload
    process.env.JWT_SECRET, // Use your secret from environment variable
    { expiresIn: process.env.JWT_EXPIRE } // Set token expiration time (e.g., 1 day)
  );
  return token;
};

// Method to generate JWT token for user authentication
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id, email: this.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token;
};

// Method to generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;  // Token valid for 10 minutes
  return resetToken;
};

// Increment login attempts after failed login
userSchema.methods.incrementLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
  }
  return this.save();
};



// Refactor addReferral method to ensure the user is not added multiple times
userSchema.methods.addReferral = async function (referralUser) {
  if (referralUser) {
    // Direct Referral
    const directReferralExists = this.referral.directReferral.some(ref => ref.user.toString() === referralUser._id.toString());
    if (!directReferralExists) {
      this.referral.directReferral.push({
        user: referralUser._id, // Save the actual userId
        name: referralUser.name, // Save the user name
        history: []  // Initially empty history
      });
    }

    // Stage 2 Referral
    const stage2ReferralExists = referralUser.referral.directReferral.some(ref => ref.user.toString() === this._id.toString());
    if (!stage2ReferralExists) {
      referralUser.referral.stage2Referral.push({
        user: this._id, // Save the userId
        name: this.name, // Save the user name
        history: []  // Initially empty history
      });
    }

    // Stage 3 Referral
    const stage3ReferralExists = referralUser.referral.stage2Referral.some(ref => ref.user.toString() === this._id.toString());
    if (!stage3ReferralExists) {
      referralUser.referral.stage3Referral.push({
        user: this._id, // Save the userId
        name: this.name, // Save the user name
        history: []  // Initially empty history
      });
    }

    await this.save();  // Ensure the user is saved after adding the referral
  }
};


// Reset login attempts after successful login
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.accountLocked = false;
  await this.save();
};
const User = mongoose.model("User", userSchema);
module.exports = User;