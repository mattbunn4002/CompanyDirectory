let pageNumber;
let allEntries;
let sortType;
let subtitleType;
let visibleEntries = [];
let departments;
let locations;
let clickEventsBound = false;

$('#entryList').addClass('ui-alt-icon');

$("#searchAreaBtn").on("click", () => {
    $("#searchArea").slideToggle(200);
});

$("#searchName").on("input", () => {
    searchFilter($("#searchName").val().toLowerCase(), $("#searchLocation").val().toLowerCase(), $("#searchDepartment").val().toLowerCase());
});

$("#searchLocation").on("input", () => {
    searchFilter($("#searchName").val().toLowerCase(), $("#searchLocation").val().toLowerCase(), $("#searchDepartment").val().toLowerCase());
});

$("#searchDepartment").on("input", () => {
    searchFilter($("#searchName").val().toLowerCase(), $("#searchLocation").val().toLowerCase(), $("#searchDepartment").val().toLowerCase());
});

function getDepByID(depID) {
    let depName;
    $.ajax({
        url: "libs/php/getDepartmentByID.php",
        type: "GET",
        dataType: "json",
        async: false,
        data: {
            depID: depID
        },
        success: function(result) {
            
            if (result["status"]["name"] == "ok") {
                depName = result["data"][0]["name"];
                
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
    return depName;
}

function getLocByID(locID) {
    let locName;
    $.ajax({
        url: "libs/php/getLocationByID.php",
        type: "GET",
        dataType: "json",
        async: false,
        data: {
            locID: locID
        },
        success: function(result) {
            if (result["status"]["name"] == "ok") {
                locName = result["data"][0]["name"];
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
    return locName;
}




function departmentHasDependencies(depID) {
    
    let departmentName = getDepByID(depID);
    
    let response = false;
    allEntries["data"].forEach((entry) => {
        
        if (entry["department"] == departmentName) {
            response = true;
        }
    });
    
    return response;
}

function locationHasDependencies(locID) {

    let locationName = getLocByID(locID);
    let response = false;

    allEntries["data"].forEach((entry) => {
        if (entry["location"] == locationName) {
            response = true;
        }
    });

    return response;
}






function searchFilter(nameFilter, locationFilter, departmentFilter) {
    let entriesToRemove = [];
    visibleEntries.forEach((entry) => {
        if ((!(entry["lastName"].toLowerCase().includes(nameFilter) || entry["firstName"].toLowerCase().includes(nameFilter))) || (!entry["location"].toLowerCase().includes(locationFilter)) || (!entry["department"].toLowerCase().includes(departmentFilter))) { 
            entriesToRemove.push(entry);        //Adds a visible entry that doesn't include all search strings to a list of entries to be removed.
        }
    })
    entriesToRemove.forEach((entry) => {                //Loop that removes all visible entries that should be removed.
        let index = visibleEntries.indexOf(entry);  
        visibleEntries.splice(index, 1);
    })

    allEntries["data"].forEach((entry) => {   //Makes entries that match all search criteria visible.
        if ((entry["lastName"].toLowerCase().includes(nameFilter) || entry["firstName"].toLowerCase().includes(nameFilter)) && entry["location"].toLowerCase().includes(locationFilter) && entry["department"].toLowerCase().includes(departmentFilter)) {
            if (!visibleEntries.includes(entry)) {
                visibleEntries.push(entry);
            }
        }
    })
    
    if (locationFilter == "" && departmentFilter != "") {
        subtitleType = "department";
    } else if (locationFilter != "" && departmentFilter == "") {
        subtitleType = "location";
    }

    sortEntries();
    updatePersonnelEntries();
}



function updatePage(direction) { //Updates page num variable, changes display of left page btn if needed, and changes displayed page number.
    
    if (direction == "right") {
        
        if (pageNumber <= (visibleEntries.length / 26)) { //Prevents page increasing to a page with no entries
            pageNumber += 1;
        }
    } else if (direction =="left") {
        pageNumber -= 1;
        if (pageNumber < 1) {
            pageNumber = 1;
        }
    }
    if (pageNumber != 1) {
        $("#pageLeftBtn").css("display", "inline-block");
    } else {
        $("#pageLeftBtn").css("display", "none");
    }

    $("#pageNumberDisplay").html("Page " + pageNumber);
}

function sortEntries() {
    if (sortType == "name") {
        visibleEntries.sort(function compare(entryOne, entryTwo) {
            return entryOne["lastName"].localeCompare(entryTwo["lastName"]);
        });
        updatePersonnelEntries();
    } 
    else if (sortType =="location") {
        visibleEntries.sort(function compare(entryOne, entryTwo) {
            return entryOne["location"].localeCompare(entryTwo["location"]);
        });
        updatePersonnelEntries();
    }
    else if (sortType == "department") {
        visibleEntries.sort(function compare(entryOne, entryTwo) {
            return entryOne["department"].localeCompare(entryTwo["department"]);
        });
        updatePersonnelEntries();
    }
}

$("#pageLeftBtn").on("click", (e) => {
    updatePage("left");
    updatePersonnelEntries();
})

$("#pageRightBtn").on("click", (e) => {
    updatePage("right");
    updatePersonnelEntries();
})

$("#nameFormat").on("change", (e) => {
    updatePersonnelEntries();
})

$("#sortBy").on("change", (e) => {
    if ($("#sortBy").val() == "department") { //Ensures subtitle is changed to department when necessary
        subtitleType = "department";
    } else {
        subtitleType = "location"
    }
    sortType = $("#sortBy").val();
    sortEntries();
})






function updatePersonnelEntries() {
    $("#entryList").html("");
    let format="firstLast";
    if ($("#nameFormat").val() == "lastFirst") {
        format = "lastFirst";
    }
    for (let i=0; i < visibleEntries.length; i++) {
        
        if (subtitleType != "department") {
            
            if (format == "lastFirst") {
                
                $("#entryList").append("<li><a href='#employeePanel'><span id='name" + i + "' class='entryName'>" + visibleEntries[i]["lastName"] + ", " + visibleEntries[i]["firstName"] + "</span> <span class='entrySubtitle' id='loc" + i + "'>" + visibleEntries[i]["location"] +"</span></a></li>").listview();
            } else {
                $("#entryList").append("<li><a href='#employeePanel'><span id='name" + i + "' class='entryName'>" + visibleEntries[i]["firstName"] + " " + visibleEntries[i]["lastName"] + "</span> <span class='entrySubtitle' id='loc" + i + "'>" + visibleEntries[i]["location"] +"</span></a></li>");
                
            }
        } 
        else if (subtitleType == "department") {  //Puts the department as the entry subtitles if subtitleType == "department"
            if (format == "lastFirst") {
                $("#entryList").append("<li><a href='#employeePanel'><span id='name" + i + "' class='entryName'>" + visibleEntries[i]["lastName"] + ", " + visibleEntries[i]["firstName"] + "</span> <span class='entrySubtitle' id='loc" + i + "'>" + visibleEntries[i]["department"] +"</span></a></li>");
            } else {
                $("#entryList").append("<li><a href='#employeePanel'><span id='name" + i + "' class='entryName'>" + visibleEntries[i]["firstName"] + " " + visibleEntries[i]["lastName"] + "</span> <span class='entrySubtitle' id='loc" + i + "'>" + visibleEntries[i]["department"] +"</span></a></li>");
            }
        }

    }
    $("#entryList").listview("refresh");


    if (clickEventsBound == false) {
        
        for (let i=0; i < visibleEntries.length; i++) {
            
            $("#name" + i).closest("li").on("click", (e) => {
                
                let targetNameID = $(e.target).closest("li").find("span").attr("id"); //returns nameID eg "name3" 
                let index = parseInt(targetNameID.substring(4)); 
                console.log(index);
                $("#employeePanelName").html(visibleEntries[index]["firstName"] + " " + visibleEntries[index]["lastName"]);
                $("#employeePanelLocation").html(visibleEntries[index]["location"]);
                $("#employeePanelDepartment").html(visibleEntries[index]["department"]);
                $("#employeePanelEmail").html(visibleEntries[index]["email"]);
                $("#personnelID").html(visibleEntries[index]["id"]);
                $("#newFName").attr("value", visibleEntries[index]["firstName"]);
                $("#newLName").attr("value", visibleEntries[index]["lastName"]);
                $("#newEmail").attr("value", visibleEntries[index]["email"]);
                
            })
        }
        clickEventsBound == true;
    }
    
}




$(document).ready( () => {  //On page load:  Need to add code that puts all deps and locs into arrays that feed into the html it needs to.
    pageNumber = 1;
    sortType = "name";
    subtitleType = "location";
    

    $.ajax({            //AJAX call retrieving all records in format {department, email, firstName, jobTitle, lastName, location}.
        url: "libs/php/getAll.php",
        type: "GET",
        dataType: "json",
        data: {
            
            
        },
        success: function(result) {
            
            if (result.status.name == "ok") {
                console.log(result);
                allEntries = result;
                
                allEntries["data"].forEach((entry) => {
                    visibleEntries.push(entry);
                })
                
                updatePersonnelEntries();
   
            }
        }, error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    updatePage(1);

    $.ajax({
        url: "libs/php/getAllDepartments.php",
        type: "GET",
        dataType: "json",
        data: {

        },
        success: function(result) {
            if (result.status.name == "ok") {
                departments = result["data"];
                
                let addDepartmentHTML = "";
                
                for (let i=0; i < result["data"].length; i++) {
                    currentHTML = "<option value=" + "'" + result["data"][i]["id"] + "'" + ">" +  result["data"][i]["name"] + "</option>";
                    addDepartmentHTML += currentHTML;
                }
                
                $("#addDepartmentID").html(addDepartmentHTML);
                $("#addDepartmentID").selectmenu("refresh");
                $("#chooseDep").html(addDepartmentHTML);
                $("#chooseDep").selectmenu("refresh");
                $("#chooseDepToDel").html(addDepartmentHTML);
                $("#chooseDepToDel").selectmenu("refresh");
                $("#newDepID").html(addDepartmentHTML);
                $("#newDepID").selectmenu("refresh");
            }
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })

    $.ajax({
        url: "libs/php/getAllLocations.php",
        type: "GET",
        dataType: "json",
        data: {

        },
        success: function(result) {
            if (result.status.name == "ok") {
                
                locations = result["data"];
                
                for (let i=0; i < 10; i++) {
                    if (result["data"][i]) {
                        $("#addDepartmentLoc" + i).attr("value", result["data"][i]["id"]);  //Fills is locations in choose location area.
                        $("#addDepLabel" + i).html(result["data"][i]["name"]);
                    } else {
                        $("#addDepartmentLoc" + i).css("display", "none"); //Removes checkbox elements that will have no content.
                        $("#addDepLabel" + i).css("display", "none");
                    }
                }
                
                
                let addLocationHTML = "";
                
                for (let i=0; i < locations.length; i++) {
                    currentHTML = "<option value=" + "'" + result["data"][i]["id"] + "'" + ">" + result["data"][i]["name"] + "</option>";
                    addLocationHTML += currentHTML;
                }
                
                $("#newLocID").html(addLocationHTML);
                $("#newLocID").selectmenu("refresh");
                $("#chooseLoc").html(addLocationHTML);
                $("#chooseLoc").selectmenu("refresh");
                $("#chooseLocToDel").html(addLocationHTML);
                $("#chooseLocToDel").selectmenu("refresh");
                



            }
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })

    
});







$('#addDepartmentForm').submit(function(e){    //Runs insertDepartment.php when the form is submitted without navigating to it.
        e.preventDefault();
        $.ajax({
            url: 'libs/php/insertDepartment.php',
            type: 'post',
            data: $('#addDepartmentForm').serialize(),
            success:function(result){
                if (result["status"]["name"] == "ok") {
                    
                    location.reload();
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
});

    
$('#addPersonnelForm').submit(function(e){    
    e.preventDefault();
    $.ajax({
        url: 'libs/php/insertPersonnel.php',
        type: 'post',
        data: $('#addPersonnelForm').serialize(),
        success:function(result){
            if (result["status"]["name"] == "ok") {
                
                location.reload();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
});

$('#addLocationForm').submit(function(e){    
    e.preventDefault();
    $.ajax({
        url: 'libs/php/insertLocation.php',
        type: 'post',
        data: $('#addLocationForm').serialize(),
        success: function(result) {
            if (result["status"]["name"] == "ok") {
                
                location.reload();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
});

$("#editDepartmentForm").submit(function(e){
    e.preventDefault();
    $.ajax({
        url: "libs/php/editDepartment.php",
        type: "post",
        data: $("#editDepartmentForm").serialize(),
        success: function(result) {
            
            if (result["status"]["name"] == "ok") {
                
                location.reload();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
})

$("#editLocationForm").submit(function(e){
    e.preventDefault();
    $.ajax({
        url: "libs/php/editLocation.php",
        type: "post",
        data: $("#editLocationForm").serialize(),
        success: function(result) {
            
            if (result["status"]["name"] == "ok") {
                
                location.reload();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
})

$("#deleteDepartmentForm").submit(function(e) {
    e.preventDefault();
    
    if (departmentHasDependencies($("#chooseDepToDel").val())) {   //Prevents deletion if the department has dependencies.
        $("#deleteDepartmentFailAlert").html("Unable to delete: Department has dependencies");
        
        return;
    }

    $.ajax({
        url: "libs/php/deleteDepartmentByID.php",
        type: "get",
        dataType: "json",
        data: {
            id: $("#chooseDepToDel").val(),
        },
        success: function(result) {
            console.log(result);
            if (result["status"]["name"] == "ok") {
                $("#deleteDepartmentFailAlert").html("");
                location.reload();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
})


$("#deleteLocationForm").submit(function(e) {
    e.preventDefault();

    if (locationHasDependencies($("#chooseLocToDel").val())) {
        $("#deleteLocationFailAlert").html("Unable to delete: Location has dependencies");
        return;
    }

    $.ajax({
        url: "libs/php/deleteLocationByID.php",
        type: "get",
        dataType: "json",
        data: { id: $("#chooseLocToDel").val() },
        success: function(result) {
            
            if (result["status"]["name"] == "ok") {
                $("#deleteLocationFailAlert").html("");
                location.reload();
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
})

$("#editPersonnelForm").submit(function(e) {
    e.preventDefault();

    $.ajax({
        url: "libs/php/editPersonnelByID.php",
        type: "get",
        dataType: "json",
        data: {
            id: $("#personnelID").html(),
            newFName: $("#newFName").val(),
            newLName: $("#newLName").val(),
            newEmail: $("#newEmail").val(),
            newDepID: $("#newDepID").val()
        },
        success: function(result) {
            
            if (result["status"]["name"] == "ok") {
                
                location.reload();
            }
               
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
})

$("#deletePersonnelForm").submit(function(e) {
    e.preventDefault();
    console.log($("#personnelID").html());
    $.ajax({
        url: "libs/php/deletePersonnelByID.php",
        type: "get",
        dataType: "json",
        data: {
            id: $("#personnelID").html()
        },
        success: function(result) {
            console.log(result);
            if (result["status"]["name"] == "ok") {
                location.reload();
            }
               
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
})