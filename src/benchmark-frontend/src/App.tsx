import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import './styles/style.css';
import ComparisonBar from './components/ComparisonBar';
import NavBar from './components/NavBar';
import { AuthProvider } from './context/AuthContext';
import { ComparisonProvider } from './context/ComparisonContext';
import { FavouritesProvider } from './context/FavouritesContext';
import { FilterProvider } from './context/FilterContext';
import { ProductProvider } from './context/ProductContext';
import ProtectedRoute from './components/ProtectedRoute';
import ComparePage from './pages/ComparePage';
import FavouritesPage from './pages/FavouritesPage';
import LoginPage from './pages/LoginPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductListPage from './pages/ProductListPage';
import ProfilePage from './pages/ProfilePage';
import SignupPage from './pages/SignupPage';

function AppLayout() {
  return (
    <>
      <NavBar />
      <Outlet />
      <ComparisonBar />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <FilterProvider>
          <FavouritesProvider>
            <ComparisonProvider>
              <BrowserRouter>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route index element={<ProductListPage />} />
                    <Route path="product/:id" element={<ProductDetailPage />} />
                    <Route path="favourites" element={<FavouritesPage />} />
                    <Route path="compare" element={<ComparePage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="signup" element={<SignupPage />} />
                    <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </ComparisonProvider>
          </FavouritesProvider>
        </FilterProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
