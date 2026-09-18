import { Schema, model, models, type InferSchemaType } from "mongoose";

const projectSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export type Project = InferSchemaType<typeof projectSchema>;

export default models.Project ?? model("Project", projectSchema);
