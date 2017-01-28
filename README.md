# Equirect map to cubemap faces

Function that convert an equirectangular/latlong map into an array of cubemap faces (like you would use to send to OpenGL).

This is a 'node-ified' wrap around [ThomCC's implementation](https://github.com/thomcc/equirect-to-cubemap-faces)

Relies on [node-canvas](https://github.com/Automattic/node-canvas) which can run without a GPU dependency (which means it will run on a cheap EC2 instance).

### Installation ###

```
npm i node-equirect-cubemap-faces
```

### Usage ###

Example:

```js
const NodeEquirectToCubemap = require('node-equirect-cubemap-faces');

NodeEquirectToCubemap.fromFile('Hallway_seq.005.jpg', 512).then(faces => {
	faces.map((img, index) => {
		// writes pngs to a file (in this case, 'face_top.png', 'face_left.png', etc.)
		let out = fs.createWriteStream(__dirname + '/face_' + NodeEquirectToCubemap.order[index] + '.png');
		let str = img.pngStream();

		str.on('data', chunk => {
			out.write(chunk);
		});
	});
});
```

Or, if you already read a file, just send it through as buffer and run transform like this:

```js
const NodeEquirectToCubemap = require('node-equirect-cubemap-faces');

fs.readFile('Hallway_seq.005.jpg', (err, image) =>
{
	NodeEquirectToCubemap.fromImage(image, 1024).then(faces => {
	// in this case, the output is written to an Object
		let out = {};
		for(let i = 0; i < faces.length; ++i)
		{
			out[NodeEquirectToCubemap.order[i]] = faces[i];
		}
		console.log(out);
	});
});
```

Returns:
6 Images. 