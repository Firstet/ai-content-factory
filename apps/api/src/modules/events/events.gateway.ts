import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WSEvent, WSJobProgressPayload } from '@acf/shared';

/**
 * EventsGateway — Real-time WebSocket gateway for job progress.
 * Clients subscribe to a videoId room to receive live updates.
 */
@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/events',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:video')
  handleSubscribe(client: Socket, videoId: string) {
    client.join(`video:${videoId}`);
    this.logger.debug(`Client ${client.id} subscribed to video ${videoId}`);
  }

  @SubscribeMessage('unsubscribe:video')
  handleUnsubscribe(client: Socket, videoId: string) {
    client.leave(`video:${videoId}`);
  }

  /**
   * Emit job progress to all clients watching a video.
   * Called by BullMQ workers via EventsService.
   */
  emitJobProgress(payload: WSJobProgressPayload) {
    this.server
      .to(`video:${payload.videoId}`)
      .emit(WSEvent.JOB_PROGRESS, payload);
  }

  emitJobCompleted(videoId: string, data: unknown) {
    this.server.to(`video:${videoId}`).emit(WSEvent.JOB_COMPLETED, data);
  }

  emitJobFailed(videoId: string, error: string) {
    this.server.to(`video:${videoId}`).emit(WSEvent.JOB_FAILED, { error });
  }

  emitPipelineCompleted(videoId: string, data: unknown) {
    this.server.to(`video:${videoId}`).emit(WSEvent.PIPELINE_COMPLETED, data);
  }
}
