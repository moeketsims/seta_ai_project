import type { Meta, StoryObj } from '@storybook/react';
import { VisualFractionBar } from './VisualFractionBar';

const meta = {
  title: 'Mathematics/VisualFractionBar',
  component: VisualFractionBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    numerator: {
      control: { type: 'number', min: 0, max: 20 },
      description: 'The numerator of the fraction',
    },
    denominator: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'The denominator of the fraction',
    },
    label: {
      control: 'text',
      description: 'Optional label for the fraction bar',
    },
    showValues: {
      control: 'boolean',
      description: 'Whether to show the fraction values',
    },
    color: {
      control: 'select',
      options: ['bg-primary', 'bg-secondary', 'bg-success', 'bg-warning', 'bg-error'],
      description: 'The color of the filled segments',
    },
  },
} satisfies Meta<typeof VisualFractionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneHalf: Story = {
  args: {
    numerator: 1,
    denominator: 2,
    label: 'One Half',
    showValues: true,
  },
};

export const ThreeQuarters: Story = {
  args: {
    numerator: 3,
    denominator: 4,
    label: 'Three Quarters',
    showValues: true,
  },
};

export const TwoFifths: Story = {
  args: {
    numerator: 2,
    denominator: 5,
    label: 'Two Fifths',
    showValues: true,
  },
};

export const FourEighths: Story = {
  args: {
    numerator: 4,
    denominator: 8,
    label: 'Four Eighths (equivalent to 1/2)',
    showValues: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    numerator: 3,
    denominator: 6,
    showValues: true,
  },
};

export const WithoutValues: Story = {
  args: {
    numerator: 2,
    denominator: 3,
    label: 'Guess the fraction',
    showValues: false,
  },
};

export const ImproperFraction: Story = {
  args: {
    numerator: 7,
    denominator: 4,
    label: 'Seven Quarters (improper fraction)',
    showValues: true,
  },
};

export const DifferentColor: Story = {
  args: {
    numerator: 3,
    denominator: 5,
    label: 'Using secondary color',
    showValues: true,
    color: 'bg-secondary',
  },
};
