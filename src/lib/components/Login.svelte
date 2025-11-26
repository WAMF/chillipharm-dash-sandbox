<script lang="ts">
  import { authStore } from '../stores/authStore';

  let email = '';
  let password = '';
  let loading = false;
  let error = '';

  async function handleLogin(e: Event) {
    e.preventDefault();
    error = '';
    loading = true;

    try {
      await authStore.signIn(email, password);
    } catch (err: any) {
      error = err.message || 'Failed to sign in';
      loading = false;
    }
  }
</script>

<div class="login-container">
  <div class="login-card">
    <div class="login-header">
      <div class="logo">🌶️</div>
      <h1>ChilliPharm Dashboard</h1>
      <p class="subtitle">Clinical Trial Video Platform</p>
    </div>

    <form on:submit={handleLogin} class="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="your.email@example.com"
          required
          disabled={loading}
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="Enter your password"
          required
          disabled={loading}
        />
      </div>

      {#if error}
        <div class="error-message">
          <span class="error-icon">⚠️</span>
          {error}
        </div>
      {/if}

      <button type="submit" class="btn btn-primary login-btn" disabled={loading}>
        {#if loading}
          <span class="spinner-small"></span>
          Signing in...
        {:else}
          Sign In
        {/if}
      </button>
    </form>

    <div class="login-footer">
      <p>Secure access to clinical trial analytics</p>
    </div>
  </div>
</div>

<style>
  .login-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, var(--chilli-red) 0%, var(--chilli-red-dark) 100%);
    padding: 2rem;
  }

  .login-card {
    background: var(--white);
    border-radius: 1rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 420px;
    padding: 3rem 2.5rem;
  }

  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .login-header h1 {
    font-size: 1.75rem;
    color: var(--neutral-900);
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: var(--neutral-500);
    font-size: 0.875rem;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-weight: 500;
    color: var(--neutral-700);
    font-size: 0.875rem;
  }

  .form-group input {
    padding: 0.75rem 1rem;
    border: 2px solid var(--neutral-200);
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s ease;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--chilli-red);
    box-shadow: 0 0 0 3px rgba(200, 16, 46, 0.1);
  }

  .form-group input:disabled {
    background-color: var(--neutral-100);
    cursor: not-allowed;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background-color: #fee2e2;
    color: #991b1b;
    border-radius: 0.5rem;
    font-size: 0.875rem;
  }

  .error-icon {
    font-size: 1.25rem;
  }

  .login-btn {
    width: 100%;
    padding: 0.875rem;
    font-size: 1rem;
    font-weight: 600;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .login-footer {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--neutral-200);
    text-align: center;
  }

  .login-footer p {
    color: var(--neutral-500);
    font-size: 0.75rem;
  }

  @media (max-width: 480px) {
    .login-card {
      padding: 2rem 1.5rem;
    }

    .login-header h1 {
      font-size: 1.5rem;
    }
  }
</style>
