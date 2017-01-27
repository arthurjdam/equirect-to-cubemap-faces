const EquirectToCubemap = require('./src/transform');
const Canvas = require('canvas');
const Image = Canvas.Image;
const fs = require('fs');

export class NodeEquirectToCubemap {
	constructor(image, faceSize) {
		return new Promise((res, rej) => {
			let img = new Image;
			img.src = image;
			let canvas = new Canvas(img.width, img.height);
			let ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, img.width, img.height);
				
			var cs = EquirectToCubemap.equirectToCubemapFaces(ctx.getImageData(0, 0, img.width, img.height), faceSize);
			cs.map(img => img.pngStream());
			
			res(cs);
		});
	}
}

fs.readFile('Hallway_seq.005.jpg', function(err, image)
{
	new NodeEquirectToCubemap(image, 1024).then(faces => {
		console.log(faces.length);
	});
});