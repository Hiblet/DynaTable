///////////////////////////////////////////////////////////////////////////////
// STYLE DECLARATION
// Use double quotes in JavaScript


// To include files for VS to understand and query them, use this syntax..
///<reference path="../FCUtils.js" />
///<reference path="breakpoints.js" />

// Define the console if not already defined
if (!window.console) console = { log: function () { } };



///////////////////////////////////////////////////////////////////////////////
// Global Namespace for this application
//
var kawasu = kawasu || {};

if (fc.utils.isInvalidVar(kawasu.orders)) { kawasu.orders = new Object(); }


kawasu.orders.init = function () {
    var prefix = "kawasu.orders.init() - ";
    console.log(prefix + "Entering");

    //kawasu.orders.buildDynaTable(); // gone

    // BUILD A TEST DATA SET
    var arrData = kawasu.orders.createTestData();

    // BUILD A STYLE OBJECT TO DEFINE THE TABLE STYLE
    var styleDefn = new Object();
    styleDefn["tableClass"] = "tableTestClassLarge";
    styleDefn["tdClass"] = "tdTestClassLarge";
    styleDefn["thClass"] = "thTestClassLarge";
    styleDefn["trClass"] = "trTestClassLarge";

    /* Some diags to check the table building part is OK
    var myRawTable = kawasu.dynatable.buildRawTable(
        "myRawTable",
        arrData,
        kawasu.dynatable.buildHeaderData(arrData),
        styleDefn,
        10);

    $("#divContainer").append(myRawTable);
    */

    // Dynatable testing
    var myDynatable = kawasu.dynatable.build(
        arrData,
        styleDefn,
        "myLargeDynatable", 
        10,
        true); // Extend last column option
    
    $("#divContainer").append(myDynatable);
    

    console.log(prefix + "Exiting");
}

$(window).load(kawasu.orders.init);




kawasu.orders.createTestData = function () {
    var prefix = "kawasu.orders.createTestData() - ";
    console.log(prefix + "Entering");

    // Make a Json object to build a table out of
    var array = [];

    var obj1 = {
        "Contract": "WIDGET",
        "Side": "BUY",
        "Qty": "3",
        "Price": "98.3"
    };

    var obj2 = {
        "Contract": "GADGET",
        "Side": "SELL",
        "Comment":"This is a rare column",
        "Qty": "7",
        "Price": "101.32"
    };

    var obj3 = {
        "Contract": "BOBBIN",
        "Side": "SELL",
        "Qty": "32",
        "Price": "19.4",
        "StopPrice": "18.5"
    };

    array.push(obj1);
    array.push(obj2);
    array.push(obj3);

    return array;

    console.log(prefix + "Exiting");
}



kawasu.orders.createTestDataLargeRandom = function () {
    var prefix = "kawasu.orders.createTestDataLargeRandom() - ";
    console.log(prefix + "Entering");

    // Make a Json object to build a table out of
    var array = [];

    for (var j = 0; j < 10000; ++j) {
        var obj = new Object();
        for (var i = 0; i < 20; ++i) {
            var sProp = "Property" + (i.toString());
            obj[sProp] = i.toString();
        }
        array.push(obj);
    }

    return array;

    console.log(prefix + "Exiting");
}

/* REMOVED - Javascript cloneNode() does not copy event handlers
kawasu.orders.headerCell_onClick = function () {
    var prefix = "kawasu.orders.header_onClick() - ";
    console.log(prefix + "Entering");

    // Function to run when table header cell is clicked
    var sHeader = fc.utils.textContent(this);
    console.log(prefix + "HEADERCELL CLICKED >" + sHeader + "<");

    console.log(prefix + "Exiting");
}
*/

/*
kawasu.orders.dataCell_onClick = function () {
    var prefix = "kawasu.orders.data_onClick() - ";
    console.log(prefix + "Entering");

    // Function to run when table header cell is clicked
    var sData = fc.utils.textContent(this);
    console.log(prefix + "DATACELL CLICKED >" + sData + "<");

    console.log(prefix + "Exiting");
}
*/






