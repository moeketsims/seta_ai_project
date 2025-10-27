import React from 'react';
import { render, screen } from '@testing-library/react';
import { NumberLine } from '@/components/mathematics/NumberLine';

describe('NumberLine', () => {
  it('renders a number line with correct range', () => {
    render(<NumberLine min={0} max={10} />);

    const numberLine = screen.getByRole('img', { name: /number line from 0 to 10/i });
    expect(numberLine).toBeInTheDocument();
  });

  it('displays tick marks for values in range', () => {
    render(<NumberLine min={0} max={5} step={1} />);

    // Should show numbers 0 through 5
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays a label when provided', () => {
    render(
      <NumberLine
        min={0}
        max={10}
        label="Count to 10"
      />
    );

    expect(screen.getByText('Count to 10')).toBeInTheDocument();
  });

  it('highlights a specific value when provided', () => {
    render(
      <NumberLine
        min={0}
        max={10}
        highlightValue={7}
      />
    );

    // Check for the highlighted value label
    const highlightedLabel = screen.getByLabelText(/highlighted value: 7/i);
    expect(highlightedLabel).toBeInTheDocument();
  });

  it('marks multiple values when markedValues is provided', () => {
    const { container } = render(
      <NumberLine
        min={0}
        max={10}
        markedValues={[3, 6, 9]}
      />
    );

    // Check that marked values are present
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('handles negative numbers correctly', () => {
    render(<NumberLine min={-5} max={5} step={1} />);

    expect(screen.getByText('-5')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('respects custom step value', () => {
    render(<NumberLine min={0} max={10} step={2} />);

    // Should show 0, 2, 4, 6, 8, 10
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    // Should NOT show odd numbers
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('handles decimal steps correctly', () => {
    render(<NumberLine min={0} max={1} step={0.25} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0.25')).toBeInTheDocument();
    expect(screen.getByText('0.5')).toBeInTheDocument();
    expect(screen.getByText('0.75')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
