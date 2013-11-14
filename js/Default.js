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

    // BUILD A TEST DATA SET
    var arrData = kawasu.orders.createZeroTestData();

    // BUILD A STYLE OBJECT TO DEFINE THE TABLE STYLE
    var styleDefn = new Object();
    styleDefn["tableClass"] = "tableTestClassLarge";
    styleDefn["tdClass"] = "tdTestClassLarge";
    styleDefn["thClass"] = "thTestClassLarge";
    styleDefn["trClass"] = "trTestClassLarge";

    // If you set a selected class, you get selectable functionality
    styleDefn["trClassSelected"] = "trSelectedTestClassLarge";

    // If you set odd/even row classes, you get zebra stripes
    styleDefn["trClassOdd"] = "trTestClassLargeOdd";
    styleDefn["trClassEven"] = "trTestClassLargeEven";



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
    var myDynaTable = kawasu.dynatable.build(
        arrData,
        styleDefn,
        "myDynaTable",
        10,
        true, // MultiSelect Mode 
        true); // Extend last column option

    $("#divContainer").append(myDynaTable);

    kawasu.orders.hookupHandlers();
    
    kawasu.orders.btnToggleMultiSelect_setBtnText();

    console.log(prefix + "Exiting");
}

$(window).load(kawasu.orders.init);


kawasu.orders.createZeroTestData = function () {
    var prefix = "kawasu.orders.createZeroTestData() - ";
    console.log(prefix + "Entering");

    // Make a Json object to build a table out of
    var array = [];

    var obj1 = {
        "Contract": "",
        "Side": "",
        "Qty": "",
        "Price": "",
        "StopPrice": "",
        "Comment": ""
    };

    array.push(obj1);

    return array;

    console.log(prefix + "Exiting");
}

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

///////////////////////////////////////////////////////////////////////////////
// HANDLERS
//

kawasu.orders.hookupHandlers = function () {

    var btnToggleMultiSelect = document.getElementById("btnToggleMultiSelect");
    fc.utils.addEvent(btnToggleMultiSelect, "click", kawasu.orders.btnToggleMultiSelect_onClick);

    var btnSelectAll = document.getElementById("btnSelectAll");
    fc.utils.addEvent(btnSelectAll, "click", kawasu.orders.btnSelectAll_onClick);

    var btnDeselectAll = document.getElementById("btnDeselectAll");
    fc.utils.addEvent(btnDeselectAll, "click", kawasu.orders.btnDeselectAll_onClick);
}

kawasu.orders.btnToggleMultiSelect_onClick = function (){
    var prefix = "kawasu.orders.btnToggleMultiSelect_onClick() - ";
    console.log(prefix + "Entering");

    var bState = kawasu.dynatable.multiSelect("myDynaTable") ?
        kawasu.dynatable.multiSelect("myDynaTable", false) :
        kawasu.dynatable.multiSelect("myDynaTable", true);

    kawasu.orders.btnToggleMultiSelect_setBtnText(bState);

    console.log(prefix + "Exiting");
}

kawasu.orders.btnToggleMultiSelect_setBtnText = function (bState) {
    // If state unknown, go get it...
    bState = (typeof bState === 'undefined') ?
        kawasu.dynatable.multiSelect("myDynaTable") : bState;

    // Set the button text to reveal current state
    var btnToggleMultiSelect = document.getElementById("btnToggleMultiSelect");
    btnToggleMultiSelect.value = "Toggle MultiSelect: " + (bState ? "T" : "F");
}

kawasu.orders.btnSelectAll_onClick = function () {
    var prefix = "kawasu.orders.btnSelectAll_onClick() - ";
    console.log(prefix + "Entering");

    kawasu.dynatable.setSelectAll("myDynaTable",true);

    console.log(prefix + "Exiting");
}

kawasu.orders.btnDeselectAll_onClick = function () {
    var prefix = "kawasu.orders.btnDeselectAll_onClick() - ";
    console.log(prefix + "Entering");

    kawasu.dynatable.setSelectAll("myDynaTable", false);

    console.log(prefix + "Exiting");
}
