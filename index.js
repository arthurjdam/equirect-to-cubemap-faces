const fs = require('fs');
const EquirectToCubemap = require('equirect-cubemap-faces-js');
const Canvas = require('canvas');

const _exec = function(image, faceSize) {
	let canvas = _imageToCanvas(image);

	if (!faceSize) {
		faceSize = _nearestPowerOfTwo(canvas.width / 4) | 0;
	}

	if (typeof faceSize !== 'number') {
		throw new Error('faceSize needed to be a number or missing');
	}

	let faces = new Array(6).fill(0).map(i => new Canvas(faceSize, faceSize));
	let imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

	let cube = EquirectToCubemap.transformToCubeFaces(imageData, faces.map(canvas => canvas.getContext('2d').createImageData(canvas.width, canvas.height)));
	cube.map((imageData, i) => faces[i].getContext('2d').putImageData(imageData, 0, 0));
	
	return faces;
}

const _nearestPowerOfTwo = function(n) {
	return 1 << Math.round(Math.log(n) / Math.log(2))
}

const _imageToCanvas = function(image) {
	let img = new Canvas.Image;
	img.src = image;

	let canvas = new Canvas(img.width, img.height);
	let ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0, img.width, img.height);
	
	return canvas;
}	

class NodeEquirectToCubemap {
	/**
	 * Returns the order of faces
	 * @returns {Array}
	 */
	static get order() {
		return ['right', 'left', 'top', 'bottom', 'front', 'back'];
	}

	/**
	 * Parses a loaded image and returns a cubemap
	 * @param {Buffer} image - Image in Buffer format
	 * @param {number} faceSize - Size (in pixels) of the faces to be returned
	 * @returns {Array}
	 */
	static fromImage(image, faceSize) {
		return new Promise((res, rej) => 
		{
			res(_exec(image, faceSize));
		});
	}

	/**
	 * Parses a file and returns a cubemap
	 * @param {string} file - Path to the file to be processed
	 * @param {number} faceSize - Size (in pixels) of the faces to be returned
	 * @returns {Array} 
	 */
	static fromFile(file, faceSize) {
		return new Promise((res, rej) => 
		{
			fs.readFile(file, (err, image) => 
			{
				if(!err) res(_exec(image, faceSize));
			});
		})
	}
}

module.exports = NodeEquirectToCubemap;
