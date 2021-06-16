document.addEventListener("deviceready", initialize, false);

function initialize() {
    let currentMarkerIndex = null;
    let currentJobTime = null;
    let currentColor = null;
    const dateInput = $("#dateInput");
    const calendarContainer = $("#calendarContainer");
    const dbManager = new DBManager;
    const activeDays = [];
    const markersData = [];

    function getJobHours() {
        const jobHoursContainer = $("#jobMarkersContainer");
        jobHoursContainer.empty();

        dbManager.openDatabase(DBManager.DATABASE_NAME);
        dbManager.getJobHoursData(function(rs){
            const LENGTH = rs.rows.length;

            if(LENGTH > 0){
                for(let i = 0; i < LENGTH; ++i){
                    const item = rs.rows.item(i);
                    const parseTime = item.jobTime.split(".");
                    const hours = parseTime[0] < 10 ? "0" + parseTime[0] : parseTime[0];
                    const minutes = parseTime[1] < 10 ? "0" + parseTime[1] : parseTime[1];
                    markersData.push({ jobTime: item.jobTime, color: item.color });

                    jobHoursContainer.append("<div class='hoursMarkerItem'>" +
                                                "<p>" + item.name + "</p>" +
                                                "<div class='jobHoursColor' style='background-color:" + item.color + "'>" + hours + ":" + minutes + "</div>" +
                                             "</div>");
                }

                let markers = $("#jobMarkersContainer .hoursMarkerItem");
                let markersColor = $("#jobMarkersContainer .hoursMarkerItem .jobHoursColor");

                for(let i = 0; i < markers.length; ++i){
                    markers.eq(i).on("click", function(){
                        currentMarkerIndex = i;
                        markersColor.eq(currentMarkerIndex).css("border", "2px solid rgb(79, 212, 232)");

                        for(let j = 0; j < markers.length; ++j){
                            if(j != currentMarkerIndex)
                                markersColor.eq(j).css("border", "unset");
                        }

                        dbManager.openDatabase(DBManager.DATABASE_NAME);
                        dbManager.getJobHoursData(function(rs){
                            const item = rs.rows.item(currentMarkerIndex);
                            currentJobTime = item.jobTime;
                            currentColor = item.color;
                        });
                    });
                }

                jobHoursContainer.css("margin-bottom", "10px");
            }
            else {
                jobHoursContainer.append("<h2 style='margin: auto;'>Brak godzin</h2>");
            }
        });
    }


    function calculateSumHours() {
        let sumHours = 0;
        let sumMinutes = 0;

        for(let day of activeDays){
            if(day.active){
                const parseTime = day.jobTime.split(".");
                sumHours += parseInt(parseTime[0]);
                sumMinutes += parseFloat(parseTime[1]);
            } 

            if(sumMinutes > 59){
                sumHours += Math.floor(sumMinutes / 60);
                sumMinutes %= 60;
            }
        }

        $("#hoursSum").text("Łącznie godzin: " + sumHours);
        $("#minutesSum").text("Łącznie minut: " + sumMinutes);
    }
    

    function addEvents() {
        $("#searchDateBtn").on("click", () => {
            if(dateInput.val().length != 0){
                $("#calendarContainer p").remove();

                const date = new Date(dateInput.val());
                const startDayInMonth = date.getDay();
                const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() + 1;
                let daysOffset = null;
            
                startDayInMonth === 0 ? daysOffset = 6 : daysOffset = startDayInMonth - 1;

                for(let i = 0; i < daysOffset; ++i){
                    calendarContainer.append("<p></p>");
                }
            
                for(let i = 1; i < daysInMonth; ++i){
                    calendarContainer.append("<p class='days'>" + i + "</p>");
                    activeDays.push({
                        active: false,
                        jobTime: 0
                    });
                }

                let calendarDays = $("#calendarContainer .days");

                for(let i = 0; i < calendarDays.length; ++i){
                    calendarDays.eq(i).on("click", function(){
                        if(currentMarkerIndex != -1){
                            if(!activeDays[i].active){
                                $(this).css("background-color", currentColor);
                                activeDays[i].active = true;
                                activeDays[i].jobTime = currentJobTime;
                            }
                            else{
                                $(this).css("background-color", "white");
                                activeDays[i].active = false;
                                activeDays[i].jobTime = 0;
                            }
                        
                            calculateSumHours();
                        }
                    });
                }

                getJobHours();

                dbManager.openDatabase(DBManager.DATABASE_NAME);
                dbManager.getMonthData(dateInput.val(), function(rs){
                    const LENGTH = rs.rows.length;

                    if(LENGTH > 0){
                        for(let i = 0; i < LENGTH - 1; ++i){
                            const item = rs.rows.item(i);
                            console.log(item);

                            if(item.jobTime != "0"){
                                const foundedItem = markersData.find(element => element.jobTime == item.jobTime);

                                calendarDays.eq(i).css("background-color", foundedItem.color);
                                activeDays[i].active = true;
                                activeDays[i].jobTime = item.jobTime;
                            }
                            else{
                                calendarDays.eq(i).css("background-color", "white");
                                activeDays[i].active = false;
                                activeDays[i].jobTime = 0;
                            }
                        }

                        $("#jobFullTimeInput").val(rs.rows.item(LENGTH - 1).jobTime);
                        calculateSumHours();
                    }
                });

                $("#monthContainer").show();
            }
            else
                navigator.notification.alert("Proszę wybrać miesiąc pracy.", ()=>{}, "Ups...", "OK");
        });


        $("#saveMonthBtn").on("click", function(){
            let jobFullTimeValue = $("#jobFullTimeInput").val();
            dbManager.openDatabase(DBManager.DATABASE_NAME);
            
            if(jobFullTimeValue.length == 0)
                jobFullTimeValue = 0;

            dbManager.createOrUpdateMonthTable(dateInput.val(), activeDays, jobFullTimeValue);
        });
    }



    initializeMenu();
    addEvents();
    calculateSumHours();
}