import * as mongoose from 'mongoose';

export const ChallengeSchema = new mongoose.Schema({
  datetime: { type: Date },
  status: { type: String },
  datetimeRequest: { type: Date },
  datetimeResponse: { type: Date },
  //solicitante: {type: mongoose.Schema.Types.ObjectId, ref: "Jogador"},
  requester: { type: mongoose.Schema.Types.ObjectId },
  //categoria: {type: String },
  category: { type: mongoose.Schema.Types.ObjectId },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    //ref: "Jogador"
  }],
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match"
  },
}, { timestamps: true, collection: 'challenges' })

