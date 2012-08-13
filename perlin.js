// perlin.js
Perlin = function (seed) {
  var p
    , r, i, j
  ;
  if (seed === undefined) {
    seed = Math.floor(Math.random() * 256);
  }
  if (seed === undefined) {
    p = [151,160,137, 91, 90, 15,131, 13,201, 95, 96, 53,194,233,  7,225,
         140, 36,103, 30, 69,142,  8, 99, 37,240, 21, 10, 23,190,  6,148,
         247,120,234, 75,  0, 26,197, 62, 94,252,219,203,117, 35, 11, 32,
          57,177, 33, 88,237,149, 56, 87,174, 20,125,136,171,168, 68,175,
          74,165, 71,134,139, 48, 27,166, 77,146,158,231, 83,111,229,122,
          60,211,133,230,220,105, 92, 41, 55, 46,245, 40,244,102,143, 54,
          65, 25, 63,161,  1,216, 80, 73,209, 76,132,187,208, 89, 18,169,
         200,196,135,130,116,188,159, 86,164,100,109,198,173,186,  3, 64,
          52,217,226,250,124,123,  5,202, 38,147,118,126,255, 82, 85,212,
         207,206, 59,227, 47, 16, 58, 17,182,189, 28, 42,223,183,170,213,
         119,248,152,  2, 44,154,163, 70,221,153,101,155,167, 43,172,  9,
         129, 22, 39,253, 19, 98,108,110, 79,113,224,232,178,185,112,104,
         218,246, 97,228,251, 34,242,193,238,210,144, 12,191,179,162,241,
          81, 51,145,235,249, 14,239,107, 49,192,214, 31,181,199,106,157,
         184, 84,204,176,115,121, 50, 45,127,  4,150,254,138,236,205, 93,
         222,114, 67, 29, 24, 72,243,141,128,195, 78, 66,215, 61,156,180 ];
    p = [];
    for (i = 0; i < 256; ++i) {
      p.push(i);
    }
  } else {
    r = new MersenneTwister(seed);
    p = [0];
    for (i = 1; i < 256; ++i) {
      j = Math.floor(r.random() * (i + 1));
      p[i] = p[j];
      p[j] = i;
    }
  }
  this.p = new Array(512);
  for (i = 0; i < 256; ++i) {
    this.p[256+i] = this.p[i] = p[i];
  }
};
// cubic
function fade(t) {
  return t * t * (3 - 2 * t);
}
// quintic
function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function lerp(t, a, b) {
  return a + t * (b - a);
}
// gradiant is not random like original implementation
// instead it chooses one of the directions from a cube center to the 12 edges
// (1,1,0), (-1,1,0), (0,-1,1) and (0,-1,-1) are duplicated for 16 options
function grad(hash, x, y, z) {
  var h = hash & 15;                      // CONVERT LO 4 BITS OF HASH CODE
  var u = h<8 ? x : y,                    // INTO 12 GRADIENT DIRECTIONS.
      v = h<4 ? y : h==12||h==14 ? x : z;
  return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
}

Perlin.prototype.random = function (x, y, z) {
  var p = this.p
    , X = Math.floor(x) & 255                   // FIND UNIT CUBE THAT
    , Y = Math.floor(y) & 255                   // CONTAINS POINT.
    , Z = Math.floor(z) & 255
  ;
  x -= Math.floor(x);                                // FIND RELATIVE X,Y,Z
  y -= Math.floor(y);                                // OF POINT IN CUBE.
  z -= Math.floor(z);
  var u = fade(x)                                // COMPUTE FADE CURVES
    , v = fade(y)                                // FOR EACH OF X,Y,Z.
    , w = fade(z)
  ;
  var A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z      // HASH COORDINATES OF
    , B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z      // THE 8 CUBE CORNERS,
  ;
  //     xyz,    x+yz,  xy+z,  x+y+z, xyz+,    x+yz+,   xy+z+,   x+y+z+
  //return [p[AA], p[BA], p[AB], p[BB], p[AA+1], p[BA+1], p[AB+1], p[BB+1]];
  return [
    grad(p[AA],   x,   y,   z   ),
    grad(p[BA],   x-1, y,   z   ),
    grad(p[AB],   x,   y-1, z   ),
    grad(p[BB],   x-1, y-1, z   ),
    grad(p[AA+1], x,   y,   z-1 ),
    grad(p[BA+1], x-1, y,   z-1 ),
    grad(p[AB+1], x,   y-1, z-1 ),
    grad(p[BB+1], x-1, y-1, z-1 )
  ];
}
Perlin.prototype.snoise = function (x, y, z) {
  var s = (x + y + z) / 3
    , i = Math.floor(x + s)
    , j = Math.floor(y + s)
    , k = Math.floor(z + s)
  ;
  s = (i + j + k) / 6;
  var u = x - i + s
    , v = y - j + s
    , w = z - k + s
  ;
  var A = [0, 0, 0];
  var hi = u >= w ? u >= v ? 0 : 1 : v >= w ? 1 : 2
    , lo = u <  w ? u <  v ? 0 : 1 : v <  w ? 1 : 2
  ;
  var shuffle = function (i, j, k) {
    return b(i, j, k, 0) +
           b(j, k, i, 1) +
           b(k, i, j, 2) +
           b(i, j, k, 3) +
           b(j, k, i, 4) +
           b(k, i, j, 5) +
           b(i, j, k, 6) +
           b(j, k, i, 7);
  }
  var T = [0x15, 0x38, 0x32, 0x2c, 0x0d, 0x13, 0x07, 0x2a];
  var b = function (i, j, k, B) {
    /*var bb = function (N, B) {
      return N>>B & 1;
    }*/
//    return T[bb(i, B)<<2 | bb(j, B)<<1 | bb(k, B)];
    return T[(i>>B&1)<<2 | (j>>B)&1<<1 | (k<<B&1)];
  }
  var K = function (a) {
    var s = (A[0] + A[1] + A[2]) / 6
      , x = u - A[0] + s
      , y = v - A[1] + s
      , z = w - A[2] + s
      , t = 0.6 - x*x - y*y - z*z
    ;
    var h = shuffle(i + A[0], j + A[1], k + A[2]);
    A[a]++;
    if (t < 0) {
      return 0;
    }
    var b5 = h >> 5 & 1
      , b4 = h >> 4 & 1
      , b3 = h >> 3 & 1
      , b2 = h >> 2 & 1
      , b = h & 3
    ;
    var p = b === 1 ? x : b === 2 ? y : z
      , q = b === 1 ? y : b === 2 ? z : x
      , r = b === 1 ? z : b === 2 ? x : y
    ;
    p = (b5 === b3 ? -p : p);
    q = (b5 === b4 ? -q : q);
    r = (b5 !== (b4^b3) ? -r : r);
    t *= t;
    return 8 * t * t * (p + (b === 0 ? q + r : b2 === 0 ? q : r));
  }
  return 4 * (K(hi) + K(3 - hi - lo) + K(lo) + K(0));
}

function dot(g, x, y, z) {
  return g[0] * x + g[1] * y + g[2] * z;
}
var grad3 = [[ 1, 1, 0],
             [-1, 1, 0],
             [ 1,-1, 0],
             [-1,-1, 0],
             [ 1, 0, 1],
             [-1, 0, 1],
             [ 1, 0,-1],
             [-1, 0,-1],
             [ 0, 1, 1],
             [ 0,-1, 1],
             [ 0, 1,-1],
             [ 0,-1,-1]];
Perlin.prototype.simplex = function (x, y, z) {
  var p = this.p;
  var n0, n1, n2, n3;
  var s = (x + y + z) * 1/3
    , i = Math.floor(x + s)
    , j = Math.floor(y + s)
    , k = Math.floor(z + s)
  ;

  var G3 = 1/6;
  var t = (i + j + k) * G3;
  var X0 = i - t
    , Y0 = j - t
    , Z0 = k - t
    , x0 = x - X0
    , y0 = y - Y0
    , z0 = z - Z0
  ;

  var i1, j1, k1, i2, j2, k2;

  if (x0 >= y0) {
    if (y0 >= z0) {
      i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
    } else if (x0 >= z0) {
      i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
    } else {
      i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
    }
  } else {
    if (y0 < z0) {
      i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
    } else if (x0 < z0) {
      i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
    } else {
      i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
    }
  }

  var x1 = x0 - i1 + G3
    , y1 = y0 - j1 + G3
    , z1 = z0 - k1 + G3
    , x2 = x0 - i2 + 2.0 * G3
    , y2 = y0 - j2 + 2.0 * G3
    , z2 = z0 - k2 + 2.0 * G3
    , x3 = x0 - 1.0 + 3.0 * G3
    , y3 = y0 - 1.0 + 3.0 * G3
    , z3 = z0 - 1.0 + 3.0 * G3
  ;

  var ii = i & 255
    , jj = j & 255
    , kk = k & 255
  ;
  var gi0 = p[ii + p[jj + p[kk]]] % 12
    , gi1 = p[ii + i1 + p[jj + j1 + p[kk + k1]]] % 12
    , gi2 = p[ii + i2 + p[jj + j2 + p[kk + k2]]] % 12
    , gi3 = p[ii + 1 + p[jj + 1 + p[kk + 1]]] % 12
  ;
  var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
  if (t0 < 0) {
    n0 = 0.0;
  } else {
    t0 *= t0;
    n0 = t0 * t0 * dot(grad3[gi0], x0, y0, z0);
  }
  var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
  if (t1 < 0) {
    n1 = 0.0;
  } else {
    t1 *= t1;
    n1 = t1 * t1 * dot(grad3[gi1], x1, y1, z1);
  }
  var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
  if (t2 < 0) {
    n2 = 0.0;
  } else {
    t2 *= t2;
    n2 = t2 * t2 * dot(grad3[gi2], x2, y2, z2);
  }
  var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
  if (t3 < 0) {
    n3 = 0.0;
  } else {
    t3 *= t3;
    n3 = t3 * t3 * dot(grad3[gi3], x3, y3, z3);
  }
  return 32.0 * (n0 + n1 + n2 + n3);
}

Perlin.prototype.tsimplex = function (x, y, z, octaves) {
  var f = 1
    , n = 0
    , i
  ;
  for (i = 0; i < octaves; i++, f *= 2) {
    n += this.simplex(x * f, y * f, z) / f;
  }
  return n;
}

Perlin.prototype.noise = function(x, y, z) {
  var p = this.p
    , X = Math.floor(x) & 255                   // FIND UNIT CUBE THAT
    , Y = Math.floor(y) & 255                   // CONTAINS POINT.
    , Z = Math.floor(z) & 255
  ;
  x -= Math.floor(x);                                // FIND RELATIVE X,Y,Z
  y -= Math.floor(y);                                // OF POINT IN CUBE.
  z -= Math.floor(z);
  var u = fade(x)                                // COMPUTE FADE CURVES
    , v = fade(y)                                // FOR EACH OF X,Y,Z.
    , w = fade(z)
  ;
  var A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z      // HASH COORDINATES OF
    , B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z      // THE 8 CUBE CORNERS,
  ;
  return lerp(w, lerp(v, lerp(u, grad(p[AA  ], x  , y  , z   ),  // AND ADD
                                 grad(p[BA  ], x-1, y  , z   )), // BLENDED
                         lerp(u, grad(p[AB  ], x  , y-1, z   ),  // RESULTS
                                 grad(p[BB  ], x-1, y-1, z   ))),// FROM  8
                 lerp(v, lerp(u, grad(p[AA+1], x  , y  , z-1 ),  // CORNERS
                                 grad(p[BA+1], x-1, y  , z-1 )), // OF CUBE
                         lerp(u, grad(p[AB+1], x  , y-1, z-1 ),
                                 grad(p[BB+1], x-1, y-1, z-1 ))));
}

function dfade(t) {
  return 30 * t * t * (t * (t - 2) + 1);
}
Perlin.prototype.dnoise = function (x, y, z) {
  var p = this.p
    , X = Math.floor(x) & 255                   // FIND UNIT CUBE THAT
    , Y = Math.floor(y) & 255                   // CONTAINS POINT.
    , Z = Math.floor(z) & 255
  ;
  x -= Math.floor(x);                                // FIND RELATIVE X,Y,Z
  y -= Math.floor(y);                                // OF POINT IN CUBE.
  z -= Math.floor(z);
  var du = dfade(x)
    , dv = dfade(y)
    , dw = dfade(z)
  ;
  var u = fade(x)
    , v = fade(y)
    , w = fade(z)
  ;
  var A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z      // HASH COORDINATES OF
    , B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z      // THE 8 CUBE CORNERS,
  ;
  var a = grad(p[AA  ], x  , y  , z   )
    , b = grad(p[BA  ], x-1, y  , z   )
    , c = grad(p[AB  ], x  , y-1, z   )
    , d = grad(p[BB  ], x-1, y-1, z   )
    , e = grad(p[AA+1], x  , y  , z-1 )
    , f = grad(p[BA+1], x-1, y  , z-1 )
    , g = grad(p[AB+1], x  , y-1, z-1 )
    , h = grad(p[BB+1], x-1, y-1, z-1 )
  ;
  var k0 =   a
    , k1 =   b - a
    , k2 =   c - a
    , k3 =   e - a
    , k4 =   a - b - c + d
    , k5 =   a - c - e + g
    , k6 =   a - b - e + f
    , k7 = - a + b + c - d + e - f - g + h
  ;
  return [
    k0 + k1*u + k2*v + k3*w + k4*u*v + k5*v*w + k6*w*u + k7*u*v*w,
    du * (k1 + k4*v + k6*w + k7*v*w),
    dv * (k2 + k5*w + k4*u + k7*w*u),
    dw * (k3 + k6*u + k5*v + k7*u*v)
  ];
}

Perlin.prototype.turbulence = function (x, y, z, octaves) {
  var f = 1
    , n = 0
    , i
  ;
  for (i = 0; i < octaves; i++, f *= 2) {
    n += this.noise(x * f, y * f, z) / f;
  }
  return n;
}

Perlin.prototype.dturbulence = function (x, y, z, octaves) {
  var f = 1
    , n = [0, 0, 0, 0]
    , i
  ;
  for (i = 0; i < octaves; i++, f *= 2) {
    v = this.dnoise(x * f, y * f, z);
    n[0] += v[0] / f;
    n[1] += v[1] / f;
    n[2] += v[2] / f;
    n[3] += v[3] / f;
  }
  return n;
}

// perlin bias modified to work with -1 to 1 instead of 0 to 1
Perlin.bias = function (x, B)  {
  return Math.pow((x + 1) / 2, Math.log(B) / Math.log(0.5)) * 2 - 1;
}

// perlin gain modified to work with -1 to 1 instead of 0 to 1
Perlin.gain = function (x, G) {
  if (x < 0) {
    return (Perlin.bias(2 * x + 1, 1 - G) - 1) / 2;
  } else if (x > 0) {
    return (1 - Perlin.bias(1 - 2 * x, 1 - G)) / 2;
  } else {
    return x;
  }
}
