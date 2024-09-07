const Colour = require('./colour-constructor');

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
        // write method that will generate any missing colours based on generateNewColour function in colour-generator.js but does not need to be async
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
}
