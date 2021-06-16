document.addEventListener("deviceready", initialize, false);


function initialize(){
    let currentJobHoursIndex = -1;
    let method = null;
    let itemEditID = null;
    const nameInput = $("#hoursNameInput");
    const hoursInput = $("#hoursInput");
    const minutesInput = $("#minutesInput");
    const colorInput = $("#colorInput");
    const dbManager = new DBManager;

    function restart() {
        currentJobHoursIndex = -1;
        $("#jobHoursContainer .jobHoursItem").each(function() {
            $(this).css("background-color", "white");
        });
    }

    function addEvents() {
        document.addEventListener("backbutton", function(event){
            event.preventDefault();
        });


        $("#addBtn").on("click", () => {
            restart();
            method = "add";
            $("#addHoursBtn").html("Dodaj");
            $(".guiDialogFade").show();
            $("#addJobHoursContainer").show();
        });


        $("#deleteBtn").on("click", () => {
            if(currentJobHoursIndex === -1){
                navigator.notification.alert("Proszę wybrać godziny pracy przed usunięciem.", ()=>{}, "Ups...", "OK");
            }
            else{
                const jobHoursName = $("#jobHoursContainer .jobHoursItem h2").eq(currentJobHoursIndex).text();
                dbManager.openDatabase(DBManager.DATABASE_NAME);
                dbManager.deleteJobHoursData(jobHoursName);
                getJobHours();
                restart();
            }
        });


        $("#editBtn").on("click", () => {
            if(currentJobHoursIndex === -1){
                navigator.notification.alert("Proszę wybrać godziny pracy przed edycją.", ()=>{}, "Ups...", "OK");
            }
            else{
                dbManager.openDatabase(DBManager.DATABASE_NAME);
                dbManager.getJobHoursData(function(rs){
                    const item = rs.rows.item(currentJobHoursIndex);
                    const parseTime = item.jobTime.split(".");
                    itemEditID = item.ID;
                    nameInput.val(item.name);
                    hoursInput.val(parseTime[0]);
                    minutesInput.val(parseTime[1]);
                    colorInput.val(item.color);
                });

                method = "edit";
                $("#addHoursBtn").html("Zapisz");
                $(".guiDialogFade").show();
                $("#addJobHoursContainer").show();
            }
        });


        $("#addHoursBtn").on("click", () => {
            if(nameInput.val().length == 0 || hoursInput.val().length == 0 || minutesInput.val().length == 0){
                navigator.notification.alert("Proszę podać godziny pracy.", ()=>{}, "Ups...", "OK");
            }
            else if(hoursInput.val() > 24 || minutesInput.val() > 59){
                navigator.notification.alert("Maks. ilość godzin to 24\nMaks. ilość minut to 59.", ()=>{}, "Ups...", "OK");
            }
            else if(colorInput.val() == "#ffffff"){
                navigator.notification.alert("Proszę wybrać inny kolor niż biel.", ()=>{}, "Ups...", "OK");
            }
            else{
                const timeResult = hoursInput.val() + "." + minutesInput.val();
                dbManager.openDatabase(DBManager.DATABASE_NAME);

                if(method == "add"){
                    dbManager.insertJobHoursData(nameInput.val(), colorInput.val(), timeResult);
                }
                else if(method == "edit"){
                    dbManager.updateJobHoursData(itemEditID, nameInput.val(), colorInput.val(), timeResult);
                }

                nameInput.val("");
                hoursInput.val("");
                minutesInput.val("");
                colorInput.val("#ff0000");
                $(".guiDialogFade").hide();
                $("#addJobHoursContainer").hide();
                getJobHours();
            }
        });


        $("#cancelBtn").on("click", () => {
            $(".guiDialogFade").hide();
            $("#addJobHoursContainer").hide();
        });
    }   

    function getJobHours() {
        dbManager.openDatabase(DBManager.DATABASE_NAME);
        dbManager.getJobHoursData(function(rs) {
            const LENGTH = rs.rows.length;
            $("#jobHoursContainer").empty();

            if(LENGTH > 0){
                for(let i = 0; i < LENGTH; ++i){
                    const item = rs.rows.item(i);
                    const parseTime = item.jobTime.split(".");
                    const hours = parseTime[0] < 10 ? "0" + parseTime[0] : parseTime[0];
                    const minutes = parseTime[1] < 10 ? "0" + parseTime[1] : parseTime[1];
                    
                    $("#jobHoursContainer").append("<div class='jobHoursItem'>" +
                                                        "<div>" +
                                                            "<h2>" + item.name + "</h2>" +
                                                            "<p>Czas pracy: " + hours + ":" + minutes + "</p>" +
                                                        "</div>" +

                                                        "<div class='jobHoursColor' style=background-color:" + item.color + "></div>" +
                                                    "</div>");
                }

                $("#jobHoursContainer").append("<div style='width: 100%; height: 150px;'></div>");

                let jobHours = $("#jobHoursContainer .jobHoursItem");

                for(let i = 0; i < LENGTH; ++i){
                    jobHours.eq(i).on("click", function(){
                        currentJobHoursIndex = i;
                        jobHours.eq(currentJobHoursIndex).css("background-color", "#e3e3e3");

                        for(let j = 0; j < LENGTH; ++j){
                            if(j != currentJobHoursIndex) 
                                jobHours.eq(j).css("background-color", "white");
                        }
                    });
                }
            }
        });
    }



    initializeMenu();
    addEvents();
    getJobHours();
}