(function() {
var app = angular.module('schools', ['ionic']);

// place to setup data to display in view
app.controller('SchoolsCtrl', function($http, $scope) {

  $scope.Geocoder = 'false';
  $scope.charter = [];
  $scope.magnet = [];
  $scope.assigned = [];
  $scope.levels = ['elementary', 'secondary', 'middle', 'high'];

  $scope.form = { query: '' };

  $scope.search = function() {

    if ($scope.form.query) {
      var lookup_address = $scope.form.query;
      geocoder = new google.maps.Geocoder();
      geocoder.geocode( { 'address': lookup_address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          $scope.Geocoder = 'true';
          var geo = results[0].geometry.location;
          $http.get('https://schools.codefordurham.com/api/schools/?format=json&longitude=' + geo.lng() + '&latitude=' + geo.lat())
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
