window.onload = function(){
	var files = document.getElementById("files");
	var dropzone = document.getElementById("dropzone");

	// Detect drag and drop support
	if('draggable' in document.createElement('span')) {
		files.style.display = "none";
		dropzone.addEventListener("dragover", allowDrop);
		dropzone.addEventListener("drop", drop);
	} else {
		dropzone.style.display = "none";
		files.addEventListener("change", fileSelection);
	}
}
