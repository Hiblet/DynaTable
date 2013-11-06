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

    kawasu.orders.buildDynaTable();

    console.log(prefix + "Exiting");
}

$(window).load(kawasu.orders.init);



kawasu.orders.buildDynaTable = function () {
    var prefix = "kawasu.orders.buildDynaTable() - ";
    console.log(prefix + "Entering");

    var arrData = kawasu.orders.createTestData();

    var header = kawasu.orders.buildHeaderData(arrData); // Should have 6 properties 

    var styleDefn = new Object();
    styleDefn["tableClass"] = "tableTestClassLarge";
    styleDefn["tdClass"] = "tdTestClassLarge";
    styleDefn["thClass"] = "thTestClassLarge";
    styleDefn["trClass"] = "trTestClassLarge";

    var largeTable =
        kawasu.orders.buildLargeTable(
            "MyLargeTable",
            arrData,
            header,
            styleDefn,
            10, // rows to make, ie pad to this number
            kawasu.orders.headerCell_onClick,
            kawasu.orders.dataCell_onClick);


    //$("#divContainer").append(jqLargeTable);

    var divWrappedTable = kawasu.orders.buildWrappedTable(largeTable, 5); // where 5 is rows to show
    $("#divContainer").append(divWrappedTable);

    console.log(prefix + "Exiting");
}

kawasu.orders.buildHeaderData = function (arrayJsonObjects) {
    var prefix = "kawasu.orders.buildHeaderData() - ";
    console.log(prefix + "Entering");

    // Take an array of Json objects, and build an object that
    // has properties that are all the unique headers.

    var header = new Object();

    for (var i = 0; i < arrayJsonObjects.length; ++i) {

        // arrayJsonObjects[i] is the current object.
        // Iterate it's properties, make a property 
        // in the header object for each one

        var obj = arrayJsonObjects[i]; // Reference the object to avoid repeatedly indexing it
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                header[property] = "";
                //if ( header[property] == 'undefined' ) header[property] = "";
            }
        }

    }

    return header;

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


kawasu.orders.headerCell_onClick = function () {
    var prefix = "kawasu.orders.header_onClick() - ";
    console.log(prefix + "Entering");

    // Function to run when table header cell is clicked
    var sHeader = fc.utils.textContent(this);
    console.log(prefix + "HEADERCELL CLICKED >" + sHeader + "<");

    console.log(prefix + "Exiting");
}

kawasu.orders.dataCell_onClick = function () {
    var prefix = "kawasu.orders.data_onClick() - ";
    console.log(prefix + "Entering");

    // Function to run when table header cell is clicked
    var sData = fc.utils.textContent(this);
    console.log(prefix + "DATACELL CLICKED >" + sData + "<");

    console.log(prefix + "Exiting");
}


kawasu.orders.buildLargeTable = function (sTableID, arrData, header, styleDefn, nRowsMinimum, headerCell_onClick, dataCell_onClick) {
    var prefix = "kawasu.orders.buildLargeTable() - ";
    console.log(prefix + "Entering");

    if (arguments.length != 7) {
        console.log(prefix + "ERROR: Expected 7 args for this function, received:" + arguments.length.toString());
        return;
    }

    // Pad the data array so that the table gets padded out too
    if (arrData.length < nRowsMinimum) {
        var paddingRows = nRowsMinimum - arrData.length;
        for (var j = 0; j < paddingRows; ++j) {
            var objBlank = new Object();
            arrData.push(objBlank);
        }
    }

    // Make table
    //var table = $("<table></table>");
    var table = document.createElement("table");
    var classTable = styleDefn["tableClass"] || "";
    table.className = classTable;
    table.id = sTableID;


    // Make header
    //var trHeader = $("<tr></tr>");
    var trHeader = document.createElement("tr");
    var classRow = styleDefn["trClass"] || "";
    trHeader.className = classRow;

    // Make header cells
    var classHeaderCell = styleDefn["thClass"] || "";
    for (var prop in header) {
        if (header.hasOwnProperty(prop)) {
            var th = document.createElement("th");
            fc.utils.textContent(th, prop);
            th.className = classHeaderCell;
            fc.utils.addEvent(th, "click", headerCell_onClick);
            trHeader.appendChild(th);
        }
    }

    // Add the header row to the table
    table.appendChild(trHeader);

    // Iterate the data, add one row per element.
    // We have to add a data cell under each header cell.

    var classDataCell = styleDefn["tdClass"] || "";
    var sEmptyString = "&nbsp";
    //var sEmptyString = "&#xA0;";
    for (var i = 0; i < arrData.length; ++i) {
        var tr = document.createElement("tr");
        tr.className = classRow;

        // arrData[i] is a JSON object in the array.
        // It may or may not have a property for this header
        for (var prop in header) {
            if (header.hasOwnProperty(prop)) {
                // For this column (header), create a data cell.
                // If the json data object has a property for this header,
                // enter it's info and if not, enter an empty string.
                var td = document.createElement("td");
                var tdContent = arrData[i][prop] || sEmptyString;
                td.innerHTML = tdContent;
                fc.utils.addEvent(td, "click", dataCell_onClick);
                td.className = classDataCell;
                tr.appendChild(td);
            }
        }

        table.appendChild(tr);
    }

    return table;
    console.log(prefix + "Exiting");
}


kawasu.orders.buildWrappedTable = function (table, nRowsToShow) {
    var prefix = "kawasu.orders.buildWrappedTable() - ";
    console.log(prefix + "Entering");

    // This function takes a table, and tries to show "nRowsToShow" of it.
    // The table is split so that the body and header are distinct.  
    // This allows the header to remain vertically static and the body to 
    // scroll vertically.  An outer wrapping div controls the horizontal
    // scrolling for the header and body so that they remain aligned.

    // Note that the table should already have the minimum number of rows
    // required.  Shortcut out if that is not the case...
    if (table.rows.length <= nRowsToShow) {
        console.log(prefix + "ERROR: Table passed in did not have enough rows to display correctly.");
        return;
    }

    table.style.tableLayout = "auto";
    var arrayColumnWidths = kawasu.orders.getTableColumnWidths(table);
    var sizeTable = kawasu.orders.getTableSize(table); // This is the size before the table is cut in two

    // Clone the table to make a header only
    var tableHeader = table.cloneNode(true);
    kawasu.orders.makeHeaderOnly(tableHeader);

    // Hide the header row on the data part of the table
    //table.rows[0].style.display = "none";
    // Actually, delete the header row
    table.deleteRow(0);


    // Get the table dimensions
    var sizeTableHeader = kawasu.orders.getTableSize(tableHeader, 0);
    var sizeTableBody = kawasu.orders.getTableSize(table, nRowsToShow);

    // Set the table fixed layout, width 100%
    table.style.tableLayout = "fixed";
    tableHeader.style.tableLayout = "fixed";
    var maxTableWidth = sizeTable.width;
    tableHeader.style.width = table.style.width = maxTableWidth.toString() + "px";
    kawasu.orders.setTableColumnWidths(table, arrayColumnWidths);
    kawasu.orders.setTableColumnWidths(tableHeader, arrayColumnWidths);

    // Get scrollbar dimensions
    var sbWidth = fc.utils.getScrollBarWidth();
    var sbHeight = fc.utils.getScrollBarHeight();


    // Create a div to hold the header and the body.
    // The header and body are in a div that is fixed height, but unlimited width
    var sTable = table.id;
    var sDivOuterPrefix = "div_";
    var sDivOuterSuffix = "_Outer";

    var divOuter = document.createElement("div");
    divOuter.id = sDivOuterPrefix + sTable + sDivOuterSuffix;
    divOuter.style.overflowX = "scroll";
    divOuter.style.overflowY = "hidden";
    divOuter.style.height = (sizeTableHeader.height + sizeTableBody.height + sbHeight).toString() + "px";

    // Don't set the width on the outer div - The width comes from the containing parent div
    //divOuter.style.width = (maxTableWidth + sbWidth +1).toString() + "px";

    // Create a div to hold the header
    var sDivHeaderPrefix = "div_";
    var sDivHeaderSuffix = "_Header";
    var divHeader = document.createElement("div");
    divHeader.style.overflow = "hidden"; // There should be no overflow, but just in case...
    divHeader.id = sDivHeaderPrefix + sTable + sDivHeaderSuffix;
    divHeader.style.height = (sizeTableHeader.height).toString() + "px";
    divHeader.style.width = (maxTableWidth + 1).toString() + "px";

    // Create a div to hold the body
    var sDivBodyPrefix = "div_";
    var sDivBodySuffix = "_Body";
    var divBody = document.createElement("div");
    divBody.style.overflowX = "hidden";
    divBody.style.overflowY = "scroll";
    divBody.id = sDivBodyPrefix + sTable + sDivBodySuffix;
    divBody.style.height = (sizeTableBody.height).toString() + "px";
    divBody.style.width = (maxTableWidth + sbWidth + 1).toString() + "px";

    // Join the components
    divHeader.appendChild(tableHeader);
    divBody.appendChild(table);
    divOuter.appendChild(divHeader);
    divOuter.appendChild(divBody);

    return divOuter;

    console.log(prefix + "Exiting");
}

kawasu.orders.getTableSize = function (table, nRowsToShow) {
    var prefix = "kawasu.orders.getTableSize() - ";
    console.log(prefix + "Entering");

    if (nRowsToShow == 0 || nRowsToShow === 'undefined') {        
        return kawasu.orders.getTableSize_Sub(table);
    }

    // We have a subset of rows to show.
    // Clone the table, trim to the number of rows, get that height
    var tableClone = table.cloneNode(true);

    for (var k = tableClone.rows.length; k > nRowsToShow; --k) {
        // When k gets to 1, we should have only row zero left
        //tableClone.removeChild(table.rows[k - 1]);
        tableClone.deleteRow(k - 1);
    }

    return kawasu.orders.getTableSize_Sub(tableClone);

    console.log(prefix + "Exiting");
}

kawasu.orders.getTableSize_Sub = function (table) {
    var prefix = "kawasu.orders.getTableSize_Sub() - ";
    console.log(prefix + "Entering");

    var size = new Object();
    size.height = 0;
    size.width = 0;

    // Make an invisible div for sizing the table
    var divSizing = document.createElement('div');
    divSizing.style.position = "absolute";
    divSizing.style.top = "0px";
    divSizing.style.left = "0px";
    divSizing.style.width = "1px";
    //divSizing.style.visibility = "hidden";

    document.body.appendChild(divSizing);
    divSizing.appendChild(table);

    size.height = table.offsetHeight;
    size.width = table.offsetWidth;

    divSizing.removeChild(table);
    document.body.removeChild(divSizing);

    console.log(prefix + "Exiting");

    return size;
}


kawasu.orders.makeHeaderOnly = function (table) {
    var prefix = "kawasu.orders.makeHeaderOnly() - ";
    console.log(prefix + "Entering");

    for (var k = table.rows.length; k > 1; --k) {
        // When k gets to 1, we should have only row zero left
        table.deleteRow(k - 1);
    }

    console.log(prefix + "Exiting");
}

kawasu.orders.setTableColumnWidths = function (table, arrayColumnWidths) {
    var prefix = "kawasu.orders.setTableColumnWidths() - ";
    console.log(prefix + "Entering");

    // Iterate the table and set width settings for each cell
    for (var i = 0; i < table.rows.length; ++i) {
        for (var j = 0; j < table.rows[i].cells.length; ++j) {
            var width = arrayColumnWidths[j] || 0;
            table.rows[i].cells[j].style.width = width.toString() + "px";
        }
    }

    console.log(prefix + "Exiting");
}


kawasu.orders.getTableColumnWidths = function (table) {
    var prefix = "kawasu.orders.getTableColumnWidths() - ";
    console.log(prefix + "Entering");

    // Make an invisible div for sizing the table
    var divSizing = document.createElement('div');
    divSizing.style.position = "absolute";
    divSizing.style.top = "0px";
    divSizing.style.left = "0px";
    divSizing.style.width = "1px"; // Force minimum sizes
    //divSizing.style.visibility = "hidden";

    // Strap the div and table to the document
    document.body.appendChild(divSizing);
    divSizing.appendChild(table);

    // Note: When you measure a cell, it includes padding.
    //       When you set a cell, padding is added, so you need to 
    //       subtract the padding from a cell when measuring.

    var arrayColumnWidths = [];
    for (var i = 0; i < table.rows[0].cells.length; ++i) {
        var cell = table.rows[0].cells[i];

        var nPaddingLeft = parseInt(fc.utils.getStyle(cell, "padding-left"), 10);
        var nPaddingRight = parseInt(fc.utils.getStyle(cell, "padding-right"), 10);

        var width = cell.clientWidth;

        //var offsetWidth = cell.offsetWidth;
        //var width = parseInt(cell.style.width, 10) || 0;
        //width = offsetWidth > width ? offsetWidth : width;

        width = width - nPaddingLeft - nPaddingRight;
        arrayColumnWidths.push(width);
    }

    // Remove the div and table from the document.
    // The table should still be referenced so will survive, 
    // the divSizing element will no longer be referenced so should be dropped.
    divSizing.removeChild(table);
    document.body.removeChild(divSizing);

    return arrayColumnWidths;

    console.log(prefix + "Exiting");
}

kawasu.orders.removeTableBlankRows = function (table) {
    var prefix = "kawasu.orders.removeTableBlankRows() - ";
    console.log(prefix + "Entering");

    // !!! NOT YET TESTED OMG DO NOT USE !!!

    // Iterate rows and remove any where cells only contain whitespace
    var arrayIndexOfBlankRows = [];
    var bHasData = false;

    for (var i = 0; i < table.rows.length; ++i) {
        //table.rows[i] is the current row

        bHasData = false; // Start, assume this row has no data until we know otherwise        
        for (var j = 0; (j < table.rows[i].cells.length) && (bHasData == false); ++j) {
            var content = fc.utils.textContent(table.rows[i].cells[j]);
            if (!fc.utils.isEmptyStringOrWhiteSpace(content)) {
                bHasData = true;
            }
        }

        if (j == table.rows.cells.length) {
            // We iterated the row right to the end and found no data.
            // Remember this row to delete later
            arrayIndexOfBlankRows.push(i);
        }
    }

    // Iterate the array of rows to delete backwards, deleting rows as we go.
    // Going backwards ensures that the index is always correct.
    for (var k = arrayIndexOfBlankRows.length; k > 0; --k) {
        // (k-1) gives you the index of the element to deref, to get the row index to delete
        var indexToDelete = arrayIndexOfBlankRows[k - 1];
        table.deleteRow(indexToDelete);
    }

    console.log(prefix + "Exiting");
}

