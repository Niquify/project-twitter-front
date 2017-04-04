(function(){
    var home = require('./components/home.vue');

    const st_home = { template: home};
    const st_dashboard = { template: '<div>dashboard</div>'};

    var routes = [
        { path: '/', component: st_home },
        { path: '/dashboard', component: st_dashboard },
    ];

    const router = new VueRouter({
       routes: routes
    });

    const app = new Vue({
        router
    }).$mount('#wt-main');

})();
