import { createBrowserRouter, RouterProvider, Link, Outlet } from 'react-router-dom';
import Clipgen from './pages/Clipgen';
import Home from './pages/Home'

// 1. Create a Layout component to keep UI elements (like a Navbar) persistent across pages
function Layout() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: '15px', padding: '10px', background: '#eee' }}>
        {/* Always use the <Link> component instead of <a href> to avoid refreshing the browser */}
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <main>
        {/* <Outlet> dynamically renders whichever child route is currently active */}
        <Outlet />
      </main>
    </div>
  );
}

// 2. Define the routing paths and associate them with your page components
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/clipgen',
        element: <Clipgen />,
      },

    ],
  },
]);

// 3. Render the application using the RouterProvider
export default function App() {
  return <RouterProvider router={router} />;
}
