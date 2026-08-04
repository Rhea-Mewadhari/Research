import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../src/context/AuthContext';
import ProtectedRoute from '../src/components/ProtectedRoute';

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

function renderGuardedRoute() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Protected</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when the user is not authenticated', async () => {
    renderGuardedRoute();
    expect(await screen.findByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders the wrapped content when the user is authenticated', () => {
    seedLoggedIn();
    renderGuardedRoute();
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});
