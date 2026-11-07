import { Redirect, Slot } from 'expo-router';

import { useAdminStore } from '../../state/adminStore';

/** Every /admin route requires a verified staff PIN. */
export default function AdminLayout() {
  const unlocked = useAdminStore((s) => s.unlocked);
  if (!unlocked) return <Redirect href="/staff-pin" />;
  return <Slot />;
}
