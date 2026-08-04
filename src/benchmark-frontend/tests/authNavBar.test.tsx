import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../src/context/AuthContext';
import { FavouritesProvider } from '../src/context/FavouritesContext';
import { ComparisonProvider } from '../src/context/ComparisonContext';
import NavBar from '../src/components/NavBar';

const SEED_USER = {
  id: 'u1',
  email: 'seed@example.com',
  username: 'seed_user',
  createdAt: '2024-01-01T00:00:00.000Z',
};

function seedLoggedIn() {
  localStorage.setItem('auth_token', 'seed.jwt.token');
  localStorage.setItem('auth_user', JSON.stringify(SEED_USER));
}

function renderNavBar() {
  return render(
    <FavouritesProvider>
      <ComparisonProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<NavBar />} />
              <Route path="/login" element={<div data-testid="login-page">Login</div>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ComparisonProvider>
    </FavouritesProvider>,
  );
}

describe('NavBar — auth state', () => {
  it('shows Sign Up and Log In links when logged out', () => {
    renderNavBar();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /log out/i })).not.toBeInTheDocument();
  });

  it('shows the username and a Log Out button when logged in', () => {
    seedLoggedIn();
    renderNavBar();

    expect(screen.getByText(/seed_user/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /log in/i })).not.toBeInTheDocument();
  });

  it('logging out clears localStorage and redirects to /login', async () => {
    const user = userEvent.setup();
    seedLoggedIn();
    renderNavBar();

    await user.click(screen.getByRole('button', { name: /log out/i }));

    expect(await screen.findByTestId('login-page')).toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});
