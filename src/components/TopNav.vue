<template>
  <nav class="top-nav">
    <div class="top-nav-inner">
      <router-link to="/" class="top-nav-logo">启程英语</router-link>
      <div class="top-nav-links">
        <router-link to="/" class="top-nav-link">首页</router-link>
        <router-link to="/map" class="top-nav-link">闯关地图</router-link>
        <router-link to="/progress" class="top-nav-link">学习进度</router-link>
        <router-link to="/profile" class="top-nav-link">个人中心</router-link>
      </div>
      <div class="top-nav-user">
        <router-link to="/profile" class="badge-chip">{{ auth.nickname }}</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
</script>
