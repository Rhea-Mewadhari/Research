import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Loading and error states', () => {
  it('shows spinner and no results-count when fetch never resolves', () => {
    vi.mocked(fetch).mockImplementationOnce(() => new Promise(() => {}));
    render(<App />);
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
    expect(screen.queryByTestId('results-count')).toBeNull();
  });

  it('shows error alert and no spinner when fetch rejects', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
    render(<App />);
    await screen.findByRole('alert');
    expect(screen.queryByText('Loading…')).toBeNull();
  });
});
