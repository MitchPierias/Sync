# CloudSync
## Automatic File Syncronisation to AWS S3 Buckets
Automatically observes and syncronises a local machine directory with a configured Amazon AWS S3 Bucket.

#### Problems
- [ ] Buckets currently have no security, public read&write access.
- [ ] Uploader saves into seperate buckets for temporary backups and finals.
- [ ] Regular Expressions need expanding to ignore system files and support ALL document types.
- [ ] Needs configuring settings for document types.
- [X] No monitoring of file changes. Should compare and update.
- [ ] No deleting or flagging of deleted files between stores.

### Requirements
[Amazon AWS](https://aws.amazon.com/)
[Node.js](https://nodejs.org/en/)

### Setup
1. Define the watch directory in `config.json`.
2. Configure an AWS S3 Bucket and assigning the bucketname to the `AWS.BucketName` property in `config.json`.

### Installation
Open the terminal, navigate to the CloudSync project directory, and run the following commands.
1. `npm install`
2. `npm start`
The program will initialise, syncronise and is then ready to observe files.

### Backups
When backups are configured, the watcher will automatically scan for temporary 'working' files and save them to the configured `AWS.BackupBucketName` on S3.