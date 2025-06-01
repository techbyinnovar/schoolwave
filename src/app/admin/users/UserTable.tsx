"use client";
import { useEffect, useMemo, useState, ReactNode, FormEvent } from "react";

type User = {
  id: string;
  email: string;
  name?: string;
  role: "ADMIN" | "CONTENT_ADMIN" | "AGENT";
  createdAt: string;
};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[340px] relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >&#10005;</button>
        {children}
      </div>
    </div>
  );
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<{ email: string; name: string; password: string; role: User["role"] }>({ email: "", name: "", password: "", role: "AGENT" });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then(res => res.json())
      .then(data => setUsers(data.result?.data ?? []));
  }, []);

  // Search filter
  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const s = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(s) ||
        (u.name && u.name.toLowerCase().includes(s)) ||
        u.role.toLowerCase().includes(s)
    );
  }, [search, users]);

  // Handle create/update user
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = editId ? `/api/user` : `/api/user`;
      const payload = editId ? { ...form, id: editId } : form;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save user");
      setForm({ email: "", name: "", password: "", role: "AGENT" });
      setEditId(null);
      setModalOpen(false);
      // Refresh users
      fetch("/api/user")
        .then(res => res.json())
        .then(data => setUsers(data.result?.data ?? []));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  };

  // Handle edit
  const handleEdit = (user: User) => {
    setEditId(user.id);
    setForm({ email: user.email, name: user.name ?? "", password: "", role: user.role });
    setModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    await fetch(`/api/user`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    // Refresh users
    fetch("/api/user")
      .then(res => res.json())
      .then(data => setUsers(data.result?.data ?? []));
    setLoading(false);
  };

  // Open modal for new user
  const openCreateModal = () => {
    setEditId(null);
    setForm({ email: "", name: "", password: "", role: "AGENT" });
    setModalOpen(true);
  };

  return (
    <div className="bg-white rounded shadow p-6">
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="font-semibold text-lg text-blue-700">Users</div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border px-2 py-1 rounded w-full md:w-64"
          />
          <button onClick={openCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">+ Add User</button>
        </div>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4 text-blue-700">{editId ? "Edit User" : "Create User"}</h2>
        <form onSubmit={handleSubmit} className="mb-2 grid grid-cols-1 gap-3 items-end">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="border px-2 py-1 rounded"
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="border px-2 py-1 rounded"
          />
          <input
            type="password"
            placeholder={editId ? "New Password (optional)" : "Password"}
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className="border px-2 py-1 rounded"
            required={!editId}
          />
          <select
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: typeof e.target.value === "string" ? (e.target.value as User["role"]) : f.role }))}
            className="border px-2 py-1 rounded"
          >
            <option value="ADMIN">Admin</option>
            <option value="CONTENT_ADMIN">Content Admin</option>
            <option value="AGENT">Agent</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
            disabled={loading}
          >
            {editId ? "Update" : "Add"}
          </button>
        </form>
        {error && <div className="text-red-500 mb-2">{error}</div>}
      </Modal>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-2">Email</th>
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Role</th>
              <th className="py-2 px-2">Created</th>
              <th className="py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="py-1 px-2">{user.email}</td>
                <td className="py-1 px-2">{user.name}</td>
                <td className="py-1 px-2">{user.role}</td>
                <td className="py-1 px-2 text-xs">{new Date(user.createdAt).toLocaleString()}</td>
                <td className="py-1 px-2 flex gap-2 justify-center">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => handleEdit(user)}
                  >Edit</button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(user.id)}
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && <div className="text-gray-500 text-center py-4">No users found.</div>}
      </div>
    </div>
  );
}
