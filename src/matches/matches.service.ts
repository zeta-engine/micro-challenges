import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match } from './interfaces/match.interface'
import { Challenge } from '../challenges/interfaces/challenge.interface'
import { RpcException } from '@nestjs/microservices';
import { ClientProxySmartRanking } from '../proxyrmq/client-proxy'

@Injectable()
export class MatchesService {

  constructor(
    @InjectModel('Match') private readonly partidaModel: Model<Match>,
    private clientProxySmartRanking: ClientProxySmartRanking
  ) { }

  private readonly logger = new Logger(MatchesService.name)

  private clientDesafios =
    this.clientProxySmartRanking.getClientProxyChallengeInstance()
  
  private clientRankings =
    this.clientProxySmartRanking.getClientProxyRankingsInstance()

  async criarPartida(match: Match): Promise<Match> {
    try {
      /*
          Iremos persistir a match e logo em seguida atualizaremos o
          challenge. O challenge irá receber o ID da match e seu status
          será modificado para REALIZADO.
      */
      const matchCreated = new this.partidaModel(match)
      this.logger.log(`matchCreated: ${JSON.stringify(matchCreated)}`)
      /*
          Recuperamos o ID da match
      */
      const result = await matchCreated.save()
      this.logger.log(`result: ${JSON.stringify(result)}`)
      const idMatch = result._id
      /*
          Com o ID do challenge que recebemos na requisição, recuperamos o 
          challenge.
      */
      const challenge: Challenge = await this.clientDesafios
        .send('get-challenges',
          { idPlayer: '', _id: match.challenge })
        .toPromise()
      /*
          Acionamos o tópico 'atualizar-challenge-match' que será
          responsável por atualizar o challenge.
      */
      await this.clientDesafios
        .emit('update-challenge-match',
          { idMatch: idMatch, challenge: challenge })
        .toPromise()

        /*
          Envia partida para processamento de ranking
        */

      return await this.clientRankings.emit('process-match', {idMatch: idMatch, match: match}).toPromise();

    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)
    }

  }
}
