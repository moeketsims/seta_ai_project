import React from 'react';
import { render, screen } from '@testing-library/react';
import { VisualFractionBar } from '@/components/mathematics/VisualFractionBar';

describe('VisualFractionBar', () => {
  it('renders a fraction bar with correct segments', () => {
    render(<VisualFractionBar numerator={3} denominator={4} />);

    // Check aria-label for accessibility
    const fractionBar = screen.getByRole('img', { name: /visual representation of 3\/4/i });
    expect(fractionBar).toBeInTheDocument();
  });

  it('displays fraction values when showValues is true', () => {
    render(<VisualFractionBar numerator={2} denominator={5} showValues={true} />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('hides fraction values when showValues is false', () => {
    const { container } = render(
      <VisualFractionBar numerator={2} denominator={5} showValues={false} />
    );

    // Values should not be in the document
    const valueDisplay = container.querySelector('.min-w-\\[60px\\]');
    expect(valueDisplay).not.toBeInTheDocument();
  });

  it('displays a label when provided', () => {
    render(
      <VisualFractionBar
        numerator={1}
        denominator={2}
        label="One Half"
      />
    );

    expect(screen.getByText('One Half')).toBeInTheDocument();
  });

  it('renders correct number of segments based on denominator', () => {
    const { container } = render(
      <VisualFractionBar numerator={2} denominator={6} />
    );

    // Should have 6 segments (divs with border)
    const segments = container.querySelectorAll('.flex-1.border-2');
    expect(segments).toHaveLength(6);
  });

  it('handles improper fractions correctly', () => {
    render(<VisualFractionBar numerator={7} denominator={4} showValues={true} />);

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('applies custom color when provided', () => {
    const { container } = render(
      <VisualFractionBar
        numerator={2}
        denominator={4}
        color="bg-secondary"
      />
    );

    // Check if segments have the custom color class
    const filledSegments = container.querySelectorAll('.bg-secondary');
    expect(filledSegments.length).toBeGreaterThan(0);
  });

  it('renders zero numerator correctly', () => {
    const { container } = render(
      <VisualFractionBar numerator={0} denominator={5} showValues={true} />
    );

    expect(screen.getByText('0')).toBeInTheDocument();

    // All segments should be unfilled
    const unfilledSegments = container.querySelectorAll('.bg-gray-100');
    expect(unfilledSegments).toHaveLength(5);
  });
});
