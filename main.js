{
    const url_api = "https://api.meetup.com",
        cities_url = url_api + "/2/cities?country=rs&offset=0&format=json&photo-host=public&page=500&radius=50&order=size&desc=false&sig_id=264139441&sig=081a7363ccda9cd84e528d143ab4cf8d8b56a8ad",
        waitingForCities = new Promise(resolved => {
            fetch(cities_url, res => {
                resolved(res);
            });
        });
    let allCities, allEvents;

    waitingForCities.then(res => {
        allCities = res.results;
        renderListOfCities(allCities);
        document.getElementById("listOfCities").addEventListener("change", showEventList);
    });

    function showEventList(event) {
        const citiesList = document.getElementById("listOfCities");
        let lon, lat;
        for (let option of citiesList.childNodes) {
            if (event.target.value === option.value) {
                const id = option.id.split("_");
                [lon, lat] = [id[0], id[1]];
            }
        }
        let waitingForCityEvents = new Promise(resolved => {
            fetch(createEventUrl(lon, lat), (res) => {
                resolved(res);
            });
        });
        waitingForCityEvents.then(res => {
            let eventsDiv = document.getElementById("events");
            allEvents = res.data.events;
            eventsDiv.innerHTML = renderEventsList(allEvents);
            eventsDiv.addEventListener("click", clickOnEvent)
        });
    }

    function clickOnEvent(event) {
        if (event.target !== event.currentTarget) {
            let id;
            if (event.target.parentNode.className === "eventItem") {
                id = event.target.parentNode.id;
            } else if (event.target.className === "eventItem") {
                id = event.target.id;
            } else {
                return;
            }
            document.getElementById("modal").innerHTML = renderEvent(id);
            eventModal("show");
        }
    }

    function renderEventsList(arr) {
        if (arr.length === 0) return "<div class='noEvents'><h1>There is no upcoming events.</h1></div>";
        let print = "";
        for (let event in arr) {
            print += `<div class="eventItem" id="${event}"><h1>${arr[event].name}</h1><h3>${convertDate(arr[event].local_date) + " - " + arr[event].local_time}</h3></div>`;
        }
        return print;
    }

    function renderEvent(id) {
        const info = allEvents[id];
        return `<div><h1>${info.name}</h1><h3>${convertDate(info.local_date) + " - " + info.local_time}</h3>${info.venue !== undefined ? "<h3>" + info.venue.name + "<br>" + info.venue.address_1 + "<br>" +
            "" + info.venue.city + "</h3>" : ""}<div>${typeof info.description !== "undefined" ? info.description : "no description"}</div><a href="${info.link}" target="_blank" class="eventLink">EVENT LINK</a></div>
        <div id="hide_modal">x</div>`;
    }

    function convertDate(date) {
        const dateArr = date.split("-");
        return dateArr[2] + "." + dateArr[1] + "." + dateArr[0];
    }

    function createEventUrl(lon, lat) {
        return `https://api.meetup.com/find/upcoming_events?photo-host=public&sig_id=264139441&radius=5&lon=${lon}&lat=${lat}&sig=2f6a3457286530e6f5e7b727bd7e4c0d0f9790d1`;
    }

    function renderListOfCities(list) {
        let print = `<option value="choose" disabled selected>Choose a city</option>`;
        for (let city of list) {
            print += `<option value="${city.city}" id="${city.lon + "_" + city.lat}">${city.city}</option>`
        }
        document.getElementById("listOfCities").innerHTML = print;
    }

    function fetch(url, callback, data) {
        if (!data) data = [];
        $.ajax({
            dataType: 'jsonp',
            method: 'get',
            url: url,
            success: result => {
                data = result;
                callback(data);
            }
        });
    }

    function eventModal(showOrHide) {
        const [background, modal, hideModalBtn] = [document.getElementById("modalBackground"), document.getElementById("modal"), document.getElementById("hide_modal")];
        if (showOrHide === "show") {
            background.style.display = "block";
            setTimeout(() => {
                background.style.opacity = 1;
                modal.style.top = document.documentElement.scrollTop + 50 + "px";
                background.addEventListener("click", event => {
                    eventModal("hide")
                });
                hideModalBtn.addEventListener("click", event => {
                    eventModal("hide")
                });
            }, 100);
        } else {
            background.style.opacity = 0;
            modal.style.top = "-200vh";
            modal.innerHTML = "";
            setTimeout(() => {
                background.style.display = "none";
            }, 100);
        }
    }
}