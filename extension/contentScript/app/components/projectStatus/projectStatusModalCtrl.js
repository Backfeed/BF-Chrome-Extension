angular.module('MyApp').controller('ProjectStatusModalCtrl', ProjectStatusModalCtrl);

function ProjectStatusModalCtrl($scope, $auth, $location, $state, $stateParams, $modalInstance, _DEV, CurrentUser, PostMessageService, ChannelProject, Milestone, Project) {

  var log = _DEV.log("PROJECT STATUS MODAL");

  var currentUser = CurrentUser.get();

  var channelId   = $stateParams.channelId;
  var mileStoneId = $stateParams.mileStoneId;
  var project     = Project.getByChannelId(channelId);
  var ctrl = this;

  angular.extend(ctrl, {

    closeModal: closeModal,
    updateViewforMilestone: updateViewforMilestone,
    selectedMilestonetId: '',
    channelName: project.channelName,
    milestones: [],
    milestoneContributers: [],
    activeContribution: {}

  });

  init();

  function init() {

    PostMessageService.hideIframe();
    PostMessageService.showIframe();
    
    Milestone.getAll(project.orgId).then(function(milestones) {
      log("init: milestones", milestones);
      ctrl.milestones = milestones;
    });

    Milestone.getCurrent(project.orgId).then(function(currentMilestone) {
      log("init: current milestones", currentMilestone);
      angular.extend(ctrl, {

        milestoneContributers: currentMilestone.milestoneContributers,
        milestoneContributions: currentMilestone.milestoneContributions,
        tokenName: currentMilestone.tokenName,
        tokens: currentMilestone.tokens,
        totalValue: currentMilestone.totalValue

      });

    });

  }

  function updateViewforMilestone() {

    if (ctrl.selectedMilestonetId === '')
      return;

    Milestone.get(ctrl.selectedMilestonetId).then(

      function(result) {

        $scope.projectStatusModel = result;
        log("updateViewforMilestone: TODO: assignto controller instead of projectStatusModel");

      },

      function(err) {
        log('updateViewforMilestone ERROR', err);
      }

    );

  }

  function closeModal() {
    $modalInstance.dismiss('cancel');
  };

}