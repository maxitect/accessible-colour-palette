// Function to generate a random color in hexadecimal format
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to convert hex color to RGB
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}

// Function to convert RGB to hex color
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// Function to convert RGB to HSL
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

// Function to convert HSL to RGB
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 3) return q;
            if (t < 1 / 2) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Function to find complementary color
function getComplementaryColor(rgb) {
    const [r, g, b] = rgb;
    return [255 - r, 255 - g, 255 - b];
}

// Function to find split-complementary colors
function getSplitComplementaryColors(rgb) {
    const [r, g, b] = rgb;
    const [h, s, l] = rgbToHsl(r, g, b);

    const splitHue1 = (h + 5 / 12) % 1; // 150 degrees
    const splitHue2 = (h - 5 / 12 + 1) % 1; // -150 degrees

    const splitColor1 = hslToRgb(splitHue1, s, l);
    const splitColor2 = hslToRgb(splitHue2, s, l);

    return [splitColor1, splitColor2];
}

// Function to find triadic colors
function getTriadicColors(rgb) {
    const [r, g, b] = rgb;
    const [h, s, l] = rgbToHsl(r, g, b);

    const triadHue1 = (h + 1 / 3) % 1;
    const triadHue2 = (h + 2 / 3) % 1;

    const triadicColor1 = hslToRgb(triadHue1, s, l);
    const triadicColor2 = hslToRgb(triadHue2, s, l);

    return [triadicColor1, triadicColor2];
}

// Function to find tetradic colors
function getTetradicColors(rgb) {
    const [r, g, b] = rgb;
    const [h, s, l] = rgbToHsl(r, g, b);

    const tetradHue1 = (h + 1 / 4) % 1;
    const tetradHue2 = (h + 1 / 2) % 1;

    const tetradicColor1 = hslToRgb(tetradHue1, s, l);
    const tetradicColor2 = hslToRgb(tetradHue2, s, l);

    return [tetradicColor1, tetradicColor2];
}

// Function to find square colors
function getSquareColors(rgb) {
    const [r, g, b] = rgb;
    const [h, s, l] = rgbToHsl(r, g, b);

    const squareHue1 = (h + 1 / 4) % 1;
    const squareHue2 = (h + 1 / 2) % 1;
    const squareHue3 = (h + 3 / 4) % 1;

    const squareColor1 = hslToRgb(squareHue1, s, l);
    const squareColor2 = hslToRgb(squareHue2, s, l);
    const squareColor3 = hslToRgb(squareHue3, s, l);

    return [squareColor1, squareColor2, squareColor3];
}

// Function to generate a color scheme based on a chosen method
function generateColorScheme(baseColor = null) {
    // Determine the base color (either user-input or randomly generated)
    const baseHexColor = baseColor || getRandomColor();
    const baseRgb = hexToRgb(baseHexColor);

    // Randomly select a color harmony method
    const methods = ['complementary', 'split-complementary', 'triadic', 'tetradic', 'square'];
    const method = methods[Math.floor(Math.random() * methods.length)];
    let secondColorRgb, thirdColorRgb;

    // Generate the second color
    switch (method) {
        case 'complementary':
            secondColorRgb = getComplementaryColor(baseRgb);
            break;
        case 'split-complementary':
            [secondColorRgb] = getSplitComplementaryColors(baseRgb);
            break;
        case 'triadic':
            [secondColorRgb] = getTriadicColors(baseRgb);
            break;
        case 'tetradic':
            [secondColorRgb] = getTetradicColors(baseRgb);
            break;
        case 'square':
            [secondColorRgb] = getSquareColors(baseRgb);
            break;
        default:
            throw new Error('Unknown color scheme method');
    }

    // Generate the third color based on the second color
    const nextMethod = methods[Math.floor(Math.random() * methods.length)];
    switch (nextMethod) {
        case 'complementary':
            thirdColorRgb = getComplementaryColor(secondColorRgb);
            break;
        case 'split-complementary':
            [, thirdColorRgb] = getSplitComplementaryColors(secondColorRgb);
            break;
        case 'triadic':
            [, thirdColorRgb] = getTriadicColors(secondColorRgb);
            break;
        case 'tetradic':
            [, thirdColorRgb] = getTetradicColors(secondColorRgb);
            break;
        case 'square':
            [, , thirdColorRgb] = getSquareColors(secondColorRgb);
            break;
        default:
            throw new Error('Unknown color scheme method');
    }

    const color1 = baseHexColor;
    const color2 = rgbToHex(...secondColorRgb);
    const color3 = rgbToHex(...thirdColorRgb);

    return [color1, color2, color3];
}

// Example usage with a user-input base color or randomly generated one
const userInputColor = null; // Replace with a hex color string if needed, e.g., '#FF5733'
const colorScheme = generateColorScheme(userInputColor);
console.log("Generated Color Scheme: ", colorScheme);
