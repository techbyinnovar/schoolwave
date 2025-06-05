"use client";

import Link from 'next/link';
import { useEffect } from 'react';

export default function UnauthorizedPage() {
  useEffect(() => {
    // Optional: You could add a timer to redirect to home or login after a few seconds
    // const timer = setTimeout(() => {
    //   window.location.href = '/'; // or '/login'
    // }, 5000);
    // return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '50px' }}>
      <h1>Access Denied</h1>
      <p>You do not have the necessary permissions to view this page.</p>
      <p>
        If you believe this is an error, please contact an administrator.
      </p>
      <div style={{ marginTop: '30px' }}>
        <Link href="/" style={{ textDecoration: 'none', padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', borderRadius: '5px', marginRight: '10px' }}>
          Go to Homepage
        </Link>
        <Link href="/login" style={{ textDecoration: 'none', padding: '10px 20px', backgroundColor: '#f3f3f3', color: 'black', borderRadius: '5px', border: '1px solid #ccc' }}>
          Login
        </Link>
      </div>
    </div>
  );
}
