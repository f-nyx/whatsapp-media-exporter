import * as fs from 'node:fs/promises'
import { existsSync } from 'fs'
import { Contact } from '@exporter/src/domain/model/Contact'
import vcard from 'vcf'
import vCard from 'vcf'
import { decode } from 'quoted-printable'

export class ContactService {
  public contacts: Contact[]

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
    const normalizedData = data.replaceAll("\r", "").split("\n").reduce((prev, line) => {
      if (line.startsWith("=")) {
        return prev.slice(0, prev.length - 2) + line.slice(1) + "\r\n"
      } else {
        return prev + line + "\r\n"
      }
    }, "")

    const vCards: vCard[] = vcard.parse(normalizedData)
    this.contacts = vCards.map((vCard) => {
      let normalizedPhone
      if (Array.isArray(vCard.data.tel)) {
        normalizedPhone = (vCard.data.tel[0]?.valueOf()?.toString() ?? '0').replace(/-/g, '').trim()
      } else {
        normalizedPhone = (vCard.data.tel?.valueOf()?.toString() ?? '0').replace(/-/g, '').trim()
      }
      const nameProperty = (vCard.data.fn as any)?.toJSON()

      let normalizedContactName
      if (nameProperty) {
        if (nameProperty[1].encoding?.toLowerCase() === 'quoted-printable') {
          normalizedContactName = Buffer.from(decode(nameProperty[3]), 'latin1').toString()
        } else {
          normalizedContactName = nameProperty[3]
        }

        return Contact.create(normalizedContactName, parseInt(normalizedPhone, 10))
      } else {
        return null
      }
    }).filter((contact) => contact !== null) as Contact[]
  }

  findByPhoneNumber(phoneNumber: string): Contact | undefined {
    return this.contacts.find((contact) => contact.phoneNumber && phoneNumber.endsWith(contact.phoneNumber.toString()))
  }
}
