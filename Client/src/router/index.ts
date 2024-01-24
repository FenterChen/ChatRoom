import { createRouter, createWebHashHistory } from 'vue-router';
const routes = [
  {
    path: '/',
    name: 'Lobby',
    component: () => import('@/views/Lobby.vue'),
  },
  {
    path: '/room',
    name: 'Room',
    component: () => import('@/views/Room.vue'),
    // component: () => import('@/views/TestRoom.vue'),
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
export default router;