import type { Meta, StoryObj } from '@storybook/react';
import { StoryContextCard } from './StoryContextCard';

const meta = {
  title: 'Mathematics/StoryContextCard',
  component: StoryContextCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    scenario: {
      control: 'text',
      description: 'The story scenario or word problem',
    },
    culturalContext: {
      control: 'text',
      description: 'Description of the cultural context',
    },
    vocabulary: {
      control: 'object',
      description: 'Array of key vocabulary words',
    },
    comprehensionPrompts: {
      control: 'object',
      description: 'Array of comprehension questions',
    },
    imageUrl: {
      control: 'text',
      description: 'Optional illustration URL',
    },
  },
} satisfies Meta<typeof StoryContextCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MoneyProblem: Story = {
  args: {
    scenario:
      'Sarah has R12.50. She buys a sandwich for R6.75. How much money does she have left?',
    culturalContext: 'South African context using Rand (R) currency',
    vocabulary: ['Rand (R)', 'money', 'cost', 'change', 'subtract'],
    comprehensionPrompts: [
      'How much money does Sarah start with?',
      'How much does the sandwich cost?',
      'What operation do we need to use?',
    ],
  },
};

export const ShoppingScenario: Story = {
  args: {
    scenario:
      'Themba goes to the spaza shop with R50. He buys 3 cool drinks at R8.50 each. How much money does he have left?',
    culturalContext: 'Township spaza shop scenario familiar to South African learners',
    vocabulary: ['spaza shop', 'cool drink', 'total cost', 'change'],
    comprehensionPrompts: [
      'What is Themba buying?',
      'How many drinks is he buying?',
      'What steps do we need to solve this?',
    ],
  },
};

export const TaxiProblem: Story = {
  args: {
    scenario:
      'A taxi can carry 15 passengers. If 8 people get off at the rank, how many seats are now available?',
    culturalContext: 'South African minibus taxi context',
    vocabulary: ['taxi', 'passengers', 'rank', 'capacity', 'available'],
    comprehensionPrompts: [
      'How many passengers can the taxi hold in total?',
      'How many people got off?',
      'Are we adding or subtracting?',
    ],
  },
};

export const FarmingContext: Story = {
  args: {
    scenario:
      'Farmer Ndlovu has 24 sheep. He divides them equally into 3 camps. How many sheep are in each camp?',
    culturalContext: 'Rural farming context',
    vocabulary: ['divide', 'equally', 'camps', 'share'],
    comprehensionPrompts: [
      'What is the total number of sheep?',
      'How many groups are we dividing into?',
      'What does "equally" mean in this problem?',
    ],
  },
};

export const SportScenario: Story = {
  args: {
    scenario:
      'A soccer team needs to buy new jerseys. Each jersey costs R85. If they need 11 jerseys, how much will it cost in total?',
    culturalContext: 'Soccer (football) is widely popular in South Africa',
    vocabulary: ['jersey', 'cost', 'total', 'multiply'],
    comprehensionPrompts: [
      'How much does one jersey cost?',
      'How many jerseys do they need?',
      'What operation helps us find the total cost?',
    ],
  },
};

export const MinimalInformation: Story = {
  args: {
    scenario: 'A learner has 15 marbles and gives away 7. How many marbles remain?',
    vocabulary: ['marbles', 'gives away', 'remain'],
  },
};

export const WithImage: Story = {
  args: {
    scenario:
      'Look at the fruit stand. Bananas cost R12 per bunch and apples cost R3 each. If you buy 2 bunches of bananas and 5 apples, how much will you spend?',
    culturalContext: 'Local fruit vendor scenario',
    vocabulary: ['bunch', 'each', 'total cost', 'multiply', 'add'],
    comprehensionPrompts: [
      'What are the two items being bought?',
      'How do we calculate the cost of bananas?',
      'How do we calculate the cost of apples?',
      'What do we do with both amounts?',
    ],
    imageUrl: 'https://placehold.co/600x400/orange/white?text=Fruit+Stand',
  },
};
