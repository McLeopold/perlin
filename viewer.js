// viewer.js

var Viewer = function (canvas, textarea, perlin, mp) {
  this.canvas = canvas;
  this.context = canvas.getContext("2d");
  this.textarea = textarea;
  this.mp = mp;
  this.perlin = perlin;
  this.gx = 0;
  this.gy = 0;
  this.gxs = canvas.width;
  this.gys = canvas.height;
};

Viewer.prototype.clear = function () {
  this.canvas.width = this.canvas.width;
};

Viewer.prototype.drawViaCallback = function (fn) {
  var w = this.canvas.width
    , h = this.canvas.height
  ;
  // ensure all pixels are opaque
  this.context.fillStyle = "#FFFFFF";
  this.context.fillRect(0, 0, w, h);
  this.mp.val('');
  var canvasData = this.context.getImageData(0,0,w,h)
    , idx = 0
    , x, y
    , r, g, b, a, s
    , pixel
    , gxs = this.gxs
    , gys = this.gys
    , gx = this.gx
    , gy = this.gy
    , noise = this.perlin.noise.bind(this.perlin)
    , turbulence = this.perlin.turbulence.bind(this.perlin)
    , bias = Perlin.bias
    , gain = Perlin.gain
    , dnoise = this.perlin.dnoise.bind(this.perlin)
    , dturbulence = this.perlin.dturbulence.bind(this.perlin)
  ;
  if ($('#simplex').is(':checked')) {
    noise = this.perlin.simplex.bind(this.perlin);
    turbulence = this.perlin.tsimplex.bind(this.perlin);
  }
  var start = new Date().getTime();
  var text = [];
  // loop over y first so canvasData is written sequentially
  for (y = 0; y < h; ++y) {
    for (x = 0; x < w; ++x) {
      // Index of the pixel in the array
      // idx = (x + y * w) * 4;    
      // The RGB values
      r = canvasData.data[idx + 0];
      g = canvasData.data[idx + 1];
      b = canvasData.data[idx + 2];
      a = canvasData.data[idx + 3];
      pixel = fn(r, g, b, a, null,
      	         x * gxs / w + gx, // transpose and scale the view
      	         y * gys / w + gy, // transpose and scale the view
      	         w, h,
      	         noise, turbulence, bias, gain, dnoise, dturbulence);
      canvasData.data[idx + 0] = pixel[0];
      canvasData.data[idx + 1] = pixel[1];
      canvasData.data[idx + 2] = pixel[2];
      // move to next pixel
      idx += 4

      s = pixel[4];
      if (s && typeof s === 'string' && s.length > 0 && text.length < 300) {
        text.push([s, x+1, y+9]);
      }
    }
  }
  var end = new Date().getTime();
  console.log("Time: " + (end - start));
  this.context.putImageData(canvasData, 0, 0);
    for (x = 0, xlen = text.length; x < xlen; ++x) {
      this.context.fillText(text[x][0], text[x][1], text[x][2]);
      this.mp.val(this.mp.val() + text[x][0] + '\n');
    }
    this.context.strokeStyle = "#ffffff";
};

Viewer.prototype.doPixelLoop = function () {
  var code = this.textarea.value
    , fn
  ;
  //code = "callback = function (pixel, x, y, w, h) {var r = pixel[0], g = pixel[1], b = pixel[2];\n" + code + ";\nreturn [r, g, b];}";
  code += ";\nreturn [r, g, b, a, s];";
  try {
    fn = new Function("r", "g", "b", "a", "s", "x", "y", "w", "h", "noise", "turbulence", "bias", "gain", "dnoise", "dturbulence", code);
    // eval(code);
  } catch (e) {
  	console.log("Error evaluating function: " + e.toString());
  }
  this.drawViaCallback(fn);
};

Viewer.prototype.view_in = function () {
  this.gy += this.gys / 4;
  this.gx += this.gxs / 4;
  this.gxs /= 2;
  this.gys /= 2;
  this.doPixelLoop();
}

Viewer.prototype.view_out = function () {
  this.gxs *= 2;
  this.gys *= 2;
  this.gy -= this.gys / 4;
  this.gx -= this.gxs / 4;
  this.doPixelLoop();
}

Viewer.prototype.view_up = function () {
  this.gy -= this.gys / 4;
  this.doPixelLoop();
}

Viewer.prototype.view_down = function () {
  this.gy += this.gys / 4;
  this.doPixelLoop();
}

Viewer.prototype.view_left = function () {
  this.gx -= this.gxs / 4;
  this.doPixelLoop();
}

Viewer.prototype.view_right = function () {
  this.gx += this.gxs / 4;
  this.doPixelLoop();
}

Viewer.prototype.view_reset = function () {
  this.gx = this.gy = 0;
  this.gxs = this.canvas.width;
  this.gys = this.canvas.height;
  this.doPixelLoop();
}