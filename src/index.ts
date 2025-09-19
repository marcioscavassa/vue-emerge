import Emerge from './component/Emerge.vue';

export { Emerge };

const plugin = {
  install(app: any) {
    app.component('Emerge', Emerge);
  },
};

export default plugin;
