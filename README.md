# Equirect map to cubemap faces

Function that convert an equirectangular/latlong map into an array of cubemap faces (like you would use to send to OpenGL).

This is a 'node-ified' wrap around [ThomCC's implementation](https://github.com/thomcc/equirect-to-cubemap-faces)

Relies on [node-canvas](https://github.com/Automattic/node-canvas) which can run without a GPU dependency (which means it will run on a cheap EC2 instance).
For installation instructions for node-canvas (which requires Cairo and Pango), refer to their relevant [readme](https://github.com/Automattic/node-canvas#installation)

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

### License ###

The MIT License (MIT)

Copyright (c) 2017 Arthur Dam

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
