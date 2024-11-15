const Colour = require("./colourConstructor");

class Palette {
  constructor(targetRatio, numberOfColours, ...colours) {
    this.targetRatio = targetRatio;
    this.unachievableLuminanceRange =
      this.calculateUnachievableLuminanceRange();
    this.colours = colours ?? [];
    this.generateColours(numberOfColours);
    this.contrasts = this.generateContrasts();
    this.sortColoursByLuminance();
  }

  generateColours(numberOfColours) {
    if (this.colours.length === 0) {
      this.colours.push(new Colour());
    }

    const coloursToAdd = numberOfColours - this.colours.length;

    const hueAdjust = [
      0.1,
      0.2,
      0.3,
      0.4,
      0.5,
      0.6,
      0.7,
      0.8,
      0.9,
      0.25,
      0.75,
      1 / 3,
      2 / 3,
    ];

    for (let i = 0; i < coloursToAdd; i++) {
      let tries = 0;
      let newColour;
      while (tries < 50) {
        const baseColour = this.colours[this.colours.length - 1];
        let [h, s, l] = [baseColour.hsl.h, baseColour.hsl.s, baseColour.hsl.l];
        h = (h + hueAdjust[Math.floor(Math.random() * hueAdjust.length)]) % 1;
        const tempColour = new Colour({ h, s, l });

        // Check if the new colour is distinct
        if (Math.min(...this.colourDistances(tempColour)) <= 10) {
          tries++;
          continue;
        }

        // Check if the new colour's luminance is acceptable
        if (
          tempColour.luminance < this.unachievableLuminanceRange.min ||
          tempColour.luminance > this.unachievableLuminanceRange.max
        ) {
          newColour = tempColour;
          break;
        } else if (tries === 49) {
          // Use complementary colour if all tries fail
          h = (h + 0.5) % 1;
          newColour = new Colour({ h, s, l });
          break;
        }

        tries++;
      }

      this.colours.push(newColour);
    }
  }

  generateContrasts() {
    // method that will generate contrasting colours based on the target contrast ratio
    console.log("target ratio used: ", this.targetRatio);
    const luminancesLight = [];
    const luminancesDark = [];

    // Split the luminances into light and dark categories
    for (let colour of this.colours) {
      if (colour.textColour == "white") {
        luminancesDark.push(colour.luminance);
      } else {
        luminancesLight.push(colour.luminance);
      }
    }

    const luminance = {};
    const contrasts = [];

    // Calculate the upper bound for dark colors (luminances < 0.5)
    if (luminancesDark.length > 0) {
      luminance["dark"] =
        this.targetRatio * Math.max(...luminancesDark) +
        0.05 * (this.targetRatio - 1);
      contrasts.push(new Colour(luminance["dark"]));
    } else {
      luminance["dark"] = 1; // Any color would contrast sufficiently if there are no dark colors
    }

    // Calculate the lower bound for light colors (luminances >= 0.5)
    if (luminancesLight.length > 0) {
      luminance["light"] =
        (Math.min(...luminancesLight) + 0.05 - 0.05 * this.targetRatio) /
        this.targetRatio;
      contrasts.push(new Colour(luminance["light"]));
    } else {
      luminance["light"] = 0; // Any color would contrast sufficiently if there are no light colors
    }

    // Output the calculated ranges
    console.log("Light Colors Lower Bound:", luminance["light"]);
    console.log("Dark Colors Upper Bound:", luminance["dark"]);

    return contrasts;
  }

  // Method to calculate the distance between colours in XYZ colourspace (ie the difference between colours)
  colourDistances(tempColour) {
    const { x: x1, y: y1, z: z1 } = tempColour.xyz;
    return this.colours.map((colour) => {
      const { x: x2, y: y2, z: z2 } = colour.xyz;
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
    });
  }

  calculateUnachievableLuminanceRange() {
    // Calculate the upper bound for when the luminance is the lighter color (L1)
    const upperBoundL1 = this.targetRatio * 0.05 - 0.05;

    // Calculate the lower bound for when the luminance is the darker color (L2)
    const lowerBoundL2 = (1 + 0.05) / this.targetRatio - 0.05;

    // If the bounds overlap or are invalid, return null
    if (lowerBoundL2 >= upperBoundL1) {
      return {
        min: 1,
        max: 0,
      }; // All colors can achieve the contrast ratio
    }

    // Otherwise, return the range that cannot achieve the contrast ratio
    return {
      min: lowerBoundL2,
      max: upperBoundL1,
    };
  }

  // Method to fetch all colours names all colours in the palette, contrasts and
  async fetchColourNames() {
    // write method that can fetch all colour names in 1 API call
    const allColours = this.colours.concat(this.contrasts);
    const apiUrl = allColours
      .reduce(
        (acc, current) => acc + current.hex.replace("#", "") + ",",
        "https://api.color.pizza/v1/?values="
      )
      .slice(0, -1);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data.colors.length === 0) {
        throw new Error("No colours found in the API response");
      }

      // Update class properties with the API data
      for (let i = 0; i < allColours.length; i++) {
        allColours[i].name = data.colors[i].name;
      }
    } catch (error) {
      console.error("Error fetching colour data:", error);
    }
  }

  // Sort colours by luminance from darkest to lightest
  sortColoursByLuminance() {
    this.colours.sort((a, b) => a.luminance - b.luminance);
  }
}

let coolPalette = new Palette(4.5, 5);
console.log(coolPalette);
for (let colour of coolPalette.colours) {
  console.log(colour.luminance);
}

for (let colour of coolPalette.contrasts) {
  console.log(colour.luminance);
}
