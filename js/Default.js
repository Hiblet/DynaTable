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
var nz = nz || {};

if (fc.utils.isInvalidVar(nz.orders)) { nz.orders = new Object(); }


// Global; Temporary, for GreyOut testing
var bGreyOut = true;


nz.orders.init = function () {
    var prefix = "nz.orders.init() - ";
    console.log(prefix + "Entering");


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

    // If you set a grey out class, you can use the greyRows() function to grey
    // out rows that match data values in a certain column
    styleDefn["tdClassGreyOut"] = "tdTestClassLargeGreyOut"; // Cell style grey out - text

    // BUILD A TEST DATA SET
    var arrDataA = nz.orders.createTestDataA();
    var arrDataWithControls = nz.orders.createTestDataWithControls();

    // Dynatable testing
    var myDynaTable = nz.dynatable.build(
        arrDataWithControls,
        styleDefn,
        "myDynaTable",
        10,
        true, // MultiSelect Mode 
        true); // Extend last column option

    $("#divContainer").append(myDynaTable);

    nz.dynatable.SetCallback("myDynaTable", nz.orders.testCallback);

    // BUILD A 2ND TEST DATA SET
    //var arrDataB = nz.orders.createTestDataB();

    /* LARGE DATASET TEST
    var arrDataB = nz.orders.createTestDataLargeRandom();
    nz.dynatable.rebuild("myDynaTable", arrDataB);
    */

    nz.orders.hookupHandlers();

    nz.orders.btnToggleMultiSelect_setBtnText();

    console.log(prefix + "Exiting");
}

$(window).load(nz.orders.init);


nz.orders.createZeroTestData = function () {
    var prefix = "nz.orders.createZeroTestData() - ";
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

nz.orders.createTestDataA = function () {
    var prefix = "nz.orders.createTestDataA() - ";
    console.log(prefix + "Entering");

    // Make a Json object to build a table out of
    var array = [];

    var obj1 = {
        "Contract": "WIDGET",
        "Side": "BUY",
        "Qty": "0",
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

nz.orders.createTestDataB = function () {
    var prefix = "nz.orders.createTestDataB() - ";
    console.log(prefix + "Entering");

    // Make a Json object to build a table out of
    var array = [];

    var obj1 = {
        "Contract": "BODGET",
        "Side": "SELL",
        "Qty": "24",
        "Price": "1.03"
    };

    var obj2 = {
        "Contract": "DIGIT",
        "Side": "SELL",
        "Comment": "This would appear to be quite a long comment, really.  As comments go.",
        "Qty": "8",
        "Price": "101.32"
    };

    var obj3 = {
        "Contract": "BILCO",
        "Side": "SELL",
        "Qty": 0, // Numeric zero, evaluates to false
        "Price": "9.99",
        "StopPrice": "232"
    };

    var obj4 = {
        "Contract": "JAGUAR",
        "Side": "BUY",
        "Qty": "323",
        "Price": "1",
        "StopPrice": "783"
    };

    array.push(obj1);
    array.push(obj2);
    array.push(obj3);
    array.push(obj4);

    return array;

    console.log(prefix + "Exiting");
}


nz.orders.createTestDataLargeRandom = function () {
    var prefix = "nz.orders.createTestDataLargeRandom() - ";
    console.log(prefix + "Entering");

    // Make a Json object to build a table out of
    var array = [];

    for (var j = 0; j < 1000; ++j) {
        var obj = new Object();
        for (var i = 0; i < 50; ++i) {
            var sProp = "Property" + (i.toString());
            obj[sProp] = nz.orders.getRandomString(32);
        }
        array.push(obj);
    }

    return array;

    console.log(prefix + "Exiting");
}

nz.orders.getRandomString = function (nStringLength) {
    var nRandom = (Math.random() + 1); // 1.1234563443
    var sRandom = nRandom.toString(36); // "1.garbage"
    sRandom = sRandom.substring(2, sRandom.length); // drop first 2 chars ie "1."
    if (fc.utils.isValidVar(nStringLength) && nStringLength > 0) {
        sRandom = sRandom.substring(0, nStringLength);
    }
    return sRandom;
}


nz.orders.createTestDataWithControls = function () {
    var prefix = "nz.orders.createTestDataWithControls() - ";
    console.log(prefix + "Entering");

    // Make a Json object to build a table out of.
    // Add a button at the start of each one.
    var array = [];

    var obj1 = {
        "Control": "<input type='button' value='X' id='btnBODGET' onclick='nz.orders.btnTest_onClick(this.id,event)'/>",
        "Contract": "BODGET",
        "Side": "SELL",
        "Qty": "24",
        "Price": "1.03"
    };

    var obj2 = {
        "Control": "<input type='button' value='X' id='btnDIGIT' onclick='nz.orders.btnTest_onClick(this.id,event)'/>",
        "Contract": "DIGIT",
        "Side": "SELL",
        "Comment": "This would appear to be quite a long comment, really.  As comments go.",
        "Qty": "8",
        "Price": "101.32"
    };

    var obj3 = {
        "Control": "<input type='button' value='X' id='btnBILCO' onclick='nz.orders.btnTest_onClick(this.id,event)'/>",
        "Contract": "BILCO",
        "Side": "SELL",
        "Qty": 0, // Numeric zero, evaluates to false
        "Price": "9.99",
        "StopPrice": "232"
    };

    var obj4 = {
        "Control": "<input type='button' value='X' id='btnJAGUAR' onclick='nz.orders.btnTest_onClick(this.id,event)'/>",
        "Contract": "JAGUAR",
        "Side": "BUY",
        "Qty": "323",
        "Price": "1",
        "StopPrice": "783"
    };

    array.push(obj1);
    array.push(obj2);
    array.push(obj3);
    array.push(obj4);


    return array;

    console.log(prefix + "Exiting");
}



///////////////////////////////////////////////////////////////////////////////
// HANDLERS
//

nz.orders.btnTest_onClick = function (id, event) {
    var prefix = "nz.orders.btnTest_onClick() - ";
    console.log(prefix + "Clicked: " + id);
    event.stopPropagation();
}

nz.orders.hookupHandlers = function () {

    var btnToggleMultiSelect = document.getElementById("btnToggleMultiSelect");
    fc.utils.addEvent(btnToggleMultiSelect, "click", nz.orders.btnToggleMultiSelect_onClick);

    var btnSelectAll = document.getElementById("btnSelectAll");
    fc.utils.addEvent(btnSelectAll, "click", nz.orders.btnSelectAll_onClick);

    var btnDeselectAll = document.getElementById("btnDeselectAll");
    fc.utils.addEvent(btnDeselectAll, "click", nz.orders.btnDeselectAll_onClick);

    var btnDeleteSelected = document.getElementById("btnDeleteSelected");
    fc.utils.addEvent(btnDeleteSelected, "click", nz.orders.btnDeleteSelected_onClick);

    var btnDeleteRequest = document.getElementById("btnDeleteRequest");
    fc.utils.addEvent(btnDeleteRequest, "click", nz.orders.btnDeleteRequest_onClick);

    var btnGreyOutToggle = document.getElementById("btnGreyOutToggle");
    fc.utils.addEvent(btnGreyOutToggle, "click", nz.orders.btnGreyOutToggle_onClick);

    var btnApplySort = document.getElementById("btnApplySort");
    fc.utils.addEvent(btnApplySort, "click", nz.orders.btnApplySort_onClick);
}

nz.orders.btnToggleMultiSelect_onClick = function (){
    var prefix = "nz.orders.btnToggleMultiSelect_onClick() - ";
    console.log(prefix + "Entering");

    var bState = nz.dynatable.multiSelect("myDynaTable") ?
        nz.dynatable.multiSelect("myDynaTable", false) :
        nz.dynatable.multiSelect("myDynaTable", true);

    nz.orders.btnToggleMultiSelect_setBtnText(bState);

    console.log(prefix + "Exiting");
}

nz.orders.btnToggleMultiSelect_setBtnText = function (bState) {
    // If state unknown, go get it...
    bState = (typeof bState === 'undefined') ?
        nz.dynatable.multiSelect("myDynaTable") : bState;

    // Set the button text to reveal current state
    var btnToggleMultiSelect = document.getElementById("btnToggleMultiSelect");
    btnToggleMultiSelect.value = "Toggle MultiSelect: " + (bState ? "T" : "F");
}

nz.orders.btnSelectAll_onClick = function () {
    var prefix = "nz.orders.btnSelectAll_onClick() - ";
    console.log(prefix + "Entering");

    nz.dynatable.setSelectAll("myDynaTable",true);

    console.log(prefix + "Exiting");
}

nz.orders.btnDeselectAll_onClick = function () {
    var prefix = "nz.orders.btnDeselectAll_onClick() - ";
    console.log(prefix + "Entering");

    nz.dynatable.setSelectAll("myDynaTable", false);

    console.log(prefix + "Exiting");
}

nz.orders.btnDeleteSelected_onClick = function () {
    var prefix = "nz.orders.btnDeleteSelected_onClick() - ";
    console.log(prefix + "Entering");

    nz.dynatable.deleteSelected("myDynaTable", true);

    console.log(prefix + "Exiting");
}

nz.orders.btnDeleteRequest_onClick = function () {
    var prefix = "nz.orders.btnDeleteRequest_onClick() - ";
    console.log(prefix + "Entering");

    nz.dynatable.deleteRequest("myDynaTable", true); // true==Reset selection after this fn called

    console.log(prefix + "Exiting");
}

nz.orders.btnGreyOutToggle_onClick = function () {
    var prefix = "nz.orders.btnGreyOutToggle_onClick() - ";
    console.log(prefix + "Entering");

    nz.dynatable.greyRows("myDynaTable", "Contract", "DIGIT", bGreyOut);
    bGreyOut = !bGreyOut;

    console.log(prefix + "Exiting");
}

nz.orders.btnApplySort_onClick = function () {
    var prefix = "nz.orders.btnApplySort_onClick() - ";
    console.log(prefix + "Entering");

    nz.dynatable.applySortByColumnIndex("myDynaTable", 2, "DESC");

    console.log(prefix + "Exiting");
}

nz.orders.testCallback = function (arrRows) {
    var prefix = "nz.orders.testCallback() - ";
    console.log(prefix + "Entering");

    var sRows = arrRows.toString();
    var lblCallbackFeedback = document.getElementById("lblCallbackFeedback");
    lblCallbackFeedback.innerHTML = sRows;

    console.log(prefix + "Exiting");
}