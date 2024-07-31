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

// Function to calculate the distance between two colors
function colorDistance(rgb1, rgb2) {
    return Math.sqrt(Math.pow(rgb1[0] - rgb2[0], 2) + Math.pow(rgb1[1] - rgb2[1], 2) + Math.pow(rgb1[2] - rgb2[2], 2));
}

// Function to check if a color is sufficiently distinct from all others in the scheme
function isDistinctColor(newColor, existingColors) {
    return existingColors.every(existingColor => colorDistance(newColor, existingColor) > 75);
}

// Function to generate harmony options and ensure they are not too similar to existing colors
function generateHarmonyOptions(baseRgb, existingColors, harmony) {
    const [h, s, l] = rgbToHsl(baseRgb[0], baseRgb[1], baseRgb[2]);
    let options = [];
    switch(harmony) {
        case 'complementary':
            options.push(hslToRgb((h + 0.5) % 1, s, l));
            break;
        case 'triadic':
            options.push(hslToRgb((h + 1 / 3) % 1, s, l));
            options.push(hslToRgb((h + 2 / 3) % 1, s, l));
            break;
        case 'tetradic':
            options.push(hslToRgb((h + 0.25) % 1, s, l));
            options.push(hslToRgb((h + 0.5) % 1, s, l));
            options.push(hslToRgb((h + 0.75) % 1, s, l));
            break;
        case 'square':
            options.push(hslToRgb((h + 0.25) % 1, s, l));
            options.push(hslToRgb((h + 0.5) % 1, s, l));
            options.push(hslToRgb((h + 0.75) % 1, s, l));
            break;
    }
    // Filter options that are too similar to existing colors
    options = options.filter(option => isDistinctColor(option, existingColors));
    // Randomly select one of the options if any remain
    return options.length > 0 ? options[Math.floor(Math.random() * options.length)] : baseRgb;
}

// Function to generate a color scheme
function generateColorScheme(baseColor = null) {
    const baseHexColor = baseColor || getRandomColor();
    const baseRgb = hexToRgb(baseHexColor);

    let colors = [baseRgb];  // Array to store all RGB values for distinctness checking
    const harmonies = ['complementary', 'triadic', 'tetradic', 'square'];

    // Generate second and third colors ensuring they are distinct from previous colors
    const baseHarmony = harmonies[Math.floor(Math.random() * harmonies.length)];
    const secondRgb = generateHarmonyOptions(baseRgb, colors, baseHarmony);
    colors.push(secondRgb);

    const secondHarmony = harmonies[Math.floor(Math.random() * harmonies.length)];
    const thirdRgb = generateHarmonyOptions(secondRgb, colors, secondHarmony);
    colors.push(thirdRgb);

    const scheme = {
        colors: colors.map(rgb => rgbToHex(...rgb)),
        names: [
            'Whisper of ' + getColorName(baseRgb),
            'Echo of ' + getColorName(secondRgb),
            'Shadow of ' + getColorName(thirdRgb)
        ]
    };

    return scheme;
}

// Function to provide poetic color names based on HSL values
function getColorName(rgb) {
    const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    const hue = Math.round(h * 360);
    const names = [
        "Crimson Twilight", "Golden Dusk", "Lime Zest", "Viridian Whisper",
        "Ocean Depths", "Turquoise Dream", "Celestial Blue", "Royal Indigo",
        "Mystic Purple", "Magenta Fire", "Rosy Dawn"
    ];
    const index = Math.floor(h * names.length);
    return names[index % names.length] + (l < 0.5 ? " in Shadows" : " in Light");
}

// Example usage with a user-input base color or randomly generated one
const userInputColor = null; // Replace with a hex color string if needed, e.g., '#FF5733'
const colorScheme = generateColorScheme(userInputColor);

// Iterating through the colorScheme object to print each color with its name
for (let i = 0; i < colorScheme.colors.length; i++) {
    console.log(`${colorScheme.names[i]}: ${colorScheme.colors[i]}`);
}

// Apply colors and names to HTML elements
document.getElementById('color1').style.backgroundColor = colorScheme.colors[0];
document.getElementById('color1').textContent = colorScheme.names[0];

document.getElementById('color2').style.backgroundColor = colorScheme.colors[1];
document.getElementById('color2').textContent = colorScheme.names[1];

document.getElementById('color3').style.backgroundColor = colorScheme.colors[2];
document.getElementById('color3').textContent = colorScheme.names[2];