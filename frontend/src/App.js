import React, { useState } from 'react';
import PiInit from './PiInit';
import PiPay from './PiPay';
import './App.css'; // Create a CSS file for styles

const App = () => {
  const [user, setUser] = useState(null);

  const signInWithPi = async () => {
    if (window.Pi) {
      window.Pi.authenticate(
        ['username'],
        (auth) => setUser(auth.user),
        (err) => alert(`Auth failed: ${err}`)
      );
    } else {
      alert('Pi SDK not loaded.');
    }
  };

  return (
    <div className="app-container">
      <PiInit />
      <h1>Palace of Quests Metaverse on Pi</h1>
      {!user ? (
        <button onClick={signInWithPi}>Sign in with Pi Network</button>
      ) : (
        <div className="welcome-section">
          <div>Welcome, <b>{user.username}</b>!</div>
          <PiPay username={user.username} />
        </div>
      )}
    </div>
  );
};

export default App;
