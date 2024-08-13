import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatMember } from './entities/chat-member.entity';
import { ChatLog } from './entities/chat-log.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { ChatImage } from './entities/chat-image.entity';
import { AwsModule } from 'src/aws/aws.module';
import { Point } from 'src/point/entities/point.entity';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRoom,
      ChatMember,
      ChatLog,
      User,
      ChatImage,
      Point,
    ]),
    UserModule,
    AuthModule,
    AwsModule,
    RedisModule
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
