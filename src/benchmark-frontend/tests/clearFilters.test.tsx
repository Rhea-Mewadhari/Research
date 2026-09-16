import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Clear filters', () => {
  it('clear after search resets count to 15 and empties search input', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.type(screen.getByRole('textbox', { name: /search/i }), 'Yoga');
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products (page 1 of 1)');
    expect(screen.getByRole('textbox', { name: /search/i })).toHaveValue('');
  });

  it('clear after category selection resets to All and shows 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByRole('combobox', { name: /category/i }), 'Fitness');
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByRole('combobox', { name: /category/i })).toHaveValue('All');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products (page 1 of 1)');
  });

  it('clear after checking in-stock unchecks checkbox and shows 15 products', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.click(screen.getByRole('checkbox', { name: /in-stock only/i }));
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByRole('checkbox', { name: /in-stock only/i })).not.toBeChecked();
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products (page 1 of 1)');
  });

  it('clear after sort resets to default and Wireless Mouse is first', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('results-count');
    await user.selectOptions(screen.getByRole('combobox', { name: /sort by/i }), 'price-asc');
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByRole('combobox', { name: /sort by/i })).toHaveValue('default');
    expect(screen.getAllByRole('heading', { level: 3 })[0]).toHaveTextContent('Wireless Mouse');
  });
});
