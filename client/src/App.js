import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001');

// ── Helpers ──────────────────────────────────────────
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function initials(name) {
  return name ? name.slice(0, 2).toUpperCase() : '??';
}

// ── Main App ─────────────────────────────────────────
export default function App() {
  const [myName, setMyName]       = useState('');
  const [joined, setJoined]       = useState(false);
  const [nameInput, setNameInput] = useState('');

  const [messages, setMessages]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [typing, setTyping]       = useState('');
  const [text, setText]           = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName]           = useState('');

  const [editingId, setEditingId]   = useState(null);
  const [editText, setEditText]     = useState('');

  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);
  const isTyping    = useRef(false);

  // Socket listeners
  useEffect(() => {
    socket.on('messages', setMessages);
    socket.on('users', setUsers);
    socket.on('typing', ({ name, isTyping: t }) => {
      setTyping(t ? `${name} is typing...` : '');
    });
    socket.on('person_invited', ({ name, by }) => {
      alert(`"${by}" invited "${name}" to join. Ask them to open this page and enter their name!`);
    });
    return () => {
      socket.off('messages');
      socket.off('users');
      socket.off('typing');
      socket.off('person_invited');
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join
  const handleJoin = () => {
    const name = nameInput.trim();
    if (!name) return;
    setMyName(name);
    socket.emit('set_name', name);
    setJoined(true);
  };

  // Send
  const handleSend = () => {
    if (!text.trim()) return;
    socket.emit('send_message', text.trim());
    setText('');
    clearTimeout(typingTimer.current);
    isTyping.current = false;
    socket.emit('typing', false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  // Typing signal
  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit('typing', true);
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTyping.current = false;
      socket.emit('typing', false);
    }, 1500);
  };

  // Delete
  const handleDelete = (msgId) => {
    if (window.confirm('Delete this message?')) {
      socket.emit('delete_message', msgId);
    }
  };

  // Edit save
  const handleEditSave = (msgId) => {
    if (!editText.trim()) return;
    socket.emit('edit_message', { messageId: msgId, newText: editText.trim() });
    setEditingId(null);
    setEditText('');
  };

  // Add person
  const handleAddPerson = () => {
    if (!addName.trim()) return;
    socket.emit('add_person', addName.trim());
    setAddName('');
    setShowAddModal(false);
  };

  // ── Join Screen ──
  if (!joined) {
    return (
      <div className="join-screen">
        <h2>💬 Chat App</h2>
        <p>Enter your name to join the chat</p>
        <input
          type="text"
          placeholder="Your name..."
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          maxLength={24}
          autoFocus
        />
        <button onClick={handleJoin} disabled={!nameInput.trim()}>
          Join Chat
        </button>
      </div>
    );
  }

  const mySocketId = socket.id;

  // ── Chat UI ──
  return (
    <div className="chat-layout">

      {/* ── Sidebar ── */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>People</h3>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            + Add
          </button>
        </div>

        <div className="sidebar-section-title">Online ({users.length})</div>

        <div className="user-list">
          {users.length === 0 && <div className="no-users">No one here yet</div>}
          {users.map((u) => (
            <div className="user-item" key={u.id}>
              <div className="avatar">{initials(u.name)}</div>
              <div>
                <div className="user-name">{u.name}</div>
                {u.id === mySocketId && <div className="user-you">You</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div className="chat-area">
        <div className="chat-header">
          General Chat
          <span>{users.length} {users.length === 1 ? 'person' : 'people'} online</span>
        </div>

        <div className="messages-area">
          {messages.map((msg) => {
            if (msg.type === 'system') {
              return <div className="sys-msg" key={msg.id}>{msg.text}</div>;
            }

            const isOwn = msg.senderId === mySocketId;

            return (
              <div className={`msg-wrapper ${isOwn ? 'own' : 'other'}`} key={msg.id}>
                {!isOwn && <div className="msg-sender">{msg.senderName}</div>}

                <div className="msg-bubble">
                  {editingId === msg.id ? (
                    <div className="edit-form">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave(msg.id);
                          if (e.key === 'Escape') { setEditingId(null); setEditText(''); }
                        }}
                        autoFocus
                      />
                      <button className="edit-save"   onClick={() => handleEditSave(msg.id)}>Save</button>
                      <button className="edit-cancel" onClick={() => { setEditingId(null); setEditText(''); }}>Cancel</button>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>

                <div className="msg-meta">
                  {msg.edited && <span className="edited-tag">edited</span>}
                  {formatTime(msg.timestamp)}
                </div>

                {/* Edit / Delete — only for own messages */}
                {isOwn && editingId !== msg.id && (
                  <div className="msg-actions">
                    <button onClick={() => { setEditingId(msg.id); setEditText(msg.text); }}>Edit</button>
                    <button className="del-btn" onClick={() => handleDelete(msg.id)}>Delete</button>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="typing-indicator">{typing}</div>

        <div className="input-bar">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKey}
          />
          <button className="send-btn" onClick={handleSend} disabled={!text.trim()}>
            Send
          </button>
        </div>
      </div>

      {/* ── Add Person Modal ── */}
      {showAddModal && (
        <div className="add-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="add-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Person</h3>
            <p>Enter their name. They'll need to open the app and use the same name to join.</p>
            <input
              type="text"
              placeholder="Person's name..."
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
              maxLength={24}
              autoFocus
            />
            <div className="modal-btns">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-add" onClick={handleAddPerson} disabled={!addName.trim()}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
