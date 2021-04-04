import { Controller, Logger } from '@nestjs/common';
import { Challenge } from './interfaces/challenge.interface';
import { EventPattern, Payload, Ctx, RmqContext, MessagePattern } from '@nestjs/microservices';
import { ChallengesService } from './challenges.service';

const ackErrors: string[] = ['E11000']

@Controller()
export class ChallengesController {

  constructor(private readonly challengesService: ChallengesService) { }

  private readonly logger = new Logger(ChallengesController.name)

  @EventPattern('create-challenge')
  async createChallenge(@Payload() challenge: Challenge, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()
    try {
      this.logger.log(`challenge: ${JSON.stringify(challenge)}`)
      await this.challengesService.createChallenge(challenge)
      await channel.ack(originalMsg)
    } catch (error) {
      this.logger.log(`error: ${JSON.stringify(error.message)}`)
      const filterAckError = ackErrors.filter(
        ackError => error.message.includes(ackError))
      if (filterAckError.length > 0) {
        await channel.ack(originalMsg)
      }
    }
  }

  @MessagePattern('get-challenges')
  async getChallenges(
    @Payload() data: any,
    @Ctx() context: RmqContext
  ): Promise<Challenge[] | Challenge> {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()
    try {
      const { idPlayer, _id } = data
      this.logger.log(`data: ${JSON.stringify(data)}`)
      if (idPlayer) {
        return await this.challengesService.getChallengesByPlayer(idPlayer);
      } else if (_id) {
        return await this.challengesService.getChallengeByID(_id)
      } else {
        return await this.challengesService.getAllChallenges();
      }
    } finally {
      await channel.ack(originalMsg)
    }
  }

  @EventPattern('update-challenge')
  async updateChallenge(
    @Payload() data: any,
    @Ctx() context: RmqContext
  ) {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()
    try {
      this.logger.log(`data: ${JSON.stringify(data)}`)
      const _id: string = data._id
      const challenge: Challenge = data.challenge
      await this.challengesService.updateChallenge(_id, challenge)
      await channel.ack(originalMsg)
    } catch (error) {
      const filterAckError = ackErrors.filter(
        ackError => error.message.includes(ackError))
      if (filterAckError.length > 0) {
        await channel.ack(originalMsg)
      }
    }
  }

  @EventPattern('update-challenge-match')
  async updateChallengeMatch(
    @Payload() data: any,
    @Ctx() context: RmqContext
  ) {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()
    try {
      this.logger.log(`idPartida: ${data}`)
      const idPartida: string = data.idMatch
      const challenge: Challenge = data.challenge
      await this.challengesService.updateChallengeMatch(idPartida, challenge)
      await channel.ack(originalMsg)
    } catch (error) {
      const filterAckError = ackErrors.filter(
        ackError => error.message.includes(ackError))
      if (filterAckError.length > 0) {
        await channel.ack(originalMsg)
      }
    }
  }

  @EventPattern('delete-challenge')
  async deleteChallenge(@Payload() challenge: Challenge, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()
    try {
      await this.challengesService.deleteChallenge(challenge)
      await channel.ack(originalMsg)
    } catch (error) {
      this.logger.log(`error: ${JSON.stringify(error.message)}`)
      const filterAckError = ackErrors.filter(
        ackError => error.message.includes(ackError))
      if (filterAckError.length > 0) {
        await channel.ack(originalMsg)
      }
    }
  }

  @MessagePattern('get-challenges-realized')
  async getChallengesRealized(
      @Payload() payload: any, 
      @Ctx() context: RmqContext
      ): Promise<Challenge[] | Challenge> {
      const channel = context.getChannelRef()
      const originalMsg = context.getMessage()
      try {
        const { idCategoria, dataRef } = payload
        this.logger.log(`data: ${JSON.stringify(payload)}`)
         if (dataRef) {
              return await this.challengesService.getChallengesRealizedByDate(idCategoria, dataRef) ;
         } else {
              return await this.challengesService.getChallengesRealized(idCategoria);  
         } 
      } finally {
          await channel.ack(originalMsg)
      }     
  }

}
