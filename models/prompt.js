import { Schema, model, models } from "mongoose";

const PromptSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  prompt: {
    type: String,
    required: [true, "Prompt is reqired."],
  },
  tag: {
    type: String,
    required: [true, "Tag is reqired."],
  }
})

const Prompt = models.Prompt || model("Prompt", PromptSchema);

export default Prompt;