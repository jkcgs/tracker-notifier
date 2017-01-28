(function() {
'use strict';

    angular
        .module('app')
        .service('Service', Service);

    Service.inject = ['$http'];
    function Service($http) {
        this.addCode = addCode;
        this.changeSPC = changeSPC;
        this.delCode = delCode;
        this.getCodes = getCodes;
        this.getProviders = getProviders;
        this.getSession = getSession;
        
        ////////////////
        function addCode(code, provider) {
            return $http.post('/addcode', {code: code, provider: provider});
        }

        function changeSPC(code) {
            return $http.post('/user/setspcode', {code: code}).then(function(res) { return res.data; });
        }

        function delCode(code) {
            return $http.post('/delcode', {code: code});
        }

        function getCodes() {
            return $http.get('/codes').then(function(res) { return res.data; });
        }

        function getProviders() {
            return $http.get('/providers').then(function(res) { return res.data; });
        }

        function getSession() {
            return $http.get('/session').then(function(res) { return res.data; });
        }
    }
})();