import type { Meta, StoryObj } from '@storybook/react';
import { VirtualManipulativePanel } from './VirtualManipulativePanel';

const meta = {
  title: 'Mathematics/VirtualManipulativePanel',
  component: VirtualManipulativePanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['base-ten', 'fraction-tiles', 'counters', 'algebra-tiles'],
      description: 'The type of manipulative to display',
    },
    prompt: {
      control: 'text',
      description: 'Instructional prompt for the learner',
    },
    initialCount: {
      control: { type: 'number', min: 0, max: 20 },
      description: 'Initial number of manipulative items',
    },
    maxCount: {
      control: { type: 'number', min: 1, max: 50 },
      description: 'Maximum number of items allowed',
    },
  },
} satisfies Meta<typeof VirtualManipulativePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Counters: Story = {
  args: {
    type: 'counters',
    prompt: 'Use counters to help solve the problem',
    initialCount: 5,
    maxCount: 20,
  },
};

export const BaseTenBlocks: Story = {
  args: {
    type: 'base-ten',
    prompt: 'Build the number using base-ten blocks',
    initialCount: 15,
    maxCount: 30,
  },
};

export const FractionTiles: Story = {
  args: {
    type: 'fraction-tiles',
    prompt: 'Explore fractions using these tiles',
    initialCount: 4,
    maxCount: 12,
  },
};

export const AlgebraTiles: Story = {
  args: {
    type: 'algebra-tiles',
    prompt: 'Model the algebraic expression with tiles',
    initialCount: 3,
    maxCount: 15,
  },
};

export const EmptyState: Story = {
  args: {
    type: 'counters',
    prompt: 'Start by adding some counters',
    initialCount: 0,
    maxCount: 20,
  },
};

export const WithInteraction: Story = {
  args: {
    type: 'counters',
    prompt: 'Click Add or Remove to interact',
    initialCount: 7,
    maxCount: 20,
    onInteraction: (action, data) => {
      console.log('Manipulative interaction:', action, data);
    },
  },
};

export const LargeNumber: Story = {
  args: {
    type: 'base-ten',
    prompt: 'Representing larger numbers',
    initialCount: 47,
    maxCount: 100,
  },
};
