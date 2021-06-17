import { createRouter as _createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import ViewHome from './views/Home.vue';
import ViewAbout from './views/About.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: ViewHome,
  },
  {
    path: '/about',
    name: 'About',
    component: ViewAbout,
  },
];

export function createRouter({ isServer }) {
  return _createRouter({
    history: isServer
      ? createMemoryHistory()
      : createWebHistory(),
    routes,
  })
};
