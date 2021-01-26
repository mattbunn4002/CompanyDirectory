let sortType;
let nameSearchQuery = "";
let depSearchQuery = "";
let locSearchQuery = "";

$('#entryList').addClass('ui-alt-icon');

$("#searchAreaBtn").on("click", () => {
    $("#searchArea").slideToggle(200);
});

$("#searchName").on("input", () => {
    nameSearchQuery = $("#searchName").val().toLowerCase();
    updatePersonnelEntries();
});

$("#chooseSearchLoc").on("change", () => {
    locSearchQuery = $("#chooseSearchLoc").val().toLowerCase();
    updatePersonnelEntries();
});

$("#chooseSearchDep").on("change", () => {
    depSearchQuery = $("#chooseSearchDep").val().toLowerCase();
    updatePersonnelEntries();
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
    
    let hasDependencies;
    $.ajax({            
        url: "libs/php/getDepartmentDependencies.php",
        type: "GET",
        dataType: "json",
        async: false,
        data: {
            departmentID: depID,
        },
        success: function(result) {
            if (result.status.name == "ok") {
                
                if (!result["data"][0]) {
                    
                    hasDependencies = false;
                    
                    
                } else {
                    
                    hasDependencies = true;
                    
                    
                }
            }
        }, error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    
    return hasDependencies;
}

function locationHasDependencies(locID) {

    let response;
    $.ajax({            
        url: "libs/php/getLocationDependencies.php",
        type: "GET",
        dataType: "json",
        async: false,
        data: {
            locationID: locID,
        },
        success: function(result) {
            if (result.status.name == "ok") {
                if (!result["data"][0]) {
                    response = false;
                } else {
                    response = true;
                }
            }
        }, error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    
    return response;
}



function sortEntries(entries) {
    if (sortType == "name") {
        entries.sort(function compare(entryOne, entryTwo) {
            return entryOne["lastName"].localeCompare(entryTwo["lastName"]);
        });
        
    } 
    else if (sortType =="location") {
        entries.sort(function compare(entryOne, entryTwo) {
            return entryOne["location"].localeCompare(entryTwo["location"]);
        });
        
    }
    else if (sortType == "department") {
        entries.sort(function compare(entryOne, entryTwo) {
            return entryOne["department"].localeCompare(entryTwo["department"]);
        });
        
    }
    return entries;
}



$("#nameFormat").on("change", (e) => {
    updatePersonnelEntries();
})

$("#sortBy").on("change", (e) => {
    
    sortType = $("#sortBy").val();
    updatePersonnelEntries();
})


function updatePersonnelEntries() {
    $("#entryList").html("");
    let format = "firstLast";
    if ($("#nameFormat").val() == "lastFirst") {
        format = "lastFirst";
    }
    $.ajax({            
        url: "libs/php/getPersonnelBySearch.php",
        type: "GET",
        dataType: "json",
        data: {
            nameSearchQuery: nameSearchQuery,
            depSearchQuery: depSearchQuery,
            locSearchQuery: locSearchQuery,
            
        },
        success: function(result) {
            
            if (result.status.name == "ok") {
                
                let i=0;
                result["data"] = sortEntries(result["data"]);

                result["data"].forEach((entry) => { //Loops through filtered and sorted entries 
                    let department;
                    if (entry["department"].length > 14) {
                        department = entry["department"].substring(0, 14) + "...";
                        
                    } else {
                        department = entry["department"];
                    }


                    if (format == "lastFirst") {
                        if (i%2 == 0) {
                            $("#entryList").append("<li class='evenEntry' id='listItem" + i + "'><a href='#employeePanel'><span id='" + entry["id"] + "' class='entryName'>" + entry["lastName"] + ", " + entry["firstName"] + "</span><span class='leftSubtitle'>" + department + "</span><br> <span class='entrySubtitle' >" + entry["location"] +"</span></a></li>");
                        } else {
                            $("#entryList").append("<li class='oddEntry' id='listItem" + i + "'><a href='#employeePanel'><span id='" + entry["id"] + "' class='entryName'>" + entry["lastName"] + ", " + entry["firstName"] + "</span><span class='leftSubtitle'>" + department + "</span><br> <span class='entrySubtitle' >" + entry["location"] +"</span></a></li>");
                        }
                        
                    } else {
                        if (i%2 == 0) {
                            $("#entryList").append("<li class='evenEntry' id='listItem" + i + "'><a href='#employeePanel'><span id='" + entry["id"] + "' class='entryName'>" + entry["firstName"] + " " + entry["lastName"] + "</span><span class='leftSubtitle'>" + department + "</span><br> <span class='entrySubtitle' >" + entry["location"] +"</span></a></li>");  
                        } else {
                            $("#entryList").append("<li class='oddEntry' id='listItem" + i + "'><a href='#employeePanel'><span id='" + entry["id"] + "' class='entryName'>" + entry["firstName"] + " " + entry["lastName"] + "</span><span class='leftSubtitle'>" + department + "</span><br> <span class='entrySubtitle' >" + entry["location"] +"</span></a></li>");
                        }
                        
                    }
                    
                    i++;
                })
                $("#entryList").listview("refresh");

                    for (let i=0; i<result["data"].length; i++) {
                        
                        $("#listItem" + i).on("click", (e) => {
                            
                            let personnelID = $(e.target).closest("li").find("span").attr("id"); //returns personnel ID  
                            
                            $.ajax({            
                                url: "libs/php/getPersonnelByID.php",
                                type: "GET",
                                dataType: "json",
                                data: {
                                    personnelID: personnelID,
                                    
                                },
                                success: function(result) {
                                    
                                    if (result.status.name == "ok") {
                                        let specificEntry = result["data"][0];
                                        $("#employeePanelName").html(specificEntry["firstName"] + " " + specificEntry["lastName"]);
                                        $("#employeePanelName").attr("personnelID", personnelID);
                                        $("#employeePanelLocation").html(specificEntry["location"]);
                                        $("#employeePanelDepartment").html(specificEntry["department"]);
                                        $("#employeePanelEmail").html(specificEntry["email"]);
                                        $("#newFName").attr("value", specificEntry["firstName"]);
                                        $("#newLName").attr("value", specificEntry["lastName"]);
                                        $("#newEmail").attr("value", specificEntry["email"]);
                                        $("#employeeInfo").listview("refresh");
                                    }
                                }
                            })
                              
                        })
                    }
                   
            }
        }, error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}


$(document).ready( () => { 

    sortType = "name";
    
    updatePersonnelEntries();
    
});


//Populates selects in configPanel with deps and locs via an ajax call when config panel is opened.
$("#configPanel").on("panelopen", (e) => {
    let departments = getAllDepartments();
    let locations = getAllLocations();


    let addDepartmentHTML = "";
    departments.forEach((department) => {
        currentHTML = "<option value=" + "'" + department["id"] + "'" + ">" +  department["name"] + "</option>";
        addDepartmentHTML += currentHTML;
    })
    $("#addDepartmentID").html(addDepartmentHTML);
    $("#addDepartmentID").selectmenu("refresh");
    $("#chooseDep").html(addDepartmentHTML);
    $("#chooseDep").selectmenu("refresh");
    $("#chooseDepToDel").html(addDepartmentHTML);
    $("#chooseDepToDel").selectmenu("refresh");


    let addLocationHTML = "";
    locations.forEach((location) => {
        currentHTML = "<option value='" + location["id"] + "'>" + location["name"] + "</option>";
        addLocationHTML += currentHTML;
    })
    $("#newLocID").html(addLocationHTML);
    $("#newLocID").selectmenu("refresh");
    $("#chooseLoc").html(addLocationHTML);
    $("#chooseLoc").selectmenu("refresh");
    $("#chooseLocToDel").html(addLocationHTML);
    $("#chooseLocToDel").selectmenu("refresh");
    $("#addDepChooseLoc").html(addLocationHTML);
    $("#addDepChooseLoc").selectmenu("refresh");

});

//Populates selects in searchArea with deps and locs via ajax when searchAreaBtn clicked.
$("#searchAreaBtn").on("click", (e) => {
    let departments = getAllDepartments();
    let locations = getAllLocations();

    let addDepartmentHTML = "<option value='' selected='selected' >Any</option>";
    departments.forEach((department) => {
        currentHTML = "<option value=" + "'" + department["name"] + "'" + ">" +  department["name"] + "</option>";
        addDepartmentHTML += currentHTML;
    })
    $("#chooseSearchDep").html(addDepartmentHTML);
    $("#chooseSearchDep").selectmenu("refresh");

    let addLocationHTML = "<option value='' selected='selected' >Any</option>";
    locations.forEach((location) => {
        currentHTML = "<option value='" + location["name"] + "'>" + location["name"] + "</option>";
        addLocationHTML += currentHTML;
    })
    $("#chooseSearchLoc").html(addLocationHTML);
    $("#chooseSearchLoc").selectmenu("refresh");
})

//Populates selects in employeePanel with deps via an ajax call when employeepanel is opened.
$("#employeePanel").on("panelopen", (e) => {
    let departments = getAllDepartments();
    let locations = getAllLocations();


    let addDepartmentHTML = "";
    departments.forEach((department) => {
        currentHTML = "<option value=" + "'" + department["id"] + "'" + ">" +  department["name"] + "</option>";
        addDepartmentHTML += currentHTML;
    })
    $("#editPersonnelNewDep").html(addDepartmentHTML);
    $("#editPersonnelNewDep").selectmenu("refresh");

})



function getAllDepartments() {  //Retreives all departments
    let departments;
    $.ajax({
        url: "libs/php/getAllDepartments.php",
        type: "GET",
        dataType: "json",
        data: {
        },
        async: false,
        success: function(result) {
            if (result.status.name == "ok") {
                departments = result["data"];
                
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
    return departments;
}

function getAllLocations() {  //Retreives all locations
    let locations;
    $.ajax({
        url: "libs/php/getAllLocations.php",
        type: "GET",
        dataType: "json",
        data: {

        },
        async: false,
        success: function(result) {
            if (result.status.name == "ok") {
                locations =  result["data"];
            }
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
    return locations;
}





$('#addDepartmentForm').submit(function(e){    //Runs insertDepartment.php when the form is submitted without navigating to it.
        e.preventDefault();
        $.ajax({
            url: 'libs/php/insertDepartment.php',
            type: 'post',
            data: $('#addDepartmentForm').serialize(),
            dataType: "json",
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
            id: $("#employeePanelName").attr("personnelID"),
            newFName: $("#newFName").val(),
            newLName: $("#newLName").val(),
            newEmail: $("#newEmail").val(),
            newDepID: $("#editPersonnelNewDep").val()
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
    
    $.ajax({
        url: "libs/php/deletePersonnelByID.php",
        type: "get",
        dataType: "json",
        data: {
            id: $("#employeePanelName").attr("personnelID"),
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