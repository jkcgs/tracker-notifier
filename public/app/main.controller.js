(function() {
'use strict';

    angular
        .module('app')
        .controller('MainController', MainController);

    MainController.inject = ['Service'];
    function MainController(Service) {
        var vm = this;
        vm.loading = true;
        vm.user = '';
        vm.codes = [];
        vm.newCode = '';

        vm.addCode = addCode;
        vm.delCode = delCode;
        
        activate();

        ////////////////

        function activate() {
            Service.getSession().then((session) => {
                vm.user = session.username;
            });

            Service.getCodes().then((codes) => {
                vm.codes = codes;
                vm.loading = false;
            });
        }

        function addCode() {
            if(!vm.newCode) {
                return;
            }

            Service.addCode(vm.newCode).then((res) => {
                vm.newCode = '';
                vm.codes.push(res.data);
                $('#add-code').modal('hide');
            }, (err) => {
                $('#add-code').modal('hide');
            });
        }

        function delCode(code) {
            if(!confirm('¿Realmente quieres eliminar el código ' + code + '?')) {
                return;
            }

            Service.delCode(code).then((res) => {
                if('success' in res.data && res.data.success) {
                    vm.codes = vm.codes.filter((el) => el.code !== code);
                } else {
                    alert('No se pudo eliminar el coso');
                }
            });
        }
    }
})();