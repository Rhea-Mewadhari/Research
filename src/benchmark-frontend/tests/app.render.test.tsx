import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App rendering', () => {
  it('shows results-count with 15 products after load', async () => {
    render(<App />);
    const resultsCount = await screen.findByTestId('results-count');
    expect(resultsCount).toHaveTextContent('Showing 15 products (page 1 of 1)');
  });

  it('renders all 15 product names after load', async () => {
    render(<App />);
    await screen.findByTestId('results-count');
    const names = [
      'Wireless Mouse', 'USB-C Hub', 'Mechanical Keyboard', 'Webcam HD',
      'Noise-Cancelling Headphones', 'Yoga Mat', 'Resistance Bands', 'Foam Roller',
      'Dumbbell Set', 'Jump Rope', 'Laptop Stand', 'Desk Lamp',
      'Cable Organiser', 'Monitor Riser', 'Ergonomic Wrist Rest',
    ];
    for (const name of names) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });
});
