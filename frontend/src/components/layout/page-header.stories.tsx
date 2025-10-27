import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../ui/button';
import { PageHeader } from './page-header';

const meta: Meta<typeof PageHeader> = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  args: {
    title: 'Teacher Workspace',
    description: 'Coordinate interventions and monitor class-level health metrics.'
  }
};

export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    action: <Button size="sm">Schedule support</Button>
  }
};
