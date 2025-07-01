const API_BASE = process.env.REACT_APP_API_BASE;

export async function getUser(username) {
  const res = await fetch(`${API_BASE}/user/${username}`);
  if (!res.ok) throw new Error('User not found');
  return await res.json();
}

export async function createPayment(username, amount, memo) {
  const res = await fetch(`${API_BASE}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, amount, memo })
  });
  if (!res.ok) throw new Error('Payment request failed');
  return await res.json();
}
