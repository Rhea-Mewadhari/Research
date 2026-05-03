import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../benchmark-frontend/src/App';

describe('Hidden: console cleanliness', () => {
  it('does not produce console errors during render and interaction', async () => {
    const user = userEvent.setup();

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<App />);

    await user.type(screen.getByLabelText(/search/i), 'mouse');
    await user.selectOptions(screen.getByLabelText(/category/i), 'Electronics');
    await user.click(screen.getByLabelText(/in-stock only/i));
    await user.selectOptions(screen.getByLabelText(/sort by/i), 'price-asc');
    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });
});