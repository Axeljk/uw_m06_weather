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

	$("#cityButton").on("click", (event) => {
		let cityName = "";

		event.preventDefault();
		cityName = $("#city").val();
		$("#city").val("");

		fetch("http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=5&appid=e9c23417e6f0f3c2caee34799ba0b8e7")
			.then((response) => response.json())
			.then((responseJson) => {
				console.log( responseJson[0].name);
				if (responseJson.length > 0 && responseJson[0].name.toUpperCase() === cityName.toUpperCase()) {
					// City exists. Create object for it:
					currentCity = {
						name:  responseJson[0].name,
						lat: responseJson[0].lat,
						lon: responseJson[0].lon
					}

					// Add city to the recent list.
					cityHistory.push(currentCity);
					addCityHistory(currentCity);

					// Populate page with the data.
					weatherPopulate();
				}
			})
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

}