import { DataSource } from '@exporter/src/utils/DataSource'
import { Contact } from '@exporter/src/domain/model/Contact'
import { Chat } from '@exporter/src/domain/model/Chat'
import { MediaItem } from '@exporter/src/domain/model/MediaItem'
import { User } from '@exporter/src/domain/model/User'
import { createLogger } from '@exporter/src/utils/log'

const logger = createLogger('WhatsAppRepository')

export class WhatsAppRepository {
  constructor(
    /** Data source to read WhatsApp database. */
    private readonly messageDb: DataSource
  ) {}

  async findChats(contacts: Contact[]): Promise<Chat[]> {
    logger.info(`finding chats for ${contacts.length} contacts`)

    const users: User[] = await this.findUsers(contacts.map((contact) => contact.phoneNumber))
    const usersContactMap = users.reduce((usersContact: any, user: User) => {
      if (usersContact[user.id]) {
        return usersContact
      }
      usersContact[user.id] = contacts.find((contact) => user.phoneNumber === contact.phoneNumber)
      return usersContact
    }, {})

    const chats = await this.messageDb.find(
      'select _id, jid_row_id from chat where jid_row_id in (:usersIds)'.replace(
        ':usersIds',
        users.map((user: User) => user.id).join(',')
      )
    )

    return chats.map((chat: any) => Chat.create(chat._id, chat.jid_row_id, usersContactMap[chat.jid_row_id]))
  }

  async findMediaItems(chat: Chat): Promise<MediaItem[]> {
    logger.info(`finding media items for contact: ${chat.contact.phoneNumber}`)

    const mediaItems = await this.messageDb.find(
      'select chat_row_id, message_row_id, media_name, file_path, file_size, mime_type, file_hash ' +
        'from message_media where chat_row_id = ? group by file_path',
      chat.chatId
    )

    return mediaItems.map(MediaItem.restore)
  }

  async findUsers(phoneNumbers: number[]): Promise<User[]> {
    logger.info('finding users')
    return (
      await this.messageDb.find(
        'select _id, user from jid where user in (:phoneNumbers)'.replace(':phoneNumbers', phoneNumbers.join(','))
      )
    ).map(User.restore)
  }
}
