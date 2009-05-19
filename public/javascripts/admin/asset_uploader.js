var aul;

document.observe("dom:loaded", function() {
  if($('asset_uploader')){
    aul = new Uploader($('asset_uploader'));
  }
});

var Uploader = Class.create();
Uploader.prototype = {
  settings: null,
  uploader: null,
  queue_name: null,
  swfu: null,
  uploads: {},
  initialize: function(upload_form) {
    this.ulform = upload_form;
    this.choosebutton = $('file_chooser');
    this.upload_list = $('file_list');
    this.queue_name = 'upload_queue';
        
    this.settings = {
      flash_url : "/flash/swfupload.swf",
      upload_url: "/admin/assets/upload", // Relative to the SWF file
      post_params: { "authenticity_token" : window._authenticity_token },
      file_size_limit : "50 MB",
      file_types : "*.*",
      file_types_description : "All Files",
      file_upload_limit : 100,
      file_queue_limit : 0,
      debug: false,
      
      button_placeholder_id: 'swf_placeholder',
      
      // The event handler functions
      swfupload_loaded_handler : this.swfUploadLoaded.bind(this),
      file_dialog_complete_handler : this.fileDialogComplete.bind(this),
      file_queued_handler : this.fileQueued.bind(this),
      upload_start_handler : this.uploadStart.bind(this),
      queue_complete_handler : this.queueComplete.bind(this),
      upload_progress_handler : this.uploadProgress.bind(this),
      upload_complete_handler : this.uploadComplete.bind(this),
      upload_success_handler : this.uploadSuccess.bind(this),
      upload_error_handler: this.uploadError.bind(this),
      
      // SWFObject settings
      minimum_flash_version : "9.0.28",
      swfupload_pre_load_handler : this.swfUploadPreLoad.bind(this),
      swfupload_load_failed_handler : this.swfUploadLoadFailed.bind(this)
    };
    
    this.swfu = new SWFUpload(this.settings);
    Event.observe(this.choosebutton,'click', function(e) { e.stop(); this.swfu.selectFiles(); }.bind(this));
    
  },
  swfUploadLoaded : function () { 
    this.choosebutton.writeAttribute('disabled', false);
    
  },
  fileDialogComplete : function (selected, queued, total) {
    this.swfu.startUpload();
    this.choosebutton.update('upload more files');
  },
  fileQueued : function (file) {
    try {
      this.uploads[file.id] = new Upload(file, this);
    } catch (ex) {
      this.swfu.debug(ex);
    }
  },
  uploadStart : function (file) {
    this.uploads[file.id].setStatus("Uploading...");
  },
  uploadProgress : function (file, bytesLoaded, bytesTotal) {
    var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
    this.uploads[file.id].setProgress(percent);
    this.uploads[file.id].setStatus(percent == 100 ? "Processing..." : "Uploading...");
  },
  uploadSuccess : function (file) {
    this.uploads[file.id].setStatus("Complete.");
    this.uploads[file.id].toggleCancel(false);
    this.uploads[file.id].setComplete();
  },
  queueError : function (file, errorCode, message) {
    if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
    	alert("You have attempted to queue too many files.\n" + (message === 0 ? "You have reached the upload limit." : "You may select " + (message > 1 ? "up to " + message + " files." : "one file.")));
    	return;
    }

    var progress = this.uploads[file.id];
    progress.setError();
    progress.toggleCancel(false);

    switch (errorCode) {
    case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
    	progress.setStatus("File is too big.");
    	this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
    	break;
    case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
    	progress.setStatus("Cannot upload Zero Byte files.");
    	this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
    	break;
    case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
    	progress.setStatus("Invalid File Type.");
    	this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
    	break;
    default:
    	if (file !== null) {
    		progress.setStatus("Unhandled Error");
    	}
    	this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
    	break;
  	}
  },
  uploadError : function (file, errorCode, message) {
    var progress = this.uploads[file.id];
		progress.setError();
		progress.toggleCancel(false);

		switch (errorCode) {
		case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
			progress.setStatus("Upload Error: " + message);
			this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
			progress.setStatus("Upload Failed.");
			this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.IO_ERROR:
			progress.setStatus("Server (IO) Error");
			this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
			progress.setStatus("Security Error");
			this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
			progress.setStatus("Upload limit exceeded.");
			this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
			progress.setStatus("Failed Validation.  Upload skipped.");
			this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
			progress.cancel();
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
			progress.setStatus("Stopped");
			break;
		default:
			progress.setStatus("Unknown Error: " + errorCode);
			this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
			break;
		}
	},
  queueComplete : function () {

  },
  swfUploadPreLoad : function () { },
  swfUploadLoadFailed : function () { },
  
  debug: function (argument) {
    this.swfu.debug(argument);
  }
};


// this needs to be completely rewritten
// as a dependent object of the uploader
// retrievable by id
// using great big divs to show progress
// then replacing contents with response html
// and calling remote_form on the resulting description form

var Upload = Class.create();
Upload.prototype = {
  file_id: null,
  file_name: '',
  opacity: 100,
  height: 0,
  wrapper: null,
  progress: null,
  bar: null,
  file_label: null,
  message: null,
  canceller: null,
  queue: null,

  initialize: function(file, uploader) {
  	this.file_id = file.id;
  	this.file_name = file.name;
  	this.holder = $(this.file_id);
  	this.queue = $(queue_name);

  	if (!this.holder) {
  	  this.holder = new Element('div', {'class' : "progressWrapper", 'id' : this.file_id});
  	  this.progress = new Element('div', {'class' : "progressContainer"});
  	  this.bar = new Element('div', {'class' : "progressBarInProgress"}).insert(" ");
  	  this.canceller = new Element('a', {'href' : '#', 'class' : "progressCancel", 'style' : 'visibility: hidden;'}).insert("x");
  	  this.file_label = new Element('div', {'class' : "progressName"}).insert(file.name);
      this.message = new Element('div', {'class' : "progressBarStatus"});
      this.message.innerHTML = "&nbsp;";

  		this.progress.insert(this.canceller);
  		this.progress.insert(this.file_label);
  		this.progress.insert(this.message);
  		this.progress.insert(this.bar);
      this.wrapper.insert(this.progress);
      this.queue.insert(this.wrapper);

  	} else {
  		this.progress = this.wrapper.firstDescendant();
  		this.reset();
  	}

		this.canceller.onclick = this.cancel.bindAsEventListener();
	  this.height = this.wrapper.offsetHeight;
	  this.setTimer(null);
	  this.setStatus("Pending...");
    this.toggleCancel(true);
	},
	
	setTimer: function (timer) {
  	this.progress["FP_TIMER"] = timer;
	},
	getTimer: function (timer) {
  	return this.progress["FP_TIMER"] || null;
	},
	reset: function () {
  	this.message.innerHTML = "&nbsp;";
  	this.message.className = "progressBarStatus";
  	this.bar.className = "progressBarInProgress";
  	this.bar.setStyle('width', "0%");
  	this.appear();	
	},
	
	setColor: function (tocolor) {
    ['green', 'blue', 'red'].each(function (color) {
      if (color == tocolor) this.progress.addClassName(color);
      else this.progress.removeClassName(color);
    });
	},
	setProgress: function (percentage) {
  	this.setColor("green");
  	this.bar.className = "progressBarInProgress";
  	this.bar.setStyle('width', percentage + "%");
  	this.appear();	
	},
	setComplete: function (percentage) {
  	this.setColor("blue");
  	this.bar.className = "progressBarComplete";
  	this.bar.setStyle('width', "");
  	new Ajax.Updater(this.wrapper, '/assets/describe', { method: 'get', parameters: {filename: this.file_name} });
  },
	setError: function (percentage) {
  	this.setColor("red");
  	this.bar.className = "progressBarError";
  	this.bar.setStyle('width', "");
  },
 	setCancelled: function (percentage) {
  	this.setColor('neutral');
  	this.bar.className = "progressBarError";
  	this.bar.setStyle('width', "");
  },
  setStatus: function (status) {
  	this.message.innerHTML = status;
  },
  toggleCancel: function (show, swfUploadInstance) {
  	this.canceller.setStyle('visibility', show ? "visible" : "hidden");
  },
  
  appear: function () {
  	if (this.getTimer() !== null) {
  		clearTimeout(this.getTimer());
  		this.setTimer(null);
  	}
	  this.wrapper.setOpacity(1);
	  this.wrapper.setStyle('height', '');
    this.height = this.wrapper.offsetHeight;
	  this.opacity = 100;
	  this.wrapper.setStyle('display', '');
  },
  disappear: function () {
    this.wrapper.fade({ duration: 3.0 });
  },
  cancel: function (e, but_stay) {
    this.uploader.swfu.cancelUpload(this.file_id);
    this.setCancelled();
    if (!but_stay) this.disappear.delay(2);
  }
  
};
