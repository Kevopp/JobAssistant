class DBManager {
    constructor() {
        this.db = null;
    }


    static DATABASE_NAME = "jobAssistant.db";


    openDatabase(databaseName) {
        this.db = window.sqlitePlugin.openDatabase({
            name: databaseName,
            location: "default"
        });
    }


    createJobsTable() {
        this.db.transaction(function(tx){
            tx.executeSql("CREATE TABLE IF NOT EXISTS jobs (ID INTEGER PRIMARY KEY AUTOINCREMENT, name, startDate)");
            tx.executeSql("CREATE TABLE IF NOT EXISTS jobHours (ID INTEGER PRIMARY KEY AUTOINCREMENT, name, color, jobTime)");
            //tx.executeSql("DROP TABLE jobs");
            //tx.executeSql("DROP TABLE jobHours");
        },
        function(error){ console.log("ERROR: " + error.message); },
        function(){ console.log("Jobs table created!"); });
    }


    close() {
        this.db.close(function(){}, function(error){
            console.log("ERROR:" + error.message);
        });
    }


    getTables(callback) {
        this.db.transaction(function(tx){
            tx.executeSql("SELECT name FROM sqlite_master WHERE type='table'", [], function(tx, rs){
                callback(rs);
            });
        }, 
        function(error){ console.log("ERROR: " + error.message) }, 
        function(){});
    }



    //------------------------------------------------------JOBS DATA------------------------------------------------------
    insertJobsData(name, startDate) {
        this.db.transaction(function(tx){
            tx.executeSql("SELECT * FROM jobs WHERE name='" + name + "'", [], function(tx, rs){
                if(rs.rows.length > 0)
                    navigator.notification.alert("Podane miejsce pracy już istnieje.", ()=>{}, "Ups...", "OK");
                else
                    tx.executeSql("INSERT INTO jobs (name, startDate) VALUES (?, ?)", [name, startDate]);
            });
        }, 
        function(error){ console.log(error.message) }, 
        function(){ console.log("Success!"); });
    }


    deleteJobsData(name) {
        this.db.transaction(function(tx){
            tx.executeSql("DELETE FROM jobs WHERE name='" + name + "'");
        }, 
        function(error){ console.log(error.message) }, 
        function(){ console.log("Job deleted successfully"); });
    }


    getJobsData(callback) {
        this.db.transaction(function(tx){
            tx.executeSql("SELECT * FROM jobs", [], function(tx, rs){
                callback(rs);
            });
        }, 
        function(error){ console.log("ERROR:" + error.message); }, 
        function(){});
    }



    //------------------------------------------------------JOBS HOURS DATA------------------------------------------------------
    insertJobHoursData(name, color, hoursCount) {
        this.db.transaction(function(tx){
            tx.executeSql("SELECT * FROM jobHours WHERE name='" + name + "' OR jobTime='" + hoursCount + "'", [], function(tx, rs){
                if(rs.rows.length > 0)
                    navigator.notification.alert("Podany czas pracy już istnieje.", ()=>{}, "Ups...", "OK");
                else
                    tx.executeSql("INSERT INTO jobHours (name, color, jobTime) VALUES (?, ?, ?)", [name, color, hoursCount]);
            });
        }, 
        function(error){ console.log(error.message) }, 
        function(){ console.log("Success!"); });
    }


    updateJobHoursData(id, name, color, hoursCount){
        this.db.transaction(function(tx){
            tx.executeSql("SELECT * FROM jobHours WHERE name='" + name + "'", [], function(tx, rs){
                if(rs.rows.length > 0){
                    const item = rs.rows.item(0);

                    if(item.ID == id)
                        tx.executeSql("UPDATE jobHours SET name=?, color=?, jobTime=? WHERE ID='" + id + "'", [name, color, hoursCount]);
                    else
                        navigator.notification.alert("Podany czas pracy już istnieje.", ()=>{}, "Ups...", "OK");
                }
                else
                    tx.executeSql("UPDATE jobHours SET name=?, color=?, jobTime=? WHERE ID='" + id + "'", [name, color, hoursCount]);
            });
        },
        function(error){ console.log(error.message) },
        function(){ console.log("Job hours data update successfully!"); });
    }


    deleteJobHoursData(name) {
        this.db.transaction(function(tx){
            tx.executeSql("DELETE FROM jobHours WHERE name='" + name + "'");
        }, 
        function(error){ console.log("ERROR:" + error.message) }, 
        function(){ console.log("Job hours deleted successfully"); });
    }


    getJobHoursData(callback) {
        this.db.transaction(function(tx){
            tx.executeSql("SELECT * FROM jobHours", [], function(tx, rs){
                callback(rs);
            });
        }, 
        function(error){ console.log("ERROR:" + error.message); }, 
        function(){});
    }



    //------------------------------------------------------MONTH DATA------------------------------------------------------
    createOrUpdateMonthTable(month, dataArray, jobFullTime) {
        const concatTableName = sessionStorage.getItem("jobName") + "-" + month;
        const tableName = concatTableName.replaceAll("-", "_");

        this.db.transaction(function(tx){
            tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='" + tableName + "'", [], function(tx, rs){
                const LENGTH = rs.rows.length;
                const DATA_LENGTH = dataArray.length;
                let sql = null;

                if(LENGTH > 0){
                    sql = "UPDATE " + tableName + " SET jobTime=? WHERE ID='";

                    for(let i = 0; i < DATA_LENGTH; ++i){
                        if(dataArray[i].active)
                            tx.executeSql(sql + (i + 1) + "'", [dataArray[i].jobTime]);
                        else    
                            tx.executeSql(sql + (i + 1) + "'", [0]);
                    }

                    tx.executeSql(sql + (DATA_LENGTH + 1) + "'", [jobFullTime]);
                    console.log("Table of " + month + " updated successfully");
                    navigator.notification.alert("Pomyślnie zaktualizowano dane.", ()=>{}, "Sukces!", "OK");
                }
                else{
                    tx.executeSql("CREATE TABLE IF NOT EXISTS " + tableName + "(ID INTEGER PRIMARY KEY AUTOINCREMENT, jobTime)");
                    sql = "INSERT INTO " + tableName + " (jobTime) VALUES (?)";

                    for(let i = 0; i < DATA_LENGTH; ++i){
                        if(dataArray[i].active)
                            tx.executeSql(sql, [dataArray[i].jobTime]);
                        else
                            tx.executeSql(sql, [0]);
                    }

                    //Last row in table always be a job full time. If month have 30 days then 31 row is a job full time
                    tx.executeSql(sql, [jobFullTime]); 

                    console.log("Table of " + month + " created successfully");
                    navigator.notification.alert("Pomyślnie utworzono dane.", ()=>{}, "Sukces!", "OK");
                }
                //tx.executeSql("DROP TABLE " + tableName);
            });
        },
        function(error){ console.log("ERROR:" + error.message); },
        function(){});
    }


    getMonthData(month, callback) {
        const concatTableName = sessionStorage.getItem("jobName") + "-" + month;
        const tableName = concatTableName.replaceAll("-", "_");

        this.db.transaction(function(tx){
            tx.executeSql("SELECT * FROM " + tableName, [], function(tx, rs){
                callback(rs);
            });
        }, 
        function(error){ console.log(error.message); }, 
        function(){});
    }
}