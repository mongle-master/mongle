import type { Preview } from "@storybook/react";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    backgrounds: { disable: true },
  },
  decorators: [
    (Story) => {
      document.documentElement.classList.add("dark");
      return Story();
    },
  ],
};

export default preview;
