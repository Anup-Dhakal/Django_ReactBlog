const KEY = "demo_posts_v1";
const TAB_KEY = "demo_tab_id_v1";

// Ensures demo posts are tied to THIS tab session.
// Refresh keeps window.name; new tab normally doesn't.
function ensureTabSession() {
  // window.name survives refresh in same tab
  if (!window.name) window.name = `tab-${Date.now()}-${Math.random()}`;

  const savedTabId = sessionStorage.getItem(TAB_KEY);

  // If this is a new tab session, clear demo posts
  if (!savedTabId || savedTabId !== window.name) {
    sessionStorage.setItem(TAB_KEY, window.name);
    sessionStorage.removeItem(KEY);
  }
}

export function getDemoPosts() {
  ensureTabSession();
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveDemoPosts(posts) {
  ensureTabSession();
  sessionStorage.setItem(KEY, JSON.stringify(posts));
}

export function addDemoPost({ title, content, images }) {
  ensureTabSession();
  const posts = getDemoPosts();
  const id = `demo-${Date.now()}`;
  const created_at = new Date().toISOString();

  const demoImages = (images || []).map((file, idx) => ({
    id: `${id}-img-${idx}`,
    image: URL.createObjectURL(file), // blob URL valid in this browser session
  }));

  const newPost = { id, title, content, created_at, images: demoImages };
  saveDemoPosts([newPost, ...posts]);
  return newPost;
}

export function getDemoPostById(id) {
  ensureTabSession();
  return getDemoPosts().find((p) => p.id === id) || null;
}

export function updateDemoPost(id, updates) {
  ensureTabSession();
  const posts = getDemoPosts();
  const i = posts.findIndex((p) => p.id === id);
  if (i === -1) return null;
  posts[i] = { ...posts[i], ...updates };
  saveDemoPosts(posts);
  return posts[i];
}

export function deleteDemoPost(id) {
  ensureTabSession();
  const posts = getDemoPosts().filter((p) => p.id !== id);
  saveDemoPosts(posts);
}
