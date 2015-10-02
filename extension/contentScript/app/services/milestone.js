angular.module('MyApp')
  .service('Milestone', Milestone);

function Milestone(_DEV, Resource) {

  var log = _DEV.log('Milestone Service');

  var service = {

    create: create,
    getCurrent: getCurrent,
    get: get,
    getAll: getAll

  };

  return service;

  function create(title, description, evaluatingTeam, channelId) {
    return Resource.post('milestone', title, description, evaluatingTeam, channelId);
  }

  function get(id) {
    return Resource.get('milestone/' + id);
  }

  function getCurrent(orgId) {
    return Resource.get('organization/currentStatus/' + orgId);
  }

  function getAll(orgId) {
    return Resource.get('milestone/all/' + orgId);
  }

}