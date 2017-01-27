# Equirect map to cubemap faces

Function that convert an equirectangular/latlong map into an array of cubemap faces (like you would use to send to OpenGL).

This is a 'node-ified' fork from [ThomCC's implementation](https://github.com/thomcc/equirect-to-cubemap-faces)

## Installation

Will provide npm based install later

## Usage

Example:

```js
const NodeEquirectToCubemap = require('node-equirect-to-cubemap');

new NodeEquirectToCubemap(image, 1024).then(faces => {
	console.log(faces.length);
});
```
