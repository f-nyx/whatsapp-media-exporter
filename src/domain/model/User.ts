export class User {
  static restore(user: any): User {
    return new User(user._id, user.user)
  }

  private constructor(
    /** WhatsApp unique identifier. */
    readonly id: number,
    /** User phone number. */
    readonly phoneNumber: number
  ) {}
}
