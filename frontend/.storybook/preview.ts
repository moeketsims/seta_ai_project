import type { Preview } from '@storybook/react';
import '../src/app/globals.css';
import { ThemeProvider } from '../src/components/theme/theme-provider';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    }
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Story />
      </ThemeProvider>
    )
  ]
};

export default preview;
