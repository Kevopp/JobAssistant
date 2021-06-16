function initializeMenu() {
    const menuContainer = $("#menuContainer");
    let menuOpened = false;

    menuContainer.append("<h2 style='margin: auto; margin-top: 20px; margin-bottom: 10px;'>Menu</h2>" +
                         "<div class='guiDialogLine' style='margin-top: 10px; margin-bottom: 10px;'></div>" + 
                         "<p>Aktualności</p>" +
                         "<p>Miejsca pracy</p>" +
                         "<p>Kalendarz</p>" +
                         "<p>Godziny pracy</p>" + 
                         "<p id='closeMenuBtn' class='guiButton'>Zamknij</p>");



    $(".guiBarContainer:first-child").on("click", () => {
        menuContainer.animate({ left: "0" });
        menuOpened = true;
    });

    $("#closeMenuBtn").on("click", () => {
        menuContainer.animate({ left: "-100%" });
        menuOpened = false;
    });

    document.addEventListener("backbutton", function(){
        if(menuOpened){
            menuContainer.animate({ left: "-100%" });
            menuOpened = false;
        }
    });



    const menuItems = $("#menuContainer p:not(#closeMenuBtn)");
    const LENGTH = menuItems.length;
    let currentMenuItem = parseInt(sessionStorage.getItem("menuItem"));
    menuItems.eq(currentMenuItem).css("background-color", "#e3e3e3");
    
    for(let i = 0; i < LENGTH; ++i){
        menuItems.eq(i).on("click", function(){
            if(i != currentMenuItem){
                currentMenuItem = i;
                menuItems.eq(currentMenuItem).css("background-color", "#e3e3e3");

                for(let j = 0; j < LENGTH; ++j){
                    if(j != currentMenuItem) 
                        menuItems.eq(j).css("background-color", "white");
                }

                menuContainer.animate({ left: "-100%" }, "slow", () => {
                    sessionStorage.setItem("menuItem", currentMenuItem);

                    switch(currentMenuItem){
                        case 0: window.location.href = "news.html"; break;
                        case 1: sessionStorage.setItem("firstOpen", 0); window.location.href = "addJob.html"; break;
                        case 2: window.location.href = "calendar.html"; break;
                        case 3: window.location.href = "jobHours.html"; break;
                    }
                });
            }
        });
    }
}