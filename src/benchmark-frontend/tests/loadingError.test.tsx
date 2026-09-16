import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

describe('Loading and error states', () => {
  it('shows a loading spinner before products load', async () => {
    render(<App />);
    expect(screen.getByLabelText('loading')).toBeInTheDocument();
    await screen.findByTestId('results-count');
    expect(screen.queryByLabelText('loading')).not.toBeInTheDocument();
  });

  it('displays an error message when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error'))
    );
    render(<App />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Network error');
  });
});
