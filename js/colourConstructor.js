class Colour {
  constructor(input) {
    if (typeof input === "string") {
      // If initialised with hex
      this.hex = input.toUpperCase();
      this.rgb = this.hexToRgb(input);
      this.hsl = this.rgbToHsl(this.rgb);
      this.luminance = this.rgbToLuminance(this.rgb);
    } else if (typeof input === "number") {
      // If initialised with luminance target
      this.rgb = this.iterateRgbForLuminance(input);
      console.log(this.rgb);
      this.hex = this.rgbToHex(this.rgb);
      this.hsl = this.rgbToHsl(this.rgb);
      this.luminance = this.rgbToLuminance(this.rgb);
    } else if (!input) {
      // If initialised with no input
      this.hsl = {
        h: this.randomInRange(0, 1),
        s: this.randomInRange(0.6, 1),
        l: this.randomInRange(0.3, 0.7),
      };
      this.rgb = this.hslToRgb(this.hsl);
      this.hex = this.rgbToHex(this.rgb);
      this.luminance = this.rgbToLuminance(this.rgb);
    } else {
      // If initialised with HSL
      this.hsl = input;
      this.rgb = this.hslToRgb(input);
      this.hex = this.rgbToHex(this.rgb);
      this.luminance = this.rgbToLuminance(this.rgb);
    }

    // Initialise name to be filled by API call
    this.name = null;

    // Initialise XYZ values and text colour (contrast with white or black)
    this.xyz = this.rgbToXyz(this.rgb);

    // Initialise text contrast colour for display
    this.textColour = this.luminance > 0.1791 ? "black" : "white";
  }

  // Method to convert Hex to RGB
  hexToRgb(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    };
  }

  // Method to convert RGB to Hex
  rgbToHex(rgb) {
    return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  }

  // Method to convert RGB to HSL
  rgbToHsl(rgb) {
    let [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h,
      s,
      l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return { h: h, s: s, l: l };
  }

  // Method to convert HSL to RGB
  hslToRgb(hsl) {
    let [h, s, l] = [hsl.h, hsl.s, hsl.l];
    let r, g, b;

    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;

      r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
      g = Math.round(hue2rgb(p, q, h) * 255);
      b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
    }

    return { r: r, g: g, b: b };
  }

  // Method to convert RGB to XYZ coordinates
  rgbToXyz(rgb) {
    let r = this.srgbToLinear(rgb.r / 255) * 100;
    let g = this.srgbToLinear(rgb.g / 255) * 100;
    let b = this.srgbToLinear(rgb.b / 255) * 100;

    // Observer = 2°, Illuminant = D65
    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    return { x, y, z };
  }

  //Method to calculate luminance as set out WCAG
  rgbToLuminance(rgb) {
    return (
      0.2126 * this.srgbToLinear(rgb.r / 255) +
      0.7152 * this.srgbToLinear(rgb.g / 255) +
      0.0722 * this.srgbToLinear(rgb.b / 255)
    );
  }

  // Method to calculate the inverse sRGB linearization
  srgbToLinear(srgb) {
    return srgb <= 0.04045
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
  }

  // Method to calculate the sRGB value from a linear value
  linearToSrgb(cLinear) {
    return cLinear <= 0.00313080495356037151702786377709
      ? cLinear * 12.92
      : 1.055 * Math.pow(cLinear, 1 / 2.4) - 0.055;
  }

  // Method to clamp a value between min and max
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  // Method to generate random values between a given range
  randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  iterateRgbForLuminance(targetLuminance) {
    // Determine if the color should be light or dark
    let rgb;
    const isDark = targetLuminance <= 0.1791;
    let tries = 0;
    let luminanceAdjuster = 0;
    let luminanceIncrement;
    if (isDark) {
      luminanceIncrement = -targetLuminance / 10; //reduce by 10%
    } else {
      luminanceIncrement = (1 - targetLuminance) / 10; //add 10%
    }
    while (tries < 30) {
      rgb = this.generateRgbFromLuminance(targetLuminance + luminanceAdjuster);
      console.log(rgb);
      this.luminance = this.rgbToLuminance(rgb);
      //break loop if successfully generated high contrast colour
      if (isDark && this.luminance <= targetLuminance) {
        break;
      } else if (!isDark && this.luminance >= targetLuminance) {
        break;
      } else {
        console.log(
          `Contrasting colour: Try ${
            tries + 1
          } failed as it did not meet appropriate contrast ratio (luminance: ${
            this.luminance
          } / target: ${targetLuminance}), will try again.`
        );
      }
      tries++;
      luminanceAdjuster += luminanceIncrement;
    }
    console.log(rgb);
    return rgb;
  }

  // Method to generate RGB values for a given luminance
  generateRgbFromLuminance(targetLuminance) {
    let r, g, b;

    // Determine if the color should be light or dark
    const isDark = targetLuminance <= 0.1791;

    // Randomly select two channels to fix
    const channels = ["r", "g", "b"];
    const fixedChannels = channels.sort(() => 0.5 - Math.random()).slice(0, 2);

    // Generate the fixed channels within the constrained range
    const fixedValues = {
      [fixedChannels[0]]: 0,
      [fixedChannels[1]]: 0,
    };

    // Calculate the remaining channel based on the fixed channels and adjusted luminance
    if (fixedChannels.includes("r") && fixedChannels.includes("g")) {
      console.log("b will be calculated");
      r = this.randomInRange(0, 1);
      g = this.clamp(
        this.linearToSrgb(
          this.randomInRange(
            isDark
              ? 0
              : (targetLuminance - 0.2126 * this.srgbToLinear(r)) / 0.7152,
            isDark
              ? (targetLuminance - 0.2126 * this.srgbToLinear(r)) / 0.7152
              : 1
          )
        ),
        0,
        1
      );
      b = this.clamp(
        this.linearToSrgb(
          (targetLuminance -
            0.2126 * this.srgbToLinear(r) -
            0.7152 * this.srgbToLinear(g)) /
            0.0722
        ),
        0,
        1
      );
      console.log("b = " + b);
    } else if (fixedChannels.includes("r") && fixedChannels.includes("b")) {
      console.log("g will be calculated");
      r = this.randomInRange(0, 1);
      b = this.clamp(
        this.linearToSrgb(
          this.randomInRange(
            isDark
              ? 0
              : (targetLuminance - 0.2126 * this.srgbToLinear(r)) /
                  0.0722 /
                  0.7152,
            isDark
              ? (targetLuminance - 0.2126 * this.srgbToLinear(r)) / 0.0722
              : 1
          )
        ),
        0,
        1
      );
      g = this.clamp(
        this.linearToSrgb(
          (targetLuminance -
            0.2126 * this.srgbToLinear(r) -
            0.0722 * this.srgbToLinear(b)) /
            0.7152
        ),
        0,
        1
      );
      console.log("g = " + g);
    } else {
      console.log("r will be calculated");
      g = this.randomInRange(0, 1);
      b = this.clamp(
        this.linearToSrgb(
          this.randomInRange(
            isDark
              ? 0
              : targetLuminance - (0.7152 * this.srgbToLinear(g)) / 0.0722,
            isDark
              ? targetLuminance - (0.7152 * this.srgbToLinear(g)) / 0.0722
              : 1
          )
        ),
        0,
        1
      );
      r = this.clamp(
        this.linearToSrgb(
          (targetLuminance -
            0.7152 * this.srgbToLinear(g) -
            0.0722 * this.srgbToLinear(b)) /
            0.2126
        ),
        0,
        1
      );
      console.log("r = " + r);
    }

    // Convert the channels back to the 0-255 range
    console.log(r, g, b);
    if (isDark) {
      return {
        r: Math.floor(r * 255),
        g: Math.floor(g * 255),
        b: Math.floor(b * 255),
      };
    } else {
      return {
        r: Math.ceil(r * 255),
        g: Math.ceil(g * 255),
        b: Math.ceil(b * 255),
      };
    }
  }

  // Method to fetch color data from the API and update properties
  async fetchNameData() {
    const cleanHex = this.hex.replace("#", "");
    const apiUrl = `https://api.color.pizza/v1/${cleanHex}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data.colors.length === 0) {
        throw new Error("No colours found in the API response");
      }

      const colourData = data.colors[0];

      // Update class properties with the API data
      this.name = colourData.name;
      this.textColour = colourData.bestContrast;
    } catch (error) {
      console.error("Error fetching colour data:", error);
    }
  }
}

module.exports = Colour;

const colour1 = new Colour("#979ac4");
console.log("colour initialised with hex");
console.log("hex: " + colour1.hex);
console.log("rgb: " + JSON.stringify(colour1.rgb));
console.log("hsl: " + JSON.stringify(colour1.hsl));
console.log("xyz: " + JSON.stringify(colour1.xyz));
console.log("luminance: " + JSON.stringify(colour1.luminance));

const colour2 = new Colour();
console.log("colour initialised with empty");
console.log("hex: " + colour2.hex);
console.log("rgb: " + JSON.stringify(colour2.rgb));
console.log("hsl: " + JSON.stringify(colour2.hsl));
console.log("xyz: " + JSON.stringify(colour2.xyz));
console.log("luminance: " + JSON.stringify(colour2.luminance));

const colour3 = new Colour({ h: 0.54, s: 1, l: 0.5 });
console.log("colour initialised with HSL");
console.log("hex: " + colour3.hex);
console.log("rgb: " + JSON.stringify(colour3.rgb));
console.log("hsl: " + JSON.stringify(colour3.hsl));
console.log("xyz: " + JSON.stringify(colour3.xyz));
console.log("luminance: " + JSON.stringify(colour3.luminance));

const colour4 = new Colour(0.55);
console.log("colour initialised with luminance");
console.log("hex: " + colour4.hex);
console.log("rgb: " + JSON.stringify(colour4.rgb));
console.log("hsl: " + JSON.stringify(colour4.hsl));
console.log("xyz: " + JSON.stringify(colour4.xyz));
console.log("luminance: " + JSON.stringify(colour4.luminance));
