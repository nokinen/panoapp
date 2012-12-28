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
