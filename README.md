# maryabadawi.github.io

My personal portfolio website: **https://maryabadawi.github.io**

I'm Marya Badawi, a Software Engineering student at UBT in Jeddah, working towards becoming an AI Engineer. This site shows my projects, certificates and how to contact me.

## What's on it

- **About**: who I am
- **Skills**
- **Projects**: finished projects and the ones I'm building next
- **Certificates**: each online certificate has a Verify link
- **Contact**: LinkedIn, GitHub and email icons (the email icon copies my address)

## Features

- Dark / light mode: follows your device setting on the first visit, then remembers your choice
- Works on phones (the menu wraps and scrolls)
- Collapsible certificate groups
- A night sky behind the page: random twinkling stars, three real constellations (Orion, Ursa Major, Cassiopeia) and the odd shooting star. It stays still for visitors who turn off animations
- "Last updated" date in the footer, filled in automatically

## Built with

| Part | Tool |
| --- | --- |
| Page structure | HTML |
| Design + phone layout | CSS (colours stored as variables, so dark mode only swaps the variables) |
| Dark mode, night sky, email copy, date | JavaScript (`localStorage` remembers the theme, `<canvas>` draws the sky) |
| Hosting | GitHub Pages |

## Run it locally

No build step. Download the repo and open `index.html` in a browser.

## Files

| File | What it does |
| --- | --- |
| `index.html` | All the content |
| `style.css` | Colours, layout, dark mode colours, phone layout |
| `script.js` | Dark mode button, night sky, email copy, "Last updated" date |
