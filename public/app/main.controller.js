(function() {
'use strict';

    angular
        .module('app')
        .controller('MainController', MainController);

    MainController.inject = ['Service'];
    function MainController(Service) {
        var vm = this;
        vm.loading = true;
        vm.comm = false;
        vm.user = '';
        vm.spcode = '';
        vm.origspcode = '';
        vm.codes = [];
        vm.newCode = '';

        vm.addCode = addCode;
        vm.changeSPC = changeSPC;
        vm.delCode = delCode;
        
        activate();

        ////////////////

        function activate() {
            Service.getSession().then((session) => {
                vm.user = session.username;
                vm.spcode = session.spcode;
                vm.origspcode = session.spcode;
            });

            Service.getCodes().then((codes) => {
                vm.codes = codes;
                vm.loading = false;
            });
        }

        function addCode() {
            if(!vm.newCode || vm.comm) {
                return;
            }

            vm.comm = true;
            Service.addCode(vm.newCode).then((res) => {
                vm.comm = false;
                vm.newCode = '';
                vm.codes.push(res.data);
                $('#add-code').modal('hide');
            }, (err) => {
                vm.comm = false;
                $('#add-code').modal('hide');
            });
        }

        function changeSPC() {
            if(!vm.spcode || vm.comm) {
                return;
            }

            vm.comm = true;
            Service.changeSPC(vm.spcode).then((res) => {
                vm.comm = false;
                vm.origspcode = vm.spcode;
            }, (err) => {
                alert('No se pudo cambiar el código');
                vm.spcode = vm.origspcode;
                vm.comm = false;
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