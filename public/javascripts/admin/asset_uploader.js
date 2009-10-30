var aul;

document.observe("dom:loaded", function() {
  if($('asset_uploader')){
    aul = new Uploader($('asset_uploader'));
  }
});

// we send a unique token with the upload because we can't return the id to this script: swfupload gets the response and only reads the status code.

var makeUuid = function () {
  // http://www.ietf.org/rfc/rfc4122.txt
  var s = [];
  var hexDigits = "0123456789ABCDEF";
  for (var i = 0; i < 32; i++) { s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1); }
  s[12] = "4";                                       // bits 12-15 of the time_hi_and_version field to 0010
  s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  return s.join('');
};

var timestamp = function () {
  return new Date().getTime();
};

// this is a much-chopped about descendant of the standard demo code for swfupload.

var Uploader = Class.create();
Uploader.prototype = {
  settings: null,
  uploader: null,
  queue_name: null,
  swfu: null,
  ticker: null,
  uploads: {},
  initialize: function(upload_form) {
    this.ulform = upload_form;
    this.choosebutton = $('file_chooser');
    this.upload_list = $('file_list');
    this.queue_name = 'upload_queue';
    this.ticker = timestamp();
    
    this.settings = {
      flash_url : "/flash/swfupload.swf",
      upload_url: this.ulform.action,
      post_params: { "authenticity_token" : window._authenticity_token },
      file_size_limit : "50 MB",
      file_types : "*.*",
      file_types_description : "All Files",
      file_upload_limit : 1000,
      file_queue_limit : 0,
      debug: false,
      
      button_width: "500",
      button_height: "44",
      button_placeholder_id: 'swf_placeholder',
      button_text: '<span class="biggish">add files to upload queue...</span>',
      button_text_style: ".biggish { font-size: 36px; line-height: 1.1; font-weight: lighter; font-family: Helvetica, Arial, sans-serif; letter-spacing: -0.05em; color: #cc0000;}",
      button_cursor: SWFUpload.CURSOR.HAND,

      // The event handler functions
      swfupload_loaded_handler : this.swfUploadLoaded.bind(this),
      file_dialog_complete_handler : this.fileDialogComplete.bind(this),
      file_queued_handler : this.fileQueued.bind(this),
      upload_start_handler : this.uploadStart.bind(this),
      queue_complete_handler : this.queueComplete.bind(this),
      upload_progress_handler : this.uploadProgress.bind(this),
      upload_success_handler : this.uploadSuccess.bind(this),
      upload_error_handler: this.uploadError.bind(this),
      
      // SWFObject settings
      minimum_flash_version : "9.0.28",
      swfupload_pre_load_handler : this.swfUploadPreLoad.bind(this),
      swfupload_load_failed_handler : this.swfUploadLoadFailed.bind(this)
    };
    
    this.swfu = new SWFUpload(this.settings);    
  },
  swfUploadLoaded : function () { 
  },
  fileDialogComplete : function (selected, queued, total) { 
    this.swfu.startUpload(); 
  },
  fileQueued : function (file) { 
    this.uploads[file.id] = new Upload(file, this); 
  },
  uploadStart : function (file) { 
    this.uploads[file.id].setUploading(); 
    this.swfu.addFileParam(file.id, 'asset[upload_token]', this.uploads[file.id].token);
    this.ulform.getElements().each(function (input) {
      this.swfu.addFileParam(file.id, input.readAttribute('name'), input.getValue());
    }.bind(this));
  },
  uploadProgress : function (file, bytesLoaded, bytesTotal) {
    var tick = timestamp();
    if (tick != this.ticker) {
      var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
      var speed = SWFUpload.speed.formatBPS(file.averageSpeed);
      var remaining = SWFUpload.speed.formatTime(file.timeRemaining);
      this.uploads[file.id].setProgress(percent, speed, remaining);
      this.ticker = tick;
    } else {
      console.log('no tick', tick, this.ticker);
    }
  },
  uploadSuccess : function (file) {
    this.uploads[file.id].setComplete();
  },
  queueError : function (file, error_code, message) {
    if (error_code === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) alert("You have attempted to queue too many files.\n" + (message === 0 ? "You have reached the upload limit." : "You may select " + (message > 1 ? "up to " + message + " files." : "one file.")));
    else this.uploadError(file, error_code, message);
  },
  uploadError : function (file, error_code, message) {
    this.uploads[file.id].reportError(error_code, message);
	},
  queueComplete : function () { },
  swfUploadPreLoad : function () { },
  swfUploadLoadFailed : function () { },
  debug: function (argument) {
    this.swfu.debug(argument);
  }
};

var Upload = Class.create();
Upload.prototype = {
  file_id: null,
  file_name: '',
  token: '',
  opacity: 100,
  height: 0,
  wrapper: null,
  progress: null,
  bar: null,
  file_label: null,
  message: null,
  canceller: null,
  uploader: null,
  queue: null,
  waiter: null,

  initialize: function(file, uploader) {
  	this.file_id = file.id;
  	this.file_name = file.name;
  	this.uploader = uploader;
  	this.token = makeUuid();
  	this.queue = $(uploader.queue_name);
	  this.wrapper = new Element('div', {'class' : "progressWrapper", 'id' : this.file_id});
	  this.progress = new Element('div', {'class' : "progressContainer"});
	  this.bar = new Element('div', {'class' : "progressBar"}).insert(" ");
	  this.canceller = new Element('a', {'href' : '#', 'class' : "progressCancel", 'style' : 'visibility: hidden;'}).insert("x");
	  this.file_label = new Element('div', {'class' : "progressName"});
    this.message = new Element('div', {'class' : "progressBarStatus"});
    this.waiter = new Element('img', {src: '/images/admin/spinner_on_green.gif', "class": 'waiter', "style": 'display: none'});
    this.message.innerHTML = "&nbsp;";

		this.progress.insert(this.canceller);
		this.file_label.insert(this.waiter);
		this.file_label.insert(file.name);
		this.file_label.insert(this.message);
		this.progress.insert(this.file_label);
		this.progress.insert(this.bar);
    this.wrapper.insert(this.progress);
    this.queue.insert(this.wrapper);

		this.canceller.onclick = this.cancel.bindAsEventListener();
	  this.height = this.wrapper.offsetHeight;
	  this.setStatus("Queueing...");
    this.showCanceller();
    tester = this;
	},
	
  setStatus: function (status) {
  	this.message.innerHTML = status;
  },
  setWidth: function (width) {
    if (width) {
      if (width < 5) width = 5;
      this.bar.setStyle({'width': width + "%"});
    } else {
      this.bar.setStyle({'width': ""});
    }
  },
	setProgress: function (percent, speed, remaining) {
    if (percent > 99) {
    	this.setWidth(100);
      this.setProcessing();
    } else {
    	this.setWidth(percent);
      this.setStatus("Uploading at " + speed + ": " + remaining + " remaining.");
    }
	},
	setUploading: function () {
    this.setStatus("Uploading");
    this.setWorking();
	},
	setProcessing: function () {
    this.setStatus("Processing: please wait ");
    this.setWorking();
	},
	setComplete: function (percentage) {
    this.setStatus("Uploaded");
    this.hideCanceller();
    this.setFinishedWorking();
    this.waiter.removeClassName('waiter');
  	this.setWidth(100);
  	this.form_holder = new Element('div', {'class' : "fileform"});
  	this.progress.insert(this.form_holder);
    new Ajax.Updater(this.form_holder, '/admin/asset_describer', { method: 'get', parameters: {upload: this.token} });
  },
	setError: function (percentage) {
    this.setFailedWorking();
    this.bar.setStyle({'width': 0});
  },
 	setCancelled: function (percentage) {
  	this.setColor('white');
  	this.setWidth(0);
  },
	setWorking: function () {
    this.waiter.show();
	},
	setNotWorking: function () {
    this.waiter.hide();
	},
  setFinishedWorking: function () {
    this.waiter.show();
    this.waiter.writeAttribute('src', '/images/admin/chk_white.png');
  },
  setFailedWorking: function () {
    this.waiter.show();
    this.waiter.writeAttribute('src', '/images/admin/chk_off_white.png');
  },
  showCanceller: function () {
  	this.canceller.setStyle('visibility', "visible");
  },
  hideCanceller: function () {
  	this.canceller.setStyle('visibility', "hidden");
  },
  cancel: function (e, but_stay) {
    this.uploader.swfu.cancelUpload(this.file_id);
    this.setCancelled();
  },
  reportError: function (error_code, message) {
    this.setError();
    this.hideCanceller();
    switch (error_code) {
    case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
    	this.setStatus("HTTP Error: " + message);
    	break;
    case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
    	this.setStatus("Upload Failed: " + message);
    	break;
    case SWFUpload.UPLOAD_ERROR.IO_ERROR:
    	this.setStatus("Server (IO) Error: " + message);
    	break;
    case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
    	this.setStatus("Security Error: " + message);
    	break;
    case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
    	this.setStatus("Upload limit exceeded.");
    	break;
    case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
    	this.setStatus("Failed Validation.  Upload skipped.");
    	break;
    case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
    	this.setCancelled();
    	break;
    case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
    	this.setStatus("Stopped");
    	break;
    case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
    	this.setStatus("File is too big.");
    	break;
    case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
    	this.setStatus("Cannot upload Zero Byte files.");
    	break;
    case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
    	this.setStatus("Invalid File Type.");
    	break;
    default:
    	this.setStatus("Error #" + errorCode + ": " + message);
    	break;
    }
  }
};
