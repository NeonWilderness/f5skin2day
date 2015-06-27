(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var colorString = require('color-string')
var parse = require('parse-color')
var convert = require('color-convert')()

module.exports = function (color, change) {
  var hsla = parse(color).hsla
  hsla[2] += change
  hsla[2] = Math.min(100, Math.max(0, hsla[2]))

  if(hsla[3] === 1) return colorString.hexString(convert.hsl(hsla).rgb())
  return colorString.hslaString(hsla)
}
},{"color-convert":3,"color-string":4,"parse-color":6}],2:[function(require,module,exports){
/* MIT license */

module.exports = {
  rgb2hsl: rgb2hsl,
  rgb2hsv: rgb2hsv,
  rgb2hwb: rgb2hwb,
  rgb2cmyk: rgb2cmyk,
  rgb2keyword: rgb2keyword,
  rgb2xyz: rgb2xyz,
  rgb2lab: rgb2lab,
  rgb2lch: rgb2lch,

  hsl2rgb: hsl2rgb,
  hsl2hsv: hsl2hsv,
  hsl2hwb: hsl2hwb,
  hsl2cmyk: hsl2cmyk,
  hsl2keyword: hsl2keyword,

  hsv2rgb: hsv2rgb,
  hsv2hsl: hsv2hsl,
  hsv2hwb: hsv2hwb,
  hsv2cmyk: hsv2cmyk,
  hsv2keyword: hsv2keyword,

  hwb2rgb: hwb2rgb,
  hwb2hsl: hwb2hsl,
  hwb2hsv: hwb2hsv,
  hwb2cmyk: hwb2cmyk,
  hwb2keyword: hwb2keyword,

  cmyk2rgb: cmyk2rgb,
  cmyk2hsl: cmyk2hsl,
  cmyk2hsv: cmyk2hsv,
  cmyk2hwb: cmyk2hwb,
  cmyk2keyword: cmyk2keyword,

  keyword2rgb: keyword2rgb,
  keyword2hsl: keyword2hsl,
  keyword2hsv: keyword2hsv,
  keyword2hwb: keyword2hwb,
  keyword2cmyk: keyword2cmyk,
  keyword2lab: keyword2lab,
  keyword2xyz: keyword2xyz,

  xyz2rgb: xyz2rgb,
  xyz2lab: xyz2lab,
  xyz2lch: xyz2lch,

  lab2xyz: lab2xyz,
  lab2rgb: lab2rgb,
  lab2lch: lab2lch,

  lch2lab: lch2lab,
  lch2xyz: lch2xyz,
  lch2rgb: lch2rgb
}


function rgb2hsl(rgb) {
  var r = rgb[0]/255,
      g = rgb[1]/255,
      b = rgb[2]/255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      delta = max - min,
      h, s, l;

  if (max == min)
    h = 0;
  else if (r == max)
    h = (g - b) / delta;
  else if (g == max)
    h = 2 + (b - r) / delta;
  else if (b == max)
    h = 4 + (r - g)/ delta;

  h = Math.min(h * 60, 360);

  if (h < 0)
    h += 360;

  l = (min + max) / 2;

  if (max == min)
    s = 0;
  else if (l <= 0.5)
    s = delta / (max + min);
  else
    s = delta / (2 - max - min);

  return [h, s * 100, l * 100];
}

function rgb2hsv(rgb) {
  var r = rgb[0],
      g = rgb[1],
      b = rgb[2],
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      delta = max - min,
      h, s, v;

  if (max == 0)
    s = 0;
  else
    s = (delta/max * 1000)/10;

  if (max == min)
    h = 0;
  else if (r == max)
    h = (g - b) / delta;
  else if (g == max)
    h = 2 + (b - r) / delta;
  else if (b == max)
    h = 4 + (r - g) / delta;

  h = Math.min(h * 60, 360);

  if (h < 0)
    h += 360;

  v = ((max / 255) * 1000) / 10;

  return [h, s, v];
}

function rgb2hwb(rgb) {
  var r = rgb[0],
      g = rgb[1],
      b = rgb[2],
      h = rgb2hsl(rgb)[0],
      w = 1/255 * Math.min(r, Math.min(g, b)),
      b = 1 - 1/255 * Math.max(r, Math.max(g, b));

  return [h, w * 100, b * 100];
}

function rgb2cmyk(rgb) {
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      c, m, y, k;

  k = Math.min(1 - r, 1 - g, 1 - b);
  c = (1 - r - k) / (1 - k) || 0;
  m = (1 - g - k) / (1 - k) || 0;
  y = (1 - b - k) / (1 - k) || 0;
  return [c * 100, m * 100, y * 100, k * 100];
}

function rgb2keyword(rgb) {
  return reverseKeywords[JSON.stringify(rgb)];
}

function rgb2xyz(rgb) {
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255;

  // assume sRGB
  r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
  g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
  b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

  var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
  var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
  var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

  return [x * 100, y *100, z * 100];
}

function rgb2lab(rgb) {
  var xyz = rgb2xyz(rgb),
        x = xyz[0],
        y = xyz[1],
        z = xyz[2],
        l, a, b;

  x /= 95.047;
  y /= 100;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  l = (116 * y) - 16;
  a = 500 * (x - y);
  b = 200 * (y - z);

  return [l, a, b];
}

function rgb2lch(args) {
  return lab2lch(rgb2lab(args));
}

function hsl2rgb(hsl) {
  var h = hsl[0] / 360,
      s = hsl[1] / 100,
      l = hsl[2] / 100,
      t1, t2, t3, rgb, val;

  if (s == 0) {
    val = l * 255;
    return [val, val, val];
  }

  if (l < 0.5)
    t2 = l * (1 + s);
  else
    t2 = l + s - l * s;
  t1 = 2 * l - t2;

  rgb = [0, 0, 0];
  for (var i = 0; i < 3; i++) {
    t3 = h + 1 / 3 * - (i - 1);
    t3 < 0 && t3++;
    t3 > 1 && t3--;

    if (6 * t3 < 1)
      val = t1 + (t2 - t1) * 6 * t3;
    else if (2 * t3 < 1)
      val = t2;
    else if (3 * t3 < 2)
      val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
    else
      val = t1;

    rgb[i] = val * 255;
  }

  return rgb;
}

function hsl2hsv(hsl) {
  var h = hsl[0],
      s = hsl[1] / 100,
      l = hsl[2] / 100,
      sv, v;

  if(l === 0) {
      // no need to do calc on black
      // also avoids divide by 0 error
      return [0, 0, 0];
  }

  l *= 2;
  s *= (l <= 1) ? l : 2 - l;
  v = (l + s) / 2;
  sv = (2 * s) / (l + s);
  return [h, sv * 100, v * 100];
}

function hsl2hwb(args) {
  return rgb2hwb(hsl2rgb(args));
}

function hsl2cmyk(args) {
  return rgb2cmyk(hsl2rgb(args));
}

function hsl2keyword(args) {
  return rgb2keyword(hsl2rgb(args));
}


function hsv2rgb(hsv) {
  var h = hsv[0] / 60,
      s = hsv[1] / 100,
      v = hsv[2] / 100,
      hi = Math.floor(h) % 6;

  var f = h - Math.floor(h),
      p = 255 * v * (1 - s),
      q = 255 * v * (1 - (s * f)),
      t = 255 * v * (1 - (s * (1 - f))),
      v = 255 * v;

  switch(hi) {
    case 0:
      return [v, t, p];
    case 1:
      return [q, v, p];
    case 2:
      return [p, v, t];
    case 3:
      return [p, q, v];
    case 4:
      return [t, p, v];
    case 5:
      return [v, p, q];
  }
}

function hsv2hsl(hsv) {
  var h = hsv[0],
      s = hsv[1] / 100,
      v = hsv[2] / 100,
      sl, l;

  l = (2 - s) * v;
  sl = s * v;
  sl /= (l <= 1) ? l : 2 - l;
  sl = sl || 0;
  l /= 2;
  return [h, sl * 100, l * 100];
}

function hsv2hwb(args) {
  return rgb2hwb(hsv2rgb(args))
}

function hsv2cmyk(args) {
  return rgb2cmyk(hsv2rgb(args));
}

function hsv2keyword(args) {
  return rgb2keyword(hsv2rgb(args));
}

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
function hwb2rgb(hwb) {
  var h = hwb[0] / 360,
      wh = hwb[1] / 100,
      bl = hwb[2] / 100,
      ratio = wh + bl,
      i, v, f, n;

  // wh + bl cant be > 1
  if (ratio > 1) {
    wh /= ratio;
    bl /= ratio;
  }

  i = Math.floor(6 * h);
  v = 1 - bl;
  f = 6 * h - i;
  if ((i & 0x01) != 0) {
    f = 1 - f;
  }
  n = wh + f * (v - wh);  // linear interpolation

  switch (i) {
    default:
    case 6:
    case 0: r = v; g = n; b = wh; break;
    case 1: r = n; g = v; b = wh; break;
    case 2: r = wh; g = v; b = n; break;
    case 3: r = wh; g = n; b = v; break;
    case 4: r = n; g = wh; b = v; break;
    case 5: r = v; g = wh; b = n; break;
  }

  return [r * 255, g * 255, b * 255];
}

function hwb2hsl(args) {
  return rgb2hsl(hwb2rgb(args));
}

function hwb2hsv(args) {
  return rgb2hsv(hwb2rgb(args));
}

function hwb2cmyk(args) {
  return rgb2cmyk(hwb2rgb(args));
}

function hwb2keyword(args) {
  return rgb2keyword(hwb2rgb(args));
}

function cmyk2rgb(cmyk) {
  var c = cmyk[0] / 100,
      m = cmyk[1] / 100,
      y = cmyk[2] / 100,
      k = cmyk[3] / 100,
      r, g, b;

  r = 1 - Math.min(1, c * (1 - k) + k);
  g = 1 - Math.min(1, m * (1 - k) + k);
  b = 1 - Math.min(1, y * (1 - k) + k);
  return [r * 255, g * 255, b * 255];
}

function cmyk2hsl(args) {
  return rgb2hsl(cmyk2rgb(args));
}

function cmyk2hsv(args) {
  return rgb2hsv(cmyk2rgb(args));
}

function cmyk2hwb(args) {
  return rgb2hwb(cmyk2rgb(args));
}

function cmyk2keyword(args) {
  return rgb2keyword(cmyk2rgb(args));
}


function xyz2rgb(xyz) {
  var x = xyz[0] / 100,
      y = xyz[1] / 100,
      z = xyz[2] / 100,
      r, g, b;

  r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
  g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
  b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

  // assume sRGB
  r = r > 0.0031308 ? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
    : r = (r * 12.92);

  g = g > 0.0031308 ? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
    : g = (g * 12.92);

  b = b > 0.0031308 ? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
    : b = (b * 12.92);

  r = Math.min(Math.max(0, r), 1);
  g = Math.min(Math.max(0, g), 1);
  b = Math.min(Math.max(0, b), 1);

  return [r * 255, g * 255, b * 255];
}

function xyz2lab(xyz) {
  var x = xyz[0],
      y = xyz[1],
      z = xyz[2],
      l, a, b;

  x /= 95.047;
  y /= 100;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  l = (116 * y) - 16;
  a = 500 * (x - y);
  b = 200 * (y - z);

  return [l, a, b];
}

function xyz2lch(args) {
  return lab2lch(xyz2lab(args));
}

function lab2xyz(lab) {
  var l = lab[0],
      a = lab[1],
      b = lab[2],
      x, y, z, y2;

  if (l <= 8) {
    y = (l * 100) / 903.3;
    y2 = (7.787 * (y / 100)) + (16 / 116);
  } else {
    y = 100 * Math.pow((l + 16) / 116, 3);
    y2 = Math.pow(y / 100, 1/3);
  }

  x = x / 95.047 <= 0.008856 ? x = (95.047 * ((a / 500) + y2 - (16 / 116))) / 7.787 : 95.047 * Math.pow((a / 500) + y2, 3);

  z = z / 108.883 <= 0.008859 ? z = (108.883 * (y2 - (b / 200) - (16 / 116))) / 7.787 : 108.883 * Math.pow(y2 - (b / 200), 3);

  return [x, y, z];
}

function lab2lch(lab) {
  var l = lab[0],
      a = lab[1],
      b = lab[2],
      hr, h, c;

  hr = Math.atan2(b, a);
  h = hr * 360 / 2 / Math.PI;
  if (h < 0) {
    h += 360;
  }
  c = Math.sqrt(a * a + b * b);
  return [l, c, h];
}

function lab2rgb(args) {
  return xyz2rgb(lab2xyz(args));
}

function lch2lab(lch) {
  var l = lch[0],
      c = lch[1],
      h = lch[2],
      a, b, hr;

  hr = h / 360 * 2 * Math.PI;
  a = c * Math.cos(hr);
  b = c * Math.sin(hr);
  return [l, a, b];
}

function lch2xyz(args) {
  return lab2xyz(lch2lab(args));
}

function lch2rgb(args) {
  return lab2rgb(lch2lab(args));
}

function keyword2rgb(keyword) {
  return cssKeywords[keyword];
}

function keyword2hsl(args) {
  return rgb2hsl(keyword2rgb(args));
}

function keyword2hsv(args) {
  return rgb2hsv(keyword2rgb(args));
}

function keyword2hwb(args) {
  return rgb2hwb(keyword2rgb(args));
}

function keyword2cmyk(args) {
  return rgb2cmyk(keyword2rgb(args));
}

function keyword2lab(args) {
  return rgb2lab(keyword2rgb(args));
}

function keyword2xyz(args) {
  return rgb2xyz(keyword2rgb(args));
}

var cssKeywords = {
  aliceblue:  [240,248,255],
  antiquewhite: [250,235,215],
  aqua: [0,255,255],
  aquamarine: [127,255,212],
  azure:  [240,255,255],
  beige:  [245,245,220],
  bisque: [255,228,196],
  black:  [0,0,0],
  blanchedalmond: [255,235,205],
  blue: [0,0,255],
  blueviolet: [138,43,226],
  brown:  [165,42,42],
  burlywood:  [222,184,135],
  cadetblue:  [95,158,160],
  chartreuse: [127,255,0],
  chocolate:  [210,105,30],
  coral:  [255,127,80],
  cornflowerblue: [100,149,237],
  cornsilk: [255,248,220],
  crimson:  [220,20,60],
  cyan: [0,255,255],
  darkblue: [0,0,139],
  darkcyan: [0,139,139],
  darkgoldenrod:  [184,134,11],
  darkgray: [169,169,169],
  darkgreen:  [0,100,0],
  darkgrey: [169,169,169],
  darkkhaki:  [189,183,107],
  darkmagenta:  [139,0,139],
  darkolivegreen: [85,107,47],
  darkorange: [255,140,0],
  darkorchid: [153,50,204],
  darkred:  [139,0,0],
  darksalmon: [233,150,122],
  darkseagreen: [143,188,143],
  darkslateblue:  [72,61,139],
  darkslategray:  [47,79,79],
  darkslategrey:  [47,79,79],
  darkturquoise:  [0,206,209],
  darkviolet: [148,0,211],
  deeppink: [255,20,147],
  deepskyblue:  [0,191,255],
  dimgray:  [105,105,105],
  dimgrey:  [105,105,105],
  dodgerblue: [30,144,255],
  firebrick:  [178,34,34],
  floralwhite:  [255,250,240],
  forestgreen:  [34,139,34],
  fuchsia:  [255,0,255],
  gainsboro:  [220,220,220],
  ghostwhite: [248,248,255],
  gold: [255,215,0],
  goldenrod:  [218,165,32],
  gray: [128,128,128],
  green:  [0,128,0],
  greenyellow:  [173,255,47],
  grey: [128,128,128],
  honeydew: [240,255,240],
  hotpink:  [255,105,180],
  indianred:  [205,92,92],
  indigo: [75,0,130],
  ivory:  [255,255,240],
  khaki:  [240,230,140],
  lavender: [230,230,250],
  lavenderblush:  [255,240,245],
  lawngreen:  [124,252,0],
  lemonchiffon: [255,250,205],
  lightblue:  [173,216,230],
  lightcoral: [240,128,128],
  lightcyan:  [224,255,255],
  lightgoldenrodyellow: [250,250,210],
  lightgray:  [211,211,211],
  lightgreen: [144,238,144],
  lightgrey:  [211,211,211],
  lightpink:  [255,182,193],
  lightsalmon:  [255,160,122],
  lightseagreen:  [32,178,170],
  lightskyblue: [135,206,250],
  lightslategray: [119,136,153],
  lightslategrey: [119,136,153],
  lightsteelblue: [176,196,222],
  lightyellow:  [255,255,224],
  lime: [0,255,0],
  limegreen:  [50,205,50],
  linen:  [250,240,230],
  magenta:  [255,0,255],
  maroon: [128,0,0],
  mediumaquamarine: [102,205,170],
  mediumblue: [0,0,205],
  mediumorchid: [186,85,211],
  mediumpurple: [147,112,219],
  mediumseagreen: [60,179,113],
  mediumslateblue:  [123,104,238],
  mediumspringgreen:  [0,250,154],
  mediumturquoise:  [72,209,204],
  mediumvioletred:  [199,21,133],
  midnightblue: [25,25,112],
  mintcream:  [245,255,250],
  mistyrose:  [255,228,225],
  moccasin: [255,228,181],
  navajowhite:  [255,222,173],
  navy: [0,0,128],
  oldlace:  [253,245,230],
  olive:  [128,128,0],
  olivedrab:  [107,142,35],
  orange: [255,165,0],
  orangered:  [255,69,0],
  orchid: [218,112,214],
  palegoldenrod:  [238,232,170],
  palegreen:  [152,251,152],
  paleturquoise:  [175,238,238],
  palevioletred:  [219,112,147],
  papayawhip: [255,239,213],
  peachpuff:  [255,218,185],
  peru: [205,133,63],
  pink: [255,192,203],
  plum: [221,160,221],
  powderblue: [176,224,230],
  purple: [128,0,128],
  rebeccapurple: [102, 51, 153],
  red:  [255,0,0],
  rosybrown:  [188,143,143],
  royalblue:  [65,105,225],
  saddlebrown:  [139,69,19],
  salmon: [250,128,114],
  sandybrown: [244,164,96],
  seagreen: [46,139,87],
  seashell: [255,245,238],
  sienna: [160,82,45],
  silver: [192,192,192],
  skyblue:  [135,206,235],
  slateblue:  [106,90,205],
  slategray:  [112,128,144],
  slategrey:  [112,128,144],
  snow: [255,250,250],
  springgreen:  [0,255,127],
  steelblue:  [70,130,180],
  tan:  [210,180,140],
  teal: [0,128,128],
  thistle:  [216,191,216],
  tomato: [255,99,71],
  turquoise:  [64,224,208],
  violet: [238,130,238],
  wheat:  [245,222,179],
  white:  [255,255,255],
  whitesmoke: [245,245,245],
  yellow: [255,255,0],
  yellowgreen:  [154,205,50]
};

var reverseKeywords = {};
for (var key in cssKeywords) {
  reverseKeywords[JSON.stringify(cssKeywords[key])] = key;
}

},{}],3:[function(require,module,exports){
var conversions = require("./conversions");

var convert = function() {
   return new Converter();
}

for (var func in conversions) {
  // export Raw versions
  convert[func + "Raw"] =  (function(func) {
    // accept array or plain args
    return function(arg) {
      if (typeof arg == "number")
        arg = Array.prototype.slice.call(arguments);
      return conversions[func](arg);
    }
  })(func);

  var pair = /(\w+)2(\w+)/.exec(func),
      from = pair[1],
      to = pair[2];

  // export rgb2hsl and ["rgb"]["hsl"]
  convert[from] = convert[from] || {};

  convert[from][to] = convert[func] = (function(func) { 
    return function(arg) {
      if (typeof arg == "number")
        arg = Array.prototype.slice.call(arguments);
      
      var val = conversions[func](arg);
      if (typeof val == "string" || val === undefined)
        return val; // keyword

      for (var i = 0; i < val.length; i++)
        val[i] = Math.round(val[i]);
      return val;
    }
  })(func);
}


/* Converter does lazy conversion and caching */
var Converter = function() {
   this.convs = {};
};

/* Either get the values for a space or
  set the values for a space, depending on args */
Converter.prototype.routeSpace = function(space, args) {
   var values = args[0];
   if (values === undefined) {
      // color.rgb()
      return this.getValues(space);
   }
   // color.rgb(10, 10, 10)
   if (typeof values == "number") {
      values = Array.prototype.slice.call(args);        
   }

   return this.setValues(space, values);
};
  
/* Set the values for a space, invalidating cache */
Converter.prototype.setValues = function(space, values) {
   this.space = space;
   this.convs = {};
   this.convs[space] = values;
   return this;
};

/* Get the values for a space. If there's already
  a conversion for the space, fetch it, otherwise
  compute it */
Converter.prototype.getValues = function(space) {
   var vals = this.convs[space];
   if (!vals) {
      var fspace = this.space,
          from = this.convs[fspace];
      vals = convert[fspace][space](from);

      this.convs[space] = vals;
   }
  return vals;
};

["rgb", "hsl", "hsv", "cmyk", "keyword"].forEach(function(space) {
   Converter.prototype[space] = function(vals) {
      return this.routeSpace(space, arguments);
   }
});

module.exports = convert;
},{"./conversions":2}],4:[function(require,module,exports){
/* MIT license */
var colorNames = require('color-name');

module.exports = {
   getRgba: getRgba,
   getHsla: getHsla,
   getRgb: getRgb,
   getHsl: getHsl,
   getHwb: getHwb,
   getAlpha: getAlpha,

   hexString: hexString,
   rgbString: rgbString,
   rgbaString: rgbaString,
   percentString: percentString,
   percentaString: percentaString,
   hslString: hslString,
   hslaString: hslaString,
   hwbString: hwbString,
   keyword: keyword
}

function getRgba(string) {
   if (!string) {
      return;
   }
   var abbr =  /^#([a-fA-F0-9]{3})$/,
       hex =  /^#([a-fA-F0-9]{6})$/,
       rgba = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d\.]+)\s*)?\)$/,
       per = /^rgba?\(\s*([\d\.]+)\%\s*,\s*([\d\.]+)\%\s*,\s*([\d\.]+)\%\s*(?:,\s*([\d\.]+)\s*)?\)$/,
       keyword = /(\D+)/;

   var rgb = [0, 0, 0],
       a = 1,
       match = string.match(abbr);
   if (match) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match[i] + match[i], 16);
      }
   }
   else if (match = string.match(hex)) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match.slice(i * 2, i * 2 + 2), 16);
      }
   }
   else if (match = string.match(rgba)) {
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match[i + 1]);
      }
      a = parseFloat(match[4]);
   }
   else if (match = string.match(per)) {
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
      }
      a = parseFloat(match[4]);
   }
   else if (match = string.match(keyword)) {
      if (match[1] == "transparent") {
         return [0, 0, 0, 0];
      }
      rgb = colorNames[match[1]];
      if (!rgb) {
         return;
      }
   }

   for (var i = 0; i < rgb.length; i++) {
      rgb[i] = scale(rgb[i], 0, 255);
   }
   if (!a && a != 0) {
      a = 1;
   }
   else {
      a = scale(a, 0, 1);
   }
   rgb[3] = a;
   return rgb;
}

function getHsla(string) {
   if (!string) {
      return;
   }
   var hsl = /^hsla?\(\s*(\d+)(?:deg)?\s*,\s*([\d\.]+)%\s*,\s*([\d\.]+)%\s*(?:,\s*([\d\.]+)\s*)?\)/;
   var match = string.match(hsl);
   if (match) {
      var h = scale(parseInt(match[1]), 0, 360),
          s = scale(parseFloat(match[2]), 0, 100),
          l = scale(parseFloat(match[3]), 0, 100),
          a = scale(parseFloat(match[4]) || 1, 0, 1);
      return [h, s, l, a];
   }
}

function getHwb(string) {
   if (!string) {
      return;
   }
   var hwb = /^hwb\(\s*(\d+)(?:deg)?\s*,\s*([\d\.]+)%\s*,\s*([\d\.]+)%\s*(?:,\s*([\d\.]+)\s*)?\)/;
   var match = string.match(hwb);
   if (match) {
      var h = scale(parseInt(match[1]), 0, 360),
          w = scale(parseFloat(match[2]), 0, 100),
          b = scale(parseFloat(match[3]), 0, 100),
          a = scale(parseFloat(match[4]) || 1, 0, 1);
      return [h, w, b, a];
   }
}

function getRgb(string) {
   var rgba = getRgba(string);
   return rgba && rgba.slice(0, 3);
}

function getHsl(string) {
  var hsla = getHsla(string);
  return hsla && hsla.slice(0, 3);
}

function getAlpha(string) {
   var vals = getRgba(string);
   if (vals) {
      return vals[3];
   }
   else if (vals = getHsla(string)) {
      return vals[3];
   }
   else if (vals = getHwb(string)) {
      return vals[3];
   }
}

// generators
function hexString(rgb) {
   return "#" + hexDouble(rgb[0]) + hexDouble(rgb[1])
              + hexDouble(rgb[2]);
}

function rgbString(rgba, alpha) {
   if (alpha < 1 || (rgba[3] && rgba[3] < 1)) {
      return rgbaString(rgba, alpha);
   }
   return "rgb(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2] + ")";
}

function rgbaString(rgba, alpha) {
   if (alpha === undefined) {
      alpha = (rgba[3] !== undefined ? rgba[3] : 1);
   }
   return "rgba(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2]
           + ", " + alpha + ")";
}

function percentString(rgba, alpha) {
   if (alpha < 1 || (rgba[3] && rgba[3] < 1)) {
      return percentaString(rgba, alpha);
   }
   var r = Math.round(rgba[0]/255 * 100),
       g = Math.round(rgba[1]/255 * 100),
       b = Math.round(rgba[2]/255 * 100);

   return "rgb(" + r + "%, " + g + "%, " + b + "%)";
}

function percentaString(rgba, alpha) {
   var r = Math.round(rgba[0]/255 * 100),
       g = Math.round(rgba[1]/255 * 100),
       b = Math.round(rgba[2]/255 * 100);
   return "rgba(" + r + "%, " + g + "%, " + b + "%, " + (alpha || rgba[3] || 1) + ")";
}

function hslString(hsla, alpha) {
   if (alpha < 1 || (hsla[3] && hsla[3] < 1)) {
      return hslaString(hsla, alpha);
   }
   return "hsl(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%)";
}

function hslaString(hsla, alpha) {
   if (alpha === undefined) {
      alpha = (hsla[3] !== undefined ? hsla[3] : 1);
   }
   return "hsla(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%, "
           + alpha + ")";
}

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
function hwbString(hwb, alpha) {
   if (alpha === undefined) {
      alpha = (hwb[3] !== undefined ? hwb[3] : 1);
   }
   return "hwb(" + hwb[0] + ", " + hwb[1] + "%, " + hwb[2] + "%"
           + (alpha !== undefined && alpha !== 1 ? ", " + alpha : "") + ")";
}

function keyword(rgb) {
  return reverseNames[rgb.slice(0, 3)];
}

// helpers
function scale(num, min, max) {
   return Math.min(Math.max(min, num), max);
}

function hexDouble(num) {
  var str = num.toString(16).toUpperCase();
  return (str.length < 2) ? "0" + str : str;
}


//create a list of reverse color names
var reverseNames = {};
for (var name in colorNames) {
   reverseNames[colorNames[name]] = name;
}
},{"color-name":5}],5:[function(require,module,exports){
module.exports={
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
}
},{}],6:[function(require,module,exports){
var convert = require('color-convert');

module.exports = function (cstr) {
    var m, conv, parts, alpha;
    if (m = /^((?:rgb|hs[lv]|cmyk|xyz|lab)a?)\s*\(([^\)]*)\)/.exec(cstr)) {
        var name = m[1];
        var base = name.replace(/a$/, '');
        var size = base === 'cmyk' ? 4 : 3;
        conv = convert[base];
        
        parts = m[2].replace(/^\s+|\s+$/g, '')
            .split(/\s*,\s*/)
            .map(function (x, i) {
                if (/%$/.test(x) && i === size) {
                    return parseFloat(x) / 100;
                }
                else if (/%$/.test(x)) {
                    return parseFloat(x);
                }
                return parseFloat(x);
            })
        ;
        if (name === base) parts.push(1);
        alpha = parts[size] === undefined ? 1 : parts[size];
        parts = parts.slice(0, size);
        
        conv[base] = function () { return parts };
    }
    else if (/^#[A-Fa-f0-9]+$/.test(cstr)) {
        var base = cstr.replace(/^#/,'');
        var size = base.length;
        conv = convert.rgb;
        parts = base.split(size === 3 ? /(.)/ : /(..)/);
        parts = parts.filter(Boolean)
            .map(function (x) {
                if (size === 3) {
                    return parseInt(x + x, 16);
                }
                else {
                    return parseInt(x, 16)
                }
            })
        ;
        alpha = 1;
        conv.rgb = function () { return parts };
        if (!parts[0]) parts[0] = 0;
        if (!parts[1]) parts[1] = 0;
        if (!parts[2]) parts[2] = 0;
    }
    else {
        conv = convert.keyword;
        conv.keyword = function () { return cstr };
        parts = cstr;
        alpha = 1;
    }
    
    var res = {
        rgb: undefined,
        hsl: undefined,
        hsv: undefined,
        cmyk: undefined,
        keyword: undefined,
        hex: undefined
    };
    try { res.rgb = conv.rgb(parts) } catch (e) {}
    try { res.hsl = conv.hsl(parts) } catch (e) {}
    try { res.hsv = conv.hsv(parts) } catch (e) {}
    try { res.cmyk = conv.cmyk(parts) } catch (e) {}
    try { res.keyword = conv.keyword(parts) } catch (e) {}
    
    if (res.rgb) res.hex = '#' + res.rgb.map(function (x) {
        var s = x.toString(16);
        if (s.length === 1) return '0' + s;
        return s;
    }).join('');
    
    if (res.rgb) res.rgba = res.rgb.concat(alpha);
    if (res.hsl) res.hsla = res.hsl.concat(alpha);
    if (res.hsv) res.hsva = res.hsv.concat(alpha);
    if (res.cmyk) res.cmyka = res.cmyk.concat(alpha);
    
    return res;
};

},{"color-convert":3}],7:[function(require,module,exports){
var _ = require("lodash");
var pointer = require("json-pointer");
var levenshtein = require("./levenshtein");

/**
 * Backtrace an optimal path through a levenshtein distance matrix.
 *
 * @returns {Array} List of operations
 */
function matrixToOperations (matrix, i, j) {
  if (i === 0 && j === 0) {
    return [];
  } else if (i === 0) {
    return matrixToOperations(matrix, i, j - 1).concat("add");
  } else if (j === 0) {
    return matrixToOperations(matrix, i - 1, j).concat("remove");
  } else {
    var left = matrix[i][j - 1];
    var up = matrix[i - 1][j];
    var upleft = matrix[i - 1][j - 1];

    if (upleft <= up && upleft <= left) {
      if (upleft === matrix[i][j]) {
        return matrixToOperations(matrix, i - 1, j - 1).concat("eq");
      } else {
        return matrixToOperations(matrix, i - 1, j - 1).concat("replace");
      }
    } else if (left <= upleft && left <= up) {
      return matrixToOperations(matrix, i, j - 1).concat("add");
    } else {
      return matrixToOperations(matrix, i - 1, j).concat("remove");
    }
  }
}

function diff (from, to) {
  var ops = [];

  if (_.isEqual(from, to)) {
    return [];
  } else if (_.isPlainObject(from) && _.isPlainObject(to)) {
    var keys = _.union(_.keys(from), _.keys(to));

    ops = keys.map(function (key) {
      var hasFrom = from.hasOwnProperty(key);
      var hasTo = to.hasOwnProperty(key);

      if (hasFrom && hasTo) {
        var d = diff(from[key], to[key]);

        return d.map(function (op) {
          op.path.unshift(key);

          return op;
        });
      } else if (hasFrom) {
        return { op: "remove", path: [key] };
      } else {
        return { op: "add", path: [key], value: to[key] };
      }
    });

    return _.flatten(ops, true);
  } else if (_.isArray(from) && _.isArray(to)) {
    var matrix = levenshtein(from, to);
    ops = [];

    if (matrix) {
      var m = matrix.length;
      var n = matrix[0].length;
      var i = 0;
      var j = 0;
      var o = matrixToOperations(matrix, m - 1, n - 1);

      o.forEach(function (op) {
        if (op == "add") {
          ops.push({ op: "add", path: [j], value: to[j] });
          j++;
        } else if (op == "remove") {
          ops.push({ op: "remove", path: [j] });
          i++;
        } else if (op == "replace") {
          var operations = diff(from[i], to[j]);

          ops = ops.concat(operations.map(function (op) {
            op.path.unshift(j);

            return op;
          }));

          i++;
          j++;
        } else {
          i++;
          j++;
        }
      });
    }

    return ops;
  } else {
    return [{ op: "replace", path: [], value: to }];
  }
}

module.exports = function (from, to) {
  var ops = diff(from, to);
  ops = _.map(ops, function (op) {
    op.path = pointer.compile(op.path.map(function (p) { return "" + p; }));

    return op;
  });

  return ops;
};

},{"./levenshtein":8,"json-pointer":9,"lodash":11}],8:[function(require,module,exports){
var _ = require("lodash");

// Compute the levenshtein edit distance matrix for two lists.
//
// It can be used to infer the concrete edit operations to transform the first
// list into the second.
//
// Returns an m*n matrix, where the (i, j) cell contains the levenshtein
// distance between the i-element prefix of from and the j-element prefix of to.
module.exports = function (from, to) {
  if (_.isEqual(from, to)) {
    return null;
  }

  var m = from.length;
  var n = to.length;
  var d = _.range(0, m + 1).map(function (x) {
    return [x];
  });

  d[0] = _.range(0, n + 1);

  for (var i = 1; i <= m; i++) {
    for (var j = 1; j <= n; j++) {
      var replacementCost = 1;

      if (_.isEqual(from[i - 1], to[j - 1])) {
        replacementCost = 0;
      }

      d[i][j] = _.min([d[i - 1][j - 1] + replacementCost,
                       d[i - 1][j] + 1,
                       d[i][j - 1] + 1]);
    }
  }

  return d;
};

},{"lodash":11}],9:[function(require,module,exports){
'use strict';

var each = require('foreach');
module.exports = api;


/**
 * Convenience wrapper around the api.
 * Calls `.get` when called with an `object` and a `pointer`.
 * Calls `.set` when also called with `value`.
 * If only supplied `object`, returns a partially applied function, mapped to the object.
 *
 * @param obj
 * @param pointer
 * @param value
 * @returns {*}
 */

function api (obj, pointer, value) {
    // .set()
    if (arguments.length === 3) {
        return api.set(obj, pointer, value);
    }
    // .get()
    if (arguments.length === 2) {
        return api.get(obj, pointer);
    }
    // Return a partially applied function on `obj`.
    var wrapped = api.bind(api, obj);

    // Support for oo style
    for (var name in api) {
        if (api.hasOwnProperty(name)) {
            wrapped[name] = api[name].bind(wrapped, obj);
        }
    }
    return wrapped;
}


/**
 * Lookup a json pointer in an object
 *
 * @param obj
 * @param pointer
 * @returns {*}
 */
api.get = function get (obj, pointer) {
    var tok,
        refTokens = api.parse(pointer);
    while (refTokens.length) {
        tok = refTokens.shift();
        if (!obj.hasOwnProperty(tok)) {
            throw new Error('Invalid reference token: ' + tok);
        }
        obj = obj[tok];
    }
    return obj;
};

/**
 * Sets a value on an object
 *
 * @param obj
 * @param pointer
 * @param value
 */
api.set = function set (obj, pointer, value) {
    var refTokens = api.parse(pointer),
        tok,
        nextTok = refTokens[0];
    while (refTokens.length > 1) {
        tok = refTokens.shift();
        nextTok = refTokens[0];

        if (!obj.hasOwnProperty(tok)) {
            if (nextTok.match(/^\d+$/)) {
                obj[tok] = [];
            } else {
                obj[tok] = {};
            }
        }
        obj = obj[tok];
    }
    obj[nextTok] = value;
    return this;
};

/**
 * Removes an attribute
 *
 * @param obj
 * @param pointer
 */
api.remove = function (obj, pointer) {
    var refTokens = api.parse(pointer);
    var finalToken = refTokens.pop();
    if (finalToken === undefined) {
        throw new Error('Invalid JSON pointer for remove: "' + pointer + '"');
    }
    delete api.get(obj, api.compile(refTokens))[finalToken];
};

/**
 * Returns a (pointer -> value) dictionary for an object
 *
 * @param obj
 * @param {function} descend
 * @returns {}
 */
api.dict = function dict (obj, descend) {
    var results = {};
    api.walk(obj, function (value, pointer) {
        results[pointer] = value;
    }, descend);
    return results;
};

/**
 * Iterates over an object
 * Iterator: function (value, pointer) {}
 *
 * @param obj
 * @param {function} iterator
 * @param {function} descend
 */
api.walk = function walk (obj, iterator, descend) {
    var refTokens = [];

    descend = descend || function (value) {
        var type = Object.prototype.toString.call(value);
        return type === '[object Object]' || type === '[object Array]';
    };

    (function next (cur) {
        each(cur, function (value, key) {
            refTokens.push(String(key));
            if (descend(value)) {
                next(value);
            } else {
                iterator(value, api.compile(refTokens));
            }
            refTokens.pop();
        });
    }(obj));
};

/**
 * Tests if an object has a value for a json pointer
 *
 * @param obj
 * @param pointer
 * @returns {boolean}
 */
api.has = function has (obj, pointer) {
    try {
        api.get(obj, pointer);
    } catch (e) {
        return false;
    }
    return true;
};

/**
 * Escapes a reference token
 *
 * @param str
 * @returns {string}
 */
api.escape = function escape (str) {
    return str.toString().replace(/~/g, '~0').replace(/\//g, '~1');
};

/**
 * Unescapes a reference token
 *
 * @param str
 * @returns {string}
 */
api.unescape = function unescape (str) {
    return str.replace(/~1/g, '/').replace(/~0/g, '~');
};

/**
 * Converts a json pointer into a array of reference tokens
 *
 * @param pointer
 * @returns {Array}
 */
api.parse = function parse (pointer) {
    if (pointer === '') { return []; }
    if (pointer.charAt(0) !== '/') { throw new Error('Invalid JSON pointer: ' + pointer); }
    return pointer.substring(1).split(/\//).map(api.unescape);
};

/**
 * Builds a json pointer from a array of reference tokens
 *
 * @param refTokens
 * @returns {string}
 */
api.compile = function compile (refTokens) {
    if (refTokens.length === 0) { return ''; }
    return '/' + refTokens.map(api.escape).join('/');
};

},{"foreach":10}],10:[function(require,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],11:[function(require,module,exports){
(function (global){
/**
 * @license
 * Lo-Dash 2.4.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern -o ./dist/lodash.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detect and test whitespace */
  var whitespace = (
    // whitespace
    ' \t\x0B\f\xA0\ufeff' +

    // line terminators
    '\n\r\u2028\u2029' +

    // unicode category "Zs" space separators
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading whitespace and zeros to be removed */
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object',
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
    'parseInt', 'setTimeout'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used as an internal `_.debounce` options object */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default callback when a given
   * collection is a string value.
   *
   * @private
   * @param {string} value The character to inspect.
   * @returns {number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ac = a.criteria,
        bc = b.criteria,
        index = -1,
        length = ac.length;

    while (++index < length) {
      var value = ac[index],
          other = bc[index];

      if (value !== other) {
        if (value > other || typeof value == 'undefined') {
          return 1;
        }
        if (value < other || typeof other == 'undefined') {
          return -1;
        }
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to return the same value for
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
    //
    // This also ensures a stable sort in V8 and other engines.
    // See http://code.google.com/p/v8/issues/detail?id=90
    return a.index - b.index;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'criteria': null,
      'false': false,
      'index': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false,
      'value': null
    };
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given context object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /**
     * Used for `Array` method references.
     *
     * Normally `Array.prototype` would suffice, however, using an array literal
     * avoids issues in Narwhal.
     */
    var arrayRef = [];

    /** Used for native method references */
    var objectProto = Object.prototype;

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to resolve the internal [[Class]] of values */
    var toString = objectProto.toString;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        fnToString = Function.prototype.toString,
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectProto.hasOwnProperty,
        push = arrayRef.push,
        setTimeout = context.setTimeout,
        splice = arrayRef.splice,
        unshift = arrayRef.unshift;

    /** Used to set meta data on functions */
    var defineProperty = (function() {
      // IE 8 only accepts DOM elements
      try {
        var o = {},
            func = isNative(func = Object.defineProperty) && func,
            result = func(o, o, o) && func;
      } catch(e) { }
      return result;
    }());

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps the given value to enable intuitive
     * method chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
     * and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
     * `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * provided, otherwise they return unwrapped values.
     *
     * Explicit chaining can be enabled by using the `_.chain` method.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap in a `lodash` instance.
     * @param {boolean} chainAll A flag to enable chaining for all methods
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value, chainAll) {
      this.__chain__ = !!chainAll;
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    /**
     * Detect if functions can be decompiled by `Function#toString`
     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

    /**
     * Detect if `Function#name` is supported (all but IE).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcNames = typeof Function.name == 'string';

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The base implementation of `_.bind` that creates the bound function and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new bound function.
     */
    function baseBind(bindData) {
      var func = bindData[0],
          partialArgs = bindData[2],
          thisArg = bindData[4];

      function bound() {
        // `Function#bind` spec
        // http://es5.github.io/#x15.3.4.5
        if (partialArgs) {
          // avoid `arguments` object deoptimizations by using `slice` instead
          // of `Array.prototype.slice.call` and not assigning `arguments` to a
          // variable as a ternary expression
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        // mimic the constructor's `return` behavior
        // http://es5.github.io/#x13.2.2
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          var thisBinding = baseCreate(func.prototype),
              result = func.apply(thisBinding, args || arguments);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.clone` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, callback, stackA, stackB) {
      if (callback) {
        var result = callback(value);
        if (typeof result != 'undefined') {
          return result;
        }
      }
      // inspect [[Class]]
      var isObj = isObject(value);
      if (isObj) {
        var className = toString.call(value);
        if (!cloneableClasses[className]) {
          return value;
        }
        var ctor = ctorByClass[className];
        switch (className) {
          case boolClass:
          case dateClass:
            return new ctor(+value);

          case numberClass:
          case stringClass:
            return new ctor(value);

          case regexpClass:
            result = ctor(value.source, reFlags.exec(value));
            result.lastIndex = value.lastIndex;
            return result;
        }
      } else {
        return value;
      }
      var isArr = isArray(value);
      if (isDeep) {
        // check for circular references and return corresponding clone
        var initedStack = !stackA;
        stackA || (stackA = getArray());
        stackB || (stackB = getArray());

        var length = stackA.length;
        while (length--) {
          if (stackA[length] == value) {
            return stackB[length];
          }
        }
        result = isArr ? ctor(value.length) : {};
      }
      else {
        result = isArr ? slice(value) : assign({}, value);
      }
      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // exit for shallow clone
      if (!isDeep) {
        return result;
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? forEach : forOwn)(value, function(objValue, key) {
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
      });

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(prototype, properties) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    // fallback for browsers without `Object.create`
    if (!nativeCreate) {
      baseCreate = (function() {
        function Object() {}
        return function(prototype) {
          if (isObject(prototype)) {
            Object.prototype = prototype;
            var result = new Object;
            Object.prototype = null;
          }
          return result || context.Object();
        };
      }());
    }

    /**
     * The base implementation of `_.createCallback` without support for creating
     * "_.pluck" or "_.where" style callbacks.
     *
     * @private
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     */
    function baseCreateCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      // exit early for no `thisArg` or already bound by `Function#bind`
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
      }
      var bindData = func.__bindData__;
      if (typeof bindData == 'undefined') {
        if (support.funcNames) {
          bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
          var source = fnToString.call(func);
          if (!support.funcNames) {
            bindData = !reFuncName.test(source);
          }
          if (!bindData) {
            // checks if `func` references the `this` keyword and stores the result
            bindData = reThis.test(source);
            setBindData(func, bindData);
          }
        }
      }
      // exit early if there are no `this` references or `func` is bound
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 2: return function(a, b) {
          return func.call(thisArg, a, b);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return bind(func, thisArg);
    }

    /**
     * The base implementation of `createWrapper` that creates the wrapper and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new function.
     */
    function baseCreateWrapper(bindData) {
      var func = bindData[0],
          bitmask = bindData[1],
          partialArgs = bindData[2],
          partialRightArgs = bindData[3],
          thisArg = bindData[4],
          arity = bindData[5];

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          key = func;

      function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
          args || (args = slice(arguments));
          if (partialRightArgs) {
            push.apply(args, partialRightArgs);
          }
          if (isCurry && args.length < arity) {
            bitmask |= 16 & ~32;
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
          }
        }
        args || (args = arguments);
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (this instanceof bound) {
          thisBinding = baseCreate(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.difference` that accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {Array} [values] The array of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     */
    function baseDifference(array, values) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
          result = [];

      if (isLarge) {
        var cache = createCache(values);
        if (cache) {
          indexOf = cacheIndexOf;
          values = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(values, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(values);
      }
      return result;
    }

    /**
     * The base implementation of `_.flatten` without support for callback
     * shorthands or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
     * @param {number} [fromIndex=0] The index to start from.
     * @returns {Array} Returns a new flattened array.
     */
    function baseFlatten(array, isShallow, isStrict, fromIndex) {
      var index = (fromIndex || 0) - 1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value && typeof value == 'object' && typeof value.length == 'number'
            && (isArray(value) || isArguments(value))) {
          // recursively flatten arrays (susceptible to call stack limits)
          if (!isShallow) {
            value = baseFlatten(value, isShallow, isStrict);
          }
          var valIndex = -1,
              valLength = value.length,
              resIndex = result.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[resIndex++] = value[valIndex];
          }
        } else if (!isStrict) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
     * that allows partial "_.where" style comparisons.
     *
     * @private
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          !(a && objectTypes[type]) &&
          !(b && objectTypes[otherType])) {
        return false;
      }
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
      // http://es5.github.io/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
            bWrapped = hasOwnProperty.call(b, '__wrapped__');

        if (aWrapped || bWrapped) {
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = a.constructor,
            ctorB = b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB &&
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
              ('constructor' in a && 'constructor' in b)
            ) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        // compare lengths to determine if a deep comparison is necessary
        length = a.length;
        size = b.length;
        result = size == length;

        if (result || isWhere) {
          // deep compare the contents, ignoring non-numeric properties
          while (size--) {
            var index = length,
                value = b[size];

            if (isWhere) {
              while (index--) {
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                  break;
                }
              }
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        }
      }
      else {
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
        // which, in this case, is more costly
        forIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            // count the number of properties.
            size++;
            // deep compare each property value.
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
          }
        });

        if (result && !isWhere) {
          // ensure both objects have the same number of properties
          forIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              // `size` will be `-1` if `a` has more properties than `b`
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     */
    function baseMerge(object, source, callback, stackA, stackB) {
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
        var found,
            isArr,
            result = source,
            value = object[key];

        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            if ((found = stackA[stackLength] == source)) {
              value = stackB[stackLength];
              break;
            }
          }
          if (!found) {
            var isShallow;
            if (callback) {
              result = callback(value, source);
              if ((isShallow = typeof result != 'undefined')) {
                value = result;
              }
            }
            if (!isShallow) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});
            }
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value);

            // recursively merge objects and arrays (susceptible to call stack limits)
            if (!isShallow) {
              baseMerge(value, source, callback, stackA, stackB);
            }
          }
        }
        else {
          if (callback) {
            result = callback(value, source);
            if (typeof result == 'undefined') {
              result = source;
            }
          }
          if (typeof result != 'undefined') {
            value = result;
          }
        }
        object[key] = value;
      });
    }

    /**
     * The base implementation of `_.random` without argument juggling or support
     * for returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns a random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function} [callback] The function called per iteration.
     * @returns {Array} Returns a duplicate-value-free array.
     */
    function baseUniq(array, isSorted, callback) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [];

      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
          seen = (callback || isLarge) ? getArray() : result;

      if (isLarge) {
        var cache = createCache(seen);
        indexOf = cacheIndexOf;
        seen = cache;
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      if (isLarge) {
        releaseArray(seen.array);
        releaseObject(seen);
      } else if (callback) {
        releaseArray(seen);
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an object composed
     * of keys generated from the results of running each element of the collection
     * through a callback. The given `setter` function sets the keys and values
     * of the composed object.
     *
     * @private
     * @param {Function} setter The setter function.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter) {
      return function(collection, callback, thisArg) {
        var result = {};
        callback = lodash.createCallback(callback, thisArg, 3);

        var index = -1,
            length = collection ? collection.length : 0;

        if (typeof length == 'number') {
          while (++index < length) {
            var value = collection[index];
            setter(result, value, callback(value, index, collection), collection);
          }
        } else {
          forOwn(collection, function(value, key, collection) {
            setter(result, value, callback(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that, when called, either curries or invokes `func`
     * with an optional `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of method flags to compose.
     *  The bitmask may be composed of the following flags:
     *  1 - `_.bind`
     *  2 - `_.bindKey`
     *  4 - `_.curry`
     *  8 - `_.curry` (bound)
     *  16 - `_.partial`
     *  32 - `_.partialRight`
     * @param {Array} [partialArgs] An array of arguments to prepend to those
     *  provided to the new function.
     * @param {Array} [partialRightArgs] An array of arguments to append to those
     *  provided to the new function.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new function.
     */
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError;
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        // clone `bindData`
        bindData = slice(bindData);
        if (bindData[2]) {
          bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
          bindData[3] = slice(bindData[3]);
        }
        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
      }
      // fast path for `_.bind`
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} match The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized, this method returns the custom method, otherwise it returns
     * the `baseIndexOf` function.
     *
     * @private
     * @returns {Function} Returns the "indexOf" function.
     */
    function getIndexOf() {
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
      return result;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
     */
    function isNative(value) {
      return typeof value == 'function' && reNative.test(value);
    }

    /**
     * Sets `this` binding data on a given function.
     *
     * @private
     * @param {Function} func The function to set data on.
     * @param {Array} value The data array to set.
     */
    var setBindData = !defineProperty ? noop : function(func, value) {
      descriptor.value = value;
      defineProperty(func, '__bindData__', descriptor);
      descriptor.value = null;
    };

    /**
     * A fallback implementation of `isPlainObject` which checks if a given value
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var ctor,
          result;

      // avoid non Object objects, `arguments` objects, and DOM elements
      if (!(value && toString.call(value) == objectClass) ||
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor))) {
        return false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} match The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == argsClass || false;
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == arrayClass || false;
    };

    /**
     * A fallback implementation of `Object.keys` which produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     */
    var shimKeys = function(object) {
      var index, iterable = object, result = [];
      if (!iterable) return result;
      if (!(objectTypes[typeof object])) return result;
        for (index in iterable) {
          if (hasOwnProperty.call(iterable, index)) {
            result.push(index);
          }
        }
      return result
    };

    /**
     * Creates an array composed of the own enumerable property names of an object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      return nativeKeys(object);
    };

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /** Used to match HTML entities and HTML characters */
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a callback is provided it will be executed to produce the
     * assigned values. The callback is bound to `thisArg` and invoked with two
     * arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
     * // => { 'name': 'fred', 'employer': 'slate' }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var object = { 'name': 'barney' };
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var assign = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
        var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
      } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
        callback = args[--argsLength];
      }
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
        }
        }
      }
      return result
    };

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a callback
     * is provided it will be executed to produce the cloned values. If the
     * callback returns `undefined` cloning will be handled by the method instead.
     * The callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var shallow = _.clone(characters);
     * shallow[0] === characters[0];
     * // => true
     *
     * var deep = _.clone(characters, true);
     * deep[0] === characters[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, callback, thisArg) {
      // allows working with "Collections" methods without using their `index`
      // and `collection` arguments for `isDeep` and `callback`
      if (typeof isDeep != 'boolean' && isDeep != null) {
        thisArg = callback;
        callback = isDeep;
        isDeep = false;
      }
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates a deep clone of `value`. If a callback is provided it will be
     * executed to produce the cloned values. If the callback returns `undefined`
     * cloning will be handled by the method instead. The callback is bound to
     * `thisArg` and invoked with one argument; (value).
     *
     * Note: This method is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var deep = _.cloneDeep(characters);
     * deep[0] === characters[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? assign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var object = { 'name': 'barney' };
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var defaults = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (typeof result[index] == 'undefined') result[index] = iterable[index];
        }
        }
      }
      return result
    };

    /**
     * This method is like `_.findIndex` except that it returns the key of the
     * first element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
     *
     * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (property order is not guaranteed across environments)
     *
     * // using "_.where" callback shorthand
     * _.findKey(characters, { 'age': 1 });
     * // => 'pebbles'
     *
     * // using "_.pluck" callback shorthand
     * _.findKey(characters, 'blocked');
     * // => 'fred'
     */
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
     *
     * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
     *
     * // using "_.where" callback shorthand
     * _.findLastKey(characters, { 'age': 40 });
     * // => 'fred'
     *
     * // using "_.pluck" callback shorthand
     * _.findLastKey(characters, 'blocked');
     * // => 'pebbles'
     */
    function findLastKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwnRight(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over own and inherited enumerable properties of an object,
     * executing the callback for each property. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
     */
    var forIn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        for (index in iterable) {
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forIn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
     */
    function forInRight(object, callback, thisArg) {
      var pairs = [];

      forIn(object, function(value, key) {
        pairs.push(key, value);
      });

      var length = pairs.length;
      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(pairs[length--], pairs[length], object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Iterates over own enumerable properties of an object, executing the callback
     * for each property. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
     */
    var forOwn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forOwn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
     */
    function forOwnRight(object, callback, thisArg) {
      var props = keys(object),
          length = props.length;

      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        var key = props[length];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Creates a sorted array of property names of all enumerable properties,
     * own and inherited, of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified property name exists as a direct property of `object`,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to check.
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, key) {
      return object ? hasOwnProperty.call(object, key) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     * _.invert({ 'first': 'fred', 'second': 'barney' });
     * // => { 'fred': 'first', 'barney': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        value && typeof value == 'object' && toString.call(value) == boolClass || false;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value && value.nodeType === 1 || false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass || className == argsClass ) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If a callback is provided it will be executed
     * to compare values. If the callback returns `undefined` comparisons will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var copy = { 'name': 'fred' };
     *
     * object == copy;
     * // => false
     *
     * _.isEqual(object, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg) {
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite` which will return true for
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.io/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return !!(value && objectTypes[typeof value]);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN` which will return `true` for
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        value && typeof value == 'object' && toString.call(value) == numberClass || false;
    }

    /**
     * Checks if `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * _.isPlainObject(new Shape);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && toString.call(value) == objectClass)) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/fred/);
     * // => true
     */
    function isRegExp(value) {
      return value && typeof value == 'object' && toString.call(value) == regexpClass || false;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('fred');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' ||
        value && typeof value == 'object' && toString.call(value) == stringClass || false;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     *
     * var characters = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // using "_.pluck" callback shorthand
     * _.mapValues(characters, 'age');
     * // => { 'fred': 40, 'pebbles': 1 }
     */
    function mapValues(object, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg, 3);

      forOwn(object, function(value, key, object) {
        result[key] = callback(value, key, object);
      });
      return result;
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a callback is
     * provided it will be executed to produce the merged values of the destination
     * and source properties. If the callback returns `undefined` merging will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object) {
      var args = arguments,
          length = 2;

      if (!isObject(object)) {
        return object;
      }
      // allows working with `_.reduce` and `_.reduceRight` without using
      // their `index` and `collection` arguments
      if (typeof args[2] != 'number') {
        length = args.length;
      }
      if (length > 3 && typeof args[length - 2] == 'function') {
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
      } else if (length > 2 && typeof args[length - 1] == 'function') {
        callback = args[--length];
      }
      var sources = slice(arguments, 1, length),
          index = -1,
          stackA = getArray(),
          stackB = getArray();

      while (++index < length) {
        baseMerge(object, sources[index], callback, stackA, stackB);
      }
      releaseArray(stackA);
      releaseArray(stackB);
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` omitting the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The properties to omit or the
     *  function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
     * // => { 'name': 'fred' }
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'fred' }
     */
    function omit(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var props = [];
        forIn(object, function(value, key) {
          props.push(key);
        });
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          result[key] = object[key];
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (!callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates a two dimensional array of an object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` picking the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The function called per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
     * // => { 'name': 'fred' }
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'fred' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1,
            props = baseFlatten(arguments, true, false, 1),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * An alternative to `_.reduce` this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable properties through a callback, with each callback execution
     * potentially mutating the `accumulator` object. The callback is bound to
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
     * Callbacks may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
     * // => [1, 9, 25]
     *
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor,
              proto = ctor && ctor.prototype;

          accumulator = baseCreate(proto);
        }
      }
      if (callback) {
        callback = lodash.createCallback(callback, thisArg, 4);
        (isArr ? forEach : forOwn)(object, function(value, index, object) {
          return callback(accumulator, value, index, object);
        });
      }
      return accumulator;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (property order is not guaranteed across environments)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
     *   to retrieve, specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
     * // => ['fred', 'pebbles']
     */
    function at(collection) {
      var args = arguments,
          index = -1,
          props = baseFlatten(args, true, false, 1),
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
          result = Array(length);

      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given value is present in a collection using strict equality
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
     * offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {*} target The value to check for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.contains('pebbles', 'eb');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          indexOf = getIndexOf(),
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
      } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        forOwn(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through the callback. The corresponding value
     * of each key is the number of times the key was returned by the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });

    /**
     * Checks if the given callback returns truey value for **all** elements of
     * a collection. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if all elements passed the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes']);
     * // => false
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(characters, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(characters, { 'age': 36 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning an array of all elements
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(characters, 'blocked');
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     *
     * // using "_.where" callback shorthand
     * _.filter(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning the first element that
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect, findWhere
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
     *
     * // using "_.where" callback shorthand
     * _.find(characters, { 'age': 1 });
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
     *
     * // using "_.pluck" callback shorthand
     * _.find(characters, 'blocked');
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * This method is like `_.find` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
     * // => 3
     */
    function findLast(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forEachRight(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result = value;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over elements of a collection, executing the callback for each
     * element. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * Note: As with other "Collections" methods, objects with a `length` property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
     * // => logs each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
     * // => logs each number and returns the object (property order is not guaranteed across environments)
     */
    function forEach(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        forOwn(collection, callback);
      }
      return collection;
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
     * // => logs each number from right to left and returns '3,2,1'
     */
    function forEachRight(collection, callback, thisArg) {
      var length = collection ? collection.length : 0;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (length--) {
          if (callback(collection[length], length, collection) === false) {
            break;
          }
        }
      } else {
        var props = keys(collection);
        length = props.length;
        forOwn(collection, function(value, key, collection) {
          key = props ? props[--length] : --length;
          return callback(collection[key], key, collection);
        });
      }
      return collection;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of a collection through the callback. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of the collection through the given callback. The corresponding
     * value of each key is the last element responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keys = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keys, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method named by `methodName` on each element in the `collection`
     * returning an array of the results of each invoked method. Additional arguments
     * will be provided to each invoked method. If `methodName` is a function it
     * will be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|string} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [arg] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the collection
     * through the callback. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (property order is not guaranteed across environments)
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(characters, 'name');
     * // => ['barney', 'fred']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        var result = Array(length);
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        result = [];
        forOwn(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of a collection. If the collection is empty or
     * falsey `-Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.max(characters, function(chr) { return chr.age; });
     * // => { 'name': 'fred', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(characters, 'age');
     * // => { 'name': 'fred', 'age': 40 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of a collection. If the collection is empty or
     * falsey `Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.min(characters, function(chr) { return chr.age; });
     * // => { 'name': 'barney', 'age': 36 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(characters, 'age');
     * // => { 'name': 'barney', 'age': 36 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the collection.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {string} property The name of the property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(characters, 'name');
     * // => ['barney', 'fred']
     */
    var pluck = map;

    /**
     * Reduces a collection to a value which is the accumulated result of running
     * each element in the collection through the callback, where each successive
     * callback execution consumes the return value of the previous execution. If
     * `accumulator` is not provided the first element of the collection will be
     * used as the initial `accumulator` value. The callback is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      if (!collection) return accumulator;
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      var index = -1,
          length = collection.length;

      if (typeof length == 'number') {
        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      forEachRight(collection, function(value, index, collection) {
        accumulator = noaccum
          ? (noaccum = false, value)
          : callback(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter` this method returns the elements of a
     * collection that the callback does **not** return truey for.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that failed the callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(characters, 'blocked');
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     *
     * // using "_.where" callback shorthand
     * _.reject(characters, { 'age': 36 });
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Retrieves a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Allows working with functions like `_.map`
     *  without using their `index` arguments as `n`.
     * @returns {Array} Returns the random sample(s) of `collection`.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (collection && typeof collection.length != 'number') {
        collection = values(collection);
      }
      if (n == null || guard) {
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(nativeMax(0, n), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the callback returns a truey value for **any** element of a
     * collection. The function returns as soon as it finds a passing value and
     * does not iterate over the entire collection. The callback is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if any element passed the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(characters, 'blocked');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(characters, { 'age': 1 });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through the callback. This method
     * performs a stable sort, that is, it will preserve the original sort order
     * of equal elements. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an array of property names is provided for `callback` the collection
     * will be sorted by each property value.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'barney',  'age': 26 },
     *   { 'name': 'fred',    'age': 30 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(_.sortBy(characters, 'age'), _.values);
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
     *
     * // sorting by multiple properties
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          isArr = isArray(callback),
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      if (!isArr) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      forEach(collection, function(value, key, collection) {
        var object = result[++index] = getObject();
        if (isArr) {
          object.criteria = map(callback, function(key) { return value[key]; });
        } else {
          (object.criteria = getArray())[0] = callback(value, key, collection);
        }
        object.index = index;
        object.value = value;
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        if (!isArr) {
          releaseArray(object.criteria);
        }
        releaseObject(object);
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return slice(collection);
      }
      return values(collection);
    }

    /**
     * Performs a deep comparison of each element in a `collection` to the given
     * `properties` object, returning an array of all elements that have equivalent
     * property values.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Object} props The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given properties.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.where(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
     *
     * _.where(characters, { 'pets': ['dino'] });
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using strict
     * equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      return baseDifference(array, baseFlatten(arguments, true, true, 1));
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
     * // => 2
     *
     * // using "_.where" callback shorthand
     * _.findIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findIndex(characters, 'blocked');
     * // => 1
     */
    function findIndex(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': true },
     *   { 'name': 'fred',    'age': 40, 'blocked': false },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
     * ];
     *
     * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
     * // => 1
     *
     * // using "_.where" callback shorthand
     * _.findLastIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findLastIndex(characters, 'blocked');
     * // => 2
     */
    function findLastIndex(array, callback, thisArg) {
      var length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(array[length], length, array)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Gets the first element or first `n` elements of an array. If a callback
     * is provided elements at the beginning of the array are returned as long
     * as the callback returns truey. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(characters, 'blocked');
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
     * // => ['barney', 'fred']
     */
    function first(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = -1;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[0] : undefined;
        }
      }
      return slice(array, 0, nativeMin(nativeMax(0, n), length));
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truey, the array will only be flattened a single level. If a callback
     * is provided each element of the array is passed through the callback before
     * flattening. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(characters, 'pets');
     * // => ['hoppy', 'baby puss', 'dino']
     */
    function flatten(array, isShallow, callback, thisArg) {
      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
        isShallow = false;
      }
      if (callback != null) {
        array = map(array, callback, thisArg);
      }
      return baseFlatten(array, isShallow);
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the array is already sorted
     * providing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return baseIndexOf(array, value, fromIndex);
    }

    /**
     * Gets all but the last element or last `n` elements of an array. If a
     * callback is provided elements at the end of the array are excluded from
     * the result as long as the callback returns truey. The callback is bound
     * to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(characters, 'blocked');
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
     * // => ['barney', 'fred']
     */
    function initial(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Creates an array of unique values present in all provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of shared values.
     * @example
     *
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2]
     */
    function intersection() {
      var args = [],
          argsIndex = -1,
          argsLength = arguments.length,
          caches = getArray(),
          indexOf = getIndexOf(),
          trustIndexOf = indexOf === baseIndexOf,
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = arguments[argsIndex];
        if (isArray(value) || isArguments(value)) {
          args.push(value);
          caches.push(trustIndexOf && value.length >= largeArraySize &&
            createCache(argsIndex ? args[argsIndex] : seen));
        }
      }
      var array = args[0],
          index = -1,
          length = array ? array.length : 0,
          result = [];

      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }

    /**
     * Gets the last element or last `n` elements of an array. If a callback is
     * provided elements at the end of the array are returned as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.last(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.last(characters, { 'employer': 'na' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function last(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[length - 1] : undefined;
        }
      }
      return slice(array, nativeMax(0, length - n));
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from the given array using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {...*} [value] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull(array) {
      var args = arguments,
          argsIndex = 0,
          argsLength = args.length,
          length = array ? array.length : 0;

      while (++argsIndex < argsLength) {
        var index = -1,
            value = args[argsIndex];
        while (++index < length) {
          if (array[index] === value) {
            splice.call(array, index--, 1);
            length--;
          }
        }
      }
      return array;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`. If `start` is less than `stop` a
     * zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      start = +start || 0;
      step = typeof step == 'number' ? step : (+step || 1);

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / (step || 1))),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Removes all elements from an array that the callback returns truey for
     * and returns an array of removed elements. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4, 5, 6];
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
     *
     * console.log(array);
     * // => [1, 3, 5]
     *
     * console.log(evens);
     * // => [2, 4, 6]
     */
    function remove(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (callback(value, index, array)) {
          result.push(value);
          splice.call(array, index--, 1);
          length--;
        }
      }
      return result;
    }

    /**
     * The opposite of `_.initial` this method gets all but the first element or
     * first `n` elements of an array. If a callback function is provided elements
     * at the beginning of the array are excluded from the result as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.rest(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.rest(characters, { 'employer': 'slate' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which a value
     * should be inserted into a given sorted array in order to maintain the sort
     * order of the array. If a callback is provided it will be executed for
     * `value` and each element of `array` to compute their sort ranking. The
     * callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of combined values.
     * @example
     *
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2, 3, 5, 4]
     */
    function union() {
      return baseUniq(baseFlatten(arguments, true, true));
    }

    /**
     * Creates a duplicate-value-free version of an array using strict equality
     * for comparisons, i.e. `===`. If the array is sorted, providing
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
     * each element of `array` is passed through the callback before uniqueness
     * is computed. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
     * // => ['A', 'b', 'C']
     *
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2.5, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
        isSorted = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      return baseUniq(array, isSorted, callback);
    }

    /**
     * Creates an array excluding all provided values using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {...*} [value] The values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      return baseDifference(array, slice(arguments, 1));
    }

    /**
     * Creates an array that is the symmetric difference of the provided arrays.
     * See http://en.wikipedia.org/wiki/Symmetric_difference.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of values.
     * @example
     *
     * _.xor([1, 2, 3], [5, 2, 1, 4]);
     * // => [3, 5, 4]
     *
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
     * // => [1, 4, 5]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArray(array) || isArguments(array)) {
          var result = result
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
            : array;
        }
      }
      return result || [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second
     * elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @alias unzip
     * @category Arrays
     * @param {...Array} [array] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    function zip() {
      var array = arguments.length > 1 ? arguments : arguments[0],
          index = -1,
          length = array ? max(pluck(array, 'length')) : 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Provide
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
     * or two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      if (!values && length && !isArray(keys[0])) {
        values = [];
      }
      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that executes `func`, with  the `this` binding and
     * arguments of the created function, only after being called `n` times.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {number} n The number of times the function must be called before
     *  `func` is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'Done saving!', after all saves have completed
     */
    function after(n, func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * provided to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'fred' }, 'hi');
     * func();
     * // => 'hi fred'
     */
    function bind(func, thisArg) {
      return arguments.length > 2
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
        : createWrapper(func, 1, null, null, thisArg);
    }

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all the function properties
     * of `object` will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...string} [methodName] The object method names to
     *  bind, specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() { console.log('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
          index = -1,
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = createWrapper(object[key], 1, null, null, object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those provided to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi fred'
     *
     * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hiya fred!'
     */
    function bindKey(object, key) {
      return arguments.length > 2
        ? createWrapper(key, 19, slice(arguments, 2), null, object)
        : createWrapper(key, 3, null, null, object);
    }

    /**
     * Creates a function that is the composition of the provided functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {...Function} [func] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
     *
     * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
     *
     * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
     *
     * var welcome = _.compose(greet, format);
     * welcome('pebbles');
     * // => 'Hiya Penelope!'
     */
    function compose() {
      var funcs = arguments,
          length = funcs.length;

      while (length--) {
        if (!isFunction(funcs[length])) {
          throw new TypeError;
        }
      }
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Creates a function which accepts one or more arguments of `func` that when
     * invoked either executes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` can be specified
     * if `func.length` is not sufficient.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
     *
     * curried(1)(2)(3);
     * // => 6
     *
     * curried(1, 2)(3);
     * // => 6
     *
     * curried(1, 2, 3);
     * // => 6
     */
    function curry(func, arity) {
      arity = typeof arity == 'number' ? arity : (+arity || func.length);
      return createWrapper(func, 4, null, null, null, arity);
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked.
     * Provide an options object to indicate that `func` should be invoked on
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
     * to the debounced function will return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * var lazyLayout = _.debounce(calculateLayout, 150);
     * jQuery(window).on('resize', lazyLayout);
     *
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
     *
     * // ensure `batchLog` is executed once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      wait = nativeMax(0, wait) || 0;
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      var delayed = function() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0) {
          if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
          }
          var isCalled = trailingCall;
          maxTimeoutId = timeoutId = trailingCall = undefined;
          if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
          }
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      };

      var maxDelayed = function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (trailing || (maxWait !== wait)) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      };

      return function() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
        return result;
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) { console.log(text); }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    function defer(func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay execution.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) { console.log(text); }, 1000, 'later');
     * // => logs 'later' after one second
     */
    function delay(func, wait) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it will be used to determine the cache key for storing the result
     * based on the arguments provided to the memoized function. By default, the
     * first argument provided to the memoized function is used as the cache key.
     * The `func` is executed with the `this` binding of the memoized function.
     * The result cache is exposed as the `cache` property on the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     *
     * fibonacci(9)
     * // => 34
     *
     * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // modifying the result cache
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
     * get('pebbles');
     * // => { 'name': 'pebbles', 'age': 1 }
     *
     * get.cache.pebbles.name = 'penelope';
     * get('pebbles');
     * // => { 'name': 'penelope', 'age': 1 }
     */
    function memoize(func, resolver) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var memoized = function() {
        var cache = memoized.cache,
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      }
      memoized.cache = {};
      return memoized;
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those provided to the new function. This
     * method is similar to `_.bind` except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('fred');
     * // => 'hi fred'
     */
    function partial(func) {
      return createWrapper(func, 16, slice(arguments, 1));
    }

    /**
     * This method is like `_.partial` except that `partial` arguments are
     * appended to those provided to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createWrapper(func, 32, null, slice(arguments, 1));
    }

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. Provide an options object to
     * indicate that `func` should be invoked on the leading and/or trailing edge
     * of the `wait` timeout. Subsequent calls to the throttled function will
     * return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {number} wait The number of milliseconds to throttle executions to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     *
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = wait;
      debounceOptions.trailing = trailing;

      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Additional arguments provided to the function are appended
     * to those provided to the wrapper function. The wrapper is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('Fred, Wilma, & Pebbles');
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
     */
    function wrap(value, wrapper) {
      return createWrapper(wrapper, 16, [value]);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var getter = _.constant(object);
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name the created callback will return the property value for a given element.
     * If `func` is an object the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(characters, 'age__gt38');
     * // => [{ 'name': 'fred', 'age': 40 }]
     */
    function createCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
      }
      // handle "_.pluck" style callback shorthands
      if (type != 'object') {
        return property(func);
      }
      var props = keys(func),
          key = props[0],
          a = func[key];

      // handle "_.where" style callback shorthands
      if (props.length == 1 && a === a && !isObject(a)) {
        // fast path the common case of providing an object with a single
        // property containing a primitive value
        return function(object) {
          var b = object[key];
          return a === b && (a !== 0 || (1 / a == 1 / b));
        };
      }
      return function(object) {
        var length = props.length,
            result = false;

        while (length--) {
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
            break;
          }
        }
        return result;
      };
    }

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('Fred, Wilma, & Pebbles');
     * // => 'Fred, Wilma, &amp; Pebbles'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds function properties of a source object to the destination object.
     * If `object` is a function methods will be added to its prototype as well.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Function|Object} [object=lodash] object The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
     * @example
     *
     * function capitalize(string) {
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     * }
     *
     * _.mixin({ 'capitalize': capitalize });
     * _.capitalize('fred');
     * // => 'Fred'
     *
     * _('fred').capitalize().value();
     * // => 'Fred'
     *
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
     * _('fred').capitalize();
     * // => 'Fred'
     */
    function mixin(object, source, options) {
      var chain = true,
          methodNames = source && functions(source);

      if (!source || (!options && !methodNames.length)) {
        if (options == null) {
          options = source;
        }
        ctor = lodashWrapper;
        source = object;
        object = lodash;
        methodNames = functions(source);
      }
      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      var ctor = object,
          isFunc = isFunction(ctor);

      forEach(methodNames, function(methodName) {
        var func = object[methodName] = source[methodName];
        if (isFunc) {
          ctor.prototype[methodName] = function() {
            var chainAll = this.__chain__,
                value = this.__wrapped__,
                args = [value];

            push.apply(args, arguments);
            var result = func.apply(object, args);
            if (chain || chainAll) {
              if (value === result && isObject(result)) {
                return this;
              }
              result = new ctor(result);
              result.__chain__ = chainAll;
            }
            return result;
          };
        }
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * A no-operation function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // no operation performed
    }

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var stamp = _.now();
     * _.defer(function() { console.log(_.now() - stamp); });
     * // => logs the number of milliseconds it took for the deferred function to be called
     */
    var now = isNative(now = Date.now) && now || function() {
      return new Date().getTime();
    };

    /**
     * Converts the given value into an integer of the specified radix.
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.io/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} value The value to parse.
     * @param {number} [radix] The radix used to interpret the value to parse.
     * @returns {number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
    };

    /**
     * Creates a "_.pluck" style function, which returns the `key` value of a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} key The name of the property to retrieve.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var characters = [
     *   { 'name': 'fred',   'age': 40 },
     *   { 'name': 'barney', 'age': 36 }
     * ];
     *
     * var getName = _.property('name');
     *
     * _.map(characters, getName);
     * // => ['barney', 'fred']
     *
     * _.sortBy(characters, getName);
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
     */
    function property(key) {
      return function(object) {
        return object[key];
      };
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number will be
     * returned. If `floating` is truey or either `min` or `max` are floats a
     * floating-point number will be returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating=false] Specify returning a floating-point number.
     * @returns {number} Returns a random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (typeof min == 'boolean' && noMax) {
          floating = min;
          min = 1;
        }
        else if (!noMax && typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /**
     * Resolves the value of property `key` on `object`. If `key` is a function
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to resolve.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, key) {
      if (object) {
        var value = object[key];
        return isFunction(value) ? object[key]() : value;
      }
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * For more information on precompiling templates see:
     * https://lodash.com/custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} text The template text.
     * @param {Object} data The data object used to populate the text.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as local variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [variable] The data object variable name.
     * @returns {Function|string} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'fred' });
     * // => 'hello fred'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to generate HTML
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'pebbles' });
     * // => 'hello pebbles'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
     * // => 'hello barney!'
     *
     * // using a custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `imports` option to import jQuery
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text = String(text || '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source by its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the callback `n` times, returning an array of the results
     * of each callback execution. The callback is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns an array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = baseCreateCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The inverse of `_.escape` this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('Fred, Barney &amp; Pebbles');
     * // => 'Fred, Barney & Pebbles'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps the given value with explicit
     * method chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(characters)
     *     .sortBy('age')
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
     *     .first()
     *     .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      value = new lodashWrapper(value);
      value.__chain__ = true;
      return value;
    }

    /**
     * Invokes `interceptor` with the `value` as the first argument and then
     * returns `value`. The purpose of this method is to "tap into" a method
     * chain in order to perform operations on intermediate results within
     * the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .tap(function(array) { array.pop(); })
     *  .reverse()
     *  .value();
     * // => [3, 2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chaining
     * @returns {*} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(characters).first();
     * // => { 'name': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(characters).chain()
     *   .first()
     *   .pick('age')
     *   .value();
     * // => { 'age': 36 }
     */
    function wrapperChain() {
      this.__chain__ = true;
      return this;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {string} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {*} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.createCallback = createCallback;
    lodash.curry = curry;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.mapValues = mapValues;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.pull = pull;
    lodash.range = range;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    lodash.unzip = zip;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    mixin(function() {
      var source = {}
      forOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }(), false);

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;
    lodash.sample = sample;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      var callbackable = methodName !== 'sample';
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(n, guard) {
          var chainAll = this.__chain__,
              result = func(this.__wrapped__, n, guard);

          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
            ? result
            : new lodashWrapper(result, chainAll);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = '2.4.2';

    // add "Chaining" functions to the wrapper
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    forEach(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            result = func.apply(this.__wrapped__, arguments);

        return chainAll
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });

    // add `Array` functions that return the existing wrapped value
    forEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    forEach(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
      };
    });

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
    root._ = _;
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],12:[function(require,module,exports){
(function (global){
'use strict';
(typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null),
    bodyclass = require('./bodyclass.js'),
    utils = require('./utils.js');

//--- Add additional body classes for individualized CSS rules
bodyclass();

//--- Pimp old Twoday classes, e.g. button in a .message
utils.pimpClasses();

//--- Set up the Angular app, Modernizr constant and run the FastClick js
angular
    .module('f5SkinApp', ['mm.foundation', 'angularSpectrumColorpicker', 'toastr'])
    .config(function(toastrConfig){
        angular.extend(toastrConfig, {
            allowHtml: true,
            closeButton: true,
            progressBar: true,
            timeOut: 5000
        });
    })
    .constant('Modernizr', window.Modernizr)
    .run( function(){ window.FastClick.attach(document.body); });

//--- Require all services, controllers and directives through their folder's index.js
require('./services');
require('./controllers');
require('./directives');
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./bodyclass.js":14,"./controllers":25,"./directives":28,"./services":36,"./utils.js":37}],13:[function(require,module,exports){
'use strict';

/**
 * Sets the appropriate background image based on the actual hour of the day and user defined image items/slots
 *
 */

function isSlotIdent(actual, stored){
    return (typeof stored === "undefined" ? false :
        actual.href===stored.href && actual.repeat===stored.repeat && actual.position===stored.position && actual.size===stored.size && actual.attachment===stored.attachment);
}

module.exports = {

    setImage: function(timeSlots){
        var getMinute = function(date){ return date.getHours()*60+date.getMinutes(); };
//----- return immediately if there are no user defined time slots/images
        if (timeSlots.length===0) return;
//----- get the current minute of the day
        var h = getMinute(new Date());
//----- check with each timeslot to find the appropriate entry
        $.each( timeSlots, function(){
            if (h>=getMinute(this.from) && h<=getMinute(this.to)){
                var $body = $('body');
//------------- do nothing if this background image has already been installed before with same params
                if (isSlotIdent(this, $body.data('timeSlot'))) return false;
//------------- once timeslot was found and needs to be installed, then preload/cache the image
                var self = this;
                $('<img/>').attr('src', self.href).load( function(){
//----------------- remove the temp img to prevent memory leaks
                    $(this).remove();
//----------------- now save and set the background-image with all params
                    $body.data('timeSlot', self)
                         .css({
                            'background-image': 'url("'+self.href+'")',
                            'background-repeat': self.repeat,
                            'background-position': self.position,
                            'background-attachment': self.attachment,
                            'background-size': self.size,
                            'height': '100%'
                    });
//----------------- and fade the preloading animation
                    $("#loader-wrapper").fadeOut("slow");
                });
//------------- then quit the each loop
                return false;
            }
        });
    }

};
},{}],14:[function(require,module,exports){
'use strict';

/**
 * Adds additional classes to the BODY element
 * onHome ~ if the homepage is displayed
 * onTopic ~ if a topic page is displayed
 * topic-{topicID} ~ ID of the topic (lowercase ID)
 * onStory ~ if a story is displayed
 * story-{storyID} ~ ID of the story (lowercase ID)
 *
 * Examples:
 * pathname="/" ===> bodyclass="onHome"
 * pathname="/topics/Testthema/" ==> bodyclass="onTopic topic-testthema"
 * pathname="/stories/is-it-me-youre-looking-for/" ==> bodyclass="onStory story-is-it-me-youre-looking-for"
 *
 */

module.exports = function(){

    var bodyclass = "";
    if (location.pathname === "/") bodyclass = "onHome";
    else {
        var path = location.pathname.replace(/\//g, " ").trim().split(" ");
        switch (path[0]) {
            case "topics":  bodyclass = "onTopic " + path[1].toLowerCase(); break;
            case "stories": bodyclass = "onStory " + path[1].toLowerCase(); break;
        }
    }
    if (bodyclass.length>0) $("body").addClass(bodyclass);

};
},{}],15:[function(require,module,exports){
'use strict';

module.exports = function($rootScope, $filter, $q, UpdateCheck, TwodaySkin, toastr){
    
    var vm = this;
    
    vm.param = $rootScope.param;

    vm.msgClose = true;
    vm.isChecking = false;

    vm.dateNextCheck = function(){
        return (vm.param.update.gap<0
            ? "Keine Prüfung"
            : $filter('date')(new Date(vm.param.update.lastCheck.getTime()+vm.param.update.gap), "dd.MM.yyyy HH:mm"));
    };

    vm.updateChecks = [
        { check: "täglich", gap: 24*60*60*1000 },
        { check: "wöchentlich", gap: 7*24*60*60*1000 },
        { check: "monatlich", gap: 30*24*60*60*1000 },
        { check: "niemals", gap: -1 }
    ];

    vm.useFrequency = function(index){
        var frequency = vm.updateChecks[index];
        vm.param.update.check = frequency.check;
        vm.param.update.gap = frequency.gap;
    };

    vm.checkSkinUpdate = function(){

        var skinEditUrl = vm.param.layoutUrl+"skins/edit?key=",
            promises = [];

        $.each( vm.release.skins, function(){
            promises.push( TwodaySkin.get(skinEditUrl+this.name) );
        });

        $q.all(promises).then( function(results){ // success: all skins read

            $.each( results, function(index, response){ // response = {config, data, headers, status, statusText}

                var skin = vm.release.skins[index];
                var $form = $(response.data).find("form").eq(0);
                var skinCode = $.trim($form.find("textarea[name=skin]").val());
                var isSkinInitial = (skinCode.length === 0);
                if (typeof vm.param.update.overwrite[skin.name] !== "undefined"){
                    switch(vm.param.update.overwrite[skin.name]){ // always, never
                        case "always": skin.status = "needsupdate"; break;
                        case "never":  skin.status = (isSkinInitial ? "needsupdate" : "skipped"); break;
                    }
                } else {
                    skin.status = (skin.content.length===skinCode.length && skin.content===skinCode ? "isequal" : "needsupdate");
                }
                console.log("Index:", index, skin.name, isSkinInitial, "Rlse:", skin.content.length, "Blog:", skinCode.length, skin.status);
            });

            vm.releaseChecked = true;
        }, function(){ // error: at least one skin read failed
            toastr.error("Mindestens ein Skin konnte nicht fehlerfrei gelesen werden!", vm.param.msgHeader);
        });
    };

    vm.checkReleaseUpdate = function(e){

        vm.isChecking = true;
        vm.releaseLoaded = true;
        vm.releaseChecked = false;

        if (e.ctrlKey){
            var version = vm.param.update.version.split('.');
            version[version.length-1] = (parseInt(version[version.length-1], 10) - 1).toString();
            vm.param.update.version = version.join('.');
        }

        UpdateCheck.verify(vm.param).then(
            function(release){
                vm.release = release.data;
                vm.newVersion = release.newVersion;
                vm.msgClose = false;
                vm.param.update.lastCheck = new Date();
                vm.isChecking = false;
                if (vm.newVersion) vm.checkSkinUpdate();
            },
            function(status){
                vm.isChecking = vm.releaseLoaded = vm.msgClose = false;
            });

    };

    vm.updateStatus = function(skinStatus){

        var updStatus = {
                "unchecked":    "noch nicht geprüft",
                "isequal":      "ist bereits aktuell",
                "needsupdate":  "wird aktualisiert",
                "updated":      "wurde erfolgreich aktualisiert",
                "error":        "Aktualisierung fehlgeschlagen",
                "skipped":      "Benutzerskin bleibt unverändert"
            },
            statParts = skinStatus.split("~");

        return updStatus[statParts[0]]+(statParts.length>1 ? "->"+statParts[1] : "");

    };

    vm.installRelease = function(){

        $.each( vm.release.skins, function(){
            var skin = this;
            if (skin.status === "needsupdate"){
                TwodaySkin.update(skin, vm.param).then(function(skin){
                    // success: skin.status already updated
                }, function(status, skin){
                    // error: skin.status already updated
                });
            }
        });

    };

};
},{}],16:[function(require,module,exports){
'use strict';

var background = require('../background.js'),
    utils = require('../utils.js');

module.exports = function($rootScope, ImageProvider, $window, toastr){
    
    var vm = this;
    
    vm.param = $rootScope.param;

    vm.positions = [
        "left top", "left center", "left bottom",
        "right top", "right center", "right bottom",
        "center top", "center center", "center bottom"
    ];

    vm.repeats = [ "repeat", "repeat-x", "repeat-y", "no-repeat" ];

    vm.sizes = [ "auto", "cover", "contain" ];

    vm.attachments = [ "fixed", "local", "scroll" ];

    vm.isEditMode = vm.isCreateMode = vm.isQueryImage = false;

    vm.slotCheck = function(){
        var slots=vm.param.timeSlots, slotEnd=-1, status=(slots.length>0 ? "" : "Keine Hintergrund-Zeitfenster vorhanden!");
        $.each( vm.param.timeSlots, function(){
            //console.log("from: "+utils.getMinute(this.from)+" slotEnd: "+slotEnd+" ("+(slotEnd+1)+")");
            if (utils.getMinute(this.from)!==slotEnd+1){
                status = (slotEnd<0
                       ? "Die Zeitangabe beginnt nicht bei 00:00 Uhr!"
                       : "Es besteht eine Zeitlücke bei "+utils.formatTime(this.from)+" Uhr!");
                return false;
            } else slotEnd = utils.getMinute(this.to);
        });
        if (status.length===0 && slotEnd!==23*60+59) status = "Die Zeitangabe endet nicht bei 23:59 Uhr!";
        vm.slotStatusOK = (status.length===0);
        vm.slotStatus = (vm.slotStatusOK ? "Alle Hintergrund-Zeitfenster vollständig definiert." : status);
    };

    vm.edit = function(index){
        vm.slot = angular.copy(vm.param.timeSlots[index]);
        vm.index = index;
        vm.isEditMode = true;
    };

    vm.cancel = function(){
        if (vm.isCreateMode) delete vm.slot;
        vm.isEditMode = vm.isCreateMode = false;
    };

    vm.save = function(){
        if (vm.isCreateMode) vm.insert(); else vm.update();
        background.setImage(vm.param.timeSlots);
        vm.slotCheck();
        vm.isEditMode = vm.isCreateMode = false;
    };

    vm.sort = function(){
        vm.param.timeSlots.sort( function(a,b){ return utils.getMinute(a.from) - utils.getMinute(b.from); });
    };

    vm.findFirst = function(cbSelectCondition){
        var slots = vm.param.timeSlots, selectedIndex = -1;
        $.each( slots, function(index, slot){
            if (cbSelectCondition(slot)){
                selectedIndex = index;
                return false;
            }
        });
        return selectedIndex;
    };

    vm.insert = function(){
//----- Get the currently defined timeslots
        var slots = vm.param.timeSlots, slot, sIdx = 0, clone = null;
//----- Delete all old slots that are encompassed/embedded by the new slot
        while (sIdx<slots.length){
            slot = slots[sIdx];
            if (slot.from>=vm.slot.from && slot.to<=vm.slot.to)
                vm.remove(sIdx, "nocheck");
            else
                sIdx++;
        }
//----- Find the first slot where new-fromTime is included
        sIdx = vm.findFirst(function(thisSlot){ return (vm.slot.from<thisSlot.to); });
        if (sIdx>=0){
            if (vm.slot.from>slots[sIdx].from && vm.slot.to<slots[sIdx].to){
                clone = angular.copy(slots[sIdx]);
                clone.from = utils.addMinutes(vm.slot.to, +1);
                slots[sIdx].to = utils.addMinutes(vm.slot.from, -1);
            } else if (vm.slot.from<=slots[sIdx].from && vm.slot.to<slots[sIdx].to){
                slots[sIdx].from = utils.addMinutes(vm.slot.to, +1);
            } else if (vm.slot.to>=slots[sIdx].to){
                slots[sIdx].to = utils.addMinutes(vm.slot.from, -1);
                if (slots.length>sIdx+1) slots[sIdx+1].from = utils.addMinutes(vm.slot.to, +1);
            }
        }
//----- Push the new slot to the array
        slots.push(vm.slot);
//----- Push the clone slot to the array if there is one
        if (clone!==null) slots.push(clone);
//----- and re-sort
        vm.sort();
    };

    vm.update = function(){
        vm.param.timeSlots[vm.index] = vm.slot;
        vm.sort();
    };

    vm.remove = function(index, nocheck){
//----- Get the currently defined timeslots
        var slots = vm.param.timeSlots;
//----- If index to delete is not the first, then consolidate times with preceeding timeslot
        if (index>0) slots[index-1].to = slots[index].to;
//----- If index is the first and there is a succeeding timeslot, consolidate with succeeding timeslot
        else if (slots.length>1) slots[1].from = slots[0].from;
//----- anyway delete this index now
        slots.splice(index, 1);
//----- and re-check the slots status unless internal call from insert function
        if (nocheck || '' !== 'nocheck') vm.slotCheck();
    };

    vm.create = function(){
        vm.slot = {
              "from": new Date(1970,0,1,0,0,0), "to": new Date(1970,0,1,23,59,0),
              "repeat": "no-repeat", "position": "center top", "size": "cover",
              "attachment": "fixed", "href": vm.param.site.imgFolder };
        vm.isCreateMode = true;
    };

    vm.usePosition = function(index){
        vm.slot.position = vm.positions[index];
    };

    vm.useRepeat = function(index){
        vm.slot.repeat = vm.repeats[index];
    };

    vm.useSize = function(index){
        vm.slot.size = vm.sizes[index];
    };

    vm.useAttachment = function(index){
        vm.slot.attachment = vm.attachments[index];
    };

    vm.navImagePool = {
        providers: [
            {
                name: 'Unsplash',
                url: function(){ return vm.param.update.releaseUrl+'unsplash.json'; },
                load: function(data){ return data || []; },
                getFormatInfo: function(target, srcRatio){
                    var w, h;
                    switch (target){
                        case 'gallery': w=240; h=160; break;
                        case 'fullscreen': w=$window.screen.width; h=$window.screen.height; break;
                        case 'background': w=1920; h=Math.round(1920/srcRatio); break;
                    }
                    return { image: 'img_url', suffix: '?fm=jpg&q=75&w='+w+'&h='+h+'&fit=crop' };
                }
            },
            {
                name: 'Picjumbo',
                url: function(){ return vm.param.update.releaseUrl+'picjumbo.json'; },
                load: function(data){ return data || []; },
                getFormatInfo: function(target, srcRatio){
                    var w, h;
                    switch (target){
                        case 'gallery': w=240; h=160; break;
                        case 'fullscreen': w=$window.screen.width; h=$window.screen.height; break;
                        case 'background': w=1920; h=Math.round(1920/srcRatio); break;
                    }
                    return { image: 'img_url', suffix: '?fm=jpg&q=75&w='+w+'&h='+h+'&fit=crop' };
                }
            },
            {
                name: 'GoogleDrive',
                domain: 'https://googledrive.com',
                load: function(data){
                    var items = [], href, item, objectIs, self=this,
                        folderImgUrl = vm.param.update.releaseUrl+'folder.jpg';
                    $(data).find(".folder-cell>a").each( function(){
                        href = $(this).attr("href"); // suppress domain insertion
                        item = decodeURI(href).split('/').pop();
                        objectIs = utils.isItem(item);
                        if (!objectIs.aFolder && !objectIs.anImage) return true;
                        if (objectIs.aFolder) item = item  || 'zurück';
                        items.push({
                            'isImage': objectIs.anImage,
                            'href': href,
                            'fname': item,
                            'img_url': (objectIs.aFolder ? folderImgUrl : self.domain+href)
                        });
                    });
                    return items;
                },
                url: function() {
                    var gd = utils.removeTrailingSlash(vm.param.site.imgFolder);
                    if (gd.length===0){
                        toastr.warning('Bitte geben Sie zuerst Ihr GoogleDrive-Bildverzeichnis im Tab "Grunddaten" ein!', vm.param.msgHeader);
                        return '';
                    }
                    if (gd.indexOf('drive.google.com')>=0){
                        gd = vm.param.site.imgFolder = 'https://googledrive.com/host/' + gd.split('/').pop();
                    } else if (gd.indexOf('googledrive.com/host')<0){
                        toastr.error('Das angegebene Bildverzeichnis ist keine gültige GoogleDrive-URL!', vm.param.msgHeader);
                        return '';
                    }
                    return gd;
                },
                getFormatInfo: function(target, srcRatio){
                    return { image: 'img_url', suffix: '' };
                }
            },
            {
                name: 'Flickr',
                load: function(data){
                    var items = [];
                    angular.forEach( data.query.results.photo, function(item){
                        items.push({
                            'isImage': (item.media==='photo'),
                            'img_url': item.url_o,
                            'fname': item.title,
                            'img_sml': item.url_s,
                            'ratio': (parseInt(item.width_o, 10) / parseInt(item.height_o, 10))
                        });
                    });
                    return items;
                },
                url: function() {
                    if (vm.param.site.flickrUserID.length===0){
                        toastr.warning('Bitte geben Sie zuerst Ihr Flickr-Benutzer-ID im Tab "Grunddaten" ein!', vm.param.msgHeader);
                        return '';
                    }
                    if (!vm.param.site.isFlickrVerified){
                        toastr.warning('Die eingegebene Benutzer-ID muss vorher noch überprüft werden (Tab "Grunddaten")!', vm.param.msgHeader);
                        return '';
                    }
                    var yql = 'https://query.yahooapis.com/v1/public/yql?q=#q',
                        qry = encodeURIComponent(
                            'SELECT * FROM flickr.people.publicphotos(0) WHERE api_key="#k" AND user_id="#u" AND extras="media,o_dims,url_o,url_s"'
                            .replace('#k', utils.getRequestID())
                            .replace('#u', vm.param.site.flickrUserID));
                    return yql.replace('#q', qry)+'&env=store://datatables.org/alltableswithkeys&format=json&callback=';
                },
                getFormatInfo: function(target, srcRatio){
                    var field;
                    switch (target){
                        case 'gallery': field = 'img_sml'; break;
                        default: field = 'img_url'; break;
                    }
                    return { image: field, suffix: '' };
                }
            }

        ],
        provider: {},
        images: [],
        page: -1,
        lastPage: 0,
        pageSize: 24,
        pageImages: [],
        isLoadingImages: false,
        subFolder: '',
        isFirstPage: function(){ return (this.page===0); },
        isLastPage: function(){ return (this.page===this.lastPage); },
        useProvider: function(index){
            this.provider = this.providers[index];
            this.subFolder = '';
            this.loadImages('');
        },
        nextPage: function(){ ++this.page; this.showImages(); },
        prevPage: function(){ --this.page; this.showImages(); },
        toFirstPage: function(){ this.page=0; this.showImages(); },
        toLastPage: function(){ this.page=this.lastPage; this.showImages(); },
        selectFolder: function(index){
            var i = this.page*this.pageSize+index;
            this.subFolder = (this.provider.domain+utils.removeTrailingSlash(this.images[i].href))
                .replace(this.provider.url(), '');
            this.loadImages(this.subFolder);
        },
        viewImage: function(index){
            var i = this.page*this.pageSize,
                j = Math.min(i+this.pageSize, this.images.length),
                fmt = this.provider.getFormatInfo('fullscreen'),
                swipeImages = [];
            while (i<j){
                swipeImages.push({ href: this.images[i][fmt.image]+fmt.suffix });
                ++i;
            }
            $.swipebox( swipeImages, {useSVG: false, initialIndexOnArray: index} );
        },
        selectImage: function(index){
            var i = this.page*this.pageSize+index,
                ratio = (typeof this.images[i].ratio !== 'undefined' ? this.images[i].ratio : 1.5),
                fmt = this.provider.getFormatInfo('background', ratio);
            vm.slot.href = this.images[i][fmt.image]+fmt.suffix;
            vm.isQueryImage = false;
        },
        showImages: function(){
            var i = this.page*this.pageSize,
                j = Math.min(i+this.pageSize, this.images.length),
                item, isImage, fName, bgUrl,
                fmt = this.provider.getFormatInfo('gallery');
            this.pageImages.length = 0;
            while (i<j){
                item = this.images[i];
                isImage = (item.hasOwnProperty('isImage') ? item.isImage : true);
                fName = (item.hasOwnProperty('fname') ? item.fname : '');
                bgUrl = 'url("'+item[fmt.image]+fmt.suffix+'")';
                this.pageImages.push({
                    isImage: isImage,
                    fName: fName,
                    style: {'background-image': bgUrl}
                });
                ++i;
            }
        },
        loadImages: function(subFolder){
            var self = this;
            self.images.length = 0;
            self.isLoadingImages = true;
            self.pageImages.length = 0;
            self.page = 0;
            var url = self.provider.url();
            if (url.length===0) return;
            ImageProvider.load( url+subFolder ).then(
                function(data){
                    self.images = self.provider.load(data);
                    self.lastPage = (self.images.length===0 ? 0 : Math.floor((self.images.length-1)/self.pageSize));
                    self.showImages();
                    self.isLoadingImages = false;
                },
                function(data, status){
                    toastr.error("Fehler beim Lesen der Bilddaten von "+self.provider.name+", Status: "+status, vm.param.msgHeader);
                    self.lastPage = 0;
                    self.isLoadingImages = false;
                }
            );
        }
    };

    vm.queryImage = function(){
        vm.isQueryImage = true;
        if (vm.navImagePool.page<0) vm.navImagePool.useProvider(0);
    };

    vm.slotCheck();

};
},{"../background.js":13,"../utils.js":37}],17:[function(require,module,exports){
'use strict';

module.exports = function($scope, $rootScope, ImageProvider, UserStyles, toastr){

    var vm = this;
    
    vm.param = $rootScope.param;

    vm.verifyDriveFolder = function(){
        if (vm.param.site.imgFolder.length===0){
            vm.param.site.isDriveVerified = false;
            return;
        }
        ImageProvider.load( vm.param.site.imgFolder ).then(
            function(data){
                var linkToGoogleDrive = $(data).find(".folder-drive-logo>a").eq(0);
                vm.param.site.isDriveVerified = (linkToGoogleDrive.length>0 && linkToGoogleDrive[0].href.indexOf("drive.google.com")>0);
                if (vm.param.site.isDriveVerified)
                    toastr.success("Das GoogleDrive-Verzeichnis kann nun verwendet werden!", vm.param.msgHeader);
                else
                    toastr.error("Das Verzeichnis ist kein gültiges GoogleDrive-Verzeichnis!", vm.param.msgHeader);
            },
            function(){
                vm.param.site.isDriveVerified = false;
                toastr.error("Auf das angegebene Verzeichnis konnte nicht zugegriffen werden!", vm.param.msgHeader);
            }
        );
    };
    
    vm.verifyFlickrUser = function() {
        if (vm.param.site.flickrUserID.length === 0) {
            vm.param.site.isFlickrVerified = false;
            return;
        }
        var params = {
            method: 'flickr.people.getInfo',
            api_key: '',
            user_id: vm.param.site.flickrUserID,
            format: 'json',
            nojsoncallback: 1
        };
        ImageProvider.load( 'https://api.flickr.com/services/rest/', params ).then(
            function(data){
                console.log(data);
                vm.param.site.isFlickrVerified = (data.stat==='ok');
                if (vm.param.site.isFlickrVerified){
                    vm.param.site.flickrUserID = data.person.nsid;
                    toastr.success('Die Verbindung mit Benutzerkonto ' + data.person.username._content + ' wurde erfolgreich hergestellt.', vm.param.msgHeader);
                }
                else
                    toastr.error('Das Benutzerkonto '+vm.param.site.flickrUserID+' konnte nicht gefunden werden!', vm.param.msgHeader);
            },
            function(){
                vm.param.site.isDriveVerified = false;
                toastr.error('Auf das angegebene Benutzerkonto konnte nicht zugegriffen werden!', vm.param.msgHeader);
            }
        );

    };

    vm.testLoader = function(){
        $("#loader-wrapper").show(0).delay(3000).hide(0);
    };

};

},{}],18:[function(require,module,exports){
'use strict';
var utils = require('../utils.js');

module.exports = function($scope, $rootScope, toastr){

    var vm = this;

    vm.param = $rootScope.param;
    vm.formats = angular.copy(vm.param.format);

    vm.resetMode = function(){
        vm.isEditMode = vm.isCreateMode = false;
    };  vm.resetMode();

    vm.isKeyLocked = function(){
        return (typeof vm.item === 'undefined' ? false : !vm.item.user);
    };

    vm.proposeName = function(){
        vm.itemname = utils.legitSlug(vm.item.selector);
    };

    vm.changeColor = function(name){
        var formatOptions, id, linebreak, ngModelCtrl;

        if (!name){
            formatOptions = vm.item; id = 'Item'; linebreak = false;
        } else {
            formatOptions = vm.param.format[name]; id = name; linebreak = true;
        }

        formatOptions = utils.extendColor(formatOptions);
        ngModelCtrl = $('#css-'+id).controller('ngModel');
        ngModelCtrl.$setViewValue(utils.JsonToCss(formatOptions.style, linebreak));
        ngModelCtrl.$render();
    };

    vm.applyColors = function(){
        console.log('called');
        if (vm.item){
            console.log('changed');
            if (vm.item.style.hasOwnProperty('color')) vm.item.color = vm.item.style['color'];
            if (vm.item.style.hasOwnProperty('background-color')) vm.item.bgcolor = vm.item.style['background-color'];
        }
    };

    vm.create = function(){
        vm.item = utils.extendColor({
            selector: "", text: "", user: true, color: "#444444", bgcolor: "transparent", style: {}
        });
        vm.itemname = "";
        vm.isCreateMode = true;
    };

    vm.edit = function(name){
        vm.item = angular.copy(vm.param.format[name]);
        vm.itemname = vm.itemname_before = name;
        vm.isEditMode = true;
    };

    vm.remove = function(name){
        delete vm.param.format[name];
    };

    function doesNameExist(newName){
        var doesExist = (newName in vm.param.format);
        if (doesExist) toastr.error('Der eingegebene Name existiert bereits. Bitte verwenden Sie eine eindeutige Kennung.', vm.param.msgHeader);
        return doesExist;
    }

    vm.save = function(){
        if (vm.isCreateMode){ // Create Mode
            if (doesNameExist(vm.itemname)) return;
        } else { // Edit Mode
            if (vm.itemname!==vm.itemname_before){ // Name was changed during edit
                if (doesNameExist(vm.itemname)) return;
                delete vm.param.format[vm.itemname_before];
            }
        }
        vm.param.format[vm.itemname] = vm.item;
        vm.resetMode();
    };

    vm.cancel = function(){
        if (vm.item) delete vm.item;
        vm.resetMode();
    };

};
},{"../utils.js":37}],19:[function(require,module,exports){
'use strict';

module.exports = function ($rootScope, UserStyles, $modalInstance){

    var vm = this;

    vm.param = $rootScope.param;

    vm.changeInProp = function(fieldID, value){
        UserStyles.pushDependency( fieldID, value );
    };

    vm.ok = function(){ $modalInstance.close(); };

    vm.cancel = function(){ $modalInstance.dismiss(); };

};

},{}],20:[function(require,module,exports){
'use strict';

var background = require('../background.js'),
    utils = require('../utils.js');

module.exports = function ($scope, $rootScope, Preferences, UpdateCheck, UserStyles, $window, $interval, $modal){
    
//- Define viewmodel as this
    var vm = this;

//- Get the consolidated preferences data (includes standard and user modified settings)
    vm.param = $rootScope.param = Preferences.get("consolidated");

//- Dynamically generate CSS from user preferences / overrides (e.g. icon colors)
    UserStyles.initRulesFromPreferences();
    vm.userStyles = $rootScope.userStyles;

//- Set background image based on time of the day and user defined image items/slots
    var UpdateBackgroundImage = function(){
        background.setImage(vm.param.timeSlots);
    };  UpdateBackgroundImage();

//- Install background image check routine to be called every 5 seconds
    var checkBackgroundTimer = $interval( UpdateBackgroundImage, 5000 );

//- Make sure interval timer will be removed once controller gets destroyed
    $scope.$on('$destroy', function(){
        $interval.cancel(checkBackgroundTimer);
    });

//- Set default value for topics.text if user has not provided one
    if (vm.param.topbar.menuItems.topics.text.length===0)
        vm.param.topbar.menuItems.topics.text = vm.param.siteAlias.toLowerCase();

//- Adjust topics.class if topiclist-macro has found/generated any story topics
    vm.param.topbar.menuItems.topics.drop = ($("#toolbarTopics").has(".dropdown"));

//- Extract breadcrumb/special menu links and put them into the scope
    vm.param.topbar.menuItems.breadcrumbs.items = utils.getBreadcrumbs();
    //console.dir(vm.param.topbar.menuItems.breadcrumbs.items);
    vm.param.topbar.menuItems.abo.items = utils.getSpecialMenu("#aboMenu");
    vm.param.topbar.menuItems.images.items = utils.getSpecialMenu("#imageMenu");

//- Add utility functions to be used in ng-functions (view)
    vm.param.isLoggedIn = function(){
        return (vm.param.userName.length>0);
    };
    vm.param.isAdmin = function(){
        return (vm.param.isLoggedIn() && vm.param.userRole()==="Administrator");
    };
    vm.param.isContributor = function(){
        return (vm.param.isLoggedIn() && (vm.param.userRole()==="Contributor" || vm.param.userRole()==="Administrator"));
    };
    vm.param.sendMail = function(){
        $window.location.href = utils.rot13(vm.param.topbar.mailIcon.href);
    };

//- When true (user clicked the close button), it triggers the fadeout of the response alert-box
    vm.msgClose = false;

    vm.customize = {

        hide: function(){ $('#f5container').fadeOut(400); },

        show: function(){ $('#f5container').fadeIn(400); },

        loadSpectrum: function(){
        },

        open: function(){
            var self = this;
            self.hide();
            Modernizr.load(
                {
                    test: (typeof $.fn.spectrum === "undefined"),
                    yep: [
                        'https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.7.0/spectrum.min.css',
                        'https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.7.0/spectrum.min.js'
                    ],
                    complete: function(){

                        var localization = $.spectrum.localization["de"] = {
                            cancelText: "Abbrechen",
                            chooseText: "Wählen",
                            clearText: "Farbauswahl zurücksetzen",
                            noColorSelectedText: "Keine Farbe ausgewählt",
                            togglePaletteMoreText: "Mehr",
                            togglePaletteLessText: "Weniger"
                        }, spectrumDefaults = {
                            allowEmpty: true,
                            clickoutFiresChange: false,
                            localStorageKey: "f5spectrum",
                            preferredFormat: "hex",
                            showAlpha: true,
                            showInitial: true,
                            showInput: true
                        };

                        $.extend($.fn.spectrum.defaults, spectrumDefaults, localization);

                        var copyOfParam = $.extend(true, {}, vm.param);

                        var modalCustomize = $modal.open({
                            templateUrl: "customizeBlogHtml", // in Site-ngTemplates.jade
                            controller:  "CustomizeCtrl as customize",
                            resolve: {},
                            backdrop: "static",
                            keyboard: false,
                            windowClass: "xlarge"
                        });

                        modalCustomize.result.then(
                            function(){ // User confirmed change
                                if (!angular.equals(copyOfParam, vm.param)) Preferences.save(vm.param);
                                self.show();
                            },
                            function(){ // User cancelled change
                                if (!angular.equals(copyOfParam, vm.param)) vm.param = copyOfParam;
                                self.show();
                            }
                        );
                    }
                }
            );
        }
    };

//- Check for available updates if user is admin and check frequency is not "never"
    if (vm.param.isAdmin() && vm.param.update.gap>0){
        UpdateCheck.onLoad(vm.param);
    }
};
},{"../background.js":13,"../utils.js":37}],21:[function(require,module,exports){
'use strict';

module.exports = function($scope, $rootScope, UserStyles){

    var vm = this;

    vm.param = $rootScope.param;

};

},{}],22:[function(require,module,exports){
'use strict';
var utils = require('../utils.js');

module.exports = function($rootScope){

    var vm = this;

    vm.param = $rootScope.param;
    vm.isCreateMode = vm.isEditMode = false;

    vm.getIcon = function(){
        return utils.getIcon(vm.param.topbar.addCustomMenu.icon);
    };

    vm.getEntryType = function(){
        var type = (typeof vm.entry === "undefined" ? false : vm.entry.link);
        return (type ? 'Linktext' : 'Überschrift');
    };

    vm.create = function(){
        vm.entry = { link: true, text: '', href: '' };
        vm.isCreateMode = true;
    };

    vm.edit = function(index){
        vm.entry = angular.copy(vm.param.topbar.addCustomMenu.items[index]);
        vm.index = index;
        vm.isEditMode = true;
    };

    vm.remove = function(index){
        vm.param.topbar.addCustomMenu.items.splice(index, 1);
    };

    vm.moveup = function(index){
        if (index>0) utils.swap(vm.param.topbar.addCustomMenu.items, index, index-1);
    };

    vm.movedown = function(index){
        if (index<vm.param.topbar.addCustomMenu.items.length-1) utils.swap(vm.param.topbar.addCustomMenu.items, index, index+1);
    };

    vm.save = function(){
        if (vm.isCreateMode)
            vm.param.topbar.addCustomMenu.items.push(vm.entry);
        else
            vm.param.topbar.addCustomMenu.items[vm.index] = vm.entry;
        vm.isEditMode = vm.isCreateMode = false;
    };

    vm.cancel = function(){
        vm.isCreateMode = vm.isEditMode = false;
    };

};
},{"../utils.js":37}],23:[function(require,module,exports){
'use strict';
var utils = require('../utils.js');

module.exports = function($scope, $rootScope, UserStyles){

    var vm = this;

    vm.param = $rootScope.param;
    vm.isCreateMode = vm.isEditMode = false;

    vm.getMenuIcon = function(faIconname){
        return utils.getIcon(faIconname || '');
    };

    vm.getPreviewClass = function(){
        return (typeof vm.icon === 'undefined' ? '' : 'menuspecial-'+vm.icon.name);
    };

    vm.isKeyLocked = function(){
        return (typeof vm.icon === 'undefined' ? false : !vm.icon.user);
    };

    vm.isUrlLocked = function(){
        return (typeof vm.icon === 'undefined' ? false : vm.icon.name==='customize');
    };

    vm.changeColor = function(){
        UserStyles.setRule('.menuspecial-'+vm.icon.name+' i', UserStyles.formatRule('color', vm.icon.color, true)).pushCSS();
    };

    vm.changeHover = function(){
        UserStyles.setRule('li:hover .menuspecial-'+vm.icon.name+' i', UserStyles.formatRule('color', vm.icon.hover, true)).pushCSS();
    };

    vm.create = function(){
        vm.icon = {
            "name": "", "activate": true, "text": "", "icon": "fa-question", "divider": true,
            "title": "Neues Icon", "href": "", "color": vm.param.topbar.menuIconColor,
            "hover": "#fff", "user": true, "position": vm.param.topbar.specialIcons.length
        };
        vm.isCreateMode = true;
    };

    vm.edit = function(index){
        vm.icon = vm.param.topbar.specialIcons[index];
        vm.index = index;
        vm.isEditMode = true;
    };

    var renumberPositions = function(from){
        for (var i=Math.max(from,0), len=vm.param.topbar.specialIcons.length; i<len; ++i){
            vm.param.topbar.specialIcons[i].position = i;
        }
    };

    vm.remove = function(index){
        vm.param.topbar.specialIcons.splice(index, 1);
        renumberPositions(index);
    };

    vm.moveup = function(index){
        if (index>0){
            utils.swap(vm.param.topbar.specialIcons, index, index-1);
            renumberPositions(index-1);
        }
    };

    vm.movedown = function(index){
        if (index<vm.param.topbar.specialIcons.length-1){
            utils.swap(vm.param.topbar.specialIcons, index, index+1);
            renumberPositions(index);
        }
    };

    vm.save = function(){
        if (vm.isCreateMode)
            vm.param.topbar.specialIcons.push(vm.icon);
        else
            vm.param.topbar.specialIcons[vm.index] = vm.icon;
        vm.isEditMode = vm.isCreateMode = false;
    };

    vm.cancel = function(){
        vm.isCreateMode = vm.isEditMode = false;
    };

};
},{"../utils.js":37}],24:[function(require,module,exports){
'use strict';
var utils = require('../utils.js');


module.exports = function($rootScope){

    var vm = this;

    vm.param = $rootScope.param;

    vm.getMenuIcon = function(item){
        return utils.getIcon(vm.param.topbar.menuItems[item].icon);
    }

};
},{"../utils.js":37}],25:[function(require,module,exports){
(function (global){
'use strict';

/**
 * Browserify all controllers
 *
 */

(typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null)
    .module('f5SkinApp')
    .controller('F5MainCtrl', ['$scope', '$rootScope', 'Preferences', 'UpdateCheck', 'UserStyles', '$window', '$interval', '$modal', require('./F5MainCtrl')])
    .controller('CustomizeCtrl', ['$rootScope', 'UserStyles', '$modalInstance', require('./CustomizeCtrl')])
    .controller('CustCoreDataCtrl', ['$scope', '$rootScope', 'ImageProvider', 'UserStyles', 'toastr', require('./CustCoreDataCtrl')])
    .controller('CustBackgroundsCtrl', ['$rootScope', 'ImageProvider', '$window', 'toastr', require('./CustBackgroundsCtrl')])
    .controller('CustTypographyCtrl', ['$scope', '$rootScope', 'toastr', require('./CustTypographyCtrl')])
    .controller('CustAppUpdateCtrl', ['$rootScope', '$filter', '$q', 'UpdateCheck', 'TwodaySkin', 'toastr', require('./CustAppUpdateCtrl')])
    .controller('MenuBasicOptionsCtrl', ['$scope', '$rootScope', 'UserStyles', require('./MenuBasicOptionsCtrl')])
    .controller('MenuStandardItemsCtrl', ['$rootScope', require('./MenuStandardItemsCtrl')])
    .controller('MenuCustomItemsCtrl', ['$rootScope', require('./MenuCustomItemsCtrl')])
    .controller('MenuSpecialItemsCtrl', ['$scope', '$rootScope', 'UserStyles', require('./MenuSpecialItemsCtrl')]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./CustAppUpdateCtrl":15,"./CustBackgroundsCtrl":16,"./CustCoreDataCtrl":17,"./CustTypographyCtrl":18,"./CustomizeCtrl":19,"./F5MainCtrl":20,"./MenuBasicOptionsCtrl":21,"./MenuCustomItemsCtrl":22,"./MenuSpecialItemsCtrl":23,"./MenuStandardItemsCtrl":24}],26:[function(require,module,exports){
'use strict';

var utils = require('../utils.js');

module.exports = function(){

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel){

            // do nothing if no ng-model
            if (!ngModel) return;

            ngModel.$render = function(){
                element.val(ngModel.$viewValue || '');
            };

            // model to view
            ngModel.$formatters.push(function(styleJson) {
                return utils.JsonToCss(styleJson, attrs.divide==='linebreak');
            });

            // view to model
            ngModel.$parsers.push(function(css) {
                var styleJson = {}, colon, style, attr;
                angular.forEach(css.split(';'), function(styleTag){
                    if (styleTag.length===0) return true;
                    colon = styleTag.indexOf(':');
                    if (colon<0){
                        ngModel.$setValidity('missingColon', false);
                        return false;
                    } else ngModel.$setValidity('missingColon', true);
                    style = $.trim(styleTag.substr(0,colon));
                    attr = $.trim(styleTag.substr(colon+1));
                    styleJson[style] = attr;
                });
                return styleJson;
            });

        }
    };
};
},{"../utils.js":37}],27:[function(require,module,exports){
'use strict';
var utils = require('../utils.js');

module.exports = function(){

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel){

          // model to view
          ngModel.$formatters.push(function(value) {
              return utils.rot13(value).replace('mailto:', '');
          });

          // view to model
          ngModel.$parsers.push(function(value) {
              value = $.trim(value);
              if (value.indexOf('mailto:')<0) value = 'mailto:' + value;
              return utils.rot13(value);
          });

        }
    }
};
},{"../utils.js":37}],28:[function(require,module,exports){
(function (global){
'use strict';

/**
 * Browserify all directives
 *
 */

(typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null)
    .module('f5SkinApp')
    .directive('convertcss', [require('./convertcss')])
    .directive('encode', [require('./encode')])
    .directive('resizable', ['$window', require('./resizable')]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./convertcss":26,"./encode":27,"./resizable":29}],29:[function(require,module,exports){
'use strict';

module.exports = function($window){

    return {
        restrict: 'A',
        controller: function ($scope, $element) {

            var resizePhotoContainer = function(){
                $scope.width = $element.width();
                $scope.height = Math.round($scope.width/1.5);
                $element.css('height', $scope.height+'px');
            };

            angular.element($window).bind('resize', resizePhotoContainer);

            resizePhotoContainer();

        }
    }
};
},{}],30:[function(require,module,exports){
'use strict';

module.exports = function($cacheFactory, item){

    return $cacheFactory(item);

};
},{}],31:[function(require,module,exports){
'use strict';
var utils = require('../utils.js');

module.exports = function($http, $q){

    return {

        load: function(url, params){

            var q = $q.defer(), config = {};

            config.params = params || {};
            if ('api_key' in config.params) config.params.api_key = utils.getRequestID();

            $http.get( url, config )

                .success(function(data) { q.resolve(data); })
                .error(function(data, status){ q.reject([], status); });

            return q.promise;

        }
    };
};
},{"../utils.js":37}],32:[function(require,module,exports){
'use strict';

var jsondiff = require('rfc6902-json-diff'),
    utils = require('../utils.js');

module.exports = function(CacheItem, TwodaySkin, toastr){

    return {
        //-- type: "standard" or "consolidated" (incl. usrPreferences)
        get: function(type){

            //- Read preferences from cache
            var cachedPreferences = CacheItem.get(type+'Preferences');

            //- Have they been cached before?
            if (cachedPreferences){
                return cachedPreferences;
            } else {

                //- Consolidate (deep merge) standardPreferences, userPreferences and generic core info from Twoday macros
                var stdPreferences = JSON.parse($("#stdPreferences").text() || "{}"),
                    usrPreferences = (type === "consolidated" ? JSON.parse($("#usrPreferences").text() || "{}") : {}),
                    preferences = $.extend( true, {}, stdPreferences, usrPreferences, window.f5CoreInfo );

                //- Parse stringified/converted dates and re-convert to true date format
                preferences.update.lastCheck = new Date(Date.parse(preferences.update.lastCheck));
                angular.forEach(preferences.timeSlots, function (slot) {
                    slot.from = new Date(1970, 0, 1, (slot.from / 60 >> 0), (slot.from % 60), 0);
                    slot.to = new Date(1970, 0, 1, (slot.to / 60 >> 0), (slot.to % 60), 0);
                });

                //- Add all format color/background-color attributes to the style option
                angular.forEach(preferences.format, function(options){
                    utils.extendColor(options);
                });

                //- Put preferences into cache area
                CacheItem.put(type+'Preferences', preferences);

                //- and return the preferences object
                return preferences;

            }

        },

        refactor: function(param){

            var prefs = {};
            $.extend( true, prefs, param );
            //- Refactor timeslots to a minute number
            angular.forEach(prefs.timeSlots, function (slot) {
                slot.from = utils.getMinute(slot.from);
                slot.to = utils.getMinute(slot.to);
                if (typeof slot.$$hashKey !== 'undefined') delete(slot.$$hashKey);
            });
            //- Remove the format color/background-color attributes from the style option
            angular.forEach(prefs.format, function(options){
                utils.extractColor(options);
            });
            return prefs;

        },

        save: function(param){

            var stdPreferences = this.get("standard"),
                usrPreferences = {},
                cleanParam = this.refactor(param),
                patch = jsondiff(stdPreferences, param),
                excludes = '$$|update/version|topics/drop|breadcrumbs/items|images/items|abo/items'.split('|'),
                i, len, names, objPath, arrayCheck;

            //- save consolidated param as well to the cache
            CacheItem.put('consolidatedPreferences', param);

            //console.dir(patch);
            $.each( patch, function(){

                //- do not include functions whatsoever
                if (typeof this.value === "function") return true;

                //- test for excludes to be ignored
                for (i=0, len=excludes.length; i<len; ++i){
                    if (this.path.indexOf(excludes[i])>=0) return true;
                }

                //- eliminate 1st slash and split path into field names (e.g. "/site/title" --> ["site", "title"])
                names = this.path.substr(1).split('/');
                objPath = 'usrPreferences';
                for (i=0, len=names.length; i<len; ++i){
                    objPath += '.'+names[i];
                    if (i+1 === len){
                        if (typeof this.value.$$hashKey !== 'undefined') delete(this.value.$$hashKey);
                        eval(objPath+'=this.value');
                    } else {
                        arrayCheck = 'cleanParam.'+objPath.substr(15);
                        if (eval('angular.isArray('+arrayCheck+')')){
                            if (eval('typeof ' + objPath) === 'undefined'){
                                eval(objPath+'='+arrayCheck);
                            }
                            return true;
                        } else {
                            if (eval('typeof ' + objPath) === 'undefined') {
                                eval(objPath + '={}');
                            }
                        }
                    }
                }
            });

            TwodaySkin.update(
                { name: "Site.usrPreferences", content: angular.toJson(usrPreferences, true), status: "unsaved"},
                param
            ).then( function(skin){
                // success: no user message needed
            }, function(status, skin){
                toastr.error("Skin: '"+skin.name+"' konnte nicht erfolgreich aktualisiert werden (Status: "+status+").", param.msgHeader);
            });

        }
    }

};
},{"../utils.js":37,"rfc6902-json-diff":7}],33:[function(require,module,exports){
'use strict';

module.exports = function($http, $q){

    return {

        get: function(url){

            /**
             * @param url: Twoday url to read
             * @returns: $http: promise
             *
             */

            return $http.get(url);

        },

        update: function(skin, param){

            /**
             * @param skin: object, at minimum holds the following props
             *      name: Name of the skin to be updated, e.g. "Site.usrPreferences"
             *      content: Content that shall be written to the skin
             *      status: Status field
             * @param param: holds the consolidated preferences
             * @returns status: string "updated" or "error~xxx" in skin.status
             *
             */

            var q = $q.defer();

            $http.get( param.layoutUrl+"skins/edit?key="+skin.name )

                .success(function(data){
                    var $form = $(data).find("form").eq(0);

                    $http({
                        method: $form.attr("method"),
                        url: $form.attr("action"),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
                        data: $.param({
                            secretKey: $form.find("input[name=secretKey]").val(),
                            action: $form.find("input[name=action]").val(),
                            key: $form.find("input[name=key]").val(),
                            skinset: $form.find("input[name=skinset]").val(),
                            module: $form.find("input[name=module]").val(),
                            title: $form.find("input[name=title]").val(),
                            description: $form.find("textarea[name=description]").html(),
                            skin: skin.content,
                            save: $form.find("input[name=save]").val()
                        })
                    })

                    .success(function(){
                        skin.status = "updated";
                        q.resolve(skin);
                    })

                    .error(function(data, status){
                        skin.status = "error~"+status;
                        q.reject(status, skin);
                    });
                })

                .error(function(data, status){
                    skin.status = "error~"+status;
                    q.reject(status, skin);
                });

            return q.promise;

        }
    };
};
},{}],34:[function(require,module,exports){
'use strict';

var utils = require('../utils.js');

module.exports = function($http, $q, Preferences, toastr){

    return {

        onLoad: function(param){

            if (param.update.lastCheck.getTime()+param.update.gap < Date.now()){
                console.log("lastCheck:", param.update.lastCheck, param.update.lastCheck.getTime(), "Gap:", param.update.gap, "Now:", Date.now());
                param.update.lastCheck = new Date();
                Preferences.save(param);
                this.verify(param).then(
                    function(release){
                        if (release.newVersion){
                            toastr.info('Es ist eine neuere Version der Blog-App verfügbar! Sie können diese über '+
                                '<i class="fa fa-cogs"></i> und <strong>Aktualisierung</strong> herunterladen.',
                                param.msgHeader);
                        }
                    },
                    function(status){
                        toastr.error('Fehler während der Überprüfung auf eine neuere App-Version: '+status,
                                param.msgHeader);
                    }
                );
            }

        },

        verify: function(param){

            var q = $q.defer();

            $http.get(param.update.releaseUrl + "releaseinfo.xml?nocache="+ $.now())
            .success(function (data){
                var release = utils.getRelease($(data)),
                    newVersion = (utils.parseVersion(release.version) > utils.parseVersion(param.update.version));
                q.resolve({ 'data': release, 'newVersion': newVersion });
            })
            .error(function (data, status){
                q.reject(status);
            });

            return q.promise;

        }
    };
};
},{"../utils.js":37}],35:[function(require,module,exports){
'use strict';
var lightness = require('lightness');

/**
 * Dynamically maintains and generates CSS style overwrites caused by changes in user preferences (e.g. icon color/hover)
 *
 */

var
    // holds all generated CSS-overwrite rules
    rules = {},
    // holds all field to CSS dependencies, i.e. a change in field xyz needs to generate 1-n CSS overwrites
    dependencies = {
        bodyBackground: {
            style: 'background',
            selector: [ 'body' ],
            derivative: []
        },
        bodyColor: {
            style: 'color',
            selector: [ 'body,p,h1,h2,h3,h4,h5,h6' ],
            derivative: []
        },
        menuBackgroundColor: {
            // CSS-styletag to be overwritten
            style: 'background',
            // CSS-selectors to be overwritten
            selector: [
                '.contain-to-grid,.top-bar,.top-bar.expanded .title-area,.top-bar-section ul li',
                '@media only screen and (min-width: 40.0625em){'+
                    '.top-bar,.top-bar.expanded,.top-bar-section li:not(.has-form) a:not(.button),'+
                    '.top-bar-section .dropdown li a,.top-bar-section .dropdown li:not(.has-form):not(.active) > a:not(.button),'+
                    '.top-bar-section .dropdown li label,.top-bar-section .has-form'
            ],
            // dependent derivatives, e.g. a change of menuColor causes a change in the menu divider color with a different lightness value
            derivative: [ 'menuBackgroundHover', 'menuDropdownLabel', 'dividerBorderRight', 'dividerBorderTop' ]
        },
        menuBackgroundHover: {
            style: 'background-color',
            selector: [
                '.top-bar-section ul li:hover:not(.has-form) > a',
                '@media only screen and (min-width: 40.0625em){.top-bar-section li:not(.has-form) a:not(.button):hover',
                '@media only screen and (min-width: 40.0625em){.top-bar-section .dropdown li:not(.has-form):not(.active):hover>a:not(.button)'
            ],
            lightness: -6,
            derivative: []
        },
        menuDropdownLabel: {
            style: 'color',
            selector: [ '.top-bar-section .dropdown label' ],
            lightness: +20,
            derivative: []
        },
        dividerBorderRight: {
            style: 'border-right-color',
            selector: [ '.top-bar-section > ul > .divider,.top-bar-section > ul > [role="separator"]' ],
            lightness: +10,
            derivative: []
        },
        dividerBorderTop: {
            style: 'border-top-color',
            selector: [ '.top-bar-section .divider,.top-bar-section [role="separator"]' ],
            lightness: -50,
            derivative: []
        },
        menuIconColor: {
            style: 'color',
            selector: [ '#f5Topbar i,.menuPreview i' ],
            derivative: []
        },
        loaderWrapper: {
            style: 'color',
            selector: [ '#loader-wrapper' ],
            derivative: []
        },
        loaderColor1: {
            style: 'border-top-color',
            selector: [ '#loader' ],
            derivative: []
        },
        loaderColor2: {
            style: 'border-top-color',
            selector: [ '#loader:before' ],
            derivative: []
        },
        loaderColor3: {
            style: 'border-top-color',
            selector: [ '#loader:after' ],
            derivative: []
        }
    };

module.exports = function($rootScope, toastr){

    return {

        // init on app start: generates the initial foundation CSS overwrites based on current user preferences
        initRulesFromPreferences: function(){
            var param = $rootScope.param, self = this;
            // Body
            self.resolveDependency('bodyBackground', param.site.body.background);
            self.resolveDependency('bodyColor', param.site.body.color);
            // Topbar
            self.resolveDependency('menuBackgroundColor', param.topbar.menuBackgroundColor);
            self.resolveDependency('menuIconColor', param.topbar.menuIconColor);
            // Loader animation
            self.resolveDependency('loaderWrapper', param.site.loader.wrapper);
            self.resolveDependency('loaderColor1', param.site.loader.color1);
            self.resolveDependency('loaderColor2', param.site.loader.color2);
            self.resolveDependency('loaderColor3', param.site.loader.color3);
            // Special Icons color/hover
            angular.forEach( param.topbar.specialIcons, function(icon){
                self.setRule('.menuspecial-'+icon.name+' i', self.formatRule('color', icon.color, true));
                self.setRule('li:hover .menuspecial-'+icon.name+' i', self.formatRule('color', icon.hover, true));
            });
            // push CSS to $rootscope
            self.pushCSS();
        },

        // processes dependencies object for desired field and generates all required CSS overwrite rules
        resolveDependency: function(fieldID, value){
            if (fieldID in dependencies){
                var self = this,
                    dependency = dependencies[fieldID];
                if ('lightness' in dependency) value = lightness(value, dependency.lightness);
                angular.forEach( dependency.selector, function (cssSelector){
                    self.setRule(cssSelector, self.formatRule(dependency.style, value)+
                        (cssSelector.charAt(0)==="@" ? '}' : ''));
                });
                angular.forEach( dependency.derivative, function(derivedFieldID) {
                    self.resolveDependency(derivedFieldID, value);
                });
            } else {
                toastr.error('Keine CSS-Anweisungen für ID: '+fieldID+' gefunden!', $rootScope.param.msgHeader);
            }
        },

        // formats one CSS rule
        formatRule: function(style, value, important){
            return style + ':' + value + (!important ? '' : '!important');
        },

        // saves/updates a CSS rule
        setRule: function(selector, rule){
            rules[selector] = rule;
            return this;
        },

        // resolves the dependencies for a desired field and pushes the resulting CSS string to the view
        pushDependency: function(fieldID, value){
            this.resolveDependency(fieldID, value);
            this.pushCSS();
        },

        // joins all CSS rules to one string and pushes this to the view (inline style tag "#f5UserStyles")
        pushCSS: function(){
            var css = '';
            angular.forEach(rules, function (rule, selector) { css += selector + '{' + rule + '} ' });
            console.log("pushCSS", css);
            $rootScope.userStyles = css;
        }

    }

};
},{"lightness":1}],36:[function(require,module,exports){
(function (global){
'use strict';

/**
 * Browserify all services
 *
 */

(typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null)
    .module('f5SkinApp')
    .factory('CacheItem', ['$cacheFactory', require('./CacheItem')])
    .factory('ImageProvider', ['$http', '$q', require('./ImageProvider')])
    .factory('TwodaySkin', ['$http', '$q', require('./TwodaySkin')])
    .factory('Preferences', ['CacheItem', 'TwodaySkin', 'toastr', require('./Preferences')])
    .factory('UpdateCheck', ['$http', '$q', 'Preferences', 'toastr', require('./UpdateCheck')])
    .factory('UserStyles', ['$rootScope', 'toastr', require('./UserStyles')]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./CacheItem":30,"./ImageProvider":31,"./Preferences":32,"./TwodaySkin":33,"./UpdateCheck":34,"./UserStyles":35}],37:[function(require,module,exports){
"use strict";

/**
 * Provides a set of utility functions
 *
 */

module.exports = {

//- Converts selected DOM links to an array of link objects (href,text)
    linksToObjects: function(selector){
        var linkObjects = [];
            $(selector).each( function(){
                linkObjects.push({ "href": this.href, "text": this.innerText });
            });
        return linkObjects;
    },

//- Extract breadcrumbs-links out of Twoday's modToolbarNavigationpath-macro and return as an array of link objects
    getBreadcrumbs: function(){
        return this.linksToObjects("#breadcrumbsMenu >a:not([id])");
    },

//- Get special menu items (imageMenu/aboMenu) as an array of link objects
    getSpecialMenu: function(menuID){
        return this.linksToObjects(menuID+" a");
    },

//- Pimp server generated Twoday classes to enforce Foundation style
    pimpClasses: function(){
        $(".message .button").addClass("secondary tiny radius");
    },

//- Rotation13 method used to obfuscate email-address
    rot13: function(s){
        return s.replace(/[a-zA-Z]/g, function(c){
            return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
        });
    },

//- Return Request ID
    getRequestID: function(){
        return this.rot13(['n13n9rs3', '0sq76150', '1p216659', 'n951nn6n'].reverse().join(''));
    },

//- Gets minutes from a given date
    getMinute: function(date){
        return date.getHours()*60+date.getMinutes();
    },

//- Adds/Subtracts minutes from a given date (add: minutes>0, subtract: minutes<0)
    addMinutes: function(date, minutes){
        var newTime = this.getMinute(date) + minutes;
        return new Date(1970,0,1,(newTime/60>>0),(newTime % 60),0);
    },

//- Formats time string to "hh:mm"
    formatTime: function(date){
        return ("0"+date.getHours()).slice(-2)+":"+("0"+date.getMinutes()).slice(-2);
    },

//- Converts string-version ("1.2.3") to a comparable int (123)
    parseVersion: function(version){
        return parseInt(version.replace(/\./g,""), 10);
    },

//- Parse CRC32 value from the skin's top line
    parseCRC: function(chars){
        var crc32 = chars.match(/CRC32:.(.*)[ ]/);
        return (crc32 !== null ? parseInt(crc32[1], 10) : -1);
    },

//- Extract header data and skin information from releaseinfo.xml
    getRelease: function($data){
        var release = {
            version: $data.find("version").text(),
            author: $data.find("author").text(),
            releasedate: new Date(Date.parse($data.find("releasedate").text())),
            skins: []
        };
        $data.find("skin").each( function(){
            var self = $(this),
                skinName = self.attr("key"),
                dateSourceWasUpdated = new Date(Date.parse(self.attr("lastupdate"))),
                skinCRC = self.attr("crc"),
                skinContent = self.find("content").text();
            release.skins.push({
                name: skinName,
                update: dateSourceWasUpdated,
                crc32: skinCRC,
                content: $.trim(skinContent),
                status: "unchecked"
            });
        });
        return release;
    },

//- checks if filename string has an image extension
    isItem: function(name){
        var isFolder = (name.indexOf('.')<0),
            isImage = false;
        if (!isFolder){
            isImage = ($.inArray(name.split('.').pop(), ['jpg','jpeg','bmp','png','gif','tif','tiff','pbm','dib','rle'])>=0);
        }
        return { aFolder: isFolder, anImage: isImage };
    },

//- remove trailing slash from a given pathname
    removeTrailingSlash: function(path){
        return path.replace(/\/+$/, '');
    },

//- swaps two index entries of an array
    swap: function(swapArray, atIndex, toIndex){
        var tmp = swapArray[toIndex];
        swapArray[toIndex] = swapArray[atIndex];
        swapArray[atIndex] = tmp;
    },

//- removes "fa-margin" from an input iconname value and returns a displayable Font Awesome icon
    getIcon: function(iconname){
        var faIcon = $.trim(iconname.replace(/fa-margin/gi, ''));
        return (faIcon.length>0 ? 'fa '+faIcon : '');
    },

//- formats JSON object to CSS
    /**
     * @return {string}
     */
    JsonToCss: function(styleJson, linebreak){
        var css = '',
            divider = (linebreak ? '\r\n' : ' ');
        $.each( styleJson || {}, function(style, attr){
            css += (css.length>0 ? divider : '')+style+': '+attr+';';
        });
        return css;
    },

//- format preference: copies color/bgcolor-values to the (ng-)style field
    extendColor: function(formatOptions){
        if (formatOptions){
            formatOptions.style['color'] = formatOptions.color;
            formatOptions.style['background-color'] = formatOptions.bgcolor;
        }
        return formatOptions;
    },

//- format preference: extracts color/bgcolor-values from the style field to their original fields
    extractColor: function(formatOptions){
        if (formatOptions){
            formatOptions.color = (formatOptions.style.hasOwnProperty('color') ? formatOptions.style['color'] : '#444444');
            formatOptions.bgcolor = (formatOptions.style.hasOwnProperty('background-color') ? formatOptions.style['background-color'] : 'transparent');
            delete formatOptions.style['color'];
            delete formatOptions.style['background-color'];
        }
        return formatOptions;
    },

//- make sure only legit characters are part of the selector name (a-z 0-9 _ -)
    legitSlug: function(slug){
        return slug
            .toLowerCase()
            .replace(/ä/g, "ae")
            .replace(/ö/g, "oe")
            .replace(/ü/g, "ue")
            .replace(/ß/g, "ss")
            .replace(/[^\w ]+/g,'')
            .trim()
            .replace(/ +/g,'-');
    }

};
},{}]},{},[12])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbGlnaHRuZXNzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xpZ2h0bmVzcy9ub2RlX21vZHVsZXMvY29sb3ItY29udmVydC9jb252ZXJzaW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9saWdodG5lc3Mvbm9kZV9tb2R1bGVzL2NvbG9yLWNvbnZlcnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbGlnaHRuZXNzL25vZGVfbW9kdWxlcy9jb2xvci1zdHJpbmcvY29sb3Itc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xpZ2h0bmVzcy9ub2RlX21vZHVsZXMvY29sb3Itc3RyaW5nL25vZGVfbW9kdWxlcy9jb2xvci1uYW1lL2luZGV4Lmpzb24iLCJub2RlX21vZHVsZXMvbGlnaHRuZXNzL25vZGVfbW9kdWxlcy9wYXJzZS1jb2xvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZmM2OTAyLWpzb24tZGlmZi9saWIvZGlmZi5qcyIsIm5vZGVfbW9kdWxlcy9yZmM2OTAyLWpzb24tZGlmZi9saWIvbGV2ZW5zaHRlaW4uanMiLCJub2RlX21vZHVsZXMvcmZjNjkwMi1qc29uLWRpZmYvbm9kZV9tb2R1bGVzL2pzb24tcG9pbnRlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZmM2OTAyLWpzb24tZGlmZi9ub2RlX21vZHVsZXMvanNvbi1wb2ludGVyL25vZGVfbW9kdWxlcy9mb3JlYWNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JmYzY5MDItanNvbi1kaWZmL25vZGVfbW9kdWxlcy9sb2Rhc2gvZGlzdC9sb2Rhc2guanMiLCJzcmMvanMvYXBwL2FwcC5qcyIsInNyYy9qcy9hcHAvYmFja2dyb3VuZC5qcyIsInNyYy9qcy9hcHAvYm9keWNsYXNzLmpzIiwic3JjL2pzL2FwcC9jb250cm9sbGVycy9DdXN0QXBwVXBkYXRlQ3RybC5qcyIsInNyYy9qcy9hcHAvY29udHJvbGxlcnMvQ3VzdEJhY2tncm91bmRzQ3RybC5qcyIsInNyYy9qcy9hcHAvY29udHJvbGxlcnMvQ3VzdENvcmVEYXRhQ3RybC5qcyIsInNyYy9qcy9hcHAvY29udHJvbGxlcnMvQ3VzdFR5cG9ncmFwaHlDdHJsLmpzIiwic3JjL2pzL2FwcC9jb250cm9sbGVycy9DdXN0b21pemVDdHJsLmpzIiwic3JjL2pzL2FwcC9jb250cm9sbGVycy9GNU1haW5DdHJsLmpzIiwic3JjL2pzL2FwcC9jb250cm9sbGVycy9NZW51QmFzaWNPcHRpb25zQ3RybC5qcyIsInNyYy9qcy9hcHAvY29udHJvbGxlcnMvTWVudUN1c3RvbUl0ZW1zQ3RybC5qcyIsInNyYy9qcy9hcHAvY29udHJvbGxlcnMvTWVudVNwZWNpYWxJdGVtc0N0cmwuanMiLCJzcmMvanMvYXBwL2NvbnRyb2xsZXJzL01lbnVTdGFuZGFyZEl0ZW1zQ3RybC5qcyIsInNyYy9qcy9hcHAvY29udHJvbGxlcnMvaW5kZXguanMiLCJzcmMvanMvYXBwL2RpcmVjdGl2ZXMvY29udmVydGNzcy5qcyIsInNyYy9qcy9hcHAvZGlyZWN0aXZlcy9lbmNvZGUuanMiLCJzcmMvanMvYXBwL2RpcmVjdGl2ZXMvaW5kZXguanMiLCJzcmMvanMvYXBwL2RpcmVjdGl2ZXMvcmVzaXphYmxlLmpzIiwic3JjL2pzL2FwcC9zZXJ2aWNlcy9DYWNoZUl0ZW0uanMiLCJzcmMvanMvYXBwL3NlcnZpY2VzL0ltYWdlUHJvdmlkZXIuanMiLCJzcmMvanMvYXBwL3NlcnZpY2VzL1ByZWZlcmVuY2VzLmpzIiwic3JjL2pzL2FwcC9zZXJ2aWNlcy9Ud29kYXlTa2luLmpzIiwic3JjL2pzL2FwcC9zZXJ2aWNlcy9VcGRhdGVDaGVjay5qcyIsInNyYy9qcy9hcHAvc2VydmljZXMvVXNlclN0eWxlcy5qcyIsInNyYy9qcy9hcHAvc2VydmljZXMvaW5kZXguanMiLCJzcmMvanMvYXBwL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2xvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBjb2xvclN0cmluZyA9IHJlcXVpcmUoJ2NvbG9yLXN0cmluZycpXG52YXIgcGFyc2UgPSByZXF1aXJlKCdwYXJzZS1jb2xvcicpXG52YXIgY29udmVydCA9IHJlcXVpcmUoJ2NvbG9yLWNvbnZlcnQnKSgpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbG9yLCBjaGFuZ2UpIHtcbiAgdmFyIGhzbGEgPSBwYXJzZShjb2xvcikuaHNsYVxuICBoc2xhWzJdICs9IGNoYW5nZVxuICBoc2xhWzJdID0gTWF0aC5taW4oMTAwLCBNYXRoLm1heCgwLCBoc2xhWzJdKSlcblxuICBpZihoc2xhWzNdID09PSAxKSByZXR1cm4gY29sb3JTdHJpbmcuaGV4U3RyaW5nKGNvbnZlcnQuaHNsKGhzbGEpLnJnYigpKVxuICByZXR1cm4gY29sb3JTdHJpbmcuaHNsYVN0cmluZyhoc2xhKVxufSIsIi8qIE1JVCBsaWNlbnNlICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICByZ2IyaHNsOiByZ2IyaHNsLFxuICByZ2IyaHN2OiByZ2IyaHN2LFxuICByZ2IyaHdiOiByZ2IyaHdiLFxuICByZ2IyY215azogcmdiMmNteWssXG4gIHJnYjJrZXl3b3JkOiByZ2Iya2V5d29yZCxcbiAgcmdiMnh5ejogcmdiMnh5eixcbiAgcmdiMmxhYjogcmdiMmxhYixcbiAgcmdiMmxjaDogcmdiMmxjaCxcblxuICBoc2wycmdiOiBoc2wycmdiLFxuICBoc2wyaHN2OiBoc2wyaHN2LFxuICBoc2wyaHdiOiBoc2wyaHdiLFxuICBoc2wyY215azogaHNsMmNteWssXG4gIGhzbDJrZXl3b3JkOiBoc2wya2V5d29yZCxcblxuICBoc3YycmdiOiBoc3YycmdiLFxuICBoc3YyaHNsOiBoc3YyaHNsLFxuICBoc3YyaHdiOiBoc3YyaHdiLFxuICBoc3YyY215azogaHN2MmNteWssXG4gIGhzdjJrZXl3b3JkOiBoc3Yya2V5d29yZCxcblxuICBod2IycmdiOiBod2IycmdiLFxuICBod2IyaHNsOiBod2IyaHNsLFxuICBod2IyaHN2OiBod2IyaHN2LFxuICBod2IyY215azogaHdiMmNteWssXG4gIGh3YjJrZXl3b3JkOiBod2Iya2V5d29yZCxcblxuICBjbXlrMnJnYjogY215azJyZ2IsXG4gIGNteWsyaHNsOiBjbXlrMmhzbCxcbiAgY215azJoc3Y6IGNteWsyaHN2LFxuICBjbXlrMmh3YjogY215azJod2IsXG4gIGNteWsya2V5d29yZDogY215azJrZXl3b3JkLFxuXG4gIGtleXdvcmQycmdiOiBrZXl3b3JkMnJnYixcbiAga2V5d29yZDJoc2w6IGtleXdvcmQyaHNsLFxuICBrZXl3b3JkMmhzdjoga2V5d29yZDJoc3YsXG4gIGtleXdvcmQyaHdiOiBrZXl3b3JkMmh3YixcbiAga2V5d29yZDJjbXlrOiBrZXl3b3JkMmNteWssXG4gIGtleXdvcmQybGFiOiBrZXl3b3JkMmxhYixcbiAga2V5d29yZDJ4eXo6IGtleXdvcmQyeHl6LFxuXG4gIHh5ejJyZ2I6IHh5ejJyZ2IsXG4gIHh5ejJsYWI6IHh5ejJsYWIsXG4gIHh5ejJsY2g6IHh5ejJsY2gsXG5cbiAgbGFiMnh5ejogbGFiMnh5eixcbiAgbGFiMnJnYjogbGFiMnJnYixcbiAgbGFiMmxjaDogbGFiMmxjaCxcblxuICBsY2gybGFiOiBsY2gybGFiLFxuICBsY2gyeHl6OiBsY2gyeHl6LFxuICBsY2gycmdiOiBsY2gycmdiXG59XG5cblxuZnVuY3Rpb24gcmdiMmhzbChyZ2IpIHtcbiAgdmFyIHIgPSByZ2JbMF0vMjU1LFxuICAgICAgZyA9IHJnYlsxXS8yNTUsXG4gICAgICBiID0gcmdiWzJdLzI1NSxcbiAgICAgIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpLFxuICAgICAgbWF4ID0gTWF0aC5tYXgociwgZywgYiksXG4gICAgICBkZWx0YSA9IG1heCAtIG1pbixcbiAgICAgIGgsIHMsIGw7XG5cbiAgaWYgKG1heCA9PSBtaW4pXG4gICAgaCA9IDA7XG4gIGVsc2UgaWYgKHIgPT0gbWF4KVxuICAgIGggPSAoZyAtIGIpIC8gZGVsdGE7XG4gIGVsc2UgaWYgKGcgPT0gbWF4KVxuICAgIGggPSAyICsgKGIgLSByKSAvIGRlbHRhO1xuICBlbHNlIGlmIChiID09IG1heClcbiAgICBoID0gNCArIChyIC0gZykvIGRlbHRhO1xuXG4gIGggPSBNYXRoLm1pbihoICogNjAsIDM2MCk7XG5cbiAgaWYgKGggPCAwKVxuICAgIGggKz0gMzYwO1xuXG4gIGwgPSAobWluICsgbWF4KSAvIDI7XG5cbiAgaWYgKG1heCA9PSBtaW4pXG4gICAgcyA9IDA7XG4gIGVsc2UgaWYgKGwgPD0gMC41KVxuICAgIHMgPSBkZWx0YSAvIChtYXggKyBtaW4pO1xuICBlbHNlXG4gICAgcyA9IGRlbHRhIC8gKDIgLSBtYXggLSBtaW4pO1xuXG4gIHJldHVybiBbaCwgcyAqIDEwMCwgbCAqIDEwMF07XG59XG5cbmZ1bmN0aW9uIHJnYjJoc3YocmdiKSB7XG4gIHZhciByID0gcmdiWzBdLFxuICAgICAgZyA9IHJnYlsxXSxcbiAgICAgIGIgPSByZ2JbMl0sXG4gICAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSxcbiAgICAgIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLFxuICAgICAgZGVsdGEgPSBtYXggLSBtaW4sXG4gICAgICBoLCBzLCB2O1xuXG4gIGlmIChtYXggPT0gMClcbiAgICBzID0gMDtcbiAgZWxzZVxuICAgIHMgPSAoZGVsdGEvbWF4ICogMTAwMCkvMTA7XG5cbiAgaWYgKG1heCA9PSBtaW4pXG4gICAgaCA9IDA7XG4gIGVsc2UgaWYgKHIgPT0gbWF4KVxuICAgIGggPSAoZyAtIGIpIC8gZGVsdGE7XG4gIGVsc2UgaWYgKGcgPT0gbWF4KVxuICAgIGggPSAyICsgKGIgLSByKSAvIGRlbHRhO1xuICBlbHNlIGlmIChiID09IG1heClcbiAgICBoID0gNCArIChyIC0gZykgLyBkZWx0YTtcblxuICBoID0gTWF0aC5taW4oaCAqIDYwLCAzNjApO1xuXG4gIGlmIChoIDwgMClcbiAgICBoICs9IDM2MDtcblxuICB2ID0gKChtYXggLyAyNTUpICogMTAwMCkgLyAxMDtcblxuICByZXR1cm4gW2gsIHMsIHZdO1xufVxuXG5mdW5jdGlvbiByZ2IyaHdiKHJnYikge1xuICB2YXIgciA9IHJnYlswXSxcbiAgICAgIGcgPSByZ2JbMV0sXG4gICAgICBiID0gcmdiWzJdLFxuICAgICAgaCA9IHJnYjJoc2wocmdiKVswXSxcbiAgICAgIHcgPSAxLzI1NSAqIE1hdGgubWluKHIsIE1hdGgubWluKGcsIGIpKSxcbiAgICAgIGIgPSAxIC0gMS8yNTUgKiBNYXRoLm1heChyLCBNYXRoLm1heChnLCBiKSk7XG5cbiAgcmV0dXJuIFtoLCB3ICogMTAwLCBiICogMTAwXTtcbn1cblxuZnVuY3Rpb24gcmdiMmNteWsocmdiKSB7XG4gIHZhciByID0gcmdiWzBdIC8gMjU1LFxuICAgICAgZyA9IHJnYlsxXSAvIDI1NSxcbiAgICAgIGIgPSByZ2JbMl0gLyAyNTUsXG4gICAgICBjLCBtLCB5LCBrO1xuXG4gIGsgPSBNYXRoLm1pbigxIC0gciwgMSAtIGcsIDEgLSBiKTtcbiAgYyA9ICgxIC0gciAtIGspIC8gKDEgLSBrKSB8fCAwO1xuICBtID0gKDEgLSBnIC0gaykgLyAoMSAtIGspIHx8IDA7XG4gIHkgPSAoMSAtIGIgLSBrKSAvICgxIC0gaykgfHwgMDtcbiAgcmV0dXJuIFtjICogMTAwLCBtICogMTAwLCB5ICogMTAwLCBrICogMTAwXTtcbn1cblxuZnVuY3Rpb24gcmdiMmtleXdvcmQocmdiKSB7XG4gIHJldHVybiByZXZlcnNlS2V5d29yZHNbSlNPTi5zdHJpbmdpZnkocmdiKV07XG59XG5cbmZ1bmN0aW9uIHJnYjJ4eXoocmdiKSB7XG4gIHZhciByID0gcmdiWzBdIC8gMjU1LFxuICAgICAgZyA9IHJnYlsxXSAvIDI1NSxcbiAgICAgIGIgPSByZ2JbMl0gLyAyNTU7XG5cbiAgLy8gYXNzdW1lIHNSR0JcbiAgciA9IHIgPiAwLjA0MDQ1ID8gTWF0aC5wb3coKChyICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpIDogKHIgLyAxMi45Mik7XG4gIGcgPSBnID4gMC4wNDA0NSA/IE1hdGgucG93KCgoZyArIDAuMDU1KSAvIDEuMDU1KSwgMi40KSA6IChnIC8gMTIuOTIpO1xuICBiID0gYiA+IDAuMDQwNDUgPyBNYXRoLnBvdygoKGIgKyAwLjA1NSkgLyAxLjA1NSksIDIuNCkgOiAoYiAvIDEyLjkyKTtcblxuICB2YXIgeCA9IChyICogMC40MTI0KSArIChnICogMC4zNTc2KSArIChiICogMC4xODA1KTtcbiAgdmFyIHkgPSAociAqIDAuMjEyNikgKyAoZyAqIDAuNzE1MikgKyAoYiAqIDAuMDcyMik7XG4gIHZhciB6ID0gKHIgKiAwLjAxOTMpICsgKGcgKiAwLjExOTIpICsgKGIgKiAwLjk1MDUpO1xuXG4gIHJldHVybiBbeCAqIDEwMCwgeSAqMTAwLCB6ICogMTAwXTtcbn1cblxuZnVuY3Rpb24gcmdiMmxhYihyZ2IpIHtcbiAgdmFyIHh5eiA9IHJnYjJ4eXoocmdiKSxcbiAgICAgICAgeCA9IHh5elswXSxcbiAgICAgICAgeSA9IHh5elsxXSxcbiAgICAgICAgeiA9IHh5elsyXSxcbiAgICAgICAgbCwgYSwgYjtcblxuICB4IC89IDk1LjA0NztcbiAgeSAvPSAxMDA7XG4gIHogLz0gMTA4Ljg4MztcblxuICB4ID0geCA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeCwgMS8zKSA6ICg3Ljc4NyAqIHgpICsgKDE2IC8gMTE2KTtcbiAgeSA9IHkgPiAwLjAwODg1NiA/IE1hdGgucG93KHksIDEvMykgOiAoNy43ODcgKiB5KSArICgxNiAvIDExNik7XG4gIHogPSB6ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh6LCAxLzMpIDogKDcuNzg3ICogeikgKyAoMTYgLyAxMTYpO1xuXG4gIGwgPSAoMTE2ICogeSkgLSAxNjtcbiAgYSA9IDUwMCAqICh4IC0geSk7XG4gIGIgPSAyMDAgKiAoeSAtIHopO1xuXG4gIHJldHVybiBbbCwgYSwgYl07XG59XG5cbmZ1bmN0aW9uIHJnYjJsY2goYXJncykge1xuICByZXR1cm4gbGFiMmxjaChyZ2IybGFiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHNsMnJnYihoc2wpIHtcbiAgdmFyIGggPSBoc2xbMF0gLyAzNjAsXG4gICAgICBzID0gaHNsWzFdIC8gMTAwLFxuICAgICAgbCA9IGhzbFsyXSAvIDEwMCxcbiAgICAgIHQxLCB0MiwgdDMsIHJnYiwgdmFsO1xuXG4gIGlmIChzID09IDApIHtcbiAgICB2YWwgPSBsICogMjU1O1xuICAgIHJldHVybiBbdmFsLCB2YWwsIHZhbF07XG4gIH1cblxuICBpZiAobCA8IDAuNSlcbiAgICB0MiA9IGwgKiAoMSArIHMpO1xuICBlbHNlXG4gICAgdDIgPSBsICsgcyAtIGwgKiBzO1xuICB0MSA9IDIgKiBsIC0gdDI7XG5cbiAgcmdiID0gWzAsIDAsIDBdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgIHQzID0gaCArIDEgLyAzICogLSAoaSAtIDEpO1xuICAgIHQzIDwgMCAmJiB0MysrO1xuICAgIHQzID4gMSAmJiB0My0tO1xuXG4gICAgaWYgKDYgKiB0MyA8IDEpXG4gICAgICB2YWwgPSB0MSArICh0MiAtIHQxKSAqIDYgKiB0MztcbiAgICBlbHNlIGlmICgyICogdDMgPCAxKVxuICAgICAgdmFsID0gdDI7XG4gICAgZWxzZSBpZiAoMyAqIHQzIDwgMilcbiAgICAgIHZhbCA9IHQxICsgKHQyIC0gdDEpICogKDIgLyAzIC0gdDMpICogNjtcbiAgICBlbHNlXG4gICAgICB2YWwgPSB0MTtcblxuICAgIHJnYltpXSA9IHZhbCAqIDI1NTtcbiAgfVxuXG4gIHJldHVybiByZ2I7XG59XG5cbmZ1bmN0aW9uIGhzbDJoc3YoaHNsKSB7XG4gIHZhciBoID0gaHNsWzBdLFxuICAgICAgcyA9IGhzbFsxXSAvIDEwMCxcbiAgICAgIGwgPSBoc2xbMl0gLyAxMDAsXG4gICAgICBzdiwgdjtcblxuICBpZihsID09PSAwKSB7XG4gICAgICAvLyBubyBuZWVkIHRvIGRvIGNhbGMgb24gYmxhY2tcbiAgICAgIC8vIGFsc28gYXZvaWRzIGRpdmlkZSBieSAwIGVycm9yXG4gICAgICByZXR1cm4gWzAsIDAsIDBdO1xuICB9XG5cbiAgbCAqPSAyO1xuICBzICo9IChsIDw9IDEpID8gbCA6IDIgLSBsO1xuICB2ID0gKGwgKyBzKSAvIDI7XG4gIHN2ID0gKDIgKiBzKSAvIChsICsgcyk7XG4gIHJldHVybiBbaCwgc3YgKiAxMDAsIHYgKiAxMDBdO1xufVxuXG5mdW5jdGlvbiBoc2wyaHdiKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJod2IoaHNsMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGhzbDJjbXlrKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJjbXlrKGhzbDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBoc2wya2V5d29yZChhcmdzKSB7XG4gIHJldHVybiByZ2Iya2V5d29yZChoc2wycmdiKGFyZ3MpKTtcbn1cblxuXG5mdW5jdGlvbiBoc3YycmdiKGhzdikge1xuICB2YXIgaCA9IGhzdlswXSAvIDYwLFxuICAgICAgcyA9IGhzdlsxXSAvIDEwMCxcbiAgICAgIHYgPSBoc3ZbMl0gLyAxMDAsXG4gICAgICBoaSA9IE1hdGguZmxvb3IoaCkgJSA2O1xuXG4gIHZhciBmID0gaCAtIE1hdGguZmxvb3IoaCksXG4gICAgICBwID0gMjU1ICogdiAqICgxIC0gcyksXG4gICAgICBxID0gMjU1ICogdiAqICgxIC0gKHMgKiBmKSksXG4gICAgICB0ID0gMjU1ICogdiAqICgxIC0gKHMgKiAoMSAtIGYpKSksXG4gICAgICB2ID0gMjU1ICogdjtcblxuICBzd2l0Y2goaGkpIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gW3YsIHQsIHBdO1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBbcSwgdiwgcF07XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIFtwLCB2LCB0XTtcbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4gW3AsIHEsIHZdO1xuICAgIGNhc2UgNDpcbiAgICAgIHJldHVybiBbdCwgcCwgdl07XG4gICAgY2FzZSA1OlxuICAgICAgcmV0dXJuIFt2LCBwLCBxXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoc3YyaHNsKGhzdikge1xuICB2YXIgaCA9IGhzdlswXSxcbiAgICAgIHMgPSBoc3ZbMV0gLyAxMDAsXG4gICAgICB2ID0gaHN2WzJdIC8gMTAwLFxuICAgICAgc2wsIGw7XG5cbiAgbCA9ICgyIC0gcykgKiB2O1xuICBzbCA9IHMgKiB2O1xuICBzbCAvPSAobCA8PSAxKSA/IGwgOiAyIC0gbDtcbiAgc2wgPSBzbCB8fCAwO1xuICBsIC89IDI7XG4gIHJldHVybiBbaCwgc2wgKiAxMDAsIGwgKiAxMDBdO1xufVxuXG5mdW5jdGlvbiBoc3YyaHdiKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJod2IoaHN2MnJnYihhcmdzKSlcbn1cblxuZnVuY3Rpb24gaHN2MmNteWsoYXJncykge1xuICByZXR1cm4gcmdiMmNteWsoaHN2MnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGhzdjJrZXl3b3JkKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJrZXl3b3JkKGhzdjJyZ2IoYXJncykpO1xufVxuXG4vLyBodHRwOi8vZGV2LnczLm9yZy9jc3N3Zy9jc3MtY29sb3IvI2h3Yi10by1yZ2JcbmZ1bmN0aW9uIGh3YjJyZ2IoaHdiKSB7XG4gIHZhciBoID0gaHdiWzBdIC8gMzYwLFxuICAgICAgd2ggPSBod2JbMV0gLyAxMDAsXG4gICAgICBibCA9IGh3YlsyXSAvIDEwMCxcbiAgICAgIHJhdGlvID0gd2ggKyBibCxcbiAgICAgIGksIHYsIGYsIG47XG5cbiAgLy8gd2ggKyBibCBjYW50IGJlID4gMVxuICBpZiAocmF0aW8gPiAxKSB7XG4gICAgd2ggLz0gcmF0aW87XG4gICAgYmwgLz0gcmF0aW87XG4gIH1cblxuICBpID0gTWF0aC5mbG9vcig2ICogaCk7XG4gIHYgPSAxIC0gYmw7XG4gIGYgPSA2ICogaCAtIGk7XG4gIGlmICgoaSAmIDB4MDEpICE9IDApIHtcbiAgICBmID0gMSAtIGY7XG4gIH1cbiAgbiA9IHdoICsgZiAqICh2IC0gd2gpOyAgLy8gbGluZWFyIGludGVycG9sYXRpb25cblxuICBzd2l0Y2ggKGkpIHtcbiAgICBkZWZhdWx0OlxuICAgIGNhc2UgNjpcbiAgICBjYXNlIDA6IHIgPSB2OyBnID0gbjsgYiA9IHdoOyBicmVhaztcbiAgICBjYXNlIDE6IHIgPSBuOyBnID0gdjsgYiA9IHdoOyBicmVhaztcbiAgICBjYXNlIDI6IHIgPSB3aDsgZyA9IHY7IGIgPSBuOyBicmVhaztcbiAgICBjYXNlIDM6IHIgPSB3aDsgZyA9IG47IGIgPSB2OyBicmVhaztcbiAgICBjYXNlIDQ6IHIgPSBuOyBnID0gd2g7IGIgPSB2OyBicmVhaztcbiAgICBjYXNlIDU6IHIgPSB2OyBnID0gd2g7IGIgPSBuOyBicmVhaztcbiAgfVxuXG4gIHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG59XG5cbmZ1bmN0aW9uIGh3YjJoc2woYXJncykge1xuICByZXR1cm4gcmdiMmhzbChod2IycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHdiMmhzdihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHN2KGh3YjJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBod2IyY215ayhhcmdzKSB7XG4gIHJldHVybiByZ2IyY215ayhod2IycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHdiMmtleXdvcmQoYXJncykge1xuICByZXR1cm4gcmdiMmtleXdvcmQoaHdiMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGNteWsycmdiKGNteWspIHtcbiAgdmFyIGMgPSBjbXlrWzBdIC8gMTAwLFxuICAgICAgbSA9IGNteWtbMV0gLyAxMDAsXG4gICAgICB5ID0gY215a1syXSAvIDEwMCxcbiAgICAgIGsgPSBjbXlrWzNdIC8gMTAwLFxuICAgICAgciwgZywgYjtcblxuICByID0gMSAtIE1hdGgubWluKDEsIGMgKiAoMSAtIGspICsgayk7XG4gIGcgPSAxIC0gTWF0aC5taW4oMSwgbSAqICgxIC0gaykgKyBrKTtcbiAgYiA9IDEgLSBNYXRoLm1pbigxLCB5ICogKDEgLSBrKSArIGspO1xuICByZXR1cm4gW3IgKiAyNTUsIGcgKiAyNTUsIGIgKiAyNTVdO1xufVxuXG5mdW5jdGlvbiBjbXlrMmhzbChhcmdzKSB7XG4gIHJldHVybiByZ2IyaHNsKGNteWsycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gY215azJoc3YoYXJncykge1xuICByZXR1cm4gcmdiMmhzdihjbXlrMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGNteWsyaHdiKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJod2IoY215azJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBjbXlrMmtleXdvcmQoYXJncykge1xuICByZXR1cm4gcmdiMmtleXdvcmQoY215azJyZ2IoYXJncykpO1xufVxuXG5cbmZ1bmN0aW9uIHh5ejJyZ2IoeHl6KSB7XG4gIHZhciB4ID0geHl6WzBdIC8gMTAwLFxuICAgICAgeSA9IHh5elsxXSAvIDEwMCxcbiAgICAgIHogPSB4eXpbMl0gLyAxMDAsXG4gICAgICByLCBnLCBiO1xuXG4gIHIgPSAoeCAqIDMuMjQwNikgKyAoeSAqIC0xLjUzNzIpICsgKHogKiAtMC40OTg2KTtcbiAgZyA9ICh4ICogLTAuOTY4OSkgKyAoeSAqIDEuODc1OCkgKyAoeiAqIDAuMDQxNSk7XG4gIGIgPSAoeCAqIDAuMDU1NykgKyAoeSAqIC0wLjIwNDApICsgKHogKiAxLjA1NzApO1xuXG4gIC8vIGFzc3VtZSBzUkdCXG4gIHIgPSByID4gMC4wMDMxMzA4ID8gKCgxLjA1NSAqIE1hdGgucG93KHIsIDEuMCAvIDIuNCkpIC0gMC4wNTUpXG4gICAgOiByID0gKHIgKiAxMi45Mik7XG5cbiAgZyA9IGcgPiAwLjAwMzEzMDggPyAoKDEuMDU1ICogTWF0aC5wb3coZywgMS4wIC8gMi40KSkgLSAwLjA1NSlcbiAgICA6IGcgPSAoZyAqIDEyLjkyKTtcblxuICBiID0gYiA+IDAuMDAzMTMwOCA/ICgoMS4wNTUgKiBNYXRoLnBvdyhiLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuICAgIDogYiA9IChiICogMTIuOTIpO1xuXG4gIHIgPSBNYXRoLm1pbihNYXRoLm1heCgwLCByKSwgMSk7XG4gIGcgPSBNYXRoLm1pbihNYXRoLm1heCgwLCBnKSwgMSk7XG4gIGIgPSBNYXRoLm1pbihNYXRoLm1heCgwLCBiKSwgMSk7XG5cbiAgcmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcbn1cblxuZnVuY3Rpb24geHl6MmxhYih4eXopIHtcbiAgdmFyIHggPSB4eXpbMF0sXG4gICAgICB5ID0geHl6WzFdLFxuICAgICAgeiA9IHh5elsyXSxcbiAgICAgIGwsIGEsIGI7XG5cbiAgeCAvPSA5NS4wNDc7XG4gIHkgLz0gMTAwO1xuICB6IC89IDEwOC44ODM7XG5cbiAgeCA9IHggPiAwLjAwODg1NiA/IE1hdGgucG93KHgsIDEvMykgOiAoNy43ODcgKiB4KSArICgxNiAvIDExNik7XG4gIHkgPSB5ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh5LCAxLzMpIDogKDcuNzg3ICogeSkgKyAoMTYgLyAxMTYpO1xuICB6ID0geiA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeiwgMS8zKSA6ICg3Ljc4NyAqIHopICsgKDE2IC8gMTE2KTtcblxuICBsID0gKDExNiAqIHkpIC0gMTY7XG4gIGEgPSA1MDAgKiAoeCAtIHkpO1xuICBiID0gMjAwICogKHkgLSB6KTtcblxuICByZXR1cm4gW2wsIGEsIGJdO1xufVxuXG5mdW5jdGlvbiB4eXoybGNoKGFyZ3MpIHtcbiAgcmV0dXJuIGxhYjJsY2goeHl6MmxhYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGxhYjJ4eXoobGFiKSB7XG4gIHZhciBsID0gbGFiWzBdLFxuICAgICAgYSA9IGxhYlsxXSxcbiAgICAgIGIgPSBsYWJbMl0sXG4gICAgICB4LCB5LCB6LCB5MjtcblxuICBpZiAobCA8PSA4KSB7XG4gICAgeSA9IChsICogMTAwKSAvIDkwMy4zO1xuICAgIHkyID0gKDcuNzg3ICogKHkgLyAxMDApKSArICgxNiAvIDExNik7XG4gIH0gZWxzZSB7XG4gICAgeSA9IDEwMCAqIE1hdGgucG93KChsICsgMTYpIC8gMTE2LCAzKTtcbiAgICB5MiA9IE1hdGgucG93KHkgLyAxMDAsIDEvMyk7XG4gIH1cblxuICB4ID0geCAvIDk1LjA0NyA8PSAwLjAwODg1NiA/IHggPSAoOTUuMDQ3ICogKChhIC8gNTAwKSArIHkyIC0gKDE2IC8gMTE2KSkpIC8gNy43ODcgOiA5NS4wNDcgKiBNYXRoLnBvdygoYSAvIDUwMCkgKyB5MiwgMyk7XG5cbiAgeiA9IHogLyAxMDguODgzIDw9IDAuMDA4ODU5ID8geiA9ICgxMDguODgzICogKHkyIC0gKGIgLyAyMDApIC0gKDE2IC8gMTE2KSkpIC8gNy43ODcgOiAxMDguODgzICogTWF0aC5wb3coeTIgLSAoYiAvIDIwMCksIDMpO1xuXG4gIHJldHVybiBbeCwgeSwgel07XG59XG5cbmZ1bmN0aW9uIGxhYjJsY2gobGFiKSB7XG4gIHZhciBsID0gbGFiWzBdLFxuICAgICAgYSA9IGxhYlsxXSxcbiAgICAgIGIgPSBsYWJbMl0sXG4gICAgICBociwgaCwgYztcblxuICBociA9IE1hdGguYXRhbjIoYiwgYSk7XG4gIGggPSBociAqIDM2MCAvIDIgLyBNYXRoLlBJO1xuICBpZiAoaCA8IDApIHtcbiAgICBoICs9IDM2MDtcbiAgfVxuICBjID0gTWF0aC5zcXJ0KGEgKiBhICsgYiAqIGIpO1xuICByZXR1cm4gW2wsIGMsIGhdO1xufVxuXG5mdW5jdGlvbiBsYWIycmdiKGFyZ3MpIHtcbiAgcmV0dXJuIHh5ejJyZ2IobGFiMnh5eihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGxjaDJsYWIobGNoKSB7XG4gIHZhciBsID0gbGNoWzBdLFxuICAgICAgYyA9IGxjaFsxXSxcbiAgICAgIGggPSBsY2hbMl0sXG4gICAgICBhLCBiLCBocjtcblxuICBociA9IGggLyAzNjAgKiAyICogTWF0aC5QSTtcbiAgYSA9IGMgKiBNYXRoLmNvcyhocik7XG4gIGIgPSBjICogTWF0aC5zaW4oaHIpO1xuICByZXR1cm4gW2wsIGEsIGJdO1xufVxuXG5mdW5jdGlvbiBsY2gyeHl6KGFyZ3MpIHtcbiAgcmV0dXJuIGxhYjJ4eXoobGNoMmxhYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGxjaDJyZ2IoYXJncykge1xuICByZXR1cm4gbGFiMnJnYihsY2gybGFiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJyZ2Ioa2V5d29yZCkge1xuICByZXR1cm4gY3NzS2V5d29yZHNba2V5d29yZF07XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQyaHNsKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJoc2woa2V5d29yZDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMmhzdihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHN2KGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJod2IoYXJncykge1xuICByZXR1cm4gcmdiMmh3YihrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQyY215ayhhcmdzKSB7XG4gIHJldHVybiByZ2IyY215ayhrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQybGFiKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJsYWIoa2V5d29yZDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMnh5eihhcmdzKSB7XG4gIHJldHVybiByZ2IyeHl6KGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxudmFyIGNzc0tleXdvcmRzID0ge1xuICBhbGljZWJsdWU6ICBbMjQwLDI0OCwyNTVdLFxuICBhbnRpcXVld2hpdGU6IFsyNTAsMjM1LDIxNV0sXG4gIGFxdWE6IFswLDI1NSwyNTVdLFxuICBhcXVhbWFyaW5lOiBbMTI3LDI1NSwyMTJdLFxuICBhenVyZTogIFsyNDAsMjU1LDI1NV0sXG4gIGJlaWdlOiAgWzI0NSwyNDUsMjIwXSxcbiAgYmlzcXVlOiBbMjU1LDIyOCwxOTZdLFxuICBibGFjazogIFswLDAsMF0sXG4gIGJsYW5jaGVkYWxtb25kOiBbMjU1LDIzNSwyMDVdLFxuICBibHVlOiBbMCwwLDI1NV0sXG4gIGJsdWV2aW9sZXQ6IFsxMzgsNDMsMjI2XSxcbiAgYnJvd246ICBbMTY1LDQyLDQyXSxcbiAgYnVybHl3b29kOiAgWzIyMiwxODQsMTM1XSxcbiAgY2FkZXRibHVlOiAgWzk1LDE1OCwxNjBdLFxuICBjaGFydHJldXNlOiBbMTI3LDI1NSwwXSxcbiAgY2hvY29sYXRlOiAgWzIxMCwxMDUsMzBdLFxuICBjb3JhbDogIFsyNTUsMTI3LDgwXSxcbiAgY29ybmZsb3dlcmJsdWU6IFsxMDAsMTQ5LDIzN10sXG4gIGNvcm5zaWxrOiBbMjU1LDI0OCwyMjBdLFxuICBjcmltc29uOiAgWzIyMCwyMCw2MF0sXG4gIGN5YW46IFswLDI1NSwyNTVdLFxuICBkYXJrYmx1ZTogWzAsMCwxMzldLFxuICBkYXJrY3lhbjogWzAsMTM5LDEzOV0sXG4gIGRhcmtnb2xkZW5yb2Q6ICBbMTg0LDEzNCwxMV0sXG4gIGRhcmtncmF5OiBbMTY5LDE2OSwxNjldLFxuICBkYXJrZ3JlZW46ICBbMCwxMDAsMF0sXG4gIGRhcmtncmV5OiBbMTY5LDE2OSwxNjldLFxuICBkYXJra2hha2k6ICBbMTg5LDE4MywxMDddLFxuICBkYXJrbWFnZW50YTogIFsxMzksMCwxMzldLFxuICBkYXJrb2xpdmVncmVlbjogWzg1LDEwNyw0N10sXG4gIGRhcmtvcmFuZ2U6IFsyNTUsMTQwLDBdLFxuICBkYXJrb3JjaGlkOiBbMTUzLDUwLDIwNF0sXG4gIGRhcmtyZWQ6ICBbMTM5LDAsMF0sXG4gIGRhcmtzYWxtb246IFsyMzMsMTUwLDEyMl0sXG4gIGRhcmtzZWFncmVlbjogWzE0MywxODgsMTQzXSxcbiAgZGFya3NsYXRlYmx1ZTogIFs3Miw2MSwxMzldLFxuICBkYXJrc2xhdGVncmF5OiAgWzQ3LDc5LDc5XSxcbiAgZGFya3NsYXRlZ3JleTogIFs0Nyw3OSw3OV0sXG4gIGRhcmt0dXJxdW9pc2U6ICBbMCwyMDYsMjA5XSxcbiAgZGFya3Zpb2xldDogWzE0OCwwLDIxMV0sXG4gIGRlZXBwaW5rOiBbMjU1LDIwLDE0N10sXG4gIGRlZXBza3libHVlOiAgWzAsMTkxLDI1NV0sXG4gIGRpbWdyYXk6ICBbMTA1LDEwNSwxMDVdLFxuICBkaW1ncmV5OiAgWzEwNSwxMDUsMTA1XSxcbiAgZG9kZ2VyYmx1ZTogWzMwLDE0NCwyNTVdLFxuICBmaXJlYnJpY2s6ICBbMTc4LDM0LDM0XSxcbiAgZmxvcmFsd2hpdGU6ICBbMjU1LDI1MCwyNDBdLFxuICBmb3Jlc3RncmVlbjogIFszNCwxMzksMzRdLFxuICBmdWNoc2lhOiAgWzI1NSwwLDI1NV0sXG4gIGdhaW5zYm9ybzogIFsyMjAsMjIwLDIyMF0sXG4gIGdob3N0d2hpdGU6IFsyNDgsMjQ4LDI1NV0sXG4gIGdvbGQ6IFsyNTUsMjE1LDBdLFxuICBnb2xkZW5yb2Q6ICBbMjE4LDE2NSwzMl0sXG4gIGdyYXk6IFsxMjgsMTI4LDEyOF0sXG4gIGdyZWVuOiAgWzAsMTI4LDBdLFxuICBncmVlbnllbGxvdzogIFsxNzMsMjU1LDQ3XSxcbiAgZ3JleTogWzEyOCwxMjgsMTI4XSxcbiAgaG9uZXlkZXc6IFsyNDAsMjU1LDI0MF0sXG4gIGhvdHBpbms6ICBbMjU1LDEwNSwxODBdLFxuICBpbmRpYW5yZWQ6ICBbMjA1LDkyLDkyXSxcbiAgaW5kaWdvOiBbNzUsMCwxMzBdLFxuICBpdm9yeTogIFsyNTUsMjU1LDI0MF0sXG4gIGtoYWtpOiAgWzI0MCwyMzAsMTQwXSxcbiAgbGF2ZW5kZXI6IFsyMzAsMjMwLDI1MF0sXG4gIGxhdmVuZGVyYmx1c2g6ICBbMjU1LDI0MCwyNDVdLFxuICBsYXduZ3JlZW46ICBbMTI0LDI1MiwwXSxcbiAgbGVtb25jaGlmZm9uOiBbMjU1LDI1MCwyMDVdLFxuICBsaWdodGJsdWU6ICBbMTczLDIxNiwyMzBdLFxuICBsaWdodGNvcmFsOiBbMjQwLDEyOCwxMjhdLFxuICBsaWdodGN5YW46ICBbMjI0LDI1NSwyNTVdLFxuICBsaWdodGdvbGRlbnJvZHllbGxvdzogWzI1MCwyNTAsMjEwXSxcbiAgbGlnaHRncmF5OiAgWzIxMSwyMTEsMjExXSxcbiAgbGlnaHRncmVlbjogWzE0NCwyMzgsMTQ0XSxcbiAgbGlnaHRncmV5OiAgWzIxMSwyMTEsMjExXSxcbiAgbGlnaHRwaW5rOiAgWzI1NSwxODIsMTkzXSxcbiAgbGlnaHRzYWxtb246ICBbMjU1LDE2MCwxMjJdLFxuICBsaWdodHNlYWdyZWVuOiAgWzMyLDE3OCwxNzBdLFxuICBsaWdodHNreWJsdWU6IFsxMzUsMjA2LDI1MF0sXG4gIGxpZ2h0c2xhdGVncmF5OiBbMTE5LDEzNiwxNTNdLFxuICBsaWdodHNsYXRlZ3JleTogWzExOSwxMzYsMTUzXSxcbiAgbGlnaHRzdGVlbGJsdWU6IFsxNzYsMTk2LDIyMl0sXG4gIGxpZ2h0eWVsbG93OiAgWzI1NSwyNTUsMjI0XSxcbiAgbGltZTogWzAsMjU1LDBdLFxuICBsaW1lZ3JlZW46ICBbNTAsMjA1LDUwXSxcbiAgbGluZW46ICBbMjUwLDI0MCwyMzBdLFxuICBtYWdlbnRhOiAgWzI1NSwwLDI1NV0sXG4gIG1hcm9vbjogWzEyOCwwLDBdLFxuICBtZWRpdW1hcXVhbWFyaW5lOiBbMTAyLDIwNSwxNzBdLFxuICBtZWRpdW1ibHVlOiBbMCwwLDIwNV0sXG4gIG1lZGl1bW9yY2hpZDogWzE4Niw4NSwyMTFdLFxuICBtZWRpdW1wdXJwbGU6IFsxNDcsMTEyLDIxOV0sXG4gIG1lZGl1bXNlYWdyZWVuOiBbNjAsMTc5LDExM10sXG4gIG1lZGl1bXNsYXRlYmx1ZTogIFsxMjMsMTA0LDIzOF0sXG4gIG1lZGl1bXNwcmluZ2dyZWVuOiAgWzAsMjUwLDE1NF0sXG4gIG1lZGl1bXR1cnF1b2lzZTogIFs3MiwyMDksMjA0XSxcbiAgbWVkaXVtdmlvbGV0cmVkOiAgWzE5OSwyMSwxMzNdLFxuICBtaWRuaWdodGJsdWU6IFsyNSwyNSwxMTJdLFxuICBtaW50Y3JlYW06ICBbMjQ1LDI1NSwyNTBdLFxuICBtaXN0eXJvc2U6ICBbMjU1LDIyOCwyMjVdLFxuICBtb2NjYXNpbjogWzI1NSwyMjgsMTgxXSxcbiAgbmF2YWpvd2hpdGU6ICBbMjU1LDIyMiwxNzNdLFxuICBuYXZ5OiBbMCwwLDEyOF0sXG4gIG9sZGxhY2U6ICBbMjUzLDI0NSwyMzBdLFxuICBvbGl2ZTogIFsxMjgsMTI4LDBdLFxuICBvbGl2ZWRyYWI6ICBbMTA3LDE0MiwzNV0sXG4gIG9yYW5nZTogWzI1NSwxNjUsMF0sXG4gIG9yYW5nZXJlZDogIFsyNTUsNjksMF0sXG4gIG9yY2hpZDogWzIxOCwxMTIsMjE0XSxcbiAgcGFsZWdvbGRlbnJvZDogIFsyMzgsMjMyLDE3MF0sXG4gIHBhbGVncmVlbjogIFsxNTIsMjUxLDE1Ml0sXG4gIHBhbGV0dXJxdW9pc2U6ICBbMTc1LDIzOCwyMzhdLFxuICBwYWxldmlvbGV0cmVkOiAgWzIxOSwxMTIsMTQ3XSxcbiAgcGFwYXlhd2hpcDogWzI1NSwyMzksMjEzXSxcbiAgcGVhY2hwdWZmOiAgWzI1NSwyMTgsMTg1XSxcbiAgcGVydTogWzIwNSwxMzMsNjNdLFxuICBwaW5rOiBbMjU1LDE5MiwyMDNdLFxuICBwbHVtOiBbMjIxLDE2MCwyMjFdLFxuICBwb3dkZXJibHVlOiBbMTc2LDIyNCwyMzBdLFxuICBwdXJwbGU6IFsxMjgsMCwxMjhdLFxuICByZWJlY2NhcHVycGxlOiBbMTAyLCA1MSwgMTUzXSxcbiAgcmVkOiAgWzI1NSwwLDBdLFxuICByb3N5YnJvd246ICBbMTg4LDE0MywxNDNdLFxuICByb3lhbGJsdWU6ICBbNjUsMTA1LDIyNV0sXG4gIHNhZGRsZWJyb3duOiAgWzEzOSw2OSwxOV0sXG4gIHNhbG1vbjogWzI1MCwxMjgsMTE0XSxcbiAgc2FuZHlicm93bjogWzI0NCwxNjQsOTZdLFxuICBzZWFncmVlbjogWzQ2LDEzOSw4N10sXG4gIHNlYXNoZWxsOiBbMjU1LDI0NSwyMzhdLFxuICBzaWVubmE6IFsxNjAsODIsNDVdLFxuICBzaWx2ZXI6IFsxOTIsMTkyLDE5Ml0sXG4gIHNreWJsdWU6ICBbMTM1LDIwNiwyMzVdLFxuICBzbGF0ZWJsdWU6ICBbMTA2LDkwLDIwNV0sXG4gIHNsYXRlZ3JheTogIFsxMTIsMTI4LDE0NF0sXG4gIHNsYXRlZ3JleTogIFsxMTIsMTI4LDE0NF0sXG4gIHNub3c6IFsyNTUsMjUwLDI1MF0sXG4gIHNwcmluZ2dyZWVuOiAgWzAsMjU1LDEyN10sXG4gIHN0ZWVsYmx1ZTogIFs3MCwxMzAsMTgwXSxcbiAgdGFuOiAgWzIxMCwxODAsMTQwXSxcbiAgdGVhbDogWzAsMTI4LDEyOF0sXG4gIHRoaXN0bGU6ICBbMjE2LDE5MSwyMTZdLFxuICB0b21hdG86IFsyNTUsOTksNzFdLFxuICB0dXJxdW9pc2U6ICBbNjQsMjI0LDIwOF0sXG4gIHZpb2xldDogWzIzOCwxMzAsMjM4XSxcbiAgd2hlYXQ6ICBbMjQ1LDIyMiwxNzldLFxuICB3aGl0ZTogIFsyNTUsMjU1LDI1NV0sXG4gIHdoaXRlc21va2U6IFsyNDUsMjQ1LDI0NV0sXG4gIHllbGxvdzogWzI1NSwyNTUsMF0sXG4gIHllbGxvd2dyZWVuOiAgWzE1NCwyMDUsNTBdXG59O1xuXG52YXIgcmV2ZXJzZUtleXdvcmRzID0ge307XG5mb3IgKHZhciBrZXkgaW4gY3NzS2V5d29yZHMpIHtcbiAgcmV2ZXJzZUtleXdvcmRzW0pTT04uc3RyaW5naWZ5KGNzc0tleXdvcmRzW2tleV0pXSA9IGtleTtcbn1cbiIsInZhciBjb252ZXJzaW9ucyA9IHJlcXVpcmUoXCIuL2NvbnZlcnNpb25zXCIpO1xuXG52YXIgY29udmVydCA9IGZ1bmN0aW9uKCkge1xuICAgcmV0dXJuIG5ldyBDb252ZXJ0ZXIoKTtcbn1cblxuZm9yICh2YXIgZnVuYyBpbiBjb252ZXJzaW9ucykge1xuICAvLyBleHBvcnQgUmF3IHZlcnNpb25zXG4gIGNvbnZlcnRbZnVuYyArIFwiUmF3XCJdID0gIChmdW5jdGlvbihmdW5jKSB7XG4gICAgLy8gYWNjZXB0IGFycmF5IG9yIHBsYWluIGFyZ3NcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZyA9PSBcIm51bWJlclwiKVxuICAgICAgICBhcmcgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGNvbnZlcnNpb25zW2Z1bmNdKGFyZyk7XG4gICAgfVxuICB9KShmdW5jKTtcblxuICB2YXIgcGFpciA9IC8oXFx3KykyKFxcdyspLy5leGVjKGZ1bmMpLFxuICAgICAgZnJvbSA9IHBhaXJbMV0sXG4gICAgICB0byA9IHBhaXJbMl07XG5cbiAgLy8gZXhwb3J0IHJnYjJoc2wgYW5kIFtcInJnYlwiXVtcImhzbFwiXVxuICBjb252ZXJ0W2Zyb21dID0gY29udmVydFtmcm9tXSB8fCB7fTtcblxuICBjb252ZXJ0W2Zyb21dW3RvXSA9IGNvbnZlcnRbZnVuY10gPSAoZnVuY3Rpb24oZnVuYykgeyBcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZyA9PSBcIm51bWJlclwiKVxuICAgICAgICBhcmcgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgXG4gICAgICB2YXIgdmFsID0gY29udmVyc2lvbnNbZnVuY10oYXJnKTtcbiAgICAgIGlmICh0eXBlb2YgdmFsID09IFwic3RyaW5nXCIgfHwgdmFsID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB2YWw7IC8vIGtleXdvcmRcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspXG4gICAgICAgIHZhbFtpXSA9IE1hdGgucm91bmQodmFsW2ldKTtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICB9KShmdW5jKTtcbn1cblxuXG4vKiBDb252ZXJ0ZXIgZG9lcyBsYXp5IGNvbnZlcnNpb24gYW5kIGNhY2hpbmcgKi9cbnZhciBDb252ZXJ0ZXIgPSBmdW5jdGlvbigpIHtcbiAgIHRoaXMuY29udnMgPSB7fTtcbn07XG5cbi8qIEVpdGhlciBnZXQgdGhlIHZhbHVlcyBmb3IgYSBzcGFjZSBvclxuICBzZXQgdGhlIHZhbHVlcyBmb3IgYSBzcGFjZSwgZGVwZW5kaW5nIG9uIGFyZ3MgKi9cbkNvbnZlcnRlci5wcm90b3R5cGUucm91dGVTcGFjZSA9IGZ1bmN0aW9uKHNwYWNlLCBhcmdzKSB7XG4gICB2YXIgdmFsdWVzID0gYXJnc1swXTtcbiAgIGlmICh2YWx1ZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gY29sb3IucmdiKClcbiAgICAgIHJldHVybiB0aGlzLmdldFZhbHVlcyhzcGFjZSk7XG4gICB9XG4gICAvLyBjb2xvci5yZ2IoMTAsIDEwLCAxMClcbiAgIGlmICh0eXBlb2YgdmFsdWVzID09IFwibnVtYmVyXCIpIHtcbiAgICAgIHZhbHVlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpOyAgICAgICAgXG4gICB9XG5cbiAgIHJldHVybiB0aGlzLnNldFZhbHVlcyhzcGFjZSwgdmFsdWVzKTtcbn07XG4gIFxuLyogU2V0IHRoZSB2YWx1ZXMgZm9yIGEgc3BhY2UsIGludmFsaWRhdGluZyBjYWNoZSAqL1xuQ29udmVydGVyLnByb3RvdHlwZS5zZXRWYWx1ZXMgPSBmdW5jdGlvbihzcGFjZSwgdmFsdWVzKSB7XG4gICB0aGlzLnNwYWNlID0gc3BhY2U7XG4gICB0aGlzLmNvbnZzID0ge307XG4gICB0aGlzLmNvbnZzW3NwYWNlXSA9IHZhbHVlcztcbiAgIHJldHVybiB0aGlzO1xufTtcblxuLyogR2V0IHRoZSB2YWx1ZXMgZm9yIGEgc3BhY2UuIElmIHRoZXJlJ3MgYWxyZWFkeVxuICBhIGNvbnZlcnNpb24gZm9yIHRoZSBzcGFjZSwgZmV0Y2ggaXQsIG90aGVyd2lzZVxuICBjb21wdXRlIGl0ICovXG5Db252ZXJ0ZXIucHJvdG90eXBlLmdldFZhbHVlcyA9IGZ1bmN0aW9uKHNwYWNlKSB7XG4gICB2YXIgdmFscyA9IHRoaXMuY29udnNbc3BhY2VdO1xuICAgaWYgKCF2YWxzKSB7XG4gICAgICB2YXIgZnNwYWNlID0gdGhpcy5zcGFjZSxcbiAgICAgICAgICBmcm9tID0gdGhpcy5jb252c1tmc3BhY2VdO1xuICAgICAgdmFscyA9IGNvbnZlcnRbZnNwYWNlXVtzcGFjZV0oZnJvbSk7XG5cbiAgICAgIHRoaXMuY29udnNbc3BhY2VdID0gdmFscztcbiAgIH1cbiAgcmV0dXJuIHZhbHM7XG59O1xuXG5bXCJyZ2JcIiwgXCJoc2xcIiwgXCJoc3ZcIiwgXCJjbXlrXCIsIFwia2V5d29yZFwiXS5mb3JFYWNoKGZ1bmN0aW9uKHNwYWNlKSB7XG4gICBDb252ZXJ0ZXIucHJvdG90eXBlW3NwYWNlXSA9IGZ1bmN0aW9uKHZhbHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnJvdXRlU3BhY2Uoc3BhY2UsIGFyZ3VtZW50cyk7XG4gICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb252ZXJ0OyIsIi8qIE1JVCBsaWNlbnNlICovXG52YXIgY29sb3JOYW1lcyA9IHJlcXVpcmUoJ2NvbG9yLW5hbWUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICBnZXRSZ2JhOiBnZXRSZ2JhLFxuICAgZ2V0SHNsYTogZ2V0SHNsYSxcbiAgIGdldFJnYjogZ2V0UmdiLFxuICAgZ2V0SHNsOiBnZXRIc2wsXG4gICBnZXRId2I6IGdldEh3YixcbiAgIGdldEFscGhhOiBnZXRBbHBoYSxcblxuICAgaGV4U3RyaW5nOiBoZXhTdHJpbmcsXG4gICByZ2JTdHJpbmc6IHJnYlN0cmluZyxcbiAgIHJnYmFTdHJpbmc6IHJnYmFTdHJpbmcsXG4gICBwZXJjZW50U3RyaW5nOiBwZXJjZW50U3RyaW5nLFxuICAgcGVyY2VudGFTdHJpbmc6IHBlcmNlbnRhU3RyaW5nLFxuICAgaHNsU3RyaW5nOiBoc2xTdHJpbmcsXG4gICBoc2xhU3RyaW5nOiBoc2xhU3RyaW5nLFxuICAgaHdiU3RyaW5nOiBod2JTdHJpbmcsXG4gICBrZXl3b3JkOiBrZXl3b3JkXG59XG5cbmZ1bmN0aW9uIGdldFJnYmEoc3RyaW5nKSB7XG4gICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuO1xuICAgfVxuICAgdmFyIGFiYnIgPSAgL14jKFthLWZBLUYwLTldezN9KSQvLFxuICAgICAgIGhleCA9ICAvXiMoW2EtZkEtRjAtOV17Nn0pJC8sXG4gICAgICAgcmdiYSA9IC9ecmdiYT9cXChcXHMqKFxcZCspXFxzKixcXHMqKFxcZCspXFxzKixcXHMqKFxcZCspXFxzKig/OixcXHMqKFtcXGRcXC5dKylcXHMqKT9cXCkkLyxcbiAgICAgICBwZXIgPSAvXnJnYmE/XFwoXFxzKihbXFxkXFwuXSspXFwlXFxzKixcXHMqKFtcXGRcXC5dKylcXCVcXHMqLFxccyooW1xcZFxcLl0rKVxcJVxccyooPzosXFxzKihbXFxkXFwuXSspXFxzKik/XFwpJC8sXG4gICAgICAga2V5d29yZCA9IC8oXFxEKykvO1xuXG4gICB2YXIgcmdiID0gWzAsIDAsIDBdLFxuICAgICAgIGEgPSAxLFxuICAgICAgIG1hdGNoID0gc3RyaW5nLm1hdGNoKGFiYnIpO1xuICAgaWYgKG1hdGNoKSB7XG4gICAgICBtYXRjaCA9IG1hdGNoWzFdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgIHJnYltpXSA9IHBhcnNlSW50KG1hdGNoW2ldICsgbWF0Y2hbaV0sIDE2KTtcbiAgICAgIH1cbiAgIH1cbiAgIGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKGhleCkpIHtcbiAgICAgIG1hdGNoID0gbWF0Y2hbMV07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgcmdiW2ldID0gcGFyc2VJbnQobWF0Y2guc2xpY2UoaSAqIDIsIGkgKiAyICsgMiksIDE2KTtcbiAgICAgIH1cbiAgIH1cbiAgIGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKHJnYmEpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgcmdiW2ldID0gcGFyc2VJbnQobWF0Y2hbaSArIDFdKTtcbiAgICAgIH1cbiAgICAgIGEgPSBwYXJzZUZsb2F0KG1hdGNoWzRdKTtcbiAgIH1cbiAgIGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKHBlcikpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICByZ2JbaV0gPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQobWF0Y2hbaSArIDFdKSAqIDIuNTUpO1xuICAgICAgfVxuICAgICAgYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuICAgfVxuICAgZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2goa2V5d29yZCkpIHtcbiAgICAgIGlmIChtYXRjaFsxXSA9PSBcInRyYW5zcGFyZW50XCIpIHtcbiAgICAgICAgIHJldHVybiBbMCwgMCwgMCwgMF07XG4gICAgICB9XG4gICAgICByZ2IgPSBjb2xvck5hbWVzW21hdGNoWzFdXTtcbiAgICAgIGlmICghcmdiKSB7XG4gICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICB9XG5cbiAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZ2JbaV0gPSBzY2FsZShyZ2JbaV0sIDAsIDI1NSk7XG4gICB9XG4gICBpZiAoIWEgJiYgYSAhPSAwKSB7XG4gICAgICBhID0gMTtcbiAgIH1cbiAgIGVsc2Uge1xuICAgICAgYSA9IHNjYWxlKGEsIDAsIDEpO1xuICAgfVxuICAgcmdiWzNdID0gYTtcbiAgIHJldHVybiByZ2I7XG59XG5cbmZ1bmN0aW9uIGdldEhzbGEoc3RyaW5nKSB7XG4gICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuO1xuICAgfVxuICAgdmFyIGhzbCA9IC9eaHNsYT9cXChcXHMqKFxcZCspKD86ZGVnKT9cXHMqLFxccyooW1xcZFxcLl0rKSVcXHMqLFxccyooW1xcZFxcLl0rKSVcXHMqKD86LFxccyooW1xcZFxcLl0rKVxccyopP1xcKS87XG4gICB2YXIgbWF0Y2ggPSBzdHJpbmcubWF0Y2goaHNsKTtcbiAgIGlmIChtYXRjaCkge1xuICAgICAgdmFyIGggPSBzY2FsZShwYXJzZUludChtYXRjaFsxXSksIDAsIDM2MCksXG4gICAgICAgICAgcyA9IHNjYWxlKHBhcnNlRmxvYXQobWF0Y2hbMl0pLCAwLCAxMDApLFxuICAgICAgICAgIGwgPSBzY2FsZShwYXJzZUZsb2F0KG1hdGNoWzNdKSwgMCwgMTAwKSxcbiAgICAgICAgICBhID0gc2NhbGUocGFyc2VGbG9hdChtYXRjaFs0XSkgfHwgMSwgMCwgMSk7XG4gICAgICByZXR1cm4gW2gsIHMsIGwsIGFdO1xuICAgfVxufVxuXG5mdW5jdGlvbiBnZXRId2Ioc3RyaW5nKSB7XG4gICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuO1xuICAgfVxuICAgdmFyIGh3YiA9IC9eaHdiXFwoXFxzKihcXGQrKSg/OmRlZyk/XFxzKixcXHMqKFtcXGRcXC5dKyklXFxzKixcXHMqKFtcXGRcXC5dKyklXFxzKig/OixcXHMqKFtcXGRcXC5dKylcXHMqKT9cXCkvO1xuICAgdmFyIG1hdGNoID0gc3RyaW5nLm1hdGNoKGh3Yik7XG4gICBpZiAobWF0Y2gpIHtcbiAgICAgIHZhciBoID0gc2NhbGUocGFyc2VJbnQobWF0Y2hbMV0pLCAwLCAzNjApLFxuICAgICAgICAgIHcgPSBzY2FsZShwYXJzZUZsb2F0KG1hdGNoWzJdKSwgMCwgMTAwKSxcbiAgICAgICAgICBiID0gc2NhbGUocGFyc2VGbG9hdChtYXRjaFszXSksIDAsIDEwMCksXG4gICAgICAgICAgYSA9IHNjYWxlKHBhcnNlRmxvYXQobWF0Y2hbNF0pIHx8IDEsIDAsIDEpO1xuICAgICAgcmV0dXJuIFtoLCB3LCBiLCBhXTtcbiAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0UmdiKHN0cmluZykge1xuICAgdmFyIHJnYmEgPSBnZXRSZ2JhKHN0cmluZyk7XG4gICByZXR1cm4gcmdiYSAmJiByZ2JhLnNsaWNlKDAsIDMpO1xufVxuXG5mdW5jdGlvbiBnZXRIc2woc3RyaW5nKSB7XG4gIHZhciBoc2xhID0gZ2V0SHNsYShzdHJpbmcpO1xuICByZXR1cm4gaHNsYSAmJiBoc2xhLnNsaWNlKDAsIDMpO1xufVxuXG5mdW5jdGlvbiBnZXRBbHBoYShzdHJpbmcpIHtcbiAgIHZhciB2YWxzID0gZ2V0UmdiYShzdHJpbmcpO1xuICAgaWYgKHZhbHMpIHtcbiAgICAgIHJldHVybiB2YWxzWzNdO1xuICAgfVxuICAgZWxzZSBpZiAodmFscyA9IGdldEhzbGEoc3RyaW5nKSkge1xuICAgICAgcmV0dXJuIHZhbHNbM107XG4gICB9XG4gICBlbHNlIGlmICh2YWxzID0gZ2V0SHdiKHN0cmluZykpIHtcbiAgICAgIHJldHVybiB2YWxzWzNdO1xuICAgfVxufVxuXG4vLyBnZW5lcmF0b3JzXG5mdW5jdGlvbiBoZXhTdHJpbmcocmdiKSB7XG4gICByZXR1cm4gXCIjXCIgKyBoZXhEb3VibGUocmdiWzBdKSArIGhleERvdWJsZShyZ2JbMV0pXG4gICAgICAgICAgICAgICsgaGV4RG91YmxlKHJnYlsyXSk7XG59XG5cbmZ1bmN0aW9uIHJnYlN0cmluZyhyZ2JhLCBhbHBoYSkge1xuICAgaWYgKGFscGhhIDwgMSB8fCAocmdiYVszXSAmJiByZ2JhWzNdIDwgMSkpIHtcbiAgICAgIHJldHVybiByZ2JhU3RyaW5nKHJnYmEsIGFscGhhKTtcbiAgIH1cbiAgIHJldHVybiBcInJnYihcIiArIHJnYmFbMF0gKyBcIiwgXCIgKyByZ2JhWzFdICsgXCIsIFwiICsgcmdiYVsyXSArIFwiKVwiO1xufVxuXG5mdW5jdGlvbiByZ2JhU3RyaW5nKHJnYmEsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYWxwaGEgPSAocmdiYVszXSAhPT0gdW5kZWZpbmVkID8gcmdiYVszXSA6IDEpO1xuICAgfVxuICAgcmV0dXJuIFwicmdiYShcIiArIHJnYmFbMF0gKyBcIiwgXCIgKyByZ2JhWzFdICsgXCIsIFwiICsgcmdiYVsyXVxuICAgICAgICAgICArIFwiLCBcIiArIGFscGhhICsgXCIpXCI7XG59XG5cbmZ1bmN0aW9uIHBlcmNlbnRTdHJpbmcocmdiYSwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA8IDEgfHwgKHJnYmFbM10gJiYgcmdiYVszXSA8IDEpKSB7XG4gICAgICByZXR1cm4gcGVyY2VudGFTdHJpbmcocmdiYSwgYWxwaGEpO1xuICAgfVxuICAgdmFyIHIgPSBNYXRoLnJvdW5kKHJnYmFbMF0vMjU1ICogMTAwKSxcbiAgICAgICBnID0gTWF0aC5yb3VuZChyZ2JhWzFdLzI1NSAqIDEwMCksXG4gICAgICAgYiA9IE1hdGgucm91bmQocmdiYVsyXS8yNTUgKiAxMDApO1xuXG4gICByZXR1cm4gXCJyZ2IoXCIgKyByICsgXCIlLCBcIiArIGcgKyBcIiUsIFwiICsgYiArIFwiJSlcIjtcbn1cblxuZnVuY3Rpb24gcGVyY2VudGFTdHJpbmcocmdiYSwgYWxwaGEpIHtcbiAgIHZhciByID0gTWF0aC5yb3VuZChyZ2JhWzBdLzI1NSAqIDEwMCksXG4gICAgICAgZyA9IE1hdGgucm91bmQocmdiYVsxXS8yNTUgKiAxMDApLFxuICAgICAgIGIgPSBNYXRoLnJvdW5kKHJnYmFbMl0vMjU1ICogMTAwKTtcbiAgIHJldHVybiBcInJnYmEoXCIgKyByICsgXCIlLCBcIiArIGcgKyBcIiUsIFwiICsgYiArIFwiJSwgXCIgKyAoYWxwaGEgfHwgcmdiYVszXSB8fCAxKSArIFwiKVwiO1xufVxuXG5mdW5jdGlvbiBoc2xTdHJpbmcoaHNsYSwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA8IDEgfHwgKGhzbGFbM10gJiYgaHNsYVszXSA8IDEpKSB7XG4gICAgICByZXR1cm4gaHNsYVN0cmluZyhoc2xhLCBhbHBoYSk7XG4gICB9XG4gICByZXR1cm4gXCJoc2woXCIgKyBoc2xhWzBdICsgXCIsIFwiICsgaHNsYVsxXSArIFwiJSwgXCIgKyBoc2xhWzJdICsgXCIlKVwiO1xufVxuXG5mdW5jdGlvbiBoc2xhU3RyaW5nKGhzbGEsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYWxwaGEgPSAoaHNsYVszXSAhPT0gdW5kZWZpbmVkID8gaHNsYVszXSA6IDEpO1xuICAgfVxuICAgcmV0dXJuIFwiaHNsYShcIiArIGhzbGFbMF0gKyBcIiwgXCIgKyBoc2xhWzFdICsgXCIlLCBcIiArIGhzbGFbMl0gKyBcIiUsIFwiXG4gICAgICAgICAgICsgYWxwaGEgKyBcIilcIjtcbn1cblxuLy8gaHdiIGlzIGEgYml0IGRpZmZlcmVudCB0aGFuIHJnYihhKSAmIGhzbChhKSBzaW5jZSB0aGVyZSBpcyBubyBhbHBoYSBzcGVjaWZpYyBzeW50YXhcbi8vIChod2IgaGF2ZSBhbHBoYSBvcHRpb25hbCAmIDEgaXMgZGVmYXVsdCB2YWx1ZSlcbmZ1bmN0aW9uIGh3YlN0cmluZyhod2IsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYWxwaGEgPSAoaHdiWzNdICE9PSB1bmRlZmluZWQgPyBod2JbM10gOiAxKTtcbiAgIH1cbiAgIHJldHVybiBcImh3YihcIiArIGh3YlswXSArIFwiLCBcIiArIGh3YlsxXSArIFwiJSwgXCIgKyBod2JbMl0gKyBcIiVcIlxuICAgICAgICAgICArIChhbHBoYSAhPT0gdW5kZWZpbmVkICYmIGFscGhhICE9PSAxID8gXCIsIFwiICsgYWxwaGEgOiBcIlwiKSArIFwiKVwiO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkKHJnYikge1xuICByZXR1cm4gcmV2ZXJzZU5hbWVzW3JnYi5zbGljZSgwLCAzKV07XG59XG5cbi8vIGhlbHBlcnNcbmZ1bmN0aW9uIHNjYWxlKG51bSwgbWluLCBtYXgpIHtcbiAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChtaW4sIG51bSksIG1heCk7XG59XG5cbmZ1bmN0aW9uIGhleERvdWJsZShudW0pIHtcbiAgdmFyIHN0ciA9IG51bS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgcmV0dXJuIChzdHIubGVuZ3RoIDwgMikgPyBcIjBcIiArIHN0ciA6IHN0cjtcbn1cblxuXG4vL2NyZWF0ZSBhIGxpc3Qgb2YgcmV2ZXJzZSBjb2xvciBuYW1lc1xudmFyIHJldmVyc2VOYW1lcyA9IHt9O1xuZm9yICh2YXIgbmFtZSBpbiBjb2xvck5hbWVzKSB7XG4gICByZXZlcnNlTmFtZXNbY29sb3JOYW1lc1tuYW1lXV0gPSBuYW1lO1xufSIsIm1vZHVsZS5leHBvcnRzPXtcclxuXHRcImFsaWNlYmx1ZVwiOiBbMjQwLCAyNDgsIDI1NV0sXHJcblx0XCJhbnRpcXVld2hpdGVcIjogWzI1MCwgMjM1LCAyMTVdLFxyXG5cdFwiYXF1YVwiOiBbMCwgMjU1LCAyNTVdLFxyXG5cdFwiYXF1YW1hcmluZVwiOiBbMTI3LCAyNTUsIDIxMl0sXHJcblx0XCJhenVyZVwiOiBbMjQwLCAyNTUsIDI1NV0sXHJcblx0XCJiZWlnZVwiOiBbMjQ1LCAyNDUsIDIyMF0sXHJcblx0XCJiaXNxdWVcIjogWzI1NSwgMjI4LCAxOTZdLFxyXG5cdFwiYmxhY2tcIjogWzAsIDAsIDBdLFxyXG5cdFwiYmxhbmNoZWRhbG1vbmRcIjogWzI1NSwgMjM1LCAyMDVdLFxyXG5cdFwiYmx1ZVwiOiBbMCwgMCwgMjU1XSxcclxuXHRcImJsdWV2aW9sZXRcIjogWzEzOCwgNDMsIDIyNl0sXHJcblx0XCJicm93blwiOiBbMTY1LCA0MiwgNDJdLFxyXG5cdFwiYnVybHl3b29kXCI6IFsyMjIsIDE4NCwgMTM1XSxcclxuXHRcImNhZGV0Ymx1ZVwiOiBbOTUsIDE1OCwgMTYwXSxcclxuXHRcImNoYXJ0cmV1c2VcIjogWzEyNywgMjU1LCAwXSxcclxuXHRcImNob2NvbGF0ZVwiOiBbMjEwLCAxMDUsIDMwXSxcclxuXHRcImNvcmFsXCI6IFsyNTUsIDEyNywgODBdLFxyXG5cdFwiY29ybmZsb3dlcmJsdWVcIjogWzEwMCwgMTQ5LCAyMzddLFxyXG5cdFwiY29ybnNpbGtcIjogWzI1NSwgMjQ4LCAyMjBdLFxyXG5cdFwiY3JpbXNvblwiOiBbMjIwLCAyMCwgNjBdLFxyXG5cdFwiY3lhblwiOiBbMCwgMjU1LCAyNTVdLFxyXG5cdFwiZGFya2JsdWVcIjogWzAsIDAsIDEzOV0sXHJcblx0XCJkYXJrY3lhblwiOiBbMCwgMTM5LCAxMzldLFxyXG5cdFwiZGFya2dvbGRlbnJvZFwiOiBbMTg0LCAxMzQsIDExXSxcclxuXHRcImRhcmtncmF5XCI6IFsxNjksIDE2OSwgMTY5XSxcclxuXHRcImRhcmtncmVlblwiOiBbMCwgMTAwLCAwXSxcclxuXHRcImRhcmtncmV5XCI6IFsxNjksIDE2OSwgMTY5XSxcclxuXHRcImRhcmtraGFraVwiOiBbMTg5LCAxODMsIDEwN10sXHJcblx0XCJkYXJrbWFnZW50YVwiOiBbMTM5LCAwLCAxMzldLFxyXG5cdFwiZGFya29saXZlZ3JlZW5cIjogWzg1LCAxMDcsIDQ3XSxcclxuXHRcImRhcmtvcmFuZ2VcIjogWzI1NSwgMTQwLCAwXSxcclxuXHRcImRhcmtvcmNoaWRcIjogWzE1MywgNTAsIDIwNF0sXHJcblx0XCJkYXJrcmVkXCI6IFsxMzksIDAsIDBdLFxyXG5cdFwiZGFya3NhbG1vblwiOiBbMjMzLCAxNTAsIDEyMl0sXHJcblx0XCJkYXJrc2VhZ3JlZW5cIjogWzE0MywgMTg4LCAxNDNdLFxyXG5cdFwiZGFya3NsYXRlYmx1ZVwiOiBbNzIsIDYxLCAxMzldLFxyXG5cdFwiZGFya3NsYXRlZ3JheVwiOiBbNDcsIDc5LCA3OV0sXHJcblx0XCJkYXJrc2xhdGVncmV5XCI6IFs0NywgNzksIDc5XSxcclxuXHRcImRhcmt0dXJxdW9pc2VcIjogWzAsIDIwNiwgMjA5XSxcclxuXHRcImRhcmt2aW9sZXRcIjogWzE0OCwgMCwgMjExXSxcclxuXHRcImRlZXBwaW5rXCI6IFsyNTUsIDIwLCAxNDddLFxyXG5cdFwiZGVlcHNreWJsdWVcIjogWzAsIDE5MSwgMjU1XSxcclxuXHRcImRpbWdyYXlcIjogWzEwNSwgMTA1LCAxMDVdLFxyXG5cdFwiZGltZ3JleVwiOiBbMTA1LCAxMDUsIDEwNV0sXHJcblx0XCJkb2RnZXJibHVlXCI6IFszMCwgMTQ0LCAyNTVdLFxyXG5cdFwiZmlyZWJyaWNrXCI6IFsxNzgsIDM0LCAzNF0sXHJcblx0XCJmbG9yYWx3aGl0ZVwiOiBbMjU1LCAyNTAsIDI0MF0sXHJcblx0XCJmb3Jlc3RncmVlblwiOiBbMzQsIDEzOSwgMzRdLFxyXG5cdFwiZnVjaHNpYVwiOiBbMjU1LCAwLCAyNTVdLFxyXG5cdFwiZ2FpbnNib3JvXCI6IFsyMjAsIDIyMCwgMjIwXSxcclxuXHRcImdob3N0d2hpdGVcIjogWzI0OCwgMjQ4LCAyNTVdLFxyXG5cdFwiZ29sZFwiOiBbMjU1LCAyMTUsIDBdLFxyXG5cdFwiZ29sZGVucm9kXCI6IFsyMTgsIDE2NSwgMzJdLFxyXG5cdFwiZ3JheVwiOiBbMTI4LCAxMjgsIDEyOF0sXHJcblx0XCJncmVlblwiOiBbMCwgMTI4LCAwXSxcclxuXHRcImdyZWVueWVsbG93XCI6IFsxNzMsIDI1NSwgNDddLFxyXG5cdFwiZ3JleVwiOiBbMTI4LCAxMjgsIDEyOF0sXHJcblx0XCJob25leWRld1wiOiBbMjQwLCAyNTUsIDI0MF0sXHJcblx0XCJob3RwaW5rXCI6IFsyNTUsIDEwNSwgMTgwXSxcclxuXHRcImluZGlhbnJlZFwiOiBbMjA1LCA5MiwgOTJdLFxyXG5cdFwiaW5kaWdvXCI6IFs3NSwgMCwgMTMwXSxcclxuXHRcIml2b3J5XCI6IFsyNTUsIDI1NSwgMjQwXSxcclxuXHRcImtoYWtpXCI6IFsyNDAsIDIzMCwgMTQwXSxcclxuXHRcImxhdmVuZGVyXCI6IFsyMzAsIDIzMCwgMjUwXSxcclxuXHRcImxhdmVuZGVyYmx1c2hcIjogWzI1NSwgMjQwLCAyNDVdLFxyXG5cdFwibGF3bmdyZWVuXCI6IFsxMjQsIDI1MiwgMF0sXHJcblx0XCJsZW1vbmNoaWZmb25cIjogWzI1NSwgMjUwLCAyMDVdLFxyXG5cdFwibGlnaHRibHVlXCI6IFsxNzMsIDIxNiwgMjMwXSxcclxuXHRcImxpZ2h0Y29yYWxcIjogWzI0MCwgMTI4LCAxMjhdLFxyXG5cdFwibGlnaHRjeWFuXCI6IFsyMjQsIDI1NSwgMjU1XSxcclxuXHRcImxpZ2h0Z29sZGVucm9keWVsbG93XCI6IFsyNTAsIDI1MCwgMjEwXSxcclxuXHRcImxpZ2h0Z3JheVwiOiBbMjExLCAyMTEsIDIxMV0sXHJcblx0XCJsaWdodGdyZWVuXCI6IFsxNDQsIDIzOCwgMTQ0XSxcclxuXHRcImxpZ2h0Z3JleVwiOiBbMjExLCAyMTEsIDIxMV0sXHJcblx0XCJsaWdodHBpbmtcIjogWzI1NSwgMTgyLCAxOTNdLFxyXG5cdFwibGlnaHRzYWxtb25cIjogWzI1NSwgMTYwLCAxMjJdLFxyXG5cdFwibGlnaHRzZWFncmVlblwiOiBbMzIsIDE3OCwgMTcwXSxcclxuXHRcImxpZ2h0c2t5Ymx1ZVwiOiBbMTM1LCAyMDYsIDI1MF0sXHJcblx0XCJsaWdodHNsYXRlZ3JheVwiOiBbMTE5LCAxMzYsIDE1M10sXHJcblx0XCJsaWdodHNsYXRlZ3JleVwiOiBbMTE5LCAxMzYsIDE1M10sXHJcblx0XCJsaWdodHN0ZWVsYmx1ZVwiOiBbMTc2LCAxOTYsIDIyMl0sXHJcblx0XCJsaWdodHllbGxvd1wiOiBbMjU1LCAyNTUsIDIyNF0sXHJcblx0XCJsaW1lXCI6IFswLCAyNTUsIDBdLFxyXG5cdFwibGltZWdyZWVuXCI6IFs1MCwgMjA1LCA1MF0sXHJcblx0XCJsaW5lblwiOiBbMjUwLCAyNDAsIDIzMF0sXHJcblx0XCJtYWdlbnRhXCI6IFsyNTUsIDAsIDI1NV0sXHJcblx0XCJtYXJvb25cIjogWzEyOCwgMCwgMF0sXHJcblx0XCJtZWRpdW1hcXVhbWFyaW5lXCI6IFsxMDIsIDIwNSwgMTcwXSxcclxuXHRcIm1lZGl1bWJsdWVcIjogWzAsIDAsIDIwNV0sXHJcblx0XCJtZWRpdW1vcmNoaWRcIjogWzE4NiwgODUsIDIxMV0sXHJcblx0XCJtZWRpdW1wdXJwbGVcIjogWzE0NywgMTEyLCAyMTldLFxyXG5cdFwibWVkaXVtc2VhZ3JlZW5cIjogWzYwLCAxNzksIDExM10sXHJcblx0XCJtZWRpdW1zbGF0ZWJsdWVcIjogWzEyMywgMTA0LCAyMzhdLFxyXG5cdFwibWVkaXVtc3ByaW5nZ3JlZW5cIjogWzAsIDI1MCwgMTU0XSxcclxuXHRcIm1lZGl1bXR1cnF1b2lzZVwiOiBbNzIsIDIwOSwgMjA0XSxcclxuXHRcIm1lZGl1bXZpb2xldHJlZFwiOiBbMTk5LCAyMSwgMTMzXSxcclxuXHRcIm1pZG5pZ2h0Ymx1ZVwiOiBbMjUsIDI1LCAxMTJdLFxyXG5cdFwibWludGNyZWFtXCI6IFsyNDUsIDI1NSwgMjUwXSxcclxuXHRcIm1pc3R5cm9zZVwiOiBbMjU1LCAyMjgsIDIyNV0sXHJcblx0XCJtb2NjYXNpblwiOiBbMjU1LCAyMjgsIDE4MV0sXHJcblx0XCJuYXZham93aGl0ZVwiOiBbMjU1LCAyMjIsIDE3M10sXHJcblx0XCJuYXZ5XCI6IFswLCAwLCAxMjhdLFxyXG5cdFwib2xkbGFjZVwiOiBbMjUzLCAyNDUsIDIzMF0sXHJcblx0XCJvbGl2ZVwiOiBbMTI4LCAxMjgsIDBdLFxyXG5cdFwib2xpdmVkcmFiXCI6IFsxMDcsIDE0MiwgMzVdLFxyXG5cdFwib3JhbmdlXCI6IFsyNTUsIDE2NSwgMF0sXHJcblx0XCJvcmFuZ2VyZWRcIjogWzI1NSwgNjksIDBdLFxyXG5cdFwib3JjaGlkXCI6IFsyMTgsIDExMiwgMjE0XSxcclxuXHRcInBhbGVnb2xkZW5yb2RcIjogWzIzOCwgMjMyLCAxNzBdLFxyXG5cdFwicGFsZWdyZWVuXCI6IFsxNTIsIDI1MSwgMTUyXSxcclxuXHRcInBhbGV0dXJxdW9pc2VcIjogWzE3NSwgMjM4LCAyMzhdLFxyXG5cdFwicGFsZXZpb2xldHJlZFwiOiBbMjE5LCAxMTIsIDE0N10sXHJcblx0XCJwYXBheWF3aGlwXCI6IFsyNTUsIDIzOSwgMjEzXSxcclxuXHRcInBlYWNocHVmZlwiOiBbMjU1LCAyMTgsIDE4NV0sXHJcblx0XCJwZXJ1XCI6IFsyMDUsIDEzMywgNjNdLFxyXG5cdFwicGlua1wiOiBbMjU1LCAxOTIsIDIwM10sXHJcblx0XCJwbHVtXCI6IFsyMjEsIDE2MCwgMjIxXSxcclxuXHRcInBvd2RlcmJsdWVcIjogWzE3NiwgMjI0LCAyMzBdLFxyXG5cdFwicHVycGxlXCI6IFsxMjgsIDAsIDEyOF0sXHJcblx0XCJyZWJlY2NhcHVycGxlXCI6IFsxMDIsIDUxLCAxNTNdLFxyXG5cdFwicmVkXCI6IFsyNTUsIDAsIDBdLFxyXG5cdFwicm9zeWJyb3duXCI6IFsxODgsIDE0MywgMTQzXSxcclxuXHRcInJveWFsYmx1ZVwiOiBbNjUsIDEwNSwgMjI1XSxcclxuXHRcInNhZGRsZWJyb3duXCI6IFsxMzksIDY5LCAxOV0sXHJcblx0XCJzYWxtb25cIjogWzI1MCwgMTI4LCAxMTRdLFxyXG5cdFwic2FuZHlicm93blwiOiBbMjQ0LCAxNjQsIDk2XSxcclxuXHRcInNlYWdyZWVuXCI6IFs0NiwgMTM5LCA4N10sXHJcblx0XCJzZWFzaGVsbFwiOiBbMjU1LCAyNDUsIDIzOF0sXHJcblx0XCJzaWVubmFcIjogWzE2MCwgODIsIDQ1XSxcclxuXHRcInNpbHZlclwiOiBbMTkyLCAxOTIsIDE5Ml0sXHJcblx0XCJza3libHVlXCI6IFsxMzUsIDIwNiwgMjM1XSxcclxuXHRcInNsYXRlYmx1ZVwiOiBbMTA2LCA5MCwgMjA1XSxcclxuXHRcInNsYXRlZ3JheVwiOiBbMTEyLCAxMjgsIDE0NF0sXHJcblx0XCJzbGF0ZWdyZXlcIjogWzExMiwgMTI4LCAxNDRdLFxyXG5cdFwic25vd1wiOiBbMjU1LCAyNTAsIDI1MF0sXHJcblx0XCJzcHJpbmdncmVlblwiOiBbMCwgMjU1LCAxMjddLFxyXG5cdFwic3RlZWxibHVlXCI6IFs3MCwgMTMwLCAxODBdLFxyXG5cdFwidGFuXCI6IFsyMTAsIDE4MCwgMTQwXSxcclxuXHRcInRlYWxcIjogWzAsIDEyOCwgMTI4XSxcclxuXHRcInRoaXN0bGVcIjogWzIxNiwgMTkxLCAyMTZdLFxyXG5cdFwidG9tYXRvXCI6IFsyNTUsIDk5LCA3MV0sXHJcblx0XCJ0dXJxdW9pc2VcIjogWzY0LCAyMjQsIDIwOF0sXHJcblx0XCJ2aW9sZXRcIjogWzIzOCwgMTMwLCAyMzhdLFxyXG5cdFwid2hlYXRcIjogWzI0NSwgMjIyLCAxNzldLFxyXG5cdFwid2hpdGVcIjogWzI1NSwgMjU1LCAyNTVdLFxyXG5cdFwid2hpdGVzbW9rZVwiOiBbMjQ1LCAyNDUsIDI0NV0sXHJcblx0XCJ5ZWxsb3dcIjogWzI1NSwgMjU1LCAwXSxcclxuXHRcInllbGxvd2dyZWVuXCI6IFsxNTQsIDIwNSwgNTBdXHJcbn0iLCJ2YXIgY29udmVydCA9IHJlcXVpcmUoJ2NvbG9yLWNvbnZlcnQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3N0cikge1xuICAgIHZhciBtLCBjb252LCBwYXJ0cywgYWxwaGE7XG4gICAgaWYgKG0gPSAvXigoPzpyZ2J8aHNbbHZdfGNteWt8eHl6fGxhYilhPylcXHMqXFwoKFteXFwpXSopXFwpLy5leGVjKGNzdHIpKSB7XG4gICAgICAgIHZhciBuYW1lID0gbVsxXTtcbiAgICAgICAgdmFyIGJhc2UgPSBuYW1lLnJlcGxhY2UoL2EkLywgJycpO1xuICAgICAgICB2YXIgc2l6ZSA9IGJhc2UgPT09ICdjbXlrJyA/IDQgOiAzO1xuICAgICAgICBjb252ID0gY29udmVydFtiYXNlXTtcbiAgICAgICAgXG4gICAgICAgIHBhcnRzID0gbVsyXS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbiAgICAgICAgICAgIC5zcGxpdCgvXFxzKixcXHMqLylcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKHgsIGkpIHtcbiAgICAgICAgICAgICAgICBpZiAoLyUkLy50ZXN0KHgpICYmIGkgPT09IHNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoeCkgLyAxMDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKC8lJC8udGVzdCh4KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoeCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICA7XG4gICAgICAgIGlmIChuYW1lID09PSBiYXNlKSBwYXJ0cy5wdXNoKDEpO1xuICAgICAgICBhbHBoYSA9IHBhcnRzW3NpemVdID09PSB1bmRlZmluZWQgPyAxIDogcGFydHNbc2l6ZV07XG4gICAgICAgIHBhcnRzID0gcGFydHMuc2xpY2UoMCwgc2l6ZSk7XG4gICAgICAgIFxuICAgICAgICBjb252W2Jhc2VdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gcGFydHMgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoL14jW0EtRmEtZjAtOV0rJC8udGVzdChjc3RyKSkge1xuICAgICAgICB2YXIgYmFzZSA9IGNzdHIucmVwbGFjZSgvXiMvLCcnKTtcbiAgICAgICAgdmFyIHNpemUgPSBiYXNlLmxlbmd0aDtcbiAgICAgICAgY29udiA9IGNvbnZlcnQucmdiO1xuICAgICAgICBwYXJ0cyA9IGJhc2Uuc3BsaXQoc2l6ZSA9PT0gMyA/IC8oLikvIDogLyguLikvKTtcbiAgICAgICAgcGFydHMgPSBwYXJ0cy5maWx0ZXIoQm9vbGVhbilcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2l6ZSA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQoeCArIHgsIDE2KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludCh4LCAxNilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICA7XG4gICAgICAgIGFscGhhID0gMTtcbiAgICAgICAgY29udi5yZ2IgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBwYXJ0cyB9O1xuICAgICAgICBpZiAoIXBhcnRzWzBdKSBwYXJ0c1swXSA9IDA7XG4gICAgICAgIGlmICghcGFydHNbMV0pIHBhcnRzWzFdID0gMDtcbiAgICAgICAgaWYgKCFwYXJ0c1syXSkgcGFydHNbMl0gPSAwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29udiA9IGNvbnZlcnQua2V5d29yZDtcbiAgICAgICAgY29udi5rZXl3b3JkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gY3N0ciB9O1xuICAgICAgICBwYXJ0cyA9IGNzdHI7XG4gICAgICAgIGFscGhhID0gMTtcbiAgICB9XG4gICAgXG4gICAgdmFyIHJlcyA9IHtcbiAgICAgICAgcmdiOiB1bmRlZmluZWQsXG4gICAgICAgIGhzbDogdW5kZWZpbmVkLFxuICAgICAgICBoc3Y6IHVuZGVmaW5lZCxcbiAgICAgICAgY215azogdW5kZWZpbmVkLFxuICAgICAgICBrZXl3b3JkOiB1bmRlZmluZWQsXG4gICAgICAgIGhleDogdW5kZWZpbmVkXG4gICAgfTtcbiAgICB0cnkgeyByZXMucmdiID0gY29udi5yZ2IocGFydHMpIH0gY2F0Y2ggKGUpIHt9XG4gICAgdHJ5IHsgcmVzLmhzbCA9IGNvbnYuaHNsKHBhcnRzKSB9IGNhdGNoIChlKSB7fVxuICAgIHRyeSB7IHJlcy5oc3YgPSBjb252LmhzdihwYXJ0cykgfSBjYXRjaCAoZSkge31cbiAgICB0cnkgeyByZXMuY215ayA9IGNvbnYuY215ayhwYXJ0cykgfSBjYXRjaCAoZSkge31cbiAgICB0cnkgeyByZXMua2V5d29yZCA9IGNvbnYua2V5d29yZChwYXJ0cykgfSBjYXRjaCAoZSkge31cbiAgICBcbiAgICBpZiAocmVzLnJnYikgcmVzLmhleCA9ICcjJyArIHJlcy5yZ2IubWFwKGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHZhciBzID0geC50b1N0cmluZygxNik7XG4gICAgICAgIGlmIChzLmxlbmd0aCA9PT0gMSkgcmV0dXJuICcwJyArIHM7XG4gICAgICAgIHJldHVybiBzO1xuICAgIH0pLmpvaW4oJycpO1xuICAgIFxuICAgIGlmIChyZXMucmdiKSByZXMucmdiYSA9IHJlcy5yZ2IuY29uY2F0KGFscGhhKTtcbiAgICBpZiAocmVzLmhzbCkgcmVzLmhzbGEgPSByZXMuaHNsLmNvbmNhdChhbHBoYSk7XG4gICAgaWYgKHJlcy5oc3YpIHJlcy5oc3ZhID0gcmVzLmhzdi5jb25jYXQoYWxwaGEpO1xuICAgIGlmIChyZXMuY215aykgcmVzLmNteWthID0gcmVzLmNteWsuY29uY2F0KGFscGhhKTtcbiAgICBcbiAgICByZXR1cm4gcmVzO1xufTtcbiIsInZhciBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcbnZhciBwb2ludGVyID0gcmVxdWlyZShcImpzb24tcG9pbnRlclwiKTtcbnZhciBsZXZlbnNodGVpbiA9IHJlcXVpcmUoXCIuL2xldmVuc2h0ZWluXCIpO1xuXG4vKipcbiAqIEJhY2t0cmFjZSBhbiBvcHRpbWFsIHBhdGggdGhyb3VnaCBhIGxldmVuc2h0ZWluIGRpc3RhbmNlIG1hdHJpeC5cbiAqXG4gKiBAcmV0dXJucyB7QXJyYXl9IExpc3Qgb2Ygb3BlcmF0aW9uc1xuICovXG5mdW5jdGlvbiBtYXRyaXhUb09wZXJhdGlvbnMgKG1hdHJpeCwgaSwgaikge1xuICBpZiAoaSA9PT0gMCAmJiBqID09PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9IGVsc2UgaWYgKGkgPT09IDApIHtcbiAgICByZXR1cm4gbWF0cml4VG9PcGVyYXRpb25zKG1hdHJpeCwgaSwgaiAtIDEpLmNvbmNhdChcImFkZFwiKTtcbiAgfSBlbHNlIGlmIChqID09PSAwKSB7XG4gICAgcmV0dXJuIG1hdHJpeFRvT3BlcmF0aW9ucyhtYXRyaXgsIGkgLSAxLCBqKS5jb25jYXQoXCJyZW1vdmVcIik7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlZnQgPSBtYXRyaXhbaV1baiAtIDFdO1xuICAgIHZhciB1cCA9IG1hdHJpeFtpIC0gMV1bal07XG4gICAgdmFyIHVwbGVmdCA9IG1hdHJpeFtpIC0gMV1baiAtIDFdO1xuXG4gICAgaWYgKHVwbGVmdCA8PSB1cCAmJiB1cGxlZnQgPD0gbGVmdCkge1xuICAgICAgaWYgKHVwbGVmdCA9PT0gbWF0cml4W2ldW2pdKSB7XG4gICAgICAgIHJldHVybiBtYXRyaXhUb09wZXJhdGlvbnMobWF0cml4LCBpIC0gMSwgaiAtIDEpLmNvbmNhdChcImVxXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG1hdHJpeFRvT3BlcmF0aW9ucyhtYXRyaXgsIGkgLSAxLCBqIC0gMSkuY29uY2F0KFwicmVwbGFjZVwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGxlZnQgPD0gdXBsZWZ0ICYmIGxlZnQgPD0gdXApIHtcbiAgICAgIHJldHVybiBtYXRyaXhUb09wZXJhdGlvbnMobWF0cml4LCBpLCBqIC0gMSkuY29uY2F0KFwiYWRkXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWF0cml4VG9PcGVyYXRpb25zKG1hdHJpeCwgaSAtIDEsIGopLmNvbmNhdChcInJlbW92ZVwiKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZGlmZiAoZnJvbSwgdG8pIHtcbiAgdmFyIG9wcyA9IFtdO1xuXG4gIGlmIChfLmlzRXF1YWwoZnJvbSwgdG8pKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9IGVsc2UgaWYgKF8uaXNQbGFpbk9iamVjdChmcm9tKSAmJiBfLmlzUGxhaW5PYmplY3QodG8pKSB7XG4gICAgdmFyIGtleXMgPSBfLnVuaW9uKF8ua2V5cyhmcm9tKSwgXy5rZXlzKHRvKSk7XG5cbiAgICBvcHMgPSBrZXlzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICB2YXIgaGFzRnJvbSA9IGZyb20uaGFzT3duUHJvcGVydHkoa2V5KTtcbiAgICAgIHZhciBoYXNUbyA9IHRvLmhhc093blByb3BlcnR5KGtleSk7XG5cbiAgICAgIGlmIChoYXNGcm9tICYmIGhhc1RvKSB7XG4gICAgICAgIHZhciBkID0gZGlmZihmcm9tW2tleV0sIHRvW2tleV0pO1xuXG4gICAgICAgIHJldHVybiBkLm1hcChmdW5jdGlvbiAob3ApIHtcbiAgICAgICAgICBvcC5wYXRoLnVuc2hpZnQoa2V5KTtcblxuICAgICAgICAgIHJldHVybiBvcDtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKGhhc0Zyb20pIHtcbiAgICAgICAgcmV0dXJuIHsgb3A6IFwicmVtb3ZlXCIsIHBhdGg6IFtrZXldIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4geyBvcDogXCJhZGRcIiwgcGF0aDogW2tleV0sIHZhbHVlOiB0b1trZXldIH07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gXy5mbGF0dGVuKG9wcywgdHJ1ZSk7XG4gIH0gZWxzZSBpZiAoXy5pc0FycmF5KGZyb20pICYmIF8uaXNBcnJheSh0bykpIHtcbiAgICB2YXIgbWF0cml4ID0gbGV2ZW5zaHRlaW4oZnJvbSwgdG8pO1xuICAgIG9wcyA9IFtdO1xuXG4gICAgaWYgKG1hdHJpeCkge1xuICAgICAgdmFyIG0gPSBtYXRyaXgubGVuZ3RoO1xuICAgICAgdmFyIG4gPSBtYXRyaXhbMF0ubGVuZ3RoO1xuICAgICAgdmFyIGkgPSAwO1xuICAgICAgdmFyIGogPSAwO1xuICAgICAgdmFyIG8gPSBtYXRyaXhUb09wZXJhdGlvbnMobWF0cml4LCBtIC0gMSwgbiAtIDEpO1xuXG4gICAgICBvLmZvckVhY2goZnVuY3Rpb24gKG9wKSB7XG4gICAgICAgIGlmIChvcCA9PSBcImFkZFwiKSB7XG4gICAgICAgICAgb3BzLnB1c2goeyBvcDogXCJhZGRcIiwgcGF0aDogW2pdLCB2YWx1ZTogdG9bal0gfSk7XG4gICAgICAgICAgaisrO1xuICAgICAgICB9IGVsc2UgaWYgKG9wID09IFwicmVtb3ZlXCIpIHtcbiAgICAgICAgICBvcHMucHVzaCh7IG9wOiBcInJlbW92ZVwiLCBwYXRoOiBbal0gfSk7XG4gICAgICAgICAgaSsrO1xuICAgICAgICB9IGVsc2UgaWYgKG9wID09IFwicmVwbGFjZVwiKSB7XG4gICAgICAgICAgdmFyIG9wZXJhdGlvbnMgPSBkaWZmKGZyb21baV0sIHRvW2pdKTtcblxuICAgICAgICAgIG9wcyA9IG9wcy5jb25jYXQob3BlcmF0aW9ucy5tYXAoZnVuY3Rpb24gKG9wKSB7XG4gICAgICAgICAgICBvcC5wYXRoLnVuc2hpZnQoaik7XG5cbiAgICAgICAgICAgIHJldHVybiBvcDtcbiAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICBpKys7XG4gICAgICAgICAgaisrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGkrKztcbiAgICAgICAgICBqKys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBvcHM7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFt7IG9wOiBcInJlcGxhY2VcIiwgcGF0aDogW10sIHZhbHVlOiB0byB9XTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmcm9tLCB0bykge1xuICB2YXIgb3BzID0gZGlmZihmcm9tLCB0byk7XG4gIG9wcyA9IF8ubWFwKG9wcywgZnVuY3Rpb24gKG9wKSB7XG4gICAgb3AucGF0aCA9IHBvaW50ZXIuY29tcGlsZShvcC5wYXRoLm1hcChmdW5jdGlvbiAocCkgeyByZXR1cm4gXCJcIiArIHA7IH0pKTtcblxuICAgIHJldHVybiBvcDtcbiAgfSk7XG5cbiAgcmV0dXJuIG9wcztcbn07XG4iLCJ2YXIgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5cbi8vIENvbXB1dGUgdGhlIGxldmVuc2h0ZWluIGVkaXQgZGlzdGFuY2UgbWF0cml4IGZvciB0d28gbGlzdHMuXG4vL1xuLy8gSXQgY2FuIGJlIHVzZWQgdG8gaW5mZXIgdGhlIGNvbmNyZXRlIGVkaXQgb3BlcmF0aW9ucyB0byB0cmFuc2Zvcm0gdGhlIGZpcnN0XG4vLyBsaXN0IGludG8gdGhlIHNlY29uZC5cbi8vXG4vLyBSZXR1cm5zIGFuIG0qbiBtYXRyaXgsIHdoZXJlIHRoZSAoaSwgaikgY2VsbCBjb250YWlucyB0aGUgbGV2ZW5zaHRlaW5cbi8vIGRpc3RhbmNlIGJldHdlZW4gdGhlIGktZWxlbWVudCBwcmVmaXggb2YgZnJvbSBhbmQgdGhlIGotZWxlbWVudCBwcmVmaXggb2YgdG8uXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmcm9tLCB0bykge1xuICBpZiAoXy5pc0VxdWFsKGZyb20sIHRvKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIG0gPSBmcm9tLmxlbmd0aDtcbiAgdmFyIG4gPSB0by5sZW5ndGg7XG4gIHZhciBkID0gXy5yYW5nZSgwLCBtICsgMSkubWFwKGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuIFt4XTtcbiAgfSk7XG5cbiAgZFswXSA9IF8ucmFuZ2UoMCwgbiArIDEpO1xuXG4gIGZvciAodmFyIGkgPSAxOyBpIDw9IG07IGkrKykge1xuICAgIGZvciAodmFyIGogPSAxOyBqIDw9IG47IGorKykge1xuICAgICAgdmFyIHJlcGxhY2VtZW50Q29zdCA9IDE7XG5cbiAgICAgIGlmIChfLmlzRXF1YWwoZnJvbVtpIC0gMV0sIHRvW2ogLSAxXSkpIHtcbiAgICAgICAgcmVwbGFjZW1lbnRDb3N0ID0gMDtcbiAgICAgIH1cblxuICAgICAgZFtpXVtqXSA9IF8ubWluKFtkW2kgLSAxXVtqIC0gMV0gKyByZXBsYWNlbWVudENvc3QsXG4gICAgICAgICAgICAgICAgICAgICAgIGRbaSAtIDFdW2pdICsgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgZFtpXVtqIC0gMV0gKyAxXSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZWFjaCA9IHJlcXVpcmUoJ2ZvcmVhY2gnKTtcbm1vZHVsZS5leHBvcnRzID0gYXBpO1xuXG5cbi8qKlxuICogQ29udmVuaWVuY2Ugd3JhcHBlciBhcm91bmQgdGhlIGFwaS5cbiAqIENhbGxzIGAuZ2V0YCB3aGVuIGNhbGxlZCB3aXRoIGFuIGBvYmplY3RgIGFuZCBhIGBwb2ludGVyYC5cbiAqIENhbGxzIGAuc2V0YCB3aGVuIGFsc28gY2FsbGVkIHdpdGggYHZhbHVlYC5cbiAqIElmIG9ubHkgc3VwcGxpZWQgYG9iamVjdGAsIHJldHVybnMgYSBwYXJ0aWFsbHkgYXBwbGllZCBmdW5jdGlvbiwgbWFwcGVkIHRvIHRoZSBvYmplY3QuXG4gKlxuICogQHBhcmFtIG9ialxuICogQHBhcmFtIHBvaW50ZXJcbiAqIEBwYXJhbSB2YWx1ZVxuICogQHJldHVybnMgeyp9XG4gKi9cblxuZnVuY3Rpb24gYXBpIChvYmosIHBvaW50ZXIsIHZhbHVlKSB7XG4gICAgLy8gLnNldCgpXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgcmV0dXJuIGFwaS5zZXQob2JqLCBwb2ludGVyLCB2YWx1ZSk7XG4gICAgfVxuICAgIC8vIC5nZXQoKVxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIHJldHVybiBhcGkuZ2V0KG9iaiwgcG9pbnRlcik7XG4gICAgfVxuICAgIC8vIFJldHVybiBhIHBhcnRpYWxseSBhcHBsaWVkIGZ1bmN0aW9uIG9uIGBvYmpgLlxuICAgIHZhciB3cmFwcGVkID0gYXBpLmJpbmQoYXBpLCBvYmopO1xuXG4gICAgLy8gU3VwcG9ydCBmb3Igb28gc3R5bGVcbiAgICBmb3IgKHZhciBuYW1lIGluIGFwaSkge1xuICAgICAgICBpZiAoYXBpLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICB3cmFwcGVkW25hbWVdID0gYXBpW25hbWVdLmJpbmQod3JhcHBlZCwgb2JqKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gd3JhcHBlZDtcbn1cblxuXG4vKipcbiAqIExvb2t1cCBhIGpzb24gcG9pbnRlciBpbiBhbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0gb2JqXG4gKiBAcGFyYW0gcG9pbnRlclxuICogQHJldHVybnMgeyp9XG4gKi9cbmFwaS5nZXQgPSBmdW5jdGlvbiBnZXQgKG9iaiwgcG9pbnRlcikge1xuICAgIHZhciB0b2ssXG4gICAgICAgIHJlZlRva2VucyA9IGFwaS5wYXJzZShwb2ludGVyKTtcbiAgICB3aGlsZSAocmVmVG9rZW5zLmxlbmd0aCkge1xuICAgICAgICB0b2sgPSByZWZUb2tlbnMuc2hpZnQoKTtcbiAgICAgICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkodG9rKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHJlZmVyZW5jZSB0b2tlbjogJyArIHRvayk7XG4gICAgICAgIH1cbiAgICAgICAgb2JqID0gb2JqW3Rva107XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG59O1xuXG4vKipcbiAqIFNldHMgYSB2YWx1ZSBvbiBhbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0gb2JqXG4gKiBAcGFyYW0gcG9pbnRlclxuICogQHBhcmFtIHZhbHVlXG4gKi9cbmFwaS5zZXQgPSBmdW5jdGlvbiBzZXQgKG9iaiwgcG9pbnRlciwgdmFsdWUpIHtcbiAgICB2YXIgcmVmVG9rZW5zID0gYXBpLnBhcnNlKHBvaW50ZXIpLFxuICAgICAgICB0b2ssXG4gICAgICAgIG5leHRUb2sgPSByZWZUb2tlbnNbMF07XG4gICAgd2hpbGUgKHJlZlRva2Vucy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRvayA9IHJlZlRva2Vucy5zaGlmdCgpO1xuICAgICAgICBuZXh0VG9rID0gcmVmVG9rZW5zWzBdO1xuXG4gICAgICAgIGlmICghb2JqLmhhc093blByb3BlcnR5KHRvaykpIHtcbiAgICAgICAgICAgIGlmIChuZXh0VG9rLm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgICAgICAgICAgIG9ialt0b2tdID0gW107XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9ialt0b2tdID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgb2JqID0gb2JqW3Rva107XG4gICAgfVxuICAgIG9ialtuZXh0VG9rXSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIGFuIGF0dHJpYnV0ZVxuICpcbiAqIEBwYXJhbSBvYmpcbiAqIEBwYXJhbSBwb2ludGVyXG4gKi9cbmFwaS5yZW1vdmUgPSBmdW5jdGlvbiAob2JqLCBwb2ludGVyKSB7XG4gICAgdmFyIHJlZlRva2VucyA9IGFwaS5wYXJzZShwb2ludGVyKTtcbiAgICB2YXIgZmluYWxUb2tlbiA9IHJlZlRva2Vucy5wb3AoKTtcbiAgICBpZiAoZmluYWxUb2tlbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBKU09OIHBvaW50ZXIgZm9yIHJlbW92ZTogXCInICsgcG9pbnRlciArICdcIicpO1xuICAgIH1cbiAgICBkZWxldGUgYXBpLmdldChvYmosIGFwaS5jb21waWxlKHJlZlRva2VucykpW2ZpbmFsVG9rZW5dO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgKHBvaW50ZXIgLT4gdmFsdWUpIGRpY3Rpb25hcnkgZm9yIGFuIG9iamVjdFxuICpcbiAqIEBwYXJhbSBvYmpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGRlc2NlbmRcbiAqIEByZXR1cm5zIHt9XG4gKi9cbmFwaS5kaWN0ID0gZnVuY3Rpb24gZGljdCAob2JqLCBkZXNjZW5kKSB7XG4gICAgdmFyIHJlc3VsdHMgPSB7fTtcbiAgICBhcGkud2FsayhvYmosIGZ1bmN0aW9uICh2YWx1ZSwgcG9pbnRlcikge1xuICAgICAgICByZXN1bHRzW3BvaW50ZXJdID0gdmFsdWU7XG4gICAgfSwgZGVzY2VuZCk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG59O1xuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgYW4gb2JqZWN0XG4gKiBJdGVyYXRvcjogZnVuY3Rpb24gKHZhbHVlLCBwb2ludGVyKSB7fVxuICpcbiAqIEBwYXJhbSBvYmpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGl0ZXJhdG9yXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBkZXNjZW5kXG4gKi9cbmFwaS53YWxrID0gZnVuY3Rpb24gd2FsayAob2JqLCBpdGVyYXRvciwgZGVzY2VuZCkge1xuICAgIHZhciByZWZUb2tlbnMgPSBbXTtcblxuICAgIGRlc2NlbmQgPSBkZXNjZW5kIHx8IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgdHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiB0eXBlID09PSAnW29iamVjdCBPYmplY3RdJyB8fCB0eXBlID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH07XG5cbiAgICAoZnVuY3Rpb24gbmV4dCAoY3VyKSB7XG4gICAgICAgIGVhY2goY3VyLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgcmVmVG9rZW5zLnB1c2goU3RyaW5nKGtleSkpO1xuICAgICAgICAgICAgaWYgKGRlc2NlbmQodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgbmV4dCh2YWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKHZhbHVlLCBhcGkuY29tcGlsZShyZWZUb2tlbnMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlZlRva2Vucy5wb3AoKTtcbiAgICAgICAgfSk7XG4gICAgfShvYmopKTtcbn07XG5cbi8qKlxuICogVGVzdHMgaWYgYW4gb2JqZWN0IGhhcyBhIHZhbHVlIGZvciBhIGpzb24gcG9pbnRlclxuICpcbiAqIEBwYXJhbSBvYmpcbiAqIEBwYXJhbSBwb2ludGVyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuYXBpLmhhcyA9IGZ1bmN0aW9uIGhhcyAob2JqLCBwb2ludGVyKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgYXBpLmdldChvYmosIHBvaW50ZXIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogRXNjYXBlcyBhIHJlZmVyZW5jZSB0b2tlblxuICpcbiAqIEBwYXJhbSBzdHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmFwaS5lc2NhcGUgPSBmdW5jdGlvbiBlc2NhcGUgKHN0cikge1xuICAgIHJldHVybiBzdHIudG9TdHJpbmcoKS5yZXBsYWNlKC9+L2csICd+MCcpLnJlcGxhY2UoL1xcLy9nLCAnfjEnKTtcbn07XG5cbi8qKlxuICogVW5lc2NhcGVzIGEgcmVmZXJlbmNlIHRva2VuXG4gKlxuICogQHBhcmFtIHN0clxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuYXBpLnVuZXNjYXBlID0gZnVuY3Rpb24gdW5lc2NhcGUgKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvfjEvZywgJy8nKS5yZXBsYWNlKC9+MC9nLCAnficpO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0cyBhIGpzb24gcG9pbnRlciBpbnRvIGEgYXJyYXkgb2YgcmVmZXJlbmNlIHRva2Vuc1xuICpcbiAqIEBwYXJhbSBwb2ludGVyXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKi9cbmFwaS5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlIChwb2ludGVyKSB7XG4gICAgaWYgKHBvaW50ZXIgPT09ICcnKSB7IHJldHVybiBbXTsgfVxuICAgIGlmIChwb2ludGVyLmNoYXJBdCgwKSAhPT0gJy8nKSB7IHRocm93IG5ldyBFcnJvcignSW52YWxpZCBKU09OIHBvaW50ZXI6ICcgKyBwb2ludGVyKTsgfVxuICAgIHJldHVybiBwb2ludGVyLnN1YnN0cmluZygxKS5zcGxpdCgvXFwvLykubWFwKGFwaS51bmVzY2FwZSk7XG59O1xuXG4vKipcbiAqIEJ1aWxkcyBhIGpzb24gcG9pbnRlciBmcm9tIGEgYXJyYXkgb2YgcmVmZXJlbmNlIHRva2Vuc1xuICpcbiAqIEBwYXJhbSByZWZUb2tlbnNcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmFwaS5jb21waWxlID0gZnVuY3Rpb24gY29tcGlsZSAocmVmVG9rZW5zKSB7XG4gICAgaWYgKHJlZlRva2Vucy5sZW5ndGggPT09IDApIHsgcmV0dXJuICcnOyB9XG4gICAgcmV0dXJuICcvJyArIHJlZlRva2Vucy5tYXAoYXBpLmVzY2FwZSkuam9pbignLycpO1xufTtcbiIsIlxudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZvckVhY2ggKG9iaiwgZm4sIGN0eCkge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKGZuKSAhPT0gJ1tvYmplY3QgRnVuY3Rpb25dJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpdGVyYXRvciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICB9XG4gICAgdmFyIGwgPSBvYmoubGVuZ3RoO1xuICAgIGlmIChsID09PSArbCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgZm4uY2FsbChjdHgsIG9ialtpXSwgaSwgb2JqKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwob2JqLCBrKSkge1xuICAgICAgICAgICAgICAgIGZuLmNhbGwoY3R4LCBvYmpba10sIGssIG9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4iLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBMby1EYXNoIDIuNC4yIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kZXJuIC1vIC4vZGlzdC9sb2Rhc2guanNgXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cHM6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbjsoZnVuY3Rpb24oKSB7XG5cbiAgLyoqIFVzZWQgYXMgYSBzYWZlIHJlZmVyZW5jZSBmb3IgYHVuZGVmaW5lZGAgaW4gcHJlIEVTNSBlbnZpcm9ubWVudHMgKi9cbiAgdmFyIHVuZGVmaW5lZDtcblxuICAvKiogVXNlZCB0byBwb29sIGFycmF5cyBhbmQgb2JqZWN0cyB1c2VkIGludGVybmFsbHkgKi9cbiAgdmFyIGFycmF5UG9vbCA9IFtdLFxuICAgICAgb2JqZWN0UG9vbCA9IFtdO1xuXG4gIC8qKiBVc2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRHMgKi9cbiAgdmFyIGlkQ291bnRlciA9IDA7XG5cbiAgLyoqIFVzZWQgdG8gcHJlZml4IGtleXMgdG8gYXZvaWQgaXNzdWVzIHdpdGggYF9fcHJvdG9fX2AgYW5kIHByb3BlcnRpZXMgb24gYE9iamVjdC5wcm90b3R5cGVgICovXG4gIHZhciBrZXlQcmVmaXggPSArbmV3IERhdGUgKyAnJztcblxuICAvKiogVXNlZCBhcyB0aGUgc2l6ZSB3aGVuIG9wdGltaXphdGlvbnMgYXJlIGVuYWJsZWQgZm9yIGxhcmdlIGFycmF5cyAqL1xuICB2YXIgbGFyZ2VBcnJheVNpemUgPSA3NTtcblxuICAvKiogVXNlZCBhcyB0aGUgbWF4IHNpemUgb2YgdGhlIGBhcnJheVBvb2xgIGFuZCBgb2JqZWN0UG9vbGAgKi9cbiAgdmFyIG1heFBvb2xTaXplID0gNDA7XG5cbiAgLyoqIFVzZWQgdG8gZGV0ZWN0IGFuZCB0ZXN0IHdoaXRlc3BhY2UgKi9cbiAgdmFyIHdoaXRlc3BhY2UgPSAoXG4gICAgLy8gd2hpdGVzcGFjZVxuICAgICcgXFx0XFx4MEJcXGZcXHhBMFxcdWZlZmYnICtcblxuICAgIC8vIGxpbmUgdGVybWluYXRvcnNcbiAgICAnXFxuXFxyXFx1MjAyOFxcdTIwMjknICtcblxuICAgIC8vIHVuaWNvZGUgY2F0ZWdvcnkgXCJac1wiIHNwYWNlIHNlcGFyYXRvcnNcbiAgICAnXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMmZcXHUyMDVmXFx1MzAwMCdcbiAgKTtcblxuICAvKiogVXNlZCB0byBtYXRjaCBlbXB0eSBzdHJpbmcgbGl0ZXJhbHMgaW4gY29tcGlsZWQgdGVtcGxhdGUgc291cmNlICovXG4gIHZhciByZUVtcHR5U3RyaW5nTGVhZGluZyA9IC9cXGJfX3AgXFwrPSAnJzsvZyxcbiAgICAgIHJlRW1wdHlTdHJpbmdNaWRkbGUgPSAvXFxiKF9fcCBcXCs9KSAnJyBcXCsvZyxcbiAgICAgIHJlRW1wdHlTdHJpbmdUcmFpbGluZyA9IC8oX19lXFwoLio/XFwpfFxcYl9fdFxcKSkgXFwrXFxuJyc7L2c7XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gbWF0Y2ggRVM2IHRlbXBsYXRlIGRlbGltaXRlcnNcbiAgICogaHR0cDovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtbGl0ZXJhbHMtc3RyaW5nLWxpdGVyYWxzXG4gICAqL1xuICB2YXIgcmVFc1RlbXBsYXRlID0gL1xcJFxceyhbXlxcXFx9XSooPzpcXFxcLlteXFxcXH1dKikqKVxcfS9nO1xuXG4gIC8qKiBVc2VkIHRvIG1hdGNoIHJlZ2V4cCBmbGFncyBmcm9tIHRoZWlyIGNvZXJjZWQgc3RyaW5nIHZhbHVlcyAqL1xuICB2YXIgcmVGbGFncyA9IC9cXHcqJC87XG5cbiAgLyoqIFVzZWQgdG8gZGV0ZWN0ZWQgbmFtZWQgZnVuY3Rpb25zICovXG4gIHZhciByZUZ1bmNOYW1lID0gL15cXHMqZnVuY3Rpb25bIFxcblxcclxcdF0rXFx3LztcblxuICAvKiogVXNlZCB0byBtYXRjaCBcImludGVycG9sYXRlXCIgdGVtcGxhdGUgZGVsaW1pdGVycyAqL1xuICB2YXIgcmVJbnRlcnBvbGF0ZSA9IC88JT0oW1xcc1xcU10rPyklPi9nO1xuXG4gIC8qKiBVc2VkIHRvIG1hdGNoIGxlYWRpbmcgd2hpdGVzcGFjZSBhbmQgemVyb3MgdG8gYmUgcmVtb3ZlZCAqL1xuICB2YXIgcmVMZWFkaW5nU3BhY2VzQW5kWmVyb3MgPSBSZWdFeHAoJ15bJyArIHdoaXRlc3BhY2UgKyAnXSowKyg/PS4kKScpO1xuXG4gIC8qKiBVc2VkIHRvIGVuc3VyZSBjYXB0dXJpbmcgb3JkZXIgb2YgdGVtcGxhdGUgZGVsaW1pdGVycyAqL1xuICB2YXIgcmVOb01hdGNoID0gLygkXikvO1xuXG4gIC8qKiBVc2VkIHRvIGRldGVjdCBmdW5jdGlvbnMgY29udGFpbmluZyBhIGB0aGlzYCByZWZlcmVuY2UgKi9cbiAgdmFyIHJlVGhpcyA9IC9cXGJ0aGlzXFxiLztcblxuICAvKiogVXNlZCB0byBtYXRjaCB1bmVzY2FwZWQgY2hhcmFjdGVycyBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMgKi9cbiAgdmFyIHJlVW5lc2NhcGVkU3RyaW5nID0gL1snXFxuXFxyXFx0XFx1MjAyOFxcdTIwMjlcXFxcXS9nO1xuXG4gIC8qKiBVc2VkIHRvIGFzc2lnbiBkZWZhdWx0IGBjb250ZXh0YCBvYmplY3QgcHJvcGVydGllcyAqL1xuICB2YXIgY29udGV4dFByb3BzID0gW1xuICAgICdBcnJheScsICdCb29sZWFuJywgJ0RhdGUnLCAnRnVuY3Rpb24nLCAnTWF0aCcsICdOdW1iZXInLCAnT2JqZWN0JyxcbiAgICAnUmVnRXhwJywgJ1N0cmluZycsICdfJywgJ2F0dGFjaEV2ZW50JywgJ2NsZWFyVGltZW91dCcsICdpc0Zpbml0ZScsICdpc05hTicsXG4gICAgJ3BhcnNlSW50JywgJ3NldFRpbWVvdXQnXG4gIF07XG5cbiAgLyoqIFVzZWQgdG8gbWFrZSB0ZW1wbGF0ZSBzb3VyY2VVUkxzIGVhc2llciB0byBpZGVudGlmeSAqL1xuICB2YXIgdGVtcGxhdGVDb3VudGVyID0gMDtcblxuICAvKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHNob3J0Y3V0cyAqL1xuICB2YXIgYXJnc0NsYXNzID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgICBhcnJheUNsYXNzID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICAgIGJvb2xDbGFzcyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICAgIGRhdGVDbGFzcyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICAgIGZ1bmNDbGFzcyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgICBudW1iZXJDbGFzcyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgICAgb2JqZWN0Q2xhc3MgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICAgIHJlZ2V4cENsYXNzID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgICBzdHJpbmdDbGFzcyA9ICdbb2JqZWN0IFN0cmluZ10nO1xuXG4gIC8qKiBVc2VkIHRvIGlkZW50aWZ5IG9iamVjdCBjbGFzc2lmaWNhdGlvbnMgdGhhdCBgXy5jbG9uZWAgc3VwcG9ydHMgKi9cbiAgdmFyIGNsb25lYWJsZUNsYXNzZXMgPSB7fTtcbiAgY2xvbmVhYmxlQ2xhc3Nlc1tmdW5jQ2xhc3NdID0gZmFsc2U7XG4gIGNsb25lYWJsZUNsYXNzZXNbYXJnc0NsYXNzXSA9IGNsb25lYWJsZUNsYXNzZXNbYXJyYXlDbGFzc10gPVxuICBjbG9uZWFibGVDbGFzc2VzW2Jvb2xDbGFzc10gPSBjbG9uZWFibGVDbGFzc2VzW2RhdGVDbGFzc10gPVxuICBjbG9uZWFibGVDbGFzc2VzW251bWJlckNsYXNzXSA9IGNsb25lYWJsZUNsYXNzZXNbb2JqZWN0Q2xhc3NdID1cbiAgY2xvbmVhYmxlQ2xhc3Nlc1tyZWdleHBDbGFzc10gPSBjbG9uZWFibGVDbGFzc2VzW3N0cmluZ0NsYXNzXSA9IHRydWU7XG5cbiAgLyoqIFVzZWQgYXMgYW4gaW50ZXJuYWwgYF8uZGVib3VuY2VgIG9wdGlvbnMgb2JqZWN0ICovXG4gIHZhciBkZWJvdW5jZU9wdGlvbnMgPSB7XG4gICAgJ2xlYWRpbmcnOiBmYWxzZSxcbiAgICAnbWF4V2FpdCc6IDAsXG4gICAgJ3RyYWlsaW5nJzogZmFsc2VcbiAgfTtcblxuICAvKiogVXNlZCBhcyB0aGUgcHJvcGVydHkgZGVzY3JpcHRvciBmb3IgYF9fYmluZERhdGFfX2AgKi9cbiAgdmFyIGRlc2NyaXB0b3IgPSB7XG4gICAgJ2NvbmZpZ3VyYWJsZSc6IGZhbHNlLFxuICAgICdlbnVtZXJhYmxlJzogZmFsc2UsXG4gICAgJ3ZhbHVlJzogbnVsbCxcbiAgICAnd3JpdGFibGUnOiBmYWxzZVxuICB9O1xuXG4gIC8qKiBVc2VkIHRvIGRldGVybWluZSBpZiB2YWx1ZXMgYXJlIG9mIHRoZSBsYW5ndWFnZSB0eXBlIE9iamVjdCAqL1xuICB2YXIgb2JqZWN0VHlwZXMgPSB7XG4gICAgJ2Jvb2xlYW4nOiBmYWxzZSxcbiAgICAnZnVuY3Rpb24nOiB0cnVlLFxuICAgICdvYmplY3QnOiB0cnVlLFxuICAgICdudW1iZXInOiBmYWxzZSxcbiAgICAnc3RyaW5nJzogZmFsc2UsXG4gICAgJ3VuZGVmaW5lZCc6IGZhbHNlXG4gIH07XG5cbiAgLyoqIFVzZWQgdG8gZXNjYXBlIGNoYXJhY3RlcnMgZm9yIGluY2x1c2lvbiBpbiBjb21waWxlZCBzdHJpbmcgbGl0ZXJhbHMgKi9cbiAgdmFyIHN0cmluZ0VzY2FwZXMgPSB7XG4gICAgJ1xcXFwnOiAnXFxcXCcsXG4gICAgXCInXCI6IFwiJ1wiLFxuICAgICdcXG4nOiAnbicsXG4gICAgJ1xccic6ICdyJyxcbiAgICAnXFx0JzogJ3QnLFxuICAgICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgICAnXFx1MjAyOSc6ICd1MjAyOSdcbiAgfTtcblxuICAvKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdCAqL1xuICB2YXIgcm9vdCA9IChvYmplY3RUeXBlc1t0eXBlb2Ygd2luZG93XSAmJiB3aW5kb3cpIHx8IHRoaXM7XG5cbiAgLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYCAqL1xuICB2YXIgZnJlZUV4cG9ydHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgZXhwb3J0c10gJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4gIC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYCAqL1xuICB2YXIgZnJlZU1vZHVsZSA9IG9iamVjdFR5cGVzW3R5cGVvZiBtb2R1bGVdICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuICAvKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgICovXG4gIHZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzICYmIGZyZWVFeHBvcnRzO1xuXG4gIC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMgb3IgQnJvd3NlcmlmaWVkIGNvZGUgYW5kIHVzZSBpdCBhcyBgcm9vdGAgKi9cbiAgdmFyIGZyZWVHbG9iYWwgPSBvYmplY3RUeXBlc1t0eXBlb2YgZ2xvYmFsXSAmJiBnbG9iYWw7XG4gIGlmIChmcmVlR2xvYmFsICYmIChmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCkpIHtcbiAgICByb290ID0gZnJlZUdsb2JhbDtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pbmRleE9mYCB3aXRob3V0IHN1cHBvcnQgZm9yIGJpbmFyeSBzZWFyY2hlc1xuICAgKiBvciBgZnJvbUluZGV4YCBjb25zdHJhaW50cy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHNlYXJjaC5cbiAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2VhcmNoIGZvci5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtmcm9tSW5kZXg9MF0gVGhlIGluZGV4IHRvIHNlYXJjaCBmcm9tLlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCB2YWx1ZSBvciBgLTFgLlxuICAgKi9cbiAgZnVuY3Rpb24gYmFzZUluZGV4T2YoYXJyYXksIHZhbHVlLCBmcm9tSW5kZXgpIHtcbiAgICB2YXIgaW5kZXggPSAoZnJvbUluZGV4IHx8IDApIC0gMSxcbiAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuXG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIGlmIChhcnJheVtpbmRleF0gPT09IHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGltcGxlbWVudGF0aW9uIG9mIGBfLmNvbnRhaW5zYCBmb3IgY2FjaGUgb2JqZWN0cyB0aGF0IG1pbWljcyB0aGUgcmV0dXJuXG4gICAqIHNpZ25hdHVyZSBvZiBgXy5pbmRleE9mYCBieSByZXR1cm5pbmcgYDBgIGlmIHRoZSB2YWx1ZSBpcyBmb3VuZCwgZWxzZSBgLTFgLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gY2FjaGUgVGhlIGNhY2hlIG9iamVjdCB0byBpbnNwZWN0LlxuICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZWFyY2ggZm9yLlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIGAwYCBpZiBgdmFsdWVgIGlzIGZvdW5kLCBlbHNlIGAtMWAuXG4gICAqL1xuICBmdW5jdGlvbiBjYWNoZUluZGV4T2YoY2FjaGUsIHZhbHVlKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gICAgY2FjaGUgPSBjYWNoZS5jYWNoZTtcblxuICAgIGlmICh0eXBlID09ICdib29sZWFuJyB8fCB2YWx1ZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gY2FjaGVbdmFsdWVdID8gMCA6IC0xO1xuICAgIH1cbiAgICBpZiAodHlwZSAhPSAnbnVtYmVyJyAmJiB0eXBlICE9ICdzdHJpbmcnKSB7XG4gICAgICB0eXBlID0gJ29iamVjdCc7XG4gICAgfVxuICAgIHZhciBrZXkgPSB0eXBlID09ICdudW1iZXInID8gdmFsdWUgOiBrZXlQcmVmaXggKyB2YWx1ZTtcbiAgICBjYWNoZSA9IChjYWNoZSA9IGNhY2hlW3R5cGVdKSAmJiBjYWNoZVtrZXldO1xuXG4gICAgcmV0dXJuIHR5cGUgPT0gJ29iamVjdCdcbiAgICAgID8gKGNhY2hlICYmIGJhc2VJbmRleE9mKGNhY2hlLCB2YWx1ZSkgPiAtMSA/IDAgOiAtMSlcbiAgICAgIDogKGNhY2hlID8gMCA6IC0xKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgZ2l2ZW4gdmFsdWUgdG8gdGhlIGNvcnJlc3BvbmRpbmcgY2FjaGUgb2JqZWN0LlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhZGQgdG8gdGhlIGNhY2hlLlxuICAgKi9cbiAgZnVuY3Rpb24gY2FjaGVQdXNoKHZhbHVlKSB7XG4gICAgdmFyIGNhY2hlID0gdGhpcy5jYWNoZSxcbiAgICAgICAgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcblxuICAgIGlmICh0eXBlID09ICdib29sZWFuJyB8fCB2YWx1ZSA9PSBudWxsKSB7XG4gICAgICBjYWNoZVt2YWx1ZV0gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZSAhPSAnbnVtYmVyJyAmJiB0eXBlICE9ICdzdHJpbmcnKSB7XG4gICAgICAgIHR5cGUgPSAnb2JqZWN0JztcbiAgICAgIH1cbiAgICAgIHZhciBrZXkgPSB0eXBlID09ICdudW1iZXInID8gdmFsdWUgOiBrZXlQcmVmaXggKyB2YWx1ZSxcbiAgICAgICAgICB0eXBlQ2FjaGUgPSBjYWNoZVt0eXBlXSB8fCAoY2FjaGVbdHlwZV0gPSB7fSk7XG5cbiAgICAgIGlmICh0eXBlID09ICdvYmplY3QnKSB7XG4gICAgICAgICh0eXBlQ2FjaGVba2V5XSB8fCAodHlwZUNhY2hlW2tleV0gPSBbXSkpLnB1c2godmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHlwZUNhY2hlW2tleV0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGJ5IGBfLm1heGAgYW5kIGBfLm1pbmAgYXMgdGhlIGRlZmF1bHQgY2FsbGJhY2sgd2hlbiBhIGdpdmVuXG4gICAqIGNvbGxlY3Rpb24gaXMgYSBzdHJpbmcgdmFsdWUuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBUaGUgY2hhcmFjdGVyIHRvIGluc3BlY3QuXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGNvZGUgdW5pdCBvZiBnaXZlbiBjaGFyYWN0ZXIuXG4gICAqL1xuICBmdW5jdGlvbiBjaGFyQXRDYWxsYmFjayh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZS5jaGFyQ29kZUF0KDApO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgYnkgYHNvcnRCeWAgdG8gY29tcGFyZSB0cmFuc2Zvcm1lZCBgY29sbGVjdGlvbmAgZWxlbWVudHMsIHN0YWJsZSBzb3J0aW5nXG4gICAqIHRoZW0gaW4gYXNjZW5kaW5nIG9yZGVyLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGNvbXBhcmUgdG8gYGJgLlxuICAgKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvbXBhcmUgdG8gYGFgLlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBzb3J0IG9yZGVyIGluZGljYXRvciBvZiBgMWAgb3IgYC0xYC5cbiAgICovXG4gIGZ1bmN0aW9uIGNvbXBhcmVBc2NlbmRpbmcoYSwgYikge1xuICAgIHZhciBhYyA9IGEuY3JpdGVyaWEsXG4gICAgICAgIGJjID0gYi5jcml0ZXJpYSxcbiAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gYWMubGVuZ3RoO1xuXG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGFjW2luZGV4XSxcbiAgICAgICAgICBvdGhlciA9IGJjW2luZGV4XTtcblxuICAgICAgaWYgKHZhbHVlICE9PSBvdGhlcikge1xuICAgICAgICBpZiAodmFsdWUgPiBvdGhlciB8fCB0eXBlb2YgdmFsdWUgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUgPCBvdGhlciB8fCB0eXBlb2Ygb3RoZXIgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRml4ZXMgYW4gYEFycmF5I3NvcnRgIGJ1ZyBpbiB0aGUgSlMgZW5naW5lIGVtYmVkZGVkIGluIEFkb2JlIGFwcGxpY2F0aW9uc1xuICAgIC8vIHRoYXQgY2F1c2VzIGl0LCB1bmRlciBjZXJ0YWluIGNpcmN1bXN0YW5jZXMsIHRvIHJldHVybiB0aGUgc2FtZSB2YWx1ZSBmb3JcbiAgICAvLyBgYWAgYW5kIGBiYC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNoa2VuYXMvdW5kZXJzY29yZS9wdWxsLzEyNDdcbiAgICAvL1xuICAgIC8vIFRoaXMgYWxzbyBlbnN1cmVzIGEgc3RhYmxlIHNvcnQgaW4gVjggYW5kIG90aGVyIGVuZ2luZXMuXG4gICAgLy8gU2VlIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTkwXG4gICAgcmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjYWNoZSBvYmplY3QgdG8gb3B0aW1pemUgbGluZWFyIHNlYXJjaGVzIG9mIGxhcmdlIGFycmF5cy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtBcnJheX0gW2FycmF5PVtdXSBUaGUgYXJyYXkgdG8gc2VhcmNoLlxuICAgKiBAcmV0dXJucyB7bnVsbHxPYmplY3R9IFJldHVybnMgdGhlIGNhY2hlIG9iamVjdCBvciBgbnVsbGAgaWYgY2FjaGluZyBzaG91bGQgbm90IGJlIHVzZWQuXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVDYWNoZShhcnJheSkge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGgsXG4gICAgICAgIGZpcnN0ID0gYXJyYXlbMF0sXG4gICAgICAgIG1pZCA9IGFycmF5WyhsZW5ndGggLyAyKSB8IDBdLFxuICAgICAgICBsYXN0ID0gYXJyYXlbbGVuZ3RoIC0gMV07XG5cbiAgICBpZiAoZmlyc3QgJiYgdHlwZW9mIGZpcnN0ID09ICdvYmplY3QnICYmXG4gICAgICAgIG1pZCAmJiB0eXBlb2YgbWlkID09ICdvYmplY3QnICYmIGxhc3QgJiYgdHlwZW9mIGxhc3QgPT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGNhY2hlID0gZ2V0T2JqZWN0KCk7XG4gICAgY2FjaGVbJ2ZhbHNlJ10gPSBjYWNoZVsnbnVsbCddID0gY2FjaGVbJ3RydWUnXSA9IGNhY2hlWyd1bmRlZmluZWQnXSA9IGZhbHNlO1xuXG4gICAgdmFyIHJlc3VsdCA9IGdldE9iamVjdCgpO1xuICAgIHJlc3VsdC5hcnJheSA9IGFycmF5O1xuICAgIHJlc3VsdC5jYWNoZSA9IGNhY2hlO1xuICAgIHJlc3VsdC5wdXNoID0gY2FjaGVQdXNoO1xuXG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGFycmF5W2luZGV4XSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogVXNlZCBieSBgdGVtcGxhdGVgIHRvIGVzY2FwZSBjaGFyYWN0ZXJzIGZvciBpbmNsdXNpb24gaW4gY29tcGlsZWRcbiAgICogc3RyaW5nIGxpdGVyYWxzLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWF0Y2ggVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAgICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBjaGFyYWN0ZXIuXG4gICAqL1xuICBmdW5jdGlvbiBlc2NhcGVTdHJpbmdDaGFyKG1hdGNoKSB7XG4gICAgcmV0dXJuICdcXFxcJyArIHN0cmluZ0VzY2FwZXNbbWF0Y2hdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gYXJyYXkgZnJvbSB0aGUgYXJyYXkgcG9vbCBvciBjcmVhdGVzIGEgbmV3IG9uZSBpZiB0aGUgcG9vbCBpcyBlbXB0eS5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybnMge0FycmF5fSBUaGUgYXJyYXkgZnJvbSB0aGUgcG9vbC5cbiAgICovXG4gIGZ1bmN0aW9uIGdldEFycmF5KCkge1xuICAgIHJldHVybiBhcnJheVBvb2wucG9wKCkgfHwgW107XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBvYmplY3QgZnJvbSB0aGUgb2JqZWN0IHBvb2wgb3IgY3JlYXRlcyBhIG5ldyBvbmUgaWYgdGhlIHBvb2wgaXMgZW1wdHkuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBvYmplY3QgZnJvbSB0aGUgcG9vbC5cbiAgICovXG4gIGZ1bmN0aW9uIGdldE9iamVjdCgpIHtcbiAgICByZXR1cm4gb2JqZWN0UG9vbC5wb3AoKSB8fCB7XG4gICAgICAnYXJyYXknOiBudWxsLFxuICAgICAgJ2NhY2hlJzogbnVsbCxcbiAgICAgICdjcml0ZXJpYSc6IG51bGwsXG4gICAgICAnZmFsc2UnOiBmYWxzZSxcbiAgICAgICdpbmRleCc6IDAsXG4gICAgICAnbnVsbCc6IGZhbHNlLFxuICAgICAgJ251bWJlcic6IG51bGwsXG4gICAgICAnb2JqZWN0JzogbnVsbCxcbiAgICAgICdwdXNoJzogbnVsbCxcbiAgICAgICdzdHJpbmcnOiBudWxsLFxuICAgICAgJ3RydWUnOiBmYWxzZSxcbiAgICAgICd1bmRlZmluZWQnOiBmYWxzZSxcbiAgICAgICd2YWx1ZSc6IG51bGxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHRoZSBnaXZlbiBhcnJheSBiYWNrIHRvIHRoZSBhcnJheSBwb29sLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byByZWxlYXNlLlxuICAgKi9cbiAgZnVuY3Rpb24gcmVsZWFzZUFycmF5KGFycmF5KSB7XG4gICAgYXJyYXkubGVuZ3RoID0gMDtcbiAgICBpZiAoYXJyYXlQb29sLmxlbmd0aCA8IG1heFBvb2xTaXplKSB7XG4gICAgICBhcnJheVBvb2wucHVzaChhcnJheSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHRoZSBnaXZlbiBvYmplY3QgYmFjayB0byB0aGUgb2JqZWN0IHBvb2wuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHJlbGVhc2UuXG4gICAqL1xuICBmdW5jdGlvbiByZWxlYXNlT2JqZWN0KG9iamVjdCkge1xuICAgIHZhciBjYWNoZSA9IG9iamVjdC5jYWNoZTtcbiAgICBpZiAoY2FjaGUpIHtcbiAgICAgIHJlbGVhc2VPYmplY3QoY2FjaGUpO1xuICAgIH1cbiAgICBvYmplY3QuYXJyYXkgPSBvYmplY3QuY2FjaGUgPSBvYmplY3QuY3JpdGVyaWEgPSBvYmplY3Qub2JqZWN0ID0gb2JqZWN0Lm51bWJlciA9IG9iamVjdC5zdHJpbmcgPSBvYmplY3QudmFsdWUgPSBudWxsO1xuICAgIGlmIChvYmplY3RQb29sLmxlbmd0aCA8IG1heFBvb2xTaXplKSB7XG4gICAgICBvYmplY3RQb29sLnB1c2gob2JqZWN0KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2xpY2VzIHRoZSBgY29sbGVjdGlvbmAgZnJvbSB0aGUgYHN0YXJ0YCBpbmRleCB1cCB0bywgYnV0IG5vdCBpbmNsdWRpbmcsXG4gICAqIHRoZSBgZW5kYCBpbmRleC5cbiAgICpcbiAgICogTm90ZTogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIGluc3RlYWQgb2YgYEFycmF5I3NsaWNlYCB0byBzdXBwb3J0IG5vZGUgbGlzdHNcbiAgICogaW4gSUUgPCA5IGFuZCB0byBlbnN1cmUgZGVuc2UgYXJyYXlzIGFyZSByZXR1cm5lZC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIHNsaWNlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnQgVGhlIHN0YXJ0IGluZGV4LlxuICAgKiBAcGFyYW0ge251bWJlcn0gZW5kIFRoZSBlbmQgaW5kZXguXG4gICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGFycmF5LlxuICAgKi9cbiAgZnVuY3Rpb24gc2xpY2UoYXJyYXksIHN0YXJ0LCBlbmQpIHtcbiAgICBzdGFydCB8fCAoc3RhcnQgPSAwKTtcbiAgICBpZiAodHlwZW9mIGVuZCA9PSAndW5kZWZpbmVkJykge1xuICAgICAgZW5kID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuICAgIH1cbiAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgbGVuZ3RoID0gZW5kIC0gc3RhcnQgfHwgMCxcbiAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGgpO1xuXG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHJlc3VsdFtpbmRleF0gPSBhcnJheVtzdGFydCArIGluZGV4XTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYGxvZGFzaGAgZnVuY3Rpb24gdXNpbmcgdGhlIGdpdmVuIGNvbnRleHQgb2JqZWN0LlxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJPZiBfXG4gICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtjb250ZXh0PXJvb3RdIFRoZSBjb250ZXh0IG9iamVjdC5cbiAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBgbG9kYXNoYCBmdW5jdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIHJ1bkluQ29udGV4dChjb250ZXh0KSB7XG4gICAgLy8gQXZvaWQgaXNzdWVzIHdpdGggc29tZSBFUzMgZW52aXJvbm1lbnRzIHRoYXQgYXR0ZW1wdCB0byB1c2UgdmFsdWVzLCBuYW1lZFxuICAgIC8vIGFmdGVyIGJ1aWx0LWluIGNvbnN0cnVjdG9ycyBsaWtlIGBPYmplY3RgLCBmb3IgdGhlIGNyZWF0aW9uIG9mIGxpdGVyYWxzLlxuICAgIC8vIEVTNSBjbGVhcnMgdGhpcyB1cCBieSBzdGF0aW5nIHRoYXQgbGl0ZXJhbHMgbXVzdCB1c2UgYnVpbHQtaW4gY29uc3RydWN0b3JzLlxuICAgIC8vIFNlZSBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDExLjEuNS5cbiAgICBjb250ZXh0ID0gY29udGV4dCA/IF8uZGVmYXVsdHMocm9vdC5PYmplY3QoKSwgY29udGV4dCwgXy5waWNrKHJvb3QsIGNvbnRleHRQcm9wcykpIDogcm9vdDtcblxuICAgIC8qKiBOYXRpdmUgY29uc3RydWN0b3IgcmVmZXJlbmNlcyAqL1xuICAgIHZhciBBcnJheSA9IGNvbnRleHQuQXJyYXksXG4gICAgICAgIEJvb2xlYW4gPSBjb250ZXh0LkJvb2xlYW4sXG4gICAgICAgIERhdGUgPSBjb250ZXh0LkRhdGUsXG4gICAgICAgIEZ1bmN0aW9uID0gY29udGV4dC5GdW5jdGlvbixcbiAgICAgICAgTWF0aCA9IGNvbnRleHQuTWF0aCxcbiAgICAgICAgTnVtYmVyID0gY29udGV4dC5OdW1iZXIsXG4gICAgICAgIE9iamVjdCA9IGNvbnRleHQuT2JqZWN0LFxuICAgICAgICBSZWdFeHAgPSBjb250ZXh0LlJlZ0V4cCxcbiAgICAgICAgU3RyaW5nID0gY29udGV4dC5TdHJpbmcsXG4gICAgICAgIFR5cGVFcnJvciA9IGNvbnRleHQuVHlwZUVycm9yO1xuXG4gICAgLyoqXG4gICAgICogVXNlZCBmb3IgYEFycmF5YCBtZXRob2QgcmVmZXJlbmNlcy5cbiAgICAgKlxuICAgICAqIE5vcm1hbGx5IGBBcnJheS5wcm90b3R5cGVgIHdvdWxkIHN1ZmZpY2UsIGhvd2V2ZXIsIHVzaW5nIGFuIGFycmF5IGxpdGVyYWxcbiAgICAgKiBhdm9pZHMgaXNzdWVzIGluIE5hcndoYWwuXG4gICAgICovXG4gICAgdmFyIGFycmF5UmVmID0gW107XG5cbiAgICAvKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzICovXG4gICAgdmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuICAgIC8qKiBVc2VkIHRvIHJlc3RvcmUgdGhlIG9yaWdpbmFsIGBfYCByZWZlcmVuY2UgaW4gYG5vQ29uZmxpY3RgICovXG4gICAgdmFyIG9sZERhc2ggPSBjb250ZXh0Ll87XG5cbiAgICAvKiogVXNlZCB0byByZXNvbHZlIHRoZSBpbnRlcm5hbCBbW0NsYXNzXV0gb2YgdmFsdWVzICovXG4gICAgdmFyIHRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbiAgICAvKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlICovXG4gICAgdmFyIHJlTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gICAgICBTdHJpbmcodG9TdHJpbmcpXG4gICAgICAgIC5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpXG4gICAgICAgIC5yZXBsYWNlKC90b1N0cmluZ3wgZm9yIFteXFxdXSsvZywgJy4qPycpICsgJyQnXG4gICAgKTtcblxuICAgIC8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xuICAgIHZhciBjZWlsID0gTWF0aC5jZWlsLFxuICAgICAgICBjbGVhclRpbWVvdXQgPSBjb250ZXh0LmNsZWFyVGltZW91dCxcbiAgICAgICAgZmxvb3IgPSBNYXRoLmZsb29yLFxuICAgICAgICBmblRvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgICAgICBnZXRQcm90b3R5cGVPZiA9IGlzTmF0aXZlKGdldFByb3RvdHlwZU9mID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKSAmJiBnZXRQcm90b3R5cGVPZixcbiAgICAgICAgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eSxcbiAgICAgICAgcHVzaCA9IGFycmF5UmVmLnB1c2gsXG4gICAgICAgIHNldFRpbWVvdXQgPSBjb250ZXh0LnNldFRpbWVvdXQsXG4gICAgICAgIHNwbGljZSA9IGFycmF5UmVmLnNwbGljZSxcbiAgICAgICAgdW5zaGlmdCA9IGFycmF5UmVmLnVuc2hpZnQ7XG5cbiAgICAvKiogVXNlZCB0byBzZXQgbWV0YSBkYXRhIG9uIGZ1bmN0aW9ucyAqL1xuICAgIHZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgICAgIC8vIElFIDggb25seSBhY2NlcHRzIERPTSBlbGVtZW50c1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIG8gPSB7fSxcbiAgICAgICAgICAgIGZ1bmMgPSBpc05hdGl2ZShmdW5jID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KSAmJiBmdW5jLFxuICAgICAgICAgICAgcmVzdWx0ID0gZnVuYyhvLCBvLCBvKSAmJiBmdW5jO1xuICAgICAgfSBjYXRjaChlKSB7IH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSgpKTtcblxuICAgIC8qIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzIGZvciBtZXRob2RzIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzICovXG4gICAgdmFyIG5hdGl2ZUNyZWF0ZSA9IGlzTmF0aXZlKG5hdGl2ZUNyZWF0ZSA9IE9iamVjdC5jcmVhdGUpICYmIG5hdGl2ZUNyZWF0ZSxcbiAgICAgICAgbmF0aXZlSXNBcnJheSA9IGlzTmF0aXZlKG5hdGl2ZUlzQXJyYXkgPSBBcnJheS5pc0FycmF5KSAmJiBuYXRpdmVJc0FycmF5LFxuICAgICAgICBuYXRpdmVJc0Zpbml0ZSA9IGNvbnRleHQuaXNGaW5pdGUsXG4gICAgICAgIG5hdGl2ZUlzTmFOID0gY29udGV4dC5pc05hTixcbiAgICAgICAgbmF0aXZlS2V5cyA9IGlzTmF0aXZlKG5hdGl2ZUtleXMgPSBPYmplY3Qua2V5cykgJiYgbmF0aXZlS2V5cyxcbiAgICAgICAgbmF0aXZlTWF4ID0gTWF0aC5tYXgsXG4gICAgICAgIG5hdGl2ZU1pbiA9IE1hdGgubWluLFxuICAgICAgICBuYXRpdmVQYXJzZUludCA9IGNvbnRleHQucGFyc2VJbnQsXG4gICAgICAgIG5hdGl2ZVJhbmRvbSA9IE1hdGgucmFuZG9tO1xuXG4gICAgLyoqIFVzZWQgdG8gbG9va3VwIGEgYnVpbHQtaW4gY29uc3RydWN0b3IgYnkgW1tDbGFzc11dICovXG4gICAgdmFyIGN0b3JCeUNsYXNzID0ge307XG4gICAgY3RvckJ5Q2xhc3NbYXJyYXlDbGFzc10gPSBBcnJheTtcbiAgICBjdG9yQnlDbGFzc1tib29sQ2xhc3NdID0gQm9vbGVhbjtcbiAgICBjdG9yQnlDbGFzc1tkYXRlQ2xhc3NdID0gRGF0ZTtcbiAgICBjdG9yQnlDbGFzc1tmdW5jQ2xhc3NdID0gRnVuY3Rpb247XG4gICAgY3RvckJ5Q2xhc3Nbb2JqZWN0Q2xhc3NdID0gT2JqZWN0O1xuICAgIGN0b3JCeUNsYXNzW251bWJlckNsYXNzXSA9IE51bWJlcjtcbiAgICBjdG9yQnlDbGFzc1tyZWdleHBDbGFzc10gPSBSZWdFeHA7XG4gICAgY3RvckJ5Q2xhc3Nbc3RyaW5nQ2xhc3NdID0gU3RyaW5nO1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgYGxvZGFzaGAgb2JqZWN0IHdoaWNoIHdyYXBzIHRoZSBnaXZlbiB2YWx1ZSB0byBlbmFibGUgaW50dWl0aXZlXG4gICAgICogbWV0aG9kIGNoYWluaW5nLlxuICAgICAqXG4gICAgICogSW4gYWRkaXRpb24gdG8gTG8tRGFzaCBtZXRob2RzLCB3cmFwcGVycyBhbHNvIGhhdmUgdGhlIGZvbGxvd2luZyBgQXJyYXlgIG1ldGhvZHM6XG4gICAgICogYGNvbmNhdGAsIGBqb2luYCwgYHBvcGAsIGBwdXNoYCwgYHJldmVyc2VgLCBgc2hpZnRgLCBgc2xpY2VgLCBgc29ydGAsIGBzcGxpY2VgLFxuICAgICAqIGFuZCBgdW5zaGlmdGBcbiAgICAgKlxuICAgICAqIENoYWluaW5nIGlzIHN1cHBvcnRlZCBpbiBjdXN0b20gYnVpbGRzIGFzIGxvbmcgYXMgdGhlIGB2YWx1ZWAgbWV0aG9kIGlzXG4gICAgICogaW1wbGljaXRseSBvciBleHBsaWNpdGx5IGluY2x1ZGVkIGluIHRoZSBidWlsZC5cbiAgICAgKlxuICAgICAqIFRoZSBjaGFpbmFibGUgd3JhcHBlciBmdW5jdGlvbnMgYXJlOlxuICAgICAqIGBhZnRlcmAsIGBhc3NpZ25gLCBgYmluZGAsIGBiaW5kQWxsYCwgYGJpbmRLZXlgLCBgY2hhaW5gLCBgY29tcGFjdGAsXG4gICAgICogYGNvbXBvc2VgLCBgY29uY2F0YCwgYGNvdW50QnlgLCBgY3JlYXRlYCwgYGNyZWF0ZUNhbGxiYWNrYCwgYGN1cnJ5YCxcbiAgICAgKiBgZGVib3VuY2VgLCBgZGVmYXVsdHNgLCBgZGVmZXJgLCBgZGVsYXlgLCBgZGlmZmVyZW5jZWAsIGBmaWx0ZXJgLCBgZmxhdHRlbmAsXG4gICAgICogYGZvckVhY2hgLCBgZm9yRWFjaFJpZ2h0YCwgYGZvckluYCwgYGZvckluUmlnaHRgLCBgZm9yT3duYCwgYGZvck93blJpZ2h0YCxcbiAgICAgKiBgZnVuY3Rpb25zYCwgYGdyb3VwQnlgLCBgaW5kZXhCeWAsIGBpbml0aWFsYCwgYGludGVyc2VjdGlvbmAsIGBpbnZlcnRgLFxuICAgICAqIGBpbnZva2VgLCBga2V5c2AsIGBtYXBgLCBgbWF4YCwgYG1lbW9pemVgLCBgbWVyZ2VgLCBgbWluYCwgYG9iamVjdGAsIGBvbWl0YCxcbiAgICAgKiBgb25jZWAsIGBwYWlyc2AsIGBwYXJ0aWFsYCwgYHBhcnRpYWxSaWdodGAsIGBwaWNrYCwgYHBsdWNrYCwgYHB1bGxgLCBgcHVzaGAsXG4gICAgICogYHJhbmdlYCwgYHJlamVjdGAsIGByZW1vdmVgLCBgcmVzdGAsIGByZXZlcnNlYCwgYHNodWZmbGVgLCBgc2xpY2VgLCBgc29ydGAsXG4gICAgICogYHNvcnRCeWAsIGBzcGxpY2VgLCBgdGFwYCwgYHRocm90dGxlYCwgYHRpbWVzYCwgYHRvQXJyYXlgLCBgdHJhbnNmb3JtYCxcbiAgICAgKiBgdW5pb25gLCBgdW5pcWAsIGB1bnNoaWZ0YCwgYHVuemlwYCwgYHZhbHVlc2AsIGB3aGVyZWAsIGB3aXRob3V0YCwgYHdyYXBgLFxuICAgICAqIGFuZCBgemlwYFxuICAgICAqXG4gICAgICogVGhlIG5vbi1jaGFpbmFibGUgd3JhcHBlciBmdW5jdGlvbnMgYXJlOlxuICAgICAqIGBjbG9uZWAsIGBjbG9uZURlZXBgLCBgY29udGFpbnNgLCBgZXNjYXBlYCwgYGV2ZXJ5YCwgYGZpbmRgLCBgZmluZEluZGV4YCxcbiAgICAgKiBgZmluZEtleWAsIGBmaW5kTGFzdGAsIGBmaW5kTGFzdEluZGV4YCwgYGZpbmRMYXN0S2V5YCwgYGhhc2AsIGBpZGVudGl0eWAsXG4gICAgICogYGluZGV4T2ZgLCBgaXNBcmd1bWVudHNgLCBgaXNBcnJheWAsIGBpc0Jvb2xlYW5gLCBgaXNEYXRlYCwgYGlzRWxlbWVudGAsXG4gICAgICogYGlzRW1wdHlgLCBgaXNFcXVhbGAsIGBpc0Zpbml0ZWAsIGBpc0Z1bmN0aW9uYCwgYGlzTmFOYCwgYGlzTnVsbGAsIGBpc051bWJlcmAsXG4gICAgICogYGlzT2JqZWN0YCwgYGlzUGxhaW5PYmplY3RgLCBgaXNSZWdFeHBgLCBgaXNTdHJpbmdgLCBgaXNVbmRlZmluZWRgLCBgam9pbmAsXG4gICAgICogYGxhc3RJbmRleE9mYCwgYG1peGluYCwgYG5vQ29uZmxpY3RgLCBgcGFyc2VJbnRgLCBgcG9wYCwgYHJhbmRvbWAsIGByZWR1Y2VgLFxuICAgICAqIGByZWR1Y2VSaWdodGAsIGByZXN1bHRgLCBgc2hpZnRgLCBgc2l6ZWAsIGBzb21lYCwgYHNvcnRlZEluZGV4YCwgYHJ1bkluQ29udGV4dGAsXG4gICAgICogYHRlbXBsYXRlYCwgYHVuZXNjYXBlYCwgYHVuaXF1ZUlkYCwgYW5kIGB2YWx1ZWBcbiAgICAgKlxuICAgICAqIFRoZSB3cmFwcGVyIGZ1bmN0aW9ucyBgZmlyc3RgIGFuZCBgbGFzdGAgcmV0dXJuIHdyYXBwZWQgdmFsdWVzIHdoZW4gYG5gIGlzXG4gICAgICogcHJvdmlkZWQsIG90aGVyd2lzZSB0aGV5IHJldHVybiB1bndyYXBwZWQgdmFsdWVzLlxuICAgICAqXG4gICAgICogRXhwbGljaXQgY2hhaW5pbmcgY2FuIGJlIGVuYWJsZWQgYnkgdXNpbmcgdGhlIGBfLmNoYWluYCBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAbmFtZSBfXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQGNhdGVnb3J5IENoYWluaW5nXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gd3JhcCBpbiBhIGBsb2Rhc2hgIGluc3RhbmNlLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYSBgbG9kYXNoYCBpbnN0YW5jZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIHdyYXBwZWQgPSBfKFsxLCAyLCAzXSk7XG4gICAgICpcbiAgICAgKiAvLyByZXR1cm5zIGFuIHVud3JhcHBlZCB2YWx1ZVxuICAgICAqIHdyYXBwZWQucmVkdWNlKGZ1bmN0aW9uKHN1bSwgbnVtKSB7XG4gICAgICogICByZXR1cm4gc3VtICsgbnVtO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IDZcbiAgICAgKlxuICAgICAqIC8vIHJldHVybnMgYSB3cmFwcGVkIHZhbHVlXG4gICAgICogdmFyIHNxdWFyZXMgPSB3cmFwcGVkLm1hcChmdW5jdGlvbihudW0pIHtcbiAgICAgKiAgIHJldHVybiBudW0gKiBudW07XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiBfLmlzQXJyYXkoc3F1YXJlcyk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIF8uaXNBcnJheShzcXVhcmVzLnZhbHVlKCkpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsb2Rhc2godmFsdWUpIHtcbiAgICAgIC8vIGRvbid0IHdyYXAgaWYgYWxyZWFkeSB3cmFwcGVkLCBldmVuIGlmIHdyYXBwZWQgYnkgYSBkaWZmZXJlbnQgYGxvZGFzaGAgY29uc3RydWN0b3JcbiAgICAgIHJldHVybiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnICYmICFpc0FycmF5KHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnX193cmFwcGVkX18nKSlcbiAgICAgICA/IHZhbHVlXG4gICAgICAgOiBuZXcgbG9kYXNoV3JhcHBlcih2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBmYXN0IHBhdGggZm9yIGNyZWF0aW5nIGBsb2Rhc2hgIHdyYXBwZXIgb2JqZWN0cy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gd3JhcCBpbiBhIGBsb2Rhc2hgIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gY2hhaW5BbGwgQSBmbGFnIHRvIGVuYWJsZSBjaGFpbmluZyBmb3IgYWxsIG1ldGhvZHNcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGEgYGxvZGFzaGAgaW5zdGFuY2UuXG4gICAgICovXG4gICAgZnVuY3Rpb24gbG9kYXNoV3JhcHBlcih2YWx1ZSwgY2hhaW5BbGwpIHtcbiAgICAgIHRoaXMuX19jaGFpbl9fID0gISFjaGFpbkFsbDtcbiAgICAgIHRoaXMuX193cmFwcGVkX18gPSB2YWx1ZTtcbiAgICB9XG4gICAgLy8gZW5zdXJlIGBuZXcgbG9kYXNoV3JhcHBlcmAgaXMgYW4gaW5zdGFuY2Ugb2YgYGxvZGFzaGBcbiAgICBsb2Rhc2hXcmFwcGVyLnByb3RvdHlwZSA9IGxvZGFzaC5wcm90b3R5cGU7XG5cbiAgICAvKipcbiAgICAgKiBBbiBvYmplY3QgdXNlZCB0byBmbGFnIGVudmlyb25tZW50cyBmZWF0dXJlcy5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEB0eXBlIE9iamVjdFxuICAgICAqL1xuICAgIHZhciBzdXBwb3J0ID0gbG9kYXNoLnN1cHBvcnQgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIERldGVjdCBpZiBmdW5jdGlvbnMgY2FuIGJlIGRlY29tcGlsZWQgYnkgYEZ1bmN0aW9uI3RvU3RyaW5nYFxuICAgICAqIChhbGwgYnV0IFBTMyBhbmQgb2xkZXIgT3BlcmEgbW9iaWxlIGJyb3dzZXJzICYgYXZvaWRlZCBpbiBXaW5kb3dzIDggYXBwcykuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgXy5zdXBwb3J0XG4gICAgICogQHR5cGUgYm9vbGVhblxuICAgICAqL1xuICAgIHN1cHBvcnQuZnVuY0RlY29tcCA9ICFpc05hdGl2ZShjb250ZXh0LldpblJURXJyb3IpICYmIHJlVGhpcy50ZXN0KHJ1bkluQ29udGV4dCk7XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgaWYgYEZ1bmN0aW9uI25hbWVgIGlzIHN1cHBvcnRlZCAoYWxsIGJ1dCBJRSkuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyT2YgXy5zdXBwb3J0XG4gICAgICogQHR5cGUgYm9vbGVhblxuICAgICAqL1xuICAgIHN1cHBvcnQuZnVuY05hbWVzID0gdHlwZW9mIEZ1bmN0aW9uLm5hbWUgPT0gJ3N0cmluZyc7XG5cbiAgICAvKipcbiAgICAgKiBCeSBkZWZhdWx0LCB0aGUgdGVtcGxhdGUgZGVsaW1pdGVycyB1c2VkIGJ5IExvLURhc2ggYXJlIHNpbWlsYXIgdG8gdGhvc2UgaW5cbiAgICAgKiBlbWJlZGRlZCBSdWJ5IChFUkIpLiBDaGFuZ2UgdGhlIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmVcbiAgICAgKiBkZWxpbWl0ZXJzLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQHR5cGUgT2JqZWN0XG4gICAgICovXG4gICAgbG9kYXNoLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG5cbiAgICAgIC8qKlxuICAgICAgICogVXNlZCB0byBkZXRlY3QgYGRhdGFgIHByb3BlcnR5IHZhbHVlcyB0byBiZSBIVE1MLWVzY2FwZWQuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgICAgICogQHR5cGUgUmVnRXhwXG4gICAgICAgKi9cbiAgICAgICdlc2NhcGUnOiAvPCUtKFtcXHNcXFNdKz8pJT4vZyxcblxuICAgICAgLyoqXG4gICAgICAgKiBVc2VkIHRvIGRldGVjdCBjb2RlIHRvIGJlIGV2YWx1YXRlZC5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAgICAgKiBAdHlwZSBSZWdFeHBcbiAgICAgICAqL1xuICAgICAgJ2V2YWx1YXRlJzogLzwlKFtcXHNcXFNdKz8pJT4vZyxcblxuICAgICAgLyoqXG4gICAgICAgKiBVc2VkIHRvIGRldGVjdCBgZGF0YWAgcHJvcGVydHkgdmFsdWVzIHRvIGluamVjdC5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAgICAgKiBAdHlwZSBSZWdFeHBcbiAgICAgICAqL1xuICAgICAgJ2ludGVycG9sYXRlJzogcmVJbnRlcnBvbGF0ZSxcblxuICAgICAgLyoqXG4gICAgICAgKiBVc2VkIHRvIHJlZmVyZW5jZSB0aGUgZGF0YSBvYmplY3QgaW4gdGhlIHRlbXBsYXRlIHRleHQuXG4gICAgICAgKlxuICAgICAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5nc1xuICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgKi9cbiAgICAgICd2YXJpYWJsZSc6ICcnLFxuXG4gICAgICAvKipcbiAgICAgICAqIFVzZWQgdG8gaW1wb3J0IHZhcmlhYmxlcyBpbnRvIHRoZSBjb21waWxlZCB0ZW1wbGF0ZS5cbiAgICAgICAqXG4gICAgICAgKiBAbWVtYmVyT2YgXy50ZW1wbGF0ZVNldHRpbmdzXG4gICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAqL1xuICAgICAgJ2ltcG9ydHMnOiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEEgcmVmZXJlbmNlIHRvIHRoZSBgbG9kYXNoYCBmdW5jdGlvbi5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlck9mIF8udGVtcGxhdGVTZXR0aW5ncy5pbXBvcnRzXG4gICAgICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICAnXyc6IGxvZGFzaFxuICAgICAgfVxuICAgIH07XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmJpbmRgIHRoYXQgY3JlYXRlcyB0aGUgYm91bmQgZnVuY3Rpb24gYW5kXG4gICAgICogc2V0cyBpdHMgbWV0YSBkYXRhLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBiaW5kRGF0YSBUaGUgYmluZCBkYXRhIGFycmF5LlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJvdW5kIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VCaW5kKGJpbmREYXRhKSB7XG4gICAgICB2YXIgZnVuYyA9IGJpbmREYXRhWzBdLFxuICAgICAgICAgIHBhcnRpYWxBcmdzID0gYmluZERhdGFbMl0sXG4gICAgICAgICAgdGhpc0FyZyA9IGJpbmREYXRhWzRdO1xuXG4gICAgICBmdW5jdGlvbiBib3VuZCgpIHtcbiAgICAgICAgLy8gYEZ1bmN0aW9uI2JpbmRgIHNwZWNcbiAgICAgICAgLy8gaHR0cDovL2VzNS5naXRodWIuaW8vI3gxNS4zLjQuNVxuICAgICAgICBpZiAocGFydGlhbEFyZ3MpIHtcbiAgICAgICAgICAvLyBhdm9pZCBgYXJndW1lbnRzYCBvYmplY3QgZGVvcHRpbWl6YXRpb25zIGJ5IHVzaW5nIGBzbGljZWAgaW5zdGVhZFxuICAgICAgICAgIC8vIG9mIGBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbGAgYW5kIG5vdCBhc3NpZ25pbmcgYGFyZ3VtZW50c2AgdG8gYVxuICAgICAgICAgIC8vIHZhcmlhYmxlIGFzIGEgdGVybmFyeSBleHByZXNzaW9uXG4gICAgICAgICAgdmFyIGFyZ3MgPSBzbGljZShwYXJ0aWFsQXJncyk7XG4gICAgICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG1pbWljIHRoZSBjb25zdHJ1Y3RvcidzIGByZXR1cm5gIGJlaGF2aW9yXG4gICAgICAgIC8vIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTMuMi4yXG4gICAgICAgIGlmICh0aGlzIGluc3RhbmNlb2YgYm91bmQpIHtcbiAgICAgICAgICAvLyBlbnN1cmUgYG5ldyBib3VuZGAgaXMgYW4gaW5zdGFuY2Ugb2YgYGZ1bmNgXG4gICAgICAgICAgdmFyIHRoaXNCaW5kaW5nID0gYmFzZUNyZWF0ZShmdW5jLnByb3RvdHlwZSksXG4gICAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0JpbmRpbmcsIGFyZ3MgfHwgYXJndW1lbnRzKTtcbiAgICAgICAgICByZXR1cm4gaXNPYmplY3QocmVzdWx0KSA/IHJlc3VsdCA6IHRoaXNCaW5kaW5nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MgfHwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIHNldEJpbmREYXRhKGJvdW5kLCBiaW5kRGF0YSk7XG4gICAgICByZXR1cm4gYm91bmQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY2xvbmVgIHdpdGhvdXQgYXJndW1lbnQganVnZ2xpbmcgb3Igc3VwcG9ydFxuICAgICAqIGZvciBgdGhpc0FyZ2AgYmluZGluZy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2xvbmUuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwPWZhbHNlXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY2xvbmluZyB2YWx1ZXMuXG4gICAgICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQT1bXV0gVHJhY2tzIHRyYXZlcnNlZCBzb3VyY2Ugb2JqZWN0cy5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbc3RhY2tCPVtdXSBBc3NvY2lhdGVzIGNsb25lcyB3aXRoIHNvdXJjZSBjb3VudGVycGFydHMuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGNsb25lZCB2YWx1ZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlQ2xvbmUodmFsdWUsIGlzRGVlcCwgY2FsbGJhY2ssIHN0YWNrQSwgc3RhY2tCKSB7XG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGNhbGxiYWNrKHZhbHVlKTtcbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBpbnNwZWN0IFtbQ2xhc3NdXVxuICAgICAgdmFyIGlzT2JqID0gaXNPYmplY3QodmFsdWUpO1xuICAgICAgaWYgKGlzT2JqKSB7XG4gICAgICAgIHZhciBjbGFzc05hbWUgPSB0b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgICAgICAgaWYgKCFjbG9uZWFibGVDbGFzc2VzW2NsYXNzTmFtZV0pIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGN0b3IgPSBjdG9yQnlDbGFzc1tjbGFzc05hbWVdO1xuICAgICAgICBzd2l0Y2ggKGNsYXNzTmFtZSkge1xuICAgICAgICAgIGNhc2UgYm9vbENsYXNzOlxuICAgICAgICAgIGNhc2UgZGF0ZUNsYXNzOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBjdG9yKCt2YWx1ZSk7XG5cbiAgICAgICAgICBjYXNlIG51bWJlckNsYXNzOlxuICAgICAgICAgIGNhc2Ugc3RyaW5nQ2xhc3M6XG4gICAgICAgICAgICByZXR1cm4gbmV3IGN0b3IodmFsdWUpO1xuXG4gICAgICAgICAgY2FzZSByZWdleHBDbGFzczpcbiAgICAgICAgICAgIHJlc3VsdCA9IGN0b3IodmFsdWUuc291cmNlLCByZUZsYWdzLmV4ZWModmFsdWUpKTtcbiAgICAgICAgICAgIHJlc3VsdC5sYXN0SW5kZXggPSB2YWx1ZS5sYXN0SW5kZXg7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgICB2YXIgaXNBcnIgPSBpc0FycmF5KHZhbHVlKTtcbiAgICAgIGlmIChpc0RlZXApIHtcbiAgICAgICAgLy8gY2hlY2sgZm9yIGNpcmN1bGFyIHJlZmVyZW5jZXMgYW5kIHJldHVybiBjb3JyZXNwb25kaW5nIGNsb25lXG4gICAgICAgIHZhciBpbml0ZWRTdGFjayA9ICFzdGFja0E7XG4gICAgICAgIHN0YWNrQSB8fCAoc3RhY2tBID0gZ2V0QXJyYXkoKSk7XG4gICAgICAgIHN0YWNrQiB8fCAoc3RhY2tCID0gZ2V0QXJyYXkoKSk7XG5cbiAgICAgICAgdmFyIGxlbmd0aCA9IHN0YWNrQS5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICAgIGlmIChzdGFja0FbbGVuZ3RoXSA9PSB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0YWNrQltsZW5ndGhdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBpc0FyciA/IGN0b3IodmFsdWUubGVuZ3RoKSA6IHt9O1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IGlzQXJyID8gc2xpY2UodmFsdWUpIDogYXNzaWduKHt9LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICAvLyBhZGQgYXJyYXkgcHJvcGVydGllcyBhc3NpZ25lZCBieSBgUmVnRXhwI2V4ZWNgXG4gICAgICBpZiAoaXNBcnIpIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsICdpbmRleCcpKSB7XG4gICAgICAgICAgcmVzdWx0LmluZGV4ID0gdmFsdWUuaW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsICdpbnB1dCcpKSB7XG4gICAgICAgICAgcmVzdWx0LmlucHV0ID0gdmFsdWUuaW5wdXQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGV4aXQgZm9yIHNoYWxsb3cgY2xvbmVcbiAgICAgIGlmICghaXNEZWVwKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICAvLyBhZGQgdGhlIHNvdXJjZSB2YWx1ZSB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHNcbiAgICAgIC8vIGFuZCBhc3NvY2lhdGUgaXQgd2l0aCBpdHMgY2xvbmVcbiAgICAgIHN0YWNrQS5wdXNoKHZhbHVlKTtcbiAgICAgIHN0YWNrQi5wdXNoKHJlc3VsdCk7XG5cbiAgICAgIC8vIHJlY3Vyc2l2ZWx5IHBvcHVsYXRlIGNsb25lIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cylcbiAgICAgIChpc0FyciA/IGZvckVhY2ggOiBmb3JPd24pKHZhbHVlLCBmdW5jdGlvbihvYmpWYWx1ZSwga2V5KSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gYmFzZUNsb25lKG9ialZhbHVlLCBpc0RlZXAsIGNhbGxiYWNrLCBzdGFja0EsIHN0YWNrQik7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGluaXRlZFN0YWNrKSB7XG4gICAgICAgIHJlbGVhc2VBcnJheShzdGFja0EpO1xuICAgICAgICByZWxlYXNlQXJyYXkoc3RhY2tCKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY3JlYXRlYCB3aXRob3V0IHN1cHBvcnQgZm9yIGFzc2lnbmluZ1xuICAgICAqIHByb3BlcnRpZXMgdG8gdGhlIGNyZWF0ZWQgb2JqZWN0LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvdG90eXBlIFRoZSBvYmplY3QgdG8gaW5oZXJpdCBmcm9tLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG5ldyBvYmplY3QuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmFzZUNyZWF0ZShwcm90b3R5cGUsIHByb3BlcnRpZXMpIHtcbiAgICAgIHJldHVybiBpc09iamVjdChwcm90b3R5cGUpID8gbmF0aXZlQ3JlYXRlKHByb3RvdHlwZSkgOiB7fTtcbiAgICB9XG4gICAgLy8gZmFsbGJhY2sgZm9yIGJyb3dzZXJzIHdpdGhvdXQgYE9iamVjdC5jcmVhdGVgXG4gICAgaWYgKCFuYXRpdmVDcmVhdGUpIHtcbiAgICAgIGJhc2VDcmVhdGUgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIGZ1bmN0aW9uIE9iamVjdCgpIHt9XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihwcm90b3R5cGUpIHtcbiAgICAgICAgICBpZiAoaXNPYmplY3QocHJvdG90eXBlKSkge1xuICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBuZXcgT2JqZWN0O1xuICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZSA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQgfHwgY29udGV4dC5PYmplY3QoKTtcbiAgICAgICAgfTtcbiAgICAgIH0oKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY3JlYXRlQ2FsbGJhY2tgIHdpdGhvdXQgc3VwcG9ydCBmb3IgY3JlYXRpbmdcbiAgICAgKiBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja3MuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Kn0gW2Z1bmM9aWRlbnRpdHldIFRoZSB2YWx1ZSB0byBjb252ZXJ0IHRvIGEgY2FsbGJhY2suXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIHRoZSBjcmVhdGVkIGNhbGxiYWNrLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbYXJnQ291bnRdIFRoZSBudW1iZXIgb2YgYXJndW1lbnRzIHRoZSBjYWxsYmFjayBhY2NlcHRzLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBhIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VDcmVhdGVDYWxsYmFjayhmdW5jLCB0aGlzQXJnLCBhcmdDb3VudCkge1xuICAgICAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIGlkZW50aXR5O1xuICAgICAgfVxuICAgICAgLy8gZXhpdCBlYXJseSBmb3Igbm8gYHRoaXNBcmdgIG9yIGFscmVhZHkgYm91bmQgYnkgYEZ1bmN0aW9uI2JpbmRgXG4gICAgICBpZiAodHlwZW9mIHRoaXNBcmcgPT0gJ3VuZGVmaW5lZCcgfHwgISgncHJvdG90eXBlJyBpbiBmdW5jKSkge1xuICAgICAgICByZXR1cm4gZnVuYztcbiAgICAgIH1cbiAgICAgIHZhciBiaW5kRGF0YSA9IGZ1bmMuX19iaW5kRGF0YV9fO1xuICAgICAgaWYgKHR5cGVvZiBiaW5kRGF0YSA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoc3VwcG9ydC5mdW5jTmFtZXMpIHtcbiAgICAgICAgICBiaW5kRGF0YSA9ICFmdW5jLm5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgYmluZERhdGEgPSBiaW5kRGF0YSB8fCAhc3VwcG9ydC5mdW5jRGVjb21wO1xuICAgICAgICBpZiAoIWJpbmREYXRhKSB7XG4gICAgICAgICAgdmFyIHNvdXJjZSA9IGZuVG9TdHJpbmcuY2FsbChmdW5jKTtcbiAgICAgICAgICBpZiAoIXN1cHBvcnQuZnVuY05hbWVzKSB7XG4gICAgICAgICAgICBiaW5kRGF0YSA9ICFyZUZ1bmNOYW1lLnRlc3Qoc291cmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFiaW5kRGF0YSkge1xuICAgICAgICAgICAgLy8gY2hlY2tzIGlmIGBmdW5jYCByZWZlcmVuY2VzIHRoZSBgdGhpc2Aga2V5d29yZCBhbmQgc3RvcmVzIHRoZSByZXN1bHRcbiAgICAgICAgICAgIGJpbmREYXRhID0gcmVUaGlzLnRlc3Qoc291cmNlKTtcbiAgICAgICAgICAgIHNldEJpbmREYXRhKGZ1bmMsIGJpbmREYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGV4aXQgZWFybHkgaWYgdGhlcmUgYXJlIG5vIGB0aGlzYCByZWZlcmVuY2VzIG9yIGBmdW5jYCBpcyBib3VuZFxuICAgICAgaWYgKGJpbmREYXRhID09PSBmYWxzZSB8fCAoYmluZERhdGEgIT09IHRydWUgJiYgYmluZERhdGFbMV0gJiAxKSkge1xuICAgICAgICByZXR1cm4gZnVuYztcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAoYXJnQ291bnQpIHtcbiAgICAgICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIHZhbHVlKTtcbiAgICAgICAgfTtcbiAgICAgICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYSwgYik7XG4gICAgICAgIH07XG4gICAgICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfTtcbiAgICAgICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gYmluZChmdW5jLCB0aGlzQXJnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgY3JlYXRlV3JhcHBlcmAgdGhhdCBjcmVhdGVzIHRoZSB3cmFwcGVyIGFuZFxuICAgICAqIHNldHMgaXRzIG1ldGEgZGF0YS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gYmluZERhdGEgVGhlIGJpbmQgZGF0YSBhcnJheS5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlQ3JlYXRlV3JhcHBlcihiaW5kRGF0YSkge1xuICAgICAgdmFyIGZ1bmMgPSBiaW5kRGF0YVswXSxcbiAgICAgICAgICBiaXRtYXNrID0gYmluZERhdGFbMV0sXG4gICAgICAgICAgcGFydGlhbEFyZ3MgPSBiaW5kRGF0YVsyXSxcbiAgICAgICAgICBwYXJ0aWFsUmlnaHRBcmdzID0gYmluZERhdGFbM10sXG4gICAgICAgICAgdGhpc0FyZyA9IGJpbmREYXRhWzRdLFxuICAgICAgICAgIGFyaXR5ID0gYmluZERhdGFbNV07XG5cbiAgICAgIHZhciBpc0JpbmQgPSBiaXRtYXNrICYgMSxcbiAgICAgICAgICBpc0JpbmRLZXkgPSBiaXRtYXNrICYgMixcbiAgICAgICAgICBpc0N1cnJ5ID0gYml0bWFzayAmIDQsXG4gICAgICAgICAgaXNDdXJyeUJvdW5kID0gYml0bWFzayAmIDgsXG4gICAgICAgICAga2V5ID0gZnVuYztcblxuICAgICAgZnVuY3Rpb24gYm91bmQoKSB7XG4gICAgICAgIHZhciB0aGlzQmluZGluZyA9IGlzQmluZCA/IHRoaXNBcmcgOiB0aGlzO1xuICAgICAgICBpZiAocGFydGlhbEFyZ3MpIHtcbiAgICAgICAgICB2YXIgYXJncyA9IHNsaWNlKHBhcnRpYWxBcmdzKTtcbiAgICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnRpYWxSaWdodEFyZ3MgfHwgaXNDdXJyeSkge1xuICAgICAgICAgIGFyZ3MgfHwgKGFyZ3MgPSBzbGljZShhcmd1bWVudHMpKTtcbiAgICAgICAgICBpZiAocGFydGlhbFJpZ2h0QXJncykge1xuICAgICAgICAgICAgcHVzaC5hcHBseShhcmdzLCBwYXJ0aWFsUmlnaHRBcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlzQ3VycnkgJiYgYXJncy5sZW5ndGggPCBhcml0eSkge1xuICAgICAgICAgICAgYml0bWFzayB8PSAxNiAmIH4zMjtcbiAgICAgICAgICAgIHJldHVybiBiYXNlQ3JlYXRlV3JhcHBlcihbZnVuYywgKGlzQ3VycnlCb3VuZCA/IGJpdG1hc2sgOiBiaXRtYXNrICYgfjMpLCBhcmdzLCBudWxsLCB0aGlzQXJnLCBhcml0eV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhcmdzIHx8IChhcmdzID0gYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKGlzQmluZEtleSkge1xuICAgICAgICAgIGZ1bmMgPSB0aGlzQmluZGluZ1trZXldO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzIGluc3RhbmNlb2YgYm91bmQpIHtcbiAgICAgICAgICB0aGlzQmluZGluZyA9IGJhc2VDcmVhdGUoZnVuYy5wcm90b3R5cGUpO1xuICAgICAgICAgIHZhciByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNCaW5kaW5nLCBhcmdzKTtcbiAgICAgICAgICByZXR1cm4gaXNPYmplY3QocmVzdWx0KSA/IHJlc3VsdCA6IHRoaXNCaW5kaW5nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXNCaW5kaW5nLCBhcmdzKTtcbiAgICAgIH1cbiAgICAgIHNldEJpbmREYXRhKGJvdW5kLCBiaW5kRGF0YSk7XG4gICAgICByZXR1cm4gYm91bmQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uZGlmZmVyZW5jZWAgdGhhdCBhY2NlcHRzIGEgc2luZ2xlIGFycmF5XG4gICAgICogb2YgdmFsdWVzIHRvIGV4Y2x1ZGUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBwcm9jZXNzLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFt2YWx1ZXNdIFRoZSBhcnJheSBvZiB2YWx1ZXMgdG8gZXhjbHVkZS5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgYXJyYXkgb2YgZmlsdGVyZWQgdmFsdWVzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VEaWZmZXJlbmNlKGFycmF5LCB2YWx1ZXMpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGluZGV4T2YgPSBnZXRJbmRleE9mKCksXG4gICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwLFxuICAgICAgICAgIGlzTGFyZ2UgPSBsZW5ndGggPj0gbGFyZ2VBcnJheVNpemUgJiYgaW5kZXhPZiA9PT0gYmFzZUluZGV4T2YsXG4gICAgICAgICAgcmVzdWx0ID0gW107XG5cbiAgICAgIGlmIChpc0xhcmdlKSB7XG4gICAgICAgIHZhciBjYWNoZSA9IGNyZWF0ZUNhY2hlKHZhbHVlcyk7XG4gICAgICAgIGlmIChjYWNoZSkge1xuICAgICAgICAgIGluZGV4T2YgPSBjYWNoZUluZGV4T2Y7XG4gICAgICAgICAgdmFsdWVzID0gY2FjaGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXNMYXJnZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF07XG4gICAgICAgIGlmIChpbmRleE9mKHZhbHVlcywgdmFsdWUpIDwgMCkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGlzTGFyZ2UpIHtcbiAgICAgICAgcmVsZWFzZU9iamVjdCh2YWx1ZXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5mbGF0dGVuYCB3aXRob3V0IHN1cHBvcnQgZm9yIGNhbGxiYWNrXG4gICAgICogc2hvcnRoYW5kcyBvciBgdGhpc0FyZ2AgYmluZGluZy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGZsYXR0ZW4uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNTaGFsbG93PWZhbHNlXSBBIGZsYWcgdG8gcmVzdHJpY3QgZmxhdHRlbmluZyB0byBhIHNpbmdsZSBsZXZlbC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc1N0cmljdD1mYWxzZV0gQSBmbGFnIHRvIHJlc3RyaWN0IGZsYXR0ZW5pbmcgdG8gYXJyYXlzIGFuZCBgYXJndW1lbnRzYCBvYmplY3RzLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbZnJvbUluZGV4PTBdIFRoZSBpbmRleCB0byBzdGFydCBmcm9tLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBmbGF0dGVuZWQgYXJyYXkuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmFzZUZsYXR0ZW4oYXJyYXksIGlzU2hhbGxvdywgaXNTdHJpY3QsIGZyb21JbmRleCkge1xuICAgICAgdmFyIGluZGV4ID0gKGZyb21JbmRleCB8fCAwKSAtIDEsXG4gICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwLFxuICAgICAgICAgIHJlc3VsdCA9IFtdO1xuXG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF07XG5cbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUubGVuZ3RoID09ICdudW1iZXInXG4gICAgICAgICAgICAmJiAoaXNBcnJheSh2YWx1ZSkgfHwgaXNBcmd1bWVudHModmFsdWUpKSkge1xuICAgICAgICAgIC8vIHJlY3Vyc2l2ZWx5IGZsYXR0ZW4gYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cylcbiAgICAgICAgICBpZiAoIWlzU2hhbGxvdykge1xuICAgICAgICAgICAgdmFsdWUgPSBiYXNlRmxhdHRlbih2YWx1ZSwgaXNTaGFsbG93LCBpc1N0cmljdCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciB2YWxJbmRleCA9IC0xLFxuICAgICAgICAgICAgICB2YWxMZW5ndGggPSB2YWx1ZS5sZW5ndGgsXG4gICAgICAgICAgICAgIHJlc0luZGV4ID0gcmVzdWx0Lmxlbmd0aDtcblxuICAgICAgICAgIHJlc3VsdC5sZW5ndGggKz0gdmFsTGVuZ3RoO1xuICAgICAgICAgIHdoaWxlICgrK3ZhbEluZGV4IDwgdmFsTGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHRbcmVzSW5kZXgrK10gPSB2YWx1ZVt2YWxJbmRleF07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCFpc1N0cmljdCkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc0VxdWFsYCwgd2l0aG91dCBzdXBwb3J0IGZvciBgdGhpc0FyZ2AgYmluZGluZyxcbiAgICAgKiB0aGF0IGFsbG93cyBwYXJ0aWFsIFwiXy53aGVyZVwiIHN0eWxlIGNvbXBhcmlzb25zLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0geyp9IGEgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gICAgICogQHBhcmFtIHsqfSBiIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpbmcgdmFsdWVzLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtpc1doZXJlPWZhbHNlXSBBIGZsYWcgdG8gaW5kaWNhdGUgcGVyZm9ybWluZyBwYXJ0aWFsIGNvbXBhcmlzb25zLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtzdGFja0E9W11dIFRyYWNrcyB0cmF2ZXJzZWQgYGFgIG9iamVjdHMuXG4gICAgICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQj1bXV0gVHJhY2tzIHRyYXZlcnNlZCBgYmAgb2JqZWN0cy5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VJc0VxdWFsKGEsIGIsIGNhbGxiYWNrLCBpc1doZXJlLCBzdGFja0EsIHN0YWNrQikge1xuICAgICAgLy8gdXNlZCB0byBpbmRpY2F0ZSB0aGF0IHdoZW4gY29tcGFyaW5nIG9iamVjdHMsIGBhYCBoYXMgYXQgbGVhc3QgdGhlIHByb3BlcnRpZXMgb2YgYGJgXG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGNhbGxiYWNrKGEsIGIpO1xuICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJldHVybiAhIXJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gZXhpdCBlYXJseSBmb3IgaWRlbnRpY2FsIHZhbHVlc1xuICAgICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgLy8gdHJlYXQgYCswYCB2cy4gYC0wYCBhcyBub3QgZXF1YWxcbiAgICAgICAgcmV0dXJuIGEgIT09IDAgfHwgKDEgLyBhID09IDEgLyBiKTtcbiAgICAgIH1cbiAgICAgIHZhciB0eXBlID0gdHlwZW9mIGEsXG4gICAgICAgICAgb3RoZXJUeXBlID0gdHlwZW9mIGI7XG5cbiAgICAgIC8vIGV4aXQgZWFybHkgZm9yIHVubGlrZSBwcmltaXRpdmUgdmFsdWVzXG4gICAgICBpZiAoYSA9PT0gYSAmJlxuICAgICAgICAgICEoYSAmJiBvYmplY3RUeXBlc1t0eXBlXSkgJiZcbiAgICAgICAgICAhKGIgJiYgb2JqZWN0VHlwZXNbb3RoZXJUeXBlXSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gZXhpdCBlYXJseSBmb3IgYG51bGxgIGFuZCBgdW5kZWZpbmVkYCBhdm9pZGluZyBFUzMncyBGdW5jdGlvbiNjYWxsIGJlaGF2aW9yXG4gICAgICAvLyBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjMuNC40XG4gICAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICAgIH1cbiAgICAgIC8vIGNvbXBhcmUgW1tDbGFzc11dIG5hbWVzXG4gICAgICB2YXIgY2xhc3NOYW1lID0gdG9TdHJpbmcuY2FsbChhKSxcbiAgICAgICAgICBvdGhlckNsYXNzID0gdG9TdHJpbmcuY2FsbChiKTtcblxuICAgICAgaWYgKGNsYXNzTmFtZSA9PSBhcmdzQ2xhc3MpIHtcbiAgICAgICAgY2xhc3NOYW1lID0gb2JqZWN0Q2xhc3M7XG4gICAgICB9XG4gICAgICBpZiAob3RoZXJDbGFzcyA9PSBhcmdzQ2xhc3MpIHtcbiAgICAgICAgb3RoZXJDbGFzcyA9IG9iamVjdENsYXNzO1xuICAgICAgfVxuICAgICAgaWYgKGNsYXNzTmFtZSAhPSBvdGhlckNsYXNzKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAgIGNhc2UgYm9vbENsYXNzOlxuICAgICAgICBjYXNlIGRhdGVDbGFzczpcbiAgICAgICAgICAvLyBjb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWJlcnMsIGRhdGVzIHRvIG1pbGxpc2Vjb25kcyBhbmQgYm9vbGVhbnNcbiAgICAgICAgICAvLyB0byBgMWAgb3IgYDBgIHRyZWF0aW5nIGludmFsaWQgZGF0ZXMgY29lcmNlZCB0byBgTmFOYCBhcyBub3QgZXF1YWxcbiAgICAgICAgICByZXR1cm4gK2EgPT0gK2I7XG5cbiAgICAgICAgY2FzZSBudW1iZXJDbGFzczpcbiAgICAgICAgICAvLyB0cmVhdCBgTmFOYCB2cy4gYE5hTmAgYXMgZXF1YWxcbiAgICAgICAgICByZXR1cm4gKGEgIT0gK2EpXG4gICAgICAgICAgICA/IGIgIT0gK2JcbiAgICAgICAgICAgIC8vIGJ1dCB0cmVhdCBgKzBgIHZzLiBgLTBgIGFzIG5vdCBlcXVhbFxuICAgICAgICAgICAgOiAoYSA9PSAwID8gKDEgLyBhID09IDEgLyBiKSA6IGEgPT0gK2IpO1xuXG4gICAgICAgIGNhc2UgcmVnZXhwQ2xhc3M6XG4gICAgICAgIGNhc2Ugc3RyaW5nQ2xhc3M6XG4gICAgICAgICAgLy8gY29lcmNlIHJlZ2V4ZXMgdG8gc3RyaW5ncyAoaHR0cDovL2VzNS5naXRodWIuaW8vI3gxNS4xMC42LjQpXG4gICAgICAgICAgLy8gdHJlYXQgc3RyaW5nIHByaW1pdGl2ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgb2JqZWN0IGluc3RhbmNlcyBhcyBlcXVhbFxuICAgICAgICAgIHJldHVybiBhID09IFN0cmluZyhiKTtcbiAgICAgIH1cbiAgICAgIHZhciBpc0FyciA9IGNsYXNzTmFtZSA9PSBhcnJheUNsYXNzO1xuICAgICAgaWYgKCFpc0Fycikge1xuICAgICAgICAvLyB1bndyYXAgYW55IGBsb2Rhc2hgIHdyYXBwZWQgdmFsdWVzXG4gICAgICAgIHZhciBhV3JhcHBlZCA9IGhhc093blByb3BlcnR5LmNhbGwoYSwgJ19fd3JhcHBlZF9fJyksXG4gICAgICAgICAgICBiV3JhcHBlZCA9IGhhc093blByb3BlcnR5LmNhbGwoYiwgJ19fd3JhcHBlZF9fJyk7XG5cbiAgICAgICAgaWYgKGFXcmFwcGVkIHx8IGJXcmFwcGVkKSB7XG4gICAgICAgICAgcmV0dXJuIGJhc2VJc0VxdWFsKGFXcmFwcGVkID8gYS5fX3dyYXBwZWRfXyA6IGEsIGJXcmFwcGVkID8gYi5fX3dyYXBwZWRfXyA6IGIsIGNhbGxiYWNrLCBpc1doZXJlLCBzdGFja0EsIHN0YWNrQik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZXhpdCBmb3IgZnVuY3Rpb25zIGFuZCBET00gbm9kZXNcbiAgICAgICAgaWYgKGNsYXNzTmFtZSAhPSBvYmplY3RDbGFzcykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpbiBvbGRlciB2ZXJzaW9ucyBvZiBPcGVyYSwgYGFyZ3VtZW50c2Agb2JqZWN0cyBoYXZlIGBBcnJheWAgY29uc3RydWN0b3JzXG4gICAgICAgIHZhciBjdG9yQSA9IGEuY29uc3RydWN0b3IsXG4gICAgICAgICAgICBjdG9yQiA9IGIuY29uc3RydWN0b3I7XG5cbiAgICAgICAgLy8gbm9uIGBPYmplY3RgIG9iamVjdCBpbnN0YW5jZXMgd2l0aCBkaWZmZXJlbnQgY29uc3RydWN0b3JzIGFyZSBub3QgZXF1YWxcbiAgICAgICAgaWYgKGN0b3JBICE9IGN0b3JCICYmXG4gICAgICAgICAgICAgICEoaXNGdW5jdGlvbihjdG9yQSkgJiYgY3RvckEgaW5zdGFuY2VvZiBjdG9yQSAmJiBpc0Z1bmN0aW9uKGN0b3JCKSAmJiBjdG9yQiBpbnN0YW5jZW9mIGN0b3JCKSAmJlxuICAgICAgICAgICAgICAoJ2NvbnN0cnVjdG9yJyBpbiBhICYmICdjb25zdHJ1Y3RvcicgaW4gYilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gYXNzdW1lIGN5Y2xpYyBzdHJ1Y3R1cmVzIGFyZSBlcXVhbFxuICAgICAgLy8gdGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpYyBzdHJ1Y3R1cmVzIGlzIGFkYXB0ZWQgZnJvbSBFUyA1LjFcbiAgICAgIC8vIHNlY3Rpb24gMTUuMTIuMywgYWJzdHJhY3Qgb3BlcmF0aW9uIGBKT2AgKGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTUuMTIuMylcbiAgICAgIHZhciBpbml0ZWRTdGFjayA9ICFzdGFja0E7XG4gICAgICBzdGFja0EgfHwgKHN0YWNrQSA9IGdldEFycmF5KCkpO1xuICAgICAgc3RhY2tCIHx8IChzdGFja0IgPSBnZXRBcnJheSgpKTtcblxuICAgICAgdmFyIGxlbmd0aCA9IHN0YWNrQS5sZW5ndGg7XG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgaWYgKHN0YWNrQVtsZW5ndGhdID09IGEpIHtcbiAgICAgICAgICByZXR1cm4gc3RhY2tCW2xlbmd0aF0gPT0gYjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHNpemUgPSAwO1xuICAgICAgcmVzdWx0ID0gdHJ1ZTtcblxuICAgICAgLy8gYWRkIGBhYCBhbmQgYGJgIHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0c1xuICAgICAgc3RhY2tBLnB1c2goYSk7XG4gICAgICBzdGFja0IucHVzaChiKTtcblxuICAgICAgLy8gcmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIGFuZCBhcnJheXMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKVxuICAgICAgaWYgKGlzQXJyKSB7XG4gICAgICAgIC8vIGNvbXBhcmUgbGVuZ3RocyB0byBkZXRlcm1pbmUgaWYgYSBkZWVwIGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5XG4gICAgICAgIGxlbmd0aCA9IGEubGVuZ3RoO1xuICAgICAgICBzaXplID0gYi5sZW5ndGg7XG4gICAgICAgIHJlc3VsdCA9IHNpemUgPT0gbGVuZ3RoO1xuXG4gICAgICAgIGlmIChyZXN1bHQgfHwgaXNXaGVyZSkge1xuICAgICAgICAgIC8vIGRlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXNcbiAgICAgICAgICB3aGlsZSAoc2l6ZS0tKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBsZW5ndGgsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiW3NpemVdO1xuXG4gICAgICAgICAgICBpZiAoaXNXaGVyZSkge1xuICAgICAgICAgICAgICB3aGlsZSAoaW5kZXgtLSkge1xuICAgICAgICAgICAgICAgIGlmICgocmVzdWx0ID0gYmFzZUlzRXF1YWwoYVtpbmRleF0sIHZhbHVlLCBjYWxsYmFjaywgaXNXaGVyZSwgc3RhY2tBLCBzdGFja0IpKSkge1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCEocmVzdWx0ID0gYmFzZUlzRXF1YWwoYVtzaXplXSwgdmFsdWUsIGNhbGxiYWNrLCBpc1doZXJlLCBzdGFja0EsIHN0YWNrQikpKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIGRlZXAgY29tcGFyZSBvYmplY3RzIHVzaW5nIGBmb3JJbmAsIGluc3RlYWQgb2YgYGZvck93bmAsIHRvIGF2b2lkIGBPYmplY3Qua2V5c2BcbiAgICAgICAgLy8gd2hpY2gsIGluIHRoaXMgY2FzZSwgaXMgbW9yZSBjb3N0bHlcbiAgICAgICAgZm9ySW4oYiwgZnVuY3Rpb24odmFsdWUsIGtleSwgYikge1xuICAgICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIGtleSkpIHtcbiAgICAgICAgICAgIC8vIGNvdW50IHRoZSBudW1iZXIgb2YgcHJvcGVydGllcy5cbiAgICAgICAgICAgIHNpemUrKztcbiAgICAgICAgICAgIC8vIGRlZXAgY29tcGFyZSBlYWNoIHByb3BlcnR5IHZhbHVlLlxuICAgICAgICAgICAgcmV0dXJuIChyZXN1bHQgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKGEsIGtleSkgJiYgYmFzZUlzRXF1YWwoYVtrZXldLCB2YWx1ZSwgY2FsbGJhY2ssIGlzV2hlcmUsIHN0YWNrQSwgc3RhY2tCKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocmVzdWx0ICYmICFpc1doZXJlKSB7XG4gICAgICAgICAgLy8gZW5zdXJlIGJvdGggb2JqZWN0cyBoYXZlIHRoZSBzYW1lIG51bWJlciBvZiBwcm9wZXJ0aWVzXG4gICAgICAgICAgZm9ySW4oYSwgZnVuY3Rpb24odmFsdWUsIGtleSwgYSkge1xuICAgICAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoYSwga2V5KSkge1xuICAgICAgICAgICAgICAvLyBgc2l6ZWAgd2lsbCBiZSBgLTFgIGlmIGBhYCBoYXMgbW9yZSBwcm9wZXJ0aWVzIHRoYW4gYGJgXG4gICAgICAgICAgICAgIHJldHVybiAocmVzdWx0ID0gLS1zaXplID4gLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzdGFja0EucG9wKCk7XG4gICAgICBzdGFja0IucG9wKCk7XG5cbiAgICAgIGlmIChpbml0ZWRTdGFjaykge1xuICAgICAgICByZWxlYXNlQXJyYXkoc3RhY2tBKTtcbiAgICAgICAgcmVsZWFzZUFycmF5KHN0YWNrQik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLm1lcmdlYCB3aXRob3V0IGFyZ3VtZW50IGp1Z2dsaW5nIG9yIHN1cHBvcnRcbiAgICAgKiBmb3IgYHRoaXNBcmdgIGJpbmRpbmcuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBtZXJnaW5nIHByb3BlcnRpZXMuXG4gICAgICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQT1bXV0gVHJhY2tzIHRyYXZlcnNlZCBzb3VyY2Ugb2JqZWN0cy5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbc3RhY2tCPVtdXSBBc3NvY2lhdGVzIHZhbHVlcyB3aXRoIHNvdXJjZSBjb3VudGVycGFydHMuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmFzZU1lcmdlKG9iamVjdCwgc291cmNlLCBjYWxsYmFjaywgc3RhY2tBLCBzdGFja0IpIHtcbiAgICAgIChpc0FycmF5KHNvdXJjZSkgPyBmb3JFYWNoIDogZm9yT3duKShzb3VyY2UsIGZ1bmN0aW9uKHNvdXJjZSwga2V5KSB7XG4gICAgICAgIHZhciBmb3VuZCxcbiAgICAgICAgICAgIGlzQXJyLFxuICAgICAgICAgICAgcmVzdWx0ID0gc291cmNlLFxuICAgICAgICAgICAgdmFsdWUgPSBvYmplY3Rba2V5XTtcblxuICAgICAgICBpZiAoc291cmNlICYmICgoaXNBcnIgPSBpc0FycmF5KHNvdXJjZSkpIHx8IGlzUGxhaW5PYmplY3Qoc291cmNlKSkpIHtcbiAgICAgICAgICAvLyBhdm9pZCBtZXJnaW5nIHByZXZpb3VzbHkgbWVyZ2VkIGN5Y2xpYyBzb3VyY2VzXG4gICAgICAgICAgdmFyIHN0YWNrTGVuZ3RoID0gc3RhY2tBLmxlbmd0aDtcbiAgICAgICAgICB3aGlsZSAoc3RhY2tMZW5ndGgtLSkge1xuICAgICAgICAgICAgaWYgKChmb3VuZCA9IHN0YWNrQVtzdGFja0xlbmd0aF0gPT0gc291cmNlKSkge1xuICAgICAgICAgICAgICB2YWx1ZSA9IHN0YWNrQltzdGFja0xlbmd0aF07XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgICB2YXIgaXNTaGFsbG93O1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGNhbGxiYWNrKHZhbHVlLCBzb3VyY2UpO1xuICAgICAgICAgICAgICBpZiAoKGlzU2hhbGxvdyA9IHR5cGVvZiByZXN1bHQgIT0gJ3VuZGVmaW5lZCcpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXN1bHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNTaGFsbG93KSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gaXNBcnJcbiAgICAgICAgICAgICAgICA/IChpc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogW10pXG4gICAgICAgICAgICAgICAgOiAoaXNQbGFpbk9iamVjdCh2YWx1ZSkgPyB2YWx1ZSA6IHt9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGFkZCBgc291cmNlYCBhbmQgYXNzb2NpYXRlZCBgdmFsdWVgIHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0c1xuICAgICAgICAgICAgc3RhY2tBLnB1c2goc291cmNlKTtcbiAgICAgICAgICAgIHN0YWNrQi5wdXNoKHZhbHVlKTtcblxuICAgICAgICAgICAgLy8gcmVjdXJzaXZlbHkgbWVyZ2Ugb2JqZWN0cyBhbmQgYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cylcbiAgICAgICAgICAgIGlmICghaXNTaGFsbG93KSB7XG4gICAgICAgICAgICAgIGJhc2VNZXJnZSh2YWx1ZSwgc291cmNlLCBjYWxsYmFjaywgc3RhY2tBLCBzdGFja0IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGNhbGxiYWNrKHZhbHVlLCBzb3VyY2UpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0gc291cmNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdmFsdWUgPSByZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5yYW5kb21gIHdpdGhvdXQgYXJndW1lbnQganVnZ2xpbmcgb3Igc3VwcG9ydFxuICAgICAqIGZvciByZXR1cm5pbmcgZmxvYXRpbmctcG9pbnQgbnVtYmVycy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBUaGUgbWluaW11bSBwb3NzaWJsZSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IFRoZSBtYXhpbXVtIHBvc3NpYmxlIHZhbHVlLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgYSByYW5kb20gbnVtYmVyLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VSYW5kb20obWluLCBtYXgpIHtcbiAgICAgIHJldHVybiBtaW4gKyBmbG9vcihuYXRpdmVSYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udW5pcWAgd2l0aG91dCBzdXBwb3J0IGZvciBjYWxsYmFjayBzaG9ydGhhbmRzXG4gICAgICogb3IgYHRoaXNBcmdgIGJpbmRpbmcuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBwcm9jZXNzLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzU29ydGVkPWZhbHNlXSBBIGZsYWcgdG8gaW5kaWNhdGUgdGhhdCBgYXJyYXlgIGlzIHNvcnRlZC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBkdXBsaWNhdGUtdmFsdWUtZnJlZSBhcnJheS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlVW5pcShhcnJheSwgaXNTb3J0ZWQsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBpbmRleE9mID0gZ2V0SW5kZXhPZigpLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMCxcbiAgICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgICAgdmFyIGlzTGFyZ2UgPSAhaXNTb3J0ZWQgJiYgbGVuZ3RoID49IGxhcmdlQXJyYXlTaXplICYmIGluZGV4T2YgPT09IGJhc2VJbmRleE9mLFxuICAgICAgICAgIHNlZW4gPSAoY2FsbGJhY2sgfHwgaXNMYXJnZSkgPyBnZXRBcnJheSgpIDogcmVzdWx0O1xuXG4gICAgICBpZiAoaXNMYXJnZSkge1xuICAgICAgICB2YXIgY2FjaGUgPSBjcmVhdGVDYWNoZShzZWVuKTtcbiAgICAgICAgaW5kZXhPZiA9IGNhY2hlSW5kZXhPZjtcbiAgICAgICAgc2VlbiA9IGNhY2hlO1xuICAgICAgfVxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gYXJyYXlbaW5kZXhdLFxuICAgICAgICAgICAgY29tcHV0ZWQgPSBjYWxsYmFjayA/IGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgYXJyYXkpIDogdmFsdWU7XG5cbiAgICAgICAgaWYgKGlzU29ydGVkXG4gICAgICAgICAgICAgID8gIWluZGV4IHx8IHNlZW5bc2Vlbi5sZW5ndGggLSAxXSAhPT0gY29tcHV0ZWRcbiAgICAgICAgICAgICAgOiBpbmRleE9mKHNlZW4sIGNvbXB1dGVkKSA8IDBcbiAgICAgICAgICAgICkge1xuICAgICAgICAgIGlmIChjYWxsYmFjayB8fCBpc0xhcmdlKSB7XG4gICAgICAgICAgICBzZWVuLnB1c2goY29tcHV0ZWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpc0xhcmdlKSB7XG4gICAgICAgIHJlbGVhc2VBcnJheShzZWVuLmFycmF5KTtcbiAgICAgICAgcmVsZWFzZU9iamVjdChzZWVuKTtcbiAgICAgIH0gZWxzZSBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgcmVsZWFzZUFycmF5KHNlZW4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBhZ2dyZWdhdGVzIGEgY29sbGVjdGlvbiwgY3JlYXRpbmcgYW4gb2JqZWN0IGNvbXBvc2VkXG4gICAgICogb2Yga2V5cyBnZW5lcmF0ZWQgZnJvbSB0aGUgcmVzdWx0cyBvZiBydW5uaW5nIGVhY2ggZWxlbWVudCBvZiB0aGUgY29sbGVjdGlvblxuICAgICAqIHRocm91Z2ggYSBjYWxsYmFjay4gVGhlIGdpdmVuIGBzZXR0ZXJgIGZ1bmN0aW9uIHNldHMgdGhlIGtleXMgYW5kIHZhbHVlc1xuICAgICAqIG9mIHRoZSBjb21wb3NlZCBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHNldHRlciBUaGUgc2V0dGVyIGZ1bmN0aW9uLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGFnZ3JlZ2F0b3IgZnVuY3Rpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlQWdncmVnYXRvcihzZXR0ZXIpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcblxuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGNvbGxlY3Rpb24gPyBjb2xsZWN0aW9uLmxlbmd0aCA6IDA7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicpIHtcbiAgICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gY29sbGVjdGlvbltpbmRleF07XG4gICAgICAgICAgICBzZXR0ZXIocmVzdWx0LCB2YWx1ZSwgY2FsbGJhY2sodmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSwgY29sbGVjdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwga2V5LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICBzZXR0ZXIocmVzdWx0LCB2YWx1ZSwgY2FsbGJhY2sodmFsdWUsIGtleSwgY29sbGVjdGlvbiksIGNvbGxlY3Rpb24pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgZWl0aGVyIGN1cnJpZXMgb3IgaW52b2tlcyBgZnVuY2BcbiAgICAgKiB3aXRoIGFuIG9wdGlvbmFsIGB0aGlzYCBiaW5kaW5nIGFuZCBwYXJ0aWFsbHkgYXBwbGllZCBhcmd1bWVudHMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258c3RyaW5nfSBmdW5jIFRoZSBmdW5jdGlvbiBvciBtZXRob2QgbmFtZSB0byByZWZlcmVuY2UuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGJpdG1hc2sgVGhlIGJpdG1hc2sgb2YgbWV0aG9kIGZsYWdzIHRvIGNvbXBvc2UuXG4gICAgICogIFRoZSBiaXRtYXNrIG1heSBiZSBjb21wb3NlZCBvZiB0aGUgZm9sbG93aW5nIGZsYWdzOlxuICAgICAqICAxIC0gYF8uYmluZGBcbiAgICAgKiAgMiAtIGBfLmJpbmRLZXlgXG4gICAgICogIDQgLSBgXy5jdXJyeWBcbiAgICAgKiAgOCAtIGBfLmN1cnJ5YCAoYm91bmQpXG4gICAgICogIDE2IC0gYF8ucGFydGlhbGBcbiAgICAgKiAgMzIgLSBgXy5wYXJ0aWFsUmlnaHRgXG4gICAgICogQHBhcmFtIHtBcnJheX0gW3BhcnRpYWxBcmdzXSBBbiBhcnJheSBvZiBhcmd1bWVudHMgdG8gcHJlcGVuZCB0byB0aG9zZVxuICAgICAqICBwcm92aWRlZCB0byB0aGUgbmV3IGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtwYXJ0aWFsUmlnaHRBcmdzXSBBbiBhcnJheSBvZiBhcmd1bWVudHMgdG8gYXBwZW5kIHRvIHRob3NlXG4gICAgICogIHByb3ZpZGVkIHRvIHRoZSBuZXcgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBmdW5jYC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2FyaXR5XSBUaGUgYXJpdHkgb2YgYGZ1bmNgLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNyZWF0ZVdyYXBwZXIoZnVuYywgYml0bWFzaywgcGFydGlhbEFyZ3MsIHBhcnRpYWxSaWdodEFyZ3MsIHRoaXNBcmcsIGFyaXR5KSB7XG4gICAgICB2YXIgaXNCaW5kID0gYml0bWFzayAmIDEsXG4gICAgICAgICAgaXNCaW5kS2V5ID0gYml0bWFzayAmIDIsXG4gICAgICAgICAgaXNDdXJyeSA9IGJpdG1hc2sgJiA0LFxuICAgICAgICAgIGlzQ3VycnlCb3VuZCA9IGJpdG1hc2sgJiA4LFxuICAgICAgICAgIGlzUGFydGlhbCA9IGJpdG1hc2sgJiAxNixcbiAgICAgICAgICBpc1BhcnRpYWxSaWdodCA9IGJpdG1hc2sgJiAzMjtcblxuICAgICAgaWYgKCFpc0JpbmRLZXkgJiYgIWlzRnVuY3Rpb24oZnVuYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICAgIH1cbiAgICAgIGlmIChpc1BhcnRpYWwgJiYgIXBhcnRpYWxBcmdzLmxlbmd0aCkge1xuICAgICAgICBiaXRtYXNrICY9IH4xNjtcbiAgICAgICAgaXNQYXJ0aWFsID0gcGFydGlhbEFyZ3MgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1BhcnRpYWxSaWdodCAmJiAhcGFydGlhbFJpZ2h0QXJncy5sZW5ndGgpIHtcbiAgICAgICAgYml0bWFzayAmPSB+MzI7XG4gICAgICAgIGlzUGFydGlhbFJpZ2h0ID0gcGFydGlhbFJpZ2h0QXJncyA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIGJpbmREYXRhID0gZnVuYyAmJiBmdW5jLl9fYmluZERhdGFfXztcbiAgICAgIGlmIChiaW5kRGF0YSAmJiBiaW5kRGF0YSAhPT0gdHJ1ZSkge1xuICAgICAgICAvLyBjbG9uZSBgYmluZERhdGFgXG4gICAgICAgIGJpbmREYXRhID0gc2xpY2UoYmluZERhdGEpO1xuICAgICAgICBpZiAoYmluZERhdGFbMl0pIHtcbiAgICAgICAgICBiaW5kRGF0YVsyXSA9IHNsaWNlKGJpbmREYXRhWzJdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYmluZERhdGFbM10pIHtcbiAgICAgICAgICBiaW5kRGF0YVszXSA9IHNsaWNlKGJpbmREYXRhWzNdKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzZXQgYHRoaXNCaW5kaW5nYCBpcyBub3QgcHJldmlvdXNseSBib3VuZFxuICAgICAgICBpZiAoaXNCaW5kICYmICEoYmluZERhdGFbMV0gJiAxKSkge1xuICAgICAgICAgIGJpbmREYXRhWzRdID0gdGhpc0FyZztcbiAgICAgICAgfVxuICAgICAgICAvLyBzZXQgaWYgcHJldmlvdXNseSBib3VuZCBidXQgbm90IGN1cnJlbnRseSAoc3Vic2VxdWVudCBjdXJyaWVkIGZ1bmN0aW9ucylcbiAgICAgICAgaWYgKCFpc0JpbmQgJiYgYmluZERhdGFbMV0gJiAxKSB7XG4gICAgICAgICAgYml0bWFzayB8PSA4O1xuICAgICAgICB9XG4gICAgICAgIC8vIHNldCBjdXJyaWVkIGFyaXR5IGlmIG5vdCB5ZXQgc2V0XG4gICAgICAgIGlmIChpc0N1cnJ5ICYmICEoYmluZERhdGFbMV0gJiA0KSkge1xuICAgICAgICAgIGJpbmREYXRhWzVdID0gYXJpdHk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYXBwZW5kIHBhcnRpYWwgbGVmdCBhcmd1bWVudHNcbiAgICAgICAgaWYgKGlzUGFydGlhbCkge1xuICAgICAgICAgIHB1c2guYXBwbHkoYmluZERhdGFbMl0gfHwgKGJpbmREYXRhWzJdID0gW10pLCBwYXJ0aWFsQXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYXBwZW5kIHBhcnRpYWwgcmlnaHQgYXJndW1lbnRzXG4gICAgICAgIGlmIChpc1BhcnRpYWxSaWdodCkge1xuICAgICAgICAgIHVuc2hpZnQuYXBwbHkoYmluZERhdGFbM10gfHwgKGJpbmREYXRhWzNdID0gW10pLCBwYXJ0aWFsUmlnaHRBcmdzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBtZXJnZSBmbGFnc1xuICAgICAgICBiaW5kRGF0YVsxXSB8PSBiaXRtYXNrO1xuICAgICAgICByZXR1cm4gY3JlYXRlV3JhcHBlci5hcHBseShudWxsLCBiaW5kRGF0YSk7XG4gICAgICB9XG4gICAgICAvLyBmYXN0IHBhdGggZm9yIGBfLmJpbmRgXG4gICAgICB2YXIgY3JlYXRlciA9IChiaXRtYXNrID09IDEgfHwgYml0bWFzayA9PT0gMTcpID8gYmFzZUJpbmQgOiBiYXNlQ3JlYXRlV3JhcHBlcjtcbiAgICAgIHJldHVybiBjcmVhdGVyKFtmdW5jLCBiaXRtYXNrLCBwYXJ0aWFsQXJncywgcGFydGlhbFJpZ2h0QXJncywgdGhpc0FyZywgYXJpdHldKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2VkIGJ5IGBlc2NhcGVgIHRvIGNvbnZlcnQgY2hhcmFjdGVycyB0byBIVE1MIGVudGl0aWVzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbWF0Y2ggVGhlIG1hdGNoZWQgY2hhcmFjdGVyIHRvIGVzY2FwZS5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBlc2NhcGVkIGNoYXJhY3Rlci5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlc2NhcGVIdG1sQ2hhcihtYXRjaCkge1xuICAgICAgcmV0dXJuIGh0bWxFc2NhcGVzW21hdGNoXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBhcHByb3ByaWF0ZSBcImluZGV4T2ZcIiBmdW5jdGlvbi4gSWYgdGhlIGBfLmluZGV4T2ZgIG1ldGhvZCBpc1xuICAgICAqIGN1c3RvbWl6ZWQsIHRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGN1c3RvbSBtZXRob2QsIG90aGVyd2lzZSBpdCByZXR1cm5zXG4gICAgICogdGhlIGBiYXNlSW5kZXhPZmAgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgXCJpbmRleE9mXCIgZnVuY3Rpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0SW5kZXhPZigpIHtcbiAgICAgIHZhciByZXN1bHQgPSAocmVzdWx0ID0gbG9kYXNoLmluZGV4T2YpID09PSBpbmRleE9mID8gYmFzZUluZGV4T2YgOiByZXN1bHQ7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc05hdGl2ZSh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nICYmIHJlTmF0aXZlLnRlc3QodmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgYHRoaXNgIGJpbmRpbmcgZGF0YSBvbiBhIGdpdmVuIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBzZXQgZGF0YSBvbi5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSB2YWx1ZSBUaGUgZGF0YSBhcnJheSB0byBzZXQuXG4gICAgICovXG4gICAgdmFyIHNldEJpbmREYXRhID0gIWRlZmluZVByb3BlcnR5ID8gbm9vcCA6IGZ1bmN0aW9uKGZ1bmMsIHZhbHVlKSB7XG4gICAgICBkZXNjcmlwdG9yLnZhbHVlID0gdmFsdWU7XG4gICAgICBkZWZpbmVQcm9wZXJ0eShmdW5jLCAnX19iaW5kRGF0YV9fJywgZGVzY3JpcHRvcik7XG4gICAgICBkZXNjcmlwdG9yLnZhbHVlID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQSBmYWxsYmFjayBpbXBsZW1lbnRhdGlvbiBvZiBgaXNQbGFpbk9iamVjdGAgd2hpY2ggY2hlY2tzIGlmIGEgZ2l2ZW4gdmFsdWVcbiAgICAgKiBpcyBhbiBvYmplY3QgY3JlYXRlZCBieSB0aGUgYE9iamVjdGAgY29uc3RydWN0b3IsIGFzc3VtaW5nIG9iamVjdHMgY3JlYXRlZFxuICAgICAqIGJ5IHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3RvciBoYXZlIG5vIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnRpZXMgYW5kIHRoYXRcbiAgICAgKiB0aGVyZSBhcmUgbm8gYE9iamVjdC5wcm90b3R5cGVgIGV4dGVuc2lvbnMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gc2hpbUlzUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgICAgIHZhciBjdG9yLFxuICAgICAgICAgIHJlc3VsdDtcblxuICAgICAgLy8gYXZvaWQgbm9uIE9iamVjdCBvYmplY3RzLCBgYXJndW1lbnRzYCBvYmplY3RzLCBhbmQgRE9NIGVsZW1lbnRzXG4gICAgICBpZiAoISh2YWx1ZSAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PSBvYmplY3RDbGFzcykgfHxcbiAgICAgICAgICAoY3RvciA9IHZhbHVlLmNvbnN0cnVjdG9yLCBpc0Z1bmN0aW9uKGN0b3IpICYmICEoY3RvciBpbnN0YW5jZW9mIGN0b3IpKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAvLyBJbiBtb3N0IGVudmlyb25tZW50cyBhbiBvYmplY3QncyBvd24gcHJvcGVydGllcyBhcmUgaXRlcmF0ZWQgYmVmb3JlXG4gICAgICAvLyBpdHMgaW5oZXJpdGVkIHByb3BlcnRpZXMuIElmIHRoZSBsYXN0IGl0ZXJhdGVkIHByb3BlcnR5IGlzIGFuIG9iamVjdCdzXG4gICAgICAvLyBvd24gcHJvcGVydHkgdGhlbiB0aGVyZSBhcmUgbm8gaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydGllcy5cbiAgICAgIGZvckluKHZhbHVlLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIHJlc3VsdCA9IGtleTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHR5cGVvZiByZXN1bHQgPT0gJ3VuZGVmaW5lZCcgfHwgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgcmVzdWx0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVc2VkIGJ5IGB1bmVzY2FwZWAgdG8gY29udmVydCBIVE1MIGVudGl0aWVzIHRvIGNoYXJhY3RlcnMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtYXRjaCBUaGUgbWF0Y2hlZCBjaGFyYWN0ZXIgdG8gdW5lc2NhcGUuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgdW5lc2NhcGVkIGNoYXJhY3Rlci5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1bmVzY2FwZUh0bWxDaGFyKG1hdGNoKSB7XG4gICAgICByZXR1cm4gaHRtbFVuZXNjYXBlc1ttYXRjaF07XG4gICAgfVxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogKGZ1bmN0aW9uKCkgeyByZXR1cm4gXy5pc0FyZ3VtZW50cyhhcmd1bWVudHMpOyB9KSgxLCAyLCAzKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzQXJndW1lbnRzKFsxLCAyLCAzXSk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0FyZ3VtZW50cyh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUubGVuZ3RoID09ICdudW1iZXInICYmXG4gICAgICAgIHRvU3RyaW5nLmNhbGwodmFsdWUpID09IGFyZ3NDbGFzcyB8fCBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhbiBhcnJheS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYW4gYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogKGZ1bmN0aW9uKCkgeyByZXR1cm4gXy5pc0FycmF5KGFyZ3VtZW50cyk7IH0pKCk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKi9cbiAgICB2YXIgaXNBcnJheSA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlLmxlbmd0aCA9PSAnbnVtYmVyJyAmJlxuICAgICAgICB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PSBhcnJheUNsYXNzIHx8IGZhbHNlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBIGZhbGxiYWNrIGltcGxlbWVudGF0aW9uIG9mIGBPYmplY3Qua2V5c2Agd2hpY2ggcHJvZHVjZXMgYW4gYXJyYXkgb2YgdGhlXG4gICAgICogZ2l2ZW4gb2JqZWN0J3Mgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGluc3BlY3QuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGFuIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICAgICAqL1xuICAgIHZhciBzaGltS2V5cyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgdmFyIGluZGV4LCBpdGVyYWJsZSA9IG9iamVjdCwgcmVzdWx0ID0gW107XG4gICAgICBpZiAoIWl0ZXJhYmxlKSByZXR1cm4gcmVzdWx0O1xuICAgICAgaWYgKCEob2JqZWN0VHlwZXNbdHlwZW9mIG9iamVjdF0pKSByZXR1cm4gcmVzdWx0O1xuICAgICAgICBmb3IgKGluZGV4IGluIGl0ZXJhYmxlKSB7XG4gICAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoaXRlcmFibGUsIGluZGV4KSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goaW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFycmF5IGNvbXBvc2VkIG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBhbiBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5rZXlzKHsgJ29uZSc6IDEsICd0d28nOiAyLCAndGhyZWUnOiAzIH0pO1xuICAgICAqIC8vID0+IFsnb25lJywgJ3R3bycsICd0aHJlZSddIChwcm9wZXJ0eSBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCBhY3Jvc3MgZW52aXJvbm1lbnRzKVxuICAgICAqL1xuICAgIHZhciBrZXlzID0gIW5hdGl2ZUtleXMgPyBzaGltS2V5cyA6IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuYXRpdmVLZXlzKG9iamVjdCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gY29udmVydCBjaGFyYWN0ZXJzIHRvIEhUTUwgZW50aXRpZXM6XG4gICAgICpcbiAgICAgKiBUaG91Z2ggdGhlIGA+YCBjaGFyYWN0ZXIgaXMgZXNjYXBlZCBmb3Igc3ltbWV0cnksIGNoYXJhY3RlcnMgbGlrZSBgPmAgYW5kIGAvYFxuICAgICAqIGRvbid0IHJlcXVpcmUgZXNjYXBpbmcgaW4gSFRNTCBhbmQgaGF2ZSBubyBzcGVjaWFsIG1lYW5pbmcgdW5sZXNzIHRoZXkncmUgcGFydFxuICAgICAqIG9mIGEgdGFnIG9yIGFuIHVucXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZS5cbiAgICAgKiBodHRwOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9hbWJpZ3VvdXMtYW1wZXJzYW5kcyAodW5kZXIgXCJzZW1pLXJlbGF0ZWQgZnVuIGZhY3RcIilcbiAgICAgKi9cbiAgICB2YXIgaHRtbEVzY2FwZXMgPSB7XG4gICAgICAnJic6ICcmYW1wOycsXG4gICAgICAnPCc6ICcmbHQ7JyxcbiAgICAgICc+JzogJyZndDsnLFxuICAgICAgJ1wiJzogJyZxdW90OycsXG4gICAgICBcIidcIjogJyYjMzk7J1xuICAgIH07XG5cbiAgICAvKiogVXNlZCB0byBjb252ZXJ0IEhUTUwgZW50aXRpZXMgdG8gY2hhcmFjdGVycyAqL1xuICAgIHZhciBodG1sVW5lc2NhcGVzID0gaW52ZXJ0KGh0bWxFc2NhcGVzKTtcblxuICAgIC8qKiBVc2VkIHRvIG1hdGNoIEhUTUwgZW50aXRpZXMgYW5kIEhUTUwgY2hhcmFjdGVycyAqL1xuICAgIHZhciByZUVzY2FwZWRIdG1sID0gUmVnRXhwKCcoJyArIGtleXMoaHRtbFVuZXNjYXBlcykuam9pbignfCcpICsgJyknLCAnZycpLFxuICAgICAgICByZVVuZXNjYXBlZEh0bWwgPSBSZWdFeHAoJ1snICsga2V5cyhodG1sRXNjYXBlcykuam9pbignJykgKyAnXScsICdnJyk7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKlxuICAgICAqIEFzc2lnbnMgb3duIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBzb3VyY2Ugb2JqZWN0KHMpIHRvIHRoZSBkZXN0aW5hdGlvblxuICAgICAqIG9iamVjdC4gU3Vic2VxdWVudCBzb3VyY2VzIHdpbGwgb3ZlcndyaXRlIHByb3BlcnR5IGFzc2lnbm1lbnRzIG9mIHByZXZpb3VzXG4gICAgICogc291cmNlcy4gSWYgYSBjYWxsYmFjayBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIGV4ZWN1dGVkIHRvIHByb2R1Y2UgdGhlXG4gICAgICogYXNzaWduZWQgdmFsdWVzLiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdHdvXG4gICAgICogYXJndW1lbnRzOyAob2JqZWN0VmFsdWUsIHNvdXJjZVZhbHVlKS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICogQGFsaWFzIGV4dGVuZFxuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7Li4uT2JqZWN0fSBbc291cmNlXSBUaGUgc291cmNlIG9iamVjdHMuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGFzc2lnbmluZyB2YWx1ZXMuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmFzc2lnbih7ICduYW1lJzogJ2ZyZWQnIH0sIHsgJ2VtcGxveWVyJzogJ3NsYXRlJyB9KTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ2ZyZWQnLCAnZW1wbG95ZXInOiAnc2xhdGUnIH1cbiAgICAgKlxuICAgICAqIHZhciBkZWZhdWx0cyA9IF8ucGFydGlhbFJpZ2h0KF8uYXNzaWduLCBmdW5jdGlvbihhLCBiKSB7XG4gICAgICogICByZXR1cm4gdHlwZW9mIGEgPT0gJ3VuZGVmaW5lZCcgPyBiIDogYTtcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIHZhciBvYmplY3QgPSB7ICduYW1lJzogJ2Jhcm5leScgfTtcbiAgICAgKiBkZWZhdWx0cyhvYmplY3QsIHsgJ25hbWUnOiAnZnJlZCcsICdlbXBsb3llcic6ICdzbGF0ZScgfSk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdiYXJuZXknLCAnZW1wbG95ZXInOiAnc2xhdGUnIH1cbiAgICAgKi9cbiAgICB2YXIgYXNzaWduID0gZnVuY3Rpb24ob2JqZWN0LCBzb3VyY2UsIGd1YXJkKSB7XG4gICAgICB2YXIgaW5kZXgsIGl0ZXJhYmxlID0gb2JqZWN0LCByZXN1bHQgPSBpdGVyYWJsZTtcbiAgICAgIGlmICghaXRlcmFibGUpIHJldHVybiByZXN1bHQ7XG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgICBhcmdzSW5kZXggPSAwLFxuICAgICAgICAgIGFyZ3NMZW5ndGggPSB0eXBlb2YgZ3VhcmQgPT0gJ251bWJlcicgPyAyIDogYXJncy5sZW5ndGg7XG4gICAgICBpZiAoYXJnc0xlbmd0aCA+IDMgJiYgdHlwZW9mIGFyZ3NbYXJnc0xlbmd0aCAtIDJdID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gYmFzZUNyZWF0ZUNhbGxiYWNrKGFyZ3NbLS1hcmdzTGVuZ3RoIC0gMV0sIGFyZ3NbYXJnc0xlbmd0aC0tXSwgMik7XG4gICAgICB9IGVsc2UgaWYgKGFyZ3NMZW5ndGggPiAyICYmIHR5cGVvZiBhcmdzW2FyZ3NMZW5ndGggLSAxXSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNhbGxiYWNrID0gYXJnc1stLWFyZ3NMZW5ndGhdO1xuICAgICAgfVxuICAgICAgd2hpbGUgKCsrYXJnc0luZGV4IDwgYXJnc0xlbmd0aCkge1xuICAgICAgICBpdGVyYWJsZSA9IGFyZ3NbYXJnc0luZGV4XTtcbiAgICAgICAgaWYgKGl0ZXJhYmxlICYmIG9iamVjdFR5cGVzW3R5cGVvZiBpdGVyYWJsZV0pIHtcbiAgICAgICAgdmFyIG93bkluZGV4ID0gLTEsXG4gICAgICAgICAgICBvd25Qcm9wcyA9IG9iamVjdFR5cGVzW3R5cGVvZiBpdGVyYWJsZV0gJiYga2V5cyhpdGVyYWJsZSksXG4gICAgICAgICAgICBsZW5ndGggPSBvd25Qcm9wcyA/IG93blByb3BzLmxlbmd0aCA6IDA7XG5cbiAgICAgICAgd2hpbGUgKCsrb3duSW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICBpbmRleCA9IG93blByb3BzW293bkluZGV4XTtcbiAgICAgICAgICByZXN1bHRbaW5kZXhdID0gY2FsbGJhY2sgPyBjYWxsYmFjayhyZXN1bHRbaW5kZXhdLCBpdGVyYWJsZVtpbmRleF0pIDogaXRlcmFibGVbaW5kZXhdO1xuICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGNsb25lIG9mIGB2YWx1ZWAuIElmIGBpc0RlZXBgIGlzIGB0cnVlYCBuZXN0ZWQgb2JqZWN0cyB3aWxsIGFsc29cbiAgICAgKiBiZSBjbG9uZWQsIG90aGVyd2lzZSB0aGV5IHdpbGwgYmUgYXNzaWduZWQgYnkgcmVmZXJlbmNlLiBJZiBhIGNhbGxiYWNrXG4gICAgICogaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSBleGVjdXRlZCB0byBwcm9kdWNlIHRoZSBjbG9uZWQgdmFsdWVzLiBJZiB0aGVcbiAgICAgKiBjYWxsYmFjayByZXR1cm5zIGB1bmRlZmluZWRgIGNsb25pbmcgd2lsbCBiZSBoYW5kbGVkIGJ5IHRoZSBtZXRob2QgaW5zdGVhZC5cbiAgICAgKiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50OyAodmFsdWUpLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjbG9uZS5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXA9ZmFsc2VdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjbG9uaW5nIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgY2xvbmVkIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIHZhciBzaGFsbG93ID0gXy5jbG9uZShjaGFyYWN0ZXJzKTtcbiAgICAgKiBzaGFsbG93WzBdID09PSBjaGFyYWN0ZXJzWzBdO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIHZhciBkZWVwID0gXy5jbG9uZShjaGFyYWN0ZXJzLCB0cnVlKTtcbiAgICAgKiBkZWVwWzBdID09PSBjaGFyYWN0ZXJzWzBdO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICpcbiAgICAgKiBfLm1peGluKHtcbiAgICAgKiAgICdjbG9uZSc6IF8ucGFydGlhbFJpZ2h0KF8uY2xvbmUsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICogICAgIHJldHVybiBfLmlzRWxlbWVudCh2YWx1ZSkgPyB2YWx1ZS5jbG9uZU5vZGUoZmFsc2UpIDogdW5kZWZpbmVkO1xuICAgICAqICAgfSlcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIHZhciBjbG9uZSA9IF8uY2xvbmUoZG9jdW1lbnQuYm9keSk7XG4gICAgICogY2xvbmUuY2hpbGROb2Rlcy5sZW5ndGg7XG4gICAgICogLy8gPT4gMFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNsb25lKHZhbHVlLCBpc0RlZXAsIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICAvLyBhbGxvd3Mgd29ya2luZyB3aXRoIFwiQ29sbGVjdGlvbnNcIiBtZXRob2RzIHdpdGhvdXQgdXNpbmcgdGhlaXIgYGluZGV4YFxuICAgICAgLy8gYW5kIGBjb2xsZWN0aW9uYCBhcmd1bWVudHMgZm9yIGBpc0RlZXBgIGFuZCBgY2FsbGJhY2tgXG4gICAgICBpZiAodHlwZW9mIGlzRGVlcCAhPSAnYm9vbGVhbicgJiYgaXNEZWVwICE9IG51bGwpIHtcbiAgICAgICAgdGhpc0FyZyA9IGNhbGxiYWNrO1xuICAgICAgICBjYWxsYmFjayA9IGlzRGVlcDtcbiAgICAgICAgaXNEZWVwID0gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZUNsb25lKHZhbHVlLCBpc0RlZXAsIHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nICYmIGJhc2VDcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBkZWVwIGNsb25lIG9mIGB2YWx1ZWAuIElmIGEgY2FsbGJhY2sgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZVxuICAgICAqIGV4ZWN1dGVkIHRvIHByb2R1Y2UgdGhlIGNsb25lZCB2YWx1ZXMuIElmIHRoZSBjYWxsYmFjayByZXR1cm5zIGB1bmRlZmluZWRgXG4gICAgICogY2xvbmluZyB3aWxsIGJlIGhhbmRsZWQgYnkgdGhlIG1ldGhvZCBpbnN0ZWFkLiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG9cbiAgICAgKiBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ7ICh2YWx1ZSkuXG4gICAgICpcbiAgICAgKiBOb3RlOiBUaGlzIG1ldGhvZCBpcyBsb29zZWx5IGJhc2VkIG9uIHRoZSBzdHJ1Y3R1cmVkIGNsb25lIGFsZ29yaXRobS4gRnVuY3Rpb25zXG4gICAgICogYW5kIERPTSBub2RlcyBhcmUgKipub3QqKiBjbG9uZWQuIFRoZSBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2YgYGFyZ3VtZW50c2Agb2JqZWN0cyBhbmRcbiAgICAgKiBvYmplY3RzIGNyZWF0ZWQgYnkgY29uc3RydWN0b3JzIG90aGVyIHRoYW4gYE9iamVjdGAgYXJlIGNsb25lZCB0byBwbGFpbiBgT2JqZWN0YCBvYmplY3RzLlxuICAgICAqIFNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNS9pbmZyYXN0cnVjdHVyZS5odG1sI2ludGVybmFsLXN0cnVjdHVyZWQtY2xvbmluZy1hbGdvcml0aG0uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGRlZXAgY2xvbmUuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNsb25pbmcgdmFsdWVzLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBkZWVwIGNsb25lZCB2YWx1ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAnYWdlJzogNDAgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiB2YXIgZGVlcCA9IF8uY2xvbmVEZWVwKGNoYXJhY3RlcnMpO1xuICAgICAqIGRlZXBbMF0gPT09IGNoYXJhY3RlcnNbMF07XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIHZhciB2aWV3ID0ge1xuICAgICAqICAgJ2xhYmVsJzogJ2RvY3MnLFxuICAgICAqICAgJ25vZGUnOiBlbGVtZW50XG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIHZhciBjbG9uZSA9IF8uY2xvbmVEZWVwKHZpZXcsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICogICByZXR1cm4gXy5pc0VsZW1lbnQodmFsdWUpID8gdmFsdWUuY2xvbmVOb2RlKHRydWUpIDogdW5kZWZpbmVkO1xuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogY2xvbmUubm9kZSA9PSB2aWV3Lm5vZGU7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjbG9uZURlZXAodmFsdWUsIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICByZXR1cm4gYmFzZUNsb25lKHZhbHVlLCB0cnVlLCB0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJyAmJiBiYXNlQ3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIG9iamVjdCB0aGF0IGluaGVyaXRzIGZyb20gdGhlIGdpdmVuIGBwcm90b3R5cGVgIG9iamVjdC4gSWYgYVxuICAgICAqIGBwcm9wZXJ0aWVzYCBvYmplY3QgaXMgcHJvdmlkZWQgaXRzIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgYXJlIGFzc2lnbmVkXG4gICAgICogdG8gdGhlIGNyZWF0ZWQgb2JqZWN0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvdG90eXBlIFRoZSBvYmplY3QgdG8gaW5oZXJpdCBmcm9tLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcGVydGllc10gVGhlIHByb3BlcnRpZXMgdG8gYXNzaWduIHRvIHRoZSBvYmplY3QuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbmV3IG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogZnVuY3Rpb24gU2hhcGUoKSB7XG4gICAgICogICB0aGlzLnggPSAwO1xuICAgICAqICAgdGhpcy55ID0gMDtcbiAgICAgKiB9XG4gICAgICpcbiAgICAgKiBmdW5jdGlvbiBDaXJjbGUoKSB7XG4gICAgICogICBTaGFwZS5jYWxsKHRoaXMpO1xuICAgICAqIH1cbiAgICAgKlxuICAgICAqIENpcmNsZS5wcm90b3R5cGUgPSBfLmNyZWF0ZShTaGFwZS5wcm90b3R5cGUsIHsgJ2NvbnN0cnVjdG9yJzogQ2lyY2xlIH0pO1xuICAgICAqXG4gICAgICogdmFyIGNpcmNsZSA9IG5ldyBDaXJjbGU7XG4gICAgICogY2lyY2xlIGluc3RhbmNlb2YgQ2lyY2xlO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIGNpcmNsZSBpbnN0YW5jZW9mIFNoYXBlO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjcmVhdGUocHJvdG90eXBlLCBwcm9wZXJ0aWVzKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gYmFzZUNyZWF0ZShwcm90b3R5cGUpO1xuICAgICAgcmV0dXJuIHByb3BlcnRpZXMgPyBhc3NpZ24ocmVzdWx0LCBwcm9wZXJ0aWVzKSA6IHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBc3NpZ25zIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2Ygc291cmNlIG9iamVjdChzKSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgKiBvYmplY3QgZm9yIGFsbCBkZXN0aW5hdGlvbiBwcm9wZXJ0aWVzIHRoYXQgcmVzb2x2ZSB0byBgdW5kZWZpbmVkYC4gT25jZSBhXG4gICAgICogcHJvcGVydHkgaXMgc2V0LCBhZGRpdGlvbmFsIGRlZmF1bHRzIG9mIHRoZSBzYW1lIHByb3BlcnR5IHdpbGwgYmUgaWdub3JlZC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gICAgICogQHBhcmFtIHsuLi5PYmplY3R9IFtzb3VyY2VdIFRoZSBzb3VyY2Ugb2JqZWN0cy5cbiAgICAgKiBAcGFyYW0tIHtPYmplY3R9IFtndWFyZF0gQWxsb3dzIHdvcmtpbmcgd2l0aCBgXy5yZWR1Y2VgIHdpdGhvdXQgdXNpbmcgaXRzXG4gICAgICogIGBrZXlgIGFuZCBgb2JqZWN0YCBhcmd1bWVudHMgYXMgc291cmNlcy5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBvYmplY3QgPSB7ICduYW1lJzogJ2Jhcm5leScgfTtcbiAgICAgKiBfLmRlZmF1bHRzKG9iamVjdCwgeyAnbmFtZSc6ICdmcmVkJywgJ2VtcGxveWVyJzogJ3NsYXRlJyB9KTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ2Jhcm5leScsICdlbXBsb3llcic6ICdzbGF0ZScgfVxuICAgICAqL1xuICAgIHZhciBkZWZhdWx0cyA9IGZ1bmN0aW9uKG9iamVjdCwgc291cmNlLCBndWFyZCkge1xuICAgICAgdmFyIGluZGV4LCBpdGVyYWJsZSA9IG9iamVjdCwgcmVzdWx0ID0gaXRlcmFibGU7XG4gICAgICBpZiAoIWl0ZXJhYmxlKSByZXR1cm4gcmVzdWx0O1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgYXJnc0luZGV4ID0gMCxcbiAgICAgICAgICBhcmdzTGVuZ3RoID0gdHlwZW9mIGd1YXJkID09ICdudW1iZXInID8gMiA6IGFyZ3MubGVuZ3RoO1xuICAgICAgd2hpbGUgKCsrYXJnc0luZGV4IDwgYXJnc0xlbmd0aCkge1xuICAgICAgICBpdGVyYWJsZSA9IGFyZ3NbYXJnc0luZGV4XTtcbiAgICAgICAgaWYgKGl0ZXJhYmxlICYmIG9iamVjdFR5cGVzW3R5cGVvZiBpdGVyYWJsZV0pIHtcbiAgICAgICAgdmFyIG93bkluZGV4ID0gLTEsXG4gICAgICAgICAgICBvd25Qcm9wcyA9IG9iamVjdFR5cGVzW3R5cGVvZiBpdGVyYWJsZV0gJiYga2V5cyhpdGVyYWJsZSksXG4gICAgICAgICAgICBsZW5ndGggPSBvd25Qcm9wcyA/IG93blByb3BzLmxlbmd0aCA6IDA7XG5cbiAgICAgICAgd2hpbGUgKCsrb3duSW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICBpbmRleCA9IG93blByb3BzW293bkluZGV4XTtcbiAgICAgICAgICBpZiAodHlwZW9mIHJlc3VsdFtpbmRleF0gPT0gJ3VuZGVmaW5lZCcpIHJlc3VsdFtpbmRleF0gPSBpdGVyYWJsZVtpbmRleF07XG4gICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmZpbmRJbmRleGAgZXhjZXB0IHRoYXQgaXQgcmV0dXJucyB0aGUga2V5IG9mIHRoZVxuICAgICAqIGZpcnN0IGVsZW1lbnQgdGhhdCBwYXNzZXMgdGhlIGNhbGxiYWNrIGNoZWNrLCBpbnN0ZWFkIG9mIHRoZSBlbGVtZW50IGl0c2VsZi5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gc2VhcmNoLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlclxuICAgICAqICBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkIHRvXG4gICAgICogIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge3N0cmluZ3x1bmRlZmluZWR9IFJldHVybnMgdGhlIGtleSBvZiB0aGUgZm91bmQgZWxlbWVudCwgZWxzZSBgdW5kZWZpbmVkYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSB7XG4gICAgICogICAnYmFybmV5JzogeyAgJ2FnZSc6IDM2LCAnYmxvY2tlZCc6IGZhbHNlIH0sXG4gICAgICogICAnZnJlZCc6IHsgICAgJ2FnZSc6IDQwLCAnYmxvY2tlZCc6IHRydWUgfSxcbiAgICAgKiAgICdwZWJibGVzJzogeyAnYWdlJzogMSwgICdibG9ja2VkJzogZmFsc2UgfVxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiBfLmZpbmRLZXkoY2hhcmFjdGVycywgZnVuY3Rpb24oY2hyKSB7XG4gICAgICogICByZXR1cm4gY2hyLmFnZSA8IDQwO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+ICdiYXJuZXknIChwcm9wZXJ0eSBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCBhY3Jvc3MgZW52aXJvbm1lbnRzKVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLndoZXJlXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maW5kS2V5KGNoYXJhY3RlcnMsIHsgJ2FnZSc6IDEgfSk7XG4gICAgICogLy8gPT4gJ3BlYmJsZXMnXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmZpbmRLZXkoY2hhcmFjdGVycywgJ2Jsb2NrZWQnKTtcbiAgICAgKiAvLyA9PiAnZnJlZCdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmaW5kS2V5KG9iamVjdCwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciByZXN1bHQ7XG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICBmb3JPd24ob2JqZWN0LCBmdW5jdGlvbih2YWx1ZSwga2V5LCBvYmplY3QpIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKHZhbHVlLCBrZXksIG9iamVjdCkpIHtcbiAgICAgICAgICByZXN1bHQgPSBrZXk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5maW5kS2V5YCBleGNlcHQgdGhhdCBpdCBpdGVyYXRlcyBvdmVyIGVsZW1lbnRzXG4gICAgICogb2YgYSBgY29sbGVjdGlvbmAgaW4gdGhlIG9wcG9zaXRlIG9yZGVyLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBzZWFyY2guXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyXG4gICAgICogIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWQgdG9cbiAgICAgKiAgY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfHVuZGVmaW5lZH0gUmV0dXJucyB0aGUga2V5IG9mIHRoZSBmb3VuZCBlbGVtZW50LCBlbHNlIGB1bmRlZmluZWRgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IHtcbiAgICAgKiAgICdiYXJuZXknOiB7ICAnYWdlJzogMzYsICdibG9ja2VkJzogdHJ1ZSB9LFxuICAgICAqICAgJ2ZyZWQnOiB7ICAgICdhZ2UnOiA0MCwgJ2Jsb2NrZWQnOiBmYWxzZSB9LFxuICAgICAqICAgJ3BlYmJsZXMnOiB7ICdhZ2UnOiAxLCAgJ2Jsb2NrZWQnOiB0cnVlIH1cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy5maW5kTGFzdEtleShjaGFyYWN0ZXJzLCBmdW5jdGlvbihjaHIpIHtcbiAgICAgKiAgIHJldHVybiBjaHIuYWdlIDwgNDA7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gcmV0dXJucyBgcGViYmxlc2AsIGFzc3VtaW5nIGBfLmZpbmRLZXlgIHJldHVybnMgYGJhcm5leWBcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy53aGVyZVwiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uZmluZExhc3RLZXkoY2hhcmFjdGVycywgeyAnYWdlJzogNDAgfSk7XG4gICAgICogLy8gPT4gJ2ZyZWQnXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmZpbmRMYXN0S2V5KGNoYXJhY3RlcnMsICdibG9ja2VkJyk7XG4gICAgICogLy8gPT4gJ3BlYmJsZXMnXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmluZExhc3RLZXkob2JqZWN0LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIHJlc3VsdDtcbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgIGZvck93blJpZ2h0KG9iamVjdCwgZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqZWN0KSB7XG4gICAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwga2V5LCBvYmplY3QpKSB7XG4gICAgICAgICAgcmVzdWx0ID0ga2V5O1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEl0ZXJhdGVzIG92ZXIgb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdCxcbiAgICAgKiBleGVjdXRpbmcgdGhlIGNhbGxiYWNrIGZvciBlYWNoIHByb3BlcnR5LiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgXG4gICAgICogYW5kIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM7ICh2YWx1ZSwga2V5LCBvYmplY3QpLiBDYWxsYmFja3MgbWF5IGV4aXRcbiAgICAgKiBpdGVyYXRpb24gZWFybHkgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIGZ1bmN0aW9uIFNoYXBlKCkge1xuICAgICAqICAgdGhpcy54ID0gMDtcbiAgICAgKiAgIHRoaXMueSA9IDA7XG4gICAgICogfVxuICAgICAqXG4gICAgICogU2hhcGUucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgICogICB0aGlzLnggKz0geDtcbiAgICAgKiAgIHRoaXMueSArPSB5O1xuICAgICAqIH07XG4gICAgICpcbiAgICAgKiBfLmZvckluKG5ldyBTaGFwZSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAqICAgY29uc29sZS5sb2coa2V5KTtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiBsb2dzICd4JywgJ3knLCBhbmQgJ21vdmUnIChwcm9wZXJ0eSBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCBhY3Jvc3MgZW52aXJvbm1lbnRzKVxuICAgICAqL1xuICAgIHZhciBmb3JJbiA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgaW5kZXgsIGl0ZXJhYmxlID0gY29sbGVjdGlvbiwgcmVzdWx0ID0gaXRlcmFibGU7XG4gICAgICBpZiAoIWl0ZXJhYmxlKSByZXR1cm4gcmVzdWx0O1xuICAgICAgaWYgKCFvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdKSByZXR1cm4gcmVzdWx0O1xuICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayAmJiB0eXBlb2YgdGhpc0FyZyA9PSAndW5kZWZpbmVkJyA/IGNhbGxiYWNrIDogYmFzZUNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgICAgZm9yIChpbmRleCBpbiBpdGVyYWJsZSkge1xuICAgICAgICAgIGlmIChjYWxsYmFjayhpdGVyYWJsZVtpbmRleF0sIGluZGV4LCBjb2xsZWN0aW9uKSA9PT0gZmFsc2UpIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5mb3JJbmAgZXhjZXB0IHRoYXQgaXQgaXRlcmF0ZXMgb3ZlciBlbGVtZW50c1xuICAgICAqIG9mIGEgYGNvbGxlY3Rpb25gIGluIHRoZSBvcHBvc2l0ZSBvcmRlci5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBmdW5jdGlvbiBTaGFwZSgpIHtcbiAgICAgKiAgIHRoaXMueCA9IDA7XG4gICAgICogICB0aGlzLnkgPSAwO1xuICAgICAqIH1cbiAgICAgKlxuICAgICAqIFNoYXBlLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAqICAgdGhpcy54ICs9IHg7XG4gICAgICogICB0aGlzLnkgKz0geTtcbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy5mb3JJblJpZ2h0KG5ldyBTaGFwZSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAqICAgY29uc29sZS5sb2coa2V5KTtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiBsb2dzICdtb3ZlJywgJ3knLCBhbmQgJ3gnIGFzc3VtaW5nIGBfLmZvckluIGAgbG9ncyAneCcsICd5JywgYW5kICdtb3ZlJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZvckluUmlnaHQob2JqZWN0LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIHBhaXJzID0gW107XG5cbiAgICAgIGZvckluKG9iamVjdCwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICBwYWlycy5wdXNoKGtleSwgdmFsdWUpO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBsZW5ndGggPSBwYWlycy5sZW5ndGg7XG4gICAgICBjYWxsYmFjayA9IGJhc2VDcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKHBhaXJzW2xlbmd0aC0tXSwgcGFpcnNbbGVuZ3RoXSwgb2JqZWN0KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJdGVyYXRlcyBvdmVyIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2YgYW4gb2JqZWN0LCBleGVjdXRpbmcgdGhlIGNhbGxiYWNrXG4gICAgICogZm9yIGVhY2ggcHJvcGVydHkuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZVxuICAgICAqIGFyZ3VtZW50czsgKHZhbHVlLCBrZXksIG9iamVjdCkuIENhbGxiYWNrcyBtYXkgZXhpdCBpdGVyYXRpb24gZWFybHkgYnlcbiAgICAgKiBleHBsaWNpdGx5IHJldHVybmluZyBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5mb3JPd24oeyAnMCc6ICd6ZXJvJywgJzEnOiAnb25lJywgJ2xlbmd0aCc6IDIgfSwgZnVuY3Rpb24obnVtLCBrZXkpIHtcbiAgICAgKiAgIGNvbnNvbGUubG9nKGtleSk7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gbG9ncyAnMCcsICcxJywgYW5kICdsZW5ndGgnIChwcm9wZXJ0eSBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCBhY3Jvc3MgZW52aXJvbm1lbnRzKVxuICAgICAqL1xuICAgIHZhciBmb3JPd24gPSBmdW5jdGlvbihjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIGluZGV4LCBpdGVyYWJsZSA9IGNvbGxlY3Rpb24sIHJlc3VsdCA9IGl0ZXJhYmxlO1xuICAgICAgaWYgKCFpdGVyYWJsZSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIGlmICghb2JqZWN0VHlwZXNbdHlwZW9mIGl0ZXJhYmxlXSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgJiYgdHlwZW9mIHRoaXNBcmcgPT0gJ3VuZGVmaW5lZCcgPyBjYWxsYmFjayA6IGJhc2VDcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICAgIHZhciBvd25JbmRleCA9IC0xLFxuICAgICAgICAgICAgb3duUHJvcHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdICYmIGtleXMoaXRlcmFibGUpLFxuICAgICAgICAgICAgbGVuZ3RoID0gb3duUHJvcHMgPyBvd25Qcm9wcy5sZW5ndGggOiAwO1xuXG4gICAgICAgIHdoaWxlICgrK293bkluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgaW5kZXggPSBvd25Qcm9wc1tvd25JbmRleF07XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKGl0ZXJhYmxlW2luZGV4XSwgaW5kZXgsIGNvbGxlY3Rpb24pID09PSBmYWxzZSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmZvck93bmAgZXhjZXB0IHRoYXQgaXQgaXRlcmF0ZXMgb3ZlciBlbGVtZW50c1xuICAgICAqIG9mIGEgYGNvbGxlY3Rpb25gIGluIHRoZSBvcHBvc2l0ZSBvcmRlci5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmZvck93blJpZ2h0KHsgJzAnOiAnemVybycsICcxJzogJ29uZScsICdsZW5ndGgnOiAyIH0sIGZ1bmN0aW9uKG51bSwga2V5KSB7XG4gICAgICogICBjb25zb2xlLmxvZyhrZXkpO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IGxvZ3MgJ2xlbmd0aCcsICcxJywgYW5kICcwJyBhc3N1bWluZyBgXy5mb3JPd25gIGxvZ3MgJzAnLCAnMScsIGFuZCAnbGVuZ3RoJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZvck93blJpZ2h0KG9iamVjdCwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciBwcm9wcyA9IGtleXMob2JqZWN0KSxcbiAgICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgICAgIGNhbGxiYWNrID0gYmFzZUNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICB2YXIga2V5ID0gcHJvcHNbbGVuZ3RoXTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKG9iamVjdFtrZXldLCBrZXksIG9iamVjdCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHNvcnRlZCBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyBvZiBhbGwgZW51bWVyYWJsZSBwcm9wZXJ0aWVzLFxuICAgICAqIG93biBhbmQgaW5oZXJpdGVkLCBvZiBgb2JqZWN0YCB0aGF0IGhhdmUgZnVuY3Rpb24gdmFsdWVzLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGFsaWFzIG1ldGhvZHNcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyB0aGF0IGhhdmUgZnVuY3Rpb24gdmFsdWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmZ1bmN0aW9ucyhfKTtcbiAgICAgKiAvLyA9PiBbJ2FsbCcsICdhbnknLCAnYmluZCcsICdiaW5kQWxsJywgJ2Nsb25lJywgJ2NvbXBhY3QnLCAnY29tcG9zZScsIC4uLl1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmdW5jdGlvbnMob2JqZWN0KSB7XG4gICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICBmb3JJbihvYmplY3QsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0LnNvcnQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIHNwZWNpZmllZCBwcm9wZXJ0eSBuYW1lIGV4aXN0cyBhcyBhIGRpcmVjdCBwcm9wZXJ0eSBvZiBgb2JqZWN0YCxcbiAgICAgKiBpbnN0ZWFkIG9mIGFuIGluaGVyaXRlZCBwcm9wZXJ0eS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGluc3BlY3QuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGtleSBpcyBhIGRpcmVjdCBwcm9wZXJ0eSwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmhhcyh7ICdhJzogMSwgJ2InOiAyLCAnYyc6IDMgfSwgJ2InKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaGFzKG9iamVjdCwga2V5KSB7XG4gICAgICByZXR1cm4gb2JqZWN0ID8gaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkgOiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIG9iamVjdCBjb21wb3NlZCBvZiB0aGUgaW52ZXJ0ZWQga2V5cyBhbmQgdmFsdWVzIG9mIHRoZSBnaXZlbiBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnZlcnQuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY3JlYXRlZCBpbnZlcnRlZCBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaW52ZXJ0KHsgJ2ZpcnN0JzogJ2ZyZWQnLCAnc2Vjb25kJzogJ2Jhcm5leScgfSk7XG4gICAgICogLy8gPT4geyAnZnJlZCc6ICdmaXJzdCcsICdiYXJuZXknOiAnc2Vjb25kJyB9XG4gICAgICovXG4gICAgZnVuY3Rpb24gaW52ZXJ0KG9iamVjdCkge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgcHJvcHMgPSBrZXlzKG9iamVjdCksXG4gICAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoLFxuICAgICAgICAgIHJlc3VsdCA9IHt9O1xuXG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuICAgICAgICByZXN1bHRbb2JqZWN0W2tleV1dID0ga2V5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGJvb2xlYW4gdmFsdWUuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIGJvb2xlYW4gdmFsdWUsIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5pc0Jvb2xlYW4obnVsbCk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0Jvb2xlYW4odmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gZmFsc2UgfHxcbiAgICAgICAgdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09IGJvb2xDbGFzcyB8fCBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGRhdGUuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIGRhdGUsIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5pc0RhdGUobmV3IERhdGUpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0RhdGUodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gZGF0ZUNsYXNzIHx8IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgRE9NIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIERPTSBlbGVtZW50LCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNFbGVtZW50KGRvY3VtZW50LmJvZHkpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0VsZW1lbnQodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5ub2RlVHlwZSA9PT0gMSB8fCBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBlbXB0eS4gQXJyYXlzLCBzdHJpbmdzLCBvciBgYXJndW1lbnRzYCBvYmplY3RzIHdpdGggYVxuICAgICAqIGxlbmd0aCBvZiBgMGAgYW5kIG9iamVjdHMgd2l0aCBubyBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGFyZSBjb25zaWRlcmVkXG4gICAgICogXCJlbXB0eVwiLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IHZhbHVlIFRoZSB2YWx1ZSB0byBpbnNwZWN0LlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBlbXB0eSwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzRW1wdHkoWzEsIDIsIDNdKTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqXG4gICAgICogXy5pc0VtcHR5KHt9KTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzRW1wdHkoJycpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0VtcHR5KHZhbHVlKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIHZhciBjbGFzc05hbWUgPSB0b1N0cmluZy5jYWxsKHZhbHVlKSxcbiAgICAgICAgICBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG5cbiAgICAgIGlmICgoY2xhc3NOYW1lID09IGFycmF5Q2xhc3MgfHwgY2xhc3NOYW1lID09IHN0cmluZ0NsYXNzIHx8IGNsYXNzTmFtZSA9PSBhcmdzQ2xhc3MgKSB8fFxuICAgICAgICAgIChjbGFzc05hbWUgPT0gb2JqZWN0Q2xhc3MgJiYgdHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJyAmJiBpc0Z1bmN0aW9uKHZhbHVlLnNwbGljZSkpKSB7XG4gICAgICAgIHJldHVybiAhbGVuZ3RoO1xuICAgICAgfVxuICAgICAgZm9yT3duKHZhbHVlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIChyZXN1bHQgPSBmYWxzZSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybXMgYSBkZWVwIGNvbXBhcmlzb24gYmV0d2VlbiB0d28gdmFsdWVzIHRvIGRldGVybWluZSBpZiB0aGV5IGFyZVxuICAgICAqIGVxdWl2YWxlbnQgdG8gZWFjaCBvdGhlci4gSWYgYSBjYWxsYmFjayBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIGV4ZWN1dGVkXG4gICAgICogdG8gY29tcGFyZSB2YWx1ZXMuIElmIHRoZSBjYWxsYmFjayByZXR1cm5zIGB1bmRlZmluZWRgIGNvbXBhcmlzb25zIHdpbGxcbiAgICAgKiBiZSBoYW5kbGVkIGJ5IHRoZSBtZXRob2QgaW5zdGVhZC4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmRcbiAgICAgKiBpbnZva2VkIHdpdGggdHdvIGFyZ3VtZW50czsgKGEsIGIpLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IGEgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gICAgICogQHBhcmFtIHsqfSBiIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpbmcgdmFsdWVzLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBvYmplY3QgPSB7ICduYW1lJzogJ2ZyZWQnIH07XG4gICAgICogdmFyIGNvcHkgPSB7ICduYW1lJzogJ2ZyZWQnIH07XG4gICAgICpcbiAgICAgKiBvYmplY3QgPT0gY29weTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqXG4gICAgICogXy5pc0VxdWFsKG9iamVjdCwgY29weSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogdmFyIHdvcmRzID0gWydoZWxsbycsICdnb29kYnllJ107XG4gICAgICogdmFyIG90aGVyV29yZHMgPSBbJ2hpJywgJ2dvb2RieWUnXTtcbiAgICAgKlxuICAgICAqIF8uaXNFcXVhbCh3b3Jkcywgb3RoZXJXb3JkcywgZnVuY3Rpb24oYSwgYikge1xuICAgICAqICAgdmFyIHJlR3JlZXQgPSAvXig/OmhlbGxvfGhpKSQvaSxcbiAgICAgKiAgICAgICBhR3JlZXQgPSBfLmlzU3RyaW5nKGEpICYmIHJlR3JlZXQudGVzdChhKSxcbiAgICAgKiAgICAgICBiR3JlZXQgPSBfLmlzU3RyaW5nKGIpICYmIHJlR3JlZXQudGVzdChiKTtcbiAgICAgKlxuICAgICAqICAgcmV0dXJuIChhR3JlZXQgfHwgYkdyZWV0KSA/IChhR3JlZXQgPT0gYkdyZWV0KSA6IHVuZGVmaW5lZDtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNFcXVhbChhLCBiLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgcmV0dXJuIGJhc2VJc0VxdWFsKGEsIGIsIHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nICYmIGJhc2VDcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMikpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzLCBvciBjYW4gYmUgY29lcmNlZCB0bywgYSBmaW5pdGUgbnVtYmVyLlxuICAgICAqXG4gICAgICogTm90ZTogVGhpcyBpcyBub3QgdGhlIHNhbWUgYXMgbmF0aXZlIGBpc0Zpbml0ZWAgd2hpY2ggd2lsbCByZXR1cm4gdHJ1ZSBmb3JcbiAgICAgKiBib29sZWFucyBhbmQgZW1wdHkgc3RyaW5ncy4gU2VlIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4MTUuMS4yLjUuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBmaW5pdGUsIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5pc0Zpbml0ZSgtMTAxKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzRmluaXRlKCcxMCcpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIF8uaXNGaW5pdGUodHJ1ZSk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIF8uaXNGaW5pdGUoJycpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICpcbiAgICAgKiBfLmlzRmluaXRlKEluZmluaXR5KTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzRmluaXRlKHZhbHVlKSB7XG4gICAgICByZXR1cm4gbmF0aXZlSXNGaW5pdGUodmFsdWUpICYmICFuYXRpdmVJc05hTihwYXJzZUZsb2F0KHZhbHVlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGEgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5pc0Z1bmN0aW9uKF8pO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbic7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlIGxhbmd1YWdlIHR5cGUgb2YgT2JqZWN0LlxuICAgICAqIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNPYmplY3Qoe30pO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzT2JqZWN0KDEpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgICAgIC8vIGNoZWNrIGlmIHRoZSB2YWx1ZSBpcyB0aGUgRUNNQVNjcmlwdCBsYW5ndWFnZSB0eXBlIG9mIE9iamVjdFxuICAgICAgLy8gaHR0cDovL2VzNS5naXRodWIuaW8vI3g4XG4gICAgICAvLyBhbmQgYXZvaWQgYSBWOCBidWdcbiAgICAgIC8vIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTIyOTFcbiAgICAgIHJldHVybiAhISh2YWx1ZSAmJiBvYmplY3RUeXBlc1t0eXBlb2YgdmFsdWVdKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBgTmFOYC5cbiAgICAgKlxuICAgICAqIE5vdGU6IFRoaXMgaXMgbm90IHRoZSBzYW1lIGFzIG5hdGl2ZSBgaXNOYU5gIHdoaWNoIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3JcbiAgICAgKiBgdW5kZWZpbmVkYCBhbmQgb3RoZXIgbm9uLW51bWVyaWMgdmFsdWVzLiBTZWUgaHR0cDovL2VzNS5naXRodWIuaW8vI3gxNS4xLjIuNC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGBOYU5gLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNOYU4oTmFOKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzTmFOKG5ldyBOdW1iZXIoTmFOKSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogaXNOYU4odW5kZWZpbmVkKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzTmFOKHVuZGVmaW5lZCk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc05hTih2YWx1ZSkge1xuICAgICAgLy8gYE5hTmAgYXMgYSBwcmltaXRpdmUgaXMgdGhlIG9ubHkgdmFsdWUgdGhhdCBpcyBub3QgZXF1YWwgdG8gaXRzZWxmXG4gICAgICAvLyAocGVyZm9ybSB0aGUgW1tDbGFzc11dIGNoZWNrIGZpcnN0IHRvIGF2b2lkIGVycm9ycyB3aXRoIHNvbWUgaG9zdCBvYmplY3RzIGluIElFKVxuICAgICAgcmV0dXJuIGlzTnVtYmVyKHZhbHVlKSAmJiB2YWx1ZSAhPSArdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYG51bGxgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYG51bGxgLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNOdWxsKG51bGwpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIF8uaXNOdWxsKHVuZGVmaW5lZCk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc051bGwodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIG51bWJlci5cbiAgICAgKlxuICAgICAqIE5vdGU6IGBOYU5gIGlzIGNvbnNpZGVyZWQgYSBudW1iZXIuIFNlZSBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDguNS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGEgbnVtYmVyLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNOdW1iZXIoOC40ICogNSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzTnVtYmVyKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInIHx8XG4gICAgICAgIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PSBudW1iZXJDbGFzcyB8fCBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QgY3JlYXRlZCBieSB0aGUgYE9iamVjdGAgY29uc3RydWN0b3IuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIGZ1bmN0aW9uIFNoYXBlKCkge1xuICAgICAqICAgdGhpcy54ID0gMDtcbiAgICAgKiAgIHRoaXMueSA9IDA7XG4gICAgICogfVxuICAgICAqXG4gICAgICogXy5pc1BsYWluT2JqZWN0KG5ldyBTaGFwZSk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIF8uaXNQbGFpbk9iamVjdChbMSwgMiwgM10pO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICpcbiAgICAgKiBfLmlzUGxhaW5PYmplY3QoeyAneCc6IDAsICd5JzogMCB9KTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgdmFyIGlzUGxhaW5PYmplY3QgPSAhZ2V0UHJvdG90eXBlT2YgPyBzaGltSXNQbGFpbk9iamVjdCA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoISh2YWx1ZSAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PSBvYmplY3RDbGFzcykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIHZhbHVlT2YgPSB2YWx1ZS52YWx1ZU9mLFxuICAgICAgICAgIG9ialByb3RvID0gaXNOYXRpdmUodmFsdWVPZikgJiYgKG9ialByb3RvID0gZ2V0UHJvdG90eXBlT2YodmFsdWVPZikpICYmIGdldFByb3RvdHlwZU9mKG9ialByb3RvKTtcblxuICAgICAgcmV0dXJuIG9ialByb3RvXG4gICAgICAgID8gKHZhbHVlID09IG9ialByb3RvIHx8IGdldFByb3RvdHlwZU9mKHZhbHVlKSA9PSBvYmpQcm90bylcbiAgICAgICAgOiBzaGltSXNQbGFpbk9iamVjdCh2YWx1ZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgcmVndWxhciBleHByZXNzaW9uLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSByZWd1bGFyIGV4cHJlc3Npb24sIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5pc1JlZ0V4cCgvZnJlZC8pO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc1JlZ0V4cCh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PSByZWdleHBDbGFzcyB8fCBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHN0cmluZy5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGEgc3RyaW5nLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNTdHJpbmcoJ2ZyZWQnKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgfHxcbiAgICAgICAgdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09IHN0cmluZ0NsYXNzIHx8IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGB1bmRlZmluZWRgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYHVuZGVmaW5lZGAsIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5pc1VuZGVmaW5lZCh2b2lkIDApO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAndW5kZWZpbmVkJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIG9iamVjdCB3aXRoIHRoZSBzYW1lIGtleXMgYXMgYG9iamVjdGAgYW5kIHZhbHVlcyBnZW5lcmF0ZWQgYnlcbiAgICAgKiBydW5uaW5nIGVhY2ggb3duIGVudW1lcmFibGUgcHJvcGVydHkgb2YgYG9iamVjdGAgdGhyb3VnaCB0aGUgY2FsbGJhY2suXG4gICAgICogVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50cztcbiAgICAgKiAodmFsdWUsIGtleSwgb2JqZWN0KS5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IG9iamVjdCB3aXRoIHZhbHVlcyBvZiB0aGUgcmVzdWx0cyBvZiBlYWNoIGBjYWxsYmFja2AgZXhlY3V0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLm1hcFZhbHVlcyh7ICdhJzogMSwgJ2InOiAyLCAnYyc6IDN9ICwgZnVuY3Rpb24obnVtKSB7IHJldHVybiBudW0gKiAzOyB9KTtcbiAgICAgKiAvLyA9PiB7ICdhJzogMywgJ2InOiA2LCAnYyc6IDkgfVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSB7XG4gICAgICogICAnZnJlZCc6IHsgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiA0MCB9LFxuICAgICAqICAgJ3BlYmJsZXMnOiB7ICduYW1lJzogJ3BlYmJsZXMnLCAnYWdlJzogMSB9XG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8ubWFwVmFsdWVzKGNoYXJhY3RlcnMsICdhZ2UnKTtcbiAgICAgKiAvLyA9PiB7ICdmcmVkJzogNDAsICdwZWJibGVzJzogMSB9XG4gICAgICovXG4gICAgZnVuY3Rpb24gbWFwVmFsdWVzKG9iamVjdCwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcblxuICAgICAgZm9yT3duKG9iamVjdCwgZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqZWN0KSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gY2FsbGJhY2sodmFsdWUsIGtleSwgb2JqZWN0KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWN1cnNpdmVseSBtZXJnZXMgb3duIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiB0aGUgc291cmNlIG9iamVjdChzKSwgdGhhdFxuICAgICAqIGRvbid0IHJlc29sdmUgdG8gYHVuZGVmaW5lZGAgaW50byB0aGUgZGVzdGluYXRpb24gb2JqZWN0LiBTdWJzZXF1ZW50IHNvdXJjZXNcbiAgICAgKiB3aWxsIG92ZXJ3cml0ZSBwcm9wZXJ0eSBhc3NpZ25tZW50cyBvZiBwcmV2aW91cyBzb3VyY2VzLiBJZiBhIGNhbGxiYWNrIGlzXG4gICAgICogcHJvdmlkZWQgaXQgd2lsbCBiZSBleGVjdXRlZCB0byBwcm9kdWNlIHRoZSBtZXJnZWQgdmFsdWVzIG9mIHRoZSBkZXN0aW5hdGlvblxuICAgICAqIGFuZCBzb3VyY2UgcHJvcGVydGllcy4gSWYgdGhlIGNhbGxiYWNrIHJldHVybnMgYHVuZGVmaW5lZGAgbWVyZ2luZyB3aWxsXG4gICAgICogYmUgaGFuZGxlZCBieSB0aGUgbWV0aG9kIGluc3RlYWQuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kXG4gICAgICogaW52b2tlZCB3aXRoIHR3byBhcmd1bWVudHM7IChvYmplY3RWYWx1ZSwgc291cmNlVmFsdWUpLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gICAgICogQHBhcmFtIHsuLi5PYmplY3R9IFtzb3VyY2VdIFRoZSBzb3VyY2Ugb2JqZWN0cy5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgbWVyZ2luZyBwcm9wZXJ0aWVzLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIG5hbWVzID0ge1xuICAgICAqICAgJ2NoYXJhY3RlcnMnOiBbXG4gICAgICogICAgIHsgJ25hbWUnOiAnYmFybmV5JyB9LFxuICAgICAqICAgICB7ICduYW1lJzogJ2ZyZWQnIH1cbiAgICAgKiAgIF1cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogdmFyIGFnZXMgPSB7XG4gICAgICogICAnY2hhcmFjdGVycyc6IFtcbiAgICAgKiAgICAgeyAnYWdlJzogMzYgfSxcbiAgICAgKiAgICAgeyAnYWdlJzogNDAgfVxuICAgICAqICAgXVxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiBfLm1lcmdlKG5hbWVzLCBhZ2VzKTtcbiAgICAgKiAvLyA9PiB7ICdjaGFyYWN0ZXJzJzogW3sgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH0sIHsgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiA0MCB9XSB9XG4gICAgICpcbiAgICAgKiB2YXIgZm9vZCA9IHtcbiAgICAgKiAgICdmcnVpdHMnOiBbJ2FwcGxlJ10sXG4gICAgICogICAndmVnZXRhYmxlcyc6IFsnYmVldCddXG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIHZhciBvdGhlckZvb2QgPSB7XG4gICAgICogICAnZnJ1aXRzJzogWydiYW5hbmEnXSxcbiAgICAgKiAgICd2ZWdldGFibGVzJzogWydjYXJyb3QnXVxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiBfLm1lcmdlKGZvb2QsIG90aGVyRm9vZCwgZnVuY3Rpb24oYSwgYikge1xuICAgICAqICAgcmV0dXJuIF8uaXNBcnJheShhKSA/IGEuY29uY2F0KGIpIDogdW5kZWZpbmVkO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IHsgJ2ZydWl0cyc6IFsnYXBwbGUnLCAnYmFuYW5hJ10sICd2ZWdldGFibGVzJzogWydiZWV0JywgJ2NhcnJvdF0gfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1lcmdlKG9iamVjdCkge1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgbGVuZ3RoID0gMjtcblxuICAgICAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICB9XG4gICAgICAvLyBhbGxvd3Mgd29ya2luZyB3aXRoIGBfLnJlZHVjZWAgYW5kIGBfLnJlZHVjZVJpZ2h0YCB3aXRob3V0IHVzaW5nXG4gICAgICAvLyB0aGVpciBgaW5kZXhgIGFuZCBgY29sbGVjdGlvbmAgYXJndW1lbnRzXG4gICAgICBpZiAodHlwZW9mIGFyZ3NbMl0gIT0gJ251bWJlcicpIHtcbiAgICAgICAgbGVuZ3RoID0gYXJncy5sZW5ndGg7XG4gICAgICB9XG4gICAgICBpZiAobGVuZ3RoID4gMyAmJiB0eXBlb2YgYXJnc1tsZW5ndGggLSAyXSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGJhc2VDcmVhdGVDYWxsYmFjayhhcmdzWy0tbGVuZ3RoIC0gMV0sIGFyZ3NbbGVuZ3RoLS1dLCAyKTtcbiAgICAgIH0gZWxzZSBpZiAobGVuZ3RoID4gMiAmJiB0eXBlb2YgYXJnc1tsZW5ndGggLSAxXSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNhbGxiYWNrID0gYXJnc1stLWxlbmd0aF07XG4gICAgICB9XG4gICAgICB2YXIgc291cmNlcyA9IHNsaWNlKGFyZ3VtZW50cywgMSwgbGVuZ3RoKSxcbiAgICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICAgIHN0YWNrQSA9IGdldEFycmF5KCksXG4gICAgICAgICAgc3RhY2tCID0gZ2V0QXJyYXkoKTtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgYmFzZU1lcmdlKG9iamVjdCwgc291cmNlc1tpbmRleF0sIGNhbGxiYWNrLCBzdGFja0EsIHN0YWNrQik7XG4gICAgICB9XG4gICAgICByZWxlYXNlQXJyYXkoc3RhY2tBKTtcbiAgICAgIHJlbGVhc2VBcnJheShzdGFja0IpO1xuICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgc2hhbGxvdyBjbG9uZSBvZiBgb2JqZWN0YCBleGNsdWRpbmcgdGhlIHNwZWNpZmllZCBwcm9wZXJ0aWVzLlxuICAgICAqIFByb3BlcnR5IG5hbWVzIG1heSBiZSBzcGVjaWZpZWQgYXMgaW5kaXZpZHVhbCBhcmd1bWVudHMgb3IgYXMgYXJyYXlzIG9mXG4gICAgICogcHJvcGVydHkgbmFtZXMuIElmIGEgY2FsbGJhY2sgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSBleGVjdXRlZCBmb3IgZWFjaFxuICAgICAqIHByb3BlcnR5IG9mIGBvYmplY3RgIG9taXR0aW5nIHRoZSBwcm9wZXJ0aWVzIHRoZSBjYWxsYmFjayByZXR1cm5zIHRydWV5XG4gICAgICogZm9yLiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzO1xuICAgICAqICh2YWx1ZSwga2V5LCBvYmplY3QpLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBzb3VyY2Ugb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258Li4uc3RyaW5nfHN0cmluZ1tdfSBbY2FsbGJhY2tdIFRoZSBwcm9wZXJ0aWVzIHRvIG9taXQgb3IgdGhlXG4gICAgICogIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYW4gb2JqZWN0IHdpdGhvdXQgdGhlIG9taXR0ZWQgcHJvcGVydGllcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5vbWl0KHsgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiA0MCB9LCAnYWdlJyk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdmcmVkJyB9XG4gICAgICpcbiAgICAgKiBfLm9taXQoeyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwIH0sIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICogICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IHsgJ25hbWUnOiAnZnJlZCcgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG9taXQob2JqZWN0LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBwcm9wcyA9IFtdO1xuICAgICAgICBmb3JJbihvYmplY3QsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICBwcm9wcy5wdXNoKGtleSk7XG4gICAgICAgIH0pO1xuICAgICAgICBwcm9wcyA9IGJhc2VEaWZmZXJlbmNlKHByb3BzLCBiYXNlRmxhdHRlbihhcmd1bWVudHMsIHRydWUsIGZhbHNlLCAxKSk7XG5cbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gb2JqZWN0W2tleV07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgICAgZm9ySW4ob2JqZWN0LCBmdW5jdGlvbih2YWx1ZSwga2V5LCBvYmplY3QpIHtcbiAgICAgICAgICBpZiAoIWNhbGxiYWNrKHZhbHVlLCBrZXksIG9iamVjdCkpIHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHR3byBkaW1lbnNpb25hbCBhcnJheSBvZiBhbiBvYmplY3QncyBrZXktdmFsdWUgcGFpcnMsXG4gICAgICogaS5lLiBgW1trZXkxLCB2YWx1ZTFdLCBba2V5MiwgdmFsdWUyXV1gLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IE9iamVjdHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgbmV3IGFycmF5IG9mIGtleS12YWx1ZSBwYWlycy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5wYWlycyh7ICdiYXJuZXknOiAzNiwgJ2ZyZWQnOiA0MCB9KTtcbiAgICAgKiAvLyA9PiBbWydiYXJuZXknLCAzNl0sIFsnZnJlZCcsIDQwXV0gKHByb3BlcnR5IG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkIGFjcm9zcyBlbnZpcm9ubWVudHMpXG4gICAgICovXG4gICAgZnVuY3Rpb24gcGFpcnMob2JqZWN0KSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBwcm9wcyA9IGtleXMob2JqZWN0KSxcbiAgICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGgsXG4gICAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IFtrZXksIG9iamVjdFtrZXldXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHNoYWxsb3cgY2xvbmUgb2YgYG9iamVjdGAgY29tcG9zZWQgb2YgdGhlIHNwZWNpZmllZCBwcm9wZXJ0aWVzLlxuICAgICAqIFByb3BlcnR5IG5hbWVzIG1heSBiZSBzcGVjaWZpZWQgYXMgaW5kaXZpZHVhbCBhcmd1bWVudHMgb3IgYXMgYXJyYXlzIG9mXG4gICAgICogcHJvcGVydHkgbmFtZXMuIElmIGEgY2FsbGJhY2sgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSBleGVjdXRlZCBmb3IgZWFjaFxuICAgICAqIHByb3BlcnR5IG9mIGBvYmplY3RgIHBpY2tpbmcgdGhlIHByb3BlcnRpZXMgdGhlIGNhbGxiYWNrIHJldHVybnMgdHJ1ZXlcbiAgICAgKiBmb3IuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM7XG4gICAgICogKHZhbHVlLCBrZXksIG9iamVjdCkuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIHNvdXJjZSBvYmplY3QuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnwuLi5zdHJpbmd8c3RyaW5nW119IFtjYWxsYmFja10gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXJcbiAgICAgKiAgaXRlcmF0aW9uIG9yIHByb3BlcnR5IG5hbWVzIHRvIHBpY2ssIHNwZWNpZmllZCBhcyBpbmRpdmlkdWFsIHByb3BlcnR5XG4gICAgICogIG5hbWVzIG9yIGFycmF5cyBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGFuIG9iamVjdCBjb21wb3NlZCBvZiB0aGUgcGlja2VkIHByb3BlcnRpZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ucGljayh7ICduYW1lJzogJ2ZyZWQnLCAnX3VzZXJpZCc6ICdmcmVkMScgfSwgJ25hbWUnKTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ2ZyZWQnIH1cbiAgICAgKlxuICAgICAqIF8ucGljayh7ICduYW1lJzogJ2ZyZWQnLCAnX3VzZXJpZCc6ICdmcmVkMScgfSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAqICAgcmV0dXJuIGtleS5jaGFyQXQoMCkgIT0gJ18nO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IHsgJ25hbWUnOiAnZnJlZCcgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHBpY2sob2JqZWN0LCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgcHJvcHMgPSBiYXNlRmxhdHRlbihhcmd1bWVudHMsIHRydWUsIGZhbHNlLCAxKSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGlzT2JqZWN0KG9iamVjdCkgPyBwcm9wcy5sZW5ndGggOiAwO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcbiAgICAgICAgICBpZiAoa2V5IGluIG9iamVjdCkge1xuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBvYmplY3Rba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgICAgZm9ySW4ob2JqZWN0LCBmdW5jdGlvbih2YWx1ZSwga2V5LCBvYmplY3QpIHtcbiAgICAgICAgICBpZiAoY2FsbGJhY2sodmFsdWUsIGtleSwgb2JqZWN0KSkge1xuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBbiBhbHRlcm5hdGl2ZSB0byBgXy5yZWR1Y2VgIHRoaXMgbWV0aG9kIHRyYW5zZm9ybXMgYG9iamVjdGAgdG8gYSBuZXdcbiAgICAgKiBgYWNjdW11bGF0b3JgIG9iamVjdCB3aGljaCBpcyB0aGUgcmVzdWx0IG9mIHJ1bm5pbmcgZWFjaCBvZiBpdHMgb3duXG4gICAgICogZW51bWVyYWJsZSBwcm9wZXJ0aWVzIHRocm91Z2ggYSBjYWxsYmFjaywgd2l0aCBlYWNoIGNhbGxiYWNrIGV4ZWN1dGlvblxuICAgICAqIHBvdGVudGlhbGx5IG11dGF0aW5nIHRoZSBgYWNjdW11bGF0b3JgIG9iamVjdC4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvXG4gICAgICogYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggZm91ciBhcmd1bWVudHM7IChhY2N1bXVsYXRvciwgdmFsdWUsIGtleSwgb2JqZWN0KS5cbiAgICAgKiBDYWxsYmFja3MgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHsqfSBbYWNjdW11bGF0b3JdIFRoZSBjdXN0b20gYWNjdW11bGF0b3IgdmFsdWUuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGFjY3VtdWxhdGVkIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgc3F1YXJlcyA9IF8udHJhbnNmb3JtKFsxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMF0sIGZ1bmN0aW9uKHJlc3VsdCwgbnVtKSB7XG4gICAgICogICBudW0gKj0gbnVtO1xuICAgICAqICAgaWYgKG51bSAlIDIpIHtcbiAgICAgKiAgICAgcmV0dXJuIHJlc3VsdC5wdXNoKG51bSkgPCAzO1xuICAgICAqICAgfVxuICAgICAqIH0pO1xuICAgICAqIC8vID0+IFsxLCA5LCAyNV1cbiAgICAgKlxuICAgICAqIHZhciBtYXBwZWQgPSBfLnRyYW5zZm9ybSh7ICdhJzogMSwgJ2InOiAyLCAnYyc6IDMgfSwgZnVuY3Rpb24ocmVzdWx0LCBudW0sIGtleSkge1xuICAgICAqICAgcmVzdWx0W2tleV0gPSBudW0gKiAzO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IHsgJ2EnOiAzLCAnYic6IDYsICdjJzogOSB9XG4gICAgICovXG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtKG9iamVjdCwgY2FsbGJhY2ssIGFjY3VtdWxhdG9yLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgaXNBcnIgPSBpc0FycmF5KG9iamVjdCk7XG4gICAgICBpZiAoYWNjdW11bGF0b3IgPT0gbnVsbCkge1xuICAgICAgICBpZiAoaXNBcnIpIHtcbiAgICAgICAgICBhY2N1bXVsYXRvciA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBjdG9yID0gb2JqZWN0ICYmIG9iamVjdC5jb25zdHJ1Y3RvcixcbiAgICAgICAgICAgICAgcHJvdG8gPSBjdG9yICYmIGN0b3IucHJvdG90eXBlO1xuXG4gICAgICAgICAgYWNjdW11bGF0b3IgPSBiYXNlQ3JlYXRlKHByb3RvKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCA0KTtcbiAgICAgICAgKGlzQXJyID8gZm9yRWFjaCA6IGZvck93bikob2JqZWN0LCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIG9iamVjdCkge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBvYmplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2N1bXVsYXRvcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFycmF5IGNvbXBvc2VkIG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSB2YWx1ZXMgb2YgYG9iamVjdGAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBwcm9wZXJ0eSB2YWx1ZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8udmFsdWVzKHsgJ29uZSc6IDEsICd0d28nOiAyLCAndGhyZWUnOiAzIH0pO1xuICAgICAqIC8vID0+IFsxLCAyLCAzXSAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB2YWx1ZXMob2JqZWN0KSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBwcm9wcyA9IGtleXMob2JqZWN0KSxcbiAgICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGgsXG4gICAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IG9iamVjdFtwcm9wc1tpbmRleF1dO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgZWxlbWVudHMgZnJvbSB0aGUgc3BlY2lmaWVkIGluZGV4ZXMsIG9yIGtleXMsIG9mIHRoZVxuICAgICAqIGBjb2xsZWN0aW9uYC4gSW5kZXhlcyBtYXkgYmUgc3BlY2lmaWVkIGFzIGluZGl2aWR1YWwgYXJndW1lbnRzIG9yIGFzIGFycmF5c1xuICAgICAqIG9mIGluZGV4ZXMuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7Li4uKG51bWJlcnxudW1iZXJbXXxzdHJpbmd8c3RyaW5nW10pfSBbaW5kZXhdIFRoZSBpbmRleGVzIG9mIGBjb2xsZWN0aW9uYFxuICAgICAqICAgdG8gcmV0cmlldmUsIHNwZWNpZmllZCBhcyBpbmRpdmlkdWFsIGluZGV4ZXMgb3IgYXJyYXlzIG9mIGluZGV4ZXMuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGFycmF5IG9mIGVsZW1lbnRzIGNvcnJlc3BvbmRpbmcgdG8gdGhlXG4gICAgICogIHByb3ZpZGVkIGluZGV4ZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uYXQoWydhJywgJ2InLCAnYycsICdkJywgJ2UnXSwgWzAsIDIsIDRdKTtcbiAgICAgKiAvLyA9PiBbJ2EnLCAnYycsICdlJ11cbiAgICAgKlxuICAgICAqIF8uYXQoWydmcmVkJywgJ2Jhcm5leScsICdwZWJibGVzJ10sIDAsIDIpO1xuICAgICAqIC8vID0+IFsnZnJlZCcsICdwZWJibGVzJ11cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhdChjb2xsZWN0aW9uKSB7XG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cyxcbiAgICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICAgIHByb3BzID0gYmFzZUZsYXR0ZW4oYXJncywgdHJ1ZSwgZmFsc2UsIDEpLFxuICAgICAgICAgIGxlbmd0aCA9IChhcmdzWzJdICYmIGFyZ3NbMl1bYXJnc1sxXV0gPT09IGNvbGxlY3Rpb24pID8gMSA6IHByb3BzLmxlbmd0aCxcbiAgICAgICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgICB3aGlsZSgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBjb2xsZWN0aW9uW3Byb3BzW2luZGV4XV07XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhIGdpdmVuIHZhbHVlIGlzIHByZXNlbnQgaW4gYSBjb2xsZWN0aW9uIHVzaW5nIHN0cmljdCBlcXVhbGl0eVxuICAgICAqIGZvciBjb21wYXJpc29ucywgaS5lLiBgPT09YC4gSWYgYGZyb21JbmRleGAgaXMgbmVnYXRpdmUsIGl0IGlzIHVzZWQgYXMgdGhlXG4gICAgICogb2Zmc2V0IGZyb20gdGhlIGVuZCBvZiB0aGUgY29sbGVjdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyBpbmNsdWRlXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0geyp9IHRhcmdldCBUaGUgdmFsdWUgdG8gY2hlY2sgZm9yLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbZnJvbUluZGV4PTBdIFRoZSBpbmRleCB0byBzZWFyY2ggZnJvbS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB0YXJnZXRgIGVsZW1lbnQgaXMgZm91bmQsIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5jb250YWlucyhbMSwgMiwgM10sIDEpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIF8uY29udGFpbnMoWzEsIDIsIDNdLCAxLCAyKTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqXG4gICAgICogXy5jb250YWlucyh7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAgfSwgJ2ZyZWQnKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmNvbnRhaW5zKCdwZWJibGVzJywgJ2ViJyk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbnRhaW5zKGNvbGxlY3Rpb24sIHRhcmdldCwgZnJvbUluZGV4KSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBpbmRleE9mID0gZ2V0SW5kZXhPZigpLFxuICAgICAgICAgIGxlbmd0aCA9IGNvbGxlY3Rpb24gPyBjb2xsZWN0aW9uLmxlbmd0aCA6IDAsXG4gICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICAgIGZyb21JbmRleCA9IChmcm9tSW5kZXggPCAwID8gbmF0aXZlTWF4KDAsIGxlbmd0aCArIGZyb21JbmRleCkgOiBmcm9tSW5kZXgpIHx8IDA7XG4gICAgICBpZiAoaXNBcnJheShjb2xsZWN0aW9uKSkge1xuICAgICAgICByZXN1bHQgPSBpbmRleE9mKGNvbGxlY3Rpb24sIHRhcmdldCwgZnJvbUluZGV4KSA+IC0xO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInKSB7XG4gICAgICAgIHJlc3VsdCA9IChpc1N0cmluZyhjb2xsZWN0aW9uKSA/IGNvbGxlY3Rpb24uaW5kZXhPZih0YXJnZXQsIGZyb21JbmRleCkgOiBpbmRleE9mKGNvbGxlY3Rpb24sIHRhcmdldCwgZnJvbUluZGV4KSkgPiAtMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmICgrK2luZGV4ID49IGZyb21JbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuICEocmVzdWx0ID0gdmFsdWUgPT09IHRhcmdldCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBvYmplY3QgY29tcG9zZWQgb2Yga2V5cyBnZW5lcmF0ZWQgZnJvbSB0aGUgcmVzdWx0cyBvZiBydW5uaW5nXG4gICAgICogZWFjaCBlbGVtZW50IG9mIGBjb2xsZWN0aW9uYCB0aHJvdWdoIHRoZSBjYWxsYmFjay4gVGhlIGNvcnJlc3BvbmRpbmcgdmFsdWVcbiAgICAgKiBvZiBlYWNoIGtleSBpcyB0aGUgbnVtYmVyIG9mIHRpbWVzIHRoZSBrZXkgd2FzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFjay5cbiAgICAgKiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzO1xuICAgICAqICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNvbXBvc2VkIGFnZ3JlZ2F0ZSBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uY291bnRCeShbNC4zLCA2LjEsIDYuNF0sIGZ1bmN0aW9uKG51bSkgeyByZXR1cm4gTWF0aC5mbG9vcihudW0pOyB9KTtcbiAgICAgKiAvLyA9PiB7ICc0JzogMSwgJzYnOiAyIH1cbiAgICAgKlxuICAgICAqIF8uY291bnRCeShbNC4zLCA2LjEsIDYuNF0sIGZ1bmN0aW9uKG51bSkgeyByZXR1cm4gdGhpcy5mbG9vcihudW0pOyB9LCBNYXRoKTtcbiAgICAgKiAvLyA9PiB7ICc0JzogMSwgJzYnOiAyIH1cbiAgICAgKlxuICAgICAqIF8uY291bnRCeShbJ29uZScsICd0d28nLCAndGhyZWUnXSwgJ2xlbmd0aCcpO1xuICAgICAqIC8vID0+IHsgJzMnOiAyLCAnNSc6IDEgfVxuICAgICAqL1xuICAgIHZhciBjb3VudEJ5ID0gY3JlYXRlQWdncmVnYXRvcihmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICAgIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHJlc3VsdCwga2V5KSA/IHJlc3VsdFtrZXldKysgOiByZXN1bHRba2V5XSA9IDEpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBjYWxsYmFjayByZXR1cm5zIHRydWV5IHZhbHVlIGZvciAqKmFsbCoqIGVsZW1lbnRzIG9mXG4gICAgICogYSBjb2xsZWN0aW9uLiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWVcbiAgICAgKiBhcmd1bWVudHM7ICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGFsaWFzIGFsbFxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYWxsIGVsZW1lbnRzIHBhc3NlZCB0aGUgY2FsbGJhY2sgY2hlY2ssXG4gICAgICogIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5ldmVyeShbdHJ1ZSwgMSwgbnVsbCwgJ3llcyddKTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAnYWdlJzogNDAgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmV2ZXJ5KGNoYXJhY3RlcnMsICdhZ2UnKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ud2hlcmVcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmV2ZXJ5KGNoYXJhY3RlcnMsIHsgJ2FnZSc6IDM2IH0pO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gZXZlcnkoY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciByZXN1bHQgPSB0cnVlO1xuICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuXG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uID8gY29sbGVjdGlvbi5sZW5ndGggOiAwO1xuXG4gICAgICBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIGlmICghKHJlc3VsdCA9ICEhY2FsbGJhY2soY29sbGVjdGlvbltpbmRleF0sIGluZGV4LCBjb2xsZWN0aW9uKSkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yT3duKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICAgIHJldHVybiAocmVzdWx0ID0gISFjYWxsYmFjayh2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEl0ZXJhdGVzIG92ZXIgZWxlbWVudHMgb2YgYSBjb2xsZWN0aW9uLCByZXR1cm5pbmcgYW4gYXJyYXkgb2YgYWxsIGVsZW1lbnRzXG4gICAgICogdGhlIGNhbGxiYWNrIHJldHVybnMgdHJ1ZXkgZm9yLiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZFxuICAgICAqIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM7ICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGFsaWFzIHNlbGVjdFxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgYXJyYXkgb2YgZWxlbWVudHMgdGhhdCBwYXNzZWQgdGhlIGNhbGxiYWNrIGNoZWNrLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgZXZlbnMgPSBfLmZpbHRlcihbMSwgMiwgMywgNCwgNSwgNl0sIGZ1bmN0aW9uKG51bSkgeyByZXR1cm4gbnVtICUgMiA9PSAwOyB9KTtcbiAgICAgKiAvLyA9PiBbMiwgNCwgNl1cbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYsICdibG9ja2VkJzogZmFsc2UgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwLCAnYmxvY2tlZCc6IHRydWUgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmZpbHRlcihjaGFyYWN0ZXJzLCAnYmxvY2tlZCcpO1xuICAgICAqIC8vID0+IFt7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAsICdibG9ja2VkJzogdHJ1ZSB9XVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLndoZXJlXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maWx0ZXIoY2hhcmFjdGVycywgeyAnYWdlJzogMzYgfSk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2LCAnYmxvY2tlZCc6IGZhbHNlIH1dXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmlsdGVyKGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG5cbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGNvbGxlY3Rpb24gPyBjb2xsZWN0aW9uLmxlbmd0aCA6IDA7XG5cbiAgICAgIGlmICh0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInKSB7XG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIHZhbHVlID0gY29sbGVjdGlvbltpbmRleF07XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICBpZiAoY2FsbGJhY2sodmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEl0ZXJhdGVzIG92ZXIgZWxlbWVudHMgb2YgYSBjb2xsZWN0aW9uLCByZXR1cm5pbmcgdGhlIGZpcnN0IGVsZW1lbnQgdGhhdFxuICAgICAqIHRoZSBjYWxsYmFjayByZXR1cm5zIHRydWV5IGZvci4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmRcbiAgICAgKiBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOyAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyBkZXRlY3QsIGZpbmRXaGVyZVxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZm91bmQgZWxlbWVudCwgZWxzZSBgdW5kZWZpbmVkYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICAnYWdlJzogMzYsICdibG9ja2VkJzogZmFsc2UgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgICdhZ2UnOiA0MCwgJ2Jsb2NrZWQnOiB0cnVlIH0sXG4gICAgICogICB7ICduYW1lJzogJ3BlYmJsZXMnLCAnYWdlJzogMSwgICdibG9ja2VkJzogZmFsc2UgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiBfLmZpbmQoY2hhcmFjdGVycywgZnVuY3Rpb24oY2hyKSB7XG4gICAgICogICByZXR1cm4gY2hyLmFnZSA8IDQwO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2LCAnYmxvY2tlZCc6IGZhbHNlIH1cbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy53aGVyZVwiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uZmluZChjaGFyYWN0ZXJzLCB7ICdhZ2UnOiAxIH0pO1xuICAgICAqIC8vID0+ICB7ICduYW1lJzogJ3BlYmJsZXMnLCAnYWdlJzogMSwgJ2Jsb2NrZWQnOiBmYWxzZSB9XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmZpbmQoY2hhcmFjdGVycywgJ2Jsb2NrZWQnKTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAsICdibG9ja2VkJzogdHJ1ZSB9XG4gICAgICovXG4gICAgZnVuY3Rpb24gZmluZChjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuXG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uID8gY29sbGVjdGlvbi5sZW5ndGggOiAwO1xuXG4gICAgICBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IGNvbGxlY3Rpb25baW5kZXhdO1xuICAgICAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICBmb3JPd24oY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5maW5kYCBleGNlcHQgdGhhdCBpdCBpdGVyYXRlcyBvdmVyIGVsZW1lbnRzXG4gICAgICogb2YgYSBgY29sbGVjdGlvbmAgZnJvbSByaWdodCB0byBsZWZ0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmb3VuZCBlbGVtZW50LCBlbHNlIGB1bmRlZmluZWRgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmZpbmRMYXN0KFsxLCAyLCAzLCA0XSwgZnVuY3Rpb24obnVtKSB7XG4gICAgICogICByZXR1cm4gbnVtICUgMiA9PSAxO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IDNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmaW5kTGFzdChjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIHJlc3VsdDtcbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgIGZvckVhY2hSaWdodChjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJdGVyYXRlcyBvdmVyIGVsZW1lbnRzIG9mIGEgY29sbGVjdGlvbiwgZXhlY3V0aW5nIHRoZSBjYWxsYmFjayBmb3IgZWFjaFxuICAgICAqIGVsZW1lbnQuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM7XG4gICAgICogKHZhbHVlLCBpbmRleHxrZXksIGNvbGxlY3Rpb24pLiBDYWxsYmFja3MgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5XG4gICAgICogZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIE5vdGU6IEFzIHdpdGggb3RoZXIgXCJDb2xsZWN0aW9uc1wiIG1ldGhvZHMsIG9iamVjdHMgd2l0aCBhIGBsZW5ndGhgIHByb3BlcnR5XG4gICAgICogYXJlIGl0ZXJhdGVkIGxpa2UgYXJyYXlzLiBUbyBhdm9pZCB0aGlzIGJlaGF2aW9yIGBfLmZvckluYCBvciBgXy5mb3JPd25gXG4gICAgICogbWF5IGJlIHVzZWQgZm9yIG9iamVjdCBpdGVyYXRpb24uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgZWFjaFxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fE9iamVjdHxzdHJpbmd9IFJldHVybnMgYGNvbGxlY3Rpb25gLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfKFsxLCAyLCAzXSkuZm9yRWFjaChmdW5jdGlvbihudW0pIHsgY29uc29sZS5sb2cobnVtKTsgfSkuam9pbignLCcpO1xuICAgICAqIC8vID0+IGxvZ3MgZWFjaCBudW1iZXIgYW5kIHJldHVybnMgJzEsMiwzJ1xuICAgICAqXG4gICAgICogXy5mb3JFYWNoKHsgJ29uZSc6IDEsICd0d28nOiAyLCAndGhyZWUnOiAzIH0sIGZ1bmN0aW9uKG51bSkgeyBjb25zb2xlLmxvZyhudW0pOyB9KTtcbiAgICAgKiAvLyA9PiBsb2dzIGVhY2ggbnVtYmVyIGFuZCByZXR1cm5zIHRoZSBvYmplY3QgKHByb3BlcnR5IG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkIGFjcm9zcyBlbnZpcm9ubWVudHMpXG4gICAgICovXG4gICAgZnVuY3Rpb24gZm9yRWFjaChjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMDtcblxuICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayAmJiB0eXBlb2YgdGhpc0FyZyA9PSAndW5kZWZpbmVkJyA/IGNhbGxiYWNrIDogYmFzZUNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgIGlmICh0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInKSB7XG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKGNvbGxlY3Rpb25baW5kZXhdLCBpbmRleCwgY29sbGVjdGlvbikgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmZvckVhY2hgIGV4Y2VwdCB0aGF0IGl0IGl0ZXJhdGVzIG92ZXIgZWxlbWVudHNcbiAgICAgKiBvZiBhIGBjb2xsZWN0aW9uYCBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgZWFjaFJpZ2h0XG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl8T2JqZWN0fHN0cmluZ30gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8oWzEsIDIsIDNdKS5mb3JFYWNoUmlnaHQoZnVuY3Rpb24obnVtKSB7IGNvbnNvbGUubG9nKG51bSk7IH0pLmpvaW4oJywnKTtcbiAgICAgKiAvLyA9PiBsb2dzIGVhY2ggbnVtYmVyIGZyb20gcmlnaHQgdG8gbGVmdCBhbmQgcmV0dXJucyAnMywyLDEnXG4gICAgICovXG4gICAgZnVuY3Rpb24gZm9yRWFjaFJpZ2h0KGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMDtcbiAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgJiYgdHlwZW9mIHRoaXNBcmcgPT0gJ3VuZGVmaW5lZCcgPyBjYWxsYmFjayA6IGJhc2VDcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgICBpZiAoY2FsbGJhY2soY29sbGVjdGlvbltsZW5ndGhdLCBsZW5ndGgsIGNvbGxlY3Rpb24pID09PSBmYWxzZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcHJvcHMgPSBrZXlzKGNvbGxlY3Rpb24pO1xuICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG4gICAgICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwga2V5LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAga2V5ID0gcHJvcHMgPyBwcm9wc1stLWxlbmd0aF0gOiAtLWxlbmd0aDtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soY29sbGVjdGlvbltrZXldLCBrZXksIGNvbGxlY3Rpb24pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gb2JqZWN0IGNvbXBvc2VkIG9mIGtleXMgZ2VuZXJhdGVkIGZyb20gdGhlIHJlc3VsdHMgb2YgcnVubmluZ1xuICAgICAqIGVhY2ggZWxlbWVudCBvZiBhIGNvbGxlY3Rpb24gdGhyb3VnaCB0aGUgY2FsbGJhY2suIFRoZSBjb3JyZXNwb25kaW5nIHZhbHVlXG4gICAgICogb2YgZWFjaCBrZXkgaXMgYW4gYXJyYXkgb2YgdGhlIGVsZW1lbnRzIHJlc3BvbnNpYmxlIGZvciBnZW5lcmF0aW5nIHRoZSBrZXkuXG4gICAgICogVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50cztcbiAgICAgKiAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYFxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNvbXBvc2VkIGFnZ3JlZ2F0ZSBvYmplY3QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uZ3JvdXBCeShbNC4yLCA2LjEsIDYuNF0sIGZ1bmN0aW9uKG51bSkgeyByZXR1cm4gTWF0aC5mbG9vcihudW0pOyB9KTtcbiAgICAgKiAvLyA9PiB7ICc0JzogWzQuMl0sICc2JzogWzYuMSwgNi40XSB9XG4gICAgICpcbiAgICAgKiBfLmdyb3VwQnkoWzQuMiwgNi4xLCA2LjRdLCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIHRoaXMuZmxvb3IobnVtKTsgfSwgTWF0aCk7XG4gICAgICogLy8gPT4geyAnNCc6IFs0LjJdLCAnNic6IFs2LjEsIDYuNF0gfVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5ncm91cEJ5KFsnb25lJywgJ3R3bycsICd0aHJlZSddLCAnbGVuZ3RoJyk7XG4gICAgICogLy8gPT4geyAnMyc6IFsnb25lJywgJ3R3byddLCAnNSc6IFsndGhyZWUnXSB9XG4gICAgICovXG4gICAgdmFyIGdyb3VwQnkgPSBjcmVhdGVBZ2dyZWdhdG9yKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgICAgKGhhc093blByb3BlcnR5LmNhbGwocmVzdWx0LCBrZXkpID8gcmVzdWx0W2tleV0gOiByZXN1bHRba2V5XSA9IFtdKS5wdXNoKHZhbHVlKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gb2JqZWN0IGNvbXBvc2VkIG9mIGtleXMgZ2VuZXJhdGVkIGZyb20gdGhlIHJlc3VsdHMgb2YgcnVubmluZ1xuICAgICAqIGVhY2ggZWxlbWVudCBvZiB0aGUgY29sbGVjdGlvbiB0aHJvdWdoIHRoZSBnaXZlbiBjYWxsYmFjay4gVGhlIGNvcnJlc3BvbmRpbmdcbiAgICAgKiB2YWx1ZSBvZiBlYWNoIGtleSBpcyB0aGUgbGFzdCBlbGVtZW50IHJlc3BvbnNpYmxlIGZvciBnZW5lcmF0aW5nIHRoZSBrZXkuXG4gICAgICogVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50cztcbiAgICAgKiAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjb21wb3NlZCBhZ2dyZWdhdGUgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIga2V5cyA9IFtcbiAgICAgKiAgIHsgJ2Rpcic6ICdsZWZ0JywgJ2NvZGUnOiA5NyB9LFxuICAgICAqICAgeyAnZGlyJzogJ3JpZ2h0JywgJ2NvZGUnOiAxMDAgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiBfLmluZGV4Qnkoa2V5cywgJ2RpcicpO1xuICAgICAqIC8vID0+IHsgJ2xlZnQnOiB7ICdkaXInOiAnbGVmdCcsICdjb2RlJzogOTcgfSwgJ3JpZ2h0JzogeyAnZGlyJzogJ3JpZ2h0JywgJ2NvZGUnOiAxMDAgfSB9XG4gICAgICpcbiAgICAgKiBfLmluZGV4Qnkoa2V5cywgZnVuY3Rpb24oa2V5KSB7IHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleS5jb2RlKTsgfSk7XG4gICAgICogLy8gPT4geyAnYSc6IHsgJ2Rpcic6ICdsZWZ0JywgJ2NvZGUnOiA5NyB9LCAnZCc6IHsgJ2Rpcic6ICdyaWdodCcsICdjb2RlJzogMTAwIH0gfVxuICAgICAqXG4gICAgICogXy5pbmRleEJ5KGNoYXJhY3RlcnMsIGZ1bmN0aW9uKGtleSkgeyB0aGlzLmZyb21DaGFyQ29kZShrZXkuY29kZSk7IH0sIFN0cmluZyk7XG4gICAgICogLy8gPT4geyAnYSc6IHsgJ2Rpcic6ICdsZWZ0JywgJ2NvZGUnOiA5NyB9LCAnZCc6IHsgJ2Rpcic6ICdyaWdodCcsICdjb2RlJzogMTAwIH0gfVxuICAgICAqL1xuICAgIHZhciBpbmRleEJ5ID0gY3JlYXRlQWdncmVnYXRvcihmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VzIHRoZSBtZXRob2QgbmFtZWQgYnkgYG1ldGhvZE5hbWVgIG9uIGVhY2ggZWxlbWVudCBpbiB0aGUgYGNvbGxlY3Rpb25gXG4gICAgICogcmV0dXJuaW5nIGFuIGFycmF5IG9mIHRoZSByZXN1bHRzIG9mIGVhY2ggaW52b2tlZCBtZXRob2QuIEFkZGl0aW9uYWwgYXJndW1lbnRzXG4gICAgICogd2lsbCBiZSBwcm92aWRlZCB0byBlYWNoIGludm9rZWQgbWV0aG9kLiBJZiBgbWV0aG9kTmFtZWAgaXMgYSBmdW5jdGlvbiBpdFxuICAgICAqIHdpbGwgYmUgaW52b2tlZCBmb3IsIGFuZCBgdGhpc2AgYm91bmQgdG8sIGVhY2ggZWxlbWVudCBpbiB0aGUgYGNvbGxlY3Rpb25gLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufHN0cmluZ30gbWV0aG9kTmFtZSBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIHRvIGludm9rZSBvclxuICAgICAqICB0aGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2FyZ10gQXJndW1lbnRzIHRvIGludm9rZSB0aGUgbWV0aG9kIHdpdGguXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGFycmF5IG9mIHRoZSByZXN1bHRzIG9mIGVhY2ggaW52b2tlZCBtZXRob2QuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaW52b2tlKFtbNSwgMSwgN10sIFszLCAyLCAxXV0sICdzb3J0Jyk7XG4gICAgICogLy8gPT4gW1sxLCA1LCA3XSwgWzEsIDIsIDNdXVxuICAgICAqXG4gICAgICogXy5pbnZva2UoWzEyMywgNDU2XSwgU3RyaW5nLnByb3RvdHlwZS5zcGxpdCwgJycpO1xuICAgICAqIC8vID0+IFtbJzEnLCAnMicsICczJ10sIFsnNCcsICc1JywgJzYnXV1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpbnZva2UoY29sbGVjdGlvbiwgbWV0aG9kTmFtZSkge1xuICAgICAgdmFyIGFyZ3MgPSBzbGljZShhcmd1bWVudHMsIDIpLFxuICAgICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgICAgaXNGdW5jID0gdHlwZW9mIG1ldGhvZE5hbWUgPT0gJ2Z1bmN0aW9uJyxcbiAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uID8gY29sbGVjdGlvbi5sZW5ndGggOiAwLFxuICAgICAgICAgIHJlc3VsdCA9IEFycmF5KHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicgPyBsZW5ndGggOiAwKTtcblxuICAgICAgZm9yRWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXN1bHRbKytpbmRleF0gPSAoaXNGdW5jID8gbWV0aG9kTmFtZSA6IHZhbHVlW21ldGhvZE5hbWVdKS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSBvZiB2YWx1ZXMgYnkgcnVubmluZyBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb25cbiAgICAgKiB0aHJvdWdoIHRoZSBjYWxsYmFjay4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoXG4gICAgICogdGhyZWUgYXJndW1lbnRzOyAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyBjb2xsZWN0XG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBhcnJheSBvZiB0aGUgcmVzdWx0cyBvZiBlYWNoIGBjYWxsYmFja2AgZXhlY3V0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLm1hcChbMSwgMiwgM10sIGZ1bmN0aW9uKG51bSkgeyByZXR1cm4gbnVtICogMzsgfSk7XG4gICAgICogLy8gPT4gWzMsIDYsIDldXG4gICAgICpcbiAgICAgKiBfLm1hcCh7ICdvbmUnOiAxLCAndHdvJzogMiwgJ3RocmVlJzogMyB9LCBmdW5jdGlvbihudW0pIHsgcmV0dXJuIG51bSAqIDM7IH0pO1xuICAgICAqIC8vID0+IFszLCA2LCA5XSAocHJvcGVydHkgb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50cylcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5tYXAoY2hhcmFjdGVycywgJ25hbWUnKTtcbiAgICAgKiAvLyA9PiBbJ2Jhcm5leScsICdmcmVkJ11cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtYXAoY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGNvbGxlY3Rpb24gPyBjb2xsZWN0aW9uLmxlbmd0aCA6IDA7XG5cbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgIGlmICh0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBjYWxsYmFjayhjb2xsZWN0aW9uW2luZGV4XSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yT3duKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBrZXksIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICByZXN1bHRbKytpbmRleF0gPSBjYWxsYmFjayh2YWx1ZSwga2V5LCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlcyB0aGUgbWF4aW11bSB2YWx1ZSBvZiBhIGNvbGxlY3Rpb24uIElmIHRoZSBjb2xsZWN0aW9uIGlzIGVtcHR5IG9yXG4gICAgICogZmFsc2V5IGAtSW5maW5pdHlgIGlzIHJldHVybmVkLiBJZiBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgZXhlY3V0ZWRcbiAgICAgKiBmb3IgZWFjaCB2YWx1ZSBpbiB0aGUgY29sbGVjdGlvbiB0byBnZW5lcmF0ZSB0aGUgY3JpdGVyaW9uIGJ5IHdoaWNoIHRoZSB2YWx1ZVxuICAgICAqIGlzIHJhbmtlZC4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlXG4gICAgICogYXJndW1lbnRzOyAodmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKS5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBtYXhpbXVtIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLm1heChbNCwgMiwgOCwgNl0pO1xuICAgICAqIC8vID0+IDhcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogXy5tYXgoY2hhcmFjdGVycywgZnVuY3Rpb24oY2hyKSB7IHJldHVybiBjaHIuYWdlOyB9KTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAgfTtcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8ubWF4KGNoYXJhY3RlcnMsICdhZ2UnKTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAgfTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtYXgoY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciBjb21wdXRlZCA9IC1JbmZpbml0eSxcbiAgICAgICAgICByZXN1bHQgPSBjb21wdXRlZDtcblxuICAgICAgLy8gYWxsb3dzIHdvcmtpbmcgd2l0aCBmdW5jdGlvbnMgbGlrZSBgXy5tYXBgIHdpdGhvdXQgdXNpbmdcbiAgICAgIC8vIHRoZWlyIGBpbmRleGAgYXJndW1lbnQgYXMgYSBjYWxsYmFja1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSAnZnVuY3Rpb24nICYmIHRoaXNBcmcgJiYgdGhpc0FyZ1tjYWxsYmFja10gPT09IGNvbGxlY3Rpb24pIHtcbiAgICAgICAgY2FsbGJhY2sgPSBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKGNhbGxiYWNrID09IG51bGwgJiYgaXNBcnJheShjb2xsZWN0aW9uKSkge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIHZhbHVlID0gY29sbGVjdGlvbltpbmRleF07XG4gICAgICAgICAgaWYgKHZhbHVlID4gcmVzdWx0KSB7XG4gICAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrID0gKGNhbGxiYWNrID09IG51bGwgJiYgaXNTdHJpbmcoY29sbGVjdGlvbikpXG4gICAgICAgICAgPyBjaGFyQXRDYWxsYmFja1xuICAgICAgICAgIDogbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcblxuICAgICAgICBmb3JFYWNoKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICAgIHZhciBjdXJyZW50ID0gY2FsbGJhY2sodmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgICAgICBpZiAoY3VycmVudCA+IGNvbXB1dGVkKSB7XG4gICAgICAgICAgICBjb21wdXRlZCA9IGN1cnJlbnQ7XG4gICAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgdGhlIG1pbmltdW0gdmFsdWUgb2YgYSBjb2xsZWN0aW9uLiBJZiB0aGUgY29sbGVjdGlvbiBpcyBlbXB0eSBvclxuICAgICAqIGZhbHNleSBgSW5maW5pdHlgIGlzIHJldHVybmVkLiBJZiBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgZXhlY3V0ZWRcbiAgICAgKiBmb3IgZWFjaCB2YWx1ZSBpbiB0aGUgY29sbGVjdGlvbiB0byBnZW5lcmF0ZSB0aGUgY3JpdGVyaW9uIGJ5IHdoaWNoIHRoZSB2YWx1ZVxuICAgICAqIGlzIHJhbmtlZC4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlXG4gICAgICogYXJndW1lbnRzOyAodmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKS5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxzdHJpbmd9IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICAgICAqICB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBtaW5pbXVtIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLm1pbihbNCwgMiwgOCwgNl0pO1xuICAgICAqIC8vID0+IDJcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogXy5taW4oY2hhcmFjdGVycywgZnVuY3Rpb24oY2hyKSB7IHJldHVybiBjaHIuYWdlOyB9KTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiB9O1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5taW4oY2hhcmFjdGVycywgJ2FnZScpO1xuICAgICAqIC8vID0+IHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH07XG4gICAgICovXG4gICAgZnVuY3Rpb24gbWluKGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgY29tcHV0ZWQgPSBJbmZpbml0eSxcbiAgICAgICAgICByZXN1bHQgPSBjb21wdXRlZDtcblxuICAgICAgLy8gYWxsb3dzIHdvcmtpbmcgd2l0aCBmdW5jdGlvbnMgbGlrZSBgXy5tYXBgIHdpdGhvdXQgdXNpbmdcbiAgICAgIC8vIHRoZWlyIGBpbmRleGAgYXJndW1lbnQgYXMgYSBjYWxsYmFja1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSAnZnVuY3Rpb24nICYmIHRoaXNBcmcgJiYgdGhpc0FyZ1tjYWxsYmFja10gPT09IGNvbGxlY3Rpb24pIHtcbiAgICAgICAgY2FsbGJhY2sgPSBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKGNhbGxiYWNrID09IG51bGwgJiYgaXNBcnJheShjb2xsZWN0aW9uKSkge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIHZhbHVlID0gY29sbGVjdGlvbltpbmRleF07XG4gICAgICAgICAgaWYgKHZhbHVlIDwgcmVzdWx0KSB7XG4gICAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrID0gKGNhbGxiYWNrID09IG51bGwgJiYgaXNTdHJpbmcoY29sbGVjdGlvbikpXG4gICAgICAgICAgPyBjaGFyQXRDYWxsYmFja1xuICAgICAgICAgIDogbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcblxuICAgICAgICBmb3JFYWNoKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICAgIHZhciBjdXJyZW50ID0gY2FsbGJhY2sodmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgICAgICBpZiAoY3VycmVudCA8IGNvbXB1dGVkKSB7XG4gICAgICAgICAgICBjb21wdXRlZCA9IGN1cnJlbnQ7XG4gICAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgdGhlIHZhbHVlIG9mIGEgc3BlY2lmaWVkIHByb3BlcnR5IGZyb20gYWxsIGVsZW1lbnRzIGluIHRoZSBjb2xsZWN0aW9uLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gcGx1Y2suXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGFycmF5IG9mIHByb3BlcnR5IHZhbHVlcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAnYWdlJzogNDAgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiBfLnBsdWNrKGNoYXJhY3RlcnMsICduYW1lJyk7XG4gICAgICogLy8gPT4gWydiYXJuZXknLCAnZnJlZCddXG4gICAgICovXG4gICAgdmFyIHBsdWNrID0gbWFwO1xuXG4gICAgLyoqXG4gICAgICogUmVkdWNlcyBhIGNvbGxlY3Rpb24gdG8gYSB2YWx1ZSB3aGljaCBpcyB0aGUgYWNjdW11bGF0ZWQgcmVzdWx0IG9mIHJ1bm5pbmdcbiAgICAgKiBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24gdGhyb3VnaCB0aGUgY2FsbGJhY2ssIHdoZXJlIGVhY2ggc3VjY2Vzc2l2ZVxuICAgICAqIGNhbGxiYWNrIGV4ZWN1dGlvbiBjb25zdW1lcyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBwcmV2aW91cyBleGVjdXRpb24uIElmXG4gICAgICogYGFjY3VtdWxhdG9yYCBpcyBub3QgcHJvdmlkZWQgdGhlIGZpcnN0IGVsZW1lbnQgb2YgdGhlIGNvbGxlY3Rpb24gd2lsbCBiZVxuICAgICAqIHVzZWQgYXMgdGhlIGluaXRpYWwgYGFjY3VtdWxhdG9yYCB2YWx1ZS4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYFxuICAgICAqIGFuZCBpbnZva2VkIHdpdGggZm91ciBhcmd1bWVudHM7IChhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgZm9sZGwsIGluamVjdFxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHsqfSBbYWNjdW11bGF0b3JdIEluaXRpYWwgdmFsdWUgb2YgdGhlIGFjY3VtdWxhdG9yLlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBhY2N1bXVsYXRlZCB2YWx1ZS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIHN1bSA9IF8ucmVkdWNlKFsxLCAyLCAzXSwgZnVuY3Rpb24oc3VtLCBudW0pIHtcbiAgICAgKiAgIHJldHVybiBzdW0gKyBudW07XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gNlxuICAgICAqXG4gICAgICogdmFyIG1hcHBlZCA9IF8ucmVkdWNlKHsgJ2EnOiAxLCAnYic6IDIsICdjJzogMyB9LCBmdW5jdGlvbihyZXN1bHQsIG51bSwga2V5KSB7XG4gICAgICogICByZXN1bHRba2V5XSA9IG51bSAqIDM7XG4gICAgICogICByZXR1cm4gcmVzdWx0O1xuICAgICAqIH0sIHt9KTtcbiAgICAgKiAvLyA9PiB7ICdhJzogMywgJ2InOiA2LCAnYyc6IDkgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlZHVjZShjb2xsZWN0aW9uLCBjYWxsYmFjaywgYWNjdW11bGF0b3IsIHRoaXNBcmcpIHtcbiAgICAgIGlmICghY29sbGVjdGlvbikgcmV0dXJuIGFjY3VtdWxhdG9yO1xuICAgICAgdmFyIG5vYWNjdW0gPSBhcmd1bWVudHMubGVuZ3RoIDwgMztcbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCA0KTtcblxuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gY29sbGVjdGlvbi5sZW5ndGg7XG5cbiAgICAgIGlmICh0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInKSB7XG4gICAgICAgIGlmIChub2FjY3VtKSB7XG4gICAgICAgICAgYWNjdW11bGF0b3IgPSBjb2xsZWN0aW9uWysraW5kZXhdO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgYWNjdW11bGF0b3IgPSBjYWxsYmFjayhhY2N1bXVsYXRvciwgY29sbGVjdGlvbltpbmRleF0sIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yT3duKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICAgIGFjY3VtdWxhdG9yID0gbm9hY2N1bVxuICAgICAgICAgICAgPyAobm9hY2N1bSA9IGZhbHNlLCB2YWx1ZSlcbiAgICAgICAgICAgIDogY2FsbGJhY2soYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbilcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYWNjdW11bGF0b3I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5yZWR1Y2VgIGV4Y2VwdCB0aGF0IGl0IGl0ZXJhdGVzIG92ZXIgZWxlbWVudHNcbiAgICAgKiBvZiBhIGBjb2xsZWN0aW9uYCBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgZm9sZHJcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7Kn0gW2FjY3VtdWxhdG9yXSBJbml0aWFsIHZhbHVlIG9mIHRoZSBhY2N1bXVsYXRvci5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgYWNjdW11bGF0ZWQgdmFsdWUuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBsaXN0ID0gW1swLCAxXSwgWzIsIDNdLCBbNCwgNV1dO1xuICAgICAqIHZhciBmbGF0ID0gXy5yZWR1Y2VSaWdodChsaXN0LCBmdW5jdGlvbihhLCBiKSB7IHJldHVybiBhLmNvbmNhdChiKTsgfSwgW10pO1xuICAgICAqIC8vID0+IFs0LCA1LCAyLCAzLCAwLCAxXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlZHVjZVJpZ2h0KGNvbGxlY3Rpb24sIGNhbGxiYWNrLCBhY2N1bXVsYXRvciwgdGhpc0FyZykge1xuICAgICAgdmFyIG5vYWNjdW0gPSBhcmd1bWVudHMubGVuZ3RoIDwgMztcbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCA0KTtcbiAgICAgIGZvckVhY2hSaWdodChjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgYWNjdW11bGF0b3IgPSBub2FjY3VtXG4gICAgICAgICAgPyAobm9hY2N1bSA9IGZhbHNlLCB2YWx1ZSlcbiAgICAgICAgICA6IGNhbGxiYWNrKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gYWNjdW11bGF0b3I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIG9wcG9zaXRlIG9mIGBfLmZpbHRlcmAgdGhpcyBtZXRob2QgcmV0dXJucyB0aGUgZWxlbWVudHMgb2YgYVxuICAgICAqIGNvbGxlY3Rpb24gdGhhdCB0aGUgY2FsbGJhY2sgZG9lcyAqKm5vdCoqIHJldHVybiB0cnVleSBmb3IuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgYXJyYXkgb2YgZWxlbWVudHMgdGhhdCBmYWlsZWQgdGhlIGNhbGxiYWNrIGNoZWNrLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgb2RkcyA9IF8ucmVqZWN0KFsxLCAyLCAzLCA0LCA1LCA2XSwgZnVuY3Rpb24obnVtKSB7IHJldHVybiBudW0gJSAyID09IDA7IH0pO1xuICAgICAqIC8vID0+IFsxLCAzLCA1XVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICdhZ2UnOiAzNiwgJ2Jsb2NrZWQnOiBmYWxzZSB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAnYWdlJzogNDAsICdibG9ja2VkJzogdHJ1ZSB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8ucmVqZWN0KGNoYXJhY3RlcnMsICdibG9ja2VkJyk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2LCAnYmxvY2tlZCc6IGZhbHNlIH1dXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ud2hlcmVcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLnJlamVjdChjaGFyYWN0ZXJzLCB7ICdhZ2UnOiAzNiB9KTtcbiAgICAgKiAvLyA9PiBbeyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwLCAnYmxvY2tlZCc6IHRydWUgfV1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWplY3QoY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgIHJldHVybiBmaWx0ZXIoY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiAhY2FsbGJhY2sodmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlcyBhIHJhbmRvbSBlbGVtZW50IG9yIGBuYCByYW5kb20gZWxlbWVudHMgZnJvbSBhIGNvbGxlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gc2FtcGxlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbl0gVGhlIG51bWJlciBvZiBlbGVtZW50cyB0byBzYW1wbGUuXG4gICAgICogQHBhcmFtLSB7T2JqZWN0fSBbZ3VhcmRdIEFsbG93cyB3b3JraW5nIHdpdGggZnVuY3Rpb25zIGxpa2UgYF8ubWFwYFxuICAgICAqICB3aXRob3V0IHVzaW5nIHRoZWlyIGBpbmRleGAgYXJndW1lbnRzIGFzIGBuYC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHJhbmRvbSBzYW1wbGUocykgb2YgYGNvbGxlY3Rpb25gLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnNhbXBsZShbMSwgMiwgMywgNF0pO1xuICAgICAqIC8vID0+IDJcbiAgICAgKlxuICAgICAqIF8uc2FtcGxlKFsxLCAyLCAzLCA0XSwgMik7XG4gICAgICogLy8gPT4gWzMsIDFdXG4gICAgICovXG4gICAgZnVuY3Rpb24gc2FtcGxlKGNvbGxlY3Rpb24sIG4sIGd1YXJkKSB7XG4gICAgICBpZiAoY29sbGVjdGlvbiAmJiB0eXBlb2YgY29sbGVjdGlvbi5sZW5ndGggIT0gJ251bWJlcicpIHtcbiAgICAgICAgY29sbGVjdGlvbiA9IHZhbHVlcyhjb2xsZWN0aW9uKTtcbiAgICAgIH1cbiAgICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHtcbiAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb24gPyBjb2xsZWN0aW9uW2Jhc2VSYW5kb20oMCwgY29sbGVjdGlvbi5sZW5ndGggLSAxKV0gOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICB2YXIgcmVzdWx0ID0gc2h1ZmZsZShjb2xsZWN0aW9uKTtcbiAgICAgIHJlc3VsdC5sZW5ndGggPSBuYXRpdmVNaW4obmF0aXZlTWF4KDAsIG4pLCByZXN1bHQubGVuZ3RoKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSBvZiBzaHVmZmxlZCB2YWx1ZXMsIHVzaW5nIGEgdmVyc2lvbiBvZiB0aGUgRmlzaGVyLVlhdGVzXG4gICAgICogc2h1ZmZsZS4gU2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmlzaGVyLVlhdGVzX3NodWZmbGUuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gc2h1ZmZsZS5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgc2h1ZmZsZWQgY29sbGVjdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5zaHVmZmxlKFsxLCAyLCAzLCA0LCA1LCA2XSk7XG4gICAgICogLy8gPT4gWzQsIDEsIDYsIDMsIDUsIDJdXG4gICAgICovXG4gICAgZnVuY3Rpb24gc2h1ZmZsZShjb2xsZWN0aW9uKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uID8gY29sbGVjdGlvbi5sZW5ndGggOiAwLFxuICAgICAgICAgIHJlc3VsdCA9IEFycmF5KHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicgPyBsZW5ndGggOiAwKTtcblxuICAgICAgZm9yRWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgcmFuZCA9IGJhc2VSYW5kb20oMCwgKytpbmRleCk7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSByZXN1bHRbcmFuZF07XG4gICAgICAgIHJlc3VsdFtyYW5kXSA9IHZhbHVlO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHNpemUgb2YgdGhlIGBjb2xsZWN0aW9uYCBieSByZXR1cm5pbmcgYGNvbGxlY3Rpb24ubGVuZ3RoYCBmb3IgYXJyYXlzXG4gICAgICogYW5kIGFycmF5LWxpa2Ugb2JqZWN0cyBvciB0aGUgbnVtYmVyIG9mIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgZm9yIG9iamVjdHMuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIGBjb2xsZWN0aW9uLmxlbmd0aGAgb3IgbnVtYmVyIG9mIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uc2l6ZShbMSwgMl0pO1xuICAgICAqIC8vID0+IDJcbiAgICAgKlxuICAgICAqIF8uc2l6ZSh7ICdvbmUnOiAxLCAndHdvJzogMiwgJ3RocmVlJzogMyB9KTtcbiAgICAgKiAvLyA9PiAzXG4gICAgICpcbiAgICAgKiBfLnNpemUoJ3BlYmJsZXMnKTtcbiAgICAgKiAvLyA9PiA3XG4gICAgICovXG4gICAgZnVuY3Rpb24gc2l6ZShjb2xsZWN0aW9uKSB7XG4gICAgICB2YXIgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMDtcbiAgICAgIHJldHVybiB0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInID8gbGVuZ3RoIDoga2V5cyhjb2xsZWN0aW9uKS5sZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoZSBjYWxsYmFjayByZXR1cm5zIGEgdHJ1ZXkgdmFsdWUgZm9yICoqYW55KiogZWxlbWVudCBvZiBhXG4gICAgICogY29sbGVjdGlvbi4gVGhlIGZ1bmN0aW9uIHJldHVybnMgYXMgc29vbiBhcyBpdCBmaW5kcyBhIHBhc3NpbmcgdmFsdWUgYW5kXG4gICAgICogZG9lcyBub3QgaXRlcmF0ZSBvdmVyIHRoZSBlbnRpcmUgY29sbGVjdGlvbi4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvXG4gICAgICogYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOyAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyBhbnlcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvbnNcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFueSBlbGVtZW50IHBhc3NlZCB0aGUgY2FsbGJhY2sgY2hlY2ssXG4gICAgICogIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5zb21lKFtudWxsLCAwLCAneWVzJywgZmFsc2VdLCBCb29sZWFuKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2LCAnYmxvY2tlZCc6IGZhbHNlIH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCwgJ2Jsb2NrZWQnOiB0cnVlIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5zb21lKGNoYXJhY3RlcnMsICdibG9ja2VkJyk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLndoZXJlXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5zb21lKGNoYXJhY3RlcnMsIHsgJ2FnZSc6IDEgfSk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzb21lKGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgcmVzdWx0O1xuICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuXG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBjb2xsZWN0aW9uID8gY29sbGVjdGlvbi5sZW5ndGggOiAwO1xuXG4gICAgICBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIGlmICgocmVzdWx0ID0gY2FsbGJhY2soY29sbGVjdGlvbltpbmRleF0sIGluZGV4LCBjb2xsZWN0aW9uKSkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yT3duKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICAgIHJldHVybiAhKHJlc3VsdCA9IGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAhIXJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFycmF5IG9mIGVsZW1lbnRzLCBzb3J0ZWQgaW4gYXNjZW5kaW5nIG9yZGVyIGJ5IHRoZSByZXN1bHRzIG9mXG4gICAgICogcnVubmluZyBlYWNoIGVsZW1lbnQgaW4gYSBjb2xsZWN0aW9uIHRocm91Z2ggdGhlIGNhbGxiYWNrLiBUaGlzIG1ldGhvZFxuICAgICAqIHBlcmZvcm1zIGEgc3RhYmxlIHNvcnQsIHRoYXQgaXMsIGl0IHdpbGwgcHJlc2VydmUgdGhlIG9yaWdpbmFsIHNvcnQgb3JkZXJcbiAgICAgKiBvZiBlcXVhbCBlbGVtZW50cy4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoXG4gICAgICogdGhyZWUgYXJndW1lbnRzOyAodmFsdWUsIGluZGV4fGtleSwgY29sbGVjdGlvbikuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY29sbGVjdGlvblxuICAgICAqIHdpbGwgYmUgc29ydGVkIGJ5IGVhY2ggcHJvcGVydHkgdmFsdWUuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtBcnJheXxGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgYXJyYXkgb2Ygc29ydGVkIGVsZW1lbnRzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnNvcnRCeShbMSwgMiwgM10sIGZ1bmN0aW9uKG51bSkgeyByZXR1cm4gTWF0aC5zaW4obnVtKTsgfSk7XG4gICAgICogLy8gPT4gWzMsIDEsIDJdXG4gICAgICpcbiAgICAgKiBfLnNvcnRCeShbMSwgMiwgM10sIGZ1bmN0aW9uKG51bSkgeyByZXR1cm4gdGhpcy5zaW4obnVtKTsgfSwgTWF0aCk7XG4gICAgICogLy8gPT4gWzMsIDEsIDJdXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgICdhZ2UnOiAzNiB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAgJ2FnZSc6IDQwIH0sXG4gICAgICogICB7ICduYW1lJzogJ2Jhcm5leScsICAnYWdlJzogMjYgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgICdhZ2UnOiAzMCB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8ubWFwKF8uc29ydEJ5KGNoYXJhY3RlcnMsICdhZ2UnKSwgXy52YWx1ZXMpO1xuICAgICAqIC8vID0+IFtbJ2Jhcm5leScsIDI2XSwgWydmcmVkJywgMzBdLCBbJ2Jhcm5leScsIDM2XSwgWydmcmVkJywgNDBdXVxuICAgICAqXG4gICAgICogLy8gc29ydGluZyBieSBtdWx0aXBsZSBwcm9wZXJ0aWVzXG4gICAgICogXy5tYXAoXy5zb3J0QnkoY2hhcmFjdGVycywgWyduYW1lJywgJ2FnZSddKSwgXy52YWx1ZXMpO1xuICAgICAqIC8vID0gPiBbWydiYXJuZXknLCAyNl0sIFsnYmFybmV5JywgMzZdLCBbJ2ZyZWQnLCAzMF0sIFsnZnJlZCcsIDQwXV1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzb3J0QnkoY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGlzQXJyID0gaXNBcnJheShjYWxsYmFjayksXG4gICAgICAgICAgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMCxcbiAgICAgICAgICByZXN1bHQgPSBBcnJheSh0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInID8gbGVuZ3RoIDogMCk7XG5cbiAgICAgIGlmICghaXNBcnIpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgfVxuICAgICAgZm9yRWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwga2V5LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIHZhciBvYmplY3QgPSByZXN1bHRbKytpbmRleF0gPSBnZXRPYmplY3QoKTtcbiAgICAgICAgaWYgKGlzQXJyKSB7XG4gICAgICAgICAgb2JqZWN0LmNyaXRlcmlhID0gbWFwKGNhbGxiYWNrLCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIChvYmplY3QuY3JpdGVyaWEgPSBnZXRBcnJheSgpKVswXSA9IGNhbGxiYWNrKHZhbHVlLCBrZXksIGNvbGxlY3Rpb24pO1xuICAgICAgICB9XG4gICAgICAgIG9iamVjdC5pbmRleCA9IGluZGV4O1xuICAgICAgICBvYmplY3QudmFsdWUgPSB2YWx1ZTtcbiAgICAgIH0pO1xuXG4gICAgICBsZW5ndGggPSByZXN1bHQubGVuZ3RoO1xuICAgICAgcmVzdWx0LnNvcnQoY29tcGFyZUFzY2VuZGluZyk7XG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgdmFyIG9iamVjdCA9IHJlc3VsdFtsZW5ndGhdO1xuICAgICAgICByZXN1bHRbbGVuZ3RoXSA9IG9iamVjdC52YWx1ZTtcbiAgICAgICAgaWYgKCFpc0Fycikge1xuICAgICAgICAgIHJlbGVhc2VBcnJheShvYmplY3QuY3JpdGVyaWEpO1xuICAgICAgICB9XG4gICAgICAgIHJlbGVhc2VPYmplY3Qob2JqZWN0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgdGhlIGBjb2xsZWN0aW9uYCB0byBhbiBhcnJheS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBjb252ZXJ0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGNvbnZlcnRlZCBhcnJheS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogKGZ1bmN0aW9uKCkgeyByZXR1cm4gXy50b0FycmF5KGFyZ3VtZW50cykuc2xpY2UoMSk7IH0pKDEsIDIsIDMsIDQpO1xuICAgICAqIC8vID0+IFsyLCAzLCA0XVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRvQXJyYXkoY29sbGVjdGlvbikge1xuICAgICAgaWYgKGNvbGxlY3Rpb24gJiYgdHlwZW9mIGNvbGxlY3Rpb24ubGVuZ3RoID09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBzbGljZShjb2xsZWN0aW9uKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZXMoY29sbGVjdGlvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybXMgYSBkZWVwIGNvbXBhcmlzb24gb2YgZWFjaCBlbGVtZW50IGluIGEgYGNvbGxlY3Rpb25gIHRvIHRoZSBnaXZlblxuICAgICAqIGBwcm9wZXJ0aWVzYCBvYmplY3QsIHJldHVybmluZyBhbiBhcnJheSBvZiBhbGwgZWxlbWVudHMgdGhhdCBoYXZlIGVxdWl2YWxlbnRcbiAgICAgKiBwcm9wZXJ0eSB2YWx1ZXMuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAdHlwZSBGdW5jdGlvblxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHByb3BzIFRoZSBvYmplY3Qgb2YgcHJvcGVydHkgdmFsdWVzIHRvIGZpbHRlciBieS5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgYXJyYXkgb2YgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBnaXZlbiBwcm9wZXJ0aWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2LCAncGV0cyc6IFsnaG9wcHknXSB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAnYWdlJzogNDAsICdwZXRzJzogWydiYWJ5IHB1c3MnLCAnZGlubyddIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogXy53aGVyZShjaGFyYWN0ZXJzLCB7ICdhZ2UnOiAzNiB9KTtcbiAgICAgKiAvLyA9PiBbeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYsICdwZXRzJzogWydob3BweSddIH1dXG4gICAgICpcbiAgICAgKiBfLndoZXJlKGNoYXJhY3RlcnMsIHsgJ3BldHMnOiBbJ2Rpbm8nXSB9KTtcbiAgICAgKiAvLyA9PiBbeyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwLCAncGV0cyc6IFsnYmFieSBwdXNzJywgJ2Rpbm8nXSB9XVxuICAgICAqL1xuICAgIHZhciB3aGVyZSA9IGZpbHRlcjtcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSB3aXRoIGFsbCBmYWxzZXkgdmFsdWVzIHJlbW92ZWQuIFRoZSB2YWx1ZXMgYGZhbHNlYCwgYG51bGxgLFxuICAgICAqIGAwYCwgYFwiXCJgLCBgdW5kZWZpbmVkYCwgYW5kIGBOYU5gIGFyZSBhbGwgZmFsc2V5LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBjb21wYWN0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBhcnJheSBvZiBmaWx0ZXJlZCB2YWx1ZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uY29tcGFjdChbMCwgMSwgZmFsc2UsIDIsICcnLCAzXSk7XG4gICAgICogLy8gPT4gWzEsIDIsIDNdXG4gICAgICovXG4gICAgZnVuY3Rpb24gY29tcGFjdChhcnJheSkge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwLFxuICAgICAgICAgIHJlc3VsdCA9IFtdO1xuXG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF07XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFycmF5IGV4Y2x1ZGluZyBhbGwgdmFsdWVzIG9mIHRoZSBwcm92aWRlZCBhcnJheXMgdXNpbmcgc3RyaWN0XG4gICAgICogZXF1YWxpdHkgZm9yIGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBwcm9jZXNzLlxuICAgICAqIEBwYXJhbSB7Li4uQXJyYXl9IFt2YWx1ZXNdIFRoZSBhcnJheXMgb2YgdmFsdWVzIHRvIGV4Y2x1ZGUuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGFycmF5IG9mIGZpbHRlcmVkIHZhbHVlcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5kaWZmZXJlbmNlKFsxLCAyLCAzLCA0LCA1XSwgWzUsIDIsIDEwXSk7XG4gICAgICogLy8gPT4gWzEsIDMsIDRdXG4gICAgICovXG4gICAgZnVuY3Rpb24gZGlmZmVyZW5jZShhcnJheSkge1xuICAgICAgcmV0dXJuIGJhc2VEaWZmZXJlbmNlKGFycmF5LCBiYXNlRmxhdHRlbihhcmd1bWVudHMsIHRydWUsIHRydWUsIDEpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmZpbmRgIGV4Y2VwdCB0aGF0IGl0IHJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBmaXJzdFxuICAgICAqIGVsZW1lbnQgdGhhdCBwYXNzZXMgdGhlIGNhbGxiYWNrIGNoZWNrLCBpbnN0ZWFkIG9mIHRoZSBlbGVtZW50IGl0c2VsZi5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBzZWFyY2guXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgZm91bmQgZWxlbWVudCwgZWxzZSBgLTFgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgICdhZ2UnOiAzNiwgJ2Jsb2NrZWQnOiBmYWxzZSB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAgJ2FnZSc6IDQwLCAnYmxvY2tlZCc6IHRydWUgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAncGViYmxlcycsICdhZ2UnOiAxLCAgJ2Jsb2NrZWQnOiBmYWxzZSB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIF8uZmluZEluZGV4KGNoYXJhY3RlcnMsIGZ1bmN0aW9uKGNocikge1xuICAgICAqICAgcmV0dXJuIGNoci5hZ2UgPCAyMDtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiAyXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ud2hlcmVcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmZpbmRJbmRleChjaGFyYWN0ZXJzLCB7ICdhZ2UnOiAzNiB9KTtcbiAgICAgKiAvLyA9PiAwXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmZpbmRJbmRleChjaGFyYWN0ZXJzLCAnYmxvY2tlZCcpO1xuICAgICAqIC8vID0+IDFcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmaW5kSW5kZXgoYXJyYXksIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDA7XG5cbiAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIGlmIChjYWxsYmFjayhhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHtcbiAgICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmZpbmRJbmRleGAgZXhjZXB0IHRoYXQgaXQgaXRlcmF0ZXMgb3ZlciBlbGVtZW50c1xuICAgICAqIG9mIGEgYGNvbGxlY3Rpb25gIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBzZWFyY2guXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgZm91bmQgZWxlbWVudCwgZWxzZSBgLTFgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgICdhZ2UnOiAzNiwgJ2Jsb2NrZWQnOiB0cnVlIH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICAnYWdlJzogNDAsICdibG9ja2VkJzogZmFsc2UgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAncGViYmxlcycsICdhZ2UnOiAxLCAgJ2Jsb2NrZWQnOiB0cnVlIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogXy5maW5kTGFzdEluZGV4KGNoYXJhY3RlcnMsIGZ1bmN0aW9uKGNocikge1xuICAgICAqICAgcmV0dXJuIGNoci5hZ2UgPiAzMDtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiAxXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ud2hlcmVcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmZpbmRMYXN0SW5kZXgoY2hhcmFjdGVycywgeyAnYWdlJzogMzYgfSk7XG4gICAgICogLy8gPT4gMFxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5maW5kTGFzdEluZGV4KGNoYXJhY3RlcnMsICdibG9ja2VkJyk7XG4gICAgICogLy8gPT4gMlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZpbmRMYXN0SW5kZXgoYXJyYXksIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIGlmIChjYWxsYmFjayhhcnJheVtsZW5ndGhdLCBsZW5ndGgsIGFycmF5KSkge1xuICAgICAgICAgIHJldHVybiBsZW5ndGg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBmaXJzdCBlbGVtZW50IG9yIGZpcnN0IGBuYCBlbGVtZW50cyBvZiBhbiBhcnJheS4gSWYgYSBjYWxsYmFja1xuICAgICAqIGlzIHByb3ZpZGVkIGVsZW1lbnRzIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5IGFyZSByZXR1cm5lZCBhcyBsb25nXG4gICAgICogYXMgdGhlIGNhbGxiYWNrIHJldHVybnMgdHJ1ZXkuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kXG4gICAgICogaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleCwgYXJyYXkpLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAYWxpYXMgaGVhZCwgdGFrZVxuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gcXVlcnkuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8bnVtYmVyfHN0cmluZ30gW2NhbGxiYWNrXSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBlbGVtZW50IG9yIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgdG8gcmV0dXJuLiBJZiBhIHByb3BlcnR5IG5hbWUgb3JcbiAgICAgKiAgb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZCB0byBjcmVhdGUgYSBcIl8ucGx1Y2tcIiBvciBcIl8ud2hlcmVcIlxuICAgICAqICBzdHlsZSBjYWxsYmFjaywgcmVzcGVjdGl2ZWx5LlxuICAgICAqIEBwYXJhbSB7Kn0gW3RoaXNBcmddIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgY2FsbGJhY2tgLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmaXJzdCBlbGVtZW50KHMpIG9mIGBhcnJheWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uZmlyc3QoWzEsIDIsIDNdKTtcbiAgICAgKiAvLyA9PiAxXG4gICAgICpcbiAgICAgKiBfLmZpcnN0KFsxLCAyLCAzXSwgMik7XG4gICAgICogLy8gPT4gWzEsIDJdXG4gICAgICpcbiAgICAgKiBfLmZpcnN0KFsxLCAyLCAzXSwgZnVuY3Rpb24obnVtKSB7XG4gICAgICogICByZXR1cm4gbnVtIDwgMztcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiBbMSwgMl1cbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAgJ2Jsb2NrZWQnOiB0cnVlLCAgJ2VtcGxveWVyJzogJ3NsYXRlJyB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAgJ2Jsb2NrZWQnOiBmYWxzZSwgJ2VtcGxveWVyJzogJ3NsYXRlJyB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdwZWJibGVzJywgJ2Jsb2NrZWQnOiB0cnVlLCAgJ2VtcGxveWVyJzogJ25hJyB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uZmlyc3QoY2hhcmFjdGVycywgJ2Jsb2NrZWQnKTtcbiAgICAgKiAvLyA9PiBbeyAnbmFtZSc6ICdiYXJuZXknLCAnYmxvY2tlZCc6IHRydWUsICdlbXBsb3llcic6ICdzbGF0ZScgfV1cbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy53aGVyZVwiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8ucGx1Y2soXy5maXJzdChjaGFyYWN0ZXJzLCB7ICdlbXBsb3llcic6ICdzbGF0ZScgfSksICduYW1lJyk7XG4gICAgICogLy8gPT4gWydiYXJuZXknLCAnZnJlZCddXG4gICAgICovXG4gICAgZnVuY3Rpb24gZmlyc3QoYXJyYXksIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgbiA9IDAsXG4gICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuXG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9ICdudW1iZXInICYmIGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTE7XG4gICAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGggJiYgY2FsbGJhY2soYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICAgICAgbisrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuID0gY2FsbGJhY2s7XG4gICAgICAgIGlmIChuID09IG51bGwgfHwgdGhpc0FyZykge1xuICAgICAgICAgIHJldHVybiBhcnJheSA/IGFycmF5WzBdIDogdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gc2xpY2UoYXJyYXksIDAsIG5hdGl2ZU1pbihuYXRpdmVNYXgoMCwgbiksIGxlbmd0aCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZsYXR0ZW5zIGEgbmVzdGVkIGFycmF5ICh0aGUgbmVzdGluZyBjYW4gYmUgdG8gYW55IGRlcHRoKS4gSWYgYGlzU2hhbGxvd2BcbiAgICAgKiBpcyB0cnVleSwgdGhlIGFycmF5IHdpbGwgb25seSBiZSBmbGF0dGVuZWQgYSBzaW5nbGUgbGV2ZWwuIElmIGEgY2FsbGJhY2tcbiAgICAgKiBpcyBwcm92aWRlZCBlYWNoIGVsZW1lbnQgb2YgdGhlIGFycmF5IGlzIHBhc3NlZCB0aHJvdWdoIHRoZSBjYWxsYmFjayBiZWZvcmVcbiAgICAgKiBmbGF0dGVuaW5nLiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWVcbiAgICAgKiBhcmd1bWVudHM7ICh2YWx1ZSwgaW5kZXgsIGFycmF5KS5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBmbGF0dGVuLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzU2hhbGxvdz1mYWxzZV0gQSBmbGFnIHRvIHJlc3RyaWN0IGZsYXR0ZW5pbmcgdG8gYSBzaW5nbGUgbGV2ZWwuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAgICAgKiAgcGVyIGl0ZXJhdGlvbi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWRcbiAgICAgKiAgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgZmxhdHRlbmVkIGFycmF5LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmZsYXR0ZW4oWzEsIFsyXSwgWzMsIFtbNF1dXV0pO1xuICAgICAqIC8vID0+IFsxLCAyLCAzLCA0XTtcbiAgICAgKlxuICAgICAqIF8uZmxhdHRlbihbMSwgWzJdLCBbMywgW1s0XV1dXSwgdHJ1ZSk7XG4gICAgICogLy8gPT4gWzEsIDIsIDMsIFtbNF1dXTtcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzAsICdwZXRzJzogWydob3BweSddIH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCwgJ3BldHMnOiBbJ2JhYnkgcHVzcycsICdkaW5vJ10gfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmZsYXR0ZW4oY2hhcmFjdGVycywgJ3BldHMnKTtcbiAgICAgKiAvLyA9PiBbJ2hvcHB5JywgJ2JhYnkgcHVzcycsICdkaW5vJ11cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmbGF0dGVuKGFycmF5LCBpc1NoYWxsb3csIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICAvLyBqdWdnbGUgYXJndW1lbnRzXG4gICAgICBpZiAodHlwZW9mIGlzU2hhbGxvdyAhPSAnYm9vbGVhbicgJiYgaXNTaGFsbG93ICE9IG51bGwpIHtcbiAgICAgICAgdGhpc0FyZyA9IGNhbGxiYWNrO1xuICAgICAgICBjYWxsYmFjayA9ICh0eXBlb2YgaXNTaGFsbG93ICE9ICdmdW5jdGlvbicgJiYgdGhpc0FyZyAmJiB0aGlzQXJnW2lzU2hhbGxvd10gPT09IGFycmF5KSA/IG51bGwgOiBpc1NoYWxsb3c7XG4gICAgICAgIGlzU2hhbGxvdyA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgICAgYXJyYXkgPSBtYXAoYXJyYXksIGNhbGxiYWNrLCB0aGlzQXJnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiYXNlRmxhdHRlbihhcnJheSwgaXNTaGFsbG93KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBpbmRleCBhdCB3aGljaCB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBgdmFsdWVgIGlzIGZvdW5kIHVzaW5nXG4gICAgICogc3RyaWN0IGVxdWFsaXR5IGZvciBjb21wYXJpc29ucywgaS5lLiBgPT09YC4gSWYgdGhlIGFycmF5IGlzIGFscmVhZHkgc29ydGVkXG4gICAgICogcHJvdmlkaW5nIGB0cnVlYCBmb3IgYGZyb21JbmRleGAgd2lsbCBydW4gYSBmYXN0ZXIgYmluYXJ5IHNlYXJjaC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gc2VhcmNoLlxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHBhcmFtIHtib29sZWFufG51bWJlcn0gW2Zyb21JbmRleD0wXSBUaGUgaW5kZXggdG8gc2VhcmNoIGZyb20gb3IgYHRydWVgXG4gICAgICogIHRvIHBlcmZvcm0gYSBiaW5hcnkgc2VhcmNoIG9uIGEgc29ydGVkIGFycmF5LlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlIG9yIGAtMWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaW5kZXhPZihbMSwgMiwgMywgMSwgMiwgM10sIDIpO1xuICAgICAqIC8vID0+IDFcbiAgICAgKlxuICAgICAqIF8uaW5kZXhPZihbMSwgMiwgMywgMSwgMiwgM10sIDIsIDMpO1xuICAgICAqIC8vID0+IDRcbiAgICAgKlxuICAgICAqIF8uaW5kZXhPZihbMSwgMSwgMiwgMiwgMywgM10sIDIsIHRydWUpO1xuICAgICAqIC8vID0+IDJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpbmRleE9mKGFycmF5LCB2YWx1ZSwgZnJvbUluZGV4KSB7XG4gICAgICBpZiAodHlwZW9mIGZyb21JbmRleCA9PSAnbnVtYmVyJykge1xuICAgICAgICB2YXIgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuICAgICAgICBmcm9tSW5kZXggPSAoZnJvbUluZGV4IDwgMCA/IG5hdGl2ZU1heCgwLCBsZW5ndGggKyBmcm9tSW5kZXgpIDogZnJvbUluZGV4IHx8IDApO1xuICAgICAgfSBlbHNlIGlmIChmcm9tSW5kZXgpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gc29ydGVkSW5kZXgoYXJyYXksIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIGFycmF5W2luZGV4XSA9PT0gdmFsdWUgPyBpbmRleCA6IC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJhc2VJbmRleE9mKGFycmF5LCB2YWx1ZSwgZnJvbUluZGV4KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGFsbCBidXQgdGhlIGxhc3QgZWxlbWVudCBvciBsYXN0IGBuYCBlbGVtZW50cyBvZiBhbiBhcnJheS4gSWYgYVxuICAgICAqIGNhbGxiYWNrIGlzIHByb3ZpZGVkIGVsZW1lbnRzIGF0IHRoZSBlbmQgb2YgdGhlIGFycmF5IGFyZSBleGNsdWRlZCBmcm9tXG4gICAgICogdGhlIHJlc3VsdCBhcyBsb25nIGFzIHRoZSBjYWxsYmFjayByZXR1cm5zIHRydWV5LiBUaGUgY2FsbGJhY2sgaXMgYm91bmRcbiAgICAgKiB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM7ICh2YWx1ZSwgaW5kZXgsIGFycmF5KS5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBxdWVyeS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxudW1iZXJ8c3RyaW5nfSBbY2FsbGJhY2s9MV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgZWxlbWVudCBvciB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIHRvIGV4Y2x1ZGUuIElmIGEgcHJvcGVydHkgbmFtZSBvclxuICAgICAqICBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiXG4gICAgICogIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgc2xpY2Ugb2YgYGFycmF5YC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5pbml0aWFsKFsxLCAyLCAzXSk7XG4gICAgICogLy8gPT4gWzEsIDJdXG4gICAgICpcbiAgICAgKiBfLmluaXRpYWwoWzEsIDIsIDNdLCAyKTtcbiAgICAgKiAvLyA9PiBbMV1cbiAgICAgKlxuICAgICAqIF8uaW5pdGlhbChbMSwgMiwgM10sIGZ1bmN0aW9uKG51bSkge1xuICAgICAqICAgcmV0dXJuIG51bSA+IDE7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gWzFdXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgICdibG9ja2VkJzogZmFsc2UsICdlbXBsb3llcic6ICdzbGF0ZScgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgICdibG9ja2VkJzogdHJ1ZSwgICdlbXBsb3llcic6ICdzbGF0ZScgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAncGViYmxlcycsICdibG9ja2VkJzogdHJ1ZSwgICdlbXBsb3llcic6ICduYScgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLmluaXRpYWwoY2hhcmFjdGVycywgJ2Jsb2NrZWQnKTtcbiAgICAgKiAvLyA9PiBbeyAnbmFtZSc6ICdiYXJuZXknLCAgJ2Jsb2NrZWQnOiBmYWxzZSwgJ2VtcGxveWVyJzogJ3NsYXRlJyB9XVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLndoZXJlXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5wbHVjayhfLmluaXRpYWwoY2hhcmFjdGVycywgeyAnZW1wbG95ZXInOiAnbmEnIH0pLCAnbmFtZScpO1xuICAgICAqIC8vID0+IFsnYmFybmV5JywgJ2ZyZWQnXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGluaXRpYWwoYXJyYXksIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgbiA9IDAsXG4gICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuXG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9ICdudW1iZXInICYmIGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gbGVuZ3RoO1xuICAgICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICAgIHdoaWxlIChpbmRleC0tICYmIGNhbGxiYWNrKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSkge1xuICAgICAgICAgIG4rKztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbiA9IChjYWxsYmFjayA9PSBudWxsIHx8IHRoaXNBcmcpID8gMSA6IGNhbGxiYWNrIHx8IG47XG4gICAgICB9XG4gICAgICByZXR1cm4gc2xpY2UoYXJyYXksIDAsIG5hdGl2ZU1pbihuYXRpdmVNYXgoMCwgbGVuZ3RoIC0gbiksIGxlbmd0aCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdW5pcXVlIHZhbHVlcyBwcmVzZW50IGluIGFsbCBwcm92aWRlZCBhcnJheXMgdXNpbmdcbiAgICAgKiBzdHJpY3QgZXF1YWxpdHkgZm9yIGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7Li4uQXJyYXl9IFthcnJheV0gVGhlIGFycmF5cyB0byBpbnNwZWN0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBzaGFyZWQgdmFsdWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmludGVyc2VjdGlvbihbMSwgMiwgM10sIFs1LCAyLCAxLCA0XSwgWzIsIDFdKTtcbiAgICAgKiAvLyA9PiBbMSwgMl1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpbnRlcnNlY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IFtdLFxuICAgICAgICAgIGFyZ3NJbmRleCA9IC0xLFxuICAgICAgICAgIGFyZ3NMZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLFxuICAgICAgICAgIGNhY2hlcyA9IGdldEFycmF5KCksXG4gICAgICAgICAgaW5kZXhPZiA9IGdldEluZGV4T2YoKSxcbiAgICAgICAgICB0cnVzdEluZGV4T2YgPSBpbmRleE9mID09PSBiYXNlSW5kZXhPZixcbiAgICAgICAgICBzZWVuID0gZ2V0QXJyYXkoKTtcblxuICAgICAgd2hpbGUgKCsrYXJnc0luZGV4IDwgYXJnc0xlbmd0aCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBhcmd1bWVudHNbYXJnc0luZGV4XTtcbiAgICAgICAgaWYgKGlzQXJyYXkodmFsdWUpIHx8IGlzQXJndW1lbnRzKHZhbHVlKSkge1xuICAgICAgICAgIGFyZ3MucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgY2FjaGVzLnB1c2godHJ1c3RJbmRleE9mICYmIHZhbHVlLmxlbmd0aCA+PSBsYXJnZUFycmF5U2l6ZSAmJlxuICAgICAgICAgICAgY3JlYXRlQ2FjaGUoYXJnc0luZGV4ID8gYXJnc1thcmdzSW5kZXhdIDogc2VlbikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgYXJyYXkgPSBhcmdzWzBdLFxuICAgICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwLFxuICAgICAgICAgIHJlc3VsdCA9IFtdO1xuXG4gICAgICBvdXRlcjpcbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciBjYWNoZSA9IGNhY2hlc1swXTtcbiAgICAgICAgdmFsdWUgPSBhcnJheVtpbmRleF07XG5cbiAgICAgICAgaWYgKChjYWNoZSA/IGNhY2hlSW5kZXhPZihjYWNoZSwgdmFsdWUpIDogaW5kZXhPZihzZWVuLCB2YWx1ZSkpIDwgMCkge1xuICAgICAgICAgIGFyZ3NJbmRleCA9IGFyZ3NMZW5ndGg7XG4gICAgICAgICAgKGNhY2hlIHx8IHNlZW4pLnB1c2godmFsdWUpO1xuICAgICAgICAgIHdoaWxlICgtLWFyZ3NJbmRleCkge1xuICAgICAgICAgICAgY2FjaGUgPSBjYWNoZXNbYXJnc0luZGV4XTtcbiAgICAgICAgICAgIGlmICgoY2FjaGUgPyBjYWNoZUluZGV4T2YoY2FjaGUsIHZhbHVlKSA6IGluZGV4T2YoYXJnc1thcmdzSW5kZXhdLCB2YWx1ZSkpIDwgMCkge1xuICAgICAgICAgICAgICBjb250aW51ZSBvdXRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB3aGlsZSAoYXJnc0xlbmd0aC0tKSB7XG4gICAgICAgIGNhY2hlID0gY2FjaGVzW2FyZ3NMZW5ndGhdO1xuICAgICAgICBpZiAoY2FjaGUpIHtcbiAgICAgICAgICByZWxlYXNlT2JqZWN0KGNhY2hlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVsZWFzZUFycmF5KGNhY2hlcyk7XG4gICAgICByZWxlYXNlQXJyYXkoc2Vlbik7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGxhc3QgZWxlbWVudCBvciBsYXN0IGBuYCBlbGVtZW50cyBvZiBhbiBhcnJheS4gSWYgYSBjYWxsYmFjayBpc1xuICAgICAqIHByb3ZpZGVkIGVsZW1lbnRzIGF0IHRoZSBlbmQgb2YgdGhlIGFycmF5IGFyZSByZXR1cm5lZCBhcyBsb25nIGFzIHRoZVxuICAgICAqIGNhbGxiYWNrIHJldHVybnMgdHJ1ZXkuIFRoZSBjYWxsYmFjayBpcyBib3VuZCB0byBgdGhpc0FyZ2AgYW5kIGludm9rZWRcbiAgICAgKiB3aXRoIHRocmVlIGFyZ3VtZW50czsgKHZhbHVlLCBpbmRleCwgYXJyYXkpLlxuICAgICAqXG4gICAgICogSWYgYSBwcm9wZXJ0eSBuYW1lIGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy5wbHVja1wiIHN0eWxlXG4gICAgICogY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogSWYgYW4gb2JqZWN0IGlzIHByb3ZpZGVkIGZvciBgY2FsbGJhY2tgIHRoZSBjcmVhdGVkIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrXG4gICAgICogd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHByb3BlcnRpZXMgb2YgdGhlIGdpdmVuIG9iamVjdCxcbiAgICAgKiBlbHNlIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHF1ZXJ5LlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fG51bWJlcnxzdHJpbmd9IFtjYWxsYmFja10gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgZWxlbWVudCBvciB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIHRvIHJldHVybi4gSWYgYSBwcm9wZXJ0eSBuYW1lIG9yXG4gICAgICogIG9iamVjdCBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIHVzZWQgdG8gY3JlYXRlIGEgXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCJcbiAgICAgKiAgc3R5bGUgY2FsbGJhY2ssIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgbGFzdCBlbGVtZW50KHMpIG9mIGBhcnJheWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ubGFzdChbMSwgMiwgM10pO1xuICAgICAqIC8vID0+IDNcbiAgICAgKlxuICAgICAqIF8ubGFzdChbMSwgMiwgM10sIDIpO1xuICAgICAqIC8vID0+IFsyLCAzXVxuICAgICAqXG4gICAgICogXy5sYXN0KFsxLCAyLCAzXSwgZnVuY3Rpb24obnVtKSB7XG4gICAgICogICByZXR1cm4gbnVtID4gMTtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiBbMiwgM11cbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAgJ2Jsb2NrZWQnOiBmYWxzZSwgJ2VtcGxveWVyJzogJ3NsYXRlJyB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAgJ2Jsb2NrZWQnOiB0cnVlLCAgJ2VtcGxveWVyJzogJ3NsYXRlJyB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdwZWJibGVzJywgJ2Jsb2NrZWQnOiB0cnVlLCAgJ2VtcGxveWVyJzogJ25hJyB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8ucGx1Y2soXy5sYXN0KGNoYXJhY3RlcnMsICdibG9ja2VkJyksICduYW1lJyk7XG4gICAgICogLy8gPT4gWydmcmVkJywgJ3BlYmJsZXMnXVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLndoZXJlXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy5sYXN0KGNoYXJhY3RlcnMsIHsgJ2VtcGxveWVyJzogJ25hJyB9KTtcbiAgICAgKiAvLyA9PiBbeyAnbmFtZSc6ICdwZWJibGVzJywgJ2Jsb2NrZWQnOiB0cnVlLCAnZW1wbG95ZXInOiAnbmEnIH1dXG4gICAgICovXG4gICAgZnVuY3Rpb24gbGFzdChhcnJheSwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciBuID0gMCxcbiAgICAgICAgICBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDA7XG5cbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT0gJ251bWJlcicgJiYgY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICB2YXIgaW5kZXggPSBsZW5ndGg7XG4gICAgICAgIGNhbGxiYWNrID0gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICAgICAgd2hpbGUgKGluZGV4LS0gJiYgY2FsbGJhY2soYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICAgICAgbisrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuID0gY2FsbGJhY2s7XG4gICAgICAgIGlmIChuID09IG51bGwgfHwgdGhpc0FyZykge1xuICAgICAgICAgIHJldHVybiBhcnJheSA/IGFycmF5W2xlbmd0aCAtIDFdIDogdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gc2xpY2UoYXJyYXksIG5hdGl2ZU1heCgwLCBsZW5ndGggLSBuKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgaW5kZXggYXQgd2hpY2ggdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiBgdmFsdWVgIGlzIGZvdW5kIHVzaW5nIHN0cmljdFxuICAgICAqIGVxdWFsaXR5IGZvciBjb21wYXJpc29ucywgaS5lLiBgPT09YC4gSWYgYGZyb21JbmRleGAgaXMgbmVnYXRpdmUsIGl0IGlzIHVzZWRcbiAgICAgKiBhcyB0aGUgb2Zmc2V0IGZyb20gdGhlIGVuZCBvZiB0aGUgY29sbGVjdGlvbi5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBzZWFyY2guXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2VhcmNoIGZvci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2Zyb21JbmRleD1hcnJheS5sZW5ndGgtMV0gVGhlIGluZGV4IHRvIHNlYXJjaCBmcm9tLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlIG9yIGAtMWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ubGFzdEluZGV4T2YoWzEsIDIsIDMsIDEsIDIsIDNdLCAyKTtcbiAgICAgKiAvLyA9PiA0XG4gICAgICpcbiAgICAgKiBfLmxhc3RJbmRleE9mKFsxLCAyLCAzLCAxLCAyLCAzXSwgMiwgMyk7XG4gICAgICogLy8gPT4gMVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGxhc3RJbmRleE9mKGFycmF5LCB2YWx1ZSwgZnJvbUluZGV4KSB7XG4gICAgICB2YXIgaW5kZXggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDA7XG4gICAgICBpZiAodHlwZW9mIGZyb21JbmRleCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpbmRleCA9IChmcm9tSW5kZXggPCAwID8gbmF0aXZlTWF4KDAsIGluZGV4ICsgZnJvbUluZGV4KSA6IG5hdGl2ZU1pbihmcm9tSW5kZXgsIGluZGV4IC0gMSkpICsgMTtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChpbmRleC0tKSB7XG4gICAgICAgIGlmIChhcnJheVtpbmRleF0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgcHJvdmlkZWQgdmFsdWVzIGZyb20gdGhlIGdpdmVuIGFycmF5IHVzaW5nIHN0cmljdCBlcXVhbGl0eSBmb3JcbiAgICAgKiBjb21wYXJpc29ucywgaS5lLiBgPT09YC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gbW9kaWZ5LlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW3ZhbHVlXSBUaGUgdmFsdWVzIHRvIHJlbW92ZS5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYGFycmF5YC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGFycmF5ID0gWzEsIDIsIDMsIDEsIDIsIDNdO1xuICAgICAqIF8ucHVsbChhcnJheSwgMiwgMyk7XG4gICAgICogY29uc29sZS5sb2coYXJyYXkpO1xuICAgICAqIC8vID0+IFsxLCAxXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHB1bGwoYXJyYXkpIHtcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgIGFyZ3NJbmRleCA9IDAsXG4gICAgICAgICAgYXJnc0xlbmd0aCA9IGFyZ3MubGVuZ3RoLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcblxuICAgICAgd2hpbGUgKCsrYXJnc0luZGV4IDwgYXJnc0xlbmd0aCkge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIHZhbHVlID0gYXJnc1thcmdzSW5kZXhdO1xuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIGlmIChhcnJheVtpbmRleF0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICBzcGxpY2UuY2FsbChhcnJheSwgaW5kZXgtLSwgMSk7XG4gICAgICAgICAgICBsZW5ndGgtLTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFycmF5IG9mIG51bWJlcnMgKHBvc2l0aXZlIGFuZC9vciBuZWdhdGl2ZSkgcHJvZ3Jlc3NpbmcgZnJvbVxuICAgICAqIGBzdGFydGAgdXAgdG8gYnV0IG5vdCBpbmNsdWRpbmcgYGVuZGAuIElmIGBzdGFydGAgaXMgbGVzcyB0aGFuIGBzdG9wYCBhXG4gICAgICogemVyby1sZW5ndGggcmFuZ2UgaXMgY3JlYXRlZCB1bmxlc3MgYSBuZWdhdGl2ZSBgc3RlcGAgaXMgc3BlY2lmaWVkLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9MF0gVGhlIHN0YXJ0IG9mIHRoZSByYW5nZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZW5kIFRoZSBlbmQgb2YgdGhlIHJhbmdlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbc3RlcD0xXSBUaGUgdmFsdWUgdG8gaW5jcmVtZW50IG9yIGRlY3JlbWVudCBieS5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYSBuZXcgcmFuZ2UgYXJyYXkuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ucmFuZ2UoNCk7XG4gICAgICogLy8gPT4gWzAsIDEsIDIsIDNdXG4gICAgICpcbiAgICAgKiBfLnJhbmdlKDEsIDUpO1xuICAgICAqIC8vID0+IFsxLCAyLCAzLCA0XVxuICAgICAqXG4gICAgICogXy5yYW5nZSgwLCAyMCwgNSk7XG4gICAgICogLy8gPT4gWzAsIDUsIDEwLCAxNV1cbiAgICAgKlxuICAgICAqIF8ucmFuZ2UoMCwgLTQsIC0xKTtcbiAgICAgKiAvLyA9PiBbMCwgLTEsIC0yLCAtM11cbiAgICAgKlxuICAgICAqIF8ucmFuZ2UoMSwgNCwgMCk7XG4gICAgICogLy8gPT4gWzEsIDEsIDFdXG4gICAgICpcbiAgICAgKiBfLnJhbmdlKDApO1xuICAgICAqIC8vID0+IFtdXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmFuZ2Uoc3RhcnQsIGVuZCwgc3RlcCkge1xuICAgICAgc3RhcnQgPSArc3RhcnQgfHwgMDtcbiAgICAgIHN0ZXAgPSB0eXBlb2Ygc3RlcCA9PSAnbnVtYmVyJyA/IHN0ZXAgOiAoK3N0ZXAgfHwgMSk7XG5cbiAgICAgIGlmIChlbmQgPT0gbnVsbCkge1xuICAgICAgICBlbmQgPSBzdGFydDtcbiAgICAgICAgc3RhcnQgPSAwO1xuICAgICAgfVxuICAgICAgLy8gdXNlIGBBcnJheShsZW5ndGgpYCBzbyBlbmdpbmVzIGxpa2UgQ2hha3JhIGFuZCBWOCBhdm9pZCBzbG93ZXIgbW9kZXNcbiAgICAgIC8vIGh0dHA6Ly95b3V0dS5iZS9YQXFJcEdVOFpaayN0PTE3bTI1c1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gbmF0aXZlTWF4KDAsIGNlaWwoKGVuZCAtIHN0YXJ0KSAvIChzdGVwIHx8IDEpKSksXG4gICAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IHN0YXJ0O1xuICAgICAgICBzdGFydCArPSBzdGVwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBlbGVtZW50cyBmcm9tIGFuIGFycmF5IHRoYXQgdGhlIGNhbGxiYWNrIHJldHVybnMgdHJ1ZXkgZm9yXG4gICAgICogYW5kIHJldHVybnMgYW4gYXJyYXkgb2YgcmVtb3ZlZCBlbGVtZW50cy4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYFxuICAgICAqIGFuZCBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOyAodmFsdWUsIGluZGV4LCBhcnJheSkuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gbW9kaWZ5LlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgbmV3IGFycmF5IG9mIHJlbW92ZWQgZWxlbWVudHMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBhcnJheSA9IFsxLCAyLCAzLCA0LCA1LCA2XTtcbiAgICAgKiB2YXIgZXZlbnMgPSBfLnJlbW92ZShhcnJheSwgZnVuY3Rpb24obnVtKSB7IHJldHVybiBudW0gJSAyID09IDA7IH0pO1xuICAgICAqXG4gICAgICogY29uc29sZS5sb2coYXJyYXkpO1xuICAgICAqIC8vID0+IFsxLCAzLCA1XVxuICAgICAqXG4gICAgICogY29uc29sZS5sb2coZXZlbnMpO1xuICAgICAqIC8vID0+IFsyLCA0LCA2XVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlbW92ZShhcnJheSwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMCxcbiAgICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgICAgY2FsbGJhY2sgPSBsb2Rhc2guY3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuICAgICAgICBpZiAoY2FsbGJhY2sodmFsdWUsIGluZGV4LCBhcnJheSkpIHtcbiAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgc3BsaWNlLmNhbGwoYXJyYXksIGluZGV4LS0sIDEpO1xuICAgICAgICAgIGxlbmd0aC0tO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBvcHBvc2l0ZSBvZiBgXy5pbml0aWFsYCB0aGlzIG1ldGhvZCBnZXRzIGFsbCBidXQgdGhlIGZpcnN0IGVsZW1lbnQgb3JcbiAgICAgKiBmaXJzdCBgbmAgZWxlbWVudHMgb2YgYW4gYXJyYXkuIElmIGEgY2FsbGJhY2sgZnVuY3Rpb24gaXMgcHJvdmlkZWQgZWxlbWVudHNcbiAgICAgKiBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheSBhcmUgZXhjbHVkZWQgZnJvbSB0aGUgcmVzdWx0IGFzIGxvbmcgYXMgdGhlXG4gICAgICogY2FsbGJhY2sgcmV0dXJucyB0cnVleS4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZFxuICAgICAqIHdpdGggdGhyZWUgYXJndW1lbnRzOyAodmFsdWUsIGluZGV4LCBhcnJheSkuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyBkcm9wLCB0YWlsXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBxdWVyeS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdHxudW1iZXJ8c3RyaW5nfSBbY2FsbGJhY2s9MV0gVGhlIGZ1bmN0aW9uIGNhbGxlZFxuICAgICAqICBwZXIgZWxlbWVudCBvciB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIHRvIGV4Y2x1ZGUuIElmIGEgcHJvcGVydHkgbmFtZSBvclxuICAgICAqICBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiXG4gICAgICogIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgc2xpY2Ugb2YgYGFycmF5YC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5yZXN0KFsxLCAyLCAzXSk7XG4gICAgICogLy8gPT4gWzIsIDNdXG4gICAgICpcbiAgICAgKiBfLnJlc3QoWzEsIDIsIDNdLCAyKTtcbiAgICAgKiAvLyA9PiBbM11cbiAgICAgKlxuICAgICAqIF8ucmVzdChbMSwgMiwgM10sIGZ1bmN0aW9uKG51bSkge1xuICAgICAqICAgcmV0dXJuIG51bSA8IDM7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gWzNdXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgICdibG9ja2VkJzogdHJ1ZSwgICdlbXBsb3llcic6ICdzbGF0ZScgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgICdibG9ja2VkJzogZmFsc2UsICAnZW1wbG95ZXInOiAnc2xhdGUnIH0sXG4gICAgICogICB7ICduYW1lJzogJ3BlYmJsZXMnLCAnYmxvY2tlZCc6IHRydWUsICdlbXBsb3llcic6ICduYScgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyBcIl8ucGx1Y2tcIiBjYWxsYmFjayBzaG9ydGhhbmRcbiAgICAgKiBfLnBsdWNrKF8ucmVzdChjaGFyYWN0ZXJzLCAnYmxvY2tlZCcpLCAnbmFtZScpO1xuICAgICAqIC8vID0+IFsnZnJlZCcsICdwZWJibGVzJ11cbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy53aGVyZVwiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8ucmVzdChjaGFyYWN0ZXJzLCB7ICdlbXBsb3llcic6ICdzbGF0ZScgfSk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAncGViYmxlcycsICdibG9ja2VkJzogdHJ1ZSwgJ2VtcGxveWVyJzogJ25hJyB9XVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlc3QoYXJyYXksIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9ICdudW1iZXInICYmIGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgICAgdmFyIG4gPSAwLFxuICAgICAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcblxuICAgICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoICYmIGNhbGxiYWNrKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSkge1xuICAgICAgICAgIG4rKztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbiA9IChjYWxsYmFjayA9PSBudWxsIHx8IHRoaXNBcmcpID8gMSA6IG5hdGl2ZU1heCgwLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2xpY2UoYXJyYXksIG4pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVzZXMgYSBiaW5hcnkgc2VhcmNoIHRvIGRldGVybWluZSB0aGUgc21hbGxlc3QgaW5kZXggYXQgd2hpY2ggYSB2YWx1ZVxuICAgICAqIHNob3VsZCBiZSBpbnNlcnRlZCBpbnRvIGEgZ2l2ZW4gc29ydGVkIGFycmF5IGluIG9yZGVyIHRvIG1haW50YWluIHRoZSBzb3J0XG4gICAgICogb3JkZXIgb2YgdGhlIGFycmF5LiBJZiBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgZXhlY3V0ZWQgZm9yXG4gICAgICogYHZhbHVlYCBhbmQgZWFjaCBlbGVtZW50IG9mIGBhcnJheWAgdG8gY29tcHV0ZSB0aGVpciBzb3J0IHJhbmtpbmcuIFRoZVxuICAgICAqIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIG9uZSBhcmd1bWVudDsgKHZhbHVlKS5cbiAgICAgKlxuICAgICAqIElmIGEgcHJvcGVydHkgbmFtZSBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ucGx1Y2tcIiBzdHlsZVxuICAgICAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIElmIGFuIG9iamVjdCBpcyBwcm92aWRlZCBmb3IgYGNhbGxiYWNrYCB0aGUgY3JlYXRlZCBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFja1xuICAgICAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gICAgICogZWxzZSBgZmFsc2VgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpbnNwZWN0LlxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGV2YWx1YXRlLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggYXQgd2hpY2ggYHZhbHVlYCBzaG91bGQgYmUgaW5zZXJ0ZWRcbiAgICAgKiAgaW50byBgYXJyYXlgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnNvcnRlZEluZGV4KFsyMCwgMzAsIDUwXSwgNDApO1xuICAgICAqIC8vID0+IDJcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICAgICAqIF8uc29ydGVkSW5kZXgoW3sgJ3gnOiAyMCB9LCB7ICd4JzogMzAgfSwgeyAneCc6IDUwIH1dLCB7ICd4JzogNDAgfSwgJ3gnKTtcbiAgICAgKiAvLyA9PiAyXG4gICAgICpcbiAgICAgKiB2YXIgZGljdCA9IHtcbiAgICAgKiAgICd3b3JkVG9OdW1iZXInOiB7ICd0d2VudHknOiAyMCwgJ3RoaXJ0eSc6IDMwLCAnZm91cnR5JzogNDAsICdmaWZ0eSc6IDUwIH1cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy5zb3J0ZWRJbmRleChbJ3R3ZW50eScsICd0aGlydHknLCAnZmlmdHknXSwgJ2ZvdXJ0eScsIGZ1bmN0aW9uKHdvcmQpIHtcbiAgICAgKiAgIHJldHVybiBkaWN0LndvcmRUb051bWJlclt3b3JkXTtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiAyXG4gICAgICpcbiAgICAgKiBfLnNvcnRlZEluZGV4KFsndHdlbnR5JywgJ3RoaXJ0eScsICdmaWZ0eSddLCAnZm91cnR5JywgZnVuY3Rpb24od29yZCkge1xuICAgICAqICAgcmV0dXJuIHRoaXMud29yZFRvTnVtYmVyW3dvcmRdO1xuICAgICAqIH0sIGRpY3QpO1xuICAgICAqIC8vID0+IDJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzb3J0ZWRJbmRleChhcnJheSwgdmFsdWUsIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICB2YXIgbG93ID0gMCxcbiAgICAgICAgICBoaWdoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiBsb3c7XG5cbiAgICAgIC8vIGV4cGxpY2l0bHkgcmVmZXJlbmNlIGBpZGVudGl0eWAgZm9yIGJldHRlciBpbmxpbmluZyBpbiBGaXJlZm94XG4gICAgICBjYWxsYmFjayA9IGNhbGxiYWNrID8gbG9kYXNoLmNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAxKSA6IGlkZW50aXR5O1xuICAgICAgdmFsdWUgPSBjYWxsYmFjayh2YWx1ZSk7XG5cbiAgICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgICAgIHZhciBtaWQgPSAobG93ICsgaGlnaCkgPj4+IDE7XG4gICAgICAgIChjYWxsYmFjayhhcnJheVttaWRdKSA8IHZhbHVlKVxuICAgICAgICAgID8gbG93ID0gbWlkICsgMVxuICAgICAgICAgIDogaGlnaCA9IG1pZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsb3c7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSBvZiB1bmlxdWUgdmFsdWVzLCBpbiBvcmRlciwgb2YgdGhlIHByb3ZpZGVkIGFycmF5cyB1c2luZ1xuICAgICAqIHN0cmljdCBlcXVhbGl0eSBmb3IgY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHsuLi5BcnJheX0gW2FycmF5XSBUaGUgYXJyYXlzIHRvIGluc3BlY3QuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGFuIGFycmF5IG9mIGNvbWJpbmVkIHZhbHVlcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy51bmlvbihbMSwgMiwgM10sIFs1LCAyLCAxLCA0XSwgWzIsIDFdKTtcbiAgICAgKiAvLyA9PiBbMSwgMiwgMywgNSwgNF1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1bmlvbigpIHtcbiAgICAgIHJldHVybiBiYXNlVW5pcShiYXNlRmxhdHRlbihhcmd1bWVudHMsIHRydWUsIHRydWUpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZHVwbGljYXRlLXZhbHVlLWZyZWUgdmVyc2lvbiBvZiBhbiBhcnJheSB1c2luZyBzdHJpY3QgZXF1YWxpdHlcbiAgICAgKiBmb3IgY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuIElmIHRoZSBhcnJheSBpcyBzb3J0ZWQsIHByb3ZpZGluZ1xuICAgICAqIGB0cnVlYCBmb3IgYGlzU29ydGVkYCB3aWxsIHVzZSBhIGZhc3RlciBhbGdvcml0aG0uIElmIGEgY2FsbGJhY2sgaXMgcHJvdmlkZWRcbiAgICAgKiBlYWNoIGVsZW1lbnQgb2YgYGFycmF5YCBpcyBwYXNzZWQgdGhyb3VnaCB0aGUgY2FsbGJhY2sgYmVmb3JlIHVuaXF1ZW5lc3NcbiAgICAgKiBpcyBjb21wdXRlZC4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlXG4gICAgICogYXJndW1lbnRzOyAodmFsdWUsIGluZGV4LCBhcnJheSkuXG4gICAgICpcbiAgICAgKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAgICAgKiBjYWxsYmFjayB3aWxsIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWUgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAgICAgKiB3aWxsIHJldHVybiBgdHJ1ZWAgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LFxuICAgICAqIGVsc2UgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyB1bmlxdWVcbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHByb2Nlc3MuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaXNTb3J0ZWQ9ZmFsc2VdIEEgZmxhZyB0byBpbmRpY2F0ZSB0aGF0IGBhcnJheWAgaXMgc29ydGVkLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fHN0cmluZ30gW2NhbGxiYWNrPWlkZW50aXR5XSBUaGUgZnVuY3Rpb24gY2FsbGVkXG4gICAgICogIHBlciBpdGVyYXRpb24uIElmIGEgcHJvcGVydHkgbmFtZSBvciBvYmplY3QgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSB1c2VkXG4gICAgICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGEgZHVwbGljYXRlLXZhbHVlLWZyZWUgYXJyYXkuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8udW5pcShbMSwgMiwgMSwgMywgMV0pO1xuICAgICAqIC8vID0+IFsxLCAyLCAzXVxuICAgICAqXG4gICAgICogXy51bmlxKFsxLCAxLCAyLCAyLCAzXSwgdHJ1ZSk7XG4gICAgICogLy8gPT4gWzEsIDIsIDNdXG4gICAgICpcbiAgICAgKiBfLnVuaXEoWydBJywgJ2InLCAnQycsICdhJywgJ0InLCAnYyddLCBmdW5jdGlvbihsZXR0ZXIpIHsgcmV0dXJuIGxldHRlci50b0xvd2VyQ2FzZSgpOyB9KTtcbiAgICAgKiAvLyA9PiBbJ0EnLCAnYicsICdDJ11cbiAgICAgKlxuICAgICAqIF8udW5pcShbMSwgMi41LCAzLCAxLjUsIDIsIDMuNV0sIGZ1bmN0aW9uKG51bSkgeyByZXR1cm4gdGhpcy5mbG9vcihudW0pOyB9LCBNYXRoKTtcbiAgICAgKiAvLyA9PiBbMSwgMi41LCAzXVxuICAgICAqXG4gICAgICogLy8gdXNpbmcgXCJfLnBsdWNrXCIgY2FsbGJhY2sgc2hvcnRoYW5kXG4gICAgICogXy51bmlxKFt7ICd4JzogMSB9LCB7ICd4JzogMiB9LCB7ICd4JzogMSB9XSwgJ3gnKTtcbiAgICAgKiAvLyA9PiBbeyAneCc6IDEgfSwgeyAneCc6IDIgfV1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1bmlxKGFycmF5LCBpc1NvcnRlZCwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIC8vIGp1Z2dsZSBhcmd1bWVudHNcbiAgICAgIGlmICh0eXBlb2YgaXNTb3J0ZWQgIT0gJ2Jvb2xlYW4nICYmIGlzU29ydGVkICE9IG51bGwpIHtcbiAgICAgICAgdGhpc0FyZyA9IGNhbGxiYWNrO1xuICAgICAgICBjYWxsYmFjayA9ICh0eXBlb2YgaXNTb3J0ZWQgIT0gJ2Z1bmN0aW9uJyAmJiB0aGlzQXJnICYmIHRoaXNBcmdbaXNTb3J0ZWRdID09PSBhcnJheSkgPyBudWxsIDogaXNTb3J0ZWQ7XG4gICAgICAgIGlzU29ydGVkID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICBjYWxsYmFjayA9IGxvZGFzaC5jcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZVVuaXEoYXJyYXksIGlzU29ydGVkLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSBleGNsdWRpbmcgYWxsIHByb3ZpZGVkIHZhbHVlcyB1c2luZyBzdHJpY3QgZXF1YWxpdHkgZm9yXG4gICAgICogY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQXJyYXlzXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGZpbHRlci5cbiAgICAgKiBAcGFyYW0gey4uLip9IFt2YWx1ZV0gVGhlIHZhbHVlcyB0byBleGNsdWRlLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBhcnJheSBvZiBmaWx0ZXJlZCB2YWx1ZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ud2l0aG91dChbMSwgMiwgMSwgMCwgMywgMSwgNF0sIDAsIDEpO1xuICAgICAqIC8vID0+IFsyLCAzLCA0XVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHdpdGhvdXQoYXJyYXkpIHtcbiAgICAgIHJldHVybiBiYXNlRGlmZmVyZW5jZShhcnJheSwgc2xpY2UoYXJndW1lbnRzLCAxKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBhcnJheSB0aGF0IGlzIHRoZSBzeW1tZXRyaWMgZGlmZmVyZW5jZSBvZiB0aGUgcHJvdmlkZWQgYXJyYXlzLlxuICAgICAqIFNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1N5bW1ldHJpY19kaWZmZXJlbmNlLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEFycmF5c1xuICAgICAqIEBwYXJhbSB7Li4uQXJyYXl9IFthcnJheV0gVGhlIGFycmF5cyB0byBpbnNwZWN0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiB2YWx1ZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8ueG9yKFsxLCAyLCAzXSwgWzUsIDIsIDEsIDRdKTtcbiAgICAgKiAvLyA9PiBbMywgNSwgNF1cbiAgICAgKlxuICAgICAqIF8ueG9yKFsxLCAyLCA1XSwgWzIsIDMsIDVdLCBbMywgNCwgNV0pO1xuICAgICAqIC8vID0+IFsxLCA0LCA1XVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHhvcigpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciBhcnJheSA9IGFyZ3VtZW50c1tpbmRleF07XG4gICAgICAgIGlmIChpc0FycmF5KGFycmF5KSB8fCBpc0FyZ3VtZW50cyhhcnJheSkpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gcmVzdWx0XG4gICAgICAgICAgICA/IGJhc2VVbmlxKGJhc2VEaWZmZXJlbmNlKHJlc3VsdCwgYXJyYXkpLmNvbmNhdChiYXNlRGlmZmVyZW5jZShhcnJheSwgcmVzdWx0KSkpXG4gICAgICAgICAgICA6IGFycmF5O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0IHx8IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgZ3JvdXBlZCBlbGVtZW50cywgdGhlIGZpcnN0IG9mIHdoaWNoIGNvbnRhaW5zIHRoZSBmaXJzdFxuICAgICAqIGVsZW1lbnRzIG9mIHRoZSBnaXZlbiBhcnJheXMsIHRoZSBzZWNvbmQgb2Ygd2hpY2ggY29udGFpbnMgdGhlIHNlY29uZFxuICAgICAqIGVsZW1lbnRzIG9mIHRoZSBnaXZlbiBhcnJheXMsIGFuZCBzbyBvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyB1bnppcFxuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0gey4uLkFycmF5fSBbYXJyYXldIEFycmF5cyB0byBwcm9jZXNzLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhIG5ldyBhcnJheSBvZiBncm91cGVkIGVsZW1lbnRzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnppcChbJ2ZyZWQnLCAnYmFybmV5J10sIFszMCwgNDBdLCBbdHJ1ZSwgZmFsc2VdKTtcbiAgICAgKiAvLyA9PiBbWydmcmVkJywgMzAsIHRydWVdLCBbJ2Jhcm5leScsIDQwLCBmYWxzZV1dXG4gICAgICovXG4gICAgZnVuY3Rpb24gemlwKCkge1xuICAgICAgdmFyIGFycmF5ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHMgOiBhcmd1bWVudHNbMF0sXG4gICAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBhcnJheSA/IG1heChwbHVjayhhcnJheSwgJ2xlbmd0aCcpKSA6IDAsXG4gICAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGgpO1xuXG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gcGx1Y2soYXJyYXksIGluZGV4KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBvYmplY3QgY29tcG9zZWQgZnJvbSBhcnJheXMgb2YgYGtleXNgIGFuZCBgdmFsdWVzYC4gUHJvdmlkZVxuICAgICAqIGVpdGhlciBhIHNpbmdsZSB0d28gZGltZW5zaW9uYWwgYXJyYXksIGkuZS4gYFtba2V5MSwgdmFsdWUxXSwgW2tleTIsIHZhbHVlMl1dYFxuICAgICAqIG9yIHR3byBhcnJheXMsIG9uZSBvZiBga2V5c2AgYW5kIG9uZSBvZiBjb3JyZXNwb25kaW5nIGB2YWx1ZXNgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGFsaWFzIG9iamVjdFxuICAgICAqIEBjYXRlZ29yeSBBcnJheXNcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBrZXlzIFRoZSBhcnJheSBvZiBrZXlzLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFt2YWx1ZXM9W11dIFRoZSBhcnJheSBvZiB2YWx1ZXMuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBhbiBvYmplY3QgY29tcG9zZWQgb2YgdGhlIGdpdmVuIGtleXMgYW5kXG4gICAgICogIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnppcE9iamVjdChbJ2ZyZWQnLCAnYmFybmV5J10sIFszMCwgNDBdKTtcbiAgICAgKiAvLyA9PiB7ICdmcmVkJzogMzAsICdiYXJuZXknOiA0MCB9XG4gICAgICovXG4gICAgZnVuY3Rpb24gemlwT2JqZWN0KGtleXMsIHZhbHVlcykge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0ga2V5cyA/IGtleXMubGVuZ3RoIDogMCxcbiAgICAgICAgICByZXN1bHQgPSB7fTtcblxuICAgICAgaWYgKCF2YWx1ZXMgJiYgbGVuZ3RoICYmICFpc0FycmF5KGtleXNbMF0pKSB7XG4gICAgICAgIHZhbHVlcyA9IFtdO1xuICAgICAgfVxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaW5kZXhdO1xuICAgICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZXNbaW5kZXhdO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSkge1xuICAgICAgICAgIHJlc3VsdFtrZXlbMF1dID0ga2V5WzFdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgZXhlY3V0ZXMgYGZ1bmNgLCB3aXRoICB0aGUgYHRoaXNgIGJpbmRpbmcgYW5kXG4gICAgICogYXJndW1lbnRzIG9mIHRoZSBjcmVhdGVkIGZ1bmN0aW9uLCBvbmx5IGFmdGVyIGJlaW5nIGNhbGxlZCBgbmAgdGltZXMuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0aGUgZnVuY3Rpb24gbXVzdCBiZSBjYWxsZWQgYmVmb3JlXG4gICAgICogIGBmdW5jYCBpcyBleGVjdXRlZC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byByZXN0cmljdC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyByZXN0cmljdGVkIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgc2F2ZXMgPSBbJ3Byb2ZpbGUnLCAnc2V0dGluZ3MnXTtcbiAgICAgKlxuICAgICAqIHZhciBkb25lID0gXy5hZnRlcihzYXZlcy5sZW5ndGgsIGZ1bmN0aW9uKCkge1xuICAgICAqICAgY29uc29sZS5sb2coJ0RvbmUgc2F2aW5nIScpO1xuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogXy5mb3JFYWNoKHNhdmVzLCBmdW5jdGlvbih0eXBlKSB7XG4gICAgICogICBhc3luY1NhdmUoeyAndHlwZSc6IHR5cGUsICdjb21wbGV0ZSc6IGRvbmUgfSk7XG4gICAgICogfSk7XG4gICAgICogLy8gPT4gbG9ncyAnRG9uZSBzYXZpbmchJywgYWZ0ZXIgYWxsIHNhdmVzIGhhdmUgY29tcGxldGVkXG4gICAgICovXG4gICAgZnVuY3Rpb24gYWZ0ZXIobiwgZnVuYykge1xuICAgICAgaWYgKCFpc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICgtLW4gPCAxKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIGludm9rZXMgYGZ1bmNgIHdpdGggdGhlIGB0aGlzYFxuICAgICAqIGJpbmRpbmcgb2YgYHRoaXNBcmdgIGFuZCBwcmVwZW5kcyBhbnkgYWRkaXRpb25hbCBgYmluZGAgYXJndW1lbnRzIHRvIHRob3NlXG4gICAgICogcHJvdmlkZWQgdG8gdGhlIGJvdW5kIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGJpbmQuXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBmdW5jYC5cbiAgICAgKiBAcGFyYW0gey4uLip9IFthcmddIEFyZ3VtZW50cyB0byBiZSBwYXJ0aWFsbHkgYXBwbGllZC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBib3VuZCBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGZ1bmMgPSBmdW5jdGlvbihncmVldGluZykge1xuICAgICAqICAgcmV0dXJuIGdyZWV0aW5nICsgJyAnICsgdGhpcy5uYW1lO1xuICAgICAqIH07XG4gICAgICpcbiAgICAgKiBmdW5jID0gXy5iaW5kKGZ1bmMsIHsgJ25hbWUnOiAnZnJlZCcgfSwgJ2hpJyk7XG4gICAgICogZnVuYygpO1xuICAgICAqIC8vID0+ICdoaSBmcmVkJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJpbmQoZnVuYywgdGhpc0FyZykge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPiAyXG4gICAgICAgID8gY3JlYXRlV3JhcHBlcihmdW5jLCAxNywgc2xpY2UoYXJndW1lbnRzLCAyKSwgbnVsbCwgdGhpc0FyZylcbiAgICAgICAgOiBjcmVhdGVXcmFwcGVyKGZ1bmMsIDEsIG51bGwsIG51bGwsIHRoaXNBcmcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmRzIG1ldGhvZHMgb2YgYW4gb2JqZWN0IHRvIHRoZSBvYmplY3QgaXRzZWxmLCBvdmVyd3JpdGluZyB0aGUgZXhpc3RpbmdcbiAgICAgKiBtZXRob2QuIE1ldGhvZCBuYW1lcyBtYXkgYmUgc3BlY2lmaWVkIGFzIGluZGl2aWR1YWwgYXJndW1lbnRzIG9yIGFzIGFycmF5c1xuICAgICAqIG9mIG1ldGhvZCBuYW1lcy4gSWYgbm8gbWV0aG9kIG5hbWVzIGFyZSBwcm92aWRlZCBhbGwgdGhlIGZ1bmN0aW9uIHByb3BlcnRpZXNcbiAgICAgKiBvZiBgb2JqZWN0YCB3aWxsIGJlIGJvdW5kLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBiaW5kIGFuZCBhc3NpZ24gdGhlIGJvdW5kIG1ldGhvZHMgdG8uXG4gICAgICogQHBhcmFtIHsuLi5zdHJpbmd9IFttZXRob2ROYW1lXSBUaGUgb2JqZWN0IG1ldGhvZCBuYW1lcyB0b1xuICAgICAqICBiaW5kLCBzcGVjaWZpZWQgYXMgaW5kaXZpZHVhbCBtZXRob2QgbmFtZXMgb3IgYXJyYXlzIG9mIG1ldGhvZCBuYW1lcy5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgdmlldyA9IHtcbiAgICAgKiAgICdsYWJlbCc6ICdkb2NzJyxcbiAgICAgKiAgICdvbkNsaWNrJzogZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdjbGlja2VkICcgKyB0aGlzLmxhYmVsKTsgfVxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiBfLmJpbmRBbGwodmlldyk7XG4gICAgICogalF1ZXJ5KCcjZG9jcycpLm9uKCdjbGljaycsIHZpZXcub25DbGljayk7XG4gICAgICogLy8gPT4gbG9ncyAnY2xpY2tlZCBkb2NzJywgd2hlbiB0aGUgYnV0dG9uIGlzIGNsaWNrZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiaW5kQWxsKG9iamVjdCkge1xuICAgICAgdmFyIGZ1bmNzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBiYXNlRmxhdHRlbihhcmd1bWVudHMsIHRydWUsIGZhbHNlLCAxKSA6IGZ1bmN0aW9ucyhvYmplY3QpLFxuICAgICAgICAgIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gZnVuY3MubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0gZnVuY3NbaW5kZXhdO1xuICAgICAgICBvYmplY3Rba2V5XSA9IGNyZWF0ZVdyYXBwZXIob2JqZWN0W2tleV0sIDEsIG51bGwsIG51bGwsIG9iamVjdCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgaW52b2tlcyB0aGUgbWV0aG9kIGF0IGBvYmplY3Rba2V5XWBcbiAgICAgKiBhbmQgcHJlcGVuZHMgYW55IGFkZGl0aW9uYWwgYGJpbmRLZXlgIGFyZ3VtZW50cyB0byB0aG9zZSBwcm92aWRlZCB0byB0aGUgYm91bmRcbiAgICAgKiBmdW5jdGlvbi4gVGhpcyBtZXRob2QgZGlmZmVycyBmcm9tIGBfLmJpbmRgIGJ5IGFsbG93aW5nIGJvdW5kIGZ1bmN0aW9ucyB0b1xuICAgICAqIHJlZmVyZW5jZSBtZXRob2RzIHRoYXQgd2lsbCBiZSByZWRlZmluZWQgb3IgZG9uJ3QgeWV0IGV4aXN0LlxuICAgICAqIFNlZSBodHRwOi8vbWljaGF1eC5jYS9hcnRpY2xlcy9sYXp5LWZ1bmN0aW9uLWRlZmluaXRpb24tcGF0dGVybi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdGhlIG1ldGhvZCBiZWxvbmdzIHRvLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gW2FyZ10gQXJndW1lbnRzIHRvIGJlIHBhcnRpYWxseSBhcHBsaWVkLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJvdW5kIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgb2JqZWN0ID0ge1xuICAgICAqICAgJ25hbWUnOiAnZnJlZCcsXG4gICAgICogICAnZ3JlZXQnOiBmdW5jdGlvbihncmVldGluZykge1xuICAgICAqICAgICByZXR1cm4gZ3JlZXRpbmcgKyAnICcgKyB0aGlzLm5hbWU7XG4gICAgICogICB9XG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIHZhciBmdW5jID0gXy5iaW5kS2V5KG9iamVjdCwgJ2dyZWV0JywgJ2hpJyk7XG4gICAgICogZnVuYygpO1xuICAgICAqIC8vID0+ICdoaSBmcmVkJ1xuICAgICAqXG4gICAgICogb2JqZWN0LmdyZWV0ID0gZnVuY3Rpb24oZ3JlZXRpbmcpIHtcbiAgICAgKiAgIHJldHVybiBncmVldGluZyArICd5YSAnICsgdGhpcy5uYW1lICsgJyEnO1xuICAgICAqIH07XG4gICAgICpcbiAgICAgKiBmdW5jKCk7XG4gICAgICogLy8gPT4gJ2hpeWEgZnJlZCEnXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmluZEtleShvYmplY3QsIGtleSkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPiAyXG4gICAgICAgID8gY3JlYXRlV3JhcHBlcihrZXksIDE5LCBzbGljZShhcmd1bWVudHMsIDIpLCBudWxsLCBvYmplY3QpXG4gICAgICAgIDogY3JlYXRlV3JhcHBlcihrZXksIDMsIG51bGwsIG51bGwsIG9iamVjdCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgaXMgdGhlIGNvbXBvc2l0aW9uIG9mIHRoZSBwcm92aWRlZCBmdW5jdGlvbnMsXG4gICAgICogd2hlcmUgZWFjaCBmdW5jdGlvbiBjb25zdW1lcyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiB0aGF0IGZvbGxvd3MuXG4gICAgICogRm9yIGV4YW1wbGUsIGNvbXBvc2luZyB0aGUgZnVuY3Rpb25zIGBmKClgLCBgZygpYCwgYW5kIGBoKClgIHByb2R1Y2VzIGBmKGcoaCgpKSlgLlxuICAgICAqIEVhY2ggZnVuY3Rpb24gaXMgZXhlY3V0ZWQgd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlIGNvbXBvc2VkIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICAgICAqIEBwYXJhbSB7Li4uRnVuY3Rpb259IFtmdW5jXSBGdW5jdGlvbnMgdG8gY29tcG9zZS5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjb21wb3NlZCBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIHJlYWxOYW1lTWFwID0ge1xuICAgICAqICAgJ3BlYmJsZXMnOiAncGVuZWxvcGUnXG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIHZhciBmb3JtYXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgICogICBuYW1lID0gcmVhbE5hbWVNYXBbbmFtZS50b0xvd2VyQ2FzZSgpXSB8fCBuYW1lO1xuICAgICAqICAgcmV0dXJuIG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnNsaWNlKDEpLnRvTG93ZXJDYXNlKCk7XG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIHZhciBncmVldCA9IGZ1bmN0aW9uKGZvcm1hdHRlZCkge1xuICAgICAqICAgcmV0dXJuICdIaXlhICcgKyBmb3JtYXR0ZWQgKyAnISc7XG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIHZhciB3ZWxjb21lID0gXy5jb21wb3NlKGdyZWV0LCBmb3JtYXQpO1xuICAgICAqIHdlbGNvbWUoJ3BlYmJsZXMnKTtcbiAgICAgKiAvLyA9PiAnSGl5YSBQZW5lbG9wZSEnXG4gICAgICovXG4gICAgZnVuY3Rpb24gY29tcG9zZSgpIHtcbiAgICAgIHZhciBmdW5jcyA9IGFyZ3VtZW50cyxcbiAgICAgICAgICBsZW5ndGggPSBmdW5jcy5sZW5ndGg7XG5cbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBpZiAoIWlzRnVuY3Rpb24oZnVuY3NbbGVuZ3RoXSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgICAgbGVuZ3RoID0gZnVuY3MubGVuZ3RoO1xuXG4gICAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICAgIGFyZ3MgPSBbZnVuY3NbbGVuZ3RoXS5hcHBseSh0aGlzLCBhcmdzKV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFyZ3NbMF07XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB3aGljaCBhY2NlcHRzIG9uZSBvciBtb3JlIGFyZ3VtZW50cyBvZiBgZnVuY2AgdGhhdCB3aGVuXG4gICAgICogaW52b2tlZCBlaXRoZXIgZXhlY3V0ZXMgYGZ1bmNgIHJldHVybmluZyBpdHMgcmVzdWx0LCBpZiBhbGwgYGZ1bmNgIGFyZ3VtZW50c1xuICAgICAqIGhhdmUgYmVlbiBwcm92aWRlZCwgb3IgcmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyBvbmUgb3IgbW9yZSBvZiB0aGVcbiAgICAgKiByZW1haW5pbmcgYGZ1bmNgIGFyZ3VtZW50cywgYW5kIHNvIG9uLiBUaGUgYXJpdHkgb2YgYGZ1bmNgIGNhbiBiZSBzcGVjaWZpZWRcbiAgICAgKiBpZiBgZnVuYy5sZW5ndGhgIGlzIG5vdCBzdWZmaWNpZW50LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGN1cnJ5LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbYXJpdHk9ZnVuYy5sZW5ndGhdIFRoZSBhcml0eSBvZiBgZnVuY2AuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY3VycmllZCBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGN1cnJpZWQgPSBfLmN1cnJ5KGZ1bmN0aW9uKGEsIGIsIGMpIHtcbiAgICAgKiAgIGNvbnNvbGUubG9nKGEgKyBiICsgYyk7XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiBjdXJyaWVkKDEpKDIpKDMpO1xuICAgICAqIC8vID0+IDZcbiAgICAgKlxuICAgICAqIGN1cnJpZWQoMSwgMikoMyk7XG4gICAgICogLy8gPT4gNlxuICAgICAqXG4gICAgICogY3VycmllZCgxLCAyLCAzKTtcbiAgICAgKiAvLyA9PiA2XG4gICAgICovXG4gICAgZnVuY3Rpb24gY3VycnkoZnVuYywgYXJpdHkpIHtcbiAgICAgIGFyaXR5ID0gdHlwZW9mIGFyaXR5ID09ICdudW1iZXInID8gYXJpdHkgOiAoK2FyaXR5IHx8IGZ1bmMubGVuZ3RoKTtcbiAgICAgIHJldHVybiBjcmVhdGVXcmFwcGVyKGZ1bmMsIDQsIG51bGwsIG51bGwsIG51bGwsIGFyaXR5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGRlbGF5IHRoZSBleGVjdXRpb24gb2YgYGZ1bmNgIHVudGlsIGFmdGVyXG4gICAgICogYHdhaXRgIG1pbGxpc2Vjb25kcyBoYXZlIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgdGltZSBpdCB3YXMgaW52b2tlZC5cbiAgICAgKiBQcm92aWRlIGFuIG9wdGlvbnMgb2JqZWN0IHRvIGluZGljYXRlIHRoYXQgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uXG4gICAgICogdGhlIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YCB0aW1lb3V0LiBTdWJzZXF1ZW50IGNhbGxzXG4gICAgICogdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbiB3aWxsIHJldHVybiB0aGUgcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYCBjYWxsLlxuICAgICAqXG4gICAgICogTm90ZTogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCBgZnVuY2Agd2lsbCBiZSBjYWxsZWRcbiAgICAgKiBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIGlzXG4gICAgICogaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRlYm91bmNlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3YWl0IFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz1mYWxzZV0gU3BlY2lmeSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2FpdF0gVGhlIG1heGltdW0gdGltZSBgZnVuY2AgaXMgYWxsb3dlZCB0byBiZSBkZWxheWVkIGJlZm9yZSBpdCdzIGNhbGxlZC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdIFNwZWNpZnkgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGRlYm91bmNlZCBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogLy8gYXZvaWQgY29zdGx5IGNhbGN1bGF0aW9ucyB3aGlsZSB0aGUgd2luZG93IHNpemUgaXMgaW4gZmx1eFxuICAgICAqIHZhciBsYXp5TGF5b3V0ID0gXy5kZWJvdW5jZShjYWxjdWxhdGVMYXlvdXQsIDE1MCk7XG4gICAgICogalF1ZXJ5KHdpbmRvdykub24oJ3Jlc2l6ZScsIGxhenlMYXlvdXQpO1xuICAgICAqXG4gICAgICogLy8gZXhlY3V0ZSBgc2VuZE1haWxgIHdoZW4gdGhlIGNsaWNrIGV2ZW50IGlzIGZpcmVkLCBkZWJvdW5jaW5nIHN1YnNlcXVlbnQgY2FsbHNcbiAgICAgKiBqUXVlcnkoJyNwb3N0Ym94Jykub24oJ2NsaWNrJywgXy5kZWJvdW5jZShzZW5kTWFpbCwgMzAwLCB7XG4gICAgICogICAnbGVhZGluZyc6IHRydWUsXG4gICAgICogICAndHJhaWxpbmcnOiBmYWxzZVxuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogLy8gZW5zdXJlIGBiYXRjaExvZ2AgaXMgZXhlY3V0ZWQgb25jZSBhZnRlciAxIHNlY29uZCBvZiBkZWJvdW5jZWQgY2FsbHNcbiAgICAgKiB2YXIgc291cmNlID0gbmV3IEV2ZW50U291cmNlKCcvc3RyZWFtJyk7XG4gICAgICogc291cmNlLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBfLmRlYm91bmNlKGJhdGNoTG9nLCAyNTAsIHtcbiAgICAgKiAgICdtYXhXYWl0JzogMTAwMFxuICAgICAqIH0sIGZhbHNlKTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gICAgICB2YXIgYXJncyxcbiAgICAgICAgICBtYXhUaW1lb3V0SWQsXG4gICAgICAgICAgcmVzdWx0LFxuICAgICAgICAgIHN0YW1wLFxuICAgICAgICAgIHRoaXNBcmcsXG4gICAgICAgICAgdGltZW91dElkLFxuICAgICAgICAgIHRyYWlsaW5nQ2FsbCxcbiAgICAgICAgICBsYXN0Q2FsbGVkID0gMCxcbiAgICAgICAgICBtYXhXYWl0ID0gZmFsc2UsXG4gICAgICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gICAgICBpZiAoIWlzRnVuY3Rpb24oZnVuYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICAgIH1cbiAgICAgIHdhaXQgPSBuYXRpdmVNYXgoMCwgd2FpdCkgfHwgMDtcbiAgICAgIGlmIChvcHRpb25zID09PSB0cnVlKSB7XG4gICAgICAgIHZhciBsZWFkaW5nID0gdHJ1ZTtcbiAgICAgICAgdHJhaWxpbmcgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICAgICAgbGVhZGluZyA9IG9wdGlvbnMubGVhZGluZztcbiAgICAgICAgbWF4V2FpdCA9ICdtYXhXYWl0JyBpbiBvcHRpb25zICYmIChuYXRpdmVNYXgod2FpdCwgb3B0aW9ucy5tYXhXYWl0KSB8fCAwKTtcbiAgICAgICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyBvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gICAgICB9XG4gICAgICB2YXIgZGVsYXllZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVtYWluaW5nID0gd2FpdCAtIChub3coKSAtIHN0YW1wKTtcbiAgICAgICAgaWYgKHJlbWFpbmluZyA8PSAwKSB7XG4gICAgICAgICAgaWYgKG1heFRpbWVvdXRJZCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KG1heFRpbWVvdXRJZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBpc0NhbGxlZCA9IHRyYWlsaW5nQ2FsbDtcbiAgICAgICAgICBtYXhUaW1lb3V0SWQgPSB0aW1lb3V0SWQgPSB0cmFpbGluZ0NhbGwgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgaWYgKGlzQ2FsbGVkKSB7XG4gICAgICAgICAgICBsYXN0Q2FsbGVkID0gbm93KCk7XG4gICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKCF0aW1lb3V0SWQgJiYgIW1heFRpbWVvdXRJZCkge1xuICAgICAgICAgICAgICBhcmdzID0gdGhpc0FyZyA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZGVsYXllZCwgcmVtYWluaW5nKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdmFyIG1heERlbGF5ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRpbWVvdXRJZCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICB9XG4gICAgICAgIG1heFRpbWVvdXRJZCA9IHRpbWVvdXRJZCA9IHRyYWlsaW5nQ2FsbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRyYWlsaW5nIHx8IChtYXhXYWl0ICE9PSB3YWl0KSkge1xuICAgICAgICAgIGxhc3RDYWxsZWQgPSBub3coKTtcbiAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgICAgICAgIGlmICghdGltZW91dElkICYmICFtYXhUaW1lb3V0SWQpIHtcbiAgICAgICAgICAgIGFyZ3MgPSB0aGlzQXJnID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgc3RhbXAgPSBub3coKTtcbiAgICAgICAgdGhpc0FyZyA9IHRoaXM7XG4gICAgICAgIHRyYWlsaW5nQ2FsbCA9IHRyYWlsaW5nICYmICh0aW1lb3V0SWQgfHwgIWxlYWRpbmcpO1xuXG4gICAgICAgIGlmIChtYXhXYWl0ID09PSBmYWxzZSkge1xuICAgICAgICAgIHZhciBsZWFkaW5nQ2FsbCA9IGxlYWRpbmcgJiYgIXRpbWVvdXRJZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIW1heFRpbWVvdXRJZCAmJiAhbGVhZGluZykge1xuICAgICAgICAgICAgbGFzdENhbGxlZCA9IHN0YW1wO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgcmVtYWluaW5nID0gbWF4V2FpdCAtIChzdGFtcCAtIGxhc3RDYWxsZWQpLFxuICAgICAgICAgICAgICBpc0NhbGxlZCA9IHJlbWFpbmluZyA8PSAwO1xuXG4gICAgICAgICAgaWYgKGlzQ2FsbGVkKSB7XG4gICAgICAgICAgICBpZiAobWF4VGltZW91dElkKSB7XG4gICAgICAgICAgICAgIG1heFRpbWVvdXRJZCA9IGNsZWFyVGltZW91dChtYXhUaW1lb3V0SWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdENhbGxlZCA9IHN0YW1wO1xuICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoIW1heFRpbWVvdXRJZCkge1xuICAgICAgICAgICAgbWF4VGltZW91dElkID0gc2V0VGltZW91dChtYXhEZWxheWVkLCByZW1haW5pbmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNDYWxsZWQgJiYgdGltZW91dElkKSB7XG4gICAgICAgICAgdGltZW91dElkID0gY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIXRpbWVvdXRJZCAmJiB3YWl0ICE9PSBtYXhXYWl0KSB7XG4gICAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChkZWxheWVkLCB3YWl0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVhZGluZ0NhbGwpIHtcbiAgICAgICAgICBpc0NhbGxlZCA9IHRydWU7XG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNDYWxsZWQgJiYgIXRpbWVvdXRJZCAmJiAhbWF4VGltZW91dElkKSB7XG4gICAgICAgICAgYXJncyA9IHRoaXNBcmcgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlZmVycyBleGVjdXRpbmcgdGhlIGBmdW5jYCBmdW5jdGlvbiB1bnRpbCB0aGUgY3VycmVudCBjYWxsIHN0YWNrIGhhcyBjbGVhcmVkLlxuICAgICAqIEFkZGl0aW9uYWwgYXJndW1lbnRzIHdpbGwgYmUgcHJvdmlkZWQgdG8gYGZ1bmNgIHdoZW4gaXQgaXMgaW52b2tlZC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBkZWZlci5cbiAgICAgKiBAcGFyYW0gey4uLip9IFthcmddIEFyZ3VtZW50cyB0byBpbnZva2UgdGhlIGZ1bmN0aW9uIHdpdGguXG4gICAgICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgdGltZXIgaWQuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uZGVmZXIoZnVuY3Rpb24odGV4dCkgeyBjb25zb2xlLmxvZyh0ZXh0KTsgfSwgJ2RlZmVycmVkJyk7XG4gICAgICogLy8gbG9ncyAnZGVmZXJyZWQnIGFmdGVyIG9uZSBvciBtb3JlIG1pbGxpc2Vjb25kc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRlZmVyKGZ1bmMpIHtcbiAgICAgIGlmICghaXNGdW5jdGlvbihmdW5jKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICAgICAgfVxuICAgICAgdmFyIGFyZ3MgPSBzbGljZShhcmd1bWVudHMsIDEpO1xuICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGZ1bmMuYXBwbHkodW5kZWZpbmVkLCBhcmdzKTsgfSwgMSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgdGhlIGBmdW5jYCBmdW5jdGlvbiBhZnRlciBgd2FpdGAgbWlsbGlzZWNvbmRzLiBBZGRpdGlvbmFsIGFyZ3VtZW50c1xuICAgICAqIHdpbGwgYmUgcHJvdmlkZWQgdG8gYGZ1bmNgIHdoZW4gaXQgaXMgaW52b2tlZC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBkZWxheS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2FpdCBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheSBleGVjdXRpb24uXG4gICAgICogQHBhcmFtIHsuLi4qfSBbYXJnXSBBcmd1bWVudHMgdG8gaW52b2tlIHRoZSBmdW5jdGlvbiB3aXRoLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIHRpbWVyIGlkLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmRlbGF5KGZ1bmN0aW9uKHRleHQpIHsgY29uc29sZS5sb2codGV4dCk7IH0sIDEwMDAsICdsYXRlcicpO1xuICAgICAqIC8vID0+IGxvZ3MgJ2xhdGVyJyBhZnRlciBvbmUgc2Vjb25kXG4gICAgICovXG4gICAgZnVuY3Rpb24gZGVsYXkoZnVuYywgd2FpdCkge1xuICAgICAgaWYgKCFpc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgICB9XG4gICAgICB2YXIgYXJncyA9IHNsaWNlKGFyZ3VtZW50cywgMik7XG4gICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHsgZnVuYy5hcHBseSh1bmRlZmluZWQsIGFyZ3MpOyB9LCB3YWl0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBtZW1vaXplcyB0aGUgcmVzdWx0IG9mIGBmdW5jYC4gSWYgYHJlc29sdmVyYCBpc1xuICAgICAqIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZCB0byBkZXRlcm1pbmUgdGhlIGNhY2hlIGtleSBmb3Igc3RvcmluZyB0aGUgcmVzdWx0XG4gICAgICogYmFzZWQgb24gdGhlIGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24uIEJ5IGRlZmF1bHQsIHRoZVxuICAgICAqIGZpcnN0IGFyZ3VtZW50IHByb3ZpZGVkIHRvIHRoZSBtZW1vaXplZCBmdW5jdGlvbiBpcyB1c2VkIGFzIHRoZSBjYWNoZSBrZXkuXG4gICAgICogVGhlIGBmdW5jYCBpcyBleGVjdXRlZCB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24uXG4gICAgICogVGhlIHJlc3VsdCBjYWNoZSBpcyBleHBvc2VkIGFzIHRoZSBgY2FjaGVgIHByb3BlcnR5IG9uIHRoZSBtZW1vaXplZCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBoYXZlIGl0cyBvdXRwdXQgbWVtb2l6ZWQuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW3Jlc29sdmVyXSBBIGZ1bmN0aW9uIHVzZWQgdG8gcmVzb2x2ZSB0aGUgY2FjaGUga2V5LlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IG1lbW9pemluZyBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGZpYm9uYWNjaSA9IF8ubWVtb2l6ZShmdW5jdGlvbihuKSB7XG4gICAgICogICByZXR1cm4gbiA8IDIgPyBuIDogZmlib25hY2NpKG4gLSAxKSArIGZpYm9uYWNjaShuIC0gMik7XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiBmaWJvbmFjY2koOSlcbiAgICAgKiAvLyA9PiAzNFxuICAgICAqXG4gICAgICogdmFyIGRhdGEgPSB7XG4gICAgICogICAnZnJlZCc6IHsgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiA0MCB9LFxuICAgICAqICAgJ3BlYmJsZXMnOiB7ICduYW1lJzogJ3BlYmJsZXMnLCAnYWdlJzogMSB9XG4gICAgICogfTtcbiAgICAgKlxuICAgICAqIC8vIG1vZGlmeWluZyB0aGUgcmVzdWx0IGNhY2hlXG4gICAgICogdmFyIGdldCA9IF8ubWVtb2l6ZShmdW5jdGlvbihuYW1lKSB7IHJldHVybiBkYXRhW25hbWVdOyB9LCBfLmlkZW50aXR5KTtcbiAgICAgKiBnZXQoJ3BlYmJsZXMnKTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ3BlYmJsZXMnLCAnYWdlJzogMSB9XG4gICAgICpcbiAgICAgKiBnZXQuY2FjaGUucGViYmxlcy5uYW1lID0gJ3BlbmVsb3BlJztcbiAgICAgKiBnZXQoJ3BlYmJsZXMnKTtcbiAgICAgKiAvLyA9PiB7ICduYW1lJzogJ3BlbmVsb3BlJywgJ2FnZSc6IDEgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1lbW9pemUoZnVuYywgcmVzb2x2ZXIpIHtcbiAgICAgIGlmICghaXNGdW5jdGlvbihmdW5jKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICAgICAgfVxuICAgICAgdmFyIG1lbW9pemVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjYWNoZSA9IG1lbW9pemVkLmNhY2hlLFxuICAgICAgICAgICAga2V5ID0gcmVzb2x2ZXIgPyByZXNvbHZlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDoga2V5UHJlZml4ICsgYXJndW1lbnRzWzBdO1xuXG4gICAgICAgIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGNhY2hlLCBrZXkpXG4gICAgICAgICAgPyBjYWNoZVtrZXldXG4gICAgICAgICAgOiAoY2FjaGVba2V5XSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgICB9XG4gICAgICBtZW1vaXplZC5jYWNoZSA9IHt9O1xuICAgICAgcmV0dXJuIG1lbW9pemVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IGlzIHJlc3RyaWN0ZWQgdG8gZXhlY3V0ZSBgZnVuY2Agb25jZS4gUmVwZWF0IGNhbGxzIHRvXG4gICAgICogdGhlIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIHRoZSB2YWx1ZSBvZiB0aGUgZmlyc3QgY2FsbC4gVGhlIGBmdW5jYCBpcyBleGVjdXRlZFxuICAgICAqIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIHRoZSBjcmVhdGVkIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHJlc3RyaWN0LlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHJlc3RyaWN0ZWQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBpbml0aWFsaXplID0gXy5vbmNlKGNyZWF0ZUFwcGxpY2F0aW9uKTtcbiAgICAgKiBpbml0aWFsaXplKCk7XG4gICAgICogaW5pdGlhbGl6ZSgpO1xuICAgICAqIC8vIGBpbml0aWFsaXplYCBleGVjdXRlcyBgY3JlYXRlQXBwbGljYXRpb25gIG9uY2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBvbmNlKGZ1bmMpIHtcbiAgICAgIHZhciByYW4sXG4gICAgICAgICAgcmVzdWx0O1xuXG4gICAgICBpZiAoIWlzRnVuY3Rpb24oZnVuYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHJhbikge1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmFuID0gdHJ1ZTtcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgIC8vIGNsZWFyIHRoZSBgZnVuY2AgdmFyaWFibGUgc28gdGhlIGZ1bmN0aW9uIG1heSBiZSBnYXJiYWdlIGNvbGxlY3RlZFxuICAgICAgICBmdW5jID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCBpbnZva2VzIGBmdW5jYCB3aXRoIGFueSBhZGRpdGlvbmFsXG4gICAgICogYHBhcnRpYWxgIGFyZ3VtZW50cyBwcmVwZW5kZWQgdG8gdGhvc2UgcHJvdmlkZWQgdG8gdGhlIG5ldyBmdW5jdGlvbi4gVGhpc1xuICAgICAqIG1ldGhvZCBpcyBzaW1pbGFyIHRvIGBfLmJpbmRgIGV4Y2VwdCBpdCBkb2VzICoqbm90KiogYWx0ZXIgdGhlIGB0aGlzYCBiaW5kaW5nLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHBhcnRpYWxseSBhcHBseSBhcmd1bWVudHMgdG8uXG4gICAgICogQHBhcmFtIHsuLi4qfSBbYXJnXSBBcmd1bWVudHMgdG8gYmUgcGFydGlhbGx5IGFwcGxpZWQuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgcGFydGlhbGx5IGFwcGxpZWQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBncmVldCA9IGZ1bmN0aW9uKGdyZWV0aW5nLCBuYW1lKSB7IHJldHVybiBncmVldGluZyArICcgJyArIG5hbWU7IH07XG4gICAgICogdmFyIGhpID0gXy5wYXJ0aWFsKGdyZWV0LCAnaGknKTtcbiAgICAgKiBoaSgnZnJlZCcpO1xuICAgICAqIC8vID0+ICdoaSBmcmVkJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHBhcnRpYWwoZnVuYykge1xuICAgICAgcmV0dXJuIGNyZWF0ZVdyYXBwZXIoZnVuYywgMTYsIHNsaWNlKGFyZ3VtZW50cywgMSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8ucGFydGlhbGAgZXhjZXB0IHRoYXQgYHBhcnRpYWxgIGFyZ3VtZW50cyBhcmVcbiAgICAgKiBhcHBlbmRlZCB0byB0aG9zZSBwcm92aWRlZCB0byB0aGUgbmV3IGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uc1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHBhcnRpYWxseSBhcHBseSBhcmd1bWVudHMgdG8uXG4gICAgICogQHBhcmFtIHsuLi4qfSBbYXJnXSBBcmd1bWVudHMgdG8gYmUgcGFydGlhbGx5IGFwcGxpZWQuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgcGFydGlhbGx5IGFwcGxpZWQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBkZWZhdWx0c0RlZXAgPSBfLnBhcnRpYWxSaWdodChfLm1lcmdlLCBfLmRlZmF1bHRzKTtcbiAgICAgKlxuICAgICAqIHZhciBvcHRpb25zID0ge1xuICAgICAqICAgJ3ZhcmlhYmxlJzogJ2RhdGEnLFxuICAgICAqICAgJ2ltcG9ydHMnOiB7ICdqcSc6ICQgfVxuICAgICAqIH07XG4gICAgICpcbiAgICAgKiBkZWZhdWx0c0RlZXAob3B0aW9ucywgXy50ZW1wbGF0ZVNldHRpbmdzKTtcbiAgICAgKlxuICAgICAqIG9wdGlvbnMudmFyaWFibGVcbiAgICAgKiAvLyA9PiAnZGF0YSdcbiAgICAgKlxuICAgICAqIG9wdGlvbnMuaW1wb3J0c1xuICAgICAqIC8vID0+IHsgJ18nOiBfLCAnanEnOiAkIH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwYXJ0aWFsUmlnaHQoZnVuYykge1xuICAgICAgcmV0dXJuIGNyZWF0ZVdyYXBwZXIoZnVuYywgMzIsIG51bGwsIHNsaWNlKGFyZ3VtZW50cywgMSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGV4ZWN1dGVkLCB3aWxsIG9ubHkgY2FsbCB0aGUgYGZ1bmNgIGZ1bmN0aW9uXG4gICAgICogYXQgbW9zdCBvbmNlIHBlciBldmVyeSBgd2FpdGAgbWlsbGlzZWNvbmRzLiBQcm92aWRlIGFuIG9wdGlvbnMgb2JqZWN0IHRvXG4gICAgICogaW5kaWNhdGUgdGhhdCBgZnVuY2Agc2hvdWxkIGJlIGludm9rZWQgb24gdGhlIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2VcbiAgICAgKiBvZiB0aGUgYHdhaXRgIHRpbWVvdXQuIFN1YnNlcXVlbnQgY2FsbHMgdG8gdGhlIHRocm90dGxlZCBmdW5jdGlvbiB3aWxsXG4gICAgICogcmV0dXJuIHRoZSByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgIGNhbGwuXG4gICAgICpcbiAgICAgKiBOb3RlOiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgIGBmdW5jYCB3aWxsIGJlIGNhbGxlZFxuICAgICAqIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gaXNcbiAgICAgKiBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gdGhyb3R0bGUuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdhaXQgVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gdGhyb3R0bGUgZXhlY3V0aW9ucyB0by5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIFRoZSBvcHRpb25zIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9dHJ1ZV0gU3BlY2lmeSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdIFNwZWNpZnkgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IHRocm90dGxlZCBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogLy8gYXZvaWQgZXhjZXNzaXZlbHkgdXBkYXRpbmcgdGhlIHBvc2l0aW9uIHdoaWxlIHNjcm9sbGluZ1xuICAgICAqIHZhciB0aHJvdHRsZWQgPSBfLnRocm90dGxlKHVwZGF0ZVBvc2l0aW9uLCAxMDApO1xuICAgICAqIGpRdWVyeSh3aW5kb3cpLm9uKCdzY3JvbGwnLCB0aHJvdHRsZWQpO1xuICAgICAqXG4gICAgICogLy8gZXhlY3V0ZSBgcmVuZXdUb2tlbmAgd2hlbiB0aGUgY2xpY2sgZXZlbnQgaXMgZmlyZWQsIGJ1dCBub3QgbW9yZSB0aGFuIG9uY2UgZXZlcnkgNSBtaW51dGVzXG4gICAgICogalF1ZXJ5KCcuaW50ZXJhY3RpdmUnKS5vbignY2xpY2snLCBfLnRocm90dGxlKHJlbmV3VG9rZW4sIDMwMDAwMCwge1xuICAgICAqICAgJ3RyYWlsaW5nJzogZmFsc2VcbiAgICAgKiB9KSk7XG4gICAgICovXG4gICAgZnVuY3Rpb24gdGhyb3R0bGUoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgICAgdmFyIGxlYWRpbmcgPSB0cnVlLFxuICAgICAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICAgICAgaWYgKCFpc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucyA9PT0gZmFsc2UpIHtcbiAgICAgICAgbGVhZGluZyA9IGZhbHNlO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgICAgICBsZWFkaW5nID0gJ2xlYWRpbmcnIGluIG9wdGlvbnMgPyBvcHRpb25zLmxlYWRpbmcgOiBsZWFkaW5nO1xuICAgICAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/IG9wdGlvbnMudHJhaWxpbmcgOiB0cmFpbGluZztcbiAgICAgIH1cbiAgICAgIGRlYm91bmNlT3B0aW9ucy5sZWFkaW5nID0gbGVhZGluZztcbiAgICAgIGRlYm91bmNlT3B0aW9ucy5tYXhXYWl0ID0gd2FpdDtcbiAgICAgIGRlYm91bmNlT3B0aW9ucy50cmFpbGluZyA9IHRyYWlsaW5nO1xuXG4gICAgICByZXR1cm4gZGVib3VuY2UoZnVuYywgd2FpdCwgZGVib3VuY2VPcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBwcm92aWRlcyBgdmFsdWVgIHRvIHRoZSB3cmFwcGVyIGZ1bmN0aW9uIGFzIGl0c1xuICAgICAqIGZpcnN0IGFyZ3VtZW50LiBBZGRpdGlvbmFsIGFyZ3VtZW50cyBwcm92aWRlZCB0byB0aGUgZnVuY3Rpb24gYXJlIGFwcGVuZGVkXG4gICAgICogdG8gdGhvc2UgcHJvdmlkZWQgdG8gdGhlIHdyYXBwZXIgZnVuY3Rpb24uIFRoZSB3cmFwcGVyIGlzIGV4ZWN1dGVkIHdpdGhcbiAgICAgKiB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlIGNyZWF0ZWQgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gd3JhcC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSB3cmFwcGVyIFRoZSB3cmFwcGVyIGZ1bmN0aW9uLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgcCA9IF8ud3JhcChfLmVzY2FwZSwgZnVuY3Rpb24oZnVuYywgdGV4dCkge1xuICAgICAqICAgcmV0dXJuICc8cD4nICsgZnVuYyh0ZXh0KSArICc8L3A+JztcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIHAoJ0ZyZWQsIFdpbG1hLCAmIFBlYmJsZXMnKTtcbiAgICAgKiAvLyA9PiAnPHA+RnJlZCwgV2lsbWEsICZhbXA7IFBlYmJsZXM8L3A+J1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHdyYXAodmFsdWUsIHdyYXBwZXIpIHtcbiAgICAgIHJldHVybiBjcmVhdGVXcmFwcGVyKHdyYXBwZXIsIDE2LCBbdmFsdWVdKTtcbiAgICB9XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYHZhbHVlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byByZXR1cm4gZnJvbSB0aGUgbmV3IGZ1bmN0aW9uLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgb2JqZWN0ID0geyAnbmFtZSc6ICdmcmVkJyB9O1xuICAgICAqIHZhciBnZXR0ZXIgPSBfLmNvbnN0YW50KG9iamVjdCk7XG4gICAgICogZ2V0dGVyKCkgPT09IG9iamVjdDtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gY29uc3RhbnQodmFsdWUpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcm9kdWNlcyBhIGNhbGxiYWNrIGJvdW5kIHRvIGFuIG9wdGlvbmFsIGB0aGlzQXJnYC4gSWYgYGZ1bmNgIGlzIGEgcHJvcGVydHlcbiAgICAgKiBuYW1lIHRoZSBjcmVhdGVkIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBmb3IgYSBnaXZlbiBlbGVtZW50LlxuICAgICAqIElmIGBmdW5jYCBpcyBhbiBvYmplY3QgdGhlIGNyZWF0ZWQgY2FsbGJhY2sgd2lsbCByZXR1cm4gYHRydWVgIGZvciBlbGVtZW50c1xuICAgICAqIHRoYXQgY29udGFpbiB0aGUgZXF1aXZhbGVudCBvYmplY3QgcHJvcGVydGllcywgb3RoZXJ3aXNlIGl0IHdpbGwgcmV0dXJuIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQHBhcmFtIHsqfSBbZnVuYz1pZGVudGl0eV0gVGhlIHZhbHVlIHRvIGNvbnZlcnQgdG8gYSBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlIGNyZWF0ZWQgY2FsbGJhY2suXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFthcmdDb3VudF0gVGhlIG51bWJlciBvZiBhcmd1bWVudHMgdGhlIGNhbGxiYWNrIGFjY2VwdHMuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGEgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBjaGFyYWN0ZXJzID0gW1xuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfSxcbiAgICAgKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwIH1cbiAgICAgKiBdO1xuICAgICAqXG4gICAgICogLy8gd3JhcCB0byBjcmVhdGUgY3VzdG9tIGNhbGxiYWNrIHNob3J0aGFuZHNcbiAgICAgKiBfLmNyZWF0ZUNhbGxiYWNrID0gXy53cmFwKF8uY3JlYXRlQ2FsbGJhY2ssIGZ1bmN0aW9uKGZ1bmMsIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICogICB2YXIgbWF0Y2ggPSAvXiguKz8pX18oW2dsXXQpKC4rKSQvLmV4ZWMoY2FsbGJhY2spO1xuICAgICAqICAgcmV0dXJuICFtYXRjaCA/IGZ1bmMoY2FsbGJhY2ssIHRoaXNBcmcpIDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICogICAgIHJldHVybiBtYXRjaFsyXSA9PSAnZ3QnID8gb2JqZWN0W21hdGNoWzFdXSA+IG1hdGNoWzNdIDogb2JqZWN0W21hdGNoWzFdXSA8IG1hdGNoWzNdO1xuICAgICAqICAgfTtcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIF8uZmlsdGVyKGNoYXJhY3RlcnMsICdhZ2VfX2d0MzgnKTtcbiAgICAgKiAvLyA9PiBbeyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwIH1dXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlQ2FsbGJhY2soZnVuYywgdGhpc0FyZywgYXJnQ291bnQpIHtcbiAgICAgIHZhciB0eXBlID0gdHlwZW9mIGZ1bmM7XG4gICAgICBpZiAoZnVuYyA9PSBudWxsIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gYmFzZUNyZWF0ZUNhbGxiYWNrKGZ1bmMsIHRoaXNBcmcsIGFyZ0NvdW50KTtcbiAgICAgIH1cbiAgICAgIC8vIGhhbmRsZSBcIl8ucGx1Y2tcIiBzdHlsZSBjYWxsYmFjayBzaG9ydGhhbmRzXG4gICAgICBpZiAodHlwZSAhPSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gcHJvcGVydHkoZnVuYyk7XG4gICAgICB9XG4gICAgICB2YXIgcHJvcHMgPSBrZXlzKGZ1bmMpLFxuICAgICAgICAgIGtleSA9IHByb3BzWzBdLFxuICAgICAgICAgIGEgPSBmdW5jW2tleV07XG5cbiAgICAgIC8vIGhhbmRsZSBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjayBzaG9ydGhhbmRzXG4gICAgICBpZiAocHJvcHMubGVuZ3RoID09IDEgJiYgYSA9PT0gYSAmJiAhaXNPYmplY3QoYSkpIHtcbiAgICAgICAgLy8gZmFzdCBwYXRoIHRoZSBjb21tb24gY2FzZSBvZiBwcm92aWRpbmcgYW4gb2JqZWN0IHdpdGggYSBzaW5nbGVcbiAgICAgICAgLy8gcHJvcGVydHkgY29udGFpbmluZyBhIHByaW1pdGl2ZSB2YWx1ZVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICAgICAgdmFyIGIgPSBvYmplY3Rba2V5XTtcbiAgICAgICAgICByZXR1cm4gYSA9PT0gYiAmJiAoYSAhPT0gMCB8fCAoMSAvIGEgPT0gMSAvIGIpKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgICAgdmFyIGxlbmd0aCA9IHByb3BzLmxlbmd0aCxcbiAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuXG4gICAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICAgIGlmICghKHJlc3VsdCA9IGJhc2VJc0VxdWFsKG9iamVjdFtwcm9wc1tsZW5ndGhdXSwgZnVuY1twcm9wc1tsZW5ndGhdXSwgbnVsbCwgdHJ1ZSkpKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgdGhlIGNoYXJhY3RlcnMgYCZgLCBgPGAsIGA+YCwgYFwiYCwgYW5kIGAnYCBpbiBgc3RyaW5nYCB0byB0aGVpclxuICAgICAqIGNvcnJlc3BvbmRpbmcgSFRNTCBlbnRpdGllcy5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIFRoZSBzdHJpbmcgdG8gZXNjYXBlLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGVzY2FwZWQgc3RyaW5nLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmVzY2FwZSgnRnJlZCwgV2lsbWEsICYgUGViYmxlcycpO1xuICAgICAqIC8vID0+ICdGcmVkLCBXaWxtYSwgJmFtcDsgUGViYmxlcydcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlc2NhcGUoc3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nID09IG51bGwgPyAnJyA6IFN0cmluZyhzdHJpbmcpLnJlcGxhY2UocmVVbmVzY2FwZWRIdG1sLCBlc2NhcGVIdG1sQ2hhcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgZmlyc3QgYXJndW1lbnQgcHJvdmlkZWQgdG8gaXQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBBbnkgdmFsdWUuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgYHZhbHVlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIG9iamVjdCA9IHsgJ25hbWUnOiAnZnJlZCcgfTtcbiAgICAgKiBfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdDtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGZ1bmN0aW9uIHByb3BlcnRpZXMgb2YgYSBzb3VyY2Ugb2JqZWN0IHRvIHRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gICAgICogSWYgYG9iamVjdGAgaXMgYSBmdW5jdGlvbiBtZXRob2RzIHdpbGwgYmUgYWRkZWQgdG8gaXRzIHByb3RvdHlwZSBhcyB3ZWxsLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fSBbb2JqZWN0PWxvZGFzaF0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IG9mIGZ1bmN0aW9ucyB0byBhZGQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jaGFpbj10cnVlXSBTcGVjaWZ5IHdoZXRoZXIgdGhlIGZ1bmN0aW9ucyBhZGRlZCBhcmUgY2hhaW5hYmxlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBmdW5jdGlvbiBjYXBpdGFsaXplKHN0cmluZykge1xuICAgICAqICAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKS50b0xvd2VyQ2FzZSgpO1xuICAgICAqIH1cbiAgICAgKlxuICAgICAqIF8ubWl4aW4oeyAnY2FwaXRhbGl6ZSc6IGNhcGl0YWxpemUgfSk7XG4gICAgICogXy5jYXBpdGFsaXplKCdmcmVkJyk7XG4gICAgICogLy8gPT4gJ0ZyZWQnXG4gICAgICpcbiAgICAgKiBfKCdmcmVkJykuY2FwaXRhbGl6ZSgpLnZhbHVlKCk7XG4gICAgICogLy8gPT4gJ0ZyZWQnXG4gICAgICpcbiAgICAgKiBfLm1peGluKHsgJ2NhcGl0YWxpemUnOiBjYXBpdGFsaXplIH0sIHsgJ2NoYWluJzogZmFsc2UgfSk7XG4gICAgICogXygnZnJlZCcpLmNhcGl0YWxpemUoKTtcbiAgICAgKiAvLyA9PiAnRnJlZCdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtaXhpbihvYmplY3QsIHNvdXJjZSwgb3B0aW9ucykge1xuICAgICAgdmFyIGNoYWluID0gdHJ1ZSxcbiAgICAgICAgICBtZXRob2ROYW1lcyA9IHNvdXJjZSAmJiBmdW5jdGlvbnMoc291cmNlKTtcblxuICAgICAgaWYgKCFzb3VyY2UgfHwgKCFvcHRpb25zICYmICFtZXRob2ROYW1lcy5sZW5ndGgpKSB7XG4gICAgICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgICAgICBvcHRpb25zID0gc291cmNlO1xuICAgICAgICB9XG4gICAgICAgIGN0b3IgPSBsb2Rhc2hXcmFwcGVyO1xuICAgICAgICBzb3VyY2UgPSBvYmplY3Q7XG4gICAgICAgIG9iamVjdCA9IGxvZGFzaDtcbiAgICAgICAgbWV0aG9kTmFtZXMgPSBmdW5jdGlvbnMoc291cmNlKTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zID09PSBmYWxzZSkge1xuICAgICAgICBjaGFpbiA9IGZhbHNlO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdChvcHRpb25zKSAmJiAnY2hhaW4nIGluIG9wdGlvbnMpIHtcbiAgICAgICAgY2hhaW4gPSBvcHRpb25zLmNoYWluO1xuICAgICAgfVxuICAgICAgdmFyIGN0b3IgPSBvYmplY3QsXG4gICAgICAgICAgaXNGdW5jID0gaXNGdW5jdGlvbihjdG9yKTtcblxuICAgICAgZm9yRWFjaChtZXRob2ROYW1lcywgZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgICAgICB2YXIgZnVuYyA9IG9iamVjdFttZXRob2ROYW1lXSA9IHNvdXJjZVttZXRob2ROYW1lXTtcbiAgICAgICAgaWYgKGlzRnVuYykge1xuICAgICAgICAgIGN0b3IucHJvdG90eXBlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgY2hhaW5BbGwgPSB0aGlzLl9fY2hhaW5fXyxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuX193cmFwcGVkX18sXG4gICAgICAgICAgICAgICAgYXJncyA9IFt2YWx1ZV07XG5cbiAgICAgICAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBmdW5jLmFwcGx5KG9iamVjdCwgYXJncyk7XG4gICAgICAgICAgICBpZiAoY2hhaW4gfHwgY2hhaW5BbGwpIHtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSByZXN1bHQgJiYgaXNPYmplY3QocmVzdWx0KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBjdG9yKHJlc3VsdCk7XG4gICAgICAgICAgICAgIHJlc3VsdC5fX2NoYWluX18gPSBjaGFpbkFsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV2ZXJ0cyB0aGUgJ18nIHZhcmlhYmxlIHRvIGl0cyBwcmV2aW91cyB2YWx1ZSBhbmQgcmV0dXJucyBhIHJlZmVyZW5jZSB0b1xuICAgICAqIHRoZSBgbG9kYXNoYCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIGBsb2Rhc2hgIGZ1bmN0aW9uLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgbG9kYXNoID0gXy5ub0NvbmZsaWN0KCk7XG4gICAgICovXG4gICAgZnVuY3Rpb24gbm9Db25mbGljdCgpIHtcbiAgICAgIGNvbnRleHQuXyA9IG9sZERhc2g7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIG5vLW9wZXJhdGlvbiBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIG9iamVjdCA9IHsgJ25hbWUnOiAnZnJlZCcgfTtcbiAgICAgKiBfLm5vb3Aob2JqZWN0KSA9PT0gdW5kZWZpbmVkO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBub29wKCkge1xuICAgICAgLy8gbm8gb3BlcmF0aW9uIHBlcmZvcm1lZFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCBoYXZlIGVsYXBzZWQgc2luY2UgdGhlIFVuaXggZXBvY2hcbiAgICAgKiAoMSBKYW51YXJ5IDE5NzAgMDA6MDA6MDAgVVRDKS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIHN0YW1wID0gXy5ub3coKTtcbiAgICAgKiBfLmRlZmVyKGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZyhfLm5vdygpIC0gc3RhbXApOyB9KTtcbiAgICAgKiAvLyA9PiBsb2dzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGl0IHRvb2sgZm9yIHRoZSBkZWZlcnJlZCBmdW5jdGlvbiB0byBiZSBjYWxsZWRcbiAgICAgKi9cbiAgICB2YXIgbm93ID0gaXNOYXRpdmUobm93ID0gRGF0ZS5ub3cpICYmIG5vdyB8fCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgdGhlIGdpdmVuIHZhbHVlIGludG8gYW4gaW50ZWdlciBvZiB0aGUgc3BlY2lmaWVkIHJhZGl4LlxuICAgICAqIElmIGByYWRpeGAgaXMgYHVuZGVmaW5lZGAgb3IgYDBgIGEgYHJhZGl4YCBvZiBgMTBgIGlzIHVzZWQgdW5sZXNzIHRoZVxuICAgICAqIGB2YWx1ZWAgaXMgYSBoZXhhZGVjaW1hbCwgaW4gd2hpY2ggY2FzZSBhIGByYWRpeGAgb2YgYDE2YCBpcyB1c2VkLlxuICAgICAqXG4gICAgICogTm90ZTogVGhpcyBtZXRob2QgYXZvaWRzIGRpZmZlcmVuY2VzIGluIG5hdGl2ZSBFUzMgYW5kIEVTNSBgcGFyc2VJbnRgXG4gICAgICogaW1wbGVtZW50YXRpb25zLiBTZWUgaHR0cDovL2VzNS5naXRodWIuaW8vI0UuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIFRoZSB2YWx1ZSB0byBwYXJzZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3JhZGl4XSBUaGUgcmFkaXggdXNlZCB0byBpbnRlcnByZXQgdGhlIHZhbHVlIHRvIHBhcnNlLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIG5ldyBpbnRlZ2VyIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnBhcnNlSW50KCcwOCcpO1xuICAgICAqIC8vID0+IDhcbiAgICAgKi9cbiAgICB2YXIgcGFyc2VJbnQgPSBuYXRpdmVQYXJzZUludCh3aGl0ZXNwYWNlICsgJzA4JykgPT0gOCA/IG5hdGl2ZVBhcnNlSW50IDogZnVuY3Rpb24odmFsdWUsIHJhZGl4KSB7XG4gICAgICAvLyBGaXJlZm94IDwgMjEgYW5kIE9wZXJhIDwgMTUgZm9sbG93IHRoZSBFUzMgc3BlY2lmaWVkIGltcGxlbWVudGF0aW9uIG9mIGBwYXJzZUludGBcbiAgICAgIHJldHVybiBuYXRpdmVQYXJzZUludChpc1N0cmluZyh2YWx1ZSkgPyB2YWx1ZS5yZXBsYWNlKHJlTGVhZGluZ1NwYWNlc0FuZFplcm9zLCAnJykgOiB2YWx1ZSwgcmFkaXggfHwgMCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBcIl8ucGx1Y2tcIiBzdHlsZSBmdW5jdGlvbiwgd2hpY2ggcmV0dXJucyB0aGUgYGtleWAgdmFsdWUgb2YgYVxuICAgICAqIGdpdmVuIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byByZXRyaWV2ZS5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNoYXJhY3RlcnMgPSBbXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiB2YXIgZ2V0TmFtZSA9IF8ucHJvcGVydHkoJ25hbWUnKTtcbiAgICAgKlxuICAgICAqIF8ubWFwKGNoYXJhY3RlcnMsIGdldE5hbWUpO1xuICAgICAqIC8vID0+IFsnYmFybmV5JywgJ2ZyZWQnXVxuICAgICAqXG4gICAgICogXy5zb3J0QnkoY2hhcmFjdGVycywgZ2V0TmFtZSk7XG4gICAgICogLy8gPT4gW3sgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH0sIHsgJ25hbWUnOiAnZnJlZCcsICAgJ2FnZSc6IDQwIH1dXG4gICAgICovXG4gICAgZnVuY3Rpb24gcHJvcGVydHkoa2V5KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICAgIHJldHVybiBvYmplY3Rba2V5XTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJvZHVjZXMgYSByYW5kb20gbnVtYmVyIGJldHdlZW4gYG1pbmAgYW5kIGBtYXhgIChpbmNsdXNpdmUpLiBJZiBvbmx5IG9uZVxuICAgICAqIGFyZ3VtZW50IGlzIHByb3ZpZGVkIGEgbnVtYmVyIGJldHdlZW4gYDBgIGFuZCB0aGUgZ2l2ZW4gbnVtYmVyIHdpbGwgYmVcbiAgICAgKiByZXR1cm5lZC4gSWYgYGZsb2F0aW5nYCBpcyB0cnVleSBvciBlaXRoZXIgYG1pbmAgb3IgYG1heGAgYXJlIGZsb2F0cyBhXG4gICAgICogZmxvYXRpbmctcG9pbnQgbnVtYmVyIHdpbGwgYmUgcmV0dXJuZWQgaW5zdGVhZCBvZiBhbiBpbnRlZ2VyLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbWluPTBdIFRoZSBtaW5pbXVtIHBvc3NpYmxlIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbWF4PTFdIFRoZSBtYXhpbXVtIHBvc3NpYmxlIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zsb2F0aW5nPWZhbHNlXSBTcGVjaWZ5IHJldHVybmluZyBhIGZsb2F0aW5nLXBvaW50IG51bWJlci5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIGEgcmFuZG9tIG51bWJlci5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5yYW5kb20oMCwgNSk7XG4gICAgICogLy8gPT4gYW4gaW50ZWdlciBiZXR3ZWVuIDAgYW5kIDVcbiAgICAgKlxuICAgICAqIF8ucmFuZG9tKDUpO1xuICAgICAqIC8vID0+IGFsc28gYW4gaW50ZWdlciBiZXR3ZWVuIDAgYW5kIDVcbiAgICAgKlxuICAgICAqIF8ucmFuZG9tKDUsIHRydWUpO1xuICAgICAqIC8vID0+IGEgZmxvYXRpbmctcG9pbnQgbnVtYmVyIGJldHdlZW4gMCBhbmQgNVxuICAgICAqXG4gICAgICogXy5yYW5kb20oMS4yLCA1LjIpO1xuICAgICAqIC8vID0+IGEgZmxvYXRpbmctcG9pbnQgbnVtYmVyIGJldHdlZW4gMS4yIGFuZCA1LjJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByYW5kb20obWluLCBtYXgsIGZsb2F0aW5nKSB7XG4gICAgICB2YXIgbm9NaW4gPSBtaW4gPT0gbnVsbCxcbiAgICAgICAgICBub01heCA9IG1heCA9PSBudWxsO1xuXG4gICAgICBpZiAoZmxvYXRpbmcgPT0gbnVsbCkge1xuICAgICAgICBpZiAodHlwZW9mIG1pbiA9PSAnYm9vbGVhbicgJiYgbm9NYXgpIHtcbiAgICAgICAgICBmbG9hdGluZyA9IG1pbjtcbiAgICAgICAgICBtaW4gPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFub01heCAmJiB0eXBlb2YgbWF4ID09ICdib29sZWFuJykge1xuICAgICAgICAgIGZsb2F0aW5nID0gbWF4O1xuICAgICAgICAgIG5vTWF4ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG5vTWluICYmIG5vTWF4KSB7XG4gICAgICAgIG1heCA9IDE7XG4gICAgICB9XG4gICAgICBtaW4gPSArbWluIHx8IDA7XG4gICAgICBpZiAobm9NYXgpIHtcbiAgICAgICAgbWF4ID0gbWluO1xuICAgICAgICBtaW4gPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWF4ID0gK21heCB8fCAwO1xuICAgICAgfVxuICAgICAgaWYgKGZsb2F0aW5nIHx8IG1pbiAlIDEgfHwgbWF4ICUgMSkge1xuICAgICAgICB2YXIgcmFuZCA9IG5hdGl2ZVJhbmRvbSgpO1xuICAgICAgICByZXR1cm4gbmF0aXZlTWluKG1pbiArIChyYW5kICogKG1heCAtIG1pbiArIHBhcnNlRmxvYXQoJzFlLScgKyAoKHJhbmQgKycnKS5sZW5ndGggLSAxKSkpKSwgbWF4KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiYXNlUmFuZG9tKG1pbiwgbWF4KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlcyB0aGUgdmFsdWUgb2YgcHJvcGVydHkgYGtleWAgb24gYG9iamVjdGAuIElmIGBrZXlgIGlzIGEgZnVuY3Rpb25cbiAgICAgKiBpdCB3aWxsIGJlIGludm9rZWQgd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgYG9iamVjdGAgYW5kIGl0cyByZXN1bHQgcmV0dXJuZWQsXG4gICAgICogZWxzZSB0aGUgcHJvcGVydHkgdmFsdWUgaXMgcmV0dXJuZWQuIElmIGBvYmplY3RgIGlzIGZhbHNleSB0aGVuIGB1bmRlZmluZWRgXG4gICAgICogaXMgcmV0dXJuZWQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGluc3BlY3QuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gcmVzb2x2ZS5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcmVzb2x2ZWQgdmFsdWUuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBvYmplY3QgPSB7XG4gICAgICogICAnY2hlZXNlJzogJ2NydW1wZXRzJyxcbiAgICAgKiAgICdzdHVmZic6IGZ1bmN0aW9uKCkge1xuICAgICAqICAgICByZXR1cm4gJ25vbnNlbnNlJztcbiAgICAgKiAgIH1cbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy5yZXN1bHQob2JqZWN0LCAnY2hlZXNlJyk7XG4gICAgICogLy8gPT4gJ2NydW1wZXRzJ1xuICAgICAqXG4gICAgICogXy5yZXN1bHQob2JqZWN0LCAnc3R1ZmYnKTtcbiAgICAgKiAvLyA9PiAnbm9uc2Vuc2UnXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVzdWx0KG9iamVjdCwga2V5KSB7XG4gICAgICBpZiAob2JqZWN0KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IG9iamVjdFtrZXldO1xuICAgICAgICByZXR1cm4gaXNGdW5jdGlvbih2YWx1ZSkgPyBvYmplY3Rba2V5XSgpIDogdmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBtaWNyby10ZW1wbGF0aW5nIG1ldGhvZCB0aGF0IGhhbmRsZXMgYXJiaXRyYXJ5IGRlbGltaXRlcnMsIHByZXNlcnZlc1xuICAgICAqIHdoaXRlc3BhY2UsIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxuICAgICAqXG4gICAgICogTm90ZTogSW4gdGhlIGRldmVsb3BtZW50IGJ1aWxkLCBgXy50ZW1wbGF0ZWAgdXRpbGl6ZXMgc291cmNlVVJMcyBmb3IgZWFzaWVyXG4gICAgICogZGVidWdnaW5nLiBTZWUgaHR0cDovL3d3dy5odG1sNXJvY2tzLmNvbS9lbi90dXRvcmlhbHMvZGV2ZWxvcGVydG9vbHMvc291cmNlbWFwcy8jdG9jLXNvdXJjZXVybFxuICAgICAqXG4gICAgICogRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gcHJlY29tcGlsaW5nIHRlbXBsYXRlcyBzZWU6XG4gICAgICogaHR0cHM6Ly9sb2Rhc2guY29tL2N1c3RvbS1idWlsZHNcbiAgICAgKlxuICAgICAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIENocm9tZSBleHRlbnNpb24gc2FuZGJveGVzIHNlZTpcbiAgICAgKiBodHRwOi8vZGV2ZWxvcGVyLmNocm9tZS5jb20vc3RhYmxlL2V4dGVuc2lvbnMvc2FuZGJveGluZ0V2YWwuaHRtbFxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFRoZSB0ZW1wbGF0ZSB0ZXh0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIFRoZSBkYXRhIG9iamVjdCB1c2VkIHRvIHBvcHVsYXRlIHRoZSB0ZXh0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7UmVnRXhwfSBbb3B0aW9ucy5lc2NhcGVdIFRoZSBcImVzY2FwZVwiIGRlbGltaXRlci5cbiAgICAgKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuZXZhbHVhdGVdIFRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy5pbXBvcnRzXSBBbiBvYmplY3QgdG8gaW1wb3J0IGludG8gdGhlIHRlbXBsYXRlIGFzIGxvY2FsIHZhcmlhYmxlcy5cbiAgICAgKiBAcGFyYW0ge1JlZ0V4cH0gW29wdGlvbnMuaW50ZXJwb2xhdGVdIFRoZSBcImludGVycG9sYXRlXCIgZGVsaW1pdGVyLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc291cmNlVVJMXSBUaGUgc291cmNlVVJMIG9mIHRoZSB0ZW1wbGF0ZSdzIGNvbXBpbGVkIHNvdXJjZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3ZhcmlhYmxlXSBUaGUgZGF0YSBvYmplY3QgdmFyaWFibGUgbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb258c3RyaW5nfSBSZXR1cm5zIGEgY29tcGlsZWQgZnVuY3Rpb24gd2hlbiBubyBgZGF0YWAgb2JqZWN0XG4gICAgICogIGlzIGdpdmVuLCBlbHNlIGl0IHJldHVybnMgdGhlIGludGVycG9sYXRlZCB0ZXh0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyB0aGUgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlciB0byBjcmVhdGUgYSBjb21waWxlZCB0ZW1wbGF0ZVxuICAgICAqIHZhciBjb21waWxlZCA9IF8udGVtcGxhdGUoJ2hlbGxvIDwlPSBuYW1lICU+Jyk7XG4gICAgICogY29tcGlsZWQoeyAnbmFtZSc6ICdmcmVkJyB9KTtcbiAgICAgKiAvLyA9PiAnaGVsbG8gZnJlZCdcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIHRoZSBcImVzY2FwZVwiIGRlbGltaXRlciB0byBlc2NhcGUgSFRNTCBpbiBkYXRhIHByb3BlcnR5IHZhbHVlc1xuICAgICAqIF8udGVtcGxhdGUoJzxiPjwlLSB2YWx1ZSAlPjwvYj4nLCB7ICd2YWx1ZSc6ICc8c2NyaXB0PicgfSk7XG4gICAgICogLy8gPT4gJzxiPiZsdDtzY3JpcHQmZ3Q7PC9iPidcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIHRoZSBcImV2YWx1YXRlXCIgZGVsaW1pdGVyIHRvIGdlbmVyYXRlIEhUTUxcbiAgICAgKiB2YXIgbGlzdCA9ICc8JSBfLmZvckVhY2gocGVvcGxlLCBmdW5jdGlvbihuYW1lKSB7ICU+PGxpPjwlLSBuYW1lICU+PC9saT48JSB9KTsgJT4nO1xuICAgICAqIF8udGVtcGxhdGUobGlzdCwgeyAncGVvcGxlJzogWydmcmVkJywgJ2Jhcm5leSddIH0pO1xuICAgICAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgdGhlIEVTNiBkZWxpbWl0ZXIgYXMgYW4gYWx0ZXJuYXRpdmUgdG8gdGhlIGRlZmF1bHQgXCJpbnRlcnBvbGF0ZVwiIGRlbGltaXRlclxuICAgICAqIF8udGVtcGxhdGUoJ2hlbGxvICR7IG5hbWUgfScsIHsgJ25hbWUnOiAncGViYmxlcycgfSk7XG4gICAgICogLy8gPT4gJ2hlbGxvIHBlYmJsZXMnXG4gICAgICpcbiAgICAgKiAvLyB1c2luZyB0aGUgaW50ZXJuYWwgYHByaW50YCBmdW5jdGlvbiBpbiBcImV2YWx1YXRlXCIgZGVsaW1pdGVyc1xuICAgICAqIF8udGVtcGxhdGUoJzwlIHByaW50KFwiaGVsbG8gXCIgKyBuYW1lKTsgJT4hJywgeyAnbmFtZSc6ICdiYXJuZXknIH0pO1xuICAgICAqIC8vID0+ICdoZWxsbyBiYXJuZXkhJ1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgYSBjdXN0b20gdGVtcGxhdGUgZGVsaW1pdGVyc1xuICAgICAqIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcbiAgICAgKiAgICdpbnRlcnBvbGF0ZSc6IC97eyhbXFxzXFxTXSs/KX19L2dcbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogXy50ZW1wbGF0ZSgnaGVsbG8ge3sgbmFtZSB9fSEnLCB7ICduYW1lJzogJ211c3RhY2hlJyB9KTtcbiAgICAgKiAvLyA9PiAnaGVsbG8gbXVzdGFjaGUhJ1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgdGhlIGBpbXBvcnRzYCBvcHRpb24gdG8gaW1wb3J0IGpRdWVyeVxuICAgICAqIHZhciBsaXN0ID0gJzwlIGpxLmVhY2gocGVvcGxlLCBmdW5jdGlvbihuYW1lKSB7ICU+PGxpPjwlLSBuYW1lICU+PC9saT48JSB9KTsgJT4nO1xuICAgICAqIF8udGVtcGxhdGUobGlzdCwgeyAncGVvcGxlJzogWydmcmVkJywgJ2Jhcm5leSddIH0sIHsgJ2ltcG9ydHMnOiB7ICdqcSc6IGpRdWVyeSB9IH0pO1xuICAgICAqIC8vID0+ICc8bGk+ZnJlZDwvbGk+PGxpPmJhcm5leTwvbGk+J1xuICAgICAqXG4gICAgICogLy8gdXNpbmcgdGhlIGBzb3VyY2VVUkxgIG9wdGlvbiB0byBzcGVjaWZ5IGEgY3VzdG9tIHNvdXJjZVVSTCBmb3IgdGhlIHRlbXBsYXRlXG4gICAgICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGVsbG8gPCU9IG5hbWUgJT4nLCBudWxsLCB7ICdzb3VyY2VVUkwnOiAnL2Jhc2ljL2dyZWV0aW5nLmpzdCcgfSk7XG4gICAgICogY29tcGlsZWQoZGF0YSk7XG4gICAgICogLy8gPT4gZmluZCB0aGUgc291cmNlIG9mIFwiZ3JlZXRpbmcuanN0XCIgdW5kZXIgdGhlIFNvdXJjZXMgdGFiIG9yIFJlc291cmNlcyBwYW5lbCBvZiB0aGUgd2ViIGluc3BlY3RvclxuICAgICAqXG4gICAgICogLy8gdXNpbmcgdGhlIGB2YXJpYWJsZWAgb3B0aW9uIHRvIGVuc3VyZSBhIHdpdGgtc3RhdGVtZW50IGlzbid0IHVzZWQgaW4gdGhlIGNvbXBpbGVkIHRlbXBsYXRlXG4gICAgICogdmFyIGNvbXBpbGVkID0gXy50ZW1wbGF0ZSgnaGkgPCU9IGRhdGEubmFtZSAlPiEnLCBudWxsLCB7ICd2YXJpYWJsZSc6ICdkYXRhJyB9KTtcbiAgICAgKiBjb21waWxlZC5zb3VyY2U7XG4gICAgICogLy8gPT4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAqICAgdmFyIF9fdCwgX19wID0gJycsIF9fZSA9IF8uZXNjYXBlO1xuICAgICAqICAgX19wICs9ICdoaSAnICsgKChfX3QgPSAoIGRhdGEubmFtZSApKSA9PSBudWxsID8gJycgOiBfX3QpICsgJyEnO1xuICAgICAqICAgcmV0dXJuIF9fcDtcbiAgICAgKiB9XG4gICAgICpcbiAgICAgKiAvLyB1c2luZyB0aGUgYHNvdXJjZWAgcHJvcGVydHkgdG8gaW5saW5lIGNvbXBpbGVkIHRlbXBsYXRlcyBmb3IgbWVhbmluZ2Z1bFxuICAgICAqIC8vIGxpbmUgbnVtYmVycyBpbiBlcnJvciBtZXNzYWdlcyBhbmQgYSBzdGFjayB0cmFjZVxuICAgICAqIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKGN3ZCwgJ2pzdC5qcycpLCAnXFxcbiAgICAgKiAgIHZhciBKU1QgPSB7XFxcbiAgICAgKiAgICAgXCJtYWluXCI6ICcgKyBfLnRlbXBsYXRlKG1haW5UZXh0KS5zb3VyY2UgKyAnXFxcbiAgICAgKiAgIH07XFxcbiAgICAgKiAnKTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0ZW1wbGF0ZSh0ZXh0LCBkYXRhLCBvcHRpb25zKSB7XG4gICAgICAvLyBiYXNlZCBvbiBKb2huIFJlc2lnJ3MgYHRtcGxgIGltcGxlbWVudGF0aW9uXG4gICAgICAvLyBodHRwOi8vZWpvaG4ub3JnL2Jsb2cvamF2YXNjcmlwdC1taWNyby10ZW1wbGF0aW5nL1xuICAgICAgLy8gYW5kIExhdXJhIERva3Rvcm92YSdzIGRvVC5qc1xuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL29sYWRvL2RvVFxuICAgICAgdmFyIHNldHRpbmdzID0gbG9kYXNoLnRlbXBsYXRlU2V0dGluZ3M7XG4gICAgICB0ZXh0ID0gU3RyaW5nKHRleHQgfHwgJycpO1xuXG4gICAgICAvLyBhdm9pZCBtaXNzaW5nIGRlcGVuZGVuY2llcyB3aGVuIGBpdGVyYXRvclRlbXBsYXRlYCBpcyBub3QgZGVmaW5lZFxuICAgICAgb3B0aW9ucyA9IGRlZmF1bHRzKHt9LCBvcHRpb25zLCBzZXR0aW5ncyk7XG5cbiAgICAgIHZhciBpbXBvcnRzID0gZGVmYXVsdHMoe30sIG9wdGlvbnMuaW1wb3J0cywgc2V0dGluZ3MuaW1wb3J0cyksXG4gICAgICAgICAgaW1wb3J0c0tleXMgPSBrZXlzKGltcG9ydHMpLFxuICAgICAgICAgIGltcG9ydHNWYWx1ZXMgPSB2YWx1ZXMoaW1wb3J0cyk7XG5cbiAgICAgIHZhciBpc0V2YWx1YXRpbmcsXG4gICAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICAgIGludGVycG9sYXRlID0gb3B0aW9ucy5pbnRlcnBvbGF0ZSB8fCByZU5vTWF0Y2gsXG4gICAgICAgICAgc291cmNlID0gXCJfX3AgKz0gJ1wiO1xuXG4gICAgICAvLyBjb21waWxlIHRoZSByZWdleHAgdG8gbWF0Y2ggZWFjaCBkZWxpbWl0ZXJcbiAgICAgIHZhciByZURlbGltaXRlcnMgPSBSZWdFeHAoXG4gICAgICAgIChvcHRpb25zLmVzY2FwZSB8fCByZU5vTWF0Y2gpLnNvdXJjZSArICd8JyArXG4gICAgICAgIGludGVycG9sYXRlLnNvdXJjZSArICd8JyArXG4gICAgICAgIChpbnRlcnBvbGF0ZSA9PT0gcmVJbnRlcnBvbGF0ZSA/IHJlRXNUZW1wbGF0ZSA6IHJlTm9NYXRjaCkuc291cmNlICsgJ3wnICtcbiAgICAgICAgKG9wdGlvbnMuZXZhbHVhdGUgfHwgcmVOb01hdGNoKS5zb3VyY2UgKyAnfCQnXG4gICAgICAsICdnJyk7XG5cbiAgICAgIHRleHQucmVwbGFjZShyZURlbGltaXRlcnMsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGVWYWx1ZSwgaW50ZXJwb2xhdGVWYWx1ZSwgZXNUZW1wbGF0ZVZhbHVlLCBldmFsdWF0ZVZhbHVlLCBvZmZzZXQpIHtcbiAgICAgICAgaW50ZXJwb2xhdGVWYWx1ZSB8fCAoaW50ZXJwb2xhdGVWYWx1ZSA9IGVzVGVtcGxhdGVWYWx1ZSk7XG5cbiAgICAgICAgLy8gZXNjYXBlIGNoYXJhY3RlcnMgdGhhdCBjYW5ub3QgYmUgaW5jbHVkZWQgaW4gc3RyaW5nIGxpdGVyYWxzXG4gICAgICAgIHNvdXJjZSArPSB0ZXh0LnNsaWNlKGluZGV4LCBvZmZzZXQpLnJlcGxhY2UocmVVbmVzY2FwZWRTdHJpbmcsIGVzY2FwZVN0cmluZ0NoYXIpO1xuXG4gICAgICAgIC8vIHJlcGxhY2UgZGVsaW1pdGVycyB3aXRoIHNuaXBwZXRzXG4gICAgICAgIGlmIChlc2NhcGVWYWx1ZSkge1xuICAgICAgICAgIHNvdXJjZSArPSBcIicgK1xcbl9fZShcIiArIGVzY2FwZVZhbHVlICsgXCIpICtcXG4nXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2YWx1YXRlVmFsdWUpIHtcbiAgICAgICAgICBpc0V2YWx1YXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHNvdXJjZSArPSBcIic7XFxuXCIgKyBldmFsdWF0ZVZhbHVlICsgXCI7XFxuX19wICs9ICdcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW50ZXJwb2xhdGVWYWx1ZSkge1xuICAgICAgICAgIHNvdXJjZSArPSBcIicgK1xcbigoX190ID0gKFwiICsgaW50ZXJwb2xhdGVWYWx1ZSArIFwiKSkgPT0gbnVsbCA/ICcnIDogX190KSArXFxuJ1wiO1xuICAgICAgICB9XG4gICAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgICAgIC8vIHRoZSBKUyBlbmdpbmUgZW1iZWRkZWQgaW4gQWRvYmUgcHJvZHVjdHMgcmVxdWlyZXMgcmV0dXJuaW5nIHRoZSBgbWF0Y2hgXG4gICAgICAgIC8vIHN0cmluZyBpbiBvcmRlciB0byBwcm9kdWNlIHRoZSBjb3JyZWN0IGBvZmZzZXRgIHZhbHVlXG4gICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgIH0pO1xuXG4gICAgICBzb3VyY2UgKz0gXCInO1xcblwiO1xuXG4gICAgICAvLyBpZiBgdmFyaWFibGVgIGlzIG5vdCBzcGVjaWZpZWQsIHdyYXAgYSB3aXRoLXN0YXRlbWVudCBhcm91bmQgdGhlIGdlbmVyYXRlZFxuICAgICAgLy8gY29kZSB0byBhZGQgdGhlIGRhdGEgb2JqZWN0IHRvIHRoZSB0b3Agb2YgdGhlIHNjb3BlIGNoYWluXG4gICAgICB2YXIgdmFyaWFibGUgPSBvcHRpb25zLnZhcmlhYmxlLFxuICAgICAgICAgIGhhc1ZhcmlhYmxlID0gdmFyaWFibGU7XG5cbiAgICAgIGlmICghaGFzVmFyaWFibGUpIHtcbiAgICAgICAgdmFyaWFibGUgPSAnb2JqJztcbiAgICAgICAgc291cmNlID0gJ3dpdGggKCcgKyB2YXJpYWJsZSArICcpIHtcXG4nICsgc291cmNlICsgJ1xcbn1cXG4nO1xuICAgICAgfVxuICAgICAgLy8gY2xlYW51cCBjb2RlIGJ5IHN0cmlwcGluZyBlbXB0eSBzdHJpbmdzXG4gICAgICBzb3VyY2UgPSAoaXNFdmFsdWF0aW5nID8gc291cmNlLnJlcGxhY2UocmVFbXB0eVN0cmluZ0xlYWRpbmcsICcnKSA6IHNvdXJjZSlcbiAgICAgICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ01pZGRsZSwgJyQxJylcbiAgICAgICAgLnJlcGxhY2UocmVFbXB0eVN0cmluZ1RyYWlsaW5nLCAnJDE7Jyk7XG5cbiAgICAgIC8vIGZyYW1lIGNvZGUgYXMgdGhlIGZ1bmN0aW9uIGJvZHlcbiAgICAgIHNvdXJjZSA9ICdmdW5jdGlvbignICsgdmFyaWFibGUgKyAnKSB7XFxuJyArXG4gICAgICAgIChoYXNWYXJpYWJsZSA/ICcnIDogdmFyaWFibGUgKyAnIHx8ICgnICsgdmFyaWFibGUgKyAnID0ge30pO1xcbicpICtcbiAgICAgICAgXCJ2YXIgX190LCBfX3AgPSAnJywgX19lID0gXy5lc2NhcGVcIiArXG4gICAgICAgIChpc0V2YWx1YXRpbmdcbiAgICAgICAgICA/ICcsIF9faiA9IEFycmF5LnByb3RvdHlwZS5qb2luO1xcbicgK1xuICAgICAgICAgICAgXCJmdW5jdGlvbiBwcmludCgpIHsgX19wICs9IF9fai5jYWxsKGFyZ3VtZW50cywgJycpIH1cXG5cIlxuICAgICAgICAgIDogJztcXG4nXG4gICAgICAgICkgK1xuICAgICAgICBzb3VyY2UgK1xuICAgICAgICAncmV0dXJuIF9fcFxcbn0nO1xuXG4gICAgICAvLyBVc2UgYSBzb3VyY2VVUkwgZm9yIGVhc2llciBkZWJ1Z2dpbmcuXG4gICAgICAvLyBodHRwOi8vd3d3Lmh0bWw1cm9ja3MuY29tL2VuL3R1dG9yaWFscy9kZXZlbG9wZXJ0b29scy9zb3VyY2VtYXBzLyN0b2Mtc291cmNldXJsXG4gICAgICB2YXIgc291cmNlVVJMID0gJ1xcbi8qXFxuLy8jIHNvdXJjZVVSTD0nICsgKG9wdGlvbnMuc291cmNlVVJMIHx8ICcvbG9kYXNoL3RlbXBsYXRlL3NvdXJjZVsnICsgKHRlbXBsYXRlQ291bnRlcisrKSArICddJykgKyAnXFxuKi8nO1xuXG4gICAgICB0cnkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gRnVuY3Rpb24oaW1wb3J0c0tleXMsICdyZXR1cm4gJyArIHNvdXJjZSArIHNvdXJjZVVSTCkuYXBwbHkodW5kZWZpbmVkLCBpbXBvcnRzVmFsdWVzKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBlLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQoZGF0YSk7XG4gICAgICB9XG4gICAgICAvLyBwcm92aWRlIHRoZSBjb21waWxlZCBmdW5jdGlvbidzIHNvdXJjZSBieSBpdHMgYHRvU3RyaW5nYCBtZXRob2QsIGluXG4gICAgICAvLyBzdXBwb3J0ZWQgZW52aXJvbm1lbnRzLCBvciB0aGUgYHNvdXJjZWAgcHJvcGVydHkgYXMgYSBjb252ZW5pZW5jZSBmb3JcbiAgICAgIC8vIGlubGluaW5nIGNvbXBpbGVkIHRlbXBsYXRlcyBkdXJpbmcgdGhlIGJ1aWxkIHByb2Nlc3NcbiAgICAgIHJlc3VsdC5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBjYWxsYmFjayBgbmAgdGltZXMsIHJldHVybmluZyBhbiBhcnJheSBvZiB0aGUgcmVzdWx0c1xuICAgICAqIG9mIGVhY2ggY2FsbGJhY2sgZXhlY3V0aW9uLiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkXG4gICAgICogd2l0aCBvbmUgYXJndW1lbnQ7IChpbmRleCkuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0byBleGVjdXRlIHRoZSBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gY2FsbGVkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGFuIGFycmF5IG9mIHRoZSByZXN1bHRzIG9mIGVhY2ggYGNhbGxiYWNrYCBleGVjdXRpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBkaWNlUm9sbHMgPSBfLnRpbWVzKDMsIF8ucGFydGlhbChfLnJhbmRvbSwgMSwgNikpO1xuICAgICAqIC8vID0+IFszLCA2LCA0XVxuICAgICAqXG4gICAgICogXy50aW1lcygzLCBmdW5jdGlvbihuKSB7IG1hZ2UuY2FzdFNwZWxsKG4pOyB9KTtcbiAgICAgKiAvLyA9PiBjYWxscyBgbWFnZS5jYXN0U3BlbGwobilgIHRocmVlIHRpbWVzLCBwYXNzaW5nIGBuYCBvZiBgMGAsIGAxYCwgYW5kIGAyYCByZXNwZWN0aXZlbHlcbiAgICAgKlxuICAgICAqIF8udGltZXMoMywgZnVuY3Rpb24obikgeyB0aGlzLmNhc3Qobik7IH0sIG1hZ2UpO1xuICAgICAqIC8vID0+IGFsc28gY2FsbHMgYG1hZ2UuY2FzdFNwZWxsKG4pYCB0aHJlZSB0aW1lc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRpbWVzKG4sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICBuID0gKG4gPSArbikgPiAtMSA/IG4gOiAwO1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgcmVzdWx0ID0gQXJyYXkobik7XG5cbiAgICAgIGNhbGxiYWNrID0gYmFzZUNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAxKTtcbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gY2FsbGJhY2soaW5kZXgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgaW52ZXJzZSBvZiBgXy5lc2NhcGVgIHRoaXMgbWV0aG9kIGNvbnZlcnRzIHRoZSBIVE1MIGVudGl0aWVzXG4gICAgICogYCZhbXA7YCwgYCZsdDtgLCBgJmd0O2AsIGAmcXVvdDtgLCBhbmQgYCYjMzk7YCBpbiBgc3RyaW5nYCB0byB0aGVpclxuICAgICAqIGNvcnJlc3BvbmRpbmcgY2hhcmFjdGVycy5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBVdGlsaXRpZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIFRoZSBzdHJpbmcgdG8gdW5lc2NhcGUuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgdW5lc2NhcGVkIHN0cmluZy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy51bmVzY2FwZSgnRnJlZCwgQmFybmV5ICZhbXA7IFBlYmJsZXMnKTtcbiAgICAgKiAvLyA9PiAnRnJlZCwgQmFybmV5ICYgUGViYmxlcydcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1bmVzY2FwZShzdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcgPT0gbnVsbCA/ICcnIDogU3RyaW5nKHN0cmluZykucmVwbGFjZShyZUVzY2FwZWRIdG1sLCB1bmVzY2FwZUh0bWxDaGFyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZXMgYSB1bmlxdWUgSUQuIElmIGBwcmVmaXhgIGlzIHByb3ZpZGVkIHRoZSBJRCB3aWxsIGJlIGFwcGVuZGVkIHRvIGl0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IFV0aWxpdGllc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcHJlZml4XSBUaGUgdmFsdWUgdG8gcHJlZml4IHRoZSBJRCB3aXRoLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHVuaXF1ZSBJRC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy51bmlxdWVJZCgnY29udGFjdF8nKTtcbiAgICAgKiAvLyA9PiAnY29udGFjdF8xMDQnXG4gICAgICpcbiAgICAgKiBfLnVuaXF1ZUlkKCk7XG4gICAgICogLy8gPT4gJzEwNSdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1bmlxdWVJZChwcmVmaXgpIHtcbiAgICAgIHZhciBpZCA9ICsraWRDb3VudGVyO1xuICAgICAgcmV0dXJuIFN0cmluZyhwcmVmaXggPT0gbnVsbCA/ICcnIDogcHJlZml4KSArIGlkO1xuICAgIH1cblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGBsb2Rhc2hgIG9iamVjdCB0aGF0IHdyYXBzIHRoZSBnaXZlbiB2YWx1ZSB3aXRoIGV4cGxpY2l0XG4gICAgICogbWV0aG9kIGNoYWluaW5nIGVuYWJsZWQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ2hhaW5pbmdcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byB3cmFwLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIHdyYXBwZXIgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgICdhZ2UnOiAzNiB9LFxuICAgICAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAgJ2FnZSc6IDQwIH0sXG4gICAgICogICB7ICduYW1lJzogJ3BlYmJsZXMnLCAnYWdlJzogMSB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIHZhciB5b3VuZ2VzdCA9IF8uY2hhaW4oY2hhcmFjdGVycylcbiAgICAgKiAgICAgLnNvcnRCeSgnYWdlJylcbiAgICAgKiAgICAgLm1hcChmdW5jdGlvbihjaHIpIHsgcmV0dXJuIGNoci5uYW1lICsgJyBpcyAnICsgY2hyLmFnZTsgfSlcbiAgICAgKiAgICAgLmZpcnN0KClcbiAgICAgKiAgICAgLnZhbHVlKCk7XG4gICAgICogLy8gPT4gJ3BlYmJsZXMgaXMgMSdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjaGFpbih2YWx1ZSkge1xuICAgICAgdmFsdWUgPSBuZXcgbG9kYXNoV3JhcHBlcih2YWx1ZSk7XG4gICAgICB2YWx1ZS5fX2NoYWluX18gPSB0cnVlO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludm9rZXMgYGludGVyY2VwdG9yYCB3aXRoIHRoZSBgdmFsdWVgIGFzIHRoZSBmaXJzdCBhcmd1bWVudCBhbmQgdGhlblxuICAgICAqIHJldHVybnMgYHZhbHVlYC4gVGhlIHB1cnBvc2Ugb2YgdGhpcyBtZXRob2QgaXMgdG8gXCJ0YXAgaW50b1wiIGEgbWV0aG9kXG4gICAgICogY2hhaW4gaW4gb3JkZXIgdG8gcGVyZm9ybSBvcGVyYXRpb25zIG9uIGludGVybWVkaWF0ZSByZXN1bHRzIHdpdGhpblxuICAgICAqIHRoZSBjaGFpbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBDaGFpbmluZ1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb3ZpZGUgdG8gYGludGVyY2VwdG9yYC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpbnRlcmNlcHRvciBUaGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8oWzEsIDIsIDMsIDRdKVxuICAgICAqICAudGFwKGZ1bmN0aW9uKGFycmF5KSB7IGFycmF5LnBvcCgpOyB9KVxuICAgICAqICAucmV2ZXJzZSgpXG4gICAgICogIC52YWx1ZSgpO1xuICAgICAqIC8vID0+IFszLCAyLCAxXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRhcCh2YWx1ZSwgaW50ZXJjZXB0b3IpIHtcbiAgICAgIGludGVyY2VwdG9yKHZhbHVlKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmFibGVzIGV4cGxpY2l0IG1ldGhvZCBjaGFpbmluZyBvbiB0aGUgd3JhcHBlciBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAbmFtZSBjaGFpblxuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IENoYWluaW5nXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHdyYXBwZXIgb2JqZWN0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAgICAgKiAgIHsgJ25hbWUnOiAnYmFybmV5JywgJ2FnZSc6IDM2IH0sXG4gICAgICogICB7ICduYW1lJzogJ2ZyZWQnLCAgICdhZ2UnOiA0MCB9XG4gICAgICogXTtcbiAgICAgKlxuICAgICAqIC8vIHdpdGhvdXQgZXhwbGljaXQgY2hhaW5pbmdcbiAgICAgKiBfKGNoYXJhY3RlcnMpLmZpcnN0KCk7XG4gICAgICogLy8gPT4geyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfVxuICAgICAqXG4gICAgICogLy8gd2l0aCBleHBsaWNpdCBjaGFpbmluZ1xuICAgICAqIF8oY2hhcmFjdGVycykuY2hhaW4oKVxuICAgICAqICAgLmZpcnN0KClcbiAgICAgKiAgIC5waWNrKCdhZ2UnKVxuICAgICAqICAgLnZhbHVlKCk7XG4gICAgICogLy8gPT4geyAnYWdlJzogMzYgfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHdyYXBwZXJDaGFpbigpIHtcbiAgICAgIHRoaXMuX19jaGFpbl9fID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByb2R1Y2VzIHRoZSBgdG9TdHJpbmdgIHJlc3VsdCBvZiB0aGUgd3JhcHBlZCB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBuYW1lIHRvU3RyaW5nXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgQ2hhaW5pbmdcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzdHJpbmcgcmVzdWx0LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfKFsxLCAyLCAzXSkudG9TdHJpbmcoKTtcbiAgICAgKiAvLyA9PiAnMSwyLDMnXG4gICAgICovXG4gICAgZnVuY3Rpb24gd3JhcHBlclRvU3RyaW5nKCkge1xuICAgICAgcmV0dXJuIFN0cmluZyh0aGlzLl9fd3JhcHBlZF9fKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeHRyYWN0cyB0aGUgd3JhcHBlZCB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEBuYW1lIHZhbHVlT2ZcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBhbGlhcyB2YWx1ZVxuICAgICAqIEBjYXRlZ29yeSBDaGFpbmluZ1xuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSB3cmFwcGVkIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfKFsxLCAyLCAzXSkudmFsdWVPZigpO1xuICAgICAqIC8vID0+IFsxLCAyLCAzXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHdyYXBwZXJWYWx1ZU9mKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX193cmFwcGVkX187XG4gICAgfVxuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvLyBhZGQgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIHdyYXBwZWQgdmFsdWVzIHdoZW4gY2hhaW5pbmdcbiAgICBsb2Rhc2guYWZ0ZXIgPSBhZnRlcjtcbiAgICBsb2Rhc2guYXNzaWduID0gYXNzaWduO1xuICAgIGxvZGFzaC5hdCA9IGF0O1xuICAgIGxvZGFzaC5iaW5kID0gYmluZDtcbiAgICBsb2Rhc2guYmluZEFsbCA9IGJpbmRBbGw7XG4gICAgbG9kYXNoLmJpbmRLZXkgPSBiaW5kS2V5O1xuICAgIGxvZGFzaC5jaGFpbiA9IGNoYWluO1xuICAgIGxvZGFzaC5jb21wYWN0ID0gY29tcGFjdDtcbiAgICBsb2Rhc2guY29tcG9zZSA9IGNvbXBvc2U7XG4gICAgbG9kYXNoLmNvbnN0YW50ID0gY29uc3RhbnQ7XG4gICAgbG9kYXNoLmNvdW50QnkgPSBjb3VudEJ5O1xuICAgIGxvZGFzaC5jcmVhdGUgPSBjcmVhdGU7XG4gICAgbG9kYXNoLmNyZWF0ZUNhbGxiYWNrID0gY3JlYXRlQ2FsbGJhY2s7XG4gICAgbG9kYXNoLmN1cnJ5ID0gY3Vycnk7XG4gICAgbG9kYXNoLmRlYm91bmNlID0gZGVib3VuY2U7XG4gICAgbG9kYXNoLmRlZmF1bHRzID0gZGVmYXVsdHM7XG4gICAgbG9kYXNoLmRlZmVyID0gZGVmZXI7XG4gICAgbG9kYXNoLmRlbGF5ID0gZGVsYXk7XG4gICAgbG9kYXNoLmRpZmZlcmVuY2UgPSBkaWZmZXJlbmNlO1xuICAgIGxvZGFzaC5maWx0ZXIgPSBmaWx0ZXI7XG4gICAgbG9kYXNoLmZsYXR0ZW4gPSBmbGF0dGVuO1xuICAgIGxvZGFzaC5mb3JFYWNoID0gZm9yRWFjaDtcbiAgICBsb2Rhc2guZm9yRWFjaFJpZ2h0ID0gZm9yRWFjaFJpZ2h0O1xuICAgIGxvZGFzaC5mb3JJbiA9IGZvckluO1xuICAgIGxvZGFzaC5mb3JJblJpZ2h0ID0gZm9ySW5SaWdodDtcbiAgICBsb2Rhc2guZm9yT3duID0gZm9yT3duO1xuICAgIGxvZGFzaC5mb3JPd25SaWdodCA9IGZvck93blJpZ2h0O1xuICAgIGxvZGFzaC5mdW5jdGlvbnMgPSBmdW5jdGlvbnM7XG4gICAgbG9kYXNoLmdyb3VwQnkgPSBncm91cEJ5O1xuICAgIGxvZGFzaC5pbmRleEJ5ID0gaW5kZXhCeTtcbiAgICBsb2Rhc2guaW5pdGlhbCA9IGluaXRpYWw7XG4gICAgbG9kYXNoLmludGVyc2VjdGlvbiA9IGludGVyc2VjdGlvbjtcbiAgICBsb2Rhc2guaW52ZXJ0ID0gaW52ZXJ0O1xuICAgIGxvZGFzaC5pbnZva2UgPSBpbnZva2U7XG4gICAgbG9kYXNoLmtleXMgPSBrZXlzO1xuICAgIGxvZGFzaC5tYXAgPSBtYXA7XG4gICAgbG9kYXNoLm1hcFZhbHVlcyA9IG1hcFZhbHVlcztcbiAgICBsb2Rhc2gubWF4ID0gbWF4O1xuICAgIGxvZGFzaC5tZW1vaXplID0gbWVtb2l6ZTtcbiAgICBsb2Rhc2gubWVyZ2UgPSBtZXJnZTtcbiAgICBsb2Rhc2gubWluID0gbWluO1xuICAgIGxvZGFzaC5vbWl0ID0gb21pdDtcbiAgICBsb2Rhc2gub25jZSA9IG9uY2U7XG4gICAgbG9kYXNoLnBhaXJzID0gcGFpcnM7XG4gICAgbG9kYXNoLnBhcnRpYWwgPSBwYXJ0aWFsO1xuICAgIGxvZGFzaC5wYXJ0aWFsUmlnaHQgPSBwYXJ0aWFsUmlnaHQ7XG4gICAgbG9kYXNoLnBpY2sgPSBwaWNrO1xuICAgIGxvZGFzaC5wbHVjayA9IHBsdWNrO1xuICAgIGxvZGFzaC5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuICAgIGxvZGFzaC5wdWxsID0gcHVsbDtcbiAgICBsb2Rhc2gucmFuZ2UgPSByYW5nZTtcbiAgICBsb2Rhc2gucmVqZWN0ID0gcmVqZWN0O1xuICAgIGxvZGFzaC5yZW1vdmUgPSByZW1vdmU7XG4gICAgbG9kYXNoLnJlc3QgPSByZXN0O1xuICAgIGxvZGFzaC5zaHVmZmxlID0gc2h1ZmZsZTtcbiAgICBsb2Rhc2guc29ydEJ5ID0gc29ydEJ5O1xuICAgIGxvZGFzaC50YXAgPSB0YXA7XG4gICAgbG9kYXNoLnRocm90dGxlID0gdGhyb3R0bGU7XG4gICAgbG9kYXNoLnRpbWVzID0gdGltZXM7XG4gICAgbG9kYXNoLnRvQXJyYXkgPSB0b0FycmF5O1xuICAgIGxvZGFzaC50cmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG4gICAgbG9kYXNoLnVuaW9uID0gdW5pb247XG4gICAgbG9kYXNoLnVuaXEgPSB1bmlxO1xuICAgIGxvZGFzaC52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgbG9kYXNoLndoZXJlID0gd2hlcmU7XG4gICAgbG9kYXNoLndpdGhvdXQgPSB3aXRob3V0O1xuICAgIGxvZGFzaC53cmFwID0gd3JhcDtcbiAgICBsb2Rhc2gueG9yID0geG9yO1xuICAgIGxvZGFzaC56aXAgPSB6aXA7XG4gICAgbG9kYXNoLnppcE9iamVjdCA9IHppcE9iamVjdDtcblxuICAgIC8vIGFkZCBhbGlhc2VzXG4gICAgbG9kYXNoLmNvbGxlY3QgPSBtYXA7XG4gICAgbG9kYXNoLmRyb3AgPSByZXN0O1xuICAgIGxvZGFzaC5lYWNoID0gZm9yRWFjaDtcbiAgICBsb2Rhc2guZWFjaFJpZ2h0ID0gZm9yRWFjaFJpZ2h0O1xuICAgIGxvZGFzaC5leHRlbmQgPSBhc3NpZ247XG4gICAgbG9kYXNoLm1ldGhvZHMgPSBmdW5jdGlvbnM7XG4gICAgbG9kYXNoLm9iamVjdCA9IHppcE9iamVjdDtcbiAgICBsb2Rhc2guc2VsZWN0ID0gZmlsdGVyO1xuICAgIGxvZGFzaC50YWlsID0gcmVzdDtcbiAgICBsb2Rhc2gudW5pcXVlID0gdW5pcTtcbiAgICBsb2Rhc2gudW56aXAgPSB6aXA7XG5cbiAgICAvLyBhZGQgZnVuY3Rpb25zIHRvIGBsb2Rhc2gucHJvdG90eXBlYFxuICAgIG1peGluKGxvZGFzaCk7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIC8vIGFkZCBmdW5jdGlvbnMgdGhhdCByZXR1cm4gdW53cmFwcGVkIHZhbHVlcyB3aGVuIGNoYWluaW5nXG4gICAgbG9kYXNoLmNsb25lID0gY2xvbmU7XG4gICAgbG9kYXNoLmNsb25lRGVlcCA9IGNsb25lRGVlcDtcbiAgICBsb2Rhc2guY29udGFpbnMgPSBjb250YWlucztcbiAgICBsb2Rhc2guZXNjYXBlID0gZXNjYXBlO1xuICAgIGxvZGFzaC5ldmVyeSA9IGV2ZXJ5O1xuICAgIGxvZGFzaC5maW5kID0gZmluZDtcbiAgICBsb2Rhc2guZmluZEluZGV4ID0gZmluZEluZGV4O1xuICAgIGxvZGFzaC5maW5kS2V5ID0gZmluZEtleTtcbiAgICBsb2Rhc2guZmluZExhc3QgPSBmaW5kTGFzdDtcbiAgICBsb2Rhc2guZmluZExhc3RJbmRleCA9IGZpbmRMYXN0SW5kZXg7XG4gICAgbG9kYXNoLmZpbmRMYXN0S2V5ID0gZmluZExhc3RLZXk7XG4gICAgbG9kYXNoLmhhcyA9IGhhcztcbiAgICBsb2Rhc2guaWRlbnRpdHkgPSBpZGVudGl0eTtcbiAgICBsb2Rhc2guaW5kZXhPZiA9IGluZGV4T2Y7XG4gICAgbG9kYXNoLmlzQXJndW1lbnRzID0gaXNBcmd1bWVudHM7XG4gICAgbG9kYXNoLmlzQXJyYXkgPSBpc0FycmF5O1xuICAgIGxvZGFzaC5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG4gICAgbG9kYXNoLmlzRGF0ZSA9IGlzRGF0ZTtcbiAgICBsb2Rhc2guaXNFbGVtZW50ID0gaXNFbGVtZW50O1xuICAgIGxvZGFzaC5pc0VtcHR5ID0gaXNFbXB0eTtcbiAgICBsb2Rhc2guaXNFcXVhbCA9IGlzRXF1YWw7XG4gICAgbG9kYXNoLmlzRmluaXRlID0gaXNGaW5pdGU7XG4gICAgbG9kYXNoLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuICAgIGxvZGFzaC5pc05hTiA9IGlzTmFOO1xuICAgIGxvZGFzaC5pc051bGwgPSBpc051bGw7XG4gICAgbG9kYXNoLmlzTnVtYmVyID0gaXNOdW1iZXI7XG4gICAgbG9kYXNoLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG4gICAgbG9kYXNoLmlzUGxhaW5PYmplY3QgPSBpc1BsYWluT2JqZWN0O1xuICAgIGxvZGFzaC5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuICAgIGxvZGFzaC5pc1N0cmluZyA9IGlzU3RyaW5nO1xuICAgIGxvZGFzaC5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuICAgIGxvZGFzaC5sYXN0SW5kZXhPZiA9IGxhc3RJbmRleE9mO1xuICAgIGxvZGFzaC5taXhpbiA9IG1peGluO1xuICAgIGxvZGFzaC5ub0NvbmZsaWN0ID0gbm9Db25mbGljdDtcbiAgICBsb2Rhc2gubm9vcCA9IG5vb3A7XG4gICAgbG9kYXNoLm5vdyA9IG5vdztcbiAgICBsb2Rhc2gucGFyc2VJbnQgPSBwYXJzZUludDtcbiAgICBsb2Rhc2gucmFuZG9tID0gcmFuZG9tO1xuICAgIGxvZGFzaC5yZWR1Y2UgPSByZWR1Y2U7XG4gICAgbG9kYXNoLnJlZHVjZVJpZ2h0ID0gcmVkdWNlUmlnaHQ7XG4gICAgbG9kYXNoLnJlc3VsdCA9IHJlc3VsdDtcbiAgICBsb2Rhc2gucnVuSW5Db250ZXh0ID0gcnVuSW5Db250ZXh0O1xuICAgIGxvZGFzaC5zaXplID0gc2l6ZTtcbiAgICBsb2Rhc2guc29tZSA9IHNvbWU7XG4gICAgbG9kYXNoLnNvcnRlZEluZGV4ID0gc29ydGVkSW5kZXg7XG4gICAgbG9kYXNoLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgbG9kYXNoLnVuZXNjYXBlID0gdW5lc2NhcGU7XG4gICAgbG9kYXNoLnVuaXF1ZUlkID0gdW5pcXVlSWQ7XG5cbiAgICAvLyBhZGQgYWxpYXNlc1xuICAgIGxvZGFzaC5hbGwgPSBldmVyeTtcbiAgICBsb2Rhc2guYW55ID0gc29tZTtcbiAgICBsb2Rhc2guZGV0ZWN0ID0gZmluZDtcbiAgICBsb2Rhc2guZmluZFdoZXJlID0gZmluZDtcbiAgICBsb2Rhc2guZm9sZGwgPSByZWR1Y2U7XG4gICAgbG9kYXNoLmZvbGRyID0gcmVkdWNlUmlnaHQ7XG4gICAgbG9kYXNoLmluY2x1ZGUgPSBjb250YWlucztcbiAgICBsb2Rhc2guaW5qZWN0ID0gcmVkdWNlO1xuXG4gICAgbWl4aW4oZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc291cmNlID0ge31cbiAgICAgIGZvck93bihsb2Rhc2gsIGZ1bmN0aW9uKGZ1bmMsIG1ldGhvZE5hbWUpIHtcbiAgICAgICAgaWYgKCFsb2Rhc2gucHJvdG90eXBlW21ldGhvZE5hbWVdKSB7XG4gICAgICAgICAgc291cmNlW21ldGhvZE5hbWVdID0gZnVuYztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gc291cmNlO1xuICAgIH0oKSwgZmFsc2UpO1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvLyBhZGQgZnVuY3Rpb25zIGNhcGFibGUgb2YgcmV0dXJuaW5nIHdyYXBwZWQgYW5kIHVud3JhcHBlZCB2YWx1ZXMgd2hlbiBjaGFpbmluZ1xuICAgIGxvZGFzaC5maXJzdCA9IGZpcnN0O1xuICAgIGxvZGFzaC5sYXN0ID0gbGFzdDtcbiAgICBsb2Rhc2guc2FtcGxlID0gc2FtcGxlO1xuXG4gICAgLy8gYWRkIGFsaWFzZXNcbiAgICBsb2Rhc2gudGFrZSA9IGZpcnN0O1xuICAgIGxvZGFzaC5oZWFkID0gZmlyc3Q7XG5cbiAgICBmb3JPd24obG9kYXNoLCBmdW5jdGlvbihmdW5jLCBtZXRob2ROYW1lKSB7XG4gICAgICB2YXIgY2FsbGJhY2thYmxlID0gbWV0aG9kTmFtZSAhPT0gJ3NhbXBsZSc7XG4gICAgICBpZiAoIWxvZGFzaC5wcm90b3R5cGVbbWV0aG9kTmFtZV0pIHtcbiAgICAgICAgbG9kYXNoLnByb3RvdHlwZVttZXRob2ROYW1lXT0gZnVuY3Rpb24obiwgZ3VhcmQpIHtcbiAgICAgICAgICB2YXIgY2hhaW5BbGwgPSB0aGlzLl9fY2hhaW5fXyxcbiAgICAgICAgICAgICAgcmVzdWx0ID0gZnVuYyh0aGlzLl9fd3JhcHBlZF9fLCBuLCBndWFyZCk7XG5cbiAgICAgICAgICByZXR1cm4gIWNoYWluQWxsICYmIChuID09IG51bGwgfHwgKGd1YXJkICYmICEoY2FsbGJhY2thYmxlICYmIHR5cGVvZiBuID09ICdmdW5jdGlvbicpKSlcbiAgICAgICAgICAgID8gcmVzdWx0XG4gICAgICAgICAgICA6IG5ldyBsb2Rhc2hXcmFwcGVyKHJlc3VsdCwgY2hhaW5BbGwpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2VtYW50aWMgdmVyc2lvbiBudW1iZXIuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgKi9cbiAgICBsb2Rhc2guVkVSU0lPTiA9ICcyLjQuMic7XG5cbiAgICAvLyBhZGQgXCJDaGFpbmluZ1wiIGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlclxuICAgIGxvZGFzaC5wcm90b3R5cGUuY2hhaW4gPSB3cmFwcGVyQ2hhaW47XG4gICAgbG9kYXNoLnByb3RvdHlwZS50b1N0cmluZyA9IHdyYXBwZXJUb1N0cmluZztcbiAgICBsb2Rhc2gucHJvdG90eXBlLnZhbHVlID0gd3JhcHBlclZhbHVlT2Y7XG4gICAgbG9kYXNoLnByb3RvdHlwZS52YWx1ZU9mID0gd3JhcHBlclZhbHVlT2Y7XG5cbiAgICAvLyBhZGQgYEFycmF5YCBmdW5jdGlvbnMgdGhhdCByZXR1cm4gdW53cmFwcGVkIHZhbHVlc1xuICAgIGZvckVhY2goWydqb2luJywgJ3BvcCcsICdzaGlmdCddLCBmdW5jdGlvbihtZXRob2ROYW1lKSB7XG4gICAgICB2YXIgZnVuYyA9IGFycmF5UmVmW21ldGhvZE5hbWVdO1xuICAgICAgbG9kYXNoLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2hhaW5BbGwgPSB0aGlzLl9fY2hhaW5fXyxcbiAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpcy5fX3dyYXBwZWRfXywgYXJndW1lbnRzKTtcblxuICAgICAgICByZXR1cm4gY2hhaW5BbGxcbiAgICAgICAgICA/IG5ldyBsb2Rhc2hXcmFwcGVyKHJlc3VsdCwgY2hhaW5BbGwpXG4gICAgICAgICAgOiByZXN1bHQ7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8gYWRkIGBBcnJheWAgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIHRoZSBleGlzdGluZyB3cmFwcGVkIHZhbHVlXG4gICAgZm9yRWFjaChbJ3B1c2gnLCAncmV2ZXJzZScsICdzb3J0JywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSBhcnJheVJlZlttZXRob2ROYW1lXTtcbiAgICAgIGxvZGFzaC5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZnVuYy5hcHBseSh0aGlzLl9fd3JhcHBlZF9fLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICAvLyBhZGQgYEFycmF5YCBmdW5jdGlvbnMgdGhhdCByZXR1cm4gbmV3IHdyYXBwZWQgdmFsdWVzXG4gICAgZm9yRWFjaChbJ2NvbmNhdCcsICdzbGljZScsICdzcGxpY2UnXSwgZnVuY3Rpb24obWV0aG9kTmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSBhcnJheVJlZlttZXRob2ROYW1lXTtcbiAgICAgIGxvZGFzaC5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBsb2Rhc2hXcmFwcGVyKGZ1bmMuYXBwbHkodGhpcy5fX3dyYXBwZWRfXywgYXJndW1lbnRzKSwgdGhpcy5fX2NoYWluX18pO1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiBsb2Rhc2g7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvLyBleHBvc2UgTG8tRGFzaFxuICB2YXIgXyA9IHJ1bkluQ29udGV4dCgpO1xuXG4gIC8vIHNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMgbGlrZSByLmpzIGNoZWNrIGZvciBjb25kaXRpb24gcGF0dGVybnMgbGlrZSB0aGUgZm9sbG93aW5nOlxuICBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBFeHBvc2UgTG8tRGFzaCB0byB0aGUgZ2xvYmFsIG9iamVjdCBldmVuIHdoZW4gYW4gQU1EIGxvYWRlciBpcyBwcmVzZW50IGluXG4gICAgLy8gY2FzZSBMby1EYXNoIGlzIGxvYWRlZCB3aXRoIGEgUmVxdWlyZUpTIHNoaW0gY29uZmlnLlxuICAgIC8vIFNlZSBodHRwOi8vcmVxdWlyZWpzLm9yZy9kb2NzL2FwaS5odG1sI2NvbmZpZy1zaGltXG4gICAgcm9vdC5fID0gXztcblxuICAgIC8vIGRlZmluZSBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlIHNvLCB0aHJvdWdoIHBhdGggbWFwcGluZywgaXQgY2FuIGJlXG4gICAgLy8gcmVmZXJlbmNlZCBhcyB0aGUgXCJ1bmRlcnNjb3JlXCIgbW9kdWxlXG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF87XG4gICAgfSk7XG4gIH1cbiAgLy8gY2hlY2sgZm9yIGBleHBvcnRzYCBhZnRlciBgZGVmaW5lYCBpbiBjYXNlIGEgYnVpbGQgb3B0aW1pemVyIGFkZHMgYW4gYGV4cG9ydHNgIG9iamVjdFxuICBlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiBmcmVlTW9kdWxlKSB7XG4gICAgLy8gaW4gTm9kZS5qcyBvciBSaW5nb0pTXG4gICAgaWYgKG1vZHVsZUV4cG9ydHMpIHtcbiAgICAgIChmcmVlTW9kdWxlLmV4cG9ydHMgPSBfKS5fID0gXztcbiAgICB9XG4gICAgLy8gaW4gTmFyd2hhbCBvciBSaGlubyAtcmVxdWlyZVxuICAgIGVsc2Uge1xuICAgICAgZnJlZUV4cG9ydHMuXyA9IF87XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIC8vIGluIGEgYnJvd3NlciBvciBSaGlub1xuICAgIHJvb3QuXyA9IF87XG4gIH1cbn0uY2FsbCh0aGlzKSk7XG4iLCIndXNlIHN0cmljdCc7XHJcbih0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LiQgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLiQgOiBudWxsKTtcclxuXHJcbnZhciBhbmd1bGFyID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuYW5ndWxhciA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuYW5ndWxhciA6IG51bGwpLFxyXG4gICAgYm9keWNsYXNzID0gcmVxdWlyZSgnLi9ib2R5Y2xhc3MuanMnKSxcclxuICAgIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscy5qcycpO1xyXG5cclxuLy8tLS0gQWRkIGFkZGl0aW9uYWwgYm9keSBjbGFzc2VzIGZvciBpbmRpdmlkdWFsaXplZCBDU1MgcnVsZXNcclxuYm9keWNsYXNzKCk7XHJcblxyXG4vLy0tLSBQaW1wIG9sZCBUd29kYXkgY2xhc3NlcywgZS5nLiBidXR0b24gaW4gYSAubWVzc2FnZVxyXG51dGlscy5waW1wQ2xhc3NlcygpO1xyXG5cclxuLy8tLS0gU2V0IHVwIHRoZSBBbmd1bGFyIGFwcCwgTW9kZXJuaXpyIGNvbnN0YW50IGFuZCBydW4gdGhlIEZhc3RDbGljayBqc1xyXG5hbmd1bGFyXHJcbiAgICAubW9kdWxlKCdmNVNraW5BcHAnLCBbJ21tLmZvdW5kYXRpb24nLCAnYW5ndWxhclNwZWN0cnVtQ29sb3JwaWNrZXInLCAndG9hc3RyJ10pXHJcbiAgICAuY29uZmlnKGZ1bmN0aW9uKHRvYXN0ckNvbmZpZyl7XHJcbiAgICAgICAgYW5ndWxhci5leHRlbmQodG9hc3RyQ29uZmlnLCB7XHJcbiAgICAgICAgICAgIGFsbG93SHRtbDogdHJ1ZSxcclxuICAgICAgICAgICAgY2xvc2VCdXR0b246IHRydWUsXHJcbiAgICAgICAgICAgIHByb2dyZXNzQmFyOiB0cnVlLFxyXG4gICAgICAgICAgICB0aW1lT3V0OiA1MDAwXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KVxyXG4gICAgLmNvbnN0YW50KCdNb2Rlcm5penInLCB3aW5kb3cuTW9kZXJuaXpyKVxyXG4gICAgLnJ1biggZnVuY3Rpb24oKXsgd2luZG93LkZhc3RDbGljay5hdHRhY2goZG9jdW1lbnQuYm9keSk7IH0pO1xyXG5cclxuLy8tLS0gUmVxdWlyZSBhbGwgc2VydmljZXMsIGNvbnRyb2xsZXJzIGFuZCBkaXJlY3RpdmVzIHRocm91Z2ggdGhlaXIgZm9sZGVyJ3MgaW5kZXguanNcclxucmVxdWlyZSgnLi9zZXJ2aWNlcycpO1xyXG5yZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XHJcbnJlcXVpcmUoJy4vZGlyZWN0aXZlcycpOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBTZXRzIHRoZSBhcHByb3ByaWF0ZSBiYWNrZ3JvdW5kIGltYWdlIGJhc2VkIG9uIHRoZSBhY3R1YWwgaG91ciBvZiB0aGUgZGF5IGFuZCB1c2VyIGRlZmluZWQgaW1hZ2UgaXRlbXMvc2xvdHNcclxuICpcclxuICovXHJcblxyXG5mdW5jdGlvbiBpc1Nsb3RJZGVudChhY3R1YWwsIHN0b3JlZCl7XHJcbiAgICByZXR1cm4gKHR5cGVvZiBzdG9yZWQgPT09IFwidW5kZWZpbmVkXCIgPyBmYWxzZSA6XHJcbiAgICAgICAgYWN0dWFsLmhyZWY9PT1zdG9yZWQuaHJlZiAmJiBhY3R1YWwucmVwZWF0PT09c3RvcmVkLnJlcGVhdCAmJiBhY3R1YWwucG9zaXRpb249PT1zdG9yZWQucG9zaXRpb24gJiYgYWN0dWFsLnNpemU9PT1zdG9yZWQuc2l6ZSAmJiBhY3R1YWwuYXR0YWNobWVudD09PXN0b3JlZC5hdHRhY2htZW50KTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblxyXG4gICAgc2V0SW1hZ2U6IGZ1bmN0aW9uKHRpbWVTbG90cyl7XHJcbiAgICAgICAgdmFyIGdldE1pbnV0ZSA9IGZ1bmN0aW9uKGRhdGUpeyByZXR1cm4gZGF0ZS5nZXRIb3VycygpKjYwK2RhdGUuZ2V0TWludXRlcygpOyB9O1xyXG4vLy0tLS0tIHJldHVybiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdXNlciBkZWZpbmVkIHRpbWUgc2xvdHMvaW1hZ2VzXHJcbiAgICAgICAgaWYgKHRpbWVTbG90cy5sZW5ndGg9PT0wKSByZXR1cm47XHJcbi8vLS0tLS0gZ2V0IHRoZSBjdXJyZW50IG1pbnV0ZSBvZiB0aGUgZGF5XHJcbiAgICAgICAgdmFyIGggPSBnZXRNaW51dGUobmV3IERhdGUoKSk7XHJcbi8vLS0tLS0gY2hlY2sgd2l0aCBlYWNoIHRpbWVzbG90IHRvIGZpbmQgdGhlIGFwcHJvcHJpYXRlIGVudHJ5XHJcbiAgICAgICAgJC5lYWNoKCB0aW1lU2xvdHMsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmIChoPj1nZXRNaW51dGUodGhpcy5mcm9tKSAmJiBoPD1nZXRNaW51dGUodGhpcy50bykpe1xyXG4gICAgICAgICAgICAgICAgdmFyICRib2R5ID0gJCgnYm9keScpO1xyXG4vLy0tLS0tLS0tLS0tLS0gZG8gbm90aGluZyBpZiB0aGlzIGJhY2tncm91bmQgaW1hZ2UgaGFzIGFscmVhZHkgYmVlbiBpbnN0YWxsZWQgYmVmb3JlIHdpdGggc2FtZSBwYXJhbXNcclxuICAgICAgICAgICAgICAgIGlmIChpc1Nsb3RJZGVudCh0aGlzLCAkYm9keS5kYXRhKCd0aW1lU2xvdCcpKSkgcmV0dXJuIGZhbHNlO1xyXG4vLy0tLS0tLS0tLS0tLS0gb25jZSB0aW1lc2xvdCB3YXMgZm91bmQgYW5kIG5lZWRzIHRvIGJlIGluc3RhbGxlZCwgdGhlbiBwcmVsb2FkL2NhY2hlIHRoZSBpbWFnZVxyXG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgJCgnPGltZy8+JykuYXR0cignc3JjJywgc2VsZi5ocmVmKS5sb2FkKCBmdW5jdGlvbigpe1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tIHJlbW92ZSB0aGUgdGVtcCBpbWcgdG8gcHJldmVudCBtZW1vcnkgbGVha3NcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xyXG4vLy0tLS0tLS0tLS0tLS0tLS0tIG5vdyBzYXZlIGFuZCBzZXQgdGhlIGJhY2tncm91bmQtaW1hZ2Ugd2l0aCBhbGwgcGFyYW1zXHJcbiAgICAgICAgICAgICAgICAgICAgJGJvZHkuZGF0YSgndGltZVNsb3QnLCBzZWxmKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1pbWFnZSc6ICd1cmwoXCInK3NlbGYuaHJlZisnXCIpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLXJlcGVhdCc6IHNlbGYucmVwZWF0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtcG9zaXRpb24nOiBzZWxmLnBvc2l0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtYXR0YWNobWVudCc6IHNlbGYuYXR0YWNobWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLXNpemUnOiBzZWxmLnNpemUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaGVpZ2h0JzogJzEwMCUnXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0gYW5kIGZhZGUgdGhlIHByZWxvYWRpbmcgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgJChcIiNsb2FkZXItd3JhcHBlclwiKS5mYWRlT3V0KFwic2xvd1wiKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4vLy0tLS0tLS0tLS0tLS0gdGhlbiBxdWl0IHRoZSBlYWNoIGxvb3BcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogQWRkcyBhZGRpdGlvbmFsIGNsYXNzZXMgdG8gdGhlIEJPRFkgZWxlbWVudFxyXG4gKiBvbkhvbWUgfiBpZiB0aGUgaG9tZXBhZ2UgaXMgZGlzcGxheWVkXHJcbiAqIG9uVG9waWMgfiBpZiBhIHRvcGljIHBhZ2UgaXMgZGlzcGxheWVkXHJcbiAqIHRvcGljLXt0b3BpY0lEfSB+IElEIG9mIHRoZSB0b3BpYyAobG93ZXJjYXNlIElEKVxyXG4gKiBvblN0b3J5IH4gaWYgYSBzdG9yeSBpcyBkaXNwbGF5ZWRcclxuICogc3Rvcnkte3N0b3J5SUR9IH4gSUQgb2YgdGhlIHN0b3J5IChsb3dlcmNhc2UgSUQpXHJcbiAqXHJcbiAqIEV4YW1wbGVzOlxyXG4gKiBwYXRobmFtZT1cIi9cIiA9PT0+IGJvZHljbGFzcz1cIm9uSG9tZVwiXHJcbiAqIHBhdGhuYW1lPVwiL3RvcGljcy9UZXN0dGhlbWEvXCIgPT0+IGJvZHljbGFzcz1cIm9uVG9waWMgdG9waWMtdGVzdHRoZW1hXCJcclxuICogcGF0aG5hbWU9XCIvc3Rvcmllcy9pcy1pdC1tZS15b3VyZS1sb29raW5nLWZvci9cIiA9PT4gYm9keWNsYXNzPVwib25TdG9yeSBzdG9yeS1pcy1pdC1tZS15b3VyZS1sb29raW5nLWZvclwiXHJcbiAqXHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG5cclxuICAgIHZhciBib2R5Y2xhc3MgPSBcIlwiO1xyXG4gICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9cIikgYm9keWNsYXNzID0gXCJvbkhvbWVcIjtcclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHZhciBwYXRoID0gbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXFwvL2csIFwiIFwiKS50cmltKCkuc3BsaXQoXCIgXCIpO1xyXG4gICAgICAgIHN3aXRjaCAocGF0aFswXSkge1xyXG4gICAgICAgICAgICBjYXNlIFwidG9waWNzXCI6ICBib2R5Y2xhc3MgPSBcIm9uVG9waWMgXCIgKyBwYXRoWzFdLnRvTG93ZXJDYXNlKCk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwic3Rvcmllc1wiOiBib2R5Y2xhc3MgPSBcIm9uU3RvcnkgXCIgKyBwYXRoWzFdLnRvTG93ZXJDYXNlKCk7IGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChib2R5Y2xhc3MubGVuZ3RoPjApICQoXCJib2R5XCIpLmFkZENsYXNzKGJvZHljbGFzcyk7XHJcblxyXG59OyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHJvb3RTY29wZSwgJGZpbHRlciwgJHEsIFVwZGF0ZUNoZWNrLCBUd29kYXlTa2luLCB0b2FzdHIpe1xyXG4gICAgXHJcbiAgICB2YXIgdm0gPSB0aGlzO1xyXG4gICAgXHJcbiAgICB2bS5wYXJhbSA9ICRyb290U2NvcGUucGFyYW07XHJcblxyXG4gICAgdm0ubXNnQ2xvc2UgPSB0cnVlO1xyXG4gICAgdm0uaXNDaGVja2luZyA9IGZhbHNlO1xyXG5cclxuICAgIHZtLmRhdGVOZXh0Q2hlY2sgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiAodm0ucGFyYW0udXBkYXRlLmdhcDwwXHJcbiAgICAgICAgICAgID8gXCJLZWluZSBQcsO8ZnVuZ1wiXHJcbiAgICAgICAgICAgIDogJGZpbHRlcignZGF0ZScpKG5ldyBEYXRlKHZtLnBhcmFtLnVwZGF0ZS5sYXN0Q2hlY2suZ2V0VGltZSgpK3ZtLnBhcmFtLnVwZGF0ZS5nYXApLCBcImRkLk1NLnl5eXkgSEg6bW1cIikpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS51cGRhdGVDaGVja3MgPSBbXHJcbiAgICAgICAgeyBjaGVjazogXCJ0w6RnbGljaFwiLCBnYXA6IDI0KjYwKjYwKjEwMDAgfSxcclxuICAgICAgICB7IGNoZWNrOiBcInfDtmNoZW50bGljaFwiLCBnYXA6IDcqMjQqNjAqNjAqMTAwMCB9LFxyXG4gICAgICAgIHsgY2hlY2s6IFwibW9uYXRsaWNoXCIsIGdhcDogMzAqMjQqNjAqNjAqMTAwMCB9LFxyXG4gICAgICAgIHsgY2hlY2s6IFwibmllbWFsc1wiLCBnYXA6IC0xIH1cclxuICAgIF07XHJcblxyXG4gICAgdm0udXNlRnJlcXVlbmN5ID0gZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgICAgIHZhciBmcmVxdWVuY3kgPSB2bS51cGRhdGVDaGVja3NbaW5kZXhdO1xyXG4gICAgICAgIHZtLnBhcmFtLnVwZGF0ZS5jaGVjayA9IGZyZXF1ZW5jeS5jaGVjaztcclxuICAgICAgICB2bS5wYXJhbS51cGRhdGUuZ2FwID0gZnJlcXVlbmN5LmdhcDtcclxuICAgIH07XHJcblxyXG4gICAgdm0uY2hlY2tTa2luVXBkYXRlID0gZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgdmFyIHNraW5FZGl0VXJsID0gdm0ucGFyYW0ubGF5b3V0VXJsK1wic2tpbnMvZWRpdD9rZXk9XCIsXHJcbiAgICAgICAgICAgIHByb21pc2VzID0gW107XHJcblxyXG4gICAgICAgICQuZWFjaCggdm0ucmVsZWFzZS5za2lucywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcHJvbWlzZXMucHVzaCggVHdvZGF5U2tpbi5nZXQoc2tpbkVkaXRVcmwrdGhpcy5uYW1lKSApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkcS5hbGwocHJvbWlzZXMpLnRoZW4oIGZ1bmN0aW9uKHJlc3VsdHMpeyAvLyBzdWNjZXNzOiBhbGwgc2tpbnMgcmVhZFxyXG5cclxuICAgICAgICAgICAgJC5lYWNoKCByZXN1bHRzLCBmdW5jdGlvbihpbmRleCwgcmVzcG9uc2UpeyAvLyByZXNwb25zZSA9IHtjb25maWcsIGRhdGEsIGhlYWRlcnMsIHN0YXR1cywgc3RhdHVzVGV4dH1cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgc2tpbiA9IHZtLnJlbGVhc2Uuc2tpbnNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgdmFyICRmb3JtID0gJChyZXNwb25zZS5kYXRhKS5maW5kKFwiZm9ybVwiKS5lcSgwKTtcclxuICAgICAgICAgICAgICAgIHZhciBza2luQ29kZSA9ICQudHJpbSgkZm9ybS5maW5kKFwidGV4dGFyZWFbbmFtZT1za2luXVwiKS52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXNTa2luSW5pdGlhbCA9IChza2luQ29kZS5sZW5ndGggPT09IDApO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2bS5wYXJhbS51cGRhdGUub3ZlcndyaXRlW3NraW4ubmFtZV0gIT09IFwidW5kZWZpbmVkXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCh2bS5wYXJhbS51cGRhdGUub3ZlcndyaXRlW3NraW4ubmFtZV0peyAvLyBhbHdheXMsIG5ldmVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJhbHdheXNcIjogc2tpbi5zdGF0dXMgPSBcIm5lZWRzdXBkYXRlXCI7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwibmV2ZXJcIjogIHNraW4uc3RhdHVzID0gKGlzU2tpbkluaXRpYWwgPyBcIm5lZWRzdXBkYXRlXCIgOiBcInNraXBwZWRcIik7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2tpbi5zdGF0dXMgPSAoc2tpbi5jb250ZW50Lmxlbmd0aD09PXNraW5Db2RlLmxlbmd0aCAmJiBza2luLmNvbnRlbnQ9PT1za2luQ29kZSA/IFwiaXNlcXVhbFwiIDogXCJuZWVkc3VwZGF0ZVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSW5kZXg6XCIsIGluZGV4LCBza2luLm5hbWUsIGlzU2tpbkluaXRpYWwsIFwiUmxzZTpcIiwgc2tpbi5jb250ZW50Lmxlbmd0aCwgXCJCbG9nOlwiLCBza2luQ29kZS5sZW5ndGgsIHNraW4uc3RhdHVzKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB2bS5yZWxlYXNlQ2hlY2tlZCA9IHRydWU7XHJcbiAgICAgICAgfSwgZnVuY3Rpb24oKXsgLy8gZXJyb3I6IGF0IGxlYXN0IG9uZSBza2luIHJlYWQgZmFpbGVkXHJcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihcIk1pbmRlc3RlbnMgZWluIFNraW4ga29ubnRlIG5pY2h0IGZlaGxlcmZyZWkgZ2VsZXNlbiB3ZXJkZW4hXCIsIHZtLnBhcmFtLm1zZ0hlYWRlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLmNoZWNrUmVsZWFzZVVwZGF0ZSA9IGZ1bmN0aW9uKGUpe1xyXG5cclxuICAgICAgICB2bS5pc0NoZWNraW5nID0gdHJ1ZTtcclxuICAgICAgICB2bS5yZWxlYXNlTG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICB2bS5yZWxlYXNlQ2hlY2tlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoZS5jdHJsS2V5KXtcclxuICAgICAgICAgICAgdmFyIHZlcnNpb24gPSB2bS5wYXJhbS51cGRhdGUudmVyc2lvbi5zcGxpdCgnLicpO1xyXG4gICAgICAgICAgICB2ZXJzaW9uW3ZlcnNpb24ubGVuZ3RoLTFdID0gKHBhcnNlSW50KHZlcnNpb25bdmVyc2lvbi5sZW5ndGgtMV0sIDEwKSAtIDEpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHZtLnBhcmFtLnVwZGF0ZS52ZXJzaW9uID0gdmVyc2lvbi5qb2luKCcuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBVcGRhdGVDaGVjay52ZXJpZnkodm0ucGFyYW0pLnRoZW4oXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlbGVhc2Upe1xyXG4gICAgICAgICAgICAgICAgdm0ucmVsZWFzZSA9IHJlbGVhc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgIHZtLm5ld1ZlcnNpb24gPSByZWxlYXNlLm5ld1ZlcnNpb247XHJcbiAgICAgICAgICAgICAgICB2bS5tc2dDbG9zZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdm0ucGFyYW0udXBkYXRlLmxhc3RDaGVjayA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB2bS5pc0NoZWNraW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAodm0ubmV3VmVyc2lvbikgdm0uY2hlY2tTa2luVXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uKHN0YXR1cyl7XHJcbiAgICAgICAgICAgICAgICB2bS5pc0NoZWNraW5nID0gdm0ucmVsZWFzZUxvYWRlZCA9IHZtLm1zZ0Nsb3NlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdm0udXBkYXRlU3RhdHVzID0gZnVuY3Rpb24oc2tpblN0YXR1cyl7XHJcblxyXG4gICAgICAgIHZhciB1cGRTdGF0dXMgPSB7XHJcbiAgICAgICAgICAgICAgICBcInVuY2hlY2tlZFwiOiAgICBcIm5vY2ggbmljaHQgZ2VwcsO8ZnRcIixcclxuICAgICAgICAgICAgICAgIFwiaXNlcXVhbFwiOiAgICAgIFwiaXN0IGJlcmVpdHMgYWt0dWVsbFwiLFxyXG4gICAgICAgICAgICAgICAgXCJuZWVkc3VwZGF0ZVwiOiAgXCJ3aXJkIGFrdHVhbGlzaWVydFwiLFxyXG4gICAgICAgICAgICAgICAgXCJ1cGRhdGVkXCI6ICAgICAgXCJ3dXJkZSBlcmZvbGdyZWljaCBha3R1YWxpc2llcnRcIixcclxuICAgICAgICAgICAgICAgIFwiZXJyb3JcIjogICAgICAgIFwiQWt0dWFsaXNpZXJ1bmcgZmVobGdlc2NobGFnZW5cIixcclxuICAgICAgICAgICAgICAgIFwic2tpcHBlZFwiOiAgICAgIFwiQmVudXR6ZXJza2luIGJsZWlidCB1bnZlcsOkbmRlcnRcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdGF0UGFydHMgPSBza2luU3RhdHVzLnNwbGl0KFwiflwiKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHVwZFN0YXR1c1tzdGF0UGFydHNbMF1dKyhzdGF0UGFydHMubGVuZ3RoPjEgPyBcIi0+XCIrc3RhdFBhcnRzWzFdIDogXCJcIik7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB2bS5pbnN0YWxsUmVsZWFzZSA9IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICAgICQuZWFjaCggdm0ucmVsZWFzZS5za2lucywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHNraW4gPSB0aGlzO1xyXG4gICAgICAgICAgICBpZiAoc2tpbi5zdGF0dXMgPT09IFwibmVlZHN1cGRhdGVcIil7XHJcbiAgICAgICAgICAgICAgICBUd29kYXlTa2luLnVwZGF0ZShza2luLCB2bS5wYXJhbSkudGhlbihmdW5jdGlvbihza2luKXtcclxuICAgICAgICAgICAgICAgICAgICAvLyBzdWNjZXNzOiBza2luLnN0YXR1cyBhbHJlYWR5IHVwZGF0ZWRcclxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKHN0YXR1cywgc2tpbil7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZXJyb3I6IHNraW4uc3RhdHVzIGFscmVhZHkgdXBkYXRlZFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9O1xyXG5cclxufTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgYmFja2dyb3VuZCA9IHJlcXVpcmUoJy4uL2JhY2tncm91bmQuanMnKSxcclxuICAgIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHJvb3RTY29wZSwgSW1hZ2VQcm92aWRlciwgJHdpbmRvdywgdG9hc3RyKXtcclxuICAgIFxyXG4gICAgdmFyIHZtID0gdGhpcztcclxuICAgIFxyXG4gICAgdm0ucGFyYW0gPSAkcm9vdFNjb3BlLnBhcmFtO1xyXG5cclxuICAgIHZtLnBvc2l0aW9ucyA9IFtcclxuICAgICAgICBcImxlZnQgdG9wXCIsIFwibGVmdCBjZW50ZXJcIiwgXCJsZWZ0IGJvdHRvbVwiLFxyXG4gICAgICAgIFwicmlnaHQgdG9wXCIsIFwicmlnaHQgY2VudGVyXCIsIFwicmlnaHQgYm90dG9tXCIsXHJcbiAgICAgICAgXCJjZW50ZXIgdG9wXCIsIFwiY2VudGVyIGNlbnRlclwiLCBcImNlbnRlciBib3R0b21cIlxyXG4gICAgXTtcclxuXHJcbiAgICB2bS5yZXBlYXRzID0gWyBcInJlcGVhdFwiLCBcInJlcGVhdC14XCIsIFwicmVwZWF0LXlcIiwgXCJuby1yZXBlYXRcIiBdO1xyXG5cclxuICAgIHZtLnNpemVzID0gWyBcImF1dG9cIiwgXCJjb3ZlclwiLCBcImNvbnRhaW5cIiBdO1xyXG5cclxuICAgIHZtLmF0dGFjaG1lbnRzID0gWyBcImZpeGVkXCIsIFwibG9jYWxcIiwgXCJzY3JvbGxcIiBdO1xyXG5cclxuICAgIHZtLmlzRWRpdE1vZGUgPSB2bS5pc0NyZWF0ZU1vZGUgPSB2bS5pc1F1ZXJ5SW1hZ2UgPSBmYWxzZTtcclxuXHJcbiAgICB2bS5zbG90Q2hlY2sgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciBzbG90cz12bS5wYXJhbS50aW1lU2xvdHMsIHNsb3RFbmQ9LTEsIHN0YXR1cz0oc2xvdHMubGVuZ3RoPjAgPyBcIlwiIDogXCJLZWluZSBIaW50ZXJncnVuZC1aZWl0ZmVuc3RlciB2b3JoYW5kZW4hXCIpO1xyXG4gICAgICAgICQuZWFjaCggdm0ucGFyYW0udGltZVNsb3RzLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiZnJvbTogXCIrdXRpbHMuZ2V0TWludXRlKHRoaXMuZnJvbSkrXCIgc2xvdEVuZDogXCIrc2xvdEVuZCtcIiAoXCIrKHNsb3RFbmQrMSkrXCIpXCIpO1xyXG4gICAgICAgICAgICBpZiAodXRpbHMuZ2V0TWludXRlKHRoaXMuZnJvbSkhPT1zbG90RW5kKzEpe1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzID0gKHNsb3RFbmQ8MFxyXG4gICAgICAgICAgICAgICAgICAgICAgID8gXCJEaWUgWmVpdGFuZ2FiZSBiZWdpbm50IG5pY2h0IGJlaSAwMDowMCBVaHIhXCJcclxuICAgICAgICAgICAgICAgICAgICAgICA6IFwiRXMgYmVzdGVodCBlaW5lIFplaXRsw7xja2UgYmVpIFwiK3V0aWxzLmZvcm1hdFRpbWUodGhpcy5mcm9tKStcIiBVaHIhXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Ugc2xvdEVuZCA9IHV0aWxzLmdldE1pbnV0ZSh0aGlzLnRvKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoc3RhdHVzLmxlbmd0aD09PTAgJiYgc2xvdEVuZCE9PTIzKjYwKzU5KSBzdGF0dXMgPSBcIkRpZSBaZWl0YW5nYWJlIGVuZGV0IG5pY2h0IGJlaSAyMzo1OSBVaHIhXCI7XHJcbiAgICAgICAgdm0uc2xvdFN0YXR1c09LID0gKHN0YXR1cy5sZW5ndGg9PT0wKTtcclxuICAgICAgICB2bS5zbG90U3RhdHVzID0gKHZtLnNsb3RTdGF0dXNPSyA/IFwiQWxsZSBIaW50ZXJncnVuZC1aZWl0ZmVuc3RlciB2b2xsc3TDpG5kaWcgZGVmaW5pZXJ0LlwiIDogc3RhdHVzKTtcclxuICAgIH07XHJcblxyXG4gICAgdm0uZWRpdCA9IGZ1bmN0aW9uKGluZGV4KXtcclxuICAgICAgICB2bS5zbG90ID0gYW5ndWxhci5jb3B5KHZtLnBhcmFtLnRpbWVTbG90c1tpbmRleF0pO1xyXG4gICAgICAgIHZtLmluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgdm0uaXNFZGl0TW9kZSA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLmNhbmNlbCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaWYgKHZtLmlzQ3JlYXRlTW9kZSkgZGVsZXRlIHZtLnNsb3Q7XHJcbiAgICAgICAgdm0uaXNFZGl0TW9kZSA9IHZtLmlzQ3JlYXRlTW9kZSA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS5zYXZlID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBpZiAodm0uaXNDcmVhdGVNb2RlKSB2bS5pbnNlcnQoKTsgZWxzZSB2bS51cGRhdGUoKTtcclxuICAgICAgICBiYWNrZ3JvdW5kLnNldEltYWdlKHZtLnBhcmFtLnRpbWVTbG90cyk7XHJcbiAgICAgICAgdm0uc2xvdENoZWNrKCk7XHJcbiAgICAgICAgdm0uaXNFZGl0TW9kZSA9IHZtLmlzQ3JlYXRlTW9kZSA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS5zb3J0ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICB2bS5wYXJhbS50aW1lU2xvdHMuc29ydCggZnVuY3Rpb24oYSxiKXsgcmV0dXJuIHV0aWxzLmdldE1pbnV0ZShhLmZyb20pIC0gdXRpbHMuZ2V0TWludXRlKGIuZnJvbSk7IH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS5maW5kRmlyc3QgPSBmdW5jdGlvbihjYlNlbGVjdENvbmRpdGlvbil7XHJcbiAgICAgICAgdmFyIHNsb3RzID0gdm0ucGFyYW0udGltZVNsb3RzLCBzZWxlY3RlZEluZGV4ID0gLTE7XHJcbiAgICAgICAgJC5lYWNoKCBzbG90cywgZnVuY3Rpb24oaW5kZXgsIHNsb3Qpe1xyXG4gICAgICAgICAgICBpZiAoY2JTZWxlY3RDb25kaXRpb24oc2xvdCkpe1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHNlbGVjdGVkSW5kZXg7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLmluc2VydCA9IGZ1bmN0aW9uKCl7XHJcbi8vLS0tLS0gR2V0IHRoZSBjdXJyZW50bHkgZGVmaW5lZCB0aW1lc2xvdHNcclxuICAgICAgICB2YXIgc2xvdHMgPSB2bS5wYXJhbS50aW1lU2xvdHMsIHNsb3QsIHNJZHggPSAwLCBjbG9uZSA9IG51bGw7XHJcbi8vLS0tLS0gRGVsZXRlIGFsbCBvbGQgc2xvdHMgdGhhdCBhcmUgZW5jb21wYXNzZWQvZW1iZWRkZWQgYnkgdGhlIG5ldyBzbG90XHJcbiAgICAgICAgd2hpbGUgKHNJZHg8c2xvdHMubGVuZ3RoKXtcclxuICAgICAgICAgICAgc2xvdCA9IHNsb3RzW3NJZHhdO1xyXG4gICAgICAgICAgICBpZiAoc2xvdC5mcm9tPj12bS5zbG90LmZyb20gJiYgc2xvdC50bzw9dm0uc2xvdC50bylcclxuICAgICAgICAgICAgICAgIHZtLnJlbW92ZShzSWR4LCBcIm5vY2hlY2tcIik7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHNJZHgrKztcclxuICAgICAgICB9XHJcbi8vLS0tLS0gRmluZCB0aGUgZmlyc3Qgc2xvdCB3aGVyZSBuZXctZnJvbVRpbWUgaXMgaW5jbHVkZWRcclxuICAgICAgICBzSWR4ID0gdm0uZmluZEZpcnN0KGZ1bmN0aW9uKHRoaXNTbG90KXsgcmV0dXJuICh2bS5zbG90LmZyb208dGhpc1Nsb3QudG8pOyB9KTtcclxuICAgICAgICBpZiAoc0lkeD49MCl7XHJcbiAgICAgICAgICAgIGlmICh2bS5zbG90LmZyb20+c2xvdHNbc0lkeF0uZnJvbSAmJiB2bS5zbG90LnRvPHNsb3RzW3NJZHhdLnRvKXtcclxuICAgICAgICAgICAgICAgIGNsb25lID0gYW5ndWxhci5jb3B5KHNsb3RzW3NJZHhdKTtcclxuICAgICAgICAgICAgICAgIGNsb25lLmZyb20gPSB1dGlscy5hZGRNaW51dGVzKHZtLnNsb3QudG8sICsxKTtcclxuICAgICAgICAgICAgICAgIHNsb3RzW3NJZHhdLnRvID0gdXRpbHMuYWRkTWludXRlcyh2bS5zbG90LmZyb20sIC0xKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh2bS5zbG90LmZyb208PXNsb3RzW3NJZHhdLmZyb20gJiYgdm0uc2xvdC50bzxzbG90c1tzSWR4XS50byl7XHJcbiAgICAgICAgICAgICAgICBzbG90c1tzSWR4XS5mcm9tID0gdXRpbHMuYWRkTWludXRlcyh2bS5zbG90LnRvLCArMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodm0uc2xvdC50bz49c2xvdHNbc0lkeF0udG8pe1xyXG4gICAgICAgICAgICAgICAgc2xvdHNbc0lkeF0udG8gPSB1dGlscy5hZGRNaW51dGVzKHZtLnNsb3QuZnJvbSwgLTEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNsb3RzLmxlbmd0aD5zSWR4KzEpIHNsb3RzW3NJZHgrMV0uZnJvbSA9IHV0aWxzLmFkZE1pbnV0ZXModm0uc2xvdC50bywgKzEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4vLy0tLS0tIFB1c2ggdGhlIG5ldyBzbG90IHRvIHRoZSBhcnJheVxyXG4gICAgICAgIHNsb3RzLnB1c2godm0uc2xvdCk7XHJcbi8vLS0tLS0gUHVzaCB0aGUgY2xvbmUgc2xvdCB0byB0aGUgYXJyYXkgaWYgdGhlcmUgaXMgb25lXHJcbiAgICAgICAgaWYgKGNsb25lIT09bnVsbCkgc2xvdHMucHVzaChjbG9uZSk7XHJcbi8vLS0tLS0gYW5kIHJlLXNvcnRcclxuICAgICAgICB2bS5zb3J0KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLnVwZGF0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdm0ucGFyYW0udGltZVNsb3RzW3ZtLmluZGV4XSA9IHZtLnNsb3Q7XHJcbiAgICAgICAgdm0uc29ydCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS5yZW1vdmUgPSBmdW5jdGlvbihpbmRleCwgbm9jaGVjayl7XHJcbi8vLS0tLS0gR2V0IHRoZSBjdXJyZW50bHkgZGVmaW5lZCB0aW1lc2xvdHNcclxuICAgICAgICB2YXIgc2xvdHMgPSB2bS5wYXJhbS50aW1lU2xvdHM7XHJcbi8vLS0tLS0gSWYgaW5kZXggdG8gZGVsZXRlIGlzIG5vdCB0aGUgZmlyc3QsIHRoZW4gY29uc29saWRhdGUgdGltZXMgd2l0aCBwcmVjZWVkaW5nIHRpbWVzbG90XHJcbiAgICAgICAgaWYgKGluZGV4PjApIHNsb3RzW2luZGV4LTFdLnRvID0gc2xvdHNbaW5kZXhdLnRvO1xyXG4vLy0tLS0tIElmIGluZGV4IGlzIHRoZSBmaXJzdCBhbmQgdGhlcmUgaXMgYSBzdWNjZWVkaW5nIHRpbWVzbG90LCBjb25zb2xpZGF0ZSB3aXRoIHN1Y2NlZWRpbmcgdGltZXNsb3RcclxuICAgICAgICBlbHNlIGlmIChzbG90cy5sZW5ndGg+MSkgc2xvdHNbMV0uZnJvbSA9IHNsb3RzWzBdLmZyb207XHJcbi8vLS0tLS0gYW55d2F5IGRlbGV0ZSB0aGlzIGluZGV4IG5vd1xyXG4gICAgICAgIHNsb3RzLnNwbGljZShpbmRleCwgMSk7XHJcbi8vLS0tLS0gYW5kIHJlLWNoZWNrIHRoZSBzbG90cyBzdGF0dXMgdW5sZXNzIGludGVybmFsIGNhbGwgZnJvbSBpbnNlcnQgZnVuY3Rpb25cclxuICAgICAgICBpZiAobm9jaGVjayB8fCAnJyAhPT0gJ25vY2hlY2snKSB2bS5zbG90Q2hlY2soKTtcclxuICAgIH07XHJcblxyXG4gICAgdm0uY3JlYXRlID0gZnVuY3Rpb24oKXtcclxuICAgICAgICB2bS5zbG90ID0ge1xyXG4gICAgICAgICAgICAgIFwiZnJvbVwiOiBuZXcgRGF0ZSgxOTcwLDAsMSwwLDAsMCksIFwidG9cIjogbmV3IERhdGUoMTk3MCwwLDEsMjMsNTksMCksXHJcbiAgICAgICAgICAgICAgXCJyZXBlYXRcIjogXCJuby1yZXBlYXRcIiwgXCJwb3NpdGlvblwiOiBcImNlbnRlciB0b3BcIiwgXCJzaXplXCI6IFwiY292ZXJcIixcclxuICAgICAgICAgICAgICBcImF0dGFjaG1lbnRcIjogXCJmaXhlZFwiLCBcImhyZWZcIjogdm0ucGFyYW0uc2l0ZS5pbWdGb2xkZXIgfTtcclxuICAgICAgICB2bS5pc0NyZWF0ZU1vZGUgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS51c2VQb3NpdGlvbiA9IGZ1bmN0aW9uKGluZGV4KXtcclxuICAgICAgICB2bS5zbG90LnBvc2l0aW9uID0gdm0ucG9zaXRpb25zW2luZGV4XTtcclxuICAgIH07XHJcblxyXG4gICAgdm0udXNlUmVwZWF0ID0gZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgICAgIHZtLnNsb3QucmVwZWF0ID0gdm0ucmVwZWF0c1tpbmRleF07XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLnVzZVNpemUgPSBmdW5jdGlvbihpbmRleCl7XHJcbiAgICAgICAgdm0uc2xvdC5zaXplID0gdm0uc2l6ZXNbaW5kZXhdO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS51c2VBdHRhY2htZW50ID0gZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgICAgIHZtLnNsb3QuYXR0YWNobWVudCA9IHZtLmF0dGFjaG1lbnRzW2luZGV4XTtcclxuICAgIH07XHJcblxyXG4gICAgdm0ubmF2SW1hZ2VQb29sID0ge1xyXG4gICAgICAgIHByb3ZpZGVyczogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnVW5zcGxhc2gnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBmdW5jdGlvbigpeyByZXR1cm4gdm0ucGFyYW0udXBkYXRlLnJlbGVhc2VVcmwrJ3Vuc3BsYXNoLmpzb24nOyB9LFxyXG4gICAgICAgICAgICAgICAgbG9hZDogZnVuY3Rpb24oZGF0YSl7IHJldHVybiBkYXRhIHx8IFtdOyB9LFxyXG4gICAgICAgICAgICAgICAgZ2V0Rm9ybWF0SW5mbzogZnVuY3Rpb24odGFyZ2V0LCBzcmNSYXRpbyl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHcsIGg7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0YXJnZXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdnYWxsZXJ5Jzogdz0yNDA7IGg9MTYwOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZnVsbHNjcmVlbic6IHc9JHdpbmRvdy5zY3JlZW4ud2lkdGg7IGg9JHdpbmRvdy5zY3JlZW4uaGVpZ2h0OyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnYmFja2dyb3VuZCc6IHc9MTkyMDsgaD1NYXRoLnJvdW5kKDE5MjAvc3JjUmF0aW8pOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgaW1hZ2U6ICdpbWdfdXJsJywgc3VmZml4OiAnP2ZtPWpwZyZxPTc1Jnc9Jyt3KycmaD0nK2grJyZmaXQ9Y3JvcCcgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ1BpY2p1bWJvJyxcclxuICAgICAgICAgICAgICAgIHVybDogZnVuY3Rpb24oKXsgcmV0dXJuIHZtLnBhcmFtLnVwZGF0ZS5yZWxlYXNlVXJsKydwaWNqdW1iby5qc29uJzsgfSxcclxuICAgICAgICAgICAgICAgIGxvYWQ6IGZ1bmN0aW9uKGRhdGEpeyByZXR1cm4gZGF0YSB8fCBbXTsgfSxcclxuICAgICAgICAgICAgICAgIGdldEZvcm1hdEluZm86IGZ1bmN0aW9uKHRhcmdldCwgc3JjUmF0aW8pe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3LCBoO1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGFyZ2V0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZ2FsbGVyeSc6IHc9MjQwOyBoPTE2MDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Z1bGxzY3JlZW4nOiB3PSR3aW5kb3cuc2NyZWVuLndpZHRoOyBoPSR3aW5kb3cuc2NyZWVuLmhlaWdodDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JhY2tncm91bmQnOiB3PTE5MjA7IGg9TWF0aC5yb3VuZCgxOTIwL3NyY1JhdGlvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGltYWdlOiAnaW1nX3VybCcsIHN1ZmZpeDogJz9mbT1qcGcmcT03NSZ3PScrdysnJmg9JytoKycmZml0PWNyb3AnIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdHb29nbGVEcml2ZScsXHJcbiAgICAgICAgICAgICAgICBkb21haW46ICdodHRwczovL2dvb2dsZWRyaXZlLmNvbScsXHJcbiAgICAgICAgICAgICAgICBsb2FkOiBmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBbXSwgaHJlZiwgaXRlbSwgb2JqZWN0SXMsIHNlbGY9dGhpcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVySW1nVXJsID0gdm0ucGFyYW0udXBkYXRlLnJlbGVhc2VVcmwrJ2ZvbGRlci5qcGcnO1xyXG4gICAgICAgICAgICAgICAgICAgICQoZGF0YSkuZmluZChcIi5mb2xkZXItY2VsbD5hXCIpLmVhY2goIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhyZWYgPSAkKHRoaXMpLmF0dHIoXCJocmVmXCIpOyAvLyBzdXBwcmVzcyBkb21haW4gaW5zZXJ0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0gPSBkZWNvZGVVUkkoaHJlZikuc3BsaXQoJy8nKS5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0SXMgPSB1dGlscy5pc0l0ZW0oaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb2JqZWN0SXMuYUZvbGRlciAmJiAhb2JqZWN0SXMuYW5JbWFnZSkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmplY3RJcy5hRm9sZGVyKSBpdGVtID0gaXRlbSAgfHwgJ3p1csO8Y2snO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpc0ltYWdlJzogb2JqZWN0SXMuYW5JbWFnZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdocmVmJzogaHJlZixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmbmFtZSc6IGl0ZW0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW1nX3VybCc6IChvYmplY3RJcy5hRm9sZGVyID8gZm9sZGVySW1nVXJsIDogc2VsZi5kb21haW4raHJlZilcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHVybDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdkID0gdXRpbHMucmVtb3ZlVHJhaWxpbmdTbGFzaCh2bS5wYXJhbS5zaXRlLmltZ0ZvbGRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdkLmxlbmd0aD09PTApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2FzdHIud2FybmluZygnQml0dGUgZ2ViZW4gU2llIHp1ZXJzdCBJaHIgR29vZ2xlRHJpdmUtQmlsZHZlcnplaWNobmlzIGltIFRhYiBcIkdydW5kZGF0ZW5cIiBlaW4hJywgdm0ucGFyYW0ubXNnSGVhZGVyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZ2QuaW5kZXhPZignZHJpdmUuZ29vZ2xlLmNvbScpPj0wKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2QgPSB2bS5wYXJhbS5zaXRlLmltZ0ZvbGRlciA9ICdodHRwczovL2dvb2dsZWRyaXZlLmNvbS9ob3N0LycgKyBnZC5zcGxpdCgnLycpLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2QuaW5kZXhPZignZ29vZ2xlZHJpdmUuY29tL2hvc3QnKTwwKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9hc3RyLmVycm9yKCdEYXMgYW5nZWdlYmVuZSBCaWxkdmVyemVpY2huaXMgaXN0IGtlaW5lIGfDvGx0aWdlIEdvb2dsZURyaXZlLVVSTCEnLCB2bS5wYXJhbS5tc2dIZWFkZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnZDtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBnZXRGb3JtYXRJbmZvOiBmdW5jdGlvbih0YXJnZXQsIHNyY1JhdGlvKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBpbWFnZTogJ2ltZ191cmwnLCBzdWZmaXg6ICcnIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdGbGlja3InLFxyXG4gICAgICAgICAgICAgICAgbG9hZDogZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCBkYXRhLnF1ZXJ5LnJlc3VsdHMucGhvdG8sIGZ1bmN0aW9uKGl0ZW0pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpc0ltYWdlJzogKGl0ZW0ubWVkaWE9PT0ncGhvdG8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpbWdfdXJsJzogaXRlbS51cmxfbyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmbmFtZSc6IGl0ZW0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW1nX3NtbCc6IGl0ZW0udXJsX3MsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncmF0aW8nOiAocGFyc2VJbnQoaXRlbS53aWR0aF9vLCAxMCkgLyBwYXJzZUludChpdGVtLmhlaWdodF9vLCAxMCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtcztcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB1cmw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2bS5wYXJhbS5zaXRlLmZsaWNrclVzZXJJRC5sZW5ndGg9PT0wKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9hc3RyLndhcm5pbmcoJ0JpdHRlIGdlYmVuIFNpZSB6dWVyc3QgSWhyIEZsaWNrci1CZW51dHplci1JRCBpbSBUYWIgXCJHcnVuZGRhdGVuXCIgZWluIScsIHZtLnBhcmFtLm1zZ0hlYWRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2bS5wYXJhbS5zaXRlLmlzRmxpY2tyVmVyaWZpZWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2FzdHIud2FybmluZygnRGllIGVpbmdlZ2ViZW5lIEJlbnV0emVyLUlEIG11c3Mgdm9yaGVyIG5vY2ggw7xiZXJwcsO8ZnQgd2VyZGVuIChUYWIgXCJHcnVuZGRhdGVuXCIpIScsIHZtLnBhcmFtLm1zZ0hlYWRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHlxbCA9ICdodHRwczovL3F1ZXJ5LnlhaG9vYXBpcy5jb20vdjEvcHVibGljL3lxbD9xPSNxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcXJ5ID0gZW5jb2RlVVJJQ29tcG9uZW50KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1NFTEVDVCAqIEZST00gZmxpY2tyLnBlb3BsZS5wdWJsaWNwaG90b3MoMCkgV0hFUkUgYXBpX2tleT1cIiNrXCIgQU5EIHVzZXJfaWQ9XCIjdVwiIEFORCBleHRyYXM9XCJtZWRpYSxvX2RpbXMsdXJsX28sdXJsX3NcIidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCcjaycsIHV0aWxzLmdldFJlcXVlc3RJRCgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoJyN1Jywgdm0ucGFyYW0uc2l0ZS5mbGlja3JVc2VySUQpKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geXFsLnJlcGxhY2UoJyNxJywgcXJ5KSsnJmVudj1zdG9yZTovL2RhdGF0YWJsZXMub3JnL2FsbHRhYmxlc3dpdGhrZXlzJmZvcm1hdD1qc29uJmNhbGxiYWNrPSc7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZ2V0Rm9ybWF0SW5mbzogZnVuY3Rpb24odGFyZ2V0LCBzcmNSYXRpbyl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZpZWxkO1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGFyZ2V0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZ2FsbGVyeSc6IGZpZWxkID0gJ2ltZ19zbWwnOyBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogZmllbGQgPSAnaW1nX3VybCc7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBpbWFnZTogZmllbGQsIHN1ZmZpeDogJycgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICBdLFxyXG4gICAgICAgIHByb3ZpZGVyOiB7fSxcclxuICAgICAgICBpbWFnZXM6IFtdLFxyXG4gICAgICAgIHBhZ2U6IC0xLFxyXG4gICAgICAgIGxhc3RQYWdlOiAwLFxyXG4gICAgICAgIHBhZ2VTaXplOiAyNCxcclxuICAgICAgICBwYWdlSW1hZ2VzOiBbXSxcclxuICAgICAgICBpc0xvYWRpbmdJbWFnZXM6IGZhbHNlLFxyXG4gICAgICAgIHN1YkZvbGRlcjogJycsXHJcbiAgICAgICAgaXNGaXJzdFBhZ2U6IGZ1bmN0aW9uKCl7IHJldHVybiAodGhpcy5wYWdlPT09MCk7IH0sXHJcbiAgICAgICAgaXNMYXN0UGFnZTogZnVuY3Rpb24oKXsgcmV0dXJuICh0aGlzLnBhZ2U9PT10aGlzLmxhc3RQYWdlKTsgfSxcclxuICAgICAgICB1c2VQcm92aWRlcjogZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgICAgICAgICB0aGlzLnByb3ZpZGVyID0gdGhpcy5wcm92aWRlcnNbaW5kZXhdO1xyXG4gICAgICAgICAgICB0aGlzLnN1YkZvbGRlciA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZXMoJycpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmV4dFBhZ2U6IGZ1bmN0aW9uKCl7ICsrdGhpcy5wYWdlOyB0aGlzLnNob3dJbWFnZXMoKTsgfSxcclxuICAgICAgICBwcmV2UGFnZTogZnVuY3Rpb24oKXsgLS10aGlzLnBhZ2U7IHRoaXMuc2hvd0ltYWdlcygpOyB9LFxyXG4gICAgICAgIHRvRmlyc3RQYWdlOiBmdW5jdGlvbigpeyB0aGlzLnBhZ2U9MDsgdGhpcy5zaG93SW1hZ2VzKCk7IH0sXHJcbiAgICAgICAgdG9MYXN0UGFnZTogZnVuY3Rpb24oKXsgdGhpcy5wYWdlPXRoaXMubGFzdFBhZ2U7IHRoaXMuc2hvd0ltYWdlcygpOyB9LFxyXG4gICAgICAgIHNlbGVjdEZvbGRlcjogZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgICAgICAgICB2YXIgaSA9IHRoaXMucGFnZSp0aGlzLnBhZ2VTaXplK2luZGV4O1xyXG4gICAgICAgICAgICB0aGlzLnN1YkZvbGRlciA9ICh0aGlzLnByb3ZpZGVyLmRvbWFpbit1dGlscy5yZW1vdmVUcmFpbGluZ1NsYXNoKHRoaXMuaW1hZ2VzW2ldLmhyZWYpKVxyXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UodGhpcy5wcm92aWRlci51cmwoKSwgJycpO1xyXG4gICAgICAgICAgICB0aGlzLmxvYWRJbWFnZXModGhpcy5zdWJGb2xkZXIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdmlld0ltYWdlOiBmdW5jdGlvbihpbmRleCl7XHJcbiAgICAgICAgICAgIHZhciBpID0gdGhpcy5wYWdlKnRoaXMucGFnZVNpemUsXHJcbiAgICAgICAgICAgICAgICBqID0gTWF0aC5taW4oaSt0aGlzLnBhZ2VTaXplLCB0aGlzLmltYWdlcy5sZW5ndGgpLFxyXG4gICAgICAgICAgICAgICAgZm10ID0gdGhpcy5wcm92aWRlci5nZXRGb3JtYXRJbmZvKCdmdWxsc2NyZWVuJyksXHJcbiAgICAgICAgICAgICAgICBzd2lwZUltYWdlcyA9IFtdO1xyXG4gICAgICAgICAgICB3aGlsZSAoaTxqKXtcclxuICAgICAgICAgICAgICAgIHN3aXBlSW1hZ2VzLnB1c2goeyBocmVmOiB0aGlzLmltYWdlc1tpXVtmbXQuaW1hZ2VdK2ZtdC5zdWZmaXggfSk7XHJcbiAgICAgICAgICAgICAgICArK2k7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJC5zd2lwZWJveCggc3dpcGVJbWFnZXMsIHt1c2VTVkc6IGZhbHNlLCBpbml0aWFsSW5kZXhPbkFycmF5OiBpbmRleH0gKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdEltYWdlOiBmdW5jdGlvbihpbmRleCl7XHJcbiAgICAgICAgICAgIHZhciBpID0gdGhpcy5wYWdlKnRoaXMucGFnZVNpemUraW5kZXgsXHJcbiAgICAgICAgICAgICAgICByYXRpbyA9ICh0eXBlb2YgdGhpcy5pbWFnZXNbaV0ucmF0aW8gIT09ICd1bmRlZmluZWQnID8gdGhpcy5pbWFnZXNbaV0ucmF0aW8gOiAxLjUpLFxyXG4gICAgICAgICAgICAgICAgZm10ID0gdGhpcy5wcm92aWRlci5nZXRGb3JtYXRJbmZvKCdiYWNrZ3JvdW5kJywgcmF0aW8pO1xyXG4gICAgICAgICAgICB2bS5zbG90LmhyZWYgPSB0aGlzLmltYWdlc1tpXVtmbXQuaW1hZ2VdK2ZtdC5zdWZmaXg7XHJcbiAgICAgICAgICAgIHZtLmlzUXVlcnlJbWFnZSA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2hvd0ltYWdlczogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIGkgPSB0aGlzLnBhZ2UqdGhpcy5wYWdlU2l6ZSxcclxuICAgICAgICAgICAgICAgIGogPSBNYXRoLm1pbihpK3RoaXMucGFnZVNpemUsIHRoaXMuaW1hZ2VzLmxlbmd0aCksXHJcbiAgICAgICAgICAgICAgICBpdGVtLCBpc0ltYWdlLCBmTmFtZSwgYmdVcmwsXHJcbiAgICAgICAgICAgICAgICBmbXQgPSB0aGlzLnByb3ZpZGVyLmdldEZvcm1hdEluZm8oJ2dhbGxlcnknKTtcclxuICAgICAgICAgICAgdGhpcy5wYWdlSW1hZ2VzLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgIHdoaWxlIChpPGope1xyXG4gICAgICAgICAgICAgICAgaXRlbSA9IHRoaXMuaW1hZ2VzW2ldO1xyXG4gICAgICAgICAgICAgICAgaXNJbWFnZSA9IChpdGVtLmhhc093blByb3BlcnR5KCdpc0ltYWdlJykgPyBpdGVtLmlzSW1hZ2UgOiB0cnVlKTtcclxuICAgICAgICAgICAgICAgIGZOYW1lID0gKGl0ZW0uaGFzT3duUHJvcGVydHkoJ2ZuYW1lJykgPyBpdGVtLmZuYW1lIDogJycpO1xyXG4gICAgICAgICAgICAgICAgYmdVcmwgPSAndXJsKFwiJytpdGVtW2ZtdC5pbWFnZV0rZm10LnN1ZmZpeCsnXCIpJztcclxuICAgICAgICAgICAgICAgIHRoaXMucGFnZUltYWdlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBpc0ltYWdlOiBpc0ltYWdlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZOYW1lOiBmTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeydiYWNrZ3JvdW5kLWltYWdlJzogYmdVcmx9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICsraTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbG9hZEltYWdlczogZnVuY3Rpb24oc3ViRm9sZGVyKXtcclxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICBzZWxmLmltYWdlcy5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICBzZWxmLmlzTG9hZGluZ0ltYWdlcyA9IHRydWU7XHJcbiAgICAgICAgICAgIHNlbGYucGFnZUltYWdlcy5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICBzZWxmLnBhZ2UgPSAwO1xyXG4gICAgICAgICAgICB2YXIgdXJsID0gc2VsZi5wcm92aWRlci51cmwoKTtcclxuICAgICAgICAgICAgaWYgKHVybC5sZW5ndGg9PT0wKSByZXR1cm47XHJcbiAgICAgICAgICAgIEltYWdlUHJvdmlkZXIubG9hZCggdXJsK3N1YkZvbGRlciApLnRoZW4oXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihkYXRhKXtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmltYWdlcyA9IHNlbGYucHJvdmlkZXIubG9hZChkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmxhc3RQYWdlID0gKHNlbGYuaW1hZ2VzLmxlbmd0aD09PTAgPyAwIDogTWF0aC5mbG9vcigoc2VsZi5pbWFnZXMubGVuZ3RoLTEpL3NlbGYucGFnZVNpemUpKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3dJbWFnZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmlzTG9hZGluZ0ltYWdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEsIHN0YXR1cyl7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9hc3RyLmVycm9yKFwiRmVobGVyIGJlaW0gTGVzZW4gZGVyIEJpbGRkYXRlbiB2b24gXCIrc2VsZi5wcm92aWRlci5uYW1lK1wiLCBTdGF0dXM6IFwiK3N0YXR1cywgdm0ucGFyYW0ubXNnSGVhZGVyKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmxhc3RQYWdlID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmlzTG9hZGluZ0ltYWdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdm0ucXVlcnlJbWFnZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdm0uaXNRdWVyeUltYWdlID0gdHJ1ZTtcclxuICAgICAgICBpZiAodm0ubmF2SW1hZ2VQb29sLnBhZ2U8MCkgdm0ubmF2SW1hZ2VQb29sLnVzZVByb3ZpZGVyKDApO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS5zbG90Q2hlY2soKTtcclxuXHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsIEltYWdlUHJvdmlkZXIsIFVzZXJTdHlsZXMsIHRvYXN0cil7XHJcblxyXG4gICAgdmFyIHZtID0gdGhpcztcclxuICAgIFxyXG4gICAgdm0ucGFyYW0gPSAkcm9vdFNjb3BlLnBhcmFtO1xyXG5cclxuICAgIHZtLnZlcmlmeURyaXZlRm9sZGVyID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBpZiAodm0ucGFyYW0uc2l0ZS5pbWdGb2xkZXIubGVuZ3RoPT09MCl7XHJcbiAgICAgICAgICAgIHZtLnBhcmFtLnNpdGUuaXNEcml2ZVZlcmlmaWVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgSW1hZ2VQcm92aWRlci5sb2FkKCB2bS5wYXJhbS5zaXRlLmltZ0ZvbGRlciApLnRoZW4oXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpbmtUb0dvb2dsZURyaXZlID0gJChkYXRhKS5maW5kKFwiLmZvbGRlci1kcml2ZS1sb2dvPmFcIikuZXEoMCk7XHJcbiAgICAgICAgICAgICAgICB2bS5wYXJhbS5zaXRlLmlzRHJpdmVWZXJpZmllZCA9IChsaW5rVG9Hb29nbGVEcml2ZS5sZW5ndGg+MCAmJiBsaW5rVG9Hb29nbGVEcml2ZVswXS5ocmVmLmluZGV4T2YoXCJkcml2ZS5nb29nbGUuY29tXCIpPjApO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZtLnBhcmFtLnNpdGUuaXNEcml2ZVZlcmlmaWVkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKFwiRGFzIEdvb2dsZURyaXZlLVZlcnplaWNobmlzIGthbm4gbnVuIHZlcndlbmRldCB3ZXJkZW4hXCIsIHZtLnBhcmFtLm1zZ0hlYWRlcik7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgdG9hc3RyLmVycm9yKFwiRGFzIFZlcnplaWNobmlzIGlzdCBrZWluIGfDvGx0aWdlcyBHb29nbGVEcml2ZS1WZXJ6ZWljaG5pcyFcIiwgdm0ucGFyYW0ubXNnSGVhZGVyKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIHZtLnBhcmFtLnNpdGUuaXNEcml2ZVZlcmlmaWVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0b2FzdHIuZXJyb3IoXCJBdWYgZGFzIGFuZ2VnZWJlbmUgVmVyemVpY2huaXMga29ubnRlIG5pY2h0IHp1Z2VncmlmZmVuIHdlcmRlbiFcIiwgdm0ucGFyYW0ubXNnSGVhZGVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICB2bS52ZXJpZnlGbGlja3JVc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHZtLnBhcmFtLnNpdGUuZmxpY2tyVXNlcklELmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICB2bS5wYXJhbS5zaXRlLmlzRmxpY2tyVmVyaWZpZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdmbGlja3IucGVvcGxlLmdldEluZm8nLFxyXG4gICAgICAgICAgICBhcGlfa2V5OiAnJyxcclxuICAgICAgICAgICAgdXNlcl9pZDogdm0ucGFyYW0uc2l0ZS5mbGlja3JVc2VySUQsXHJcbiAgICAgICAgICAgIGZvcm1hdDogJ2pzb24nLFxyXG4gICAgICAgICAgICBub2pzb25jYWxsYmFjazogMVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgSW1hZ2VQcm92aWRlci5sb2FkKCAnaHR0cHM6Ly9hcGkuZmxpY2tyLmNvbS9zZXJ2aWNlcy9yZXN0LycsIHBhcmFtcyApLnRoZW4oXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB2bS5wYXJhbS5zaXRlLmlzRmxpY2tyVmVyaWZpZWQgPSAoZGF0YS5zdGF0PT09J29rJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodm0ucGFyYW0uc2l0ZS5pc0ZsaWNrclZlcmlmaWVkKXtcclxuICAgICAgICAgICAgICAgICAgICB2bS5wYXJhbS5zaXRlLmZsaWNrclVzZXJJRCA9IGRhdGEucGVyc29uLm5zaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MoJ0RpZSBWZXJiaW5kdW5nIG1pdCBCZW51dHplcmtvbnRvICcgKyBkYXRhLnBlcnNvbi51c2VybmFtZS5fY29udGVudCArICcgd3VyZGUgZXJmb2xncmVpY2ggaGVyZ2VzdGVsbHQuJywgdm0ucGFyYW0ubXNnSGVhZGVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB0b2FzdHIuZXJyb3IoJ0RhcyBCZW51dHplcmtvbnRvICcrdm0ucGFyYW0uc2l0ZS5mbGlja3JVc2VySUQrJyBrb25udGUgbmljaHQgZ2VmdW5kZW4gd2VyZGVuIScsIHZtLnBhcmFtLm1zZ0hlYWRlcik7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICB2bS5wYXJhbS5zaXRlLmlzRHJpdmVWZXJpZmllZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdG9hc3RyLmVycm9yKCdBdWYgZGFzIGFuZ2VnZWJlbmUgQmVudXR6ZXJrb250byBrb25udGUgbmljaHQgenVnZWdyaWZmZW4gd2VyZGVuIScsIHZtLnBhcmFtLm1zZ0hlYWRlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdm0udGVzdExvYWRlciA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgJChcIiNsb2FkZXItd3JhcHBlclwiKS5zaG93KDApLmRlbGF5KDMwMDApLmhpZGUoMCk7XHJcbiAgICB9O1xyXG5cclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsIHRvYXN0cil7XHJcblxyXG4gICAgdmFyIHZtID0gdGhpcztcclxuXHJcbiAgICB2bS5wYXJhbSA9ICRyb290U2NvcGUucGFyYW07XHJcbiAgICB2bS5mb3JtYXRzID0gYW5ndWxhci5jb3B5KHZtLnBhcmFtLmZvcm1hdCk7XHJcblxyXG4gICAgdm0ucmVzZXRNb2RlID0gZnVuY3Rpb24oKXtcclxuICAgICAgICB2bS5pc0VkaXRNb2RlID0gdm0uaXNDcmVhdGVNb2RlID0gZmFsc2U7XHJcbiAgICB9OyAgdm0ucmVzZXRNb2RlKCk7XHJcblxyXG4gICAgdm0uaXNLZXlMb2NrZWQgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiAodHlwZW9mIHZtLml0ZW0gPT09ICd1bmRlZmluZWQnID8gZmFsc2UgOiAhdm0uaXRlbS51c2VyKTtcclxuICAgIH07XHJcblxyXG4gICAgdm0ucHJvcG9zZU5hbWUgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZtLml0ZW1uYW1lID0gdXRpbHMubGVnaXRTbHVnKHZtLml0ZW0uc2VsZWN0b3IpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS5jaGFuZ2VDb2xvciA9IGZ1bmN0aW9uKG5hbWUpe1xyXG4gICAgICAgIHZhciBmb3JtYXRPcHRpb25zLCBpZCwgbGluZWJyZWFrLCBuZ01vZGVsQ3RybDtcclxuXHJcbiAgICAgICAgaWYgKCFuYW1lKXtcclxuICAgICAgICAgICAgZm9ybWF0T3B0aW9ucyA9IHZtLml0ZW07IGlkID0gJ0l0ZW0nOyBsaW5lYnJlYWsgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3JtYXRPcHRpb25zID0gdm0ucGFyYW0uZm9ybWF0W25hbWVdOyBpZCA9IG5hbWU7IGxpbmVicmVhayA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3JtYXRPcHRpb25zID0gdXRpbHMuZXh0ZW5kQ29sb3IoZm9ybWF0T3B0aW9ucyk7XHJcbiAgICAgICAgbmdNb2RlbEN0cmwgPSAkKCcjY3NzLScraWQpLmNvbnRyb2xsZXIoJ25nTW9kZWwnKTtcclxuICAgICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHV0aWxzLkpzb25Ub0Nzcyhmb3JtYXRPcHRpb25zLnN0eWxlLCBsaW5lYnJlYWspKTtcclxuICAgICAgICBuZ01vZGVsQ3RybC4kcmVuZGVyKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLmFwcGx5Q29sb3JzID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBjb25zb2xlLmxvZygnY2FsbGVkJyk7XHJcbiAgICAgICAgaWYgKHZtLml0ZW0pe1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2hhbmdlZCcpO1xyXG4gICAgICAgICAgICBpZiAodm0uaXRlbS5zdHlsZS5oYXNPd25Qcm9wZXJ0eSgnY29sb3InKSkgdm0uaXRlbS5jb2xvciA9IHZtLml0ZW0uc3R5bGVbJ2NvbG9yJ107XHJcbiAgICAgICAgICAgIGlmICh2bS5pdGVtLnN0eWxlLmhhc093blByb3BlcnR5KCdiYWNrZ3JvdW5kLWNvbG9yJykpIHZtLml0ZW0uYmdjb2xvciA9IHZtLml0ZW0uc3R5bGVbJ2JhY2tncm91bmQtY29sb3InXTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLmNyZWF0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdm0uaXRlbSA9IHV0aWxzLmV4dGVuZENvbG9yKHtcclxuICAgICAgICAgICAgc2VsZWN0b3I6IFwiXCIsIHRleHQ6IFwiXCIsIHVzZXI6IHRydWUsIGNvbG9yOiBcIiM0NDQ0NDRcIiwgYmdjb2xvcjogXCJ0cmFuc3BhcmVudFwiLCBzdHlsZToge31cclxuICAgICAgICB9KTtcclxuICAgICAgICB2bS5pdGVtbmFtZSA9IFwiXCI7XHJcbiAgICAgICAgdm0uaXNDcmVhdGVNb2RlID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgdm0uZWRpdCA9IGZ1bmN0aW9uKG5hbWUpe1xyXG4gICAgICAgIHZtLml0ZW0gPSBhbmd1bGFyLmNvcHkodm0ucGFyYW0uZm9ybWF0W25hbWVdKTtcclxuICAgICAgICB2bS5pdGVtbmFtZSA9IHZtLml0ZW1uYW1lX2JlZm9yZSA9IG5hbWU7XHJcbiAgICAgICAgdm0uaXNFZGl0TW9kZSA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLnJlbW92ZSA9IGZ1bmN0aW9uKG5hbWUpe1xyXG4gICAgICAgIGRlbGV0ZSB2bS5wYXJhbS5mb3JtYXRbbmFtZV07XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGRvZXNOYW1lRXhpc3QobmV3TmFtZSl7XHJcbiAgICAgICAgdmFyIGRvZXNFeGlzdCA9IChuZXdOYW1lIGluIHZtLnBhcmFtLmZvcm1hdCk7XHJcbiAgICAgICAgaWYgKGRvZXNFeGlzdCkgdG9hc3RyLmVycm9yKCdEZXIgZWluZ2VnZWJlbmUgTmFtZSBleGlzdGllcnQgYmVyZWl0cy4gQml0dGUgdmVyd2VuZGVuIFNpZSBlaW5lIGVpbmRldXRpZ2UgS2VubnVuZy4nLCB2bS5wYXJhbS5tc2dIZWFkZXIpO1xyXG4gICAgICAgIHJldHVybiBkb2VzRXhpc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgdm0uc2F2ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgaWYgKHZtLmlzQ3JlYXRlTW9kZSl7IC8vIENyZWF0ZSBNb2RlXHJcbiAgICAgICAgICAgIGlmIChkb2VzTmFtZUV4aXN0KHZtLml0ZW1uYW1lKSkgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSB7IC8vIEVkaXQgTW9kZVxyXG4gICAgICAgICAgICBpZiAodm0uaXRlbW5hbWUhPT12bS5pdGVtbmFtZV9iZWZvcmUpeyAvLyBOYW1lIHdhcyBjaGFuZ2VkIGR1cmluZyBlZGl0XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9lc05hbWVFeGlzdCh2bS5pdGVtbmFtZSkpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSB2bS5wYXJhbS5mb3JtYXRbdm0uaXRlbW5hbWVfYmVmb3JlXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2bS5wYXJhbS5mb3JtYXRbdm0uaXRlbW5hbWVdID0gdm0uaXRlbTtcclxuICAgICAgICB2bS5yZXNldE1vZGUoKTtcclxuICAgIH07XHJcblxyXG4gICAgdm0uY2FuY2VsID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBpZiAodm0uaXRlbSkgZGVsZXRlIHZtLml0ZW07XHJcbiAgICAgICAgdm0ucmVzZXRNb2RlKCk7XHJcbiAgICB9O1xyXG5cclxufTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBVc2VyU3R5bGVzLCAkbW9kYWxJbnN0YW5jZSl7XHJcblxyXG4gICAgdmFyIHZtID0gdGhpcztcclxuXHJcbiAgICB2bS5wYXJhbSA9ICRyb290U2NvcGUucGFyYW07XHJcblxyXG4gICAgdm0uY2hhbmdlSW5Qcm9wID0gZnVuY3Rpb24oZmllbGRJRCwgdmFsdWUpe1xyXG4gICAgICAgIFVzZXJTdHlsZXMucHVzaERlcGVuZGVuY3koIGZpZWxkSUQsIHZhbHVlICk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLm9rID0gZnVuY3Rpb24oKXsgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTsgfTtcclxuXHJcbiAgICB2bS5jYW5jZWwgPSBmdW5jdGlvbigpeyAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCk7IH07XHJcblxyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgYmFja2dyb3VuZCA9IHJlcXVpcmUoJy4uL2JhY2tncm91bmQuanMnKSxcclxuICAgIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgUHJlZmVyZW5jZXMsIFVwZGF0ZUNoZWNrLCBVc2VyU3R5bGVzLCAkd2luZG93LCAkaW50ZXJ2YWwsICRtb2RhbCl7XHJcbiAgICBcclxuLy8tIERlZmluZSB2aWV3bW9kZWwgYXMgdGhpc1xyXG4gICAgdmFyIHZtID0gdGhpcztcclxuXHJcbi8vLSBHZXQgdGhlIGNvbnNvbGlkYXRlZCBwcmVmZXJlbmNlcyBkYXRhIChpbmNsdWRlcyBzdGFuZGFyZCBhbmQgdXNlciBtb2RpZmllZCBzZXR0aW5ncylcclxuICAgIHZtLnBhcmFtID0gJHJvb3RTY29wZS5wYXJhbSA9IFByZWZlcmVuY2VzLmdldChcImNvbnNvbGlkYXRlZFwiKTtcclxuXHJcbi8vLSBEeW5hbWljYWxseSBnZW5lcmF0ZSBDU1MgZnJvbSB1c2VyIHByZWZlcmVuY2VzIC8gb3ZlcnJpZGVzIChlLmcuIGljb24gY29sb3JzKVxyXG4gICAgVXNlclN0eWxlcy5pbml0UnVsZXNGcm9tUHJlZmVyZW5jZXMoKTtcclxuICAgIHZtLnVzZXJTdHlsZXMgPSAkcm9vdFNjb3BlLnVzZXJTdHlsZXM7XHJcblxyXG4vLy0gU2V0IGJhY2tncm91bmQgaW1hZ2UgYmFzZWQgb24gdGltZSBvZiB0aGUgZGF5IGFuZCB1c2VyIGRlZmluZWQgaW1hZ2UgaXRlbXMvc2xvdHNcclxuICAgIHZhciBVcGRhdGVCYWNrZ3JvdW5kSW1hZ2UgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIGJhY2tncm91bmQuc2V0SW1hZ2Uodm0ucGFyYW0udGltZVNsb3RzKTtcclxuICAgIH07ICBVcGRhdGVCYWNrZ3JvdW5kSW1hZ2UoKTtcclxuXHJcbi8vLSBJbnN0YWxsIGJhY2tncm91bmQgaW1hZ2UgY2hlY2sgcm91dGluZSB0byBiZSBjYWxsZWQgZXZlcnkgNSBzZWNvbmRzXHJcbiAgICB2YXIgY2hlY2tCYWNrZ3JvdW5kVGltZXIgPSAkaW50ZXJ2YWwoIFVwZGF0ZUJhY2tncm91bmRJbWFnZSwgNTAwMCApO1xyXG5cclxuLy8tIE1ha2Ugc3VyZSBpbnRlcnZhbCB0aW1lciB3aWxsIGJlIHJlbW92ZWQgb25jZSBjb250cm9sbGVyIGdldHMgZGVzdHJveWVkXHJcbiAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgJGludGVydmFsLmNhbmNlbChjaGVja0JhY2tncm91bmRUaW1lcik7XHJcbiAgICB9KTtcclxuXHJcbi8vLSBTZXQgZGVmYXVsdCB2YWx1ZSBmb3IgdG9waWNzLnRleHQgaWYgdXNlciBoYXMgbm90IHByb3ZpZGVkIG9uZVxyXG4gICAgaWYgKHZtLnBhcmFtLnRvcGJhci5tZW51SXRlbXMudG9waWNzLnRleHQubGVuZ3RoPT09MClcclxuICAgICAgICB2bS5wYXJhbS50b3BiYXIubWVudUl0ZW1zLnRvcGljcy50ZXh0ID0gdm0ucGFyYW0uc2l0ZUFsaWFzLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4vLy0gQWRqdXN0IHRvcGljcy5jbGFzcyBpZiB0b3BpY2xpc3QtbWFjcm8gaGFzIGZvdW5kL2dlbmVyYXRlZCBhbnkgc3RvcnkgdG9waWNzXHJcbiAgICB2bS5wYXJhbS50b3BiYXIubWVudUl0ZW1zLnRvcGljcy5kcm9wID0gKCQoXCIjdG9vbGJhclRvcGljc1wiKS5oYXMoXCIuZHJvcGRvd25cIikpO1xyXG5cclxuLy8tIEV4dHJhY3QgYnJlYWRjcnVtYi9zcGVjaWFsIG1lbnUgbGlua3MgYW5kIHB1dCB0aGVtIGludG8gdGhlIHNjb3BlXHJcbiAgICB2bS5wYXJhbS50b3BiYXIubWVudUl0ZW1zLmJyZWFkY3J1bWJzLml0ZW1zID0gdXRpbHMuZ2V0QnJlYWRjcnVtYnMoKTtcclxuICAgIC8vY29uc29sZS5kaXIodm0ucGFyYW0udG9wYmFyLm1lbnVJdGVtcy5icmVhZGNydW1icy5pdGVtcyk7XHJcbiAgICB2bS5wYXJhbS50b3BiYXIubWVudUl0ZW1zLmFiby5pdGVtcyA9IHV0aWxzLmdldFNwZWNpYWxNZW51KFwiI2Fib01lbnVcIik7XHJcbiAgICB2bS5wYXJhbS50b3BiYXIubWVudUl0ZW1zLmltYWdlcy5pdGVtcyA9IHV0aWxzLmdldFNwZWNpYWxNZW51KFwiI2ltYWdlTWVudVwiKTtcclxuXHJcbi8vLSBBZGQgdXRpbGl0eSBmdW5jdGlvbnMgdG8gYmUgdXNlZCBpbiBuZy1mdW5jdGlvbnMgKHZpZXcpXHJcbiAgICB2bS5wYXJhbS5pc0xvZ2dlZEluID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gKHZtLnBhcmFtLnVzZXJOYW1lLmxlbmd0aD4wKTtcclxuICAgIH07XHJcbiAgICB2bS5wYXJhbS5pc0FkbWluID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gKHZtLnBhcmFtLmlzTG9nZ2VkSW4oKSAmJiB2bS5wYXJhbS51c2VyUm9sZSgpPT09XCJBZG1pbmlzdHJhdG9yXCIpO1xyXG4gICAgfTtcclxuICAgIHZtLnBhcmFtLmlzQ29udHJpYnV0b3IgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiAodm0ucGFyYW0uaXNMb2dnZWRJbigpICYmICh2bS5wYXJhbS51c2VyUm9sZSgpPT09XCJDb250cmlidXRvclwiIHx8IHZtLnBhcmFtLnVzZXJSb2xlKCk9PT1cIkFkbWluaXN0cmF0b3JcIikpO1xyXG4gICAgfTtcclxuICAgIHZtLnBhcmFtLnNlbmRNYWlsID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1dGlscy5yb3QxMyh2bS5wYXJhbS50b3BiYXIubWFpbEljb24uaHJlZik7XHJcbiAgICB9O1xyXG5cclxuLy8tIFdoZW4gdHJ1ZSAodXNlciBjbGlja2VkIHRoZSBjbG9zZSBidXR0b24pLCBpdCB0cmlnZ2VycyB0aGUgZmFkZW91dCBvZiB0aGUgcmVzcG9uc2UgYWxlcnQtYm94XHJcbiAgICB2bS5tc2dDbG9zZSA9IGZhbHNlO1xyXG5cclxuICAgIHZtLmN1c3RvbWl6ZSA9IHtcclxuXHJcbiAgICAgICAgaGlkZTogZnVuY3Rpb24oKXsgJCgnI2Y1Y29udGFpbmVyJykuZmFkZU91dCg0MDApOyB9LFxyXG5cclxuICAgICAgICBzaG93OiBmdW5jdGlvbigpeyAkKCcjZjVjb250YWluZXInKS5mYWRlSW4oNDAwKTsgfSxcclxuXHJcbiAgICAgICAgbG9hZFNwZWN0cnVtOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG9wZW46IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgICAgIE1vZGVybml6ci5sb2FkKFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRlc3Q6ICh0eXBlb2YgJC5mbi5zcGVjdHJ1bSA9PT0gXCJ1bmRlZmluZWRcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgeWVwOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9zcGVjdHJ1bS8xLjcuMC9zcGVjdHJ1bS5taW4uY3NzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2h0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL3NwZWN0cnVtLzEuNy4wL3NwZWN0cnVtLm1pbi5qcydcclxuICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2FsaXphdGlvbiA9ICQuc3BlY3RydW0ubG9jYWxpemF0aW9uW1wiZGVcIl0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxUZXh0OiBcIkFiYnJlY2hlblwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hvb3NlVGV4dDogXCJXw6RobGVuXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRleHQ6IFwiRmFyYmF1c3dhaGwgenVyw7xja3NldHplblwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9Db2xvclNlbGVjdGVkVGV4dDogXCJLZWluZSBGYXJiZSBhdXNnZXfDpGhsdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlUGFsZXR0ZU1vcmVUZXh0OiBcIk1laHJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZVBhbGV0dGVMZXNzVGV4dDogXCJXZW5pZ2VyXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgc3BlY3RydW1EZWZhdWx0cyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsbG93RW1wdHk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGlja291dEZpcmVzQ2hhbmdlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZUtleTogXCJmNXNwZWN0cnVtXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmZXJyZWRGb3JtYXQ6IFwiaGV4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93QWxwaGE6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93SW5pdGlhbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dJbnB1dDogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJC5leHRlbmQoJC5mbi5zcGVjdHJ1bS5kZWZhdWx0cywgc3BlY3RydW1EZWZhdWx0cywgbG9jYWxpemF0aW9uKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb3B5T2ZQYXJhbSA9ICQuZXh0ZW5kKHRydWUsIHt9LCB2bS5wYXJhbSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW9kYWxDdXN0b21pemUgPSAkbW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJjdXN0b21pemVCbG9nSHRtbFwiLCAvLyBpbiBTaXRlLW5nVGVtcGxhdGVzLmphZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICBcIkN1c3RvbWl6ZUN0cmwgYXMgY3VzdG9taXplXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tkcm9wOiBcInN0YXRpY1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5Ym9hcmQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Q2xhc3M6IFwieGxhcmdlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RhbEN1c3RvbWl6ZS5yZXN1bHQudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCl7IC8vIFVzZXIgY29uZmlybWVkIGNoYW5nZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYW5ndWxhci5lcXVhbHMoY29weU9mUGFyYW0sIHZtLnBhcmFtKSkgUHJlZmVyZW5jZXMuc2F2ZSh2bS5wYXJhbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKXsgLy8gVXNlciBjYW5jZWxsZWQgY2hhbmdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhbmd1bGFyLmVxdWFscyhjb3B5T2ZQYXJhbSwgdm0ucGFyYW0pKSB2bS5wYXJhbSA9IGNvcHlPZlBhcmFtO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuLy8tIENoZWNrIGZvciBhdmFpbGFibGUgdXBkYXRlcyBpZiB1c2VyIGlzIGFkbWluIGFuZCBjaGVjayBmcmVxdWVuY3kgaXMgbm90IFwibmV2ZXJcIlxyXG4gICAgaWYgKHZtLnBhcmFtLmlzQWRtaW4oKSAmJiB2bS5wYXJhbS51cGRhdGUuZ2FwPjApe1xyXG4gICAgICAgIFVwZGF0ZUNoZWNrLm9uTG9hZCh2bS5wYXJhbSk7XHJcbiAgICB9XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsIFVzZXJTdHlsZXMpe1xyXG5cclxuICAgIHZhciB2bSA9IHRoaXM7XHJcblxyXG4gICAgdm0ucGFyYW0gPSAkcm9vdFNjb3BlLnBhcmFtO1xyXG5cclxufTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkcm9vdFNjb3BlKXtcclxuXHJcbiAgICB2YXIgdm0gPSB0aGlzO1xyXG5cclxuICAgIHZtLnBhcmFtID0gJHJvb3RTY29wZS5wYXJhbTtcclxuICAgIHZtLmlzQ3JlYXRlTW9kZSA9IHZtLmlzRWRpdE1vZGUgPSBmYWxzZTtcclxuXHJcbiAgICB2bS5nZXRJY29uID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gdXRpbHMuZ2V0SWNvbih2bS5wYXJhbS50b3BiYXIuYWRkQ3VzdG9tTWVudS5pY29uKTtcclxuICAgIH07XHJcblxyXG4gICAgdm0uZ2V0RW50cnlUeXBlID0gZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgdHlwZSA9ICh0eXBlb2Ygdm0uZW50cnkgPT09IFwidW5kZWZpbmVkXCIgPyBmYWxzZSA6IHZtLmVudHJ5LmxpbmspO1xyXG4gICAgICAgIHJldHVybiAodHlwZSA/ICdMaW5rdGV4dCcgOiAnw5xiZXJzY2hyaWZ0Jyk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLmNyZWF0ZSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdm0uZW50cnkgPSB7IGxpbms6IHRydWUsIHRleHQ6ICcnLCBocmVmOiAnJyB9O1xyXG4gICAgICAgIHZtLmlzQ3JlYXRlTW9kZSA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLmVkaXQgPSBmdW5jdGlvbihpbmRleCl7XHJcbiAgICAgICAgdm0uZW50cnkgPSBhbmd1bGFyLmNvcHkodm0ucGFyYW0udG9wYmFyLmFkZEN1c3RvbU1lbnUuaXRlbXNbaW5kZXhdKTtcclxuICAgICAgICB2bS5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHZtLmlzRWRpdE1vZGUgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS5yZW1vdmUgPSBmdW5jdGlvbihpbmRleCl7XHJcbiAgICAgICAgdm0ucGFyYW0udG9wYmFyLmFkZEN1c3RvbU1lbnUuaXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH07XHJcblxyXG4gICAgdm0ubW92ZXVwID0gZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgICAgIGlmIChpbmRleD4wKSB1dGlscy5zd2FwKHZtLnBhcmFtLnRvcGJhci5hZGRDdXN0b21NZW51Lml0ZW1zLCBpbmRleCwgaW5kZXgtMSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLm1vdmVkb3duID0gZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgICAgIGlmIChpbmRleDx2bS5wYXJhbS50b3BiYXIuYWRkQ3VzdG9tTWVudS5pdGVtcy5sZW5ndGgtMSkgdXRpbHMuc3dhcCh2bS5wYXJhbS50b3BiYXIuYWRkQ3VzdG9tTWVudS5pdGVtcywgaW5kZXgsIGluZGV4KzEpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS5zYXZlID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBpZiAodm0uaXNDcmVhdGVNb2RlKVxyXG4gICAgICAgICAgICB2bS5wYXJhbS50b3BiYXIuYWRkQ3VzdG9tTWVudS5pdGVtcy5wdXNoKHZtLmVudHJ5KTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHZtLnBhcmFtLnRvcGJhci5hZGRDdXN0b21NZW51Lml0ZW1zW3ZtLmluZGV4XSA9IHZtLmVudHJ5O1xyXG4gICAgICAgIHZtLmlzRWRpdE1vZGUgPSB2bS5pc0NyZWF0ZU1vZGUgPSBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgdm0uY2FuY2VsID0gZnVuY3Rpb24oKXtcclxuICAgICAgICB2bS5pc0NyZWF0ZU1vZGUgPSB2bS5pc0VkaXRNb2RlID0gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxufTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgVXNlclN0eWxlcyl7XHJcblxyXG4gICAgdmFyIHZtID0gdGhpcztcclxuXHJcbiAgICB2bS5wYXJhbSA9ICRyb290U2NvcGUucGFyYW07XHJcbiAgICB2bS5pc0NyZWF0ZU1vZGUgPSB2bS5pc0VkaXRNb2RlID0gZmFsc2U7XHJcblxyXG4gICAgdm0uZ2V0TWVudUljb24gPSBmdW5jdGlvbihmYUljb25uYW1lKXtcclxuICAgICAgICByZXR1cm4gdXRpbHMuZ2V0SWNvbihmYUljb25uYW1lIHx8ICcnKTtcclxuICAgIH07XHJcblxyXG4gICAgdm0uZ2V0UHJldmlld0NsYXNzID0gZnVuY3Rpb24oKXtcclxuICAgICAgICByZXR1cm4gKHR5cGVvZiB2bS5pY29uID09PSAndW5kZWZpbmVkJyA/ICcnIDogJ21lbnVzcGVjaWFsLScrdm0uaWNvbi5uYW1lKTtcclxuICAgIH07XHJcblxyXG4gICAgdm0uaXNLZXlMb2NrZWQgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiAodHlwZW9mIHZtLmljb24gPT09ICd1bmRlZmluZWQnID8gZmFsc2UgOiAhdm0uaWNvbi51c2VyKTtcclxuICAgIH07XHJcblxyXG4gICAgdm0uaXNVcmxMb2NrZWQgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiAodHlwZW9mIHZtLmljb24gPT09ICd1bmRlZmluZWQnID8gZmFsc2UgOiB2bS5pY29uLm5hbWU9PT0nY3VzdG9taXplJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLmNoYW5nZUNvbG9yID0gZnVuY3Rpb24oKXtcclxuICAgICAgICBVc2VyU3R5bGVzLnNldFJ1bGUoJy5tZW51c3BlY2lhbC0nK3ZtLmljb24ubmFtZSsnIGknLCBVc2VyU3R5bGVzLmZvcm1hdFJ1bGUoJ2NvbG9yJywgdm0uaWNvbi5jb2xvciwgdHJ1ZSkpLnB1c2hDU1MoKTtcclxuICAgIH07XHJcblxyXG4gICAgdm0uY2hhbmdlSG92ZXIgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIFVzZXJTdHlsZXMuc2V0UnVsZSgnbGk6aG92ZXIgLm1lbnVzcGVjaWFsLScrdm0uaWNvbi5uYW1lKycgaScsIFVzZXJTdHlsZXMuZm9ybWF0UnVsZSgnY29sb3InLCB2bS5pY29uLmhvdmVyLCB0cnVlKSkucHVzaENTUygpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS5jcmVhdGUgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZtLmljb24gPSB7XHJcbiAgICAgICAgICAgIFwibmFtZVwiOiBcIlwiLCBcImFjdGl2YXRlXCI6IHRydWUsIFwidGV4dFwiOiBcIlwiLCBcImljb25cIjogXCJmYS1xdWVzdGlvblwiLCBcImRpdmlkZXJcIjogdHJ1ZSxcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIk5ldWVzIEljb25cIiwgXCJocmVmXCI6IFwiXCIsIFwiY29sb3JcIjogdm0ucGFyYW0udG9wYmFyLm1lbnVJY29uQ29sb3IsXHJcbiAgICAgICAgICAgIFwiaG92ZXJcIjogXCIjZmZmXCIsIFwidXNlclwiOiB0cnVlLCBcInBvc2l0aW9uXCI6IHZtLnBhcmFtLnRvcGJhci5zcGVjaWFsSWNvbnMubGVuZ3RoXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2bS5pc0NyZWF0ZU1vZGUgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICB2bS5lZGl0ID0gZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgICAgIHZtLmljb24gPSB2bS5wYXJhbS50b3BiYXIuc3BlY2lhbEljb25zW2luZGV4XTtcclxuICAgICAgICB2bS5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHZtLmlzRWRpdE1vZGUgPSB0cnVlO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgcmVudW1iZXJQb3NpdGlvbnMgPSBmdW5jdGlvbihmcm9tKXtcclxuICAgICAgICBmb3IgKHZhciBpPU1hdGgubWF4KGZyb20sMCksIGxlbj12bS5wYXJhbS50b3BiYXIuc3BlY2lhbEljb25zLmxlbmd0aDsgaTxsZW47ICsraSl7XHJcbiAgICAgICAgICAgIHZtLnBhcmFtLnRvcGJhci5zcGVjaWFsSWNvbnNbaV0ucG9zaXRpb24gPSBpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdm0ucmVtb3ZlID0gZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgICAgIHZtLnBhcmFtLnRvcGJhci5zcGVjaWFsSWNvbnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICByZW51bWJlclBvc2l0aW9ucyhpbmRleCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLm1vdmV1cCA9IGZ1bmN0aW9uKGluZGV4KXtcclxuICAgICAgICBpZiAoaW5kZXg+MCl7XHJcbiAgICAgICAgICAgIHV0aWxzLnN3YXAodm0ucGFyYW0udG9wYmFyLnNwZWNpYWxJY29ucywgaW5kZXgsIGluZGV4LTEpO1xyXG4gICAgICAgICAgICByZW51bWJlclBvc2l0aW9ucyhpbmRleC0xKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLm1vdmVkb3duID0gZnVuY3Rpb24oaW5kZXgpe1xyXG4gICAgICAgIGlmIChpbmRleDx2bS5wYXJhbS50b3BiYXIuc3BlY2lhbEljb25zLmxlbmd0aC0xKXtcclxuICAgICAgICAgICAgdXRpbHMuc3dhcCh2bS5wYXJhbS50b3BiYXIuc3BlY2lhbEljb25zLCBpbmRleCwgaW5kZXgrMSk7XHJcbiAgICAgICAgICAgIHJlbnVtYmVyUG9zaXRpb25zKGluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLnNhdmUgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIGlmICh2bS5pc0NyZWF0ZU1vZGUpXHJcbiAgICAgICAgICAgIHZtLnBhcmFtLnRvcGJhci5zcGVjaWFsSWNvbnMucHVzaCh2bS5pY29uKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHZtLnBhcmFtLnRvcGJhci5zcGVjaWFsSWNvbnNbdm0uaW5kZXhdID0gdm0uaWNvbjtcclxuICAgICAgICB2bS5pc0VkaXRNb2RlID0gdm0uaXNDcmVhdGVNb2RlID0gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIHZtLmNhbmNlbCA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdm0uaXNDcmVhdGVNb2RlID0gdm0uaXNFZGl0TW9kZSA9IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJHJvb3RTY29wZSl7XHJcblxyXG4gICAgdmFyIHZtID0gdGhpcztcclxuXHJcbiAgICB2bS5wYXJhbSA9ICRyb290U2NvcGUucGFyYW07XHJcblxyXG4gICAgdm0uZ2V0TWVudUljb24gPSBmdW5jdGlvbihpdGVtKXtcclxuICAgICAgICByZXR1cm4gdXRpbHMuZ2V0SWNvbih2bS5wYXJhbS50b3BiYXIubWVudUl0ZW1zW2l0ZW1dLmljb24pO1xyXG4gICAgfVxyXG5cclxufTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogQnJvd3NlcmlmeSBhbGwgY29udHJvbGxlcnNcclxuICpcclxuICovXHJcblxyXG4odHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5hbmd1bGFyIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5hbmd1bGFyIDogbnVsbClcclxuICAgIC5tb2R1bGUoJ2Y1U2tpbkFwcCcpXHJcbiAgICAuY29udHJvbGxlcignRjVNYWluQ3RybCcsIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnUHJlZmVyZW5jZXMnLCAnVXBkYXRlQ2hlY2snLCAnVXNlclN0eWxlcycsICckd2luZG93JywgJyRpbnRlcnZhbCcsICckbW9kYWwnLCByZXF1aXJlKCcuL0Y1TWFpbkN0cmwnKV0pXHJcbiAgICAuY29udHJvbGxlcignQ3VzdG9taXplQ3RybCcsIFsnJHJvb3RTY29wZScsICdVc2VyU3R5bGVzJywgJyRtb2RhbEluc3RhbmNlJywgcmVxdWlyZSgnLi9DdXN0b21pemVDdHJsJyldKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0N1c3RDb3JlRGF0YUN0cmwnLCBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ0ltYWdlUHJvdmlkZXInLCAnVXNlclN0eWxlcycsICd0b2FzdHInLCByZXF1aXJlKCcuL0N1c3RDb3JlRGF0YUN0cmwnKV0pXHJcbiAgICAuY29udHJvbGxlcignQ3VzdEJhY2tncm91bmRzQ3RybCcsIFsnJHJvb3RTY29wZScsICdJbWFnZVByb3ZpZGVyJywgJyR3aW5kb3cnLCAndG9hc3RyJywgcmVxdWlyZSgnLi9DdXN0QmFja2dyb3VuZHNDdHJsJyldKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0N1c3RUeXBvZ3JhcGh5Q3RybCcsIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAndG9hc3RyJywgcmVxdWlyZSgnLi9DdXN0VHlwb2dyYXBoeUN0cmwnKV0pXHJcbiAgICAuY29udHJvbGxlcignQ3VzdEFwcFVwZGF0ZUN0cmwnLCBbJyRyb290U2NvcGUnLCAnJGZpbHRlcicsICckcScsICdVcGRhdGVDaGVjaycsICdUd29kYXlTa2luJywgJ3RvYXN0cicsIHJlcXVpcmUoJy4vQ3VzdEFwcFVwZGF0ZUN0cmwnKV0pXHJcbiAgICAuY29udHJvbGxlcignTWVudUJhc2ljT3B0aW9uc0N0cmwnLCBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ1VzZXJTdHlsZXMnLCByZXF1aXJlKCcuL01lbnVCYXNpY09wdGlvbnNDdHJsJyldKVxyXG4gICAgLmNvbnRyb2xsZXIoJ01lbnVTdGFuZGFyZEl0ZW1zQ3RybCcsIFsnJHJvb3RTY29wZScsIHJlcXVpcmUoJy4vTWVudVN0YW5kYXJkSXRlbXNDdHJsJyldKVxyXG4gICAgLmNvbnRyb2xsZXIoJ01lbnVDdXN0b21JdGVtc0N0cmwnLCBbJyRyb290U2NvcGUnLCByZXF1aXJlKCcuL01lbnVDdXN0b21JdGVtc0N0cmwnKV0pXHJcbiAgICAuY29udHJvbGxlcignTWVudVNwZWNpYWxJdGVtc0N0cmwnLCBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ1VzZXJTdHlsZXMnLCByZXF1aXJlKCcuL01lbnVTcGVjaWFsSXRlbXNDdHJsJyldKTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICByZXF1aXJlOiAnbmdNb2RlbCcsXHJcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdNb2RlbCl7XHJcblxyXG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nIGlmIG5vIG5nLW1vZGVsXHJcbiAgICAgICAgICAgIGlmICghbmdNb2RlbCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgbmdNb2RlbC4kcmVuZGVyID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsKG5nTW9kZWwuJHZpZXdWYWx1ZSB8fCAnJyk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBtb2RlbCB0byB2aWV3XHJcbiAgICAgICAgICAgIG5nTW9kZWwuJGZvcm1hdHRlcnMucHVzaChmdW5jdGlvbihzdHlsZUpzb24pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1dGlscy5Kc29uVG9Dc3Moc3R5bGVKc29uLCBhdHRycy5kaXZpZGU9PT0nbGluZWJyZWFrJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gdmlldyB0byBtb2RlbFxyXG4gICAgICAgICAgICBuZ01vZGVsLiRwYXJzZXJzLnB1c2goZnVuY3Rpb24oY3NzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3R5bGVKc29uID0ge30sIGNvbG9uLCBzdHlsZSwgYXR0cjtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChjc3Muc3BsaXQoJzsnKSwgZnVuY3Rpb24oc3R5bGVUYWcpe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHlsZVRhZy5sZW5ndGg9PT0wKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvbiA9IHN0eWxlVGFnLmluZGV4T2YoJzonKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sb248MCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5nTW9kZWwuJHNldFZhbGlkaXR5KCdtaXNzaW5nQ29sb24nLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgbmdNb2RlbC4kc2V0VmFsaWRpdHkoJ21pc3NpbmdDb2xvbicsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlID0gJC50cmltKHN0eWxlVGFnLnN1YnN0cigwLGNvbG9uKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0ciA9ICQudHJpbShzdHlsZVRhZy5zdWJzdHIoY29sb24rMSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlSnNvbltzdHlsZV0gPSBhdHRyO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3R5bGVKc29uO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzLmpzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcclxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZ01vZGVsKXtcclxuXHJcbiAgICAgICAgICAvLyBtb2RlbCB0byB2aWV3XHJcbiAgICAgICAgICBuZ01vZGVsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gdXRpbHMucm90MTModmFsdWUpLnJlcGxhY2UoJ21haWx0bzonLCAnJyk7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAvLyB2aWV3IHRvIG1vZGVsXHJcbiAgICAgICAgICBuZ01vZGVsLiRwYXJzZXJzLnB1c2goZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgICB2YWx1ZSA9ICQudHJpbSh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgaWYgKHZhbHVlLmluZGV4T2YoJ21haWx0bzonKTwwKSB2YWx1ZSA9ICdtYWlsdG86JyArIHZhbHVlO1xyXG4gICAgICAgICAgICAgIHJldHVybiB1dGlscy5yb3QxMyh2YWx1ZSk7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59OyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBCcm93c2VyaWZ5IGFsbCBkaXJlY3RpdmVzXHJcbiAqXHJcbiAqL1xyXG5cclxuKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuYW5ndWxhciA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuYW5ndWxhciA6IG51bGwpXHJcbiAgICAubW9kdWxlKCdmNVNraW5BcHAnKVxyXG4gICAgLmRpcmVjdGl2ZSgnY29udmVydGNzcycsIFtyZXF1aXJlKCcuL2NvbnZlcnRjc3MnKV0pXHJcbiAgICAuZGlyZWN0aXZlKCdlbmNvZGUnLCBbcmVxdWlyZSgnLi9lbmNvZGUnKV0pXHJcbiAgICAuZGlyZWN0aXZlKCdyZXNpemFibGUnLCBbJyR3aW5kb3cnLCByZXF1aXJlKCcuL3Jlc2l6YWJsZScpXSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkd2luZG93KXtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXNpemVQaG90b0NvbnRhaW5lciA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUud2lkdGggPSAkZWxlbWVudC53aWR0aCgpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmhlaWdodCA9IE1hdGgucm91bmQoJHNjb3BlLndpZHRoLzEuNSk7XHJcbiAgICAgICAgICAgICAgICAkZWxlbWVudC5jc3MoJ2hlaWdodCcsICRzY29wZS5oZWlnaHQrJ3B4Jyk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdykuYmluZCgncmVzaXplJywgcmVzaXplUGhvdG9Db250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgcmVzaXplUGhvdG9Db250YWluZXIoKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59OyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJGNhY2hlRmFjdG9yeSwgaXRlbSl7XHJcblxyXG4gICAgcmV0dXJuICRjYWNoZUZhY3RvcnkoaXRlbSk7XHJcblxyXG59OyIsIid1c2Ugc3RyaWN0JztcclxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJGh0dHAsICRxKXtcclxuXHJcbiAgICByZXR1cm4ge1xyXG5cclxuICAgICAgICBsb2FkOiBmdW5jdGlvbih1cmwsIHBhcmFtcyl7XHJcblxyXG4gICAgICAgICAgICB2YXIgcSA9ICRxLmRlZmVyKCksIGNvbmZpZyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgY29uZmlnLnBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcclxuICAgICAgICAgICAgaWYgKCdhcGlfa2V5JyBpbiBjb25maWcucGFyYW1zKSBjb25maWcucGFyYW1zLmFwaV9rZXkgPSB1dGlscy5nZXRSZXF1ZXN0SUQoKTtcclxuXHJcbiAgICAgICAgICAgICRodHRwLmdldCggdXJsLCBjb25maWcgKVxyXG5cclxuICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpIHsgcS5yZXNvbHZlKGRhdGEpOyB9KVxyXG4gICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cyl7IHEucmVqZWN0KFtdLCBzdGF0dXMpOyB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBxLnByb21pc2U7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGpzb25kaWZmID0gcmVxdWlyZSgncmZjNjkwMi1qc29uLWRpZmYnKSxcclxuICAgIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQ2FjaGVJdGVtLCBUd29kYXlTa2luLCB0b2FzdHIpe1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgLy8tLSB0eXBlOiBcInN0YW5kYXJkXCIgb3IgXCJjb25zb2xpZGF0ZWRcIiAoaW5jbC4gdXNyUHJlZmVyZW5jZXMpXHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbih0eXBlKXtcclxuXHJcbiAgICAgICAgICAgIC8vLSBSZWFkIHByZWZlcmVuY2VzIGZyb20gY2FjaGVcclxuICAgICAgICAgICAgdmFyIGNhY2hlZFByZWZlcmVuY2VzID0gQ2FjaGVJdGVtLmdldCh0eXBlKydQcmVmZXJlbmNlcycpO1xyXG5cclxuICAgICAgICAgICAgLy8tIEhhdmUgdGhleSBiZWVuIGNhY2hlZCBiZWZvcmU/XHJcbiAgICAgICAgICAgIGlmIChjYWNoZWRQcmVmZXJlbmNlcyl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FjaGVkUHJlZmVyZW5jZXM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8tIENvbnNvbGlkYXRlIChkZWVwIG1lcmdlKSBzdGFuZGFyZFByZWZlcmVuY2VzLCB1c2VyUHJlZmVyZW5jZXMgYW5kIGdlbmVyaWMgY29yZSBpbmZvIGZyb20gVHdvZGF5IG1hY3Jvc1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0ZFByZWZlcmVuY2VzID0gSlNPTi5wYXJzZSgkKFwiI3N0ZFByZWZlcmVuY2VzXCIpLnRleHQoKSB8fCBcInt9XCIpLFxyXG4gICAgICAgICAgICAgICAgICAgIHVzclByZWZlcmVuY2VzID0gKHR5cGUgPT09IFwiY29uc29saWRhdGVkXCIgPyBKU09OLnBhcnNlKCQoXCIjdXNyUHJlZmVyZW5jZXNcIikudGV4dCgpIHx8IFwie31cIikgOiB7fSksXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlZmVyZW5jZXMgPSAkLmV4dGVuZCggdHJ1ZSwge30sIHN0ZFByZWZlcmVuY2VzLCB1c3JQcmVmZXJlbmNlcywgd2luZG93LmY1Q29yZUluZm8gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLy0gUGFyc2Ugc3RyaW5naWZpZWQvY29udmVydGVkIGRhdGVzIGFuZCByZS1jb252ZXJ0IHRvIHRydWUgZGF0ZSBmb3JtYXRcclxuICAgICAgICAgICAgICAgIHByZWZlcmVuY2VzLnVwZGF0ZS5sYXN0Q2hlY2sgPSBuZXcgRGF0ZShEYXRlLnBhcnNlKHByZWZlcmVuY2VzLnVwZGF0ZS5sYXN0Q2hlY2spKTtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChwcmVmZXJlbmNlcy50aW1lU2xvdHMsIGZ1bmN0aW9uIChzbG90KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xvdC5mcm9tID0gbmV3IERhdGUoMTk3MCwgMCwgMSwgKHNsb3QuZnJvbSAvIDYwID4+IDApLCAoc2xvdC5mcm9tICUgNjApLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBzbG90LnRvID0gbmV3IERhdGUoMTk3MCwgMCwgMSwgKHNsb3QudG8gLyA2MCA+PiAwKSwgKHNsb3QudG8gJSA2MCksIDApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8tIEFkZCBhbGwgZm9ybWF0IGNvbG9yL2JhY2tncm91bmQtY29sb3IgYXR0cmlidXRlcyB0byB0aGUgc3R5bGUgb3B0aW9uXHJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gocHJlZmVyZW5jZXMuZm9ybWF0LCBmdW5jdGlvbihvcHRpb25zKXtcclxuICAgICAgICAgICAgICAgICAgICB1dGlscy5leHRlbmRDb2xvcihvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vLSBQdXQgcHJlZmVyZW5jZXMgaW50byBjYWNoZSBhcmVhXHJcbiAgICAgICAgICAgICAgICBDYWNoZUl0ZW0ucHV0KHR5cGUrJ1ByZWZlcmVuY2VzJywgcHJlZmVyZW5jZXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vLSBhbmQgcmV0dXJuIHRoZSBwcmVmZXJlbmNlcyBvYmplY3RcclxuICAgICAgICAgICAgICAgIHJldHVybiBwcmVmZXJlbmNlcztcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcmVmYWN0b3I6IGZ1bmN0aW9uKHBhcmFtKXtcclxuXHJcbiAgICAgICAgICAgIHZhciBwcmVmcyA9IHt9O1xyXG4gICAgICAgICAgICAkLmV4dGVuZCggdHJ1ZSwgcHJlZnMsIHBhcmFtICk7XHJcbiAgICAgICAgICAgIC8vLSBSZWZhY3RvciB0aW1lc2xvdHMgdG8gYSBtaW51dGUgbnVtYmVyXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChwcmVmcy50aW1lU2xvdHMsIGZ1bmN0aW9uIChzbG90KSB7XHJcbiAgICAgICAgICAgICAgICBzbG90LmZyb20gPSB1dGlscy5nZXRNaW51dGUoc2xvdC5mcm9tKTtcclxuICAgICAgICAgICAgICAgIHNsb3QudG8gPSB1dGlscy5nZXRNaW51dGUoc2xvdC50byk7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNsb3QuJCRoYXNoS2V5ICE9PSAndW5kZWZpbmVkJykgZGVsZXRlKHNsb3QuJCRoYXNoS2V5KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vLSBSZW1vdmUgdGhlIGZvcm1hdCBjb2xvci9iYWNrZ3JvdW5kLWNvbG9yIGF0dHJpYnV0ZXMgZnJvbSB0aGUgc3R5bGUgb3B0aW9uXHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChwcmVmcy5mb3JtYXQsIGZ1bmN0aW9uKG9wdGlvbnMpe1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuZXh0cmFjdENvbG9yKG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHByZWZzO1xyXG5cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBzYXZlOiBmdW5jdGlvbihwYXJhbSl7XHJcblxyXG4gICAgICAgICAgICB2YXIgc3RkUHJlZmVyZW5jZXMgPSB0aGlzLmdldChcInN0YW5kYXJkXCIpLFxyXG4gICAgICAgICAgICAgICAgdXNyUHJlZmVyZW5jZXMgPSB7fSxcclxuICAgICAgICAgICAgICAgIGNsZWFuUGFyYW0gPSB0aGlzLnJlZmFjdG9yKHBhcmFtKSxcclxuICAgICAgICAgICAgICAgIHBhdGNoID0ganNvbmRpZmYoc3RkUHJlZmVyZW5jZXMsIHBhcmFtKSxcclxuICAgICAgICAgICAgICAgIGV4Y2x1ZGVzID0gJyQkfHVwZGF0ZS92ZXJzaW9ufHRvcGljcy9kcm9wfGJyZWFkY3J1bWJzL2l0ZW1zfGltYWdlcy9pdGVtc3xhYm8vaXRlbXMnLnNwbGl0KCd8JyksXHJcbiAgICAgICAgICAgICAgICBpLCBsZW4sIG5hbWVzLCBvYmpQYXRoLCBhcnJheUNoZWNrO1xyXG5cclxuICAgICAgICAgICAgLy8tIHNhdmUgY29uc29saWRhdGVkIHBhcmFtIGFzIHdlbGwgdG8gdGhlIGNhY2hlXHJcbiAgICAgICAgICAgIENhY2hlSXRlbS5wdXQoJ2NvbnNvbGlkYXRlZFByZWZlcmVuY2VzJywgcGFyYW0pO1xyXG5cclxuICAgICAgICAgICAgLy9jb25zb2xlLmRpcihwYXRjaCk7XHJcbiAgICAgICAgICAgICQuZWFjaCggcGF0Y2gsIGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8tIGRvIG5vdCBpbmNsdWRlIGZ1bmN0aW9ucyB3aGF0c29ldmVyXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMudmFsdWUgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8tIHRlc3QgZm9yIGV4Y2x1ZGVzIHRvIGJlIGlnbm9yZWRcclxuICAgICAgICAgICAgICAgIGZvciAoaT0wLCBsZW49ZXhjbHVkZXMubGVuZ3RoOyBpPGxlbjsgKytpKXtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXRoLmluZGV4T2YoZXhjbHVkZXNbaV0pPj0wKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLy0gZWxpbWluYXRlIDFzdCBzbGFzaCBhbmQgc3BsaXQgcGF0aCBpbnRvIGZpZWxkIG5hbWVzIChlLmcuIFwiL3NpdGUvdGl0bGVcIiAtLT4gW1wic2l0ZVwiLCBcInRpdGxlXCJdKVxyXG4gICAgICAgICAgICAgICAgbmFtZXMgPSB0aGlzLnBhdGguc3Vic3RyKDEpLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgICAgICAgICBvYmpQYXRoID0gJ3VzclByZWZlcmVuY2VzJztcclxuICAgICAgICAgICAgICAgIGZvciAoaT0wLCBsZW49bmFtZXMubGVuZ3RoOyBpPGxlbjsgKytpKXtcclxuICAgICAgICAgICAgICAgICAgICBvYmpQYXRoICs9ICcuJytuYW1lc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSsxID09PSBsZW4pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMudmFsdWUuJCRoYXNoS2V5ICE9PSAndW5kZWZpbmVkJykgZGVsZXRlKHRoaXMudmFsdWUuJCRoYXNoS2V5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZhbChvYmpQYXRoKyc9dGhpcy52YWx1ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5Q2hlY2sgPSAnY2xlYW5QYXJhbS4nK29ialBhdGguc3Vic3RyKDE1KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2YWwoJ2FuZ3VsYXIuaXNBcnJheSgnK2FycmF5Q2hlY2srJyknKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXZhbCgndHlwZW9mICcgKyBvYmpQYXRoKSA9PT0gJ3VuZGVmaW5lZCcpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2YWwob2JqUGF0aCsnPScrYXJyYXlDaGVjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldmFsKCd0eXBlb2YgJyArIG9ialBhdGgpID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2YWwob2JqUGF0aCArICc9e30nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBUd29kYXlTa2luLnVwZGF0ZShcclxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJTaXRlLnVzclByZWZlcmVuY2VzXCIsIGNvbnRlbnQ6IGFuZ3VsYXIudG9Kc29uKHVzclByZWZlcmVuY2VzLCB0cnVlKSwgc3RhdHVzOiBcInVuc2F2ZWRcIn0sXHJcbiAgICAgICAgICAgICAgICBwYXJhbVxyXG4gICAgICAgICAgICApLnRoZW4oIGZ1bmN0aW9uKHNraW4pe1xyXG4gICAgICAgICAgICAgICAgLy8gc3VjY2Vzczogbm8gdXNlciBtZXNzYWdlIG5lZWRlZFxyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihzdGF0dXMsIHNraW4pe1xyXG4gICAgICAgICAgICAgICAgdG9hc3RyLmVycm9yKFwiU2tpbjogJ1wiK3NraW4ubmFtZStcIicga29ubnRlIG5pY2h0IGVyZm9sZ3JlaWNoIGFrdHVhbGlzaWVydCB3ZXJkZW4gKFN0YXR1czogXCIrc3RhdHVzK1wiKS5cIiwgcGFyYW0ubXNnSGVhZGVyKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkaHR0cCwgJHEpe1xyXG5cclxuICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgIGdldDogZnVuY3Rpb24odXJsKXtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gdXJsOiBUd29kYXkgdXJsIHRvIHJlYWRcclxuICAgICAgICAgICAgICogQHJldHVybnM6ICRodHRwOiBwcm9taXNlXHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqL1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCh1cmwpO1xyXG5cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKHNraW4sIHBhcmFtKXtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gc2tpbjogb2JqZWN0LCBhdCBtaW5pbXVtIGhvbGRzIHRoZSBmb2xsb3dpbmcgcHJvcHNcclxuICAgICAgICAgICAgICogICAgICBuYW1lOiBOYW1lIG9mIHRoZSBza2luIHRvIGJlIHVwZGF0ZWQsIGUuZy4gXCJTaXRlLnVzclByZWZlcmVuY2VzXCJcclxuICAgICAgICAgICAgICogICAgICBjb250ZW50OiBDb250ZW50IHRoYXQgc2hhbGwgYmUgd3JpdHRlbiB0byB0aGUgc2tpblxyXG4gICAgICAgICAgICAgKiAgICAgIHN0YXR1czogU3RhdHVzIGZpZWxkXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSBwYXJhbTogaG9sZHMgdGhlIGNvbnNvbGlkYXRlZCBwcmVmZXJlbmNlc1xyXG4gICAgICAgICAgICAgKiBAcmV0dXJucyBzdGF0dXM6IHN0cmluZyBcInVwZGF0ZWRcIiBvciBcImVycm9yfnh4eFwiIGluIHNraW4uc3RhdHVzXHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqL1xyXG5cclxuICAgICAgICAgICAgdmFyIHEgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICAgICAgJGh0dHAuZ2V0KCBwYXJhbS5sYXlvdXRVcmwrXCJza2lucy9lZGl0P2tleT1cIitza2luLm5hbWUgKVxyXG5cclxuICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciAkZm9ybSA9ICQoZGF0YSkuZmluZChcImZvcm1cIikuZXEoMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICRodHRwKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAkZm9ybS5hdHRyKFwibWV0aG9kXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6ICRmb3JtLmF0dHIoXCJhY3Rpb25cIiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD11dGYtOCd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiAkLnBhcmFtKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY3JldEtleTogJGZvcm0uZmluZChcImlucHV0W25hbWU9c2VjcmV0S2V5XVwiKS52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJGZvcm0uZmluZChcImlucHV0W25hbWU9YWN0aW9uXVwiKS52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogJGZvcm0uZmluZChcImlucHV0W25hbWU9a2V5XVwiKS52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraW5zZXQ6ICRmb3JtLmZpbmQoXCJpbnB1dFtuYW1lPXNraW5zZXRdXCIpLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlOiAkZm9ybS5maW5kKFwiaW5wdXRbbmFtZT1tb2R1bGVdXCIpLnZhbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICRmb3JtLmZpbmQoXCJpbnB1dFtuYW1lPXRpdGxlXVwiKS52YWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAkZm9ybS5maW5kKFwidGV4dGFyZWFbbmFtZT1kZXNjcmlwdGlvbl1cIikuaHRtbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbjogc2tpbi5jb250ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZTogJGZvcm0uZmluZChcImlucHV0W25hbWU9c2F2ZV1cIikudmFsKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAuc3VjY2VzcyhmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBza2luLnN0YXR1cyA9IFwidXBkYXRlZFwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBxLnJlc29sdmUoc2tpbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNraW4uc3RhdHVzID0gXCJlcnJvcn5cIitzdGF0dXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHEucmVqZWN0KHN0YXR1cywgc2tpbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgICAgIC5lcnJvcihmdW5jdGlvbihkYXRhLCBzdGF0dXMpe1xyXG4gICAgICAgICAgICAgICAgICAgIHNraW4uc3RhdHVzID0gXCJlcnJvcn5cIitzdGF0dXM7XHJcbiAgICAgICAgICAgICAgICAgICAgcS5yZWplY3Qoc3RhdHVzLCBza2luKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHEucHJvbWlzZTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkaHR0cCwgJHEsIFByZWZlcmVuY2VzLCB0b2FzdHIpe1xyXG5cclxuICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgIG9uTG9hZDogZnVuY3Rpb24ocGFyYW0pe1xyXG5cclxuICAgICAgICAgICAgaWYgKHBhcmFtLnVwZGF0ZS5sYXN0Q2hlY2suZ2V0VGltZSgpK3BhcmFtLnVwZGF0ZS5nYXAgPCBEYXRlLm5vdygpKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibGFzdENoZWNrOlwiLCBwYXJhbS51cGRhdGUubGFzdENoZWNrLCBwYXJhbS51cGRhdGUubGFzdENoZWNrLmdldFRpbWUoKSwgXCJHYXA6XCIsIHBhcmFtLnVwZGF0ZS5nYXAsIFwiTm93OlwiLCBEYXRlLm5vdygpKTtcclxuICAgICAgICAgICAgICAgIHBhcmFtLnVwZGF0ZS5sYXN0Q2hlY2sgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgUHJlZmVyZW5jZXMuc2F2ZShwYXJhbSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZlcmlmeShwYXJhbSkudGhlbihcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihyZWxlYXNlKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbGVhc2UubmV3VmVyc2lvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2FzdHIuaW5mbygnRXMgaXN0IGVpbmUgbmV1ZXJlIFZlcnNpb24gZGVyIEJsb2ctQXBwIHZlcmbDvGdiYXIhIFNpZSBrw7ZubmVuIGRpZXNlIMO8YmVyICcrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxpIGNsYXNzPVwiZmEgZmEtY29nc1wiPjwvaT4gdW5kIDxzdHJvbmc+QWt0dWFsaXNpZXJ1bmc8L3N0cm9uZz4gaGVydW50ZXJsYWRlbi4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtLm1zZ0hlYWRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHN0YXR1cyl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvYXN0ci5lcnJvcignRmVobGVyIHfDpGhyZW5kIGRlciDDnGJlcnByw7xmdW5nIGF1ZiBlaW5lIG5ldWVyZSBBcHAtVmVyc2lvbjogJytzdGF0dXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW0ubXNnSGVhZGVyKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHZlcmlmeTogZnVuY3Rpb24ocGFyYW0pe1xyXG5cclxuICAgICAgICAgICAgdmFyIHEgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICAgICAgJGh0dHAuZ2V0KHBhcmFtLnVwZGF0ZS5yZWxlYXNlVXJsICsgXCJyZWxlYXNlaW5mby54bWw/bm9jYWNoZT1cIisgJC5ub3coKSlcclxuICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24gKGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlbGVhc2UgPSB1dGlscy5nZXRSZWxlYXNlKCQoZGF0YSkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ld1ZlcnNpb24gPSAodXRpbHMucGFyc2VWZXJzaW9uKHJlbGVhc2UudmVyc2lvbikgPiB1dGlscy5wYXJzZVZlcnNpb24ocGFyYW0udXBkYXRlLnZlcnNpb24pKTtcclxuICAgICAgICAgICAgICAgIHEucmVzb2x2ZSh7ICdkYXRhJzogcmVsZWFzZSwgJ25ld1ZlcnNpb24nOiBuZXdWZXJzaW9uIH0pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24gKGRhdGEsIHN0YXR1cyl7XHJcbiAgICAgICAgICAgICAgICBxLnJlamVjdChzdGF0dXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBxLnByb21pc2U7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgbGlnaHRuZXNzID0gcmVxdWlyZSgnbGlnaHRuZXNzJyk7XHJcblxyXG4vKipcclxuICogRHluYW1pY2FsbHkgbWFpbnRhaW5zIGFuZCBnZW5lcmF0ZXMgQ1NTIHN0eWxlIG92ZXJ3cml0ZXMgY2F1c2VkIGJ5IGNoYW5nZXMgaW4gdXNlciBwcmVmZXJlbmNlcyAoZS5nLiBpY29uIGNvbG9yL2hvdmVyKVxyXG4gKlxyXG4gKi9cclxuXHJcbnZhclxyXG4gICAgLy8gaG9sZHMgYWxsIGdlbmVyYXRlZCBDU1Mtb3ZlcndyaXRlIHJ1bGVzXHJcbiAgICBydWxlcyA9IHt9LFxyXG4gICAgLy8gaG9sZHMgYWxsIGZpZWxkIHRvIENTUyBkZXBlbmRlbmNpZXMsIGkuZS4gYSBjaGFuZ2UgaW4gZmllbGQgeHl6IG5lZWRzIHRvIGdlbmVyYXRlIDEtbiBDU1Mgb3ZlcndyaXRlc1xyXG4gICAgZGVwZW5kZW5jaWVzID0ge1xyXG4gICAgICAgIGJvZHlCYWNrZ3JvdW5kOiB7XHJcbiAgICAgICAgICAgIHN0eWxlOiAnYmFja2dyb3VuZCcsXHJcbiAgICAgICAgICAgIHNlbGVjdG9yOiBbICdib2R5JyBdLFxyXG4gICAgICAgICAgICBkZXJpdmF0aXZlOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keUNvbG9yOiB7XHJcbiAgICAgICAgICAgIHN0eWxlOiAnY29sb3InLFxyXG4gICAgICAgICAgICBzZWxlY3RvcjogWyAnYm9keSxwLGgxLGgyLGgzLGg0LGg1LGg2JyBdLFxyXG4gICAgICAgICAgICBkZXJpdmF0aXZlOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWVudUJhY2tncm91bmRDb2xvcjoge1xyXG4gICAgICAgICAgICAvLyBDU1Mtc3R5bGV0YWcgdG8gYmUgb3ZlcndyaXR0ZW5cclxuICAgICAgICAgICAgc3R5bGU6ICdiYWNrZ3JvdW5kJyxcclxuICAgICAgICAgICAgLy8gQ1NTLXNlbGVjdG9ycyB0byBiZSBvdmVyd3JpdHRlblxyXG4gICAgICAgICAgICBzZWxlY3RvcjogW1xyXG4gICAgICAgICAgICAgICAgJy5jb250YWluLXRvLWdyaWQsLnRvcC1iYXIsLnRvcC1iYXIuZXhwYW5kZWQgLnRpdGxlLWFyZWEsLnRvcC1iYXItc2VjdGlvbiB1bCBsaScsXHJcbiAgICAgICAgICAgICAgICAnQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA0MC4wNjI1ZW0peycrXHJcbiAgICAgICAgICAgICAgICAgICAgJy50b3AtYmFyLC50b3AtYmFyLmV4cGFuZGVkLC50b3AtYmFyLXNlY3Rpb24gbGk6bm90KC5oYXMtZm9ybSkgYTpub3QoLmJ1dHRvbiksJytcclxuICAgICAgICAgICAgICAgICAgICAnLnRvcC1iYXItc2VjdGlvbiAuZHJvcGRvd24gbGkgYSwudG9wLWJhci1zZWN0aW9uIC5kcm9wZG93biBsaTpub3QoLmhhcy1mb3JtKTpub3QoLmFjdGl2ZSkgPiBhOm5vdCguYnV0dG9uKSwnK1xyXG4gICAgICAgICAgICAgICAgICAgICcudG9wLWJhci1zZWN0aW9uIC5kcm9wZG93biBsaSBsYWJlbCwudG9wLWJhci1zZWN0aW9uIC5oYXMtZm9ybSdcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgLy8gZGVwZW5kZW50IGRlcml2YXRpdmVzLCBlLmcuIGEgY2hhbmdlIG9mIG1lbnVDb2xvciBjYXVzZXMgYSBjaGFuZ2UgaW4gdGhlIG1lbnUgZGl2aWRlciBjb2xvciB3aXRoIGEgZGlmZmVyZW50IGxpZ2h0bmVzcyB2YWx1ZVxyXG4gICAgICAgICAgICBkZXJpdmF0aXZlOiBbICdtZW51QmFja2dyb3VuZEhvdmVyJywgJ21lbnVEcm9wZG93bkxhYmVsJywgJ2RpdmlkZXJCb3JkZXJSaWdodCcsICdkaXZpZGVyQm9yZGVyVG9wJyBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZW51QmFja2dyb3VuZEhvdmVyOiB7XHJcbiAgICAgICAgICAgIHN0eWxlOiAnYmFja2dyb3VuZC1jb2xvcicsXHJcbiAgICAgICAgICAgIHNlbGVjdG9yOiBbXHJcbiAgICAgICAgICAgICAgICAnLnRvcC1iYXItc2VjdGlvbiB1bCBsaTpob3Zlcjpub3QoLmhhcy1mb3JtKSA+IGEnLFxyXG4gICAgICAgICAgICAgICAgJ0BtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogNDAuMDYyNWVtKXsudG9wLWJhci1zZWN0aW9uIGxpOm5vdCguaGFzLWZvcm0pIGE6bm90KC5idXR0b24pOmhvdmVyJyxcclxuICAgICAgICAgICAgICAgICdAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDQwLjA2MjVlbSl7LnRvcC1iYXItc2VjdGlvbiAuZHJvcGRvd24gbGk6bm90KC5oYXMtZm9ybSk6bm90KC5hY3RpdmUpOmhvdmVyPmE6bm90KC5idXR0b24pJ1xyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBsaWdodG5lc3M6IC02LFxyXG4gICAgICAgICAgICBkZXJpdmF0aXZlOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWVudURyb3Bkb3duTGFiZWw6IHtcclxuICAgICAgICAgICAgc3R5bGU6ICdjb2xvcicsXHJcbiAgICAgICAgICAgIHNlbGVjdG9yOiBbICcudG9wLWJhci1zZWN0aW9uIC5kcm9wZG93biBsYWJlbCcgXSxcclxuICAgICAgICAgICAgbGlnaHRuZXNzOiArMjAsXHJcbiAgICAgICAgICAgIGRlcml2YXRpdmU6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkaXZpZGVyQm9yZGVyUmlnaHQ6IHtcclxuICAgICAgICAgICAgc3R5bGU6ICdib3JkZXItcmlnaHQtY29sb3InLFxyXG4gICAgICAgICAgICBzZWxlY3RvcjogWyAnLnRvcC1iYXItc2VjdGlvbiA+IHVsID4gLmRpdmlkZXIsLnRvcC1iYXItc2VjdGlvbiA+IHVsID4gW3JvbGU9XCJzZXBhcmF0b3JcIl0nIF0sXHJcbiAgICAgICAgICAgIGxpZ2h0bmVzczogKzEwLFxyXG4gICAgICAgICAgICBkZXJpdmF0aXZlOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGl2aWRlckJvcmRlclRvcDoge1xyXG4gICAgICAgICAgICBzdHlsZTogJ2JvcmRlci10b3AtY29sb3InLFxyXG4gICAgICAgICAgICBzZWxlY3RvcjogWyAnLnRvcC1iYXItc2VjdGlvbiAuZGl2aWRlciwudG9wLWJhci1zZWN0aW9uIFtyb2xlPVwic2VwYXJhdG9yXCJdJyBdLFxyXG4gICAgICAgICAgICBsaWdodG5lc3M6IC01MCxcclxuICAgICAgICAgICAgZGVyaXZhdGl2ZTogW11cclxuICAgICAgICB9LFxyXG4gICAgICAgIG1lbnVJY29uQ29sb3I6IHtcclxuICAgICAgICAgICAgc3R5bGU6ICdjb2xvcicsXHJcbiAgICAgICAgICAgIHNlbGVjdG9yOiBbICcjZjVUb3BiYXIgaSwubWVudVByZXZpZXcgaScgXSxcclxuICAgICAgICAgICAgZGVyaXZhdGl2ZTogW11cclxuICAgICAgICB9LFxyXG4gICAgICAgIGxvYWRlcldyYXBwZXI6IHtcclxuICAgICAgICAgICAgc3R5bGU6ICdjb2xvcicsXHJcbiAgICAgICAgICAgIHNlbGVjdG9yOiBbICcjbG9hZGVyLXdyYXBwZXInIF0sXHJcbiAgICAgICAgICAgIGRlcml2YXRpdmU6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsb2FkZXJDb2xvcjE6IHtcclxuICAgICAgICAgICAgc3R5bGU6ICdib3JkZXItdG9wLWNvbG9yJyxcclxuICAgICAgICAgICAgc2VsZWN0b3I6IFsgJyNsb2FkZXInIF0sXHJcbiAgICAgICAgICAgIGRlcml2YXRpdmU6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsb2FkZXJDb2xvcjI6IHtcclxuICAgICAgICAgICAgc3R5bGU6ICdib3JkZXItdG9wLWNvbG9yJyxcclxuICAgICAgICAgICAgc2VsZWN0b3I6IFsgJyNsb2FkZXI6YmVmb3JlJyBdLFxyXG4gICAgICAgICAgICBkZXJpdmF0aXZlOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbG9hZGVyQ29sb3IzOiB7XHJcbiAgICAgICAgICAgIHN0eWxlOiAnYm9yZGVyLXRvcC1jb2xvcicsXHJcbiAgICAgICAgICAgIHNlbGVjdG9yOiBbICcjbG9hZGVyOmFmdGVyJyBdLFxyXG4gICAgICAgICAgICBkZXJpdmF0aXZlOiBbXVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRyb290U2NvcGUsIHRvYXN0cil7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgLy8gaW5pdCBvbiBhcHAgc3RhcnQ6IGdlbmVyYXRlcyB0aGUgaW5pdGlhbCBmb3VuZGF0aW9uIENTUyBvdmVyd3JpdGVzIGJhc2VkIG9uIGN1cnJlbnQgdXNlciBwcmVmZXJlbmNlc1xyXG4gICAgICAgIGluaXRSdWxlc0Zyb21QcmVmZXJlbmNlczogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHBhcmFtID0gJHJvb3RTY29wZS5wYXJhbSwgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgIC8vIEJvZHlcclxuICAgICAgICAgICAgc2VsZi5yZXNvbHZlRGVwZW5kZW5jeSgnYm9keUJhY2tncm91bmQnLCBwYXJhbS5zaXRlLmJvZHkuYmFja2dyb3VuZCk7XHJcbiAgICAgICAgICAgIHNlbGYucmVzb2x2ZURlcGVuZGVuY3koJ2JvZHlDb2xvcicsIHBhcmFtLnNpdGUuYm9keS5jb2xvcik7XHJcbiAgICAgICAgICAgIC8vIFRvcGJhclxyXG4gICAgICAgICAgICBzZWxmLnJlc29sdmVEZXBlbmRlbmN5KCdtZW51QmFja2dyb3VuZENvbG9yJywgcGFyYW0udG9wYmFyLm1lbnVCYWNrZ3JvdW5kQ29sb3IpO1xyXG4gICAgICAgICAgICBzZWxmLnJlc29sdmVEZXBlbmRlbmN5KCdtZW51SWNvbkNvbG9yJywgcGFyYW0udG9wYmFyLm1lbnVJY29uQ29sb3IpO1xyXG4gICAgICAgICAgICAvLyBMb2FkZXIgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgIHNlbGYucmVzb2x2ZURlcGVuZGVuY3koJ2xvYWRlcldyYXBwZXInLCBwYXJhbS5zaXRlLmxvYWRlci53cmFwcGVyKTtcclxuICAgICAgICAgICAgc2VsZi5yZXNvbHZlRGVwZW5kZW5jeSgnbG9hZGVyQ29sb3IxJywgcGFyYW0uc2l0ZS5sb2FkZXIuY29sb3IxKTtcclxuICAgICAgICAgICAgc2VsZi5yZXNvbHZlRGVwZW5kZW5jeSgnbG9hZGVyQ29sb3IyJywgcGFyYW0uc2l0ZS5sb2FkZXIuY29sb3IyKTtcclxuICAgICAgICAgICAgc2VsZi5yZXNvbHZlRGVwZW5kZW5jeSgnbG9hZGVyQ29sb3IzJywgcGFyYW0uc2l0ZS5sb2FkZXIuY29sb3IzKTtcclxuICAgICAgICAgICAgLy8gU3BlY2lhbCBJY29ucyBjb2xvci9ob3ZlclxyXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goIHBhcmFtLnRvcGJhci5zcGVjaWFsSWNvbnMsIGZ1bmN0aW9uKGljb24pe1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRSdWxlKCcubWVudXNwZWNpYWwtJytpY29uLm5hbWUrJyBpJywgc2VsZi5mb3JtYXRSdWxlKCdjb2xvcicsIGljb24uY29sb3IsIHRydWUpKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0UnVsZSgnbGk6aG92ZXIgLm1lbnVzcGVjaWFsLScraWNvbi5uYW1lKycgaScsIHNlbGYuZm9ybWF0UnVsZSgnY29sb3InLCBpY29uLmhvdmVyLCB0cnVlKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBwdXNoIENTUyB0byAkcm9vdHNjb3BlXHJcbiAgICAgICAgICAgIHNlbGYucHVzaENTUygpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8vIHByb2Nlc3NlcyBkZXBlbmRlbmNpZXMgb2JqZWN0IGZvciBkZXNpcmVkIGZpZWxkIGFuZCBnZW5lcmF0ZXMgYWxsIHJlcXVpcmVkIENTUyBvdmVyd3JpdGUgcnVsZXNcclxuICAgICAgICByZXNvbHZlRGVwZW5kZW5jeTogZnVuY3Rpb24oZmllbGRJRCwgdmFsdWUpe1xyXG4gICAgICAgICAgICBpZiAoZmllbGRJRCBpbiBkZXBlbmRlbmNpZXMpe1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlcGVuZGVuY3kgPSBkZXBlbmRlbmNpZXNbZmllbGRJRF07XHJcbiAgICAgICAgICAgICAgICBpZiAoJ2xpZ2h0bmVzcycgaW4gZGVwZW5kZW5jeSkgdmFsdWUgPSBsaWdodG5lc3ModmFsdWUsIGRlcGVuZGVuY3kubGlnaHRuZXNzKTtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggZGVwZW5kZW5jeS5zZWxlY3RvciwgZnVuY3Rpb24gKGNzc1NlbGVjdG9yKXtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFJ1bGUoY3NzU2VsZWN0b3IsIHNlbGYuZm9ybWF0UnVsZShkZXBlbmRlbmN5LnN0eWxlLCB2YWx1ZSkrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChjc3NTZWxlY3Rvci5jaGFyQXQoMCk9PT1cIkBcIiA/ICd9JyA6ICcnKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggZGVwZW5kZW5jeS5kZXJpdmF0aXZlLCBmdW5jdGlvbihkZXJpdmVkRmllbGRJRCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVzb2x2ZURlcGVuZGVuY3koZGVyaXZlZEZpZWxkSUQsIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdG9hc3RyLmVycm9yKCdLZWluZSBDU1MtQW53ZWlzdW5nZW4gZsO8ciBJRDogJytmaWVsZElEKycgZ2VmdW5kZW4hJywgJHJvb3RTY29wZS5wYXJhbS5tc2dIZWFkZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy8gZm9ybWF0cyBvbmUgQ1NTIHJ1bGVcclxuICAgICAgICBmb3JtYXRSdWxlOiBmdW5jdGlvbihzdHlsZSwgdmFsdWUsIGltcG9ydGFudCl7XHJcbiAgICAgICAgICAgIHJldHVybiBzdHlsZSArICc6JyArIHZhbHVlICsgKCFpbXBvcnRhbnQgPyAnJyA6ICchaW1wb3J0YW50Jyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy8gc2F2ZXMvdXBkYXRlcyBhIENTUyBydWxlXHJcbiAgICAgICAgc2V0UnVsZTogZnVuY3Rpb24oc2VsZWN0b3IsIHJ1bGUpe1xyXG4gICAgICAgICAgICBydWxlc1tzZWxlY3Rvcl0gPSBydWxlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvLyByZXNvbHZlcyB0aGUgZGVwZW5kZW5jaWVzIGZvciBhIGRlc2lyZWQgZmllbGQgYW5kIHB1c2hlcyB0aGUgcmVzdWx0aW5nIENTUyBzdHJpbmcgdG8gdGhlIHZpZXdcclxuICAgICAgICBwdXNoRGVwZW5kZW5jeTogZnVuY3Rpb24oZmllbGRJRCwgdmFsdWUpe1xyXG4gICAgICAgICAgICB0aGlzLnJlc29sdmVEZXBlbmRlbmN5KGZpZWxkSUQsIHZhbHVlKTtcclxuICAgICAgICAgICAgdGhpcy5wdXNoQ1NTKCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy8gam9pbnMgYWxsIENTUyBydWxlcyB0byBvbmUgc3RyaW5nIGFuZCBwdXNoZXMgdGhpcyB0byB0aGUgdmlldyAoaW5saW5lIHN0eWxlIHRhZyBcIiNmNVVzZXJTdHlsZXNcIilcclxuICAgICAgICBwdXNoQ1NTOiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB2YXIgY3NzID0gJyc7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChydWxlcywgZnVuY3Rpb24gKHJ1bGUsIHNlbGVjdG9yKSB7IGNzcyArPSBzZWxlY3RvciArICd7JyArIHJ1bGUgKyAnfSAnIH0pO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInB1c2hDU1NcIiwgY3NzKTtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS51c2VyU3R5bGVzID0gY3NzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59OyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBCcm93c2VyaWZ5IGFsbCBzZXJ2aWNlc1xyXG4gKlxyXG4gKi9cclxuXHJcbih0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LmFuZ3VsYXIgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLmFuZ3VsYXIgOiBudWxsKVxyXG4gICAgLm1vZHVsZSgnZjVTa2luQXBwJylcclxuICAgIC5mYWN0b3J5KCdDYWNoZUl0ZW0nLCBbJyRjYWNoZUZhY3RvcnknLCByZXF1aXJlKCcuL0NhY2hlSXRlbScpXSlcclxuICAgIC5mYWN0b3J5KCdJbWFnZVByb3ZpZGVyJywgWyckaHR0cCcsICckcScsIHJlcXVpcmUoJy4vSW1hZ2VQcm92aWRlcicpXSlcclxuICAgIC5mYWN0b3J5KCdUd29kYXlTa2luJywgWyckaHR0cCcsICckcScsIHJlcXVpcmUoJy4vVHdvZGF5U2tpbicpXSlcclxuICAgIC5mYWN0b3J5KCdQcmVmZXJlbmNlcycsIFsnQ2FjaGVJdGVtJywgJ1R3b2RheVNraW4nLCAndG9hc3RyJywgcmVxdWlyZSgnLi9QcmVmZXJlbmNlcycpXSlcclxuICAgIC5mYWN0b3J5KCdVcGRhdGVDaGVjaycsIFsnJGh0dHAnLCAnJHEnLCAnUHJlZmVyZW5jZXMnLCAndG9hc3RyJywgcmVxdWlyZSgnLi9VcGRhdGVDaGVjaycpXSlcclxuICAgIC5mYWN0b3J5KCdVc2VyU3R5bGVzJywgWyckcm9vdFNjb3BlJywgJ3RvYXN0cicsIHJlcXVpcmUoJy4vVXNlclN0eWxlcycpXSk7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogUHJvdmlkZXMgYSBzZXQgb2YgdXRpbGl0eSBmdW5jdGlvbnNcclxuICpcclxuICovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcbi8vLSBDb252ZXJ0cyBzZWxlY3RlZCBET00gbGlua3MgdG8gYW4gYXJyYXkgb2YgbGluayBvYmplY3RzIChocmVmLHRleHQpXHJcbiAgICBsaW5rc1RvT2JqZWN0czogZnVuY3Rpb24oc2VsZWN0b3Ipe1xyXG4gICAgICAgIHZhciBsaW5rT2JqZWN0cyA9IFtdO1xyXG4gICAgICAgICAgICAkKHNlbGVjdG9yKS5lYWNoKCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgbGlua09iamVjdHMucHVzaCh7IFwiaHJlZlwiOiB0aGlzLmhyZWYsIFwidGV4dFwiOiB0aGlzLmlubmVyVGV4dCB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGxpbmtPYmplY3RzO1xyXG4gICAgfSxcclxuXHJcbi8vLSBFeHRyYWN0IGJyZWFkY3J1bWJzLWxpbmtzIG91dCBvZiBUd29kYXkncyBtb2RUb29sYmFyTmF2aWdhdGlvbnBhdGgtbWFjcm8gYW5kIHJldHVybiBhcyBhbiBhcnJheSBvZiBsaW5rIG9iamVjdHNcclxuICAgIGdldEJyZWFkY3J1bWJzOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxpbmtzVG9PYmplY3RzKFwiI2JyZWFkY3J1bWJzTWVudSA+YTpub3QoW2lkXSlcIik7XHJcbiAgICB9LFxyXG5cclxuLy8tIEdldCBzcGVjaWFsIG1lbnUgaXRlbXMgKGltYWdlTWVudS9hYm9NZW51KSBhcyBhbiBhcnJheSBvZiBsaW5rIG9iamVjdHNcclxuICAgIGdldFNwZWNpYWxNZW51OiBmdW5jdGlvbihtZW51SUQpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxpbmtzVG9PYmplY3RzKG1lbnVJRCtcIiBhXCIpO1xyXG4gICAgfSxcclxuXHJcbi8vLSBQaW1wIHNlcnZlciBnZW5lcmF0ZWQgVHdvZGF5IGNsYXNzZXMgdG8gZW5mb3JjZSBGb3VuZGF0aW9uIHN0eWxlXHJcbiAgICBwaW1wQ2xhc3NlczogZnVuY3Rpb24oKXtcclxuICAgICAgICAkKFwiLm1lc3NhZ2UgLmJ1dHRvblwiKS5hZGRDbGFzcyhcInNlY29uZGFyeSB0aW55IHJhZGl1c1wiKTtcclxuICAgIH0sXHJcblxyXG4vLy0gUm90YXRpb24xMyBtZXRob2QgdXNlZCB0byBvYmZ1c2NhdGUgZW1haWwtYWRkcmVzc1xyXG4gICAgcm90MTM6IGZ1bmN0aW9uKHMpe1xyXG4gICAgICAgIHJldHVybiBzLnJlcGxhY2UoL1thLXpBLVpdL2csIGZ1bmN0aW9uKGMpe1xyXG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgoYyA8PSBcIlpcIiA/IDkwIDogMTIyKSA+PSAoYyA9IGMuY2hhckNvZGVBdCgwKSArIDEzKSA/IGMgOiBjIC0gMjYpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbi8vLSBSZXR1cm4gUmVxdWVzdCBJRFxyXG4gICAgZ2V0UmVxdWVzdElEOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJvdDEzKFsnbjEzbjlyczMnLCAnMHNxNzYxNTAnLCAnMXAyMTY2NTknLCAnbjk1MW5uNm4nXS5yZXZlcnNlKCkuam9pbignJykpO1xyXG4gICAgfSxcclxuXHJcbi8vLSBHZXRzIG1pbnV0ZXMgZnJvbSBhIGdpdmVuIGRhdGVcclxuICAgIGdldE1pbnV0ZTogZnVuY3Rpb24oZGF0ZSl7XHJcbiAgICAgICAgcmV0dXJuIGRhdGUuZ2V0SG91cnMoKSo2MCtkYXRlLmdldE1pbnV0ZXMoKTtcclxuICAgIH0sXHJcblxyXG4vLy0gQWRkcy9TdWJ0cmFjdHMgbWludXRlcyBmcm9tIGEgZ2l2ZW4gZGF0ZSAoYWRkOiBtaW51dGVzPjAsIHN1YnRyYWN0OiBtaW51dGVzPDApXHJcbiAgICBhZGRNaW51dGVzOiBmdW5jdGlvbihkYXRlLCBtaW51dGVzKXtcclxuICAgICAgICB2YXIgbmV3VGltZSA9IHRoaXMuZ2V0TWludXRlKGRhdGUpICsgbWludXRlcztcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUoMTk3MCwwLDEsKG5ld1RpbWUvNjA+PjApLChuZXdUaW1lICUgNjApLDApO1xyXG4gICAgfSxcclxuXHJcbi8vLSBGb3JtYXRzIHRpbWUgc3RyaW5nIHRvIFwiaGg6bW1cIlxyXG4gICAgZm9ybWF0VGltZTogZnVuY3Rpb24oZGF0ZSl7XHJcbiAgICAgICAgcmV0dXJuIChcIjBcIitkYXRlLmdldEhvdXJzKCkpLnNsaWNlKC0yKStcIjpcIisoXCIwXCIrZGF0ZS5nZXRNaW51dGVzKCkpLnNsaWNlKC0yKTtcclxuICAgIH0sXHJcblxyXG4vLy0gQ29udmVydHMgc3RyaW5nLXZlcnNpb24gKFwiMS4yLjNcIikgdG8gYSBjb21wYXJhYmxlIGludCAoMTIzKVxyXG4gICAgcGFyc2VWZXJzaW9uOiBmdW5jdGlvbih2ZXJzaW9uKXtcclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQodmVyc2lvbi5yZXBsYWNlKC9cXC4vZyxcIlwiKSwgMTApO1xyXG4gICAgfSxcclxuXHJcbi8vLSBQYXJzZSBDUkMzMiB2YWx1ZSBmcm9tIHRoZSBza2luJ3MgdG9wIGxpbmVcclxuICAgIHBhcnNlQ1JDOiBmdW5jdGlvbihjaGFycyl7XHJcbiAgICAgICAgdmFyIGNyYzMyID0gY2hhcnMubWF0Y2goL0NSQzMyOi4oLiopWyBdLyk7XHJcbiAgICAgICAgcmV0dXJuIChjcmMzMiAhPT0gbnVsbCA/IHBhcnNlSW50KGNyYzMyWzFdLCAxMCkgOiAtMSk7XHJcbiAgICB9LFxyXG5cclxuLy8tIEV4dHJhY3QgaGVhZGVyIGRhdGEgYW5kIHNraW4gaW5mb3JtYXRpb24gZnJvbSByZWxlYXNlaW5mby54bWxcclxuICAgIGdldFJlbGVhc2U6IGZ1bmN0aW9uKCRkYXRhKXtcclxuICAgICAgICB2YXIgcmVsZWFzZSA9IHtcclxuICAgICAgICAgICAgdmVyc2lvbjogJGRhdGEuZmluZChcInZlcnNpb25cIikudGV4dCgpLFxyXG4gICAgICAgICAgICBhdXRob3I6ICRkYXRhLmZpbmQoXCJhdXRob3JcIikudGV4dCgpLFxyXG4gICAgICAgICAgICByZWxlYXNlZGF0ZTogbmV3IERhdGUoRGF0ZS5wYXJzZSgkZGF0YS5maW5kKFwicmVsZWFzZWRhdGVcIikudGV4dCgpKSksXHJcbiAgICAgICAgICAgIHNraW5zOiBbXVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJGRhdGEuZmluZChcInNraW5cIikuZWFjaCggZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgc2tpbk5hbWUgPSBzZWxmLmF0dHIoXCJrZXlcIiksXHJcbiAgICAgICAgICAgICAgICBkYXRlU291cmNlV2FzVXBkYXRlZCA9IG5ldyBEYXRlKERhdGUucGFyc2Uoc2VsZi5hdHRyKFwibGFzdHVwZGF0ZVwiKSkpLFxyXG4gICAgICAgICAgICAgICAgc2tpbkNSQyA9IHNlbGYuYXR0cihcImNyY1wiKSxcclxuICAgICAgICAgICAgICAgIHNraW5Db250ZW50ID0gc2VsZi5maW5kKFwiY29udGVudFwiKS50ZXh0KCk7XHJcbiAgICAgICAgICAgIHJlbGVhc2Uuc2tpbnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBza2luTmFtZSxcclxuICAgICAgICAgICAgICAgIHVwZGF0ZTogZGF0ZVNvdXJjZVdhc1VwZGF0ZWQsXHJcbiAgICAgICAgICAgICAgICBjcmMzMjogc2tpbkNSQyxcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICQudHJpbShza2luQ29udGVudCksXHJcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFwidW5jaGVja2VkXCJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlbGVhc2U7XHJcbiAgICB9LFxyXG5cclxuLy8tIGNoZWNrcyBpZiBmaWxlbmFtZSBzdHJpbmcgaGFzIGFuIGltYWdlIGV4dGVuc2lvblxyXG4gICAgaXNJdGVtOiBmdW5jdGlvbihuYW1lKXtcclxuICAgICAgICB2YXIgaXNGb2xkZXIgPSAobmFtZS5pbmRleE9mKCcuJyk8MCksXHJcbiAgICAgICAgICAgIGlzSW1hZ2UgPSBmYWxzZTtcclxuICAgICAgICBpZiAoIWlzRm9sZGVyKXtcclxuICAgICAgICAgICAgaXNJbWFnZSA9ICgkLmluQXJyYXkobmFtZS5zcGxpdCgnLicpLnBvcCgpLCBbJ2pwZycsJ2pwZWcnLCdibXAnLCdwbmcnLCdnaWYnLCd0aWYnLCd0aWZmJywncGJtJywnZGliJywncmxlJ10pPj0wKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgYUZvbGRlcjogaXNGb2xkZXIsIGFuSW1hZ2U6IGlzSW1hZ2UgfTtcclxuICAgIH0sXHJcblxyXG4vLy0gcmVtb3ZlIHRyYWlsaW5nIHNsYXNoIGZyb20gYSBnaXZlbiBwYXRobmFtZVxyXG4gICAgcmVtb3ZlVHJhaWxpbmdTbGFzaDogZnVuY3Rpb24ocGF0aCl7XHJcbiAgICAgICAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFwvKyQvLCAnJyk7XHJcbiAgICB9LFxyXG5cclxuLy8tIHN3YXBzIHR3byBpbmRleCBlbnRyaWVzIG9mIGFuIGFycmF5XHJcbiAgICBzd2FwOiBmdW5jdGlvbihzd2FwQXJyYXksIGF0SW5kZXgsIHRvSW5kZXgpe1xyXG4gICAgICAgIHZhciB0bXAgPSBzd2FwQXJyYXlbdG9JbmRleF07XHJcbiAgICAgICAgc3dhcEFycmF5W3RvSW5kZXhdID0gc3dhcEFycmF5W2F0SW5kZXhdO1xyXG4gICAgICAgIHN3YXBBcnJheVthdEluZGV4XSA9IHRtcDtcclxuICAgIH0sXHJcblxyXG4vLy0gcmVtb3ZlcyBcImZhLW1hcmdpblwiIGZyb20gYW4gaW5wdXQgaWNvbm5hbWUgdmFsdWUgYW5kIHJldHVybnMgYSBkaXNwbGF5YWJsZSBGb250IEF3ZXNvbWUgaWNvblxyXG4gICAgZ2V0SWNvbjogZnVuY3Rpb24oaWNvbm5hbWUpe1xyXG4gICAgICAgIHZhciBmYUljb24gPSAkLnRyaW0oaWNvbm5hbWUucmVwbGFjZSgvZmEtbWFyZ2luL2dpLCAnJykpO1xyXG4gICAgICAgIHJldHVybiAoZmFJY29uLmxlbmd0aD4wID8gJ2ZhICcrZmFJY29uIDogJycpO1xyXG4gICAgfSxcclxuXHJcbi8vLSBmb3JtYXRzIEpTT04gb2JqZWN0IHRvIENTU1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIEpzb25Ub0NzczogZnVuY3Rpb24oc3R5bGVKc29uLCBsaW5lYnJlYWspe1xyXG4gICAgICAgIHZhciBjc3MgPSAnJyxcclxuICAgICAgICAgICAgZGl2aWRlciA9IChsaW5lYnJlYWsgPyAnXFxyXFxuJyA6ICcgJyk7XHJcbiAgICAgICAgJC5lYWNoKCBzdHlsZUpzb24gfHwge30sIGZ1bmN0aW9uKHN0eWxlLCBhdHRyKXtcclxuICAgICAgICAgICAgY3NzICs9IChjc3MubGVuZ3RoPjAgPyBkaXZpZGVyIDogJycpK3N0eWxlKyc6ICcrYXR0cisnOyc7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGNzcztcclxuICAgIH0sXHJcblxyXG4vLy0gZm9ybWF0IHByZWZlcmVuY2U6IGNvcGllcyBjb2xvci9iZ2NvbG9yLXZhbHVlcyB0byB0aGUgKG5nLSlzdHlsZSBmaWVsZFxyXG4gICAgZXh0ZW5kQ29sb3I6IGZ1bmN0aW9uKGZvcm1hdE9wdGlvbnMpe1xyXG4gICAgICAgIGlmIChmb3JtYXRPcHRpb25zKXtcclxuICAgICAgICAgICAgZm9ybWF0T3B0aW9ucy5zdHlsZVsnY29sb3InXSA9IGZvcm1hdE9wdGlvbnMuY29sb3I7XHJcbiAgICAgICAgICAgIGZvcm1hdE9wdGlvbnMuc3R5bGVbJ2JhY2tncm91bmQtY29sb3InXSA9IGZvcm1hdE9wdGlvbnMuYmdjb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnM7XHJcbiAgICB9LFxyXG5cclxuLy8tIGZvcm1hdCBwcmVmZXJlbmNlOiBleHRyYWN0cyBjb2xvci9iZ2NvbG9yLXZhbHVlcyBmcm9tIHRoZSBzdHlsZSBmaWVsZCB0byB0aGVpciBvcmlnaW5hbCBmaWVsZHNcclxuICAgIGV4dHJhY3RDb2xvcjogZnVuY3Rpb24oZm9ybWF0T3B0aW9ucyl7XHJcbiAgICAgICAgaWYgKGZvcm1hdE9wdGlvbnMpe1xyXG4gICAgICAgICAgICBmb3JtYXRPcHRpb25zLmNvbG9yID0gKGZvcm1hdE9wdGlvbnMuc3R5bGUuaGFzT3duUHJvcGVydHkoJ2NvbG9yJykgPyBmb3JtYXRPcHRpb25zLnN0eWxlWydjb2xvciddIDogJyM0NDQ0NDQnKTtcclxuICAgICAgICAgICAgZm9ybWF0T3B0aW9ucy5iZ2NvbG9yID0gKGZvcm1hdE9wdGlvbnMuc3R5bGUuaGFzT3duUHJvcGVydHkoJ2JhY2tncm91bmQtY29sb3InKSA/IGZvcm1hdE9wdGlvbnMuc3R5bGVbJ2JhY2tncm91bmQtY29sb3InXSA6ICd0cmFuc3BhcmVudCcpO1xyXG4gICAgICAgICAgICBkZWxldGUgZm9ybWF0T3B0aW9ucy5zdHlsZVsnY29sb3InXTtcclxuICAgICAgICAgICAgZGVsZXRlIGZvcm1hdE9wdGlvbnMuc3R5bGVbJ2JhY2tncm91bmQtY29sb3InXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdE9wdGlvbnM7XHJcbiAgICB9LFxyXG5cclxuLy8tIG1ha2Ugc3VyZSBvbmx5IGxlZ2l0IGNoYXJhY3RlcnMgYXJlIHBhcnQgb2YgdGhlIHNlbGVjdG9yIG5hbWUgKGEteiAwLTkgXyAtKVxyXG4gICAgbGVnaXRTbHVnOiBmdW5jdGlvbihzbHVnKXtcclxuICAgICAgICByZXR1cm4gc2x1Z1xyXG4gICAgICAgICAgICAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvw6QvZywgXCJhZVwiKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvw7YvZywgXCJvZVwiKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvw7wvZywgXCJ1ZVwiKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvw58vZywgXCJzc1wiKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvW15cXHcgXSsvZywnJylcclxuICAgICAgICAgICAgLnRyaW0oKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgvICsvZywnLScpO1xyXG4gICAgfVxyXG5cclxufTsiXX0=
