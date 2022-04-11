$(function () {
  $("#tourist_attraction").hide();
  $("#weather").hide();
  $("#food").hide();
  $("#results").hide();
  $("#place_description").hide();
  parallax_height();
});

function parallax_height() {
  var scroll_top = $(this).scrollTop() - 200;
  var sample_section_top = $(".sample-section").offset().top;
  var header_height = $(".sample-header-section").outerHeight();
  $(".sample-section").css({ "margin-top": header_height });
  $(".sample-header").css({ height: header_height - scroll_top });
}

$(window).scroll(function () {
  parallax_height();
});
$(window).resize(function () {
  parallax_height();
});

$("#search-form").submit(function (e) {
  return false;
});

function initAutocomplete() {
  var options = {
    // type cities
    types: ["cities"],
    // only USA
    componentRestrictions: { country: "us" },
  };
  // Create the search box and link it to the UI element.
  const input = document.getElementById("enterCity");
  const searchBox = new google.maps.places.SearchBox(input, options);

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    $("#place_description").hide();
    $("#results").show();
    const places = searchBox.getPlaces();
    console.log("===Place Info Object====");
    console.log(places);
    var selected_city = places[0]["formatted_address"];
    // get weather Object
    console.log("===Selected City ===");
    console.log(selected_city);
    getWeather(selected_city);
    getGeoName(selected_city);
    if (places.length == 0) {
      return;
    }
  });
}

// openweathermap API
var apiKey_weather = "c09649ce8ab2b228d992062f0a8f1b58";

function getWeather(city) {
  console.log("===Weather City===");
  console.log(city);
  
  $("#weather").show();
  const msg = document.querySelector(".top-banner .msg");
  const list = document.querySelector(".ajax-section .cities");
  list.innerHTML = "";
  //ajax here
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey_weather}&units=metric`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {  
      const { main, name, sys, weather } = data;
      const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;
      console.log("===Fetch City===");
      console.log(name, sys.country); 
      const li = document.createElement("li");
      li.className = "city text-center";

      const markup = `
        <h2 class="city-name" data-name="${name},${sys.country}">
          <span>${name}</span>
          <sup>${sys.country}</sup>
        </h2>
        <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
        <figure>
          <img class="city-icon" src="${icon}" alt="${
        weather[0]["description"]
      }">
          <figcaption>${weather[0]["description"]}</figcaption>
        </figure>
      `;
      li.innerHTML = markup;
      // list.appendChild(li);
      console.log(li);
      list.innerHTML = li.outerHTML;
    })
    .catch(() => {
      msg.textContent = "Please search for a valid city 😩";
    });
}

// opentripmap API
const apiKey_openTrip =
  "5ae2e3f221c38a28845f05b694bb9c66ec3a567403ff0c00d6e3e5c1";

function apiGet(method, query1) {
  return new Promise(function (resolve, reject) {
    var otmAPI =
      "https://api.opentripmap.com/0.1/en/places/" +
      method +
      "?apikey=" +
      apiKey_openTrip;
    if (query1 !== undefined) {
      otmAPI += "&" + query1;
    }
    fetch(otmAPI)
      .then((response) => response.json())
      .then((data) => resolve(data))
      .catch(function (err) {
        console.log("Fetch Error :-S", err);
      });
  });
}
// Init global variables for paging:
const pageLength = 5; // number of objects per page

let lon; // place longitude
let lat; // place latitude

let offset = 0; // offset from first object in the list
let count; // total objects count
function getGeoName(name) {

    console.log("===Geo Name===");
    console.log(name);  
    var split_city = name.split(", ");
    console.log(split_city);
  $("#tourist_attraction").show();

  apiGet("geoname", "name=" + split_city[0]).then(function (data) {
    let message = "Name not found";
    if (data.status == "OK") {
    console.log("THIS IS WORKING",data);
      message = data.name;
      lon = data.lon;
      lat = data.lat;
      getRestaurants(lat, lon);
      firstLoad(name);
    }
  });
}

function getRestaurants(lat, lon) {
    console.log("===Lat & Lon===");
    console.log(lat, lon);
  const request = {
    location: new google.maps.LatLng(lat, lon),
    radius: 5000,
    type: ["restaurant"],
  };

  const results = [];
  const input = document.getElementById("list_restaurant");
  const service = new google.maps.places.PlacesService(input);
  const displayRestaurant = () => {
    $("#food").show();

    var index = 1;
    const list = document.getElementById("list_restaurant");
    var top_restaurant = results.slice(0, 9);
    top_restaurant
      .filter((result) => result.rating)
      .sort((a, b) => (a.rating > b.rating ? -1 : 1))
      .forEach((result) => {
        list.innerHTML += `<div class='card card-${index}'>
                    <div class='card__icon'><img src='${result.icon}' width='50px' /></div>
                    <p class='card__exit'><i class='fas fa fa-clock-o'></i></p>
                    <h2 class='card__title'>${result.name}</h2>
                    <p><i class='fas fa fa-map-marker' style="color:white"></i> ${result.vicinity}</p>
                    <p class='card__apply'>
                    <a class='card__link' href='#'><i class='fas fa fa-star'></i>${result.rating}</a>
                    </p>
                </div>`;
        index++;
        if (index == 5) index = 1;
      });
  };
  const callback = (response, status, pagination) => {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      results.push(...response);
    }
    console.log(results);

    if (pagination.hasNextPage) {
      setTimeout(() => pagination.nextPage(), 2000);
    } else {
      displayRestaurant();
    }
  };
  service.nearbySearch(request, callback);
}

function firstLoad(name) {
  apiGet(
    "radius",
    `radius=1000&limit=${pageLength}&offset=${offset}&lon=${lon} &lat=${lat}&rate=2&format=count`
  ).then(function (data) {
    count = data.count;
    offset = 0;
    console.log(data);
    document.getElementById(
      "info"
    ).innerHTML = ` <p> ${name} ${count} Famous attractions with description in a 1 km radius </p>`;
    loadList();
  });
}

function loadList() {
  apiGet(
    "radius",
    `radius=1000&limit=${pageLength}&offset=${offset}&lon=${lon}&lat=${lat}&rate=2&format=json`
  ).then(function (data) {
    console.log(data);
    let list = document.getElementById("list");
    list.innerHTML = "";
    data.forEach((item) => list.appendChild(createListItem(item)));
    let nextBtn = document.getElementById("next_button");
    if (count < offset + pageLength) {
      nextBtn.style.visibility = "hidden";
    } else {
      nextBtn.style.visibility = "visible";
      nextBtn.innerText = `Next (${offset + pageLength} of ${count})`;
    }
  });
}

function onShowPOI(data) {
  let poi = document.getElementById("poi");
  poi.innerHTML = "";
  if (data.preview) {
    poi.innerHTML += `<img src="${data.preview.source}">`;
  }
  poi.innerHTML += data.wikipedia_extracts
    ? data.wikipedia_extracts.html
    : data.info
    ? data.info.descr
    : "No description";
}

function createListItem(item) {
  let a = document.createElement("a");
  a.className = "list-group-item list-group-item-action";
  a.setAttribute("data-id", item.xid);
  a.innerHTML = `<h5 class="list-group-item-heading">${item.name}</h5>
              <p class="list-group-item-text">${item.kinds}</p>`;

  a.addEventListener("click", function () {
    document.querySelectorAll("#list a").forEach(function (item) {
        $("#place_description").show();
      item.classList.remove("active");
    });
    this.classList.add("active");
    let xid = this.getAttribute("data-id");
    apiGet("xid/" + xid).then((data) => onShowPOI(data));
  });
  return a;
}

document.getElementById("next_button").addEventListener("click", function () {
  offset += pageLength;
  loadList();
});
