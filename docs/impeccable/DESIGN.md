---
name: Market brief
description: A railway timetable for Australian equities.
colors:
  trace: "#89e0da"
  focus: "#176c74"
  gain: "#176452"
  loss: "#973f40"
  canvas: "#edf2f5"
  paper: "#f8fafb"
  ink: "#162735"
  muted: "#4d6170"
  rule: "#cdd9e0"
  ticker: "#e1e9ee"
  navy: "#112c3d"
  on-navy: "#f2f8fb"
  on-navy-muted: "#aec3ce"
  range-track: "#1b3a4d"
  range-hover: "#315568"
  retry-hover: "#b3ece8"
  plot-grid: "#345265"
  plot-area: "#1d4655"
  plot-cursor: "#84a7b7"
typography:
  display:
    fontFamily: "Barlow Semi Condensed, Avenir Next, Segoe UI, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Barlow Semi Condensed, Avenir Next, Segoe UI, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Avenir Next, Segoe UI, sans-serif"
  label:
    fontFamily: "Avenir Next, Segoe UI, sans-serif"
    fontSize: "0.81rem"
  control:
    fontFamily: "Avenir Next, Segoe UI, sans-serif"
    fontSize: "0.81rem"
    fontWeight: 700
  quote:
    fontFamily: "Avenir Next, Segoe UI, sans-serif"
    fontSize: "2.4rem"
    fontWeight: 740
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  ticker:
    fontFamily: "Avenir Next, Segoe UI, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 730
    letterSpacing: "0.025em"
rounded:
  control: "4px"
  group: "6px"
  panel: "14px"
spacing:
  segment-gap: "3px"
  panel-gap: "16px"
  ledger-inset: "24px"
  mobile-panel-inset: "17px"
components:
  masthead:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    height: "64px"
  ticker:
    backgroundColor: "{colors.ticker}"
    textColor: "{colors.ink}"
    typography: "{typography.ticker}"
    rounded: "{rounded.control}"
    padding: "3px 8px"
  range-group:
    backgroundColor: "{colors.range-track}"
    rounded: "{rounded.group}"
    padding: "{spacing.segment-gap}"
  range-button:
    backgroundColor: "transparent"
    textColor: "{colors.on-navy}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 11px"
  range-button-hover:
    backgroundColor: "{colors.range-hover}"
  range-button-selected:
    backgroundColor: "{colors.trace}"
    textColor: "{colors.navy}"
  retry:
    backgroundColor: "{colors.trace}"
    textColor: "{colors.navy}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 11px"
  retry-hover:
    backgroundColor: "{colors.retry-hover}"
  price-chart:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.on-navy}"
    rounded: "{rounded.panel}"
    padding: "25px 27px 20px"
  market-ledger:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.ledger-inset}"
  financial-strip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "21px 25px"
---

# Market brief design system

## Overview

**Creative North Star: "Railway Timetable"**

The dark chart reads like a station display. A cool daylight frame surrounds it, and a compact ledger makes the accompanying figures easy to scan.

- Condensed headings establish hierarchy.
- Tabular readings sit in fixed positions.
- Hairlines separate measurements and groups.

## Colors

### Primary

Aqua carries the price trace, cursor marker, selected range and retry action. Deep teal provides focus and link feedback on light surfaces. Aqua takes over for focus on navy.

### Secondary

Deep green and muted red mark daily gains and losses. The sign on the number communicates direction alongside color.

### Neutral

Blue-grey canvas surrounds near-white paper and a navy chart field. Ink carries primary text on paper. Slate is for labels and notes. Frost and pale slate serve the same roles on navy. Fine blue-grey rules divide the light panels. The plot uses its own subdued grid, fill and dashed cursor.

## Typography

Barlow Semi Condensed at weight 700 gives the company name and section titles their timetable character. The Avenir Next and Segoe UI stack carries labels, controls and numeric readings. The company name steps down to 2.55rem and the latest quote to 2rem at 570px and below.

**The Fixed Reading Rule.** Use tabular numerals for quotes, axis labels, selected dates and metric values. Keep the trading date and currency next to the corresponding reading.

## Layout

Center the page within a 1160px maximum, with 40px side gutters when space allows. The desktop dashboard gives the chart 2.4 shares and the ledger one share, with a 275px minimum ledger width. Keep a 16px gap between panels. The financial strip spans both columns and divides figures into four cells.

At 900px and below, use 24px gutters and stack the chart above a two-column market ledger. At 570px and below, reduce gutters to 16px, stack the company and quote, and use two columns in the financial strip. At 380px and below, the ledger becomes a single column and the chart controls sit below the chart title.

## Elevation & Depth

Surfaces are flat. The dark plot, light paper and cool canvas create depth through tonal contrast. One-pixel rules define the edges and the internal divisions of the paper panels.

## Shapes

Use 14px corners for data panels, 6px for the range track and 4px for the ticker badge and buttons. The plot uses a round 8px marker at the inspected observation.

## Components

### Masthead and ticker

Keep the masthead on paper with a fine bottom rule and a teal market glyph. Give the ticker a compact, blue-grey badge beside the exchange.

### Range controls and retry

Use a grouped range selector with a solid aqua pressed state and a lighter navy hover state on unselected options. Options have a minimum height of 36px and grow to 40px on small screens. The retry button uses a solid aqua fill that lightens on hover. Keyboard focus is a 2px outline offset by 3px.

### Price chart

Draw a 2px aqua trace on a subdued grid with a tonal area fill. Keep the date and price above the plot so inspection by pointer or keyboard updates the readings in place. The keyboard input gives the plot a 2px aqua outline offset by 5px. Loading and error messages occupy the same dark panel.

### Market ledger and financial strip

Use hairline-separated rows in the ledger and columns in the financial strip. Set metric values in bold, with subdued labels and regular-weight supporting notes. Render unavailable values in muted text.

## Do's and Don'ts

- Do keep the chart trace, selection marker and active range in the same aqua.
- Do label dates and currencies at the point of reading.
- Don't add shadows to the data panels.
- Don't communicate price direction by color alone.
