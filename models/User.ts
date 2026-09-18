import { Schema, model, models, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user", required: true },
    avatarUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;

export default models.User ?? model("User", userSchema);
