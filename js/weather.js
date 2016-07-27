$(document).ready(function () {
    var options = {
        url: "data/city.list.json",
        getValue: "name",
        list: {
            match: {
                enabled: true
            }
        }

    };
       $('#two').hide();
    $("#srch-term").easyAutocomplete(options);
    //Get Url Params
    var urlParams;
    (window.onpopstate = function () {
        var match,
            pl = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query = window.location.search.substring(1);

        urlParams = {};
        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);
    })();
    getWeatherNow(urlParams["srch-term"]);

});


function getWeatherNow(searchObj) {
    var position = { latitude: '', longitude: '' };
    var query;
    if (!searchObj) {
        geoloc(success, fail);
        function geoloc(success, fail) {
            var is_echo = false;
            if (navigator && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function (pos) {
                        if (is_echo) { return; }
                        is_echo = true;
                        success(pos.coords.latitude, pos.coords.longitude);

                    },
                    function () {
                        if (is_echo) { return; }
                        is_echo = true;
                        fail();
                    }
                );
            } else {
                fail();
            }
        }

        function success(lat, lng, query) {
            query = 'lat=' + lat + '&lon=' + lng;
            weatherNow(query);
            forcast(query);
        }
        function fail() {
            alert("Location is disabled");
        }
    } else {
        query = 'q=' + searchObj;
        weatherNow(query);
        forcast(query);

    }


    function weatherNow(query) {

        $.ajax({
            url: 'http://api.openweathermap.org/data/2.5/weather?' + query + '&units=metric&appid=0a05d5c30967b3cca4db61408d3eb63c',
            method: 'GET',
            success: function (data) {
             
               ko.applyBindings(new weatherModel(data),  document.getElementById('one'));

            },
            error: function (err) {
                $('#content').text('Error');
            }
        })

    }
    function forcast(query) {
        $.ajax({
            url: 'http://api.openweathermap.org/data/2.5/forecast?' + query + '&units=metric&appid=0a05d5c30967b3cca4db61408d3eb63c',
            method: 'GET',
            success: function (data) {
              var dataS = data.list;
                console.log(dataS);
                var vmFm = new forecastModel()  ;
                ko.applyBindings(vmFm , document.getElementById('two'));
                vmFm.adddata(dataS);
            },
            error: function (err) {
                $('#content').text('Error');
            }
        })
    }


}

function weatherModel(data) {
   var self = this;
    self.temp = Math.round(data.main.temp);
    self.weather = data.weather[0].main;
    self.city = data.name;
    self.country = data.sys.country;
    self.tempMax = Math.round(data.main.temp_max);
    self.tempMin = Math.round(data.main.temp_min);
    self.url = 'http://openweathermap.org/img/w/' + data.weather[0].icon + '.png';
    self.speed = data.wind.speed;
    self.pressure = data.main.pressure;
    self.sunset = moment.unix(data.sys.sunset).format('HH:mm');
    self.sunrise = moment.unix(data.sys.sunrise).format('HH:mm');
}
function WeatherForcastModel(item) {
      var self = this;

      self.temp =ko.observable( (item.main ?Math.round( item.main.temp) : '')),
      self.weather =ko.observable( item.weather ?item.weather[0].description : ''),
      self.url =ko.observable( 'http://openweathermap.org/img/w/' + (item.weather ? item.weather[0].icon : '')+ '.png'),
      self.speed = ko.observable( (item.wind ? item.wind.speed : '') + ' m/s'),
      self.dt_txt =ko.observable( item.dt? moment(item.dt_txt + 'Z').format('HH:mm DD/MM/YY ') : '')

}

function forecastModel() {
    var self = this;
    self.list = ko.observableArray([]);
    self.adddata = function (data) {
        $.each(data, function (index, item) {
      
              self.list.push(new WeatherForcastModel(item));
        });
    }
}
