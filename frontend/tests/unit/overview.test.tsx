import { render, screen } from '@testing-library/react';
import OverviewPage from '../../src/app/page';

describe('OverviewPage', () => {
  it('renders diagnostic heading', () => {
    render(<OverviewPage />);
    expect(screen.getByText('Weekly Diagnostic Pulse')).toBeInTheDocument();
  });
});
