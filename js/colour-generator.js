class Colour {
    constructor({ hex = null, hsl = null } = {}) {

        if (hex) {
            // If initialized with hex
            this.hex = hex;
            this.rgb = null;
            this.hsl = null;
        } else if (hsl) {
            // If initialized with HSL
            this.hsl = hsl;
            this.rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
            this.hex = this.rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
        } else {
            this.hex = this.getRandomHex();
            this.rgb = null;
            this.hsl = null;
        }

        // Initialise name to be filled by API call
        this.name = null;

        // Initialize LAB and luminance to null until filled by API
        this.lab = null;
        this.luminance = null;
    }

    // Function to generate a random color in hexadecimal format
    getRandomHex() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Method to convert RGB to Hex
    rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }

    // Method to convert HSL to RGB
    hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }

    // Method to fetch color data from the API and update properties
    async fetchColorData() {
        const cleanHex = this.hex.replace('#', '');
        const apiUrl = `https://api.color.pizza/v1/${cleanHex}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (data.colors.length === 0) {
                throw new Error('No colors found in the API response');
            }

            const colorData = data.colors[0];

            // Update class properties with the API data
            this.name = colorData.name;
            this.hex = colorData.hex;
            this.rgb = colorData.rgb;
            this.hsl = {
                h: colorData.hsl.h / 360,  // Normalizing hue value to [0,1] range
                s: colorData.hsl.s / 100,  // Normalizing saturation to [0,1] range
                l: colorData.hsl.l / 100   // Normalizing lightness to [0,1] range
            };
            this.lab = colorData.lab;
            this.luminance = colorData.luminanceWCAG;

        } catch (error) {
            console.error('Error fetching color data:', error);
        }
    }
}

// Function to calculate the difference between 2 colours based on delta E
function deltaE(colA, colB) {
    let labA = [colA.lab["l"], colA.lab["a"], colA.lab["b"]];
    let labB = [colB.lab["l"], colB.lab["a"], colB.lab["b"]];
    let deltaL = labA[0] - labB[0];
    let deltaA = labA[1] - labB[1];
    let deltaB = labA[2] - labB[2];
    let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
    let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
    let deltaC = c1 - c2;
    let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    let sc = 1.0 + 0.045 * c1;
    let sh = 1.0 + 0.015 * c1;
    let deltaLKlsl = deltaL / (1.0);
    let deltaCkcsc = deltaC / (sc);
    let deltaHkhsh = deltaH / (sh);
    let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
}

// Function to generate harmony options and ensure they are not too similar to existing colors
async function generateNewColour(baseColour, existingColours) {
    console.log(existingColours[0]);
    let [h, s, l] = [baseColour.hsl["h"], baseColour.hsl["s"], baseColour.hsl["l"]];
    const hueAdjust = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.25, 0.75, 1 / 3, 2 / 3];
    let tries = 0;
    let newColour = new Colour();
  
    while (tries < 30) {
        h = ((h + hueAdjust[Math.floor(Math.random() * hueAdjust.length)]) % 1);
        //PROBLEM!
        let tempColour = new Colour({
            hsl: { h: h, s: s, l: l }
        });
        await tempColour.fetchColorData();
        let distinct = true; // Assume the new color is distinct unless proven otherwise
  
        // Check the new color against all existing colors
        for (let i = 0; i < existingColours.length; i++) {
            if (deltaE(tempColour, existingColours[i]) <= 25) {
                distinct = false; // If similar, mark as not distinct
                break; // Stop checking as one failure is enough to retry
            }
        }
  
        if (distinct) {
            // If the color is distinct from all others, break the loop
            console.log(`Colour ${tries+1} was successful.`)
            newColour = tempColour;
            break;
        } else if (tries === 29) {
            console.log(`${tries+1} colours tried and failed similarity checks, random colour will be generated.`)
            await newColour.fetchColorData();
        } else {
            console.log(`Colour ${tries+1} failed as it was to similar to an existing colour, will try again.`)
        }
  
        tries++; // Increment tries to prevent infinite loops
    }
  
    return newColour;
}


async function generateSwatch() {
    const inputColour = document.getElementById('inputColor').value;
    const colours =[];
    colours.push(new Colour({ hex: inputColour }));
    await colours[0].fetchColorData();

    tempColour = await generateNewColour(colours[0],colours);
    colours.push(tempColour);

    tempColour = await generateNewColour(colours[Math.ceil(Math.random())],colours);
    colours.push(tempColour);

    console.log("first colour: ", colours[0], "second colour: ", colours[1], "third colour: ", colours[2]);

    document.getElementById('color1').style.backgroundColor = colours[0].hex;
    document.getElementById('color1').textContent = `${colours[0].name} \n ${colours[0].hex}`;

    document.getElementById('color2').style.backgroundColor = colours[1].hex;
    document.getElementById('color2').textContent = `${colours[1].name} \n ${colours[1].hex}`;

    document.getElementById('color3').style.backgroundColor = colours[2].hex;
    document.getElementById('color3').textContent = `${colours[2].name} \n ${colours[2].hex}`;
}

generateSwatch();

// Initialize colors on page load
window.onload = generateSwatch;