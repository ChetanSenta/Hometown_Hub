import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="page-main" style={{ marginTop: 'var(--nav-h)' }}>
        <Outlet />
      </main>
    </>
  );
}
