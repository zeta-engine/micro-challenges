import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChallengesModule } from './challenges/challenges.module';
import { MatchesModule } from './matches/matches.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://root:root@mongo:27017/sr-challenges',
      { authSource: 'admin', useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false }
    ),
    ChallengesModule,
    MatchesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
