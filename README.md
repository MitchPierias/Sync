# Sync
## Automatic Directory Cloud Uploader
Little test script to automatically syncronise local files with an Amazon AWS S3 Bucket

#### Problems
Buckets currently have no security, public read&write access.
Uploader saves into seperate buckets for temporary backups and finals.

### Dependencies
Node.js

### Setup
1. Run `npm install`
2. Define the watch directory in `config.json`.
3. Configure an AWS S3 Bucket and assigning the bucketname to the `AWS.BucketName` property in `config.json`.
4. Run `npm start`

### Backups
When backups are configured, the watcher will automatically scan for temporary 'working' files and save them to the configured `BackupBucketName` on S3.