# Warcraft Rumble XP Counter

This is a web-based XP counter designed for Warcraft Rumble players to track their Daily XP cap. 

It allows users to track mission progress, apply XP per mission values, visualize completion percentage, and interact with bonus multipliers and booster XP. 

The app supports sound effects, visual effects, and automatic daily reset.

You can directly access the app on Github pages: https://ccirvine.github.io/rumblexpcounter/

## 🌟 Features

- Add and subtract mission counts using multipliers (x1, x3, x5)
- Auto-calculated total XP progress toward 50,000 XP
- Automatic daily reset at 18:00 UTC
- "XP per mission" input
- Total mission counter
- Collection level table with auto-fill on click
- LocalStorage persistence across sessions

## 🚀 Getting Started

To run locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/ccirvine/rumblexpcounter.git
   ```

2. Open `index.html` in any modern web browser.

> ✅ No installation needed. Fully client-side.

## 📅 Daily Reset Logic
The app resets the XP and mission counters automatically the first time you open it after 18:00 UTC each day.

## 🎮 XP Table Logic
Each collection level has a base XP value and a booster value (+20%). Clicking any XP cell updates the mission XP input.

## 🧠 Technologies Used
HTML5 + CSS3 + JavaScript

LocalStorage

Audio + basic DOM animations
