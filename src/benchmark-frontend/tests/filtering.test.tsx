import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Filtering behavior', () => {
  it('typing Yoga reduces results to 1 and shows Yoga Mat', async () => {
    render(<App />);
    const user = userEvent.setup();
    await screen.findByTestId('results-count');
    await user.type(screen.getByLabelText(/search/i), 'Yoga');
    expect(screen.getByTestId('results-count')).toHaveTextContent(/Showing 1 products/);
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
  });

  it('search is case-insensitive: yoga (lowercase) shows Yoga Mat', async () => {
    render(<App />);
    const user = userEvent.setup();
    await screen.findByTestId('results-count');
    await user.type(screen.getByLabelText(/search/i), 'yoga');
    expect(screen.getByTestId('results-count')).toHaveTextContent(/Showing 1 products/);
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
  });

  it('selecting Electronics shows 5 products', async () => {
    render(<App />);
    const user = userEvent.setup();
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByLabelText(/category/i), 'Electronics');
    expect(screen.getByTestId('results-count')).toHaveTextContent(/Showing 5 products/);
  });

  it('selecting Fitness shows 5 products', async () => {
    render(<App />);
    const user = userEvent.setup();
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByLabelText(/category/i), 'Fitness');
    expect(screen.getByTestId('results-count')).toHaveTextContent(/Showing 5 products/);
  });

  it('selecting Accessories shows 5 products', async () => {
    render(<App />);
    const user = userEvent.setup();
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByLabelText(/category/i), 'Accessories');
    expect(screen.getByTestId('results-count')).toHaveTextContent(/Showing 5 products/);
  });

  it('checking in-stock only shows 11 products', async () => {
    render(<App />);
    const user = userEvent.setup();
    await screen.findByTestId('results-count');
    await user.click(screen.getByLabelText(/in-stock only/i));
    expect(screen.getByTestId('results-count')).toHaveTextContent(/Showing 11 products/);
  });

  it('Electronics + in-stock shows 3 products', async () => {
    render(<App />);
    const user = userEvent.setup();
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByLabelText(/category/i), 'Electronics');
    await user.click(screen.getByLabelText(/in-stock only/i));
    expect(screen.getByTestId('results-count')).toHaveTextContent(/Showing 3 products/);
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Webcam HD')).toBeInTheDocument();
  });

  it('Headphones + in-stock shows 0 products and No products found status', async () => {
    render(<App />);
    const user = userEvent.setup();
    await screen.findByTestId('results-count');
    await user.type(screen.getByLabelText(/search/i), 'Headphones');
    await user.click(screen.getByLabelText(/in-stock only/i));
    expect(screen.getByTestId('results-count')).toHaveTextContent(/Showing 0 products/);
    expect(screen.getByRole('status')).toHaveTextContent('No products found.');
  });
});
