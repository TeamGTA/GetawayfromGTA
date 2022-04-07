$(function() {
    $('#tourist_attraction').hide();
    $('#weather').hide();
    $('#food').hide();
    $('#results').hide();
    parallax_height();
});

function parallax_height() {
    var scroll_top = $(this).scrollTop() - 200;
    var sample_section_top = $(".sample-section").offset().top;
    var header_height = $(".sample-header-section").outerHeight();
    $(".sample-section").css({ "margin-top": header_height });
    $(".sample-header").css({ height: header_height - scroll_top });
}

$(window).scroll(function() {
    parallax_height();
});
$(window).resize(function() {
    parallax_height();
});

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
        $('#results').show();
        const places = searchBox.getPlaces();
        console.log("===Place Info Object====")
        console.log(places)
        var selected_city = places[0]['formatted_address'];
        // get weather Object
        getWeather(selected_city)
        getGeoName(selected_city)
        if (places.length == 0) {
            return;
        }
    });
}


// openweathermap API
var apiKey_weather = 'c09649ce8ab2b228d992062f0a8f1b58'

function getWeather(city) {
    $('#weather').show();
    const msg = document.querySelector(".top-banner .msg");
    const list = document.querySelector(".ajax-section .cities");
    //ajax here
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey_weather}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const { main, name, sys, weather } = data;
            const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${
        weather[0]["icon"]
      }.svg`;

            const li = document.createElement("li");
            li.classList.add("city");
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
            list.appendChild(li);
        })
        .catch(() => {
            msg.textContent = "Please search for a valid city 😩";
        });
}

// opentripmap API 
const apiKey_openTrip = "5ae2e3f221c38a28845f05b694bb9c66ec3a567403ff0c00d6e3e5c1";

function apiGet(method, query) {
    return new Promise(function(resolve, reject) {
        var otmAPI =
            "https://api.opentripmap.com/0.1/en/places/" +
            method +
            "?apikey=" +
            apiKey_openTrip;
        if (query !== undefined) {
            otmAPI += "&" + query;
        }
        fetch(otmAPI)
            .then(response => response.json())
            .then(data => resolve(data))
            .catch(function(err) {
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
    $('#tourist_attraction').show();

    apiGet("geoname", "name=" + name).then(function(data) {
        let message = "Name not found";
        if (data.status == "OK") {
            message = data.name;
            lon = data.lon;
            lat = data.lat;
            firstLoad(name);
        }
    })
}

function firstLoad(name) {
    apiGet(
        "radius",
        `radius=1000&limit=${pageLength}&offset=${offset}&lon=${lon}&lat=${lat}&rate=2&format=count`
    ).then(function(data) {
        count = data.count;
        offset = 0;
        console.log(data)
        document.getElementById(
            "info"
        ).innerHTML = `<p>${name}  ${count} Famous attractions with description in a 1km radius</p>`;
        loadList();
    });
}

function loadList() {
    apiGet(
        "radius",
        `radius=1000&limit=${pageLength}&offset=${offset}&lon=${lon}&lat=${lat}&rate=2&format=json`
    ).then(function(data) {
        console.log(data)
        let list = document.getElementById("list");
        list.innerHTML = "";
        data.forEach(item => list.appendChild(createListItem(item)));
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
    poi.innerHTML += data.wikipedia_extracts ?
        data.wikipedia_extracts.html :
        data.info ?
        data.info.descr :
        "No description";
}

function createListItem(item) {
    let a = document.createElement("a");
    a.className = "list-group-item list-group-item-action";
    a.setAttribute("data-id", item.xid);
    a.innerHTML = `<h5 class="list-group-item-heading">${item.name}</h5>
              <p class="list-group-item-text">${item.kinds}</p>`;

    a.addEventListener("click", function() {
        document.querySelectorAll("#list a").forEach(function(item) {
            item.classList.remove("active");
        });
        this.classList.add("active");
        let xid = this.getAttribute("data-id");
        apiGet("xid/" + xid).then(data => onShowPOI(data));
    });
    return a;
}


// Worldwide Restaurant API


// var apiKey_food = '3ca2473663mshadfed96d78e1943p118f82jsnb3ea968dd263'

// function getfood(city) {
//     $('#weather').show();
//     const msg = document.querySelector(".top-banner .msg");
//     const list = document.querySelector(".ajax-section .cities");
//     //ajax here
//     const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey_weather}&units=metric`;

//     fetch(url)
//         .then(response => response.json())
//         .then(data => {
//             const { main, name, sys, weather } = data;
//             const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${
//         weather[0]["icon"]
//       }.svg`;

//             const li = document.createElement("li");
//             li.classList.add("city");
//             const markup = `
//         <h2 class="city-name" data-name="${name},${sys.country}">
//           <span>${name}</span>
//           <sup>${sys.country}</sup>
//         </h2>
//         <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
//         <figure>
//           <img class="city-icon" src="${icon}" alt="${
//         weather[0]["description"]
//       }">
//           <figcaption>${weather[0]["description"]}</figcaption>
//         </figure>
//       `;
//             li.innerHTML = markup;
//             list.appendChild(li);
//         })
//         .catch(() => {
//             msg.textContent = "Please search for a valid city 😩";
//         });
// }