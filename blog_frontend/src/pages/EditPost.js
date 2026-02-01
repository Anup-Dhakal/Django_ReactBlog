import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import { getDemoPostById, updateDemoPost } from "../demoPosts";

export default function EditPost() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAuthed } = useAuth();

  const isDemo = String(id).startsWith("demo-");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); // append new images
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (isDemo) {
          const demo = getDemoPostById(id);
          if (!demo) throw new Error("Not found");
          setTitle(demo.title || "");
          setContent(demo.content || "");
        } else {
          const res = await api.get(`posts/${id}/`);
          setTitle(res.data.title || "");
          setContent(res.data.content || "");
        }
      } catch (e) {
        setError("Failed to load post.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isDemo]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (isDemo) {
        const newImgs = (images || []).map((file, idx) => ({
          id: `${id}-newimg-${Date.now()}-${idx}`,
          image: URL.createObjectURL(file),
        }));

        updateDemoPost(id, {
          title,
          content,
          images: [...(getDemoPostById(id)?.images || []), ...newImgs],
        });

        nav(`/posts/${id}`);
        return;
      }

      if (!isAuthed) {
        setError("Login required to edit real posts.");
        return;
      }

      const form = new FormData();
      form.append("title", title);
      form.append("content", content);
      for (const file of images) form.append("images", file);

      await api.patch(`posts/${id}/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      nav(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : String(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>
        Edit Post {isDemo && <span className="muted">(Demo)</span>}
      </h2>

      <form className="form" onSubmit={handleSave}>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />

        <textarea
          className="input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          rows={8}
          required
        />

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>
            Optional: add more images
          </div>
          <input
            className="input"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files || []))}
          />
        </div>

        {error && (
          <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>
        )}

        <button className="btn" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
