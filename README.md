# Equirect map to cubemap faces

Function that convert an equirectangular/latlong map into an array of cubemap faces (like you would use to send to OpenGL).

This is a 'node-ified' wrap around [ThomCC's implementation](https://github.com/thomcc/equirect-to-cubemap-faces)

## Installation

Will provide npm based install later

## Usage

Example:

```js

const NodeEquirectToCubemap = require('node-equirect-to-cubemap');

NodeEquirectToCubemap.fromFile('Hallway_seq.005.jpg', 512).then(images => {
	images.map((img, index) => {
		let out = fs.createWriteStream(__dirname + '/face_' + NodeEquirectToCubemap.order[index] + '.png');
		let str = img.pngStream();

		str.on('data', chunk => {
			out.write(chunk);
		});
	});
});

```

Returns:
6 Images. 