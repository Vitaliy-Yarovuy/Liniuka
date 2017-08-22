function initAutocomplete() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 50.25465000000001, lng: 28.65866690000007},
    zoom: 10,
    mapTypeId: 'roadmap'
  });

  // Create the search box and link it to the UI element.
  var inputs = [document.getElementById('first-place'), document.getElementById('second-place')];
  
  var result = document.getElementById('result-place');

  var searchBoxes = inputs.map(function(input){
    return new google.maps.places.SearchBox(input);
  });

  var controls = map.controls[google.maps.ControlPosition.TOP_LEFT];
  controls.push(inputs[0]);
  controls.push(inputs[1]);
  controls.push(result);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBoxes.map(function(searchBox){
      searchBox.setBounds(map.getBounds());
    });
  });

  var markers = [null, null];
  var places = [null, null];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.

  function toRadian(value){
    return value  * Math.PI / 180;
  }

  function distance(locA, locB){
    var R = 6371.009;
    var dLat = toRadian(locA.lat() - locB.lat()); 
    var avgLat = toRadian((locA.lat() + locB.lat())/2); 
    var dLng = toRadian(locA.lng() - locB.lng()); 

    return R * Math.sqrt(Math.pow(dLat, 2) + Math.pow(Math.cos(avgLat)*dLng,2));
  } 

  searchBoxes.forEach(function(searchBox, index){
    searchBox.addListener('places_changed', function() {
      var foundPlaces = searchBox.getPlaces();

      if (foundPlaces.length == 0) {
        return;
      }

      var place = foundPlaces[0];  

      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }


      if(markers[index]){
        markers[index].setMap(null);
        markers[index] = null;
      }  

      // For each place, get the icon, name and location.
      var bounds = new google.maps.LatLngBounds();

      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers[index] = new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      });


      places[index] = place;

      places
        .filter(function(place){
          return !!place;
        })
        .forEach(function(place){
            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
        });
      
      if(places[0] && places[1]){
        result.value = distance(places[0].geometry.location, places[1].geometry.location).toFixed(2) + 'км'
      } else {
        result.value = '';
      }

      map.fitBounds(bounds);
    });
  });
  
}
