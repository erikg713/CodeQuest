import React, { useState } from 'react';
import PiPay from './PiPay';
import supabase from './supabase';

function App() {
  const [user, setUser] = useState(null);

  const signInWithPi = async () => {
    if (window.Pi) {
      window.Pi.authenticate(['username'], auth => {
        setUser(auth.user);
      }, err => {
        alert('Auth failed: ' + err);
      });
    } else {
      alert('Pi SDK not loaded.');
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: 'Segoe UI,Arial,sans-serif' }}>
      <h1>Palace of Quests Metaverse on Pi</h1>
      {!user ? (
        <button onClick={signInWithPi}>Sign in with Pi Network</button>
      ) : (
        <div>
          <div>Welcome, {user.username}!</div>
          <PiPay username={user.username} />
        </div>
      )}
    </div>
  );
}

export default App;
