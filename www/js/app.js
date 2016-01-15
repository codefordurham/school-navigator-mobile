(function() {
var app = angular.module('schools', ['ionic', 'ngCordova']);

// place to setup data to display in view
app.controller('SchoolsCtrl', function($http, $scope, $cordovaGeolocation, $ionicLoading) {

  $scope.charter = [];
  $scope.magnet = [];
  $scope.assigned = [];
  $scope.levels = ['elementary', 'secondary', 'middle', 'high'];

  $scope.form = { query: '' };

  $scope.search = function() {

    if ($scope.form.query) {
      lookup_address = ($scope.form.query.indexOf("durham") == -1) ? $scope.form.query + " Durham County NC": $scope.form.query;
      geocoder = new google.maps.Geocoder();
      geocoder.geocode( { 'address': lookup_address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var geo = results[0].geometry.location;
          $http.get('https://durhamschoolnavigator.org/api/schools/?format=json&longitude=' + geo.lng() + '&latitude=' + geo.lat())
            .success(function(response) {
              $scope.charter = [];
              $scope.magnet = [];
              $scope.assigned = [];
              angular.forEach(response, function(school) {
                // TODO: Add back in 'specialty' when the desktop front end bug is fixed
                if (school.eligibility === 'option') {
                  if (school.type === 'charter') {
                    $scope.charter.push(school);
                  } else if (school.type === 'magnet') {
                    $scope.magnet.push(school);
                  }
                } else {
                  $scope.assigned.push(school);
                }
              });
            });

        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
  };

  $scope.geolocateMe = function() {

        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
        });

        var posOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };

        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            var lat  = position.coords.latitude;
            var lng = position.coords.longitude;

            $http.get('https://durhamschoolnavigator.org/api/schools/?format=json&longitude=' + lng + '&latitude=' + lat)
            .success(function(response) {
              $scope.charter = [];
              $scope.magnet = [];
              $scope.assigned = [];
              angular.forEach(response, function(school) {
                // TODO: Add back in 'specialty' when the desktop front end bug is fixed
                if (school.eligibility === 'option') {
                  if (school.type === 'charter') {
                    $scope.charter.push(school);
                  } else if (school.type === 'magnet') {
                    $scope.magnet.push(school);
                  }
                } else {
                  $scope.assigned.push(school);
                }
              });
            });
            $ionicLoading.hide();

        }, function(err) {
            $ionicLoading.hide();
            console.log(err);
        });
  };

});


app.controller('MapCtrl', function($http, $scope, $ionicModal) {
  $ionicModal.fromTemplateUrl('templates/school-map.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function(school_id) {
  $http.get('https://durhamschoolnavigator.org/api/schools/detail/' + school_id  + '/?format=json')
    .success(function(response) {
      console.log(response);
    });

    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
});


app.directive('searchBar', function(){
  return {
    templateUrl: 'templates/search-bar.html',
    restrict: 'E'
  };
});


app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

}());
