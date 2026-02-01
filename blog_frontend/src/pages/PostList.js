import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { getDemoPosts } from "../demoPosts";

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendBase = `http://${window.location.hostname}:8000`;

  async function load() {
    setLoading(true);
    const res = await api.get("posts/");
    const real = res.data || [];

    const demo = getDemoPosts();

    // Merge and sort by created_at desc
    const merged = [...demo, ...real].sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return tb - ta;
    });

    setPosts(merged);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // refresh list if demo posts change in this tab
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Latest Posts</h2>

      {posts.length === 0 ? (
        <p>No posts yet</p>
      ) : (
        <div className="grid">
          {posts.map((p) => {
            const firstImg = p.images?.[0]?.image;
            const imgSrc = firstImg
              ? firstImg.startsWith("http") || firstImg.startsWith("blob:")
                ? firstImg
                : backendBase + firstImg
              : null;

            const isDemo = String(p.id).startsWith("demo-");

            return (
              <div className="card" key={p.id}>
                {imgSrc ? (
                  <img className="card-img" src={imgSrc} alt="" />
                ) : (
                  <div className="card-img" />
                )}

                <div className="card-body">
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Link className="card-title" to={`/posts/${p.id}`}>
                      {p.title}
                    </Link>
                    {isDemo && (
                      <span className="muted" style={{ fontSize: 12 }}>
                        Demo
                      </span>
                    )}
                  </div>

                  <p className="card-text">
                    {p.content.length > 120
                      ? p.content.slice(0, 120) + "..."
                      : p.content}
                  </p>

                  <div className="muted">
                    {new Date(p.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
