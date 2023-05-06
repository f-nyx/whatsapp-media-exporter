# WhatsApp Media Exporter

This application reads the WhatsApp database and organizes contacts media files incrementally.

WhatsApp stores all media files for all contacts in the same directory, and there is no way to export all the media
files for a single contact at once. The relationship between contacts and files in these huge directories is stored in
the WhatsApp messages database.

This project reads the WhatsApp database and copies the media files from the WhatsApp data directory to contact
directories. You need to copy both the database and the data directory from the phone to your computer. The following
table shows the location and description of the required files and directories.

| Description             | Location                                      | Requires Root |
|-------------------------|-----------------------------------------------|---------------|
| WhatsApp messages DB    | /data/data/com.whatsapp/databases/msgstore.db | yes           |
| WhatsApp data directory | /sdcard/Android/media/com.whatsapp/WhatsApp   | no            |

I recommend [this rsync implementation](https://github.com/jb2170/better-adb-sync) to copy the data directory
from the phone to the computer. It is really fast, it works over ADB and each run is incremental.

Once you have both the messages database and the data directory in your computer, you need to create the following
JSON configuration file:

```json
{
  "dataDir": "./data/WhatsApp",
  "outputDir": "./out",
  "messagesDb": "./data/msgstore.db",
  "contacts": [
    {
      "displayName": "John Doe",
      "phoneNumber": "5491133748596"
    }
  ]
}
```

The following table describes the available configuration options.

| Field     | Description                                                           | Required |
|-----------|-----------------------------------------------------------------------|----------|
| dataDir   | WhatsApp data directory.                                              | yes      |
| outputDir | Directory to store the contacts directories with their media content. | yes      |
| contacts  | An array of Contacts to export.                                       | yes      |

Note that by default this application does not export ALL contacts. There are two reasons for that. The first reason is
that the WhatsApp messages database has no contact names, only phone numbers. Creating the contacts directories using
the phone number instead of a name will make it difficult to find contacts, which is the main goal of this project: it
aims to simplify the relationship between contacts and media files. The second reason is a design decision: most times
you don't care about most of your contacts, so it is better to restrict the content you want to export to the relevant
contacts.

The export process __copies__ the files from the WhatsApp data directory into the contacts directory. It means that
in the worst case you will need `sizeOf(dataDir)` available space in your device to run this application.

Once you have the configuration file (let's call it `exporter.json`), you can run the application using the
following command: `npm start -- --config-file exporter.json`

## TODO

* decrypt encrypted database using WhatsApp encryption key
* run the application as a proper binary app
