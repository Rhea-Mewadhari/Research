import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AuthProvider } from '../src/context/AuthContext';
import ProfilePage from '../src/pages/ProfilePage';

const SEED_USER = {
  id: 'u1',
  email: 'seed@example.com',
  username: 'seed_user',
  createdAt: '2024-01-01T00:00:00.000Z',
};

function seedLoggedIn(overrides: Partial<typeof SEED_USER> = {}) {
  const user = { ...SEED_USER, ...overrides };
  localStorage.setItem('auth_token', 'seed.jwt.token');
  localStorage.setItem('auth_user', JSON.stringify(user));
  return user;
}

function renderProfilePage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

async function openEditForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /edit profile/i }));
}

describe('ProfilePage — view', () => {
  it('displays the current username, email, and member-since date', () => {
    seedLoggedIn();
    renderProfilePage();

    expect(screen.getByText(/seed_user/i)).toBeInTheDocument();
    expect(screen.getByText(/seed@example\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it('pre-fills the edit form with the current username and email', async () => {
    const user = userEvent.setup();
    seedLoggedIn();
    renderProfilePage();

    await openEditForm(user);

    expect(screen.getByLabelText(/^username$/i)).toHaveValue('seed_user');
    expect(screen.getByLabelText(/^email$/i)).toHaveValue('seed@example.com');
  });
});

describe('ProfilePage — save only what changed', () => {
  it('sends only the changed field in the PATCH body', async () => {
    const user = userEvent.setup();
    seedLoggedIn();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        user: { ...SEED_USER, username: 'renamed_user' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderProfilePage();

    await openEditForm(user);
    const usernameInput = screen.getByLabelText(/^username$/i);
    await user.clear(usernameInput);
    await user.type(usernameInput, 'renamed_user');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await screen.findByText(/renamed_user/i);

    const patchCall = fetchMock.mock.calls.find(
      ([, init]) => init?.method === 'PATCH',
    );
    expect(patchCall).toBeDefined();
    const body = JSON.parse(patchCall![1].body as string);
    expect(body).toEqual({ username: 'renamed_user' });
  });

  it('does not issue a request when nothing has changed', async () => {
    const user = userEvent.setup();
    seedLoggedIn();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderProfilePage();

    await openEditForm(user);
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('cancel discards changes and restores the pre-edit values, without sending a request', async () => {
    const user = userEvent.setup();
    seedLoggedIn();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderProfilePage();

    await openEditForm(user);
    const usernameInput = screen.getByLabelText(/^username$/i);
    await user.clear(usernameInput);
    await user.type(usernameInput, 'a_discarded_name');
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(/seed_user/i)).toBeInTheDocument();
    expect(screen.queryByText(/a_discarded_name/i)).not.toBeInTheDocument();
  });
});

describe('ProfilePage — success and error handling', () => {
  it('on success, updates the displayed user and localStorage, and dismisses the edit form', async () => {
    const user = userEvent.setup();
    seedLoggedIn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          user: { ...SEED_USER, email: 'new-email@example.com' },
        }),
      }),
    );
    renderProfilePage();

    await openEditForm(user);
    const emailInput = screen.getByLabelText(/^email$/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'new-email@example.com');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await screen.findByText(/new-email@example\.com/i);
    expect(screen.queryByLabelText(/^email$/i)).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('auth_user') ?? '{}')).toMatchObject({
      email: 'new-email@example.com',
    });
  });

  it('on a 409 conflict, shows the server error message inline', async () => {
    const user = userEvent.setup();
    seedLoggedIn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ error: 'Email already registered' }),
      }),
    );
    renderProfilePage();

    await openEditForm(user);
    const emailInput = screen.getByLabelText(/^email$/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'taken@example.com');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument();
  });

  it('on a 400 incorrect current password, shows the error below the current password field', async () => {
    const user = userEvent.setup();
    seedLoggedIn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Current password is incorrect' }),
      }),
    );
    renderProfilePage();

    await openEditForm(user);
    await user.click(screen.getByRole('button', { name: /change password/i }));
    await user.type(screen.getByLabelText(/current password/i), 'wrong-current-password');
    await user.type(screen.getByLabelText(/^new password$/i), 'brandnewpassword1');
    await user.type(screen.getByLabelText(/confirm new password/i), 'brandnewpassword1');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(await screen.findByText(/current password is incorrect/i)).toBeInTheDocument();
  });
});
