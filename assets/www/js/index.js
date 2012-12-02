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

    myFriends: [],

    // Application Constructor
    initialize: function() {
        this.bindEvents();
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
                navigator.notification.confirm('Was a real friend or not?', function(found) {
                    if(found == 1){
                        $.ajax({
                            url: 'http://poolmeup.appspot.com/rest/offers/'+callingNumber+'/join',
                            type: 'POST',
                            success: function(data){
                                navigator.notification.alert(data.response, function(){});
                            },
                            error: function(jqXHR, textStatus, errorThrown){
                                navigator.notification.alert("Errore:" + textStatus, function(){});
                            }
                        });

                    }
                }, 'Did you find a ride?', 'Yes, No')
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
                                number = phone.value;
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
        console.info("########");
        console.info(myPhoneNumber);
        console.info("########");

        if(!myPhoneNumber || myPhoneNumber.length == 0) {
            $( "#popupMyPhone" ).popup();
            $( "#popupMyPhone" ).popup('open');
            $('#setMyIp').click(function(){
                myPhoneNumber = $('#myphoneinput').val();
                window.localStorage.setItem("poolmeupmyphone", myPhoneNumber);
            })
            //myphoneinput
        }

        console.info("########");



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
                            '<img src="'+ img +'" />' +
                            '<h3>'+ name +'</h3>' +
                            '<p class="phone">tel. '+driver.phoneNumber + '</p>' +
                            '<p class="veichle">Veicolo '+driver.vehicleType+'</p>' +
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

    getMyFriends: function() {


    },

    initUi: function() {

        var myself = this;
        $('#listFriendsBtn').click(function(){
            console.info("CLICK!");
            console.info(myFriends.length);

        });

        $('#testContacts').click(function(){

             console.log("***************");
            $.mobile.loading( 'show', {
                text: 'Loading friends list',
                textVisible: true,
                theme: 'c',
                html: ""
            });

//             var options = new ContactFindOptions();
//             options.filter="dariotta";
//             options.multiple=true;
//             var fields = ["displayName", "name", "phoneNumbers", "photos"];
//             navigator.contacts.find(fields,
//             function(contacts){
//                 for (var i=0; i<contacts.length; i++) {
//                     console.log("Display Name = " + contacts[i].displayName);
//
//                     var phoneNumbers = contacts[i].phoneNumbers;
//                     if(phoneNumbers && phoneNumbers.length>0){
//                         $.each(phoneNumbers, function(indx, phone){
//                            console.info(phone.type + ':' + phone.value);
//                         });
//                     }
//
//                     console.info(contacts[i].photos);
//                     console.info(contacts[i].photos.length);
//                     var photos = contacts[i].photos;
//                     if(photos && photos.length > 0) {
//                         $.each(photos, function(indx, photo){
//                             console.info("***")
//                             console.info(JSON.stringify(photo));
//                         });
//                     }
//                 }
//             },
//             function(error) {
//                 console.log(error);
//                 console.log(error.message);
//             }, options);


             console.log("***************");

        });



        var myself = this;
        $('#loadDrivers').click(function(){

            var drivers = [{
                name: 'Minni',
                phoneNumber:"3397323027",
                vehicleType:"car",
                waitingTime:"35"
            },{
                name: 'Minni',
                phoneNumber:"+393397323027",
                vehicleType:"motorino",
                waitingTime:"75"
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

            myself.showDriverList(drivers);



        });
    },

    getContacts: function() {

    }

};
