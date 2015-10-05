angular.module('MyApp').controller('ContributionStatusCtrl',
    function(PostMessageService, $modal,$scope) {
        var modal = $modal.open({
            templateUrl: "ContributionStatusModalTmpl",
            controller: 'ContributionStatusModalCtrl',
            scope: $scope,
            size: 'contribution-status',
            backdrop: 'static'
        });

        modal.result.then(function() {
            PostMessageService.hideIframe();
        }, function() {
            PostMessageService.hideIframe();
        });
    });
