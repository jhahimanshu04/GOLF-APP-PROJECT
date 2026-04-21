import mongoose from 'mongoose';

const charitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Charity name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description too long'],
    },
    shortDescription: {
      type: String,
      maxlength: [200, 'Short description too long'],
    },
    logo: { type: String, default: null },
    images: [{ type: String }],
    website: { type: String, default: null },

    // Events like charity golf days
    events: [
      {
        title: { type: String, required: true },
        description: { type: String },
        date: { type: Date, required: true },
        location: { type: String },
        imageUrl: { type: String },
      },
    ],

    // Stats
    totalContributions: { type: Number, default: 0 },
    subscriberCount: { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    category: {
      type: String,
      enum: ['health', 'education', 'environment', 'community', 'sports', 'other'],
      default: 'other',
    },

    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Auto-generate slug from name
charitySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Charity = mongoose.model('Charity', charitySchema);
export default Charity;
