import mongoose, {Schema} from "mongoose";
import mongooseAggrigatePaginate from "mongoose-aggrigate-paginate-v2";


const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",

    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
)

commentSchema.plugin(mongooseAggrigatePaginate)

export const Comment = mongoose.model("Comment", commentSchema)









