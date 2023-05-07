# WhatsApp Media Exporter

This application reads the WhatsApp database and incrementally organizes media files by contact.

WhatsApp stores all media files for all contacts in the same directory, and there is no way to export all media
files for a single contact at once. The relationship between contacts and files is stored in the WhatsApp messages
database.

This project reads the WhatsApp database and copies the media files from the WhatsApp data directory to contact specific
directories. You need to copy both the database and the data directory from the phone to your computer. The following
table shows the location and description of the required files and directories. In order to get the database file you
need root access, if you don't have root access to your phone check the instructions below.

| Description             | Location                                      | Requires Root |
|-------------------------|-----------------------------------------------|---------------|
| WhatsApp messages DB    | /data/data/com.whatsapp/databases/msgstore.db | yes           |
| WhatsApp data directory | /sdcard/Android/media/com.whatsapp/WhatsApp   | no            |

Once you have both the messages database file (`msgstore.db`) and the data directory in your computer, you need to
create the following JSON configuration file:

```json
{
  "dataDir": "./data/WhatsApp",
  "messagesDb": "./data/msgstore.db",
  "outputDir": "./out",
  "contacts": [
    {
      "displayName": "John Doe",
      "phoneNumber": "5491133748596"
    }
  ]
}
```

The following table describes the available configuration options.

| Field      | Description                                                           | Required |
|------------|-----------------------------------------------------------------------|----------|
| dataDir    | WhatsApp data directory.                                              | yes      |
| messagesDb | Full path to the WhatsApp messages database.                          | yes      |
| outputDir  | Directory to store the contacts directories with their media content. | yes      |
| contacts   | An array of Contacts to export.                                       | yes      |

Note that by default this application does not export ALL contacts. There are two reasons for that. The first reason is
that the WhatsApp messages database has no contact names, only phone numbers. Creating the contacts directories using
the phone number instead of a name will make it difficult to find contacts, which is the main goal of this project: it
aims to simplify the relationship between contacts and media files. The second reason is a design decision: most times
you don't care about most of your contacts, so it is better to restrict the content you want to export to the relevant
contacts.

The export process __copies__ the files from the WhatsApp data directory into the contacts directories. It means that
in the worst case you will need `sizeOf(dataDir)` available space in your device to run this application.

Once you have the configuration file (let's call it `exporter.json`), you can run the application using the
following command:

```shell
npm start -- --config-file exporter.json
```

## Copying WhatsApp Data Directory

I recommend [this rsync implementation](https://github.com/jb2170/better-adb-sync) to copy the data directory
from the phone to your computer. It is really fast, it works over ADB and each run is incremental. You don't need
root access to run this script. Just clone the repository and run the following command inside the repository root
directory:

```shell
python ./src/adbsync.py pull /sdcard/Android/media/com.whatsapp/WhatsApp [dataDir]
```

## Copying WhatsApp Database (root)

If your device is rooted, you need to copy the database file from the data partition to your computer. You can
use a couple of ADB commands for that.

1. run `adb shell` and once inside the phone's shell execute the following commands:

```
jasmine_sprout:/ $ su
jasmine_sprout:/ # cp /data/data/com.whatsapp/databases/msgstore.db /sdcard/msgstore.db
jasmine_sprout:/ # exit
jasmine_sprout:/ $ exit
```

2. Copy the database from the phone to your computer:

```
adb pull /sdcard/msgstore.db [local-db-path]
```

## Copying WhatsApp Database (non-root)

If your device is not rooted (most devices are not), you need to use a tool to extract the WhatsApp database.
[WhatsApp-Key-Database-Extractor](https://github.com/YuvrajRaghuvanshiS/WhatsApp-Key-Database-Extractor) is a
tool that uses an old version of WhatsApp to trick the operating system. It installs an old version of WhatsApp in
your phone without deleting your existing data, and then it uses an old backup feature to copy the unencrypted
database from the phone to your computer. It restores your current version of WhatsApp at the end.

**WARNING: this tool does not delete your current WhatsApp data, but JUST IN CASE you must do a full backup of your
WhatsApp data directory. If you followed the instructions in the _Copying WhatsApp Data Directory_ section you
should have a full backup already.**

If everything goes wrong and you lose your WhatsApp data, you just need to uninstall WhatsApp, copy the data
back to your phone, and install WhatsApp again. To copy the data back to your phone, you can use the same tool
we used in the _Copying WhatsApp Data Directory_ section:

```shell
python ./src/adbsync.py push [local-data-directory] /sdcard/Android/media/com.whatsapp/WhatsApp
```

## TODO

* run the application as a proper binary app
