import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '../src/App';

const multiPageFetch = () =>
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: [], total: 0, page: 1, limit: 5, totalPages: 3 }),
  });

describe('Pagination controls', () => {
  it('Prev and Next are both disabled on page 1 of 1', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('Prev is disabled and Next is enabled on page 1 of 3', async () => {
    vi.stubGlobal('fetch', multiPageFetch());
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
  });

  it('Prev is enabled after clicking Next from page 1 of 3', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', multiPageFetch());
    render(<App />);
    await screen.findByTestId('results-count');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Prev' })).not.toBeDisabled()
    );
  });

  it('Next is disabled on the last page (page 3 of 3)', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', multiPageFetch());
    render(<App />);
    await screen.findByTestId('results-count');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Prev' })).not.toBeDisabled()
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    );
  });
});
