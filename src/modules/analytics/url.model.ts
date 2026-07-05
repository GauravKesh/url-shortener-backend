import { getAnalyticsDB } from "../../config/index.ts";
import mongoose from "mongoose";

const UrlAnalyticsSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    shortCode: {
      type: String,
      required: true,
      index: true,
    },

    totalClicks: {
      type: Number,
      default: 0,
      min: 0,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = getAnalyticsDB().model("UrlAnalytics", UrlAnalyticsSchema);