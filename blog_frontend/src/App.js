import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import PostList from "./pages/PostList";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./styles.css";

import { useAuth } from "./auth/AuthContext";

export default function App() {
  const { isAuthed, logout } = useAuth();

  return (
    <div>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">BlogSpace <sub className = "brandsub" >By Anup</sub> </Link>

          <nav className="nav-left">
            <Link to="/" className="nav-link">Posts</Link>
            <Link to="/create" className="nav-link">Create</Link>
          </nav>

          <nav className="nav-right">
            {isAuthed ? (
              <button className="nav-btn" onClick={logout}>
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/signup" className="nav-btn">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<PostList />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/posts/:id/edit" element={<EditPost />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
    </div>
  );
}
