const mongoose = require("mongoose");

const foodSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    energy: {
      type: Number,
      required: true,
    },
    protien: {
      type: Number,
      required: true,
    },
    carbohydrates: {
      type: Number,
      required: true,
    },
    fat: {
      type: Number,
      required: true,
    },
    sugar: {
      type: Number,
      required: true,
    },
    fiber: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const foodModel = mongoose.model("foods", foodSchema);

module.exports = foodModel;
