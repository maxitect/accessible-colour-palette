async function paletteGenerator() {
  // Get the target ratio from the dropdown
  const wcagSelect = document.getElementById("wcag-select").value;
  let targetRatio;
  switch (wcagSelect) {
    case "WCAG A":
      targetRatio = 3;
      break;
    case "WCAG AA":
      targetRatio = 4.5;
      break;
    case "WCAG AAA":
      targetRatio = 7;
      break;
    default:
      targetRatio = 4.5; // Default to AA
  }

  // Get the input color if provided
  const inputColorValue = document.getElementById("inputColor").value.trim();
  let initialColour = null;
  if (/^#[0-9A-F]{6}$/i.test(inputColorValue)) {
    initialColour = new Colour(inputColorValue);
    console.log(initialColour);
  }

  // Create a new Palette instance
  const palette = initialColour
    ? new Palette(targetRatio, 4, initialColour)
    : new Palette(targetRatio, 4);

  // Fetch colour names if necessary
  await palette.fetchColourNames();

  // Sort colours by luminance
  palette.colours.sort((a, b) => a.luminance - b.luminance);

  // Display generated colours
  for (let i = 0; i < palette.colours.length; i++) {
    const colour = palette.colours[i];
    const colourDiv = document.getElementById("color" + (i + 1));
    if (colourDiv) {
      colourDiv.style.backgroundColor = colour.hex;
      colourDiv.innerHTML = `${colour.name ?? "Unnamed"}<br>${colour.hex}`;
      colourDiv.style.color = colour.textColour;
    }
  }

  // Display contrast colours
  for (let i = 0; i < palette.contrasts.length; i++) {
    const contrastColour = palette.contrasts[i];
    const contrastDiv = document.getElementById("contrast" + (i + 1));
    if (contrastDiv) {
      contrastDiv.style.backgroundColor = contrastColour.hex;
      contrastDiv.innerHTML = `${contrastColour.name ?? "Unnamed"}<br>${
        contrastColour.hex
      }`;
      contrastDiv.style.color = contrastColour.textColour;
    }
  }

  // Handle cases where only one contrast colour is needed
  if (palette.contrasts.length === 1) {
    // Remove the second contrast div if it exists
    const contrast2Div = document.getElementById("contrast2");
    if (contrast2Div) {
      contrast2Div.remove();
    }
  } else {
    // Ensure both contrast divs are present
    const contrastContainer = document.querySelectorAll(".color-container")[1];
    if (!document.getElementById("contrast2")) {
      const contrastDiv = document.createElement("div");
      contrastDiv.className = "color-box";
      contrastDiv.id = "contrast2";
      contrastContainer.appendChild(contrastDiv);
    }
  }
}

// Event listeners
document
  .getElementById("wcag-select")
  .addEventListener("change", paletteGenerator);
document
  .querySelector(".input-container button")
  .addEventListener("click", paletteGenerator);

// Initialize colours on page load
window.onload = paletteGenerator;
