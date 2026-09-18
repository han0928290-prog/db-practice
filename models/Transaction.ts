import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const transactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

// Speeds up the common "list a project's records sorted by date" query.
transactionSchema.index({ project: 1, date: -1 });

export type Transaction = InferSchemaType<typeof transactionSchema>;
export type TransactionId = Types.ObjectId;

export default models.Transaction ?? model("Transaction", transactionSchema);
