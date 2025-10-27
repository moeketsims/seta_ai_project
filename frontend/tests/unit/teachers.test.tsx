import { render, screen } from '@testing-library/react';
import TeachersPage from '../../src/app/teachers/page';

describe('TeachersPage', () => {
  it('renders intervention queue heading', () => {
    render(<TeachersPage />);
    expect(screen.getByText('Intervention Queue')).toBeInTheDocument();
  });
});
