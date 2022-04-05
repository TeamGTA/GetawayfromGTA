function initAutocomplete() {
    var options = {
        // type cities
        types: ['(cities)'],
        // only USA
        componentRestrictions: { country: "us" }
    };
    // Create the search box and link it to the UI element.
    const input = document.getElementById("enterCity");
    const searchBox = new google.maps.places.SearchBox(input, options);

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
        console.log("===Place Info Object====")
        console.log(places)
        var selected_city = places[0]['formatted_address'];
        // get weather Object
        getWeather(selected_city)
        if (places.length == 0) {
            return;
        }
    });
}


function getWeather(city) {
    url = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=c09649ce8ab2b228d992062f0a8f1b58'
    fetch(url).then(function(response) {
        response.json().then(function(data) {
            console.log("===Place Weather Data====")
            console.log(data);
        });
    });
}