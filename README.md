# Sync
## Automatic Cloud Syncronisation
Automatically observe and syncronise a local directory with an Amazon AWS S3 Bucket.

#### Problems
- [ ] Buckets currently have no security, public read&write access.
- [ ] Uploader saves into seperate buckets for temporary backups and finals.
- [ ] No monitoring of file changes, then comparison and update.
- [ ] No deleting or flagging of deleted files between stores.

### Dependencies
[Node.js](https://nodejs.org/en/)

### Setup
1. Run `npm install`
2. Define the watch directory in `config.json`.
3. Configure an AWS S3 Bucket and assigning the bucketname to the `AWS.BucketName` property in `config.json`.
4. Run `npm start`
5. The program will initialise, syncronise and is then ready to observe for files.

### Backups
When backups are configured, the watcher will automatically scan for temporary 'working' files and save them to the configured `AWS.BackupBucketName` on S3.