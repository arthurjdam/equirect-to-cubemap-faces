const gamma = 2.2;
const igamma = 1.0 / gamma;

class EquirectToCubemap {
	constructor()
	{
		
	}
	
	static clamp(v, lo, hi)
	{
		return Math.min(hi, Math.max(lo, v));
	}
	
	static srgbToLinear(v)
	{
		return Math.pow(+v * (1.0 / 255.0), gamma);
	}
	
	static linearToSRGB(v)
	{
		return (Math.pow(v, igamma) * 255.0) | 0;
	}
	
	static nearestPowerOfTwo(n)
	{
		return 1 << Math.round(Math.log(n) / Math.log(2))
	}
	
	static imageDataToImageData(inPixels, facePixArray)
	{
		if (facePixArray.length !== 6)
		{
			throw new Error("facePixArray length must be 6!");
		}
		var edge = facePixArray[0].width | 0;
		var inWidth = inPixels.width | 0;
		var inHeight = inPixels.height | 0;
		var inData = inPixels.data;
		
		for (var face = 0; face < 6; ++face)
		{
			var facePixels = facePixArray[face];
			var faceData = facePixels.data;
			
			for (let j = 0; j < edge; ++j)
			{
				for (let i = 0; i < edge; ++i)
				{
					let x = 0.0;
					let y = 0.0;
					let z = 0.0;
					
					let a = 2.0 * i / edge;
					let b = 2.0 * j / edge;
					
					switch (face)
					{
						case 0:
							x = 1.0 - a;
							y = 1.0;
							z = 1.0 - b;
							break; // right  (+x)
						case 1:
							x = a - 1.0;
							y = -1.0;
							z = 1.0 - b;
							break; // left   (-x)
						case 2:
							x = b - 1.0;
							y = a - 1.0;
							z = 1.0;
							break; // top    (+y)
						case 3:
							x = 1.0 - b;
							y = a - 1.0;
							z = -1.0;
							break; // bottom (-y)
						case 4:
							x = 1.0;
							y = a - 1.0;
							z = 1.0 - b;
							break; // front  (+z)
						case 5:
							x = -1.0;
							y = 1.0 - a;
							z = 1.0 - b;
							break; // back   (-z)
					}
					
					let theta = -Math.atan2(y, x);
					let rad = Math.hypot(x, y);
					let phi = Math.atan2(z, rad);
					
					let uf = 2.0 * (inWidth / 4) * ((theta + Math.PI) / Math.PI);
					let vf = 2.0 * (inWidth / 4) * ((Math.PI / 2 - phi) / Math.PI);
					
					//bilinear interpolation
					let ui = Math.floor(uf);
					let vi = Math.floor(vf);
					
					let u2 = ui + 1;
					let v2 = vi + 1;
					
					let mu = uf - ui;
					let nu = vf - vi;
					
					let pA = ((ui % inWidth) + inWidth * EquirectToCubemap.clamp(vi, 0, inHeight - 1)) << 2;
					let pB = ((u2 % inWidth) + inWidth * EquirectToCubemap.clamp(vi, 0, inHeight - 1)) << 2;
					let pC = ((ui % inWidth) + inWidth * EquirectToCubemap.clamp(v2, 0, inHeight - 1)) << 2;
					let pD = ((u2 % inWidth) + inWidth * EquirectToCubemap.clamp(v2, 0, inHeight - 1)) << 2;
					
					let rA = EquirectToCubemap.srgbToLinear(inData[pA + 0] | 0), gA = EquirectToCubemap.srgbToLinear(inData[pA + 1] | 0), bA = EquirectToCubemap.srgbToLinear(inData[pA + 2] | 0), aA = (inData[pA + 3] | 0) * (1.0 / 255.0);
					let rB = EquirectToCubemap.srgbToLinear(inData[pB + 0] | 0), gB = EquirectToCubemap.srgbToLinear(inData[pB + 1] | 0), bB = EquirectToCubemap.srgbToLinear(inData[pB + 2] | 0), aB = (inData[pB + 3] | 0) * (1.0 / 255.0);
					let rC = EquirectToCubemap.srgbToLinear(inData[pC + 0] | 0), gC = EquirectToCubemap.srgbToLinear(inData[pC + 1] | 0), bC = EquirectToCubemap.srgbToLinear(inData[pC + 2] | 0), aC = (inData[pC + 3] | 0) * (1.0 / 255.0);
					let rD = EquirectToCubemap.srgbToLinear(inData[pD + 0] | 0), gD = EquirectToCubemap.srgbToLinear(inData[pD + 1] | 0), bD = EquirectToCubemap.srgbToLinear(inData[pD + 2] | 0), aD = (inData[pD + 3] | 0) * (1.0 / 255.0);
					
					let _r = (rA * (1.0 - mu) * (1.0 - nu) + rB * mu * (1.0 - nu) + rC * (1.0 - mu) * nu + rD * mu * nu);
					let _g = (gA * (1.0 - mu) * (1.0 - nu) + gB * mu * (1.0 - nu) + gC * (1.0 - mu) * nu + gD * mu * nu);
					let _b = (bA * (1.0 - mu) * (1.0 - nu) + bB * mu * (1.0 - nu) + bC * (1.0 - mu) * nu + bD * mu * nu);
					let _a = (aA * (1.0 - mu) * (1.0 - nu) + aB * mu * (1.0 - nu) + aC * (1.0 - mu) * nu + aD * mu * nu);
					
					let outPos = (i + j * edge) << 2;
					
					faceData[outPos + 0] = EquirectToCubemap.linearToSRGB(_r) | 0;
					faceData[outPos + 1] = EquirectToCubemap.linearToSRGB(_g) | 0;
					faceData[outPos + 2] = EquirectToCubemap.linearToSRGB(_b) | 0;
					faceData[outPos + 3] = (_a * 255.0) | 0;
				}
			}
		}
		return facePixArray;
	}
	
	static imageGetPixels(image)
	{
		if (image.data)
		{
			return image;
		}
		var canvas = image, ctx = null;
		if (canvas.tagName !== 'CANVAS')
		{
			canvas = document.createElement('canvas');
			canvas.width = image.width;
			canvas.height = image.height;
			ctx = canvas.getContext('2d');
			ctx.drawImage(image, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
		}
		else
		{
			ctx = canvas.getContext('2d');
		}
		return ctx.getImageData(0, 0, canvas.width, canvas.height);
	}
	
	static equirectToCubemapFaces(image, faceSize)
	{
		var inPixels = EquirectToCubemap.imageGetPixels(image);

		if (!faceSize)
		{
			faceSize = EquirectToCubemap.nearestPowerOfTwo(image.width / 4) | 0;
		}

		if (typeof faceSize !== 'number')
		{
			throw new Error("faceSize needed to be a number or missing");
		}
		
		var faces = [];
		
		if (typeof window === 'undefined') {
			const Canvas = require('canvas');
			
			for (let i = 0; i < 6; ++i)
			{
				faces.push(new Canvas(faceSize, faceSize));
			}
		}
		else
		{
			for (let i = 0; i < 6; ++i)
			{
				let c = document.createElement('canvas');
				c.width = faceSize;
				c.height = faceSize;
				faces.push(c);
			}
		}
		
		EquirectToCubemap.imageDataToImageData(inPixels, faces.map(function (canv)
		{
			return canv.getContext('2d').createImageData(canv.width, canv.height);
		})).forEach(function (imageData, i)
		{
			faces[i].getContext('2d').putImageData(imageData, 0, 0);
		});
		
		return faces;
	}
}

module.exports = EquirectToCubemap;