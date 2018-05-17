/**
 * Configuration
 * @note Values should be defined in "config.json"
 */
const CONFIG = require('./config.json');
const albumBucketName = CONFIG.AWS.BucketName;
const albumBucketBackupName = CONFIG.AWS.Backup.BucketName || "";
const bucketRegion = CONFIG.AWS.BucketRegion;
const APIVersion = CONFIG.AWS.APIVersion || '2006-03-01';
const watchDirectory = CONFIG.WatchDirectory;
const shouldBackup = (albumBucketBackupName.length > 0 && CONFIG.AWS.Backup.Enabled) || false;

/**
 * Modules
 */
const chokidar = require('chokidar');
const fs = require('fs');
const AWS = require('aws-sdk');
const colors = require('colors');
const walker = require('walk').walk(watchDirectory,{followLinks:false});

/**
 * AWS Payload Keys
 */
const KEY_AWS_S3_OBJECT_RESPONSE_CONTENTS = 'Contents';
const KEY_AWS_S3_OBJECT_RESPONSE_CONTENTS_OBJECTNAME = 'Key';
const KEY_AWS_S3_OBJECT_RESPONSE_CONTENTS_TAG = 'ETag';

/**
 * Variables
 */
let directoryInitialized = false;
let log = console.log.bind(console);

/*
 * AWS Configuration
 */
AWS.config.update({region: bucketRegion});
const s3 = new AWS.S3({apiVersion:APIVersion,params:{Bucket:albumBucketName}});

/*
 * Watcher Configuration
 */
var watcher = chokidar.watch(watchDirectory, {
	ignored: new RegExp(watchDirectory+"\/\~\$[\w]*","gi"),
	persistent:true
});

let localFiles = [];

listFiles(function(err, bucketFileList) {
	if (err) {
		console.log(colors.red(err));
	} else {
		console.log(colors.grey(bucketFileList.length+" files on the cloud"));
		console.log(colors.white("Scanning directory for unsyncronised files"));
		syncroniseDataStores(bucketFileList, localFiles);
	}
});

walker.on('file', function(root, stat, next) {
	localFiles.push(stat.name);
	next();
});

walker.on('end', function() {
	console.log(colors.grey("Finished walking current directory"));
})

function syncroniseDataStores(bucketList, localList) {
	// Iterate and compare
	localList.forEach(function(filename) {
		// Escape if file already stored
		if (bucketList.indexOf(filename) >= 0 || /\~\$/gi.test(filename)) return;
		// Read data and upload to AWS S3
		fs.readFile(watchDirectory+'/'+filename, function(err, data) {
			// Log errors and escape
			if (err) return log(err);
			console.log(colors.yellow("Syncronising '"+filename+"'"));
			// Upload the data buffer
			uploadFile(filename, data, false);
		});
	});

	console.log(colors.grey("Syncronise complete"));
}

/**
 * Watcher Events
 */

/**
 * Ready
 * @note Fired after the initial directory scan
 */
watcher.on("ready", function() {
	log(colors.grey("Observing directory '"+watchDirectory+"'"));
	directoryInitialized = true;
})

/**
 * Add
 * @note Fired when a new file is added to the directory
 */
watcher.on('add', function(path) {
	// Skip if directory is initializing
	if (!directoryInitialized) return;
	if (false === /\.(xlsx|xlm)/gi.test(path)) return;
	// Read data and upload to AWS S3
	fs.readFile(path, function(err, data) {
		// Log errors and escape
		if (err) return log(err);
		// Upload the data buffer
		uploadFile(filenameFromPath(path), data, /\~\$/gi.test(path));
	});
});

/**
 * Filename from full path
 * @note Trims the path from the filename
 */
function filenameFromPath(path) {
	// This should the filename and extension not fullpath minus watch directory
	return path.match(/[\~\$\-\_\w\d]*\.xlsx|xlsm|xls|xlt|xlm|doc|docx|docm|docb|dot|dotx|dotm|wbk|txt/gi)[0];
}

/**
 * List Files
 * @note Retreives a list of objects from the specified S3 Bucket
 * @param callback (Function) Callback function
 * @return (error, objects) Errors response and array of object names
 */
function listFiles(callback) {
	// Configure scan params
	let params = {
		Delimiter:'/'
	}
	// Fetch bucket objects
	s3.listObjects(params, function(err, response) {
		if (err) {
			callback('There was an error listing your files: '+err.message);
		} else {
			let list = response[KEY_AWS_S3_OBJECT_RESPONSE_CONTENTS].map(function(file) {
				let filename = file[KEY_AWS_S3_OBJECT_RESPONSE_CONTENTS_OBJECTNAME];
				let tag = file[KEY_AWS_S3_OBJECT_RESPONSE_CONTENTS_TAG].replace(/\"/gi,'');
				return filename;
			});
			callback(false, list);
		}
	});
}

/**
 * Upload File
 * @note Uploads the file to the configured AWS S3 Bucket
 * @param fileName (String) The specified filename and extension
 * @param fielData (Buffer) Data buffer of the file to upload
 */
function uploadFile(fileName, fileData=Buffer, isBackup=false) {
	// Escape if backups denied
	if (isBackup && isBackup !== shouldBackup) return;
	// Configure upload params
	let params = {
		Body: fileData, 
		Bucket: (isBackup) ? albumBucketBackupName : albumBucketName,
		Key: fileName
	}

	s3.putObject(params, function(err, data) {
		if (err) {
			log(colors.red("S3.putObject : "+err.code), colors.grey(err.message));
		} else {
			let logColor = (isBackup)?'white':'cyan';
			let logTag = (isBackup)?'Saved backup of ':'Uploaded';
			log(colors[logColor](logTag+" '"+fileName+"' with tag '"+data.ETag.replace(/\"/gi,'')+"'."));
		}
	});
}