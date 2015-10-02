angular.module('MyApp')
.service('Resource', Resource);

function Resource($http, API_URL) {

  var service = {

    get: get,
    getSlackUsers: getSlackUsers,
    post: post,
    put: put,
    destroy: destroy

  };

  return service;

  function getSlackUsers(slackAccessToken, searchQuery, userIds) {
    var path = 'allSlackUsers/' + userIds + '/' + searchQuery;
    return post(path, { access_token: slackAccessToken });
  }

  function get(url, params) {
    return $http.get(API_URL + url, mergeParams(params))
            .then(function(response) {
              return response.data;
            });
  }

  function post(url, params) {
    return $http.post(API_URL + url, mergeParams(params))
            .then(function(response) {
              return response.data;
            });
  }

  function put(url, params) {
    return $http.put(API_URL + url, mergeParams(params))
            .then(function(response) {
              return response.data;
            });
  }

  function destroy(url, params) {
    return $http.delete(API_URL + url, mergeParams(params))
            .then(function(response) {
              return response.data;
            });
  }

  function getBaseParams() {
    return { user_token: '' };
  }
  
  function mergeParams(params) {
    return angular.extend(getBaseParams(), params);
  }

}