import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Filtering behavior', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
  });

  it('search term matching one product narrows count and shows product', async () => {
    await user.type(screen.getByLabelText('Search'), 'keyboard');
    expect(screen.getByTestId('results-count').textContent).toBe('Showing 1 products (page 1 of 1)');
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
  });

  it('search matching is case-insensitive', async () => {
    await user.type(screen.getByLabelText('Search'), 'KEYBOARD');
    expect(screen.getByTestId('results-count').textContent).toBe('Showing 1 products (page 1 of 1)');
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
  });

  it('selecting Electronics category narrows to 5 products', async () => {
    await user.selectOptions(screen.getByLabelText('Category'), 'Electronics');
    expect(screen.getByTestId('results-count').textContent).toBe('Showing 5 products (page 1 of 1)');
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('USB-C Hub')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Webcam HD')).toBeInTheDocument();
    expect(screen.getByText('Noise-Cancelling Headphones')).toBeInTheDocument();
  });

  it('in-stock only checkbox narrows to 11 products', async () => {
    await user.click(screen.getByLabelText('In-stock only'));
    expect(screen.getByTestId('results-count').textContent).toBe('Showing 11 products (page 1 of 1)');
    expect(screen.queryByText('USB-C Hub')).not.toBeInTheDocument();
    expect(screen.queryByText('Noise-Cancelling Headphones')).not.toBeInTheDocument();
    expect(screen.queryByText('Dumbbell Set')).not.toBeInTheDocument();
    expect(screen.queryByText('Desk Lamp')).not.toBeInTheDocument();
  });

  it('combining Electronics and in-stock narrows to 3 products', async () => {
    await user.selectOptions(screen.getByLabelText('Category'), 'Electronics');
    await user.click(screen.getByLabelText('In-stock only'));
    expect(screen.getByTestId('results-count').textContent).toBe('Showing 3 products (page 1 of 1)');
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Webcam HD')).toBeInTheDocument();
    expect(screen.queryByText('USB-C Hub')).not.toBeInTheDocument();
    expect(screen.queryByText('Noise-Cancelling Headphones')).not.toBeInTheDocument();
  });

  it('search matching no products shows zero count and status message', async () => {
    await user.type(screen.getByLabelText('Search'), 'zzznomatch');
    expect(screen.getByTestId('results-count').textContent).toBe('Showing 0 products (page 1 of 1)');
    expect(screen.getByRole('status').textContent).toBe('No products found.');
  });
});
