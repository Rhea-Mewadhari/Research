import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '../src/App';
import { products } from '../src/data/products';

function stubMultiPage() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [...products],
        total: products.length,
        page: 1,
        limit: products.length,
        totalPages: 2,
      }),
    })
  );
}

describe('Pagination controls', () => {
  it('Prev button is disabled on page 1', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();
  });

  it('Next button is disabled when totalPages is 1', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('Next is enabled and Prev is disabled on page 1 of multiple pages', async () => {
    stubMultiPage();
    render(<App />);
    await screen.findByTestId('results-count');
    expect(screen.getByTestId('results-count')).toHaveTextContent('page 1 of 2');
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  it('clicking Next moves to page 2 — Next disabled, Prev enabled', async () => {
    stubMultiPage();
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await screen.findByTestId('results-count');
    expect(screen.getByTestId('results-count')).toHaveTextContent('page 2 of 2');
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /prev/i })).toBeEnabled();
  });

  it('clicking Prev from page 2 returns to page 1 — Prev disabled, Next enabled', async () => {
    stubMultiPage();
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await screen.findByTestId('results-count');
    await userEvent.click(screen.getByRole('button', { name: /prev/i }));
    await screen.findByTestId('results-count');
    expect(screen.getByTestId('results-count')).toHaveTextContent('page 1 of 2');
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });
});
