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
	static get order() {
		return ['right', 'left', 'top', 'bottom', 'front', 'back'];
	}

	static fromImage(image, faceSize) {
		return new Promise((res, rej) => 
		{
			res(_exec(image, faceSize));
		});
	}

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

NodeEquirectToCubemap.fromFile('Hallway_seq.005.jpg', 512).then(images => {
	console.log(images);
	let out = {};
	for(let i = 0; i < images.length; ++i)
	{
		out[NodeEquirectToCubemap.order[i]] = images[i];
	}
	console.log(out);

	// for(let i = 0; i < images.length; ++i)
	// {
	// 	let out = fs.createWriteStream(__dirname + '/face_' + NodeEquirectToCubemap.order[i] + '.png');
	// 	let str = images[i].pngStream();

	// 	str.on('data', chunk => {
	// 		out.write(chunk);
	// 	});
	// }

	images.map((img, index) => {
		let out = fs.createWriteStream(__dirname + '/face_' + NodeEquirectToCubemap.order[index] + '.png');
		let str = img.pngStream();

		str.on('data', chunk => {
			out.write(chunk);
		});
	});
})

console.log(NodeEquirectToCubemap.order);
// console.log(EquirectToCubemap.imageDataToImageData());

/* Example:

fs.readFile('Hallway_seq.005.jpg', (err, image) =>
{
	NodeEquirectToCubemap.fromImage(image, 1024).then(faces => {
		console.log(faces.length);
	});
});

 */
