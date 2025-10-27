import { render, screen } from '@testing-library/react';
import LearnersPage from '../../src/app/learners/page';

describe('LearnersPage', () => {
  it('shows personalised pathways section', () => {
    render(<LearnersPage />);
    expect(screen.getByText('Personalised Pathways')).toBeInTheDocument();
  });
});
