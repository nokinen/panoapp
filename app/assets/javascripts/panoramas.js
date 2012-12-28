window.onload = function(){
	var dropzone = document.getElementById("dropzone");

	// Detect drag and drop support
	if('draggable' in document.createElement('span')) {
		dropzone.addEventListener("dragover", allowDrop);
		dropzone.addEventListener("drop", drop);
	} else {
		console.error("Drag and drop not supported by browser");
	}
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
		reader.onload = function(event){
		
			var image = new Image();
			image.src = event.target.result;
			image.onload = function(){
				
				// Preview image
				var preview = resize(image, 1920, 0.5);
				upload(window.dataURLtoBlob(preview));
				
				// Fullsize image
				var fullsize = resize(image, image.width, 0.2);
				upload(window.dataURLtoBlob(fullsize));
			}
	
		}
		reader.readAsDataURL(file);
		
		console.log("Processing " + file.name);
		
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

function upload(blob){
	
	// Fetch AWS S3 credentials and signature
	var request = new XMLHttpRequest();
	var uri = "/policy/generate?" + new Date().getTime(); // Avoid caching through timestamp
	request.open("GET", uri , true);
	request.onload = function(evt){
		
		if(request.status != 200)
			return;
		
		var credentials = JSON.parse(evt.target.response);
		post(credentials, blob);
		
	}
	request.onerror = function(evt){
		console.error("Could not fetch credentials from server");
	}
	request.send();
}

function post(credentials, blob){
	
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
		
		if(request.status != 204)
			return;
		
		console.log("Successfully uploaded " + credentials.key);

	}
	request.onerror = function(evt){
		console.error("Could not upload " + credentials.key);
	}
	request.send(formData);
	
}