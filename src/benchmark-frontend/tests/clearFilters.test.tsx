import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Clear filters', () => {
  it('clears search filter — returns to 15 products', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.type(screen.getByRole('textbox', { name: /search/i }), 'mouse');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 1 products');
    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
  });

  it('clears category filter — returns to 15 products', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /category/i }), 'Electronics');
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 5 products');
    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
  });

  it('clears in-stock filter — returns to 15 products', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.click(screen.getByRole('checkbox', { name: /in-stock only/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 11 products');
    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
  });

  it('clears combined filters — search + category + in-stock reset to 15 products', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /category/i }), 'Electronics');
    await userEvent.click(screen.getByRole('checkbox', { name: /in-stock only/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 3 products');
    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 15 products');
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('Yoga Mat')).toBeInTheDocument();
  });

  it('clears category filter — category select resets to All', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /category/i }), 'Fitness');
    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(screen.getByRole('combobox', { name: /category/i })).toHaveValue('All');
  });

  it('clears in-stock filter — checkbox is unchecked after clear', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    await userEvent.click(screen.getByRole('checkbox', { name: /in-stock only/i }));
    expect(screen.getByRole('checkbox', { name: /in-stock only/i })).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(screen.getByRole('checkbox', { name: /in-stock only/i })).not.toBeChecked();
  });
});
