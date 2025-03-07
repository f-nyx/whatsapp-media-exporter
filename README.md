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
  "contactsFile": "./data/contacts.vcf",
  "outputDir": "./out",
  "contacts": [
    {
      "displayName": "John Doe",
      "phoneNumber": "5491133748596"
    }
  ],
  "groupsNames": ["My Group Chat"]
}
```

The following table describes the available configuration options.

| Field        | Description                                                                            | Required |
|--------------|----------------------------------------------------------------------------------------|----------|
| dataDir      | WhatsApp data directory.                                                               | yes      |
| messagesDb   | Full path to the WhatsApp messages database.                                           | yes      |
| contactsFile | Full path to the VCF file with your contacts exported from the Contacts app.           | yes      |
| outputDir    | Directory to store the contacts directories with their media content.                  | yes      |
| contacts     | An array of Contacts to export.                                                        | yes      |
| groupsNames  | List of group chats names. It supports partial names and matches the first occurrence. | yes      |

By default, if no contacts are defined in the configuration, this application exports ALL contacts. It uses the VCF file
to read the contact names since the WhatsApp database doesn't store contact names, only phone numbers.

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

It generates a tar file and you will find the `msgstore.db` file inside the tar. You can also extract the `key`
file that is inside the tar. Using the `key` file you can decrypt the database backup and you don't need to run
this tool every time you want to synchronize the media files. Look at the _Decrypt WhatsApp Database Backup_ section
for further information.

**WARNING: this tool does not delete your current WhatsApp data, but JUST IN CASE you must do a full backup of your
WhatsApp data directory. If you followed the instructions in the _Copying WhatsApp Data Directory_ section you
should have a full backup already.**

If everything goes wrong and you lose your WhatsApp data, you just need to uninstall WhatsApp, copy the data
back to your phone, and install WhatsApp again. To copy the data back to your phone, you can use the same tool
we used in the _Copying WhatsApp Data Directory_ section:

```shell
python ./src/adbsync.py push [local-data-directory] /sdcard/Android/media/com.whatsapp/WhatsApp
```

## Decrypt WhatsApp Database Backup (non-root)

If you have the WhatsApp `key` file to encrypt/decrypt the database, you don't need to make a full backup every time
you want to synchronize the media files. Using [wa-crypt-tools](https://github.com/ElDavoo/wa-crypt-tools) you can just
decrypt the last backup that's stored in the WhatsApp data directory.

1. Clone the `wa-crypt-tools` repository
2. Locate the `msgstore.db.crypt14` file in the `Databases/` directory inside the WhatsApp data directory
3. Run the following command inside the wa-crypt-tools repository:
   ```
   python3 ./src/wa_crypt_tools/decrypt14_15.py key-file msgstore.db.crypt14 msgstore-decrypted.db
   ```

Now you can use the `msgstore-decrypted.db` to run this application.

## TODO

* run the application as a proper binary app
