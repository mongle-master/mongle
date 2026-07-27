import type { Preview } from '@storybook/react-vite'
import './tailwind.css'

const preview: Preview = {
  globalTypes: {
    theme: {
      description: '테마 — Paper(라이트) / Night(다크)',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Paper', icon: 'sun' },
          { value: 'dark', title: 'Night', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === 'dark' ? 'dark' : 'light'
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        document.documentElement.classList.toggle('light', theme === 'light')
      }
      return (
        <div style={{ padding: '24px', background: 'var(--background)', minHeight: '100vh' }}>
          <Story />
        </div>
      )
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
}

export default preview
