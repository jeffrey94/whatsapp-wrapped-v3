# User Requirements Specification

This document outlines the specific requirements provided by the user during the design and development process.

## 1. Design Principle: Mobile-First Everywhere
**Requirement:** The entire application must strictly follow a "Mobile First" design principle.
- **Homepage:** Vertical orientation, optimized for phone screens.
- **Slides:** All presentation slides must be designed for mobile viewing (vertical, big touch targets, readable fonts on small screens) rather than desktop. 

## 2. Feature: Topic "Leader" Recognition
**Requirement:** The "Topics" slide must identify and display the name of the participant who most often leads or initiates that specific topic.
- The system needs to track "who led this" (`ledBy`) for each topic.
- This name must be visible on the specific topic card in the final presentation.

## 3. Data & Content Completeness
**Requirement:** The application MUST display **ALL** generated content.
- **Source of Truth:** Content structure should follow the format of `sample.json`.
- **Zero Truncation Policy:** "Super important" — every piece of content listed in the JSON (quotes, moments, badges) must be shown.
- **Dynamic Slides:** If the content is too long for a single screen, the system **must generate additional slides** to accommodate it. Do not cut content short.
- **Exclusion:** The **only** content to be explicitly excluded is the "Network Graph" (visual node graph). Everything else must be present.

## 4. Layout & Visual Composition
**Requirement:** Improve the visibility of the background elements ("message boxes") and the overall spacing on the homepage.
- **Visual Separation:** Create a dedicated space between the main Headline and the Upload File section.
- **Purpose:** This space is specifically to allow the "message box" (background animation) to be clearly visible to the user.
- **Adjustments:** Move the upload section lower down the screen to open up this central viewing area.
- **Clarity:** Ensure the message boxes are clearer/more visible when they flow through the center of the screen.

## 5. User Flow: Upload & Disclaimer
**Requirement:** Change the file upload interaction flow to be a two-step process with a specific warning.
- **Initial State:** Do *not* show the disclaimer immediately on the screen.
- **Trigger:** The disclaimer/warning should *only* appear after the user clicks "Select text file".
- **Modal Choice:** The user must be presented with a choice (e.g., "I surrender").

## 6. Copywriting & Tone
**Requirement:** The disclaimer text must be sarcastic, funny, and recognizable.
- **Brand Name:** Use "Google" instead of "Gemini" (as "no one knows Gemini").
- **Theme:** "Surrendering to Google Overlords".
- **Tone Adjustment:** The initial disclaimer was deemed "too scary," so the final requirement is to make it "funnier" and lighter/playful while maintaining the sarcastic "surrender" theme.