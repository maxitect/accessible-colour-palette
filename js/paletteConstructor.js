const Colour = require('./colourConstructor');

class Palette {
    constructor(targetRatio, numberOfColours, ...colours) {
        this.targetRatio = targetRatio;
        this.colours = colours;
        if (numberOfColours < colours.length) {
            this.generateColours();
        }
        this.contrasts = this.generateContrasts;
    }
    generateColours() {
        // write method that will generate any missing colours based on generateNewColour and generateSwatch functions in colour-generator.js but does not need to be async
    }
    generateContrasts() {
        // write method that will generate any missing colours based on calculateLuminanceRange function in colour-generator.js and can then initialises new Colour instances using the target luminance
    }
    // Method to calculate the distance between colours in XYZ colourspace (ie the difference between colours)
    colourDistance(xyz1, xyz2) {
        // Destructure the coordinates from the input objects
        const { x: x1, y: y1, z: z1 } = xyz1;
        const { x: x2, y: y2, z: z2 } = xyz2;

        // Calculate the differences for each coordinate
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;

        // Use the 3D distance formula to calculate the distance
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        return distance;
    }
    // Method to fetch all colours names all colours in the palette, contrasts and 
    async fetchColourNames() {
        // write method that can fetch all colour names in 1 API call
        const allColours = this.colours.concat(this.contrasts);
        const apiUrl = allColours.reduce((acc, current) => 
            acc + current.hex.replace('#', '') + ',', 'https://api.color.pizza/v1/?values=').slice(0,-1);
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (data.colors.length === 0) {
                throw new Error('No colours found in the API response');
            }

            // Update class properties with the API data
            for (let i = 0; i < allColours.length; i++) {
                allColours[i].name = data.colors[i].name;
            }
            
        } catch (error) {
            console.error('Error fetching colour data:', error);
        }
    }
}
