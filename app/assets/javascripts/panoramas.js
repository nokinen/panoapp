function Job(name){
	this.id = Math.random() * Math.pow(10,17);
	this.name = name;
	this.preview = false;
	this.fullsize = false;
}

Job.prototype.finished = function(){
	return this.preview && this.fullsize ? true : false;
}

window.onload = function(){
	var files = document.getElementById("files");
	var dropzone = document.getElementById("dropzone");

	// Detect drag and drop support
		// if('draggable' in document.createElement('span')) {
			// files.style.display = "none";
			if(dropzone){
				dropzone.addEventListener("dragover", allowDrop);
				dropzone.addEventListener("drop", drop);
			}
			
			if(files){
				files.addEventListener("change", fileSelection);
			}
		// } else {
			// dropzone.style.display = "none";
			
		// }
	
	document.getElementById("upload").style.display = "inherit";
}

function fileSelection(event){
	process(event.target.files);
}

function drop(event){
	event.preventDefault();
	process(event.dataTransfer.files);
}

function allowDrop(event){
	event.preventDefault();
}

function process(files){
	
	for (var i = 0; i < files.length; i++) {
		
		var file = files[i];
		
		if(file.type != "image/jpeg"){
			console.log("Unsupported type of " + file.name + ": " + file.type);
			continue;
		}
		
		var reader = new FileReader();
		(function(filename){
			reader.onload = function(event){
			
				var job = new Job(filename);
				console.log("Processing " + job.name);
			
				var image = new Image();
				image.src = event.target.result;
				image.onload = function(){
				
					// Preview image
					var preview = resize(image, 1920, 0.5);
					
					appendPreview(job, preview);
					
					upload(preview, function(uri){
						job.preview = uri;
						console.log("Preview image for " + 
							job.name + " uploaded to " + uri);
						createPanorama(job);
					});
				
					// Fullsize image
					var fullsize = resize(image, image.width, 0.2);
					upload(fullsize, function(uri){
						job.fullsize = uri;
						console.log("Fullsize image for " + 
							job.name + " uploaded to " + uri);
						createPanorama(job);
					});
				}
	
			}
		})(file.name);
		reader.readAsDataURL(file);
		
	}
	
}

function resize(image, width, quality){
	
	var ratio = Math.abs(image.width / width);
	var height = (image.height / ratio);
	
	var canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	canvas.getContext("2d").drawImage(image, 0, 0, width, height);
	
	return canvas.toDataURL("image/jpeg", quality);
}

function upload(data_url, callback){
	
	// Fetch AWS S3 credentials and signature
	var request = new XMLHttpRequest();
	var uri = "/policy/generate?" + new Date().getTime(); // Avoid caching through timestamp
	request.open("GET", uri , true);
	request.onload = function(evt){
		
		if(request.status != 200)
			return;
		
		var credentials = JSON.parse(evt.target.response);
		post(credentials, window.dataURLtoBlob(data_url), callback);
		
	}
	request.onerror = function(evt){
		console.error("Could not fetch credentials from server");
	}
	request.send();
}

function post(credentials, blob, callback){
	
	var formData = new FormData();
	formData.append("key", credentials.key);
	formData.append("acl", credentials.acl);
	formData.append("Content-Type", credentials.content_type);
	formData.append("AWSAccessKeyId", credentials.access_key);
	formData.append("policy", credentials.policy)
	formData.append("signature", credentials.signature);
	formData.append("file", blob);
	
	var request = new XMLHttpRequest();
	var uri = "https://" + credentials.bucket + ".s3.amazonaws.com";
	request.open("POST", uri, true);
	request.onload = function(evt){
		
		if(request.status == 204)
			callback(uri + "/" + credentials.key);

	}
	request.onerror = function(evt){
		console.error("Could not upload " + credentials.key);
	}
	request.send(formData);
	
}

function appendPreview(job, previewUrl){
	
	var preview = document.createElement("div");
	preview.className = "preview";
	
	var img = new Image();
	img.src = previewUrl;
	img.id = job.id;
	img.className = "processing";
	
	preview.appendChild(img);
	
	var previews = document.getElementById("previews");
	var first = previews.firstChild;
	previews.insertBefore(preview, first);

}

function linkPreview(id, location){
		
		var path = document.createElement("a");
		path.href = location;
	
		var img = document.getElementById(id);
		img.className = "";
		
		var preview = img.parentNode;
		preview.removeChild(img);
		
		var a = document.createElement("a");
		a.href = path.pathname;
		a.appendChild(img);
		
		preview.appendChild(a);
}

function createPanorama(job){
	
	if(!job.finished())
		return;
		
	var formData = new FormData();
	formData.append("panorama[preview]", job.preview);
	formData.append("panorama[fullsize]", job.fullsize);
	
	var request = new XMLHttpRequest();
	request.open("POST", "/panoramas", true);
	request.onload = function(evt){
		if(request.status != 201)
			return;
		
		console.log("Successfully created panorama from " + job.name);
		linkPreview(job.id, request.getResponseHeader("location"));
	}
	request.onerror = function(evt){
		console.error("Could not create panorama from " + job.name);
	}
	request.send(formData);
}
