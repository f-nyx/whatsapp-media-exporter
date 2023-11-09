export class Contact {
  static create(displayName: string, phoneNumber?: number): Contact {
    return new Contact(displayName, phoneNumber)
  }

  static restore(contact: any): Contact {
    return new Contact(contact.displayName, contact.phoneNumber)
  }

  private constructor(
    /** Contact display name. */
    readonly displayName: string,
    /** Contact phone number, if any. This is undefined for group chats. */
    readonly phoneNumber?: number,
  ) {}
}
