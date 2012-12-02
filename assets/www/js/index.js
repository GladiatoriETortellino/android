/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    savedCO2: 0,

    // Application Constructor
    initialize: function() {
        this.bindEvents();
        var self = this;
        $(document).ajaxError(function(event, request, settings, exception) {
            console.warn("ERRORE AJAX");
            console.warn(settings.url);
            self.showDialog("Network error", "Error connecting to "+settings.url);
        });

        this.initUi();
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        document.addEventListener('resume', function() {

            if(callingNumber && callingNumber.length > 0) {
                navigator.notification.confirm('Was he/she a true friend?', function(found) {
                    if(found == 1){
                        $.ajax({
                            url: 'http://poolmeup.appspot.com/rest/offers/'+callingNumber+'/join',
                            type: 'POST',
                            success: function(data){
                                navigator.notification.alert(data.response, function(){
                                    $.mobile.changePage("#rideFound");
                                    $('#earnedPoints').text(savedCO2);
                                });
                            },
                            error: function(jqXHR, textStatus, errorThrown){
                                navigator.notification.alert("Errore:" + textStatus, function(){});
                            }
                        });

                    }
                }, 'Did he/she accept?', 'Yes, No')
            }

        }, false);

        // Load friends list
        $.mobile.loading( 'show', {
            text: 'Loading friends list',
            textVisible: true,
            theme: 'c',
            html: ""
        });

        var options = new ContactFindOptions();
        options.filter = "";
        options.multiple = true;
        var fields = ["displayName", "phoneNumbers"];
        navigator.contacts.find(fields,
            function(contacts){

                for (var i=0; i<contacts.length; i++) {
                    var name = contacts[i].displayName;
                    var number = "";
                    var phoneNumbers = contacts[i].phoneNumbers;
                    if(phoneNumbers && phoneNumbers.length>0){
                        $.each(phoneNumbers, function(indx, phone){
                            if(phone.type == 'mobile') {
                                number = phone.value.replace('+39');
                                return false;
                            }
                        });
                    }

                    if(name && name.length>0 && number && number.length > 0) {
                        myFriends.push({
                            name: name,
                            phoneNumber: number
                        });
                    }

                }
                $.mobile.loading( 'hide' );
            },
            function(error) {
                $.mobile.loading( 'hide' );
                console.log(error);
                console.log(error.message);
            }, options
        );

            // Check for user phone number
        var myPhoneNumber =  window.localStorage.getItem("poolmeupmyphone");
        myPhoneNumber = "";
        if(!myPhoneNumber || myPhoneNumber.length == 0) {
            $.mobile.changePage("#popupMyPhone");
            $('#setMyIp').click(function(){
                myPhoneNumber = $('#myphoneinput').val();
                window.localStorage.setItem("poolmeupmyphone", myPhoneNumber);
                $.mobile.changePage("#index");
            })
        }

//            console.log("in getMyPhoneNumber");
//            var onSuccess = function(result) {
//                console.log("My phone number: " + result.phoneNumber);
//            }
//            var onError = function(err) {
//                console.log("Could not get my phone number: " + err);
//            }
//            MyPhoneNumberPlugin.getMyPhoneNumber(onSuccess, onError);
    },


    /**
     * Show a list of Contacts, When an element of the list is pressed, a phoneCall is
     * done to the selected contact.
     * Get in input a list of drivers, and use the phoneNumber to get the photo from the addressBook
     * @param drivers
     */
    showDriverList: function(drivers) {

        var myself = this;

        var ul = $('#driversListUl');
        ul.empty();

        $.mobile.changePage($('#driversListPage'));

        ul.listview();

        var fields = ["displayName", "name", "phoneNumbers", "photos"];
        $.each(drivers, function(indx, driver){

//            console.info("Processo " + driver.phoneNumber);

            var options = new ContactFindOptions();
            options.filter= driver.phoneNumber;
            options.multiple=false;

            navigator.contacts.find(fields,
                function(contacts) {

                    for (var i=0; i<contacts.length; i++) {

//                        console.info("Trovato uno");

                        var number = "";
                        var name = "";
                        var img = "/img/noUserImg.png";

                        // FIXME Per ora visualizzo solo i contatti che hanno un telefono registrato come mobile
                        var phoneNumbers = contacts[i].phoneNumbers;
                        if(phoneNumbers && phoneNumbers.length>0){
                            $.each(phoneNumbers, function(indx, phone){
                                if(phone.type == 'mobile') {
                                    number = phone.value;
                                    return false;
                                }
                            });
                        }

                        if(number.length == 0 ) {
                            console.warn("Non ho trovato il numero in rubrica per " + contacts[i].phoneNumbers)
                            return;
                        }

                        name = contacts[i].displayName;
                        if(name.length == 0){
                            name = contacts[i].name;
                        }

                        var photos = contacts[i].photos;
                        if(photos && photos.length > 0) {
                            $.each(photos, function(indx, photo){
                                if(photo.value && photo.value.length > 0) {
                                    img = photo.value;
                                }
                            });
                        }

                        console.info(img);
//                        console.info("Aggiungo " + name + " con foto " + img);
                        var li = '<li phone="'+driver.phoneNumber+'" id="phone_'+name+'">' +
                            '<a href="#">' +
                            '<img src="'+ img +'" onerror="this.src=\'img/noUserImg.png\'"/>' +
                            '<h3>'+ name +'</h3>' +
//                            '<p class="phone">tel. '+driver.phoneNumber + '</p>' +
                            '<p class="veichle">'+driver.vehicleType+'</p>' +
                            '</a>' +
                            '</li>';
                        ul.append(li);
                        ul.listview('refresh');

                        $('#phone_' + name).click(function(){
                            var me = $(this);
                            console.info(me.attr('phone'));
                            console.info('tel:' + me.attr('phone'));
                            callingNumber = me.attr('phone');
                            console.info(callingNumber);
                            document.location.href = 'tel:' + me.attr('phone');
                        });
                    }

                    $.mobile.loading( 'hide' );
                },
                function(error) {
                    console.log(error);
                    console.log(error.message);
                }, options);


        });

    },

    initUi: function() {

        var self = this;

        $('#listFriendsBtn').click(function(){
            console.info("CLICK!");
            console.info(myFriends.length);

        });


        $("#offerride").click(function() {
            var req = {
                isStartingTime: true,
                maxTreshold: parseInt($("#maxtreshold").val()),
                numberPlaces: parseInt($("#offer-persons").val()),
                pathRequest: [],
                phoneNumber: self.getMyPhone(),
                userName: "Pippo",
                vehicleType: $("#veicolo input:checked").val()
            };
            origine = $("#offer-origine").val(),
                destinazione = $("#offer-destinazione").val();
            if (origine == "" || destinazione == "") {
                self.showDialog("Form Incompleto", "I campi <strong>Origine</strong> e <strong>Destinazione</strong> non possono essere vuoti!");
                return;
            }
            var data = /\d\d\/\d\d\/\d{4} \d\d:\d\d/.exec($("#offer-data").val());
            if (data == null) {
                self.showDialog("Data Invalida", "La data deve essere nel formato <strong>dd/mm/yyyy hh:mm</strong>");
                return;
            }
            req.requestTime = data[0];
            if (self.getCoords("#offer-origine", req) === false) return;
            if (self.getCoords("#offer-destinazione", req) === false) return;
            console.dir(req);
            console.log(JSON.stringify(req));

            var url = "http://poolmeup.appspot.com/rest/offers";
            var idOffer = null;
            $.post(url, req, function(data) {
                idOffer = data.idOffer;
                var s = self.parseXML(data.pathResponse);
                $.mobile.changePage("#viewpath");
                $("#actionlist").append(s).listview("refresh");

                self.timeoutID = setInterval(function() { self.longPolling(idOffer); }, 1000*30);
            });
        });


        $("#findride").click(function() {

            // FIXME DEBUG
            var drivers = [{
                name: 'Minni',
                phoneNumber:"3397323027",
                vehicleType:"car",
                waitingTime:"35"
            },{
                name:"Mariella",
                phoneNumber:"+393337701783",
                vehicleType:"autobus",
                waitingTime:"155"
            },{
                name:"Mariella",
                phoneNumber:"+393394745492",
                vehicleType:"autobus",
                waitingTime:"155"
            }];

            self.showDriverList(drivers);
            savedCO2 = 500;
            return;

            var req = {
                    friends: self.getMyFriends(),
                    numberOfPerson: $("#find-persons").val(),
                    idUtente: self.getMyPhone(),
                    userName: "Pippo",
                    pathRequest: []
                },
                origine = $("#find-origine").val(),
                destinazione = $("#find-destinazione").val();
            if (origine == "" || destinazione == "") {
                self.showDialog("Form Incompleto", "I campi <strong>Origine</strong> e <strong>Destinazione</strong> non possono essere vuoti!");
                return;
            }
            if (self.getCoords("#find-origine", req) === false) return;
            if (self.getCoords("#find-destinazione", req) === false) return;
            console.log(req);
        });

        var d = new Date();
        var now = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes();

        $('#offer-data').val(now);
        $('#find-data').val(now);
    },

    getCoords: function(id, req) {
        var obj = {};
        // var url = "addr.json";
        var url = "http://maps.googleapis.com/maps/api/geocode/json";
        $.get(url, {sensor: false, address: $(id).val()}, function (data) {
            var status = data.status;
            if (status == "ZERO_RESULTS") {
                self.showDialog("Zero Risultati", "L'indirizzo insierito è sconosciuto. Riprovare.");
                return false;
            }
            data = data.results[0];
            $(id).val(data.formatted_address);
            obj.name = data.formatted_address;
            obj.lat = data.geometry.location.lat;
            obj.long = data.geometry.location.lng;
            req.pathRequest.push(obj);
        }, "json");
        return obj;
    },

    showDialog: function(title, message) {
        $("#dialogtitle").text(title);
        $("#dialogmessage").html(message);
        $.mobile.changePage("#dialog");
    },

    ICONS: {
        "Start": "",
        "KeepStraight": "img/direction_up.png",
        "TurnSightlyLeft": "img/direction_upleft.png",
        "TurnLeft": "img/direction_upthenleft.png",
        "TurnRight": "img/direction_upthenright.png",
        "TurnSightlyRight": "img/direction_upright.png",
        "EnterRoundabout": ""
    },
    parseXML: function(url) {
        var self = this;
        var s = "";
        $.get(url, function(data) {
            $.each($("actn", data), function(i, el) {
                var el = $(el);
                var kind = el.attr("kind");
                if (kind != null) {
                    kind = kind.replace("{street}", el.attr("addr")).replace("{dir}", el.attr("dir"));
                    var link = el.parent(),
                        dist = /\d+(?:[.]\d{2})?/.exec(link.attr("dist"))[0],
                        time = /\d+(?:[.]\d{2})?/.exec(link.attr("time"))[0];
                    s += "<li><a href=\"#\"><img src=\""+self.ICONS[el.attr("actc")]+"\">"+
                        "<h3>"+kind+"</h3><p>percorsi "+dist+"m, sono passati "+time+ " secondi</p></a></li>";
                }
            });
        });
        return s;
    },

    longPolling: function(idOffer) {
        var self = this;
        var url = "http://poolmeup.appspot.com/rest/offers/";
        $.get(url+idOffer, function(data) {
            if (data != null && data.pathResponse != null) {
                clearInterval(self.timeoutID);
                self.showDialog("Richiesta trovata", "Il percorso sarà aggiornato!");
                var s = self.parseXML(data.pathResponse);
                $.mobile.changePage("#viewpath");
                $("#actionlist").html(s).listview("refresh");
            }
        });
    },

    getMyFriends: function() {
        return myFriends;
    },

    getMyPhone: function() {
        return window.localStorage.getItem("poolmeupmyphone");
    }

};
