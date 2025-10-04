Overview

This document explains how to implement a theme toggle button that switches between light and dark modes in the example section of the project.
The feature dynamically updates the <html> element’s data-theme attribute to apply the appropriate color scheme.

Features

Default Mode: Light

Toggle Button: Switches between light and dark themes

Dynamic Update: Changes data-theme attribute on <html>

Smooth Transition: CSS variables and transitions used for a seamless switch
File Structure
examples/toggle-theme/
├── index.html        # Contains the toggle button and markup
├── script.js         # Handles theme switching logic
└── styles.css        # Defines color styles for light and dark themes

How to Use

Open the example project:

npm run dev


Navigate to:

examples/toggle-theme/index.html