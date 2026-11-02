import mongoose, { Schema, Document, Model } from "mongoose";

export interface IItem extends Document {
  title: string;
  description?: string;
  createdAt: Date;
}

const ItemSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation during hot module reloading in development
const Item: Model<IItem> =
  mongoose.models.Item || mongoose.model<IItem>("Item", ItemSchema);

export default Item;
