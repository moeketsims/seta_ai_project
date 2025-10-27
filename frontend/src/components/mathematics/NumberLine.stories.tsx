import type { Meta, StoryObj } from '@storybook/react';
import { NumberLine } from './NumberLine';

const meta = {
  title: 'Mathematics/NumberLine',
  component: NumberLine,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    min: {
      control: { type: 'number' },
      description: 'The minimum value on the number line',
    },
    max: {
      control: { type: 'number' },
      description: 'The maximum value on the number line',
    },
    step: {
      control: { type: 'number', min: 1 },
      description: 'The step between each tick mark',
    },
    markedValues: {
      control: 'object',
      description: 'Array of values to mark with emphasis',
    },
    highlightValue: {
      control: 'number',
      description: 'A specific value to highlight prominently',
    },
    label: {
      control: 'text',
      description: 'Optional label for the number line',
    },
  },
} satisfies Meta<typeof NumberLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleRange: Story = {
  args: {
    min: 0,
    max: 10,
    step: 1,
    label: 'Count from 0 to 10',
  },
};

export const WithHighlight: Story = {
  args: {
    min: 0,
    max: 10,
    step: 1,
    highlightValue: 7,
    label: 'Number 7 is highlighted',
  },
};

export const WithMarkedValues: Story = {
  args: {
    min: 0,
    max: 20,
    step: 2,
    markedValues: [6, 12, 18],
    label: 'Multiples of 6',
  },
};

export const DecimalComparison: Story = {
  args: {
    min: 0,
    max: 1,
    step: 0.1,
    markedValues: [0.7, 0.23],
    highlightValue: 0.7,
    label: 'Comparing 0.7 and 0.23',
  },
};

export const NegativeNumbers: Story = {
  args: {
    min: -10,
    max: 10,
    step: 2,
    markedValues: [-3, 5],
    highlightValue: -3,
    label: 'Including negative numbers',
  },
};

export const LargeRange: Story = {
  args: {
    min: 0,
    max: 100,
    step: 10,
    markedValues: [30, 70],
    label: 'Counting by tens',
  },
};

export const FractionalSteps: Story = {
  args: {
    min: 0,
    max: 5,
    step: 0.5,
    highlightValue: 2.5,
    label: 'Counting by halves',
  },
};
