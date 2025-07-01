import React, { useState } from 'react';
import PiPay from './PiPay';
import supabase from './supabase';
import PiInit from "./PiInit";
// ...rest of your imports

function App() {
  return (
    <>
      <PiInit />
      {/* rest of your app */}
    </>
  );
}
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

import React, { useState } from 'react';
import PiInit from './PiInit';
import PiPay from './PiPay';

function App() {
  const [user, setUser] = useState(null);

  const signInWithPi = () => {
    if (window.Pi) {
      window.Pi.authenticate(['username'],
        auth => setUser(auth.user),
        err => alert('Auth failed: ' + err)
      );
    } else {
      alert('Pi SDK not loaded.');
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: 'Segoe UI,Arial,sans-serif' }}>
      <PiInit />
      <h1>Palace of Quests Metaverse on Pi</h1>
      {!user ? (
        <button onClick={signInWithPi}>Sign in with Pi Network</button>
      ) : (
        <div>
          <div style={{ marginBottom: 12 }}>Welcome, <b>{user.username}</b>!</div>
          <PiPay username={user.username} />
        </div>
      )}
    </div>
  );
}

export default App;
