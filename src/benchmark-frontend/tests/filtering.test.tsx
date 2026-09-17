import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Filtering behavior', () => {
  it('filters products by search term', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText('Search'), 'keyboard');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
  });

  it('search is case-insensitive', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText('Search'), 'YOGA');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
  });

  it('shows no products when search matches nothing', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.type(screen.getByLabelText('Search'), 'zzznomatch');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 0 products');
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });

  it('filters products by Electronics category', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Category'), 'Electronics');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
    expect(screen.queryByText('Yoga Mat')).not.toBeInTheDocument();
  });

  it('filters products by Fitness category', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Category'), 'Fitness');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
    expect(screen.getByText('Jump Rope')).toBeInTheDocument();
    expect(screen.queryByText('Wireless Mouse')).not.toBeInTheDocument();
  });

  it('filters products by Accessories category', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Category'), 'Accessories');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
    expect(screen.getByText('Laptop Stand')).toBeInTheDocument();
    expect(screen.getByText('Monitor Riser')).toBeInTheDocument();
    expect(screen.queryByText('Yoga Mat')).not.toBeInTheDocument();
  });

  it('filters to in-stock products only', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.click(screen.getByLabelText('In-stock only'));

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 11 products');
  });

  it('excludes out-of-stock products when in-stock filter is active', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.click(screen.getByLabelText('In-stock only'));

    expect(screen.queryByText('USB-C Hub')).not.toBeInTheDocument();
    expect(screen.queryByText('Noise-Cancelling Headphones')).not.toBeInTheDocument();
    expect(screen.queryByText('Dumbbell Set')).not.toBeInTheDocument();
    expect(screen.queryByText('Desk Lamp')).not.toBeInTheDocument();
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
  });

  it('combines category and in-stock filters', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Category'), 'Fitness');
    await user.click(screen.getByLabelText('In-stock only'));

    // Fitness has 5 products; Dumbbell Set is out of stock → 4 remain
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 4 products');
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
    expect(screen.queryByText('Dumbbell Set')).not.toBeInTheDocument();
  });

  it('combines search and category filters', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');

    await user.selectOptions(screen.getByLabelText('Category'), 'Electronics');
    await user.type(screen.getByLabelText('Search'), 'mouse');

    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.queryByText('Webcam HD')).not.toBeInTheDocument();
  });
});
