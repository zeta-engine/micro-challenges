import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { ChallengeSchema } from './interfaces/challenge.schema'

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Challenge', schema: ChallengeSchema }
  ])],
  providers: [ChallengesService],
  controllers: [ChallengesController]
})
export class ChallengesModule {}
