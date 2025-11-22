import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChannelsService } from './channels.service';
import { MessagesService } from './messages.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ChatController],
    providers: [ChatGateway, ChannelsService, MessagesService],
    exports: [ChannelsService, MessagesService],
})
export class ChatModule { }
