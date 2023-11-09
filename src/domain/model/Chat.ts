import { Contact } from '@exporter/src/domain/model/Contact'

export class Chat {

  static create(chatId: number, userId: number, contact: Contact): Chat {
    return new Chat(chatId, userId, contact)
  }

  private constructor(
    /** WhatsApp chat unique identifier. */
    readonly chatId: number,
    /** WhatsApp user unique identifier. */
    readonly userId: number,
    /** Contact on this chat. */
    readonly contact: Contact
  ) {}

  get displayName(): string {
    return this.contact.displayName
  }
}
