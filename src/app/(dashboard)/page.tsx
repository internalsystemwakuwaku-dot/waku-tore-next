'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    setMounted(true);
    setStatus('Mounted successfully!');
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-2">Mounted: {mounted ? 'Yes' : 'No'}</p>
      <p className="mb-4">Status: {status}</p>
      <p className="text-muted-foreground">
        If you can see this, the dashboard page is rendering correctly.
      </p>
    </div>
  );
}
