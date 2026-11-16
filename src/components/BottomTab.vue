<template>
  <nav class="bottom-tab">
    <div class="bottom-tab-inner">
      <router-link to="/" class="bottom-tab-item">
        <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3 3 11h2v9h5v-6h4v6h5v-9h2L12 3z" />
        </svg>
        <span>首页</span>
      </router-link>
      <router-link to="/map" class="bottom-tab-item">
        <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M9 3 3.5 5v16l5.5-2 6 2 5.5-2V3L15 5l-6-2zm0 2.2 6-2 6 2v13.6l-5.5 2-6-2-5.5 2V5.2z" />
        </svg>
        <span>地图</span>
      </router-link>
      <router-link to="/practice" class="bottom-tab-item">
        <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
        </svg>
        <span>训练</span>
      </router-link>
      <router-link to="/progress" class="bottom-tab-item">
        <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7 13h2v8H7v-8zm4-6h2v14h-2V7zm4 3h2v11h-2V10zM4 2h2v19H4V2z" />
        </svg>
        <span>进度</span>
      </router-link>
      <router-link to="/profile" class="bottom-tab-item">
        <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4.4 0-8 2.7-8 6v2h16v-2c0-3.3-3.6-6-8-6z" />
        </svg>
        <span>我的</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
</script>
