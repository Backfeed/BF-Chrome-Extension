angular.module('MyApp')
  .controller('MilestoneModalCtrl', MilestoneModalCtrl);

function MilestoneModalCtrl($stateParams, $modalInstance, _DEV, Resource, Project, Milestone, PostMessageService) {

  var log = _DEV.log('ADD MILESTONE CTRL');

  var channelId = $stateParams.channelId;

  var ctrl = this;

  angular.extend(ctrl, {
    submit: submit,
    closeModal: closeModal,
    teams: [],
    milestone: { channelId: channelId }
  });

  init();
  
  function init() {

    PostMessageService.hideIframe();
    PostMessageService.showIframe();

    getProjects();

    getMilestone();

  }

  function getProjects() { 
    ctrl.projects = Project.getAll();
  }

  function getMilestone() {
    Milestone.getCurrentByChannelId(channelId,'true').then(function(milestone) {
      angular.extend(ctrl.milestone, milestone);
      log("Milestone", ctrl.milestone);
    });
  }

  function closeModal() {
    $modalInstance.dismiss('cancel');
  }

  function submit() {
    log('Create Milestone', ctrl.milestone);
    
    Milestone.create(ctrl.milestone).then(function(result) {

      $modalInstance.close('submit');
      PostMessageService.hideIframe();

    });

  }

}