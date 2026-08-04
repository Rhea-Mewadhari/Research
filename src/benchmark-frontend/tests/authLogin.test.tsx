import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AuthProvider } from '../src/context/AuthContext';
import LoginPage from '../src/pages/LoginPage';

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

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    renderLoginPage();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('on success stores the token and user in localStorage and redirects to /', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          user: {
            id: 'u1',
            email: 'existing@example.com',
            username: 'existing_user',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          token: 'signed.jwt.token',
        }),
      }),
    );
    renderLoginPage();

    await user.type(screen.getByLabelText(/^email$/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'correctpassword1');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await screen.findByTestId('home-page');
    expect(localStorage.getItem('auth_token')).toBe('signed.jwt.token');
    expect(JSON.parse(localStorage.getItem('auth_user') ?? '{}')).toMatchObject({
      username: 'existing_user',
      email: 'existing@example.com',
    });
  });

  it('on 401 shows "Invalid email or password" and never the raw server message', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      }),
    );
    renderLoginPage();

    await user.type(screen.getByLabelText(/^email$/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(screen.queryByText(/^invalid credentials$/i)).not.toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('shows a loading state on the submit button while the request is in flight', async () => {
    const user = userEvent.setup();
    let resolveFetch!: (value: unknown) => void;
    const pending = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pending));
    renderLoginPage();

    await user.type(screen.getByLabelText(/^email$/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'correctpassword1');

    const submitBtn = screen.getByRole('button', { name: /log in/i });
    await user.click(submitBtn);

    expect(submitBtn).toBeDisabled();

    resolveFetch({
      ok: true,
      status: 200,
      json: async () => ({
        user: {
          id: 'u3',
          email: 'existing@example.com',
          username: 'existing_user',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        token: 'signed.jwt.token',
      }),
    });

    await screen.findByTestId('home-page');
  });
});
