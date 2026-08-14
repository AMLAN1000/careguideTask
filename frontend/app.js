const API_BASE_URL = 'http://localhost:5555/api/v1';

// Global Session State
let token = localStorage.getItem('token') || '';
let currentUser = null;

// Page States
let currentTab = 'notes';
let notesPage = 1;
let postsPage = 1;
let usersPage = 1;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    currentUser = parseJwt(token);
    if (currentUser) {
      showDashboard();
    } else {
      handleLogout();
    }
  } else {
    showAuth();
  }
});

// --- HELPER FUNCTIONS ---
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

function showLoader(show) {
  const loader = document.getElementById('loading');
  if (show) {
    loader.classList.remove('hidden');
  } else {
    loader.classList.add('hidden');
  }
}

// Request wrapper with auth headers
async function apiRequest(endpoint, options = {}) {
  showLoader(true);
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Something went wrong');
    }
    
    return result;
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  } finally {
    showLoader(false);
  }
}

// --- VIEW CONTROLLERS ---
function showAuth() {
  document.getElementById('auth-view').classList.remove('hidden');
  document.getElementById('dashboard-view').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('auth-view').classList.add('hidden');
  document.getElementById('dashboard-view').classList.remove('hidden');
  
  // Set user profile display
  const userDisplay = document.getElementById('user-display');
  userDisplay.innerHTML = `${currentUser.email} <span class="author-tag">${currentUser.role}</span>`;
  
  // Conditionally show/hide Admin Sidebar navigation links
  const adminLinks = document.querySelectorAll('.admin-only');
  if (currentUser.role === 'ADMIN') {
    adminLinks.forEach(el => el.classList.remove('hidden'));
  } else {
    adminLinks.forEach(el => el.classList.add('hidden'));
    if (currentTab === 'admin') {
      switchTab('notes');
    }
  }

  // Load initial tab data
  switchTab(currentTab);
}

function switchAuthTab(type) {
  const loginTab = document.getElementById('tab-login-btn');
  const registerTab = document.getElementById('tab-register-btn');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (type === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  } else {
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  }
}

function switchTab(tabId) {
  currentTab = tabId;
  
  // Update sidebar active status
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    if (btn.id === `nav-${tabId}`) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Toggle tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => {
    if (content.id === `tab-${tabId}`) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });

  // Load corresponding tab data
  if (tabId === 'notes') {
    loadNotes(notesPage);
  } else if (tabId === 'posts') {
    loadPosts(postsPage);
  } else if (tabId === 'interests') {
    loadGroupedInterests();
  } else if (tabId === 'admin') {
    loadUsers(usersPage);
  }
}

// --- AUTHENTICATION FLOWS ---
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    token = result.data.accessToken;
    localStorage.setItem('token', token);
    currentUser = parseJwt(token);
    
    showToast('Logged in successfully!');
    showDashboard();
    
    // Clear form inputs
    document.getElementById('login-form').reset();
  } catch (err) {
    console.error(err);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;
  const interestsRaw = document.getElementById('reg-interests').value;

  const interests = interestsRaw
    ? interestsRaw.split(',').map(i => i.trim()).filter(Boolean)
    : [];

  try {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role, interests })
    });

    showToast('Registration successful! Please login.');
    switchAuthTab('login');
    document.getElementById('register-form').reset();
  } catch (err) {
    console.error(err);
  }
}

function handleLogout() {
  token = '';
  currentUser = null;
  localStorage.removeItem('token');
  showToast('Logged out successfully.');
  showAuth();
}

// --- NOTES OPERATIONS ---
async function loadNotes(page = 1) {
  notesPage = page;
  try {
    const result = await apiRequest(`/notes?page=${page}&limit=6`);
    const notes = result.data || [];
    const meta = result.meta || { page: 1, limit: 6, total: 0 };
    
    const notesGrid = document.getElementById('notes-grid');
    notesGrid.innerHTML = '';

    if (notes.length === 0) {
      notesGrid.innerHTML = `<p class="no-results">No notes found. Create your first note!</p>`;
      document.getElementById('notes-pagination').innerHTML = '';
      return;
    }

    notes.forEach(note => {
      const card = document.createElement('div');
      card.className = 'card note-card';
      
      const isOwner = note.userId && (note.userId._id === currentUser.id || note.userId === currentUser.id);
      
      let noteFooter = '';
      // Only show Edit/Delete buttons if user is the note owner
      if (isOwner) {
        noteFooter = `
          <div class="note-footer">
            <button onclick="openNoteModal('edit', '${note._id}', '${escapeHtml(note.title)}', '${escapeHtml(note.content)}')" class="btn btn-secondary btn-sm">Edit</button>
            <button onclick="handleDeleteNote('${note._id}')" class="btn btn-danger btn-sm">Delete</button>
          </div>
        `;
      }

      const authorText = note.userId && note.userId.email ? note.userId.email : 'Unknown';

      card.innerHTML = `
        <h3>${escapeHtml(note.title)}</h3>
        <div class="note-meta">
          Created: ${new Date(note.createdAt).toLocaleDateString()}
          ${currentUser.role === 'ADMIN' ? `<span class="author-tag">By: ${authorText}</span>` : ''}
        </div>
        <p class="note-body">${escapeHtml(note.content)}</p>
        ${noteFooter}
      `;
      notesGrid.appendChild(card);
    });

    renderPagination('notes-pagination', meta, loadNotes);
  } catch (err) {
    console.error(err);
  }
}

function openNoteModal(mode, id = '', title = '', content = '') {
  document.getElementById('note-modal').classList.remove('hidden');
  document.getElementById('note-modal-title').innerText = mode === 'create' ? 'Create Note' : 'Edit Note';
  document.getElementById('note-modal-id').value = id;
  document.getElementById('note-title').value = title;
  document.getElementById('note-text').value = content;
}

function closeNoteModal() {
  document.getElementById('note-modal').classList.add('hidden');
  document.getElementById('note-form').reset();
}

async function handleSaveNote(event) {
  event.preventDefault();
  const id = document.getElementById('note-modal-id').value;
  const title = document.getElementById('note-title').value;
  const content = document.getElementById('note-text').value;

  const method = id ? 'PUT' : 'POST';
  const endpoint = id ? `/notes/${id}` : '/notes';

  try {
    await apiRequest(endpoint, {
      method,
      body: JSON.stringify({ title, content })
    });

    showToast(id ? 'Note updated successfully!' : 'Note created successfully!');
    closeNoteModal();
    loadNotes(notesPage);
  } catch (err) {
    console.error(err);
  }
}

async function handleDeleteNote(id) {
  if (!confirm('Are you sure you want to delete this note?')) return;
  try {
    await apiRequest(`/notes/${id}`, { method: 'DELETE' });
    showToast('Note deleted successfully!');
    loadNotes(notesPage);
  } catch (err) {
    console.error(err);
  }
}

// --- PUBLIC POSTS OPERATIONS ---
async function loadPosts(page = 1) {
  postsPage = page;
  try {
    const result = await apiRequest(`/posts?page=${page}&limit=6`);
    const posts = result.data || [];
    const meta = result.meta || { page: 1, limit: 6, total: 0 };
    
    const postsGrid = document.getElementById('posts-grid');
    postsGrid.innerHTML = '';

    populateContributorDropdown(posts);

    if (posts.length === 0) {
      postsGrid.innerHTML = `<p class="no-results">No public posts found. Write a post to start!</p>`;
      document.getElementById('posts-pagination').innerHTML = '';
      return;
    }

    posts.forEach(post => {
      const card = document.createElement('div');
      card.className = 'card post-card';
      
      const authorText = post.userId && post.userId.email ? post.userId.email : 'Unknown';

      card.innerHTML = `
        <h4>${escapeHtml(post.title)}</h4>
        <p class="post-body">${escapeHtml(post.content)}</p>
        <div class="post-meta">
          <span>Author: ${escapeHtml(authorText)}</span>
          <span>${new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      `;
      postsGrid.appendChild(card);
    });

    renderPagination('posts-pagination', meta, loadPosts);
  } catch (err) {
    console.error(err);
  }
}

function populateContributorDropdown(posts) {
  console.log("populating dropdown with posts:", posts);
  console.log("currentUser logged in:", currentUser);
  
  const select = document.getElementById('search-user-id');
  if (!select) return;

  const currentValue = select.value;
  select.innerHTML = '<option value="">-- Select a Contributor --</option>';

  const seenUsers = new Set();

  // 1. Add current user checking both id and _id keys
  if (currentUser) {
    const currentUserId = currentUser.id || currentUser._id || currentUser.userId;
    if (currentUserId) {
      seenUsers.add(currentUserId);
      const option = document.createElement('option');
      option.value = currentUserId;
      option.innerText = `${currentUser.email || 'You'} (${currentUser.role || 'USER'}) [You]`;
      select.appendChild(option);
    }
  }

  // 2. Add other users found in loaded posts
  if (Array.isArray(posts)) {
    posts.forEach(post => {
      // Check all possible places userId could be nested (or string id)
      const authorId = post.userId && (post.userId._id || post.userId.id || (typeof post.userId === 'string' ? post.userId : null));
      const authorEmail = post.userId && post.userId.email;
      const authorRole = post.userId && (post.userId.role || 'USER');

      if (authorId && !seenUsers.has(authorId)) {
        seenUsers.add(authorId);
        const option = document.createElement('option');
        option.value = authorId;
        option.innerText = `${authorEmail || 'User (' + authorId.substring(0, 5) + ')'} (${authorRole})`;
        select.appendChild(option);
      }
    });
  }

  // 3. For Admins, fetch all registered users in the database to populate the complete list
  if (currentUser && currentUser.role === 'ADMIN') {
    apiRequest('/users?limit=100').then(res => {
      const users = res.data || [];
      users.forEach(user => {
        const userId = user._id || user.id;
        if (userId && !seenUsers.has(userId)) {
          seenUsers.add(userId);
          const option = document.createElement('option');
          option.value = userId;
          option.innerText = `${user.email} (${user.role})`;
          select.appendChild(option);
        }
      });
      // Restore selection
      if (currentValue && seenUsers.has(currentValue)) {
        select.value = currentValue;
      }
    }).catch(err => console.error("Could not load users for dropdown:", err));
  }

  // Restore selection
  if (currentValue && seenUsers.has(currentValue)) {
    select.value = currentValue;
  }
}

function openPostModal() {
  document.getElementById('post-modal').classList.remove('hidden');
}

function closePostModal() {
  document.getElementById('post-modal').classList.add('hidden');
  document.getElementById('post-form').reset();
}

async function handleSavePost(event) {
  event.preventDefault();
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-text').value;

  try {
    await apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content })
    });

    showToast('Public post created successfully!');
    closePostModal();
    loadPosts(postsPage);
  } catch (err) {
    console.error(err);
  }
}

// Contributor Feed Filter ($lookup Aggregation Scenario)
async function handleUserPostsLookup() {
  const userId = document.getElementById('search-user-id').value;
  const resultsDiv = document.getElementById('lookup-results');
  if (!resultsDiv) return;
  
  if (!userId) {
    resultsDiv.innerHTML = '<p class="no-results">Select a contributor from the list above to view their activity stream.</p>';
    return;
  }

  try {
    const result = await apiRequest(`/users/${userId}/posts`);
    const userData = result.data;
    
    if (!userData) {
      resultsDiv.innerHTML = '<p class="no-results">Contributor profile not found.</p>';
      return;
    }

    const posts = userData.posts || [];
    let postsHtml = '';

    if (posts.length === 0) {
      postsHtml = '<p class="no-results">This contributor has not published any posts yet.</p>';
    } else {
      postsHtml = posts.map(post => `
        <div class="lookup-post-item" style="background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem;">
          <h5 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-primary);">${escapeHtml(post.title)}</h5>
          <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">${escapeHtml(post.content)}</p>
        </div>
      `).join('');
    }

    const interestsList = (userData.interests && userData.interests.length > 0)
      ? userData.interests.map(i => `<span class="interest-pill" style="margin: 0; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); font-size: 0.75rem; padding: 0.15rem 0.45rem; border-radius: 4px;">${escapeHtml(i)}</span>`).join(' ')
      : '<span class="no-results" style="font-size: 0.75rem; font-style: normal;">No listed interests</span>';

    resultsDiv.innerHTML = `
      <div class="profile-card" style="display: flex; align-items: center; gap: 1.25rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; margin-top: 1rem;">
        <div class="profile-avatar" style="font-size: 1.8rem; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
          👤
        </div>
        <div class="profile-details" style="flex-grow: 1;">
          <h4 style="font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 0.25rem;">${escapeHtml(userData.email)}</h4>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem;">
            <span class="author-tag" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); margin: 0; padding: 0.15rem 0.45rem; font-size: 0.7rem; border-radius: 4px;">${userData.role}</span>
            ${interestsList}
          </div>
        </div>
      </div>
      
      <h4 style="font-size: 0.95rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.75rem; padding-bottom: 0.25rem; border-bottom: 1px solid var(--border-color);">Contributor Stream</h4>
      <div class="lookup-posts">
        ${postsHtml}
      </div>
    `;
  } catch (err) {
    resultsDiv.innerHTML = '<p class="no-results" style="color: var(--danger-color);">Error fetching contributor feed. Please try again.</p>';
    console.error(err);
  }
}

// --- SCENARIO 1: GROUP BY INTERESTS ---
async function loadGroupedInterests() {
  try {
    const result = await apiRequest('/users/by-interests');
    const grouped = result.data || [];
    
    const interestsList = document.getElementById('interests-list');
    interestsList.innerHTML = '';

    if (grouped.length === 0) {
      interestsList.innerHTML = `<p class="no-results">No grouped interests found. Seed interests in User registration!</p>`;
      return;
    }

    grouped.forEach(group => {
      const card = document.createElement('div');
      card.className = 'card interest-group';
      
      const usersHtml = group.users.map(u => `
        <div class="interest-user-badge">
          <span>${escapeHtml(u.email)}</span>
          <span class="interest-user-id">ID: ${u._id}</span>
        </div>
      `).join('');

      card.innerHTML = `
        <div class="interest-tag-title">🎯 ${escapeHtml(group._id)}</div>
        <div class="interest-users">
          ${usersHtml}
        </div>
      `;
      interestsList.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

// --- ADMIN USERS CRUD OPERATIONS ---
async function loadUsers(page = 1) {
  usersPage = page;
  try {
    const result = await apiRequest(`/users?page=${page}&limit=8`);
    const users = result.data || [];
    const meta = result.meta || { page: 1, limit: 8, total: 0 };
    
    const tableBody = document.getElementById('users-table-body');
    tableBody.innerHTML = '';

    users.forEach(user => {
      const tr = document.createElement('tr');
      
      const interestsHtml = user.interests
        .map(i => `<span class="interest-pill">${escapeHtml(i)}</span>`)
        .join('');

      tr.innerHTML = `
        <td class="td-id">${user._id}</td>
        <td>${escapeHtml(user.email)}</td>
        <td><span class="author-tag">${user.role}</span></td>
        <td>${interestsHtml || '<span class="no-results">None</span>'}</td>
        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        <td>
          <button onclick="openUserModal('edit', '${user._id}', '${escapeHtml(user.email)}', '${escapeHtml(user.role)}', '${escapeHtml(user.interests.join(', '))}')" class="btn btn-secondary btn-sm">Edit</button>
          ${user._id !== currentUser.id ? `<button onclick="handleDeleteUser('${user._id}')" class="btn btn-danger btn-sm">Delete</button>` : ''}
        </td>
      `;
      tableBody.appendChild(tr);
    });

    renderPagination('users-pagination', meta, loadUsers);
  } catch (err) {
    console.error(err);
  }
}

function openUserModal(mode, id = '', email = '', role = 'USER', interests = '') {
  document.getElementById('user-modal').classList.remove('hidden');
  document.getElementById('user-modal-title').innerText = mode === 'create' ? 'Add User' : 'Edit User';
  document.getElementById('user-modal-id').value = id;
  document.getElementById('user-email').value = email;
  document.getElementById('user-role').value = role;
  document.getElementById('user-interests').value = interests;

  const passwordGroup = document.getElementById('user-password-group');
  if (mode === 'create') {
    passwordGroup.classList.remove('hidden');
    document.getElementById('user-password').required = true;
  } else {
    passwordGroup.classList.add('hidden');
    document.getElementById('user-password').required = false;
  }
}

function closeUserModal() {
  document.getElementById('user-modal').classList.add('hidden');
  document.getElementById('user-form').reset();
}

async function handleSaveUser(event) {
  event.preventDefault();
  const id = document.getElementById('user-modal-id').value;
  const email = document.getElementById('user-email').value;
  const role = document.getElementById('user-role').value;
  const interestsRaw = document.getElementById('user-interests').value;
  const password = document.getElementById('user-password').value;

  const interests = interestsRaw
    ? interestsRaw.split(',').map(i => i.trim()).filter(Boolean)
    : [];

  const method = id ? 'PUT' : 'POST';
  const endpoint = id ? `/users/${id}` : '/users';

  const body = {
    email,
    role,
    interests,
    ...(password && { password })
  };

  try {
    await apiRequest(endpoint, {
      method,
      body: JSON.stringify(body)
    });

    showToast(id ? 'User updated successfully!' : 'User created successfully!');
    closeUserModal();
    loadUsers(usersPage);
  } catch (err) {
    console.error(err);
  }
}

async function handleDeleteUser(id) {
  if (!confirm('Are you sure you want to delete this user? All their notes and posts will remain, but the account is removed. Proceed?')) return;
  try {
    await apiRequest(`/users/${id}`, { method: 'DELETE' });
    showToast('User deleted successfully!');
    loadUsers(usersPage);
  } catch (err) {
    console.error(err);
  }
}

// --- PAGINATION RENDERING HELPER ---
function renderPagination(containerId, meta, loadFunction) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  const totalPages = Math.ceil(meta.total / meta.limit);
  if (totalPages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn btn-secondary btn-sm';
  prevBtn.innerText = 'Prev';
  prevBtn.disabled = meta.page === 1;
  prevBtn.onclick = () => loadFunction(meta.page - 1);

  const pageInfo = document.createElement('span');
  pageInfo.className = 'page-info';
  pageInfo.innerText = `Page ${meta.page} of ${totalPages}`;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-secondary btn-sm';
  nextBtn.innerText = 'Next';
  nextBtn.disabled = meta.page === totalPages;
  nextBtn.onclick = () => loadFunction(meta.page + 1);

  container.appendChild(prevBtn);
  container.appendChild(pageInfo);
  container.appendChild(nextBtn);
}

// --- HTML ESCAPE HELPER ---
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
