import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AuthProvider } from '../../../benchmark-frontend/src/context/AuthContext';
import { FavouritesProvider } from '../../../benchmark-frontend/src/context/FavouritesContext';
import { ComparisonProvider } from '../../../benchmark-frontend/src/context/ComparisonContext';
import NavBar from '../../../benchmark-frontend/src/components/NavBar';
import SignupPage from '../../../benchmark-frontend/src/pages/SignupPage';
import LoginPage from '../../../benchmark-frontend/src/pages/LoginPage';

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

function renderSignupPage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<div data-testid="home-page">Home</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

function renderLoginPage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div data-testid="home-page">Home</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('Hidden: auth foundation — password field hardening', () => {
  it('the signup password and confirm-password inputs use type="password"', () => {
    renderSignupPage();
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'password');
  });

  it('the login password input uses type="password"', () => {
    renderLoginPage();
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password');
  });

  it('never persists the submitted plaintext password anywhere in localStorage', async () => {
    const user = userEvent.setup();
    const SUBMITTED_PASSWORD = 'a-very-specific-plaintext-1';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          user: {
            id: 'u9',
            email: 'no-leak@example.com',
            username: 'no_leak_user',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          token: 'signed.jwt.token',
        }),
      }),
    );
    renderSignupPage();

    await user.type(screen.getByLabelText(/^email$/i), 'no-leak@example.com');
    await user.type(screen.getByLabelText(/^username$/i), 'no_leak_user');
    await user.type(screen.getByLabelText(/^password$/i), SUBMITTED_PASSWORD);
    await user.type(screen.getByLabelText(/confirm password/i), SUBMITTED_PASSWORD);
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await screen.findByTestId('home-page');

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      expect(localStorage.getItem(key)).not.toContain(SUBMITTED_PASSWORD);
    }
  });
});

describe('Hidden: auth foundation — session hydration robustness', () => {
  it('a fresh mount picks up an existing session from localStorage (survives a reload)', () => {
    seedLoggedIn();
    renderNavBar();
    expect(screen.getByText(/seed_user/i)).toBeInTheDocument();
  });

  it('does not crash when auth_user in localStorage is malformed JSON', () => {
    localStorage.setItem('auth_token', 'some.jwt.token');
    localStorage.setItem('auth_user', '{not valid json');
    expect(() => renderNavBar()).not.toThrow();
  });

  it('a fresh mount after logout does not resurrect the session from localStorage', async () => {
    const user = userEvent.setup();
    seedLoggedIn();
    renderNavBar();

    await user.click(screen.getByRole('button', { name: /log out/i }));
    await screen.findByTestId('login-page');

    // Re-mount an entirely new provider tree — if logout only cleared React
    // state and left localStorage behind, this would resurrect the session.
    renderNavBar();
    expect(screen.queryByRole('button', { name: /log out/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
  });
});
