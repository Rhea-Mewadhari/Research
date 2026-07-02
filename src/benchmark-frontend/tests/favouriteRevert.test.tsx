import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Favourites — happy path', () => {
  it('clicking the favourite button marks a product as a favourite', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    const [btn] = screen.getAllByRole('button', { name: /add to favourites/i });
    await user.click(btn);

    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('clicking a favourited button removes the favourite', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    const [btn] = screen.getAllByRole('button', { name: /add to favourites/i });
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');

    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('a favourited product appears on the favourites page', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    // Favourite the first product (Wireless Mouse, id=1)
    const [btn] = screen.getAllByRole('button', { name: /add to favourites/i });
    await user.click(btn);

    // Navigate to /favourites
    await user.click(screen.getByRole('link', { name: /favourites/i }));

    expect(screen.getByTestId('results-count')).toHaveTextContent('1 favourite(s)');
  });

  it('removing a favourite removes it from the favourites page', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId('results-count');

    const [btn] = screen.getAllByRole('button', { name: /add to favourites/i });
    await user.click(btn);

    await user.click(screen.getByRole('link', { name: /favourites/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent('1 favourite(s)');

    // Remove favourite from the favourites page
    await user.click(screen.getByRole('button', { name: /remove from favourites/i }));

    expect(screen.getByRole('status')).toHaveTextContent(/no favourites yet/i);
  });
});
