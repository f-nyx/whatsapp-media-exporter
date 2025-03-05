import { DataSource } from '@exporter/src/utils/DataSource'
import { Contact } from '@exporter/src/domain/model/Contact'
import { Chat } from '@exporter/src/domain/model/Chat'
import { MediaItem } from '@exporter/src/domain/model/MediaItem'
import { User } from '@exporter/src/domain/model/User'
import { createLogger } from '@exporter/src/utils/log'
import { ContactService } from '@exporter/src/domain/ContactService'

const logger = createLogger('WhatsAppRepository')

export class WhatsAppRepository {
  constructor(
    /** Data source to read WhatsApp database. */
    private readonly messageDb: DataSource,
    private readonly contactService: ContactService,
  ) {}

  async findChats(
    contacts: Contact[],
    groupsNames: string[]
  ): Promise<Chat[]> {
    logger.info(`finding chats for ${contacts.length} contacts`)

    const users: User[] = await this.findUsers(contacts.map((contact) => contact.phoneNumber as number))
    const usersContactMap = users.reduce((usersContact: any, user: User) => {
      if (usersContact[user.id]) {
        return usersContact
      }
      usersContact[user.id] = this.contactService.findByPhoneNumber(user.phoneNumber)
      return usersContact
    }, {})

    const chats = await this.messageDb.find(
      'select _id, jid_row_id from chat where jid_row_id in (:usersIds) and hidden = 0'.replace(
        ':usersIds',
        users.map((user: User) => user.id).join(',')
      )
    )

    const groups = (
      await Promise.all(
        groupsNames.map(async (groupName) => {
          const records = await this.messageDb.find(
            `select _id, jid_row_id, subject from chat where subject like '%${groupName}%'`
          )
          if (records.length === 0) {
            logger.info(`group not found: ${groupName}`)
          }
          return records
        })
      )
    ).flat()

    return [...chats, ...groups].map((chat: any) => {
      const contact = usersContactMap[chat.jid_row_id] ?? Contact.create(chat.subject)
      if (!usersContactMap[chat.jid_row_id] && !chat.subject) {
        return undefined
      }
      return Chat.create(chat._id, chat.jid_row_id, contact)
    }).filter((chat) => chat !== undefined) as Chat[]
  }

  async findMediaItems(chat: Chat): Promise<MediaItem[]> {
    logger.info(`finding media items for contact/chat: ${chat.displayName}`)

    const mediaItems = await this.messageDb.find(
      'select chat_row_id, message_row_id, media_name, file_path, file_size, mime_type, file_hash ' +
        'from message_media where chat_row_id = ? group by file_path',
      chat.chatId
    )

    return mediaItems.map(MediaItem.restore)
  }

  async findUsers(phoneNumbers: number[]): Promise<User[]> {
    logger.info('finding users')
    const selectAll = 'select _id, user from jid order by _id'
    const selectSome = 'select _id, user from jid where user in (:phoneNumbers) order by _id'.replace(':phoneNumbers', phoneNumbers.join(','))

    if (phoneNumbers.length > 0) {
      return (await this.messageDb.find(selectSome)).map(User.restore)
    } else {
      return (await this.messageDb.find(selectAll)).map(User.restore)
    }
  }
}
