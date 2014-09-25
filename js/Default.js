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


// Global; Temporary, for GreyOut testing
var bGreyOut = true;


kawasu.orders.init = function () {
    var prefix = "kawasu.orders.init() - ";
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
    var arrDataA = kawasu.orders.createTestDataA();
    

    // Dynatable testing
    var myDynaTable = kawasu.dynatable.build(
        arrDataA,
        styleDefn,
        "myDynaTable",
        10,
        true, // MultiSelect Mode 
        true); // Extend last column option

    $("#divContainer").append(myDynaTable);

    // BUILD A 2ND TEST DATA SET
    //var arrDataB = kawasu.orders.createTestDataB();
    var arrDataB = kawasu.orders.createTestDataLargeRandom();
    kawasu.dynatable.rebuild("myDynaTable", arrDataB);

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

kawasu.orders.createTestDataA = function () {
    var prefix = "kawasu.orders.createTestDataA() - ";
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

kawasu.orders.createTestDataB = function () {
    var prefix = "kawasu.orders.createTestDataB() - ";
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


kawasu.orders.createTestDataLargeRandom = function () {
    var prefix = "kawasu.orders.createTestDataLargeRandom() - ";
    console.log(prefix + "Entering");

    // Make a Json object to build a table out of
    var array = [];

    for (var j = 0; j < 1000; ++j) {
        var obj = new Object();
        for (var i = 0; i < 50; ++i) {
            var sProp = "Property" + (i.toString());
            obj[sProp] = kawasu.orders.getRandomString(32);
        }
        array.push(obj);
    }

    return array;

    console.log(prefix + "Exiting");
}

kawasu.orders.getRandomString = function (nStringLength) {
    var nRandom = (Math.random() + 1); // 1.1234563443
    var sRandom = nRandom.toString(36); // "1.garbage"
    sRandom = sRandom.substring(2, sRandom.length); // drop first 2 chars ie "1."
    if (fc.utils.isValidVar(nStringLength) && nStringLength > 0) {
        sRandom = sRandom.substring(0, nStringLength);
    }
    return sRandom;
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

    var btnDeleteSelected = document.getElementById("btnDeleteSelected");
    fc.utils.addEvent(btnDeleteSelected, "click", kawasu.orders.btnDeleteSelected_onClick);

    var btnDeleteRequest = document.getElementById("btnDeleteRequest");
    fc.utils.addEvent(btnDeleteRequest, "click", kawasu.orders.btnDeleteRequest_onClick);

    var btnGreyOutToggle = document.getElementById("btnGreyOutToggle");
    fc.utils.addEvent(btnGreyOutToggle, "click", kawasu.orders.btnGreyOutToggle_onClick);

    var btnApplySort = document.getElementById("btnApplySort");
    fc.utils.addEvent(btnApplySort, "click", kawasu.orders.btnApplySort_onClick);
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

kawasu.orders.btnDeleteSelected_onClick = function () {
    var prefix = "kawasu.orders.btnDeleteSelected_onClick() - ";
    console.log(prefix + "Entering");

    kawasu.dynatable.deleteSelected("myDynaTable", true);

    console.log(prefix + "Exiting");
}

kawasu.orders.btnDeleteRequest_onClick = function () {
    var prefix = "kawasu.orders.btnDeleteRequest_onClick() - ";
    console.log(prefix + "Entering");

    kawasu.dynatable.deleteRequest("myDynaTable", true); // true==Reset selection after this fn called

    console.log(prefix + "Exiting");
}

kawasu.orders.btnGreyOutToggle_onClick = function () {
    var prefix = "kawasu.orders.btnGreyOutToggle_onClick() - ";
    console.log(prefix + "Entering");

    kawasu.dynatable.greyRows("myDynaTable", "Contract", "DIGIT", bGreyOut);
    bGreyOut = !bGreyOut;

    console.log(prefix + "Exiting");
}

kawasu.orders.btnApplySort_onClick = function () {
    var prefix = "kawasu.orders.btnApplySort_onClick() - ";
    console.log(prefix + "Entering");

    kawasu.dynatable.applySortByColumnIndex("myDynaTable", 2, "DESC");

    console.log(prefix + "Exiting");
}
