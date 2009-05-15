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

    // console.log("Uploader: overloading form.onSubmit");
    // this.urlform.onSubmit = this.uploadFiles.bindAsEventListener(this);
    
    Event.observe(this.choosebutton,'click', function(e) { e.stop(); this.swfu.selectFiles(); }.bind(this));
    // Event.observe(this.startbutton,'click', function(e) { e.stop(); this.swfu.startUpload(); }.bind(this));

    
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
      var progress = new FileProgress(file, this.queue_name);
      progress.setStatus("Pending...");
      progress.toggleCancel(true, this);
    } catch (ex) {
      this.swfu.debug(ex);
    }
  },
  uploadStart : function (file) {
    var progress = new FileProgress(file, this.queue_name);
    progress.setStatus("Uploading...");
    progress.toggleCancel(true, this);  },
  uploadProgress : function (file, bytesLoaded, bytesTotal) {
    var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
    var progress = new FileProgress(file, this.queue_name);
    progress.setProgress(percent);
    progress.setStatus(percent == 100 ? "Processing..." : "Uploading...");
  },
  uploadSuccess : function (file) {
    var progress = new FileProgress(file, this.queue_name);
    progress.setComplete();
    progress.setStatus("Complete.");
    progress.toggleCancel(false);
  },
  uploadComplete : function (file, response) {
    // remote call for _describe partial
  },
  queueError : function (file, errorCode, message) {
    if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
    	alert("You have attempted to queue too many files.\n" + (message === 0 ? "You have reached the upload limit." : "You may select " + (message > 1 ? "up to " + message + " files." : "one file.")));
    	return;
    }

    var progress = new FileProgress(file, this.queuename);
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
		var progress = new FileProgress(file, this.queuename);
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
			// If there aren't any files left (they were all cancelled) disable the cancel button
			if (this.getStats().files_queued === 0) {
				document.getElementById(this.customSettings.cancelButtonId).disabled = true;
			}
			progress.setStatus("Cancelled");
			progress.setCancelled();
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
			progress.setStatus("Stopped");
			break;
		default:
			progress.setStatus("Unhandled Error: " + errorCode);
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

function FileProgress(file, targetID) {
	this.fileProgressID = file.id;

	this.opacity = 100;
	this.height = 0;
	

	this.fileProgressWrapper = document.getElementById(this.fileProgressID);
	if (!this.fileProgressWrapper) {
		this.fileProgressWrapper = document.createElement("div");
		this.fileProgressWrapper.className = "progressWrapper";
		this.fileProgressWrapper.id = this.fileProgressID;

		this.fileProgressElement = document.createElement("div");
		this.fileProgressElement.className = "progressContainer";

		var progressCancel = document.createElement("a");
		progressCancel.className = "progressCancel";
		progressCancel.href = "#";
		progressCancel.style.visibility = "hidden";
		progressCancel.appendChild(document.createTextNode(" "));

		var progressText = document.createElement("div");
		progressText.className = "progressName";
		progressText.appendChild(document.createTextNode(file.name));

		var progressBar = document.createElement("div");
		progressBar.className = "progressBarInProgress";

		var progressStatus = document.createElement("div");
		progressStatus.className = "progressBarStatus";
		progressStatus.innerHTML = "&nbsp;";

		this.fileProgressElement.appendChild(progressCancel);
		this.fileProgressElement.appendChild(progressText);
		this.fileProgressElement.appendChild(progressStatus);
		this.fileProgressElement.appendChild(progressBar);

		this.fileProgressWrapper.appendChild(this.fileProgressElement);

		document.getElementById(targetID).appendChild(this.fileProgressWrapper);
	} else {
		this.fileProgressElement = this.fileProgressWrapper.firstChild;
		this.reset();
	}

	this.height = this.fileProgressWrapper.offsetHeight;
	this.setTimer(null);


}

FileProgress.prototype.setTimer = function (timer) {
	this.fileProgressElement["FP_TIMER"] = timer;
};
FileProgress.prototype.getTimer = function (timer) {
	return this.fileProgressElement["FP_TIMER"] || null;
};

FileProgress.prototype.reset = function () {
	this.fileProgressElement.className = "progressContainer";

	this.fileProgressElement.childNodes[2].innerHTML = "&nbsp;";
	this.fileProgressElement.childNodes[2].className = "progressBarStatus";
	
	this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
	this.fileProgressElement.childNodes[3].style.width = "0%";
	
	this.appear();	
};

FileProgress.prototype.setProgress = function (percentage) {
	this.fileProgressElement.className = "progressContainer green";
	this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
	this.fileProgressElement.childNodes[3].style.width = percentage + "%";

	this.appear();	
};
FileProgress.prototype.setComplete = function () {
	this.fileProgressElement.className = "progressContainer blue";
	this.fileProgressElement.childNodes[3].className = "progressBarComplete";
	this.fileProgressElement.childNodes[3].style.width = "";

  // var oSelf = this;
  // this.setTimer(setTimeout(function () {
  //  oSelf.disappear();
  // }, 10000));
};
FileProgress.prototype.setError = function () {
	this.fileProgressElement.className = "progressContainer red";
	this.fileProgressElement.childNodes[3].className = "progressBarError";
	this.fileProgressElement.childNodes[3].style.width = "";

  // var oSelf = this;
  // this.setTimer(setTimeout(function () {
  //  oSelf.disappear();
  // }, 5000));
};
FileProgress.prototype.setCancelled = function () {
	this.fileProgressElement.className = "progressContainer";
	this.fileProgressElement.childNodes[3].className = "progressBarError";
	this.fileProgressElement.childNodes[3].style.width = "";

	var oSelf = this;
	this.setTimer(setTimeout(function () {
		oSelf.disappear();
	}, 2000));
};
FileProgress.prototype.setStatus = function (status) {
	this.fileProgressElement.childNodes[2].innerHTML = status;
};

// Show/Hide the cancel button
FileProgress.prototype.toggleCancel = function (show, swfUploadInstance) {
	this.fileProgressElement.childNodes[0].style.visibility = show ? "visible" : "hidden";
	if (swfUploadInstance) {
		var fileID = this.fileProgressID;
		this.fileProgressElement.childNodes[0].onclick = function () {
			swfUploadInstance.cancelUpload(fileID);
			return false;
		};
	}
};

FileProgress.prototype.appear = function () {
	if (this.getTimer() !== null) {
		clearTimeout(this.getTimer());
		this.setTimer(null);
	}
	
	if (this.fileProgressWrapper.filters) {
		try {
			this.fileProgressWrapper.filters.item("DXImageTransform.Microsoft.Alpha").opacity = 100;
		} catch (e) {
			// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
			this.fileProgressWrapper.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=100)";
		}
	} else {
		this.fileProgressWrapper.style.opacity = 1;
	}
		
	this.fileProgressWrapper.style.height = "";
	
	this.height = this.fileProgressWrapper.offsetHeight;
	this.opacity = 100;
	this.fileProgressWrapper.style.display = "";
	
};

// Fades out and clips away the FileProgress box.
FileProgress.prototype.disappear = function () {

	var reduceOpacityBy = 15;
	var reduceHeightBy = 4;
	var rate = 30;	// 15 fps

	if (this.opacity > 0) {
		this.opacity -= reduceOpacityBy;
		if (this.opacity < 0) {
			this.opacity = 0;
		}

		if (this.fileProgressWrapper.filters) {
			try {
				this.fileProgressWrapper.filters.item("DXImageTransform.Microsoft.Alpha").opacity = this.opacity;
			} catch (e) {
				// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
				this.fileProgressWrapper.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + this.opacity + ")";
			}
		} else {
			this.fileProgressWrapper.style.opacity = this.opacity / 100;
		}
	}

	if (this.height > 0) {
		this.height -= reduceHeightBy;
		if (this.height < 0) {
			this.height = 0;
		}

		this.fileProgressWrapper.style.height = this.height + "px";
	}

	if (this.height > 0 || this.opacity > 0) {
		var oSelf = this;
		this.setTimer(setTimeout(function () {
			oSelf.disappear();
		}, rate));
	} else {
		this.fileProgressWrapper.style.display = "none";
		this.setTimer(null);
	}
};