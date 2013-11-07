///////////////////////////////////////////////////////////////////////////////
// STYLE DECLARATION
// Use double quotes in JavaScript


// To include files for VS to understand and query them, use this syntax..
///<reference path="../FCUtils.js" />

// Define the console if not already defined
if (!window.console) console = { log: function () { } };



///////////////////////////////////////////////////////////////////////////////
// Global Namespace for this application
//
var kawasu = kawasu || {};

if (fc.utils.isInvalidVar(kawasu.dynatable)) { kawasu.dynatable = new Object(); }

// ENTRY POINT
kawasu.dynatable.build = function (arrData, styleDefn, sTableID, nRowsToShow, bExtendLastColOverScrollbar) {
    var prefix = "kawasu.dynatable.build() - ";
    console.log(prefix + "Entering");

    // Default switch argument value is false
    bExtendLastColOverScrollbar = (typeof bExtendLastColOverScrollbar !== 'undefined') ? bExtendLastColOverScrollbar : false;

    // Cache the styleDefn for use later.  All data pertaining to this table
    // will then be stored in this area.
    kawasu.dynatable[sTableID] = new Object();
    kawasu.dynatable[sTableID]["styleDefn"] = styleDefn;


    // Header object is created by walking the inbound data and 
    // creating a property on a new object for every unique 
    // property on the objects in the arrData array.
    var header = kawasu.dynatable.buildHeaderData(arrData);

    var rawTable =
        kawasu.dynatable.buildRawTable(
            sTableID,
            arrData,
            header,
            styleDefn,
            nRowsToShow); // rows to make, ie pad to this number            

    // Check that rawtable is defined before attempting next step
    if (fc.utils.isValidVar(rawTable)) {
        console.log(prefix + "CHECK: rawTable has been created, calling buildScrollingTable()...");
        return kawasu.dynatable.buildScrollingTable(rawTable, nRowsToShow, bExtendLastColOverScrollbar);
    }
    // implicit else
    console.log(prefix + "ERROR: Failed to create rawTable from arrData array of JSON Objects passed in.");
    console.log(prefix + "Exiting");
}


kawasu.dynatable.buildHeaderData = function (arrayJsonObjects) {
    var prefix = "kawasu.dynatable.buildHeaderData() - ";
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
            }
        }

    }

    return header;

    console.log(prefix + "Exiting");
}

kawasu.dynatable.buildRawTable = function (sTableID, arrData, header, styleDefn, nRowsMinimum) {
    var prefix = "kawasu.dynatable.buildRawTable() - ";
    console.log(prefix + "Entering");

    // This fn takes an array of JSON objects and creates an HTML table from them, 
    // applying the styles listed in the styleDefn object.
    // Click functions are attached to the cells when they are built to avoid having
    // to re-iterate the table and apply them later.  
    // The raw table is padded with blank rows to the nRowsMinimum value.

    if (arguments.length != 5) {
        console.log(prefix + "ERROR: Expected 5 args for this function, received:" + arguments.length.toString());
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
    var table = document.createElement("table");
    var classTable = styleDefn["tableClass"] || "";
    table.className = classTable;
    table.id = sTableID;


    // Make header
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
            trHeader.appendChild(th);
        }
    }

    // Add the header row to the table
    table.appendChild(trHeader);

    // Iterate the data, add one row per element.
    // We have to add a data cell under each header cell.

    var classDataCell = styleDefn["tdClass"] || "";
    var sEmptyString = "&nbsp";
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
                td.className = classDataCell;
                tr.appendChild(td);
            }
        }

        table.appendChild(tr);
    }

    return table;
    console.log(prefix + "Exiting");
}


kawasu.dynatable.buildScrollingTable = function (table, nRowsToShow, bExtendLastCol) {
    var prefix = "kawasu.dynatable.buildScrollingTable() - ";
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
    var arrayColumnWidths = kawasu.dynatable.getTableColumnWidths(table);
    var sizeTable = kawasu.dynatable.getTableSize(table); // This is the size before the table is cut in two

    // Clone the table to make a header only
    var tableHeader = table.cloneNode(true);
    kawasu.dynatable.makeHeaderOnly(tableHeader);

    // Hide the header row on the data part of the table
    //table.rows[0].style.display = "none";
    // Actually, delete the header row
    table.deleteRow(0);

    // If there is a selected style, attach a click function for selectable functionality
    if (kawasu.dynatable[table.id]["styleDefn"].hasOwnProperty("trSelectedClass")) {
        for (var i = 0; i < table.rows.length; ++i) {
            var tr = table.rows[i];
            for (var j = 0; j < tr.cells.length; ++j) {                
                fc.utils.addEvent(tr.cells[j], "click", kawasu.dynatable.dataCell_onClick);
            }
        }
    }

    // Get the table dimensions
    var sizeTableHeader = kawasu.dynatable.getTableSize(tableHeader, 0);
    var sizeTableBody = kawasu.dynatable.getTableSize(table, nRowsToShow);

    // Set the table fixed layout, width 100%
    table.style.tableLayout = "fixed";
    tableHeader.style.tableLayout = "fixed";
    var maxTableWidth = sizeTable.width;
    tableHeader.style.width = table.style.width = maxTableWidth.toString() + "px";
    kawasu.dynatable.setTableColumnWidths(table, arrayColumnWidths);
    kawasu.dynatable.setTableColumnWidths(tableHeader, arrayColumnWidths);

    // Get scrollbar dimensions
    var sbWidth = fc.utils.getScrollBarWidth();
    var sbHeight = fc.utils.getScrollBarHeight();
    if (bExtendLastCol) {
        kawasu.dynatable.extendLastColumnOverScrollbar(tableHeader, sbWidth);
    }

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

    // Optionally add in the width of the scrollbar to this div width
    var sDivHeaderWidth = (maxTableWidth + 1 + (bExtendLastCol ? sbWidth : 0)).toString() + "px";
    divHeader.style.width = sDivHeaderWidth;

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


kawasu.dynatable.getTableSize = function (table, nRowsToShow) {
    var prefix = "kawasu.dynatable.getTableSize() - ";
    console.log(prefix + "Entering");

    if (nRowsToShow == 0 || nRowsToShow === 'undefined') {
        return kawasu.dynatable.getTableSize_Sub(table);
    }

    // We have a subset of rows to show.
    // Clone the table, trim to the number of rows, get that height
    var tableClone = table.cloneNode(true);

    for (var k = tableClone.rows.length; k > nRowsToShow; --k) {
        // When k gets to 1, we should have only row zero left
        //tableClone.removeChild(table.rows[k - 1]);
        tableClone.deleteRow(k - 1);
    }

    return kawasu.dynatable.getTableSize_Sub(tableClone);

    console.log(prefix + "Exiting");
}

kawasu.dynatable.getTableSize_Sub = function (table) {
    var prefix = "kawasu.dynatable.getTableSize_Sub() - ";
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
    divSizing.style.visibility = "hidden";

    document.body.appendChild(divSizing);
    divSizing.appendChild(table);

    size.height = table.offsetHeight;
    size.width = table.offsetWidth;

    divSizing.removeChild(table);
    document.body.removeChild(divSizing);

    console.log(prefix + "Exiting");

    return size;
}


kawasu.dynatable.makeHeaderOnly = function (table) {
    var prefix = "kawasu.dynatable.makeHeaderOnly() - ";
    console.log(prefix + "Entering");

    for (var k = table.rows.length; k > 1; --k) {
        // When k gets to 1, we should have only row zero left
        table.deleteRow(k - 1);
    }

    console.log(prefix + "Exiting");
}

kawasu.dynatable.setTableColumnWidths = function (table, arrayColumnWidths) {
    var prefix = "kawasu.dynatable.setTableColumnWidths() - ";
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


kawasu.dynatable.getTableColumnWidths = function (table) {
    var prefix = "kawasu.dynatable.getTableColumnWidths() - ";
    console.log(prefix + "Entering");

    // Make an invisible div for sizing the table
    var divSizing = document.createElement('div');
    divSizing.style.position = "absolute";
    divSizing.style.top = "0px";
    divSizing.style.left = "0px";
    divSizing.style.width = "1px"; // Force minimum sizes
    divSizing.style.visibility = "hidden";

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

kawasu.dynatable.extendLastColumnOverScrollbar = function (tableHeader, sbWidth) {
    var prefix = "kawasu.dynatable.extendLastColumnOverScrollbar() - ";
    console.log(prefix + "Entering");

    var index = tableHeader.rows[0].cells.length - 1;
    var cellLastHeader = tableHeader.rows[0].cells[index];
    var sWidth = cellLastHeader.style.width;
    var nWidth = parseInt(sWidth);
    nWidth = nWidth + sbWidth;
    sWidth = nWidth.toString() + "px";
    cellLastHeader.style.width = sWidth;

    console.log(prefix + "Exiting");
}

kawasu.dynatable.dataCell_onClick = function () {
    var prefix = "kawasu.dynatable.dataCell_onClick() - ";
    console.log(prefix + "Entering");

    // A data cell in the table has been clicked on.
    // This should deselect the current row and set this
    // row to selected class. Keyword=Selectable

    var row = this.parentNode;

    if (fc.utils.isInvalidVar(row)) {
        console.log(prefix + "ERROR: Clicked cell did not have valid row as a parent.");
        return;
    }

    var table = row.parentNode;
    var sTableID = table.id;

    var trSelectedClass = kawasu.dynatable[sTableID]["styleDefn"]["trSelectedClass"];
    var trClass = kawasu.dynatable[sTableID]["styleDefn"]["trClass"];

    if (row.className == trSelectedClass) {
        // This row is already selected, 
        // so toggle it to deselected

        if (kawasu.dynatable[sTableID]["styleDefn"].hasOwnProperty("trCachedDeselectedClass")) {
            // There is a previous cached class, so reset to this
            row.className = kawasu.dynatable[sTableID]["styleDefn"]["trCachedDeselectedClass"];
        }
        else {
            // There is no previous cached class, that's dodgy, warn about it
            row.className = trClass;
            console.log(prefix + "WARNING: There was no cached deselected class for this row.  A selected row should always have it's previous state saved, but this one did not.");
        }
    }
    else {
        // This row is not selected, 
        // so deselect the current selected row (if one exists) and select this one

        var bFound = false;
        for (var i = 0; (i < table.rows.length) && (bFound == false); ++i) {
            if (table.rows[i].className == trSelectedClass) {
                // Found the selected row
                bFound = true; // early exit from loop

                // Set to cached deselected state
                if (kawasu.dynatable[sTableID]["styleDefn"].hasOwnProperty("trCachedDeselectedClass")) {
                    // There is a previous cached class, so reset to this
                    table.rows[i].className = kawasu.dynatable[sTableID]["styleDefn"]["trCachedDeselectedClass"];
                }
                else {
                    // There is no previous cached class, that's dodgy, warn about it
                    table.rows[i].className = trClass;
                    console.log(prefix + "WARNING: There was no cached deselected class for this row.  A selected row should always have it's previous state saved, but this one did not.");
                }

            }
        }

        // Select this row - cache the current class and set to selected class
        kawasu.dynatable[sTableID]["styleDefn"]["trCachedDeselectedClass"] = row.className;
        row.className = trSelectedClass;

    }

    console.log(prefix + "Exiting");
}

/*
kawasu.dynatable.removeTableBlankRows = function (table) {
    var prefix = "kawasu.dynatable.removeTableBlankRows() - ";
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

*/