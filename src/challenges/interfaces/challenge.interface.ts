import { ChallengeStatus } from "./challenge.enum";
import { Document } from 'mongoose';

export interface Challenge extends Document {
  datetime: Date,
  status: ChallengeStatus,
  datetimeRequest: Date,
  datetimeResponse: Date,
  requester: string,
  category: string,
  players: string[],
  match?: string,
}