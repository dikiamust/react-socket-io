import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('localhost:2200');

function App() {
  const [name, setName] = useState('');
  const [inputName, setInputName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatTo, setChatTo] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) return;
    const msgs = localStorage.getItem('messages');
    setMessages(msgs ? JSON.parse(msgs) : {});
    setName(user);
  }, []);

  useEffect(() => {
    if (!name) return;
    socket.emit('add-user', name);

    // get online users
    socket.on('receive-online-users', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.emit('remove-user', name);
      socket.off('receive-online-users');
    };
  }, [name]);

  useEffect(() => {
    if (!messages || messages === {}) return;
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    socket.on('msg-receive', ({ from, msg }) => {
      console.log('message', { from, msg });
      setMessages((prevState) => {
        let state = prevState;
        if (!state[from]) state[from] = [];
        state[from].push({ fromSelf: false, content: msg });
        return { ...state };
      });
    });

    return () => {
      socket.off('msg-receive');
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatTo || !message) return;
    socket.emit('send-msg', { to: chatTo, from: name, msg: message });
    setMessages((prevState) => {
      let state = prevState;
      if (!state[chatTo]) state[chatTo] = [];
      state[chatTo].push({ fromSelf: true, content: message });
      return { ...state };
    });
    setMessage('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setName(inputName);
    localStorage.setItem('user', inputName);
    setInputName('');
  };

  const handleLogout = () => {
    socket.emit('logout', name);
    localStorage.removeItem('user');
    localStorage.removeItem('messages');
    setName('');
    setMessages({});
    setMessage('');
    setChatTo('');
  };

  const loggedIn = name !== '';
  // const loggedIn = true;

  const displayMessages = messages[chatTo] ?? [];

  return (
    <div className="App">
      {loggedIn ? (
        <div className="chat-box">
          <div className="inbox">
            <p className="greeting">Hello, {name}</p>
            <div className="msg-box">
              {displayMessages.map((msg, idx) => (
                <div key={idx} className="msg-container">
                  <p
                    className="msg"
                    style={{
                      textAlign: msg.fromSelf ? 'right' : 'left',
                      color: msg.fromSelf ? '#34ad7e' : '#ABC9FF',
                    }}
                  >
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
            {chatTo && (
              <form className="input-container" onSubmit={handleSendMessage}>
                <input
                  value={message}
                  onChange={(e) => setMessage(e.currentTarget.value)}
                />
                <button>Send</button>
              </form>
            )}
          </div>
          <div>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
            <div className="online-users-container">
              {onlineUsers
                .filter((user) => user !== name)
                .map((user) => (
                  <div
                    key={user}
                    className={`online-user ${
                      chatTo === user ? 'chat-to' : ''
                    }`}
                    onClick={() => setChatTo(user)}
                  >
                    {user}
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <input
            className="login-input"
            placeholder="username"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
          />
          <button className="login-btn">Login</button>
        </form>
      )}
    </div>
  );
}

export default App;
