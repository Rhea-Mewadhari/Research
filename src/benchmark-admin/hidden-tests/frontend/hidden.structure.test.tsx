import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '../../../benchmark-frontend/src/App';
import { filterProducts } from '../../../benchmark-frontend/src/utils/productFilters';

vi.mock('../../../benchmark-frontend/src/utils/productFilters', async (importOriginal) => {
  const mod = await importOriginal();
  return { ...(mod as object), filterProducts: vi.fn((mod as any).filterProducts) };
});

describe('Hidden: separation of concerns', () => {
  it('delegates filtering to filterProducts utility when search changes', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText(/wireless mouse/i);
    vi.clearAllMocks();

    await user.type(screen.getByLabelText(/search/i), 'mouse');

    expect(filterProducts).toHaveBeenCalled();
  });

  it('delegates sorting to filterProducts utility when sort changes', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText(/wireless mouse/i);
    vi.clearAllMocks();

    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-asc');

    expect(filterProducts).toHaveBeenCalled();
  });

  it('delegates in-stock filtering to filterProducts utility', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText(/wireless mouse/i);
    vi.clearAllMocks();

    await user.click(screen.getByLabelText(/in-stock only/i));

    expect(filterProducts).toHaveBeenCalled();
  });
});
