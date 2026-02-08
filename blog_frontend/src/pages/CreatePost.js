import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import { addDemoPost } from "../demoPosts";

export default function CreatePost() {
  const nav = useNavigate();
  const { isAuthed } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (!isAuthed) {
        // Demo post stored in sessionStorage (survives refresh, clears on tab close)
        const demo = addDemoPost({ title, content, images });
        nav(`/posts/${demo.id}`);
        return;
      }

      //  Real post saved in Django (requires JWT)
      const form = new FormData();
      form.append("title", title);
      form.append("content", content);

      for (const file of images) {
        form.append("images", file);
      }

      const res = await api.post("posts/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      nav(`/posts/${res.data.id}`);
    } catch (err) {
      setError(
        err.response?.data ? JSON.stringify(err.response.data) : String(err)
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>
        Create Post{" "}
        {!isAuthed && (
          <span className="muted">(Demo mode: not saved)</span>
        )}
      </h2>

      <form className="form" onSubmit={handleSubmit}>
        <input
          className="input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          className="input"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          required
        />

        <input
          className="input"
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages(Array.from(e.target.files || []))}
        />

        {error && (
          <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>
            {error}
          </pre>
        )}

        <button className="btn" disabled={submitting}>
          {submitting ? "Posting..." : isAuthed ? "Publish" : "Create Demo Post"}
        </button>
      </form>
    </div>
  );
}
