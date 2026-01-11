'use server';

import { redirect } from 'next/navigation';

export async function logout() {
  // In a UI-only mode, just redirect to a "logged out" or login page.
  // Since we auto-redirect to dashboard, this will effectively "log back in".
  return redirect('/login');
}
