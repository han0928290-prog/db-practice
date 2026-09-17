import { Schema, model, models, type InferSchemaType } from "mongoose";

const postSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export type Post = InferSchemaType<typeof postSchema>;

export default models.Post ?? model("Post", postSchema);
