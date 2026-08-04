import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AuthProvider } from '../src/context/AuthContext';
import SignupPage from '../src/pages/SignupPage';

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

async function fillValidForm(user: ReturnType<typeof userEvent.setup>, overrides: Partial<{
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}> = {}) {
  const values = {
    email: 'new-user@example.com',
    username: 'new_user',
    password: 'validpassword1',
    confirmPassword: 'validpassword1',
    ...overrides,
  };
  await user.type(screen.getByLabelText(/^email$/i), values.email);
  await user.type(screen.getByLabelText(/^username$/i), values.username);
  await user.type(screen.getByLabelText(/^password$/i), values.password);
  await user.type(screen.getByLabelText(/confirm password/i), values.confirmPassword);
}

describe('SignupPage', () => {
  it('renders email, username, password, and confirm password fields', () => {
    renderSignupPage();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('catches a confirm-password mismatch client-side and never issues a request', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderSignupPage();

    await fillValidForm(user, { confirmPassword: 'a-different-password' });
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/passwords? (do not|don't) match/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('on success stores the token and user in localStorage and redirects to /', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          user: {
            id: 'u1',
            email: 'new-user@example.com',
            username: 'new_user',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          token: 'signed.jwt.token',
        }),
      }),
    );
    renderSignupPage();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await screen.findByTestId('home-page');
    expect(localStorage.getItem('auth_token')).toBe('signed.jwt.token');
    expect(JSON.parse(localStorage.getItem('auth_user') ?? '{}')).toMatchObject({
      username: 'new_user',
      email: 'new-user@example.com',
    });
  });

  it('on a 409 conflict, shows the server error message inline and does not persist a session', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ error: 'Email already registered' }),
      }),
    );
    renderSignupPage();

    await fillValidForm(user, { email: 'taken@example.com', username: 'taken_user' });
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('on a 400 validation error, shows the field-level error message from the server', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Validation failed',
          details: [
            { field: 'username', message: 'Username may only contain letters, numbers, and underscores' },
          ],
        }),
      }),
    );
    renderSignupPage();

    // All fields satisfy the stated client-side rules — this 400 is a server-side
    // rejection the client couldn't have pre-empted.
    await fillValidForm(user, { username: 'valid_username' });
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(
      await screen.findByText(/username may only contain letters, numbers, and underscores/i),
    ).toBeInTheDocument();
  });

  it('shows a loading state on the submit button while the request is in flight', async () => {
    const user = userEvent.setup();
    let resolveFetch!: (value: unknown) => void;
    const pending = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pending));
    renderSignupPage();

    await fillValidForm(user);
    const submitBtn = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitBtn);

    expect(submitBtn).toBeDisabled();

    resolveFetch({
      ok: true,
      status: 201,
      json: async () => ({
        user: {
          id: 'u2',
          email: 'new-user@example.com',
          username: 'new_user',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        token: 'signed.jwt.token',
      }),
    });

    await screen.findByTestId('home-page');
  });
});
