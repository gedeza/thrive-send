# ChartjsTwoToneBarDemo

A React demo component showcasing two-tone bar charts using [Chart.js](https://www.chartjs.org/) and [react-chartjs-2](https://react-chartjs-2.js.org/).

## Features

- **Two Bar Charts:**
  - **Vertical:** Monthly UVs (Jan–Apr), alternating blue and green bars.
  - **Horizontal:** Feature usage (A–D), alternating green and blue bars.
- **Responsive Layout:** Charts are displayed side-by-side and adapt to container width.
- **Legend:** Enabled for both charts.

## Dependencies

- `chart.js`
- `react-chartjs-2`

Install with:

```bash
npm install chart.js react-chartjs-2
```

## Usage

```tsx
import { ChartjsTwoToneBarDemo } from "./prototypes/ChartjsTwoToneBarDemo";

function App() {
  return <ChartjsTwoToneBarDemo />;
}
```

## Customization

- **Colors:**  
  Change the `BLUE` and `GREEN` constants to use different tones.
- **Data:**  
  Update the `verticalData` and `horizontalData` objects for different datasets.
- **Orientation:**  
  The `indexAxis: 'y'` option in `horizontalOptions` makes the bar chart horizontal.

## File Location

- `/prototypes/ChartjsTwoToneBarDemo.tsx`

---