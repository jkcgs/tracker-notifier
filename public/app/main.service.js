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
        this.getSession = getSession;
        
        ////////////////
        function addCode(code) {
            return $http.post('/addcode', {code: code});
        }

        function changeSPC(code) {
            return $http.post('/user/setspcode', {code: code}).then((res) => { return res.data; });
        }

        function delCode(code) {
            return $http.post('/delcode', {code: code});
        }

        function getCodes() {
            return $http.get('/codes').then((res) => { return res.data; });
        }

        function getSession() {
            return $http.get('/session').then((res) => { return res.data; });
        }
    }
})();