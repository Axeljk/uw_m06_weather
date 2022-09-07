// Constants.
const HISTORY_LENGTH = 10;

// Global variables.
var currentCity;
var cityHistory = [];

window.onload = () => {
	if (localStorage.getItem("cityHistory")) {
		cityHistory = JSON.parse(localStorage.getItem("cityHistory"));
		currentCity = cityHistory[length - 1];

		for (let i = 0; i < cityHistory.length; i++)
			addCityHistory(cityHistory[i])
	}

	// Submit button for text field.
	$("#cityButton").on("click", (event) => {
		let cityName = "";

		event.preventDefault();
		cityName = $("#city").val();
		$("#city").val("");

		fetch("http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=5&appid=e9c23417e6f0f3c2caee34799ba0b8e7")
			.then((response) => response.json())
			.then((responseJson) => {
				if (responseJson.length > 0 && responseJson[0].name.toUpperCase() === cityName.toUpperCase()) {
					// City exists. Create object for it:
					currentCity = {
						name:  responseJson[0].name,
						lat: responseJson[0].lat,
						lon: responseJson[0].lon
					}
					console.log("Current", currentCity);

					// Add city to the recent list.
					cityHistory.push(currentCity);
					addCityHistory(currentCity);

					// Populate page with the data.
					weatherPopulate();
				}
			})
	});

	// Previous cities buttons.
	$("ul button").on("click", (event) => {
		currentCity = {
			name:  $(event.target).text(),
			lat: $(event.target).data("lat"),
			lon: $(event.target).data("lon")
		}
		weatherPopulate();
	});
}

function addCityHistory(city) {
	// Create button in history list.
	$("#prevCities").append($("<li>", {
		class: "list-group-item p-0 my-1"
	}).append($("<button>", {
		type: "submit",
		class: "btn-block btn-tertiary",
		"data-lat": city.lat,
		"data-lon": city.lon,
		text: city.name
	})));

	// Remove excessive history.
	while ($("#prevCities").children().length > HISTORY_LENGTH) {
		$("#prevCities").children().first().remove();
		cityHistory.shift();
	}

	// Update local storage.
	localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
}

function weatherPopulate() {
	// Current Weather
	fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + currentCity.lat + "&lon=" + currentCity.lon + "&cnt=5&appid=e9c23417e6f0f3c2caee34799ba0b8e7")
		.then((response) => response.json())
		.then((responseJson) => {
			console.log(responseJson)
			$("#curCity").text(responseJson.name);
			$("#curDate").text(moment(responseJson.dt, "X").format("MM/DD/YYYY"));
			$("#curIcon").attr("src", "http://openweathermap.org/img/wn/" + responseJson.weather[0].icon + ".png");
			$("#curTemp").text("Temp: " + ((responseJson.main.temp - 273.15) * 9 / 5 + 32).toFixed(0) + "°F");
			$("#curWind").text("Wind: " + responseJson.wind.speed + "MPH");
			$("#curHumidity").text("Humidity: " + responseJson.main.humidity + "%");
		});

	// UV Index
	fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + currentCity.lat + "&lon=" + currentCity.lon + "&cnt=5&appid=e9c23417e6f0f3c2caee34799ba0b8e7")
	.then((response) => response.json())
	.then((responseJson) => {
		$("#curUV").text(responseJson.current.uvi);
		if (responseJson.current.uvi <= 2) // Favorable
			$("#curUV").css("background-color", "#090");
		else if (responseJson.current.uvi <= 5) // Moderate
			$("#curUV").css("background-color", "#aa0");
		else
			$("#curUV").css("background-color", "#900");
	});

	// Forecast
	fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + currentCity.name + "&appid=e9c23417e6f0f3c2caee34799ba0b8e7")
		.then((response) => response.json())
		.then((responseJson) => {
			for (let i = 1; i <= 5; i++) {
				let forecastIndex = responseJson.list[8 * i - 1];
				$(`#date${i}`).text(moment(forecastIndex.dt, "X").format("MM/DD/YYYY"));
				$(`#date${i}Icon`).attr("src", "http://openweathermap.org/img/wn/" + forecastIndex.weather[0].icon + ".png");
				$(`#date${i}Temp`).text(((forecastIndex.main.temp - 273.15) * 9 / 5 + 32).toFixed(0) + "°F");
				$(`#date${i}Wind`).text(forecastIndex.wind.speed + "MPH");
				$(`#date${i}Humidity`).text(forecastIndex.main.humidity + "%");
			}
		});
}