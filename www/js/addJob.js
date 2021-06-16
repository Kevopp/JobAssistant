document.addEventListener("deviceready", initialize, false);


function initialize() {
    let currentJobIndex = -1;
    const dbManager = new DBManager;


    function restart(){
        currentJobIndex = -1;
        $("#jobsContainer .jobItem").each(function(){
            $(this).css("background-color", "white");
        });
    }

    function addEvents(){
        document.addEventListener("backbutton", function(event){
            event.preventDefault();
        });

        
        $("#addBtn").on("click", () => {
            restart();

            $(".guiDialogFade").show();
            $("#addJobDialog").show();
        });
        
        
        $("#deleteBtn").on("click", () => {
            if(currentJobIndex === -1){
                navigator.notification.alert("Proszę wybrać miejsce pracy.", ()=>{}, "Ups...", "OK");
            }
            else{
                restart();
                const jobName = $("#jobsContainer .jobItem h2").eq(currentJobIndex).text();
                dbManager.openDatabase(DBManager.DATABASE_NAME);
                dbManager.deleteJobsData(jobName);
                getJobsFromDB();
            }
        });
        
        
        $("#nextBtn").on("click", () => {
            if(currentJobIndex == -1){
                navigator.notification.alert("Proszę wybrać miejsce pracy.", ()=>{}, "Ups...", "OK");
            }
            else{
                const jobName = $("#jobsContainer .jobItem h2").eq(currentJobIndex).text();
                sessionStorage.setItem("jobName", jobName);
                sessionStorage.setItem("firstOpen", false);
                sessionStorage.setItem("menuItem", 0);
                window.location.href = "news.html";
            }
        });


        $("#newJobBtn").on("click", () => {
            const jobLocationInput = $("#jobLocationInput");
            const jobStartInput = $("#jobStartInput");

            if(jobLocationInput.val().length == 0){
                navigator.notification.alert("Proszę wypełnić pola Miejsca pracy oraz Etatu.", ()=>{}, "Ups...", "OK");
            }
            else{
                dbManager.openDatabase(DBManager.DATABASE_NAME);
                dbManager.insertJobsData(jobLocationInput.val(), jobStartInput.val());
                jobLocationInput.val("");
                jobStartInput.val("");
                getJobsFromDB();
                $("#addJobDialog").hide();
                $(".guiDialogFade").hide();
            }
        });


        $("#cancelBtn").on("click", () => {
            $("#addJobDialog").hide();
            $(".guiDialogFade").hide();
        });
    }

    function getJobsFromDB(){
        dbManager.openDatabase(DBManager.DATABASE_NAME);
        dbManager.getJobsData(function(rs){
            const LENGTH = rs.rows.length;
            $("#jobsContainer").empty();

            if(LENGTH > 0){
                for(let i = 0; i < LENGTH; ++i){
                    const item = rs.rows.item(i);
                    $("#jobsContainer").append("<div class='jobItem'><h2>" + item.name + "</h2><p>Data rozpoczęcia: " + item.startDate + "</p>");
                }

                let jobs = $("#jobsContainer .jobItem");

                for(let i = 0; i < LENGTH; ++i){
                    jobs.eq(i).on("click", function(){
                        currentJobIndex = i;
                        jobs.eq(currentJobIndex).css("background-color", "#e3e3e3");
                        
                        for(let j = 0; j < LENGTH; ++j){
                            if(j != currentJobIndex) 
                                jobs.eq(j).css("background-color", "white");
                        }
                    });
                }
            }
        });
    }


    
    if(sessionStorage.getItem("firstOpen") == "0"){
        $(".guiBarContainer").css("display", "flex");
        initializeMenu();
    }
    else{
        $(".guiHeader").css({ margin: "auto" });
    }

    addEvents();
    getJobsFromDB();
}