import { getAnalyticsDB } from "../../config/index.ts";

const mongoose = require("mongoose");

const UrlDailyAnalyticsSchema = new mongoose.Schema(
  {
    shortCode: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    dailyClicks: {
      type: Number,
      default: 0,
    },
    ips: [
      {
        address: { type: String, required: true },
        count: { type: Number, default: 1 },
      },
    ],
    devices: [
      {
        type: { type: String, required: true },
        count: { type: Number, default: 1 },
      },
    ],
    userAgents: [
      {
        browser: { type: String, required: true },
        count: { type: Number, default: 1 },
      },
    ],
    customData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

UrlDailyAnalyticsSchema.index(
  { publicId: 1, date: 1 },
  { unique: true }
);

module.exports = getAnalyticsDB().model(
  "UrlDailyAnalytics",
  UrlDailyAnalyticsSchema
);