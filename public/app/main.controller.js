(function() {
'use strict';

    angular
        .module('app')
        .controller('MainController', MainController);

    MainController.inject = ['$timeout', 'Service'];
    function MainController($timeout, Service) {
        var vm = this;
        vm.loading = true;
        vm.comm = false;
        vm.token = '';
        vm.user = '';
        vm.spcode = '';
        vm.origspcode = '';
        vm.codes = [];
        vm.providers = [];
        vm.newCode = '';
        vm.newCodeProvider = 'cl_correos';

        vm.addCode = addCode;
        vm.changeSPC = changeSPC;
        vm.delCode = delCode;
        vm.parseDate = parseDate;
        
        activate();

        ////////////////

        function activate() {
            Service.getSession().then((session) => {
                vm.user = session.username;
                vm.spcode = session.spcode;
                vm.origspcode = session.spcode;
                vm.token = session.token;

                socket.emit('register', {userid: session.userid, token: vm.token});
            });

            Service.getProviders().then((providers) => {
                vm.providers = providers;
                Service.getCodes().then((data) => {
                    vm.codes = data.codes;
                    vm.loading = false;
                });
            });

            socket.on('status', function(data) {
                $timeout(() => {
                    for(var i = 0; i < vm.codes.length; i++) {
                        if(vm.codes[i].code === data.item.code) {
                            vm.codes[i].currentStatus = data.info.status;
                            vm.codes[i].lastUpdate = data.info.date;

                            return;
                        }
                    }
                });
            });
        }

        function addCode() {
            if(!vm.newCode || vm.comm) {
                alert('no new code or comm');
                console.log('newcode', vm.newCode);
                console.log('comm', vm.comm);
                return;
            }

            vm.comm = true;
            Service.addCode(vm.newCode, vm.newCodeProvider).then(function(res) {
                vm.comm = false;
                vm.newCode = '';
                vm.codes.push(res.data);
                $('#add-code').modal('hide');
            }, (err) => {
                if(err.data && err.data.message) {
                    alert(err.data.message);
                }

                vm.comm = false;
                if(err.status !== 400) {
                    $('#add-code').modal('hide');
                }
                
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

        function parseDate(date) {
            return dateFormat(new Date(date), 'dd/mm/yyyy hh:mm');
        }
    }
})();