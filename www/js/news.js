document.addEventListener("deviceready", initialize, false);


function initialize(){
    const jobName = sessionStorage.getItem("jobName");
    const dbManager = new DBManager;
    const months = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
    let currentJobMonths = [];
    let monthLabels = [];
    let monthSums = [];
    let jobFullTime = 0;
    let currentMonthIndex = null;

    function addEvents() {
        document.addEventListener("backbutton", function(event){
            event.preventDefault();
        });
    }


    function calculateCircle() {
        if(monthSums.length != 0){
            if(jobFullTime == 0) 
                jobFullTime = 100;

            let heightPercent = Math.floor((monthSums[0] * 100) / jobFullTime);
            let heightResult = 100 - heightPercent;
            console.log(jobFullTime);

            if(heightPercent > 100) 
                heightResult = 0;

            $("#hoursCountHeader").css("font-size", "20vw");
            $("#hoursCountHeader").text(monthSums[0]);
            $("#currentMonthHeader").text(currentMonth);
            $("#gradientBackground").css("clip-path", "polygon(0 " + heightResult + "%, 100% " + heightResult + "%, 100% 100%, 0 100%)");
            initializeChart();
        }
        else{
            $("#hoursCountHeader").text("Brak danych");
            $("#currentMonthHeader").text("Brak danych");
        }
    }


    function initializeChart() {
        const ctx = document.getElementById("jobHoursChart").getContext("2d");
        const myChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: monthLabels,
                datasets: [{
                    label: "Ilość godzin",
                    data: monthSums,
                    backgroundColor: ["rgb(79, 212, 232)"],
                    borderRadius: 10
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: "Wykres Ilości Godzin"
                    }
                },
            }
        });

        $("#jobHoursChart").show();
    }


    function getDataFromDB() {
        dbManager.openDatabase(DBManager.DATABASE_NAME);
        dbManager.getTables(function(rs) {
            const LENGTH = rs.rows.length;

            for(let i = 0; i < LENGTH; ++i){
                const table = rs.rows.item(i);

                if(table.name.search(jobName) != -1)
                    currentJobMonths.push(table.name);
            }
        });
    }


    function splitData() {
        dbManager.openDatabase(DBManager.DATABASE_NAME);
        const MONTH_TABLES_LENGTH = currentJobMonths.length > 5 ? 5 : currentJobMonths.length;
        currentJobMonths.reverse();

        if(MONTH_TABLES_LENGTH > 0){
            for(let i = 0; i < MONTH_TABLES_LENGTH; ++i){
                const splitTableName = currentJobMonths[i].split("_");

                monthLabels.push(splitTableName[2] + "-" + splitTableName[1]);
                dbManager.getMonthData(splitTableName[1] + "_" + splitTableName[2], function(mRs){
                    const MONTH_LENGTH = mRs.rows.length;
                    let sumHours = 0;
                    let sumMinutes = 0;

                    for(let j = 0; j < MONTH_LENGTH - 1; ++j){
                        const item = mRs.rows.item(j);

                        if(item.jobTime != "0"){
                            const parseTime = item.jobTime.split(".");
                            sumHours += parseInt(parseTime[0]);
                            sumMinutes += parseFloat(parseTime[1]);
                        }

                        if(sumMinutes > 59){
                            sumHours += Math.floor(sumMinutes / 60);
                            sumMinutes %= 60;
                        }
                    }

                    monthSums.push(sumHours + sumMinutes);
                });
            }
                
            const splitTableName = currentJobMonths[0].split("_");
            const currentMonthIndex = parseInt(splitTableName[2]) - 1;
            currentMonth = months[currentMonthIndex] + " " + splitTableName[1];
            
            dbManager.getMonthData(splitTableName[1] + "_" + splitTableName[2], function(mRs){
                const MONTH_LENGTH = mRs.rows.length;
                const item =  mRs.rows.item(MONTH_LENGTH - 1);
                jobFullTime = item.jobTime;
            });
        }
    }
    

    initializeMenu();
    addEvents();
    getDataFromDB();
    
    setTimeout(() => { 
        splitData(); 
    }, 500);

    setTimeout(() => { 
        $("#jobFullTimePar").text("Etat: " + jobFullTime);
        calculateCircle();
    }, 1000);
}