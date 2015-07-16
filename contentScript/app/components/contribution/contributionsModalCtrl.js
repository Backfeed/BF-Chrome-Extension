angular.module('MyApp').controller(
    'ContributionsModalCtrl',
    function($scope, $auth, $location, $rootScope,$stateParams, $alert, Contributions,
             ContributionDetail, SaveContribution, CloseContribution,$state,
             Account, Users, $modalInstance,PostMessageService) {

        $scope.closeModal = function() {
            $modalInstance.dismiss('cancel');
        };		
        var orgExists;

        $scope.currencyFormatting = function(value) { return value.toString() + " $"; };
        $scope.organizationId = 'notintialized';
        $scope.buttonDisabled = true;
        $scope.model = {
            title : '',
            file : '',
            owner : '',
            min_reputation_to_close : '',
            users_organizations_id : '',
            contributers : [ {
                contributer_id : '0',
                contributer_percentage : '100',
                contributer_name:'',
                img:'/contentScript/app/images/icon-dude.png'
            } ],
            intialBid : [ {
                tokens : '',
                reputation : ''
            } ]

        };

        console.log('comes here in controller');

        // if not authenticated return to splash:
        if (!$auth.isAuthenticated()) {
            $location.path('splash');
        } else {
            $scope.getOrgUsers = function() {
                $scope.data = Users.getOrg.getUsers({
                    organizationId : $scope.organizationId
                });
                $scope.data.$promise.then(function(result) {
                    Users.setAllOrgUsersData(result);
                    $scope.users = result;
                    $scope.updatedUsersList = $scope.users;
                    for(i = 0 ; i<$scope.users.length ; i++){
                        if($scope.users[i].id == $scope.model.owner ){
                            $scope.model.contributers[0].img =  $scope.users[i].url;
                            $scope.model.contributers[0].contributer_name =  $scope.users[i].name;
                            break;
                        }
                    }
                    //$scope.addCollaborator();
                    //$location.path("/contribution/" + result.id);
                });
            };
            $scope.getProfile = function() {
                Account.getProfile().success(function(data) {
                    $scope.userId = data.userId;
                    orgExists = data.orgexists;
                    console.log('userData is not defined comes 1 orgExists'+orgExists)
                    if (orgExists == 'true') {
                        $scope.users_organizations_id = data.userOrgId;
                        $scope.model.users_organizations_id = data.userOrgId;
                        $scope.organizationId = data.orgId;
                        $scope.access_token = data.access_token;
                        $scope.model.owner = data.userId;
                        $scope.model.contributers[0].contributer_id = data.userId;
                        $scope.model.contributers[0].contributer_name = data.displayName;
                        $scope.getOrgUsers();
                        PostMessageService.gesture.showIframe();
                    }else{
                    	//navigate to create org screen
                    	$state.go('createOrg', {}, {reload: true});
                    }
                    Account.setUserData(data);

                }).error(function(error) {
                    $alert({
                        content : error.message,
                        animation : 'fadeZoomFadeDown',
                        type : 'material',
                        duration : 3
                    });
                });
            };

            $scope.ifOrgExists = function() {
                if (Account.getUserData() != undefined) {
                    $scope.user = Account.getUserData();
                    if (Account.getUserData().orgexists == 'false') {
                        orgExists = "false";
                        return false;
                    } else {
                        orgExists = "true";
                        return true;
                    }
                }

            };

            userData = Account.getUserData();

            if (userData == undefined) {
                console.log('userData is not defined'+userData);
                $scope.getProfile();
            } else {
                console.log('userData is  defined'+userData);
                $scope.userId = userData.userId;
                console.log('userData is  defined userId'+$scope.userId);
                orgExists = userData.orgexists;
                console.log('userData is  defined orgexists'+orgExists);
                if (orgExists == 'true') {
                    $scope.users_organizations_id = userData.userOrgId;
                    $scope.organizationId = userData.orgId;
                    $scope.model.users_organizations_id = userData.userOrgId;
                    
                    $scope.access_token = userData.access_token;
                    $scope.model.owner = userData.userId;
                    $scope.model.contributers[0].contributer_id = userData.userId;
                    $scope.model.contributers[0].contributer_name = userData.displayName;
                    PostMessageService.gesture.showIframe();
                }else{
                	//navigate to create org screen
                	$state.go('createOrg', {}, {reload: true});
                }
                $scope.model.owner = userData.userId;
            }

            $scope.updateContributer = function(selectedUserId) {
                if(selectedUserId == ''){
                    return;
                }
                console.log('comes here firt');
                $scope.addCollaborator(selectedUserId);
                urlImage = '';
                userName = '';
                for(i = 0 ; i<$scope.users.length ; i++){
                    if($scope.users[i].id == selectedUserId ){
                        urlImage =  $scope.users[i].url;
                        userName = $scope.users[i].name;
                        break;
                    }
                }

                allcontributers = $scope.model.contributers;
                contPercentage = 100/allcontributers.length;

                for(i=0;i<allcontributers.length;i++){
                    if(allcontributers[i].contributer_id == 0 && allcontributers[i].contributer_percentage == ''){
                        allcontributers[i].contributer_id = selectedUserId;
                        allcontributers[i].contributer_percentage = contPercentage;
                        allcontributers[i].img = urlImage;

                    }
                }
                $scope.changeContribution(selectedUserId,contPercentage,userName);



            };




            allOrgUsersData = Users.getAllOrgUsersData();
            console.log('here orgExists is'+orgExists);
            if (orgExists == 'true') {
                if (allOrgUsersData == undefined) {
                    $scope.getOrgUsers();
                } else {

                    $scope.users = allOrgUsersData;
                    for(i = 0 ; i<$scope.users.length ; i++){
                        if($scope.users[i].id == $scope.model.owner ){
                            $scope.model.contributers[0].img =  $scope.users[i].url;
                        }
                    }
                    $scope.updatedUsersList = $scope.users;
                }

            }

            $scope.contributionId = $stateParams.contributionId;

            $scope.ContributionModelForView = {
                title : '',
                file : '',
                owner : '',
                min_reputation_to_close : '',
                users_organizations_id : '',
                contributionContributers : [ {
                    contributer_id : '',
                    contributer_percentage : ''
                } ],
                bids : [ {
                    tokens : '',
                    reputation : '',
                    stake : '',
                    owner : '',
                    bidderName : ''
                } ]
            };

            $scope.getContribution = function(entity) {
                var constributionId = 0;
                if (entity) {
                    contributionId = entity.id;
                }
                console.log("get Contribution " + contributionId);
                $location.path("/contribution/" + contributionId);

            };

            $scope.changeContribution = function(contributerId,contributerPercentage,userName) {
                totalContribution = 0;
                allcontributers = $scope.model.contributers;
                valid = true;
                if(allcontributers.length){
                    valid = false;
                }
                console.log('userName is '+userName);
                console.log('coming percentage is '+contributerPercentage);
                remainingPercentage = 100 - +contributerPercentage;
                console.log('remaining percentage is '+remainingPercentage);
                totalEarlierRemaining = 0;
                for(i=0;i<allcontributers.length;i++){
                    if(allcontributers[i].contributer_id != 0){
                        if(allcontributers[i].contributer_id != contributerId){
                            totalEarlierRemaining = totalEarlierRemaining + +allcontributers[i].contributer_percentage
                        }else{
                            if(userName != ''){
                                console.log('comes inside is '+userName);
                                allcontributers[i].contributer_name = userName;
                            }


                        }

                    }
                }
                for(i=0;i<allcontributers.length;i++){
                    if(allcontributers[i].contributer_id != 0){
                        if(allcontributers[i].contributer_id != contributerId){
                            console.log('old percentage is'+allcontributers[i].contributer_percentage);
                            allcontributers[i].contributer_percentage = (remainingPercentage * allcontributers[i].contributer_percentage)/totalEarlierRemaining;
                            console.log('new percentage is  is '+allcontributers[i].contributer_percentage);
                        }else{
                            allcontributers[i].contributer_percentage = contributerPercentage;
                        }

                    }else{
                        valid = false;
                    }



                }

                $scope.buttonDisabled = valid;

            };

            // ******************************* SLACK PLAY ***********************

            $scope.formatContributionData = function(contributionData) {
                var str =   contributionData.title +
                    '\ncontent: \n'+contributionData.file;
                return str;
            };

            $scope.sendTestMessage = function(channelId,message) {
                console.log('sending test message to slack :'+message);

                // 'https://slack.com/api/users.list'

                var url = 'https://slack.com/api/chat.postMessage';
                console.log('url:'+url);

                var token = "xoxp-3655944058-3674335518-3694970236-83726d";
                //	var key = 'c1bb14ae5cc544231959fc6e9af43218';
                var data = {
                    icon_url:'https://s-media-cache-ak0.pinimg.com/236x/71/71/f9/7171f9ba59d5055dd0a865b41ac4b987.jpg',
                    username:'backfeed-bot',
                    token:token,
                    channel:channelId,
                    text:message
                };

                // TBD: move to use angularJS instead of Jquery and get rid of need to change  Host when we deploy...
                // TBD: which API ? do we get 'my borads or boards of orgenziation'
                $.ajax({
                    type: "GET",
                    url: url,
                    data: data,
                    success: function(){console.log('message posted succesfulyy!')},
                    persist:true,
                    dataType:'JSON'
                });
            };


            $scope.gotChannels = function(data) {
                console.log('recieved Channels:');
                console.dir(data);


                // get specific channel:
                var chnls = data.channels;
                for (chnIndx in chnls){
                    var chnl = chnls[chnIndx];
                    console.log('chnl.name:'+chnl.name);
                    if(chnl.name == 'contributions_test'){
                        console.log('is random sending ...:')	;

                        channelId = chnl.id;
                        $scope.sendTestMessage(channelId,'new contribution was created:\n'+$scope.formatContributionData($scope.currentSavedContribution))
                    }
                }
            };

            $scope.getChannels = function() {

                console.log('getting channels using access Token:'+$scope.access_token);

                // 'https://slack.com/api/users.list'

                var url = 'https://slack.com/api/channels.list';
                console.log('url:'+url);

                var token = "xoxp-3655944058-3674335518-3694970236-83726d";
                //	var key = 'c1bb14ae5cc544231959fc6e9af43218';
                var data = {
                    token:token
                    //,key:key
                };

                // TBD: move to use angularJS instead of Jquery and get rid of need to change  Host when we deploy...
                // TBD: which API ? do we get 'my borads or boards of orgenziation'
                $.ajax({
                    type: "GET",
                    url: url,
                    data: data,
                    success: $scope.gotChannels,
                    persist:true,
                    dataType:'JSON'
                });

            };

            $scope.slackPlay = function(contribution) {
                console.dir(contribution);
                $scope.currentSavedContribution = contribution;

                console.log('sending to slack, contribution:'+$scope.currentSavedContribution.title);
                $scope.getChannels()

            };
            // *****************************************************
            // function definition
            $scope.onSubmit = function() {
                allcontributers = $scope.model.contributers;
                totalActive = 0;
                for(i=0;i<allcontributers.length;i++){
                    if(allcontributers[i].contributer_id != 0){
                        totalActive = totalActive + 1;
                    }
                }
                console.log('total is '+totalActive);
                if(totalActive <=0 ){
                    alert("At least one contributer should be there");
                    return
                }
                console.log("In Submit method");
                console.log($scope.model);
                $scope.data = SaveContribution.save({}, $scope.model);
                $scope.data.$promise.then(function(result) {

                    // TBD: un comment later:
                    //$scope.slackPlay(result);

                    $modalInstance.close('submit');

                    $state.go('bids', {'contributionId': result.id});
                	
                    //$location.path("/bids/" + result.id);

                });
            };

            $scope.removeCollaboratorItem = function(contributerId,contributerPecentage,index) {
                $scope.model.contributers.splice(index, 1);
                $scope.changeContribution(contributerId,0,'');
                allcontributers = $scope.model.contributers;
                $scope.updatedUsersList = [];
                $scope.selectedContributerId = '';
                for(i = 0 ; i<$scope.users.length ; i++){
                    userExist = false;
                    for(j=0;j<allcontributers.length;j++){
                        if($scope.users[i].id == allcontributers[j].contributer_id ){
                            userExist = true;
                            break;
                        }
                    }
                    if(userExist == false){
                        $scope.updatedUsersList.push($scope.users[i]);
                    }
                }
            };
            $scope.createContribution = function() {
                console.log("Create Contribution");
                console.log($scope.model);
                $location.path("/contribution");
            };
            $scope.addBid = function() {
                console.log("Create Bid");
                console.log($scope.ContributionModelForView.id);
                $location.path("/bids/"
                    + $scope.ContributionModelForView.id);
            };
            $scope.showStatus = function() {
                console.log("Show Status");
                console.log($scope.ContributionModelForView.id);
                $location.path("/contributionStatus/"
                    + $scope.ContributionModelForView.id);
            };


            if ($scope.contributionId && $scope.contributionId != 0) {
                $scope.data1 = ContributionDetail.getDetail({
                    contributionId : $scope.contributionId
                });
                $scope.data1.$promise.then(function(result) {
                    $scope.ContributionModelForView = result;
                });
            }
            //$scope.users = User.query();
            $scope.orderProp = "time_created"; // set initial order criteria
            $scope.addCollaborator = function(selectedUserId) {
                console.log('comes here in add'+selectedUserId);
                allcontributers = $scope.model.contributers;
                $scope.updatedUsersList = [];
                $scope.selectedContributerId = '';
                for(i = 0 ; i<$scope.users.length ; i++){
                    if($scope.users[i].id == selectedUserId){
                        continue;
                    }
                    userExist = false;
                    for(j=0;j<allcontributers.length;j++){
                        if($scope.users[i].id == allcontributers[j].contributer_id){
                            userExist = true;
                            break;
                        }
                    }
                    if(userExist == false){
                        $scope.updatedUsersList.push($scope.users[i]);
                    }
                }
                $scope.model.contributers.push({
                    contributer_id:'0',
                    contributer_percentage:'',
                    contributer_name:'',
                    img:'/contentScript/app/images/avatar.png'
                }) ;
                $scope.buttonDisabled = true;
            };

            $scope.closeContribution = function() {
                console.log("In closeContribution method");
                console.log($scope.ContributionModelForView.id);
                $scope.data = CloseContribution.save({},
                    $scope.ContributionModelForView);
                $scope.data.$promise.then(function(result) {
                    alert('Contribution closed');
                    
                    $location.path("/contributions");
                });

            };

            if ($auth.isAuthenticated()) {
                $scope.contributions = Contributions.getAllContributions({
                    organizationId : $scope.organizationId
                });
            }

            $scope.formatSelectUser = function (data) {
                if (!data) return;
                if (!data.url) data.url = "images/icon-dude.png";
                return  "<img src='" + data.url +"' /><span>"+ data.name + " </span><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>"+ data.real_name + " </span>";
            };

        }

    });