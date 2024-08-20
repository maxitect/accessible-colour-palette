# Colarity (working name)

## Description

A colour palette generator that takes accessibility into account, giving the user the option to select a level of compliance between WCAG A / AA / AAA to aim for, and producing a colour palette that meets those requirements.

The palette itself is formed of 4 main colours, and then 1 or 2 high contrast colours in order to cover all the colours in the main palette based on the contrast ratio set by the WCAG level of compliance. These are 3:1 for WCAG A, 4.5:1 for WCAG AA and 7:1 for WCAG AAA.

The user should be able to input a colour or colours for which to base the palette on and possibly have the ability to lock certain colours and regenerate other colours in the palette based on the locked colours.

## Website Name Options

### Current selection
Colarity

### List of options:
* Contrast Creator
* Accessible Palette
* ColorClarity
* Contrast Compass
* Hue Harmony
* Inclusive Colors
* VisiPalette
* A11y Shades
* ContrastCraft
* ColorBlend
* ColorGuard
* ShadeSense
* ContrastWizard
* ColorEase
* AccessiBlend
* Visibility Palette
* ToneTuner
* ColorMingle
* SafeShade
* ContrastMatic
* Accessible Hues
* ColorCheckMate
* HueSafe
* Contrast Vision
* Inclusive Palettes

## Calculations

### Relative Luminance
With RGB colour:\
L = (0.2126 * (((R/255)+0.055)/1.055) ^ 2.4) + (0.7152 * (((G/255)+0.055)/1.055) ^ 2.4) + (0.0722 * (((B/255)+0.055)/1.055) ^ 2.4)\
[More info here](https://www.w3.org/WAI/GL/wiki/Relative_luminance)

### Contrast Ratio
Between 2 colours of relative luminance L1 and L2:\
(L1 + 0.05) / (L2 + 0.05)\
[More info here](https://www.accessibility-developer-guide.com/knowledge/colours-and-contrast/how-to-calculate/)
