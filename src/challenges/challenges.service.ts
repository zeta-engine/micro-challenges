import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Challenge } from './interfaces/challenge.interface';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { ChallengeStatus } from './interfaces/challenge.enum';
import * as momentTimezone from 'moment-timezone'

@Injectable()
export class ChallengesService {

  constructor(
    @InjectModel('Challenge') private readonly challengeModel: Model<Challenge>,
  ) { }

  private readonly logger = new Logger(ChallengesService.name)

  async createChallenge(challenge: Challenge): Promise<Challenge> {
    try {
      const challengeCreated = new this.challengeModel(challenge)
      challengeCreated.datetimeRequest = new Date()
      /*
          Quando um challenge for criado, definimos o status 
          challenge como pendente
      */
      challengeCreated.status = ChallengeStatus.PENDING
      this.logger.log(`challengeCreated: ${JSON.stringify(challengeCreated)}`)
      return await challengeCreated.save()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }

  }

  async getAllChallenges(): Promise<Challenge[]> {
    try {
      return await this.challengeModel.find().exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async getChallengesByPlayer(_id: any): Promise<Challenge[] | Challenge> {
    try {
      return await this.challengeModel.find()
        .where('players')
        .in(_id)
        .exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }

  }

  async getChallengeByID(_id: any): Promise<Challenge> {
    try {
      return await this.challengeModel.findOne({ _id })
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }

  }

  async updateChallenge(_id: string, challenge: Challenge): Promise<void> {
    try {
      /*
          Atualizaremos a data da resposta quando o status do challenge 
          vier preenchido 
      */
      challenge.datetimeResponse = new Date()
      await this.challengeModel.findOneAndUpdate({ _id }, { $set: challenge }).exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async updateChallengeMatch(idMatch: string, challenge: Challenge): Promise<void> {
    try {
      /*
          Quando uma partida for registrada por um usuário, mudaremos o 
          status do challenge para realizado
      */
      challenge.status = ChallengeStatus.REALIZED
      challenge.match = idMatch
      await this.challengeModel.findOneAndUpdate({ _id: challenge._id }, { $set: challenge }).exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async deleteChallenge(challenge: Challenge): Promise<void> {
    try {
      const { _id } = challenge
      /*
          Realizaremos a deleção lógica do challenge, modificando seu status para
          CANCELADO
      */
      challenge.status = ChallengeStatus.CANCELLED
      this.logger.log(`challenge: ${JSON.stringify(challenge)}`)
      await this.challengeModel.findOneAndUpdate({ _id }, { $set: challenge }).exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async getChallengesRealized(idCategory: string): Promise<Challenge[]> {
    try {
      return await this.challengeModel.find()
        .where('category')
        .equals(idCategory)
        .where('status')
        .equals(ChallengeStatus.REALIZED)
        .exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }

  async getChallengesRealizedByDate(idCategory: string, dataRef: string): Promise<Challenge[]> {
    try {
      const dataRefNew = `${dataRef} 23:59:59.999`

      return await this.challengeModel.find()
        .where('categoria')
        .equals(idCategory)
        .where('status')
        .equals(ChallengeStatus.REALIZED)
        .where('datetime')
        // .lte(momentTimezone(dataRefNew).tz('UTC').format('YYYY-MM-DD HH:mm:ss.SSS+00:00'))
        .exec()
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }
  }



}
