import * as fs from 'node:fs/promises'
import { existsSync } from 'fs'
import { Contact } from '@exporter/src/domain/model/Contact'
import vcard from 'vcf'
import vCard from 'vcf'

export class ContactService {
  private contacts: Contact[]

  constructor(
    private readonly contactsFile: string
  ) {
    this.contacts = []
  }

  async loadContacts() {
    if (!existsSync(this.contactsFile)) {
      throw new Error(`contacts file not found: ${this.contactsFile}`)
    }
    const data = await fs.readFile(this.contactsFile, 'utf8')
    const vCards: vCard[] = vcard.parse(data)
    this.contacts = vCards.map((vCard) => {
      const normalizedPhone = (vCard.data.tel?.valueOf()?.toString() ?? '0').replace(/-/g, '').trim()
      const contactName = vCard.data.fn?.valueOf()?.toString() ?? ''
      const chars = contactName.match(/(=\d{2})+?/gi)
      let normalizedContactName = contactName
      if (chars && chars.length) {
        normalizedContactName = chars.map((char) => String.fromCharCode(parseInt(char.substring(1), 16))).join('')
      }
      return Contact.create(normalizedContactName, parseInt(normalizedPhone, 10))
    })
  }

  findByPhoneNumber(phoneNumber: string): Contact | undefined {
    return this.contacts.find((contact) => contact.phoneNumber && phoneNumber.endsWith(contact.phoneNumber.toString()))
  }
}
