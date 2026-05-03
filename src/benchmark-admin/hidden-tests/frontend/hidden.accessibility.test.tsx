import { render, screen } from '@testing-library/react';
import App from '../../../benchmark-frontend/src/App.js';

describe('Hidden: accessibility and labeling', () => {
  it('controls remain accessible by label text', () => {
    render(<App />);

    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/in-stock only/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
  });
});