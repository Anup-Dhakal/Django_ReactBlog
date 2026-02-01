import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import { getDemoPostById, deleteDemoPost } from "../demoPosts";

import { FaEdit, FaTrash } from "react-icons/fa";

export default function PostDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAuthed } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendBase = `http://${window.location.hostname}:8000`;
  const isDemo = String(id).startsWith("demo-");

  useEffect(() => {
    (async () => {
      setLoading(true);

      try {
        if (isDemo) {
          const demo = getDemoPostById(id);
          setPost(demo);
        } else {
          const res = await api.get(`posts/${id}/`);
          setPost(res.data);
        }
      } catch (e) {
        console.error(e);
        setPost(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isDemo]);

  async function handleDelete() {
    const ok = window.confirm("Delete this post? This cannot be undone.");
    if (!ok) return;

    try {
      if (isDemo) {
        deleteDemoPost(id);
        nav("/");
        return;
      }

      await api.delete(`posts/${id}/`);
      nav("/");
    } catch (e) {
      console.error(e);
      alert("Failed to delete post. (Login required for real posts)");
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <div className="detail">
      <div className="detail-header">
        <div>
          <h2 style={{ margin: 0 }}>
            {post.title}{" "}
            {isDemo && <span className="muted" style={{ fontSize: 12 }}>(Demo)</span>}
          </h2>
          <div className="muted">
            {post.created_at ? new Date(post.created_at).toLocaleString() : ""}
          </div>
        </div>

        <div className="icon-actions">
          {(isDemo || isAuthed) && (
            <Link className="icon-btn" to={`/posts/${id}/edit`} title="Edit">
              <FaEdit size={18} />
            </Link>
          )}

          {(isDemo || isAuthed) && (
            <button className="icon-btn delete" onClick={handleDelete} title="Delete">
              <FaTrash size={18} />
            </button>
          )}
        </div>
      </div>

      <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{post.content}</p>

      <div>
        <h3 style={{ marginBottom: 10 }}>Photos</h3>

        {!post.images || post.images.length === 0 ? (
          <p>No images.</p>
        ) : (
          <div className="gallery">
            {post.images.map((img) => {
              const src =
                img.image?.startsWith("http") || img.image?.startsWith("blob:")
                  ? img.image
                  : backendBase + img.image;
              return <img key={img.id} src={src} alt="" />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
