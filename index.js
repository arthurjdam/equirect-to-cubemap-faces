const fs = require('fs');

const EquirectToCubemap = require('./src/transform');
const Canvas = require('canvas');
const Image = Canvas.Image;

export class NodeEquirectToCubemap {
	static fromImage(image, faceSize) {
		return new Promise((res, rej) => {
			let img = new Image;
			img.src = image;
			
			let canvas = new Canvas(img.width, img.height);
			let ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, img.width, img.height);
			
			let faces = EquirectToCubemap.equirectToCubemapFaces(ctx.getImageData(0, 0, img.width, img.height), faceSize);
			
			res(faces);
		});
	}
	
	static fromFile(file, faceSize) {
		return new Promise((res, rej) =>
		{
			fs.readFile(file, (err, image) =>
			{
				NodeEquirectToCubemap(image, faceSize).then(images => res(images));
			});
		});
	}
}

/* Example:

fs.readFile('Hallway_seq.005.jpg', (err, image) =>
{
	NodeEquirectToCubemap.fromImage(image, 1024).then(faces => {
		console.log(faces.length);
	});
});

 */
