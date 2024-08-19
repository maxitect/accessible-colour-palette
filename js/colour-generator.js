class Colour {
    constructor({ hex = null, hsl = null, luminance = null } = {}) {

        if (hex) {
            // If initialized with hex
            this.hex = hex;
            this.rgb = null;
            this.hsl = null;
            this.luminance = null;
        } else if (hsl) {
            // If initialized with HSL
            this.hsl = hsl;
            this.rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
            this.hex = this.rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
            this.luminance = null;
        } else if (luminance) {
            this.luminance = luminance;
            console.log(this.luminance);
            this.rgb = this.generateRgbFromLuminance(luminance);
            console.log(this.rgb);
            this.hex = this.rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
            this.hsl = null;
            console.log("luminance before fetch: ", 0.2126 * this.inverseSRGB(this.rgb.r/255) + 0.7152 * this.inverseSRGB(this.rgb.g/255) + 0.0722 * this.inverseSRGB(this.rgb.b/255));
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
        this.textColour = null;
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

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    // Method to calculate the inverse sRGB linearization
    inverseSRGB(cLinear) {
        return cLinear <= 0.04045 ? cLinear / 12.92 : Math.pow((cLinear + 0.055) / 1.055, 2.4);
    }

    // Method to calculate the sRGB value from a linear value
    linearToSRGB(cLinear) {
        return cLinear <= 0.00313080495356037151702786377709 ? cLinear * 12.92 : 1.055 * Math.pow(cLinear, 1 / 2.4) - 0.055;
    }

    // Method to clamp a value between min and max
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    // Method to generate random values between a given range
    randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    async iterateRgbForLuminance(targetLuminance) {
        // Determine if the color should be light or dark
        const isDark = targetLuminance <= 0.1791;
        let tries = 0;
        let luminanceAdjuster = 0;
        let luminanceIncrement;
        if (isDark) {
            luminanceIncrement = -(targetLuminance)/30 //reduce by 10%
        } else {
            luminanceIncrement = (1-targetLuminance)/30 //add 10%
        }
        while (tries < 30) {
            this.rgb = this.generateRgbFromLuminance(targetLuminance + luminanceAdjuster);
            console.log(this.rgb);
            this.hex = this.rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
            console.log(this.hex);
            await this.fetchColorData();
            //break loop if successfully generated high contrast colour
            if (isDark && this.luminance <= targetLuminance) {
                break;
            } else if (!isDark && this.luminance >= targetLuminance) {
                break;
            } else {
                console.log(`Contrasting colour: Try ${tries+1} failed as it did not meet appropriate contrast ratio (luminance: ${this.luminance} / target: ${targetLuminance}), will try again.`)
            }
            tries++;
            luminanceAdjuster += luminanceIncrement;
        }
    }

    // Method to generate RGB values for a given luminance
    generateRgbFromLuminance(targetLuminance) {
        let r, g, b;

        // Determine if the color should be light or dark
        const isDark = targetLuminance <= 0.1791;

        // Adjust the luminance target by moving 10% into the appropriate range
        let adjustedLuminance;
        if (isDark) {
            adjustedLuminance = targetLuminance// * 0.8; // 20% closer to 0
        } else {
            adjustedLuminance = targetLuminance// + (1 - targetLuminance) * 0.2; // 20% closer to 1
        }

        // Define the range for the random values based on whether the color is light or dark
        const minRange = isDark ? 0 : targetLuminance;
        const maxRange = isDark ? targetLuminance : 1;

        // Randomly select two channels to fix
        const channels = ['r', 'g', 'b'];
        const fixedChannels = channels.sort(() => 0.5 - Math.random()).slice(0, 2);

        // Generate the fixed channels within the constrained range
        const fixedValues = {
            [fixedChannels[0]]: this.randomInRange(minRange, maxRange),
            [fixedChannels[1]]: this.randomInRange(minRange, maxRange)
        };

        // Calculate the remaining channel based on the fixed channels and adjusted luminance
        if (fixedChannels.includes('r') && fixedChannels.includes('g')) {
            console.log("b will be calculated");
            r = fixedValues.r;
            g = fixedValues.g;
            b = this.clamp(
                this.linearToSRGB((adjustedLuminance - 0.2126 * this.inverseSRGB(r) - 0.7152 * this.inverseSRGB(g)) / 0.0722),
                0,
                1
            );
        } else if (fixedChannels.includes('r') && fixedChannels.includes('b')) {
            console.log("g will be calculated");
            r = fixedValues.r;
            b = fixedValues.b;
            g = this.clamp(
                this.linearToSRGB((adjustedLuminance - 0.2126 * this.inverseSRGB(r) - 0.0722 * this.inverseSRGB(b)) / 0.7152),
                0,
                1
            );
        } else {
            console.log("r will be calculated");
            g = fixedValues.g;
            b = fixedValues.b;
            r = this.clamp(
                this.linearToSRGB((adjustedLuminance - 0.7152 * this.inverseSRGB(g) - 0.0722 * this.inverseSRGB(b)) / 0.2126),
                0,
                1
            );
        }

        // Convert the channels back to the 0-255 range
        console.log(r,g,b);
        if (isDark) {
            return {
                r: Math.floor(r * 255),
                g: Math.floor(g * 255),
                b: Math.floor(b * 255)
            };
        } else {
            return {
                r: Math.ceil(r * 255),
                g: Math.ceil(g * 255),
                b: Math.ceil(b * 255)
            };
        }
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
            this.textColour = colorData.bestContrast;
            
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
async function generateNewColour(colours) {
    const colourNum = colours.length + 1;
    const hueAdjust = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.25, 0.75, 1 / 3, 2 / 3];
    let tries = 0;
    let newColour = new Colour();
  
    while (tries < 30) {
        let baseColourNum = Math.floor(Math.random()*colours.length);
        console.log(`Colour ${baseColourNum+1} will be used to generate colour ${colourNum}.`);
        let baseColour = colours[baseColourNum];
        let [h, s, l] = [baseColour.hsl["h"], baseColour.hsl["s"], baseColour.hsl["l"]];
        h = ((h + hueAdjust[Math.floor(Math.random() * hueAdjust.length)]) % 1);
        let tempColour = new Colour({
            hsl: { h: h, s: s, l: l }
        });
        await tempColour.fetchColorData();
        let distinct = true; // Assume the new color is distinct unless proven otherwise
  
        // Check the new color against all existing colors
        for (let i = 0; i < colours.length; i++) {
            if (deltaE(tempColour, colours[i]) <= 25) {
                distinct = false; // If similar, mark as not distinct
                break; // Stop checking as one failure is enough to retry
            }
        }
  
        if (distinct) {
            // If the color is distinct from all others, break the loop
            console.log(`Colour ${colourNum}: Try ${tries+1} was successful.`)
            newColour = tempColour;
            break;
        } else if (tries === 29) {
            console.log(`Colour ${colourNum}: ${tries+1} colours tried and failed similarity checks, complimentary colour will be used.`)
            h = (h + 0.5) % 1;
            let tempColour = new Colour({
                hsl: { h: h, s: s, l: l }
            });
            await tempColour.fetchColorData();
            newColour = tempColour;
        } else {
            console.log(`Colour ${colourNum}: Try ${tries+1} failed as it was to similar to an existing colour, will try again.`)
        }
  
        tries++; // Increment tries to prevent infinite loops
    }
    colours.push(newColour);
    return colours;
}

function calculateLuminanceRange(colours, targetRatio) {
    console.log("target ratio used: ", targetRatio);
    const luminancesLight = [];
    const luminancesDark = [];
    const luminanceCutoff = 0.1791;

    // Split the luminances into light and dark categories
    for (const i in colours) {
        if (colours[i].textColour == "white") {
            luminancesDark.push(colours[i].luminance);
        } else {
            luminancesLight.push(colours[i].luminance);
        }
    }

    const luminance = {};
    lightContrastProportion = luminancesDark.length;
    darkContrastProportion = luminancesLight.length;

    // Calculate the lower bound for light colors (luminances >= 0.5)
    if (luminancesLight.length > 0) {
        console.log("light lum: ", (Math.min(...luminancesLight) + 0.05 - 0.05*targetRatio) / targetRatio);
        luminance["light"] = (Math.min(...luminancesLight) + 0.05 - 0.05*targetRatio) / targetRatio;
    } else {
        luminance["light"] = 0; // Any color would contrast sufficiently if there are no light colors
    }

    // Calculate the upper bound for dark colors (luminances < 0.5)
    if (luminancesDark.length > 0) {
        console.log("dark lum: ", targetRatio*Math.max(...luminancesDark) + 0.05*(targetRatio-1));
        luminance["dark"] = targetRatio*Math.max(...luminancesDark) + 0.05*(targetRatio-1);
    } else {
        luminance["dark"] = 1; // Any color would contrast sufficiently if there are no dark colors
    }

    // Output the calculated ranges
    console.log("Light Colors Lower Bound:", luminance["light"]);
    console.log("Dark Colors Upper Bound:", luminance["dark"]);

    return luminance;
}

let targetRatio = 4.5;
let lightContrastProportion = 0;
let darkContrastProportion = 0;

document.addEventListener("DOMContentLoaded", function() {
    const wcagSelect = document.getElementById("wcag-select");

    // Get the selected value
    const selectedValue = wcagSelect.value;
    console.log("Default Selected WCAG Level:", selectedValue);

    // Listen for changes
    wcagSelect.addEventListener("change", function() {
        console.log("Selected WCAG Level:", wcagSelect.value);
        if (wcagSelect.value == "WCAG A") {
            targetRatio = 3;
        } else if (wcagSelect.value == "WCAG AA") {
            targetRatio = 4.5;
        } else {
            targetRatio = 7;
        }
        // You can now use wcagSelect.value as needed
    });
});

async function generateSwatch() {
    console.log("target ratio is: ", targetRatio);
    const inputColour = "";
    let colours =[];
    colours.push(new Colour({ hex: inputColour }));
    await colours[0].fetchColorData();

    for (i=0;i<4;i++) {
        colours = await generateNewColour(colours);
    }

    colours.sort((a, b) => a.luminance - b.luminance);

    for (i=0;i<colours.length;i++) {
        document.getElementById('color'+(i+1)).style.backgroundColor = colours[i].hex;
        document.getElementById('color'+(i+1)).textContent = `${colours[i].name} \n ${colours[i].hex}`;
        document.getElementById('color'+(i+1)).style.color = colours[i].textColour;
    }
    
    luminanceTargets = calculateLuminanceRange(colours, targetRatio);
    console.log(luminanceTargets);
    coloursContrast = []
    if ((luminanceTargets["light"] <= 0)&&(luminanceTargets["dark"] < 1)) {
        console.log("only contrasts for dark colours needed");
        coloursContrast.push(new Colour({ luminance: luminanceTargets["dark"] }));
        await coloursContrast[0].iterateRgbForLuminance(luminanceTargets["dark"]);
    } else if ((luminanceTargets["dark"] >= 1)&&(luminanceTargets["light"] > 0)) {
        console.log("only contrasts for light colours needed");
        coloursContrast.push(new Colour({ luminance: luminanceTargets["light"] }));
        await coloursContrast[0].iterateRgbForLuminance(luminanceTargets["light"]);
    } else if ((luminanceTargets["light"] > 0) && (luminanceTargets["dark"] < 1)) {
        console.log("good contrast colours found!");
        coloursContrast.push(new Colour({ luminance: luminanceTargets["dark"] }));
        await coloursContrast[0].iterateRgbForLuminance(luminanceTargets["dark"]);
        coloursContrast.push(new Colour({ luminance: luminanceTargets["light"] }));
        await coloursContrast[1].iterateRgbForLuminance(luminanceTargets["light"]);
    } else {
        console.log("no good contrast colours found, use black and white");
        coloursContrast.push(new Colour({ hex: "#ffffff" }));
        await coloursContrast[0].fetchColorData();
        coloursContrast.push(new Colour({ hex: "#000000" }));
        await coloursContrast[1].fetchColorData();
    }

    for (i=0;i<coloursContrast.length;i++) {
        document.getElementById('contrast'+(i+1)).style.backgroundColor = coloursContrast[i].hex;
        document.getElementById('contrast'+(i+1)).textContent = `${coloursContrast[i].name} \n ${coloursContrast[i].hex}`;
        document.getElementById('contrast'+(i+1)).style.color = coloursContrast[i].textColour;
        if (coloursContrast.length == 1) {
            document.getElementById('contrast2').remove();
        } else if (i === 0) {
            document.getElementById('contrast'+(i+1)).style.flexGrow = lightContrastProportion;
        } else {
            document.getElementById('contrast'+(i+1)).style.flexGrow = darkContrastProportion;
        }
    }
}



// Initialize colors on page load
console.log("target ratio is: ", targetRatio);
window.onload = generateSwatch();