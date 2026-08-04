import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AuthProvider } from '../../../benchmark-frontend/src/context/AuthContext';
import { FavouritesProvider } from '../../../benchmark-frontend/src/context/FavouritesContext';
import { ComparisonProvider } from '../../../benchmark-frontend/src/context/ComparisonContext';
import ProtectedRoute from '../../../benchmark-frontend/src/components/ProtectedRoute';
import ProfilePage from '../../../benchmark-frontend/src/pages/ProfilePage';
import NavBar from '../../../benchmark-frontend/src/components/NavBar';

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

async function openEditForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /edit profile/i }));
}

describe('Hidden: ProtectedRoute is generic, not profile-specific', () => {
  function renderTwoGuardedRoutes(initialPath: string) {
    return render(
      <AuthProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-profile">Profile</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-settings">Settings</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
  }

  it('guards a second, unrelated route the same way it guards /profile', async () => {
    renderTwoGuardedRoutes('/settings');
    expect(await screen.findByTestId('login-page')).toBeInTheDocument();
  });

  it('renders the second route through when authenticated', () => {
    seedLoggedIn();
    renderTwoGuardedRoutes('/settings');
    expect(screen.getByTestId('protected-settings')).toBeInTheDocument();
  });
});

describe('Hidden: ProfilePage — change password section', () => {
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

  it('the change-password fields are collapsed until the section is expanded', async () => {
    seedLoggedIn();
    renderProfilePage();

    await openEditForm(userEvent.setup());
    expect(screen.queryByLabelText(/^new password$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/confirm new password/i)).not.toBeInTheDocument();
  });

  it('rejects a new password shorter than 8 characters client-side, without a request', async () => {
    const user = userEvent.setup();
    seedLoggedIn();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderProfilePage();

    await openEditForm(user);
    await user.click(screen.getByRole('button', { name: /change password/i }));
    await user.type(screen.getByLabelText(/current password/i), 'correctcurrentpw1');
    await user.type(screen.getByLabelText(/^new password$/i), 'short1');
    await user.type(screen.getByLabelText(/confirm new password/i), 'short1');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(await screen.findByText(/(password must be at least 8|at least 8 characters)/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('catches a new-password/confirm mismatch client-side, without a request', async () => {
    const user = userEvent.setup();
    seedLoggedIn();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderProfilePage();

    await openEditForm(user);
    await user.click(screen.getByRole('button', { name: /change password/i }));
    await user.type(screen.getByLabelText(/current password/i), 'correctcurrentpw1');
    await user.type(screen.getByLabelText(/^new password$/i), 'brandnewpassword1');
    await user.type(screen.getByLabelText(/confirm new password/i), 'a-different-password1');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(await screen.findByText(/passwords? (do not|don't) match/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('Hidden: ProfilePage — diffing multiple changed fields', () => {
  it('includes every changed field in the PATCH body when more than one changed', async () => {
    const user = userEvent.setup();
    seedLoggedIn();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        user: { ...SEED_USER, username: 'multi_changed_user', email: 'multi-changed@example.com' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/profile']}>
          <Routes>
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    await openEditForm(user);
    const usernameInput = screen.getByLabelText(/^username$/i);
    await user.clear(usernameInput);
    await user.type(usernameInput, 'multi_changed_user');
    const emailInput = screen.getByLabelText(/^email$/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'multi-changed@example.com');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await screen.findByText(/multi_changed_user/i);

    const patchCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH');
    expect(patchCall).toBeDefined();
    const body = JSON.parse(patchCall![1].body as string);
    expect(body).toEqual({ username: 'multi_changed_user', email: 'multi-changed@example.com' });
  });
});

describe('Hidden: profile update propagates through AuthContext, not just localStorage', () => {
  it("NavBar reflects the new username immediately after a profile update, in the same provider tree", async () => {
    const user = userEvent.setup();
    seedLoggedIn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          user: { ...SEED_USER, username: 'renamed_everywhere' },
        }),
      }),
    );

    render(
      <FavouritesProvider>
        <ComparisonProvider>
          <AuthProvider>
            <MemoryRouter initialEntries={['/profile']}>
              <NavBar />
              <Routes>
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        </ComparisonProvider>
      </FavouritesProvider>,
    );

    await openEditForm(user);
    const usernameInput = screen.getByLabelText(/^username$/i);
    await user.clear(usernameInput);
    await user.type(usernameInput, 'renamed_everywhere');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    // NavBar reads the same AuthContext — if updateUser only wrote localStorage
    // and never touched context state, NavBar would still show the old name.
    // Scoped to the nav element itself so a match in ProfilePage's own view
    // doesn't make this pass for the wrong reason.
    const nav = screen.getByRole('navigation');
    expect(await within(nav).findByText(/renamed_everywhere/i)).toBeInTheDocument();
  });
});
