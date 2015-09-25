///////////////////////////////////////////////////////////////////////////////
// STYLE DECLARATION
// Use double quotes in JavaScript


// To include files for VS to understand and query them, use this syntax..
///<reference path="FCUtils.js" />

// Define the console if not already defined
if (!window.console) console = { log: function () { } };



///////////////////////////////////////////////////////////////////////////////
// Global Namespace for this application
//
var nz = nz || {};

if (fc.utils.isInvalidVar(nz.dynatable)) { nz.dynatable = new Object(); }

nz.dynatable.config = new Object();


///////////////////////////////////////////////////////////////////////////////
// Log Wrapper
//

nz.dynatable.config.bLog = true;

nz.dynatable.log = function (msg) { if (nz.dynatable.config.bLog) { console.log(msg); } }
nz.dynatable.warn = function (msg) { if (nz.dynatable.config.bLog) { console.warn(msg); } }
nz.dynatable.error = function (msg) { if (nz.dynatable.config.bLog) { console.error(msg); } }



///////////////////////////////////////////////////////////////////////////////
// Set some class variables up
//

nz.dynatable.config.bLog = false;
nz.dynatable.config.sTableHeaderPrefix = "table_";
nz.dynatable.config.sTableHeaderSuffix = "_Header";
nz.dynatable.config.sDivHeaderPrefix = "div_";
nz.dynatable.config.sDivHeaderSuffix = "_Header";
nz.dynatable.config.sDivBodyPrefix = "div_";
nz.dynatable.config.sDivBodySuffix = "_Body";
nz.dynatable.config.sDivOuterPrefix = "div_";
nz.dynatable.config.sDivOuterSuffix = "_Outer";

nz.dynatable.config.sDivShellPrefix = "div_";
nz.dynatable.config.sDivShellSuffix = "_Shell";

nz.dynatable.config.sEmptyStringHtml = "&nbsp";
nz.dynatable.config.nNumericPadding = 6;
nz.dynatable.config.sType_DATA = "DATA";
nz.dynatable.config.sType_PADDING = "PADDING";


///////////////////////////////////////////////////////////////////////////////
// ENTRY POINT
//

nz.dynatable.build = function (arrData, styleDefn, sTableId, nRowsToShow, bMultiSelect, bExtendLastColOverScrollbar, fnCallback) {
    var prefix = "nz.dynatable.build() - ";
    nz.dynatable.log(prefix + "Entering");

    // Default bMultiSelect argument value is false
    bMultiSelect = (typeof bMultiSelect !== 'undefined') ? bMultiSelect : false;

    // Default bExtendLastColOverScrollbar argument value is false
    bExtendLastColOverScrollbar = (typeof bExtendLastColOverScrollbar !== 'undefined') ? bExtendLastColOverScrollbar : false;

    if (arrData.length == 0) {
        console.error(prefix + "ERROR: No data passed to table creation routine build(), inbound array was zero length.");
        return;
    }

    // Cache the settings for use later.  All data pertaining to this table
    // will then be stored in this area.
    nz.dynatable[sTableId] = new Object();
    nz.dynatable[sTableId]["styleDefn"] = styleDefn;
    nz.dynatable[sTableId]["arrData"] = arrData;
    nz.dynatable[sTableId]["nRowsToShow"] = nRowsToShow;
    nz.dynatable[sTableId]["bExtendLastColOverScrollbar"] = bExtendLastColOverScrollbar;
    nz.dynatable[sTableId]["bMultiSelect"] = bMultiSelect;
    nz.dynatable[sTableId]["fnCallback"] = fnCallback;

    if (nz.dynatable[sTableId]["styleDefn"].hasOwnProperty("trClassOdd") &&
        nz.dynatable[sTableId]["styleDefn"].hasOwnProperty("trClassEven")) {
        nz.dynatable[sTableId]["bZebraStripe"] = true;
    }
    else {
        nz.dynatable[sTableId]["bZebraStripe"] = false;
    }


    // Header object is created by walking the inbound data and 
    // creating a property on a new object for every unique 
    // property on the objects in the arrData array.
    var header = nz.dynatable.buildHeaderData(arrData);

    var rawTable =
        nz.dynatable.buildRawTable(
            sTableId,
            arrData,
            header,
            styleDefn,
            nRowsToShow); // rows to make, ie pad to this number            

    // Check that rawtable is defined before attempting next step
    if (fc.utils.isValidVar(rawTable)) {
        nz.dynatable.log(prefix + "CHECK: rawTable has been created, calling buildScrollingTable()...");
        return nz.dynatable.buildScrollingTable(rawTable, nRowsToShow, bExtendLastColOverScrollbar);
    }
    // implicit else
    console.error(prefix + "ERROR: Failed to create rawTable from arrData array of JSON Objects passed in.");
    nz.dynatable.log(prefix + "Exiting");
}


nz.dynatable.buildHeaderData = function (arrayJsonObjects) {
    var prefix = "nz.dynatable.buildHeaderData() - ";
    nz.dynatable.log(prefix + "Entering");

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

    nz.dynatable.log(prefix + "Exiting");
    return header;
}

nz.dynatable.buildRawTable = function (sTableId, arrData, header, styleDefn, nRowsMinimum) {
    var prefix = "nz.dynatable.buildRawTable() - ";
    nz.dynatable.log(prefix + "Entering");

    // This fn takes an array of JSON objects and creates an HTML table from them, 
    // applying the styles listed in the styleDefn object.
    // Click functions are attached to the cells when they are built to avoid having
    // to re-iterate the table and apply them later.  
    // The raw table is padded with blank rows to the nRowsMinimum value.

    if (arguments.length != 5) {
        console.error(prefix + "ERROR: Expected 5 args for this function, received:" + arguments.length.toString());
        return;
    }

    // Calc how many blank rows required and pad later
    var nPaddingRows = nRowsMinimum - arrData.length;

    // Make table
    var table = document.createElement("table");
    var classTable = styleDefn["tableClass"] || "";
    table.className = classTable;
    table.id = sTableId;


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
    var sEmptyString = nz.dynatable.config.sEmptyStringHtml; // "&nbsp";

    // Real Data
    for (var i = 0; i < arrData.length; ++i) {
        var tr = document.createElement("tr");
        tr.className = classRow;
        tr.id = nz.dynatable.getRowName(sTableId, "tr", nz.dynatable.config.sType_DATA, i);

        // arrData[i] is a JSON object in the array.
        // It may or may not have a property for this header
        for (var prop in header) {
            if (header.hasOwnProperty(prop)) {
                // For this column (header), create a data cell.
                // If the json data object has a property for this header,
                // enter it's info and if not, enter an empty string.
                var td = document.createElement("td");
                var tdContent = nz.dynatable.getTdElementContent(arrData[i][prop]);

                td.innerHTML = tdContent;
                td.className = classDataCell;

                td.setAttribute("data-column", prop);
                td.setAttribute("data-value", tdContent);

                tr.appendChild(td);
            }
        }

        table.appendChild(tr);
    }

    // Padding
    for (var i = 0; i < nPaddingRows; ++i) {
        var tr = document.createElement("tr");
        tr.className = classRow;
        tr.id = nz.dynatable.getRowName(sTableId, "tr", nz.dynatable.config.sType_PADDING, i);

        for (var prop in header) {
            if (header.hasOwnProperty(prop)) {
                // For this column (header), create an empty data cell.
                var td = document.createElement("td");

                td.innerHTML = sEmptyString;
                td.className = classDataCell;

                td.setAttribute("data-column", prop);
                td.setAttribute("data-value", sEmptyString);

                tr.appendChild(td);
            }
        }

        table.appendChild(tr);
    }

    nz.dynatable.log(prefix + "Exiting");
    return table;
}

nz.dynatable.buildScrollingTable = function (table, nRowsToShow, bExtendLastCol) {
    var prefix = "nz.dynatable.buildScrollingTable() - ";
    nz.dynatable.log(prefix + "Entering");

    // This function takes a table, and tries to show "nRowsToShow" of it.
    // The table is split so that the body and header are distinct.  
    // This allows the header to remain vertically static and the body to 
    // scroll vertically.  An outer wrapping div controls the horizontal
    // scrolling for the header and body so that they remain aligned.

    // Note that the table should already have the minimum number of rows
    // required.  Shortcut out if that is not the case...
    if (table.rows.length <= nRowsToShow) {
        console.error(prefix + "ERROR: Table passed in did not have enough rows to display correctly.");
        return;
    }

    var sTableId = table.id;

    table.style.tableLayout = "auto";

    // Calculate and Store column widths
    nz.dynatable[table.id].arrayColumnWidths = nz.dynatable.getTableColumnWidths(table);

    var sizeTable = nz.dynatable.getTableSize(table); // This is the size before the table is cut in two

    // Clone the table to make a header only
    var tableHeader = table.cloneNode(true);
    tableHeader.id = nz.dynatable.config.sTableHeaderPrefix + sTableId + nz.dynatable.config.sTableHeaderSuffix;
    nz.dynatable.makeHeaderOnly(tableHeader);

    // Hide the header row on the data part of the table
    //table.rows[0].style.display = "none";
    // Actually, delete the header row
    table.deleteRow(0);

    // If there is a selected style, attach a click function for selectable functionality
    if (nz.dynatable[table.id]["styleDefn"].hasOwnProperty("trClassSelected")) {
        for (var i = 0; i < table.rows.length; ++i) {
            var tr = table.rows[i];
            for (var j = 0; j < tr.cells.length; ++j) {
                fc.utils.addEvent(tr.cells[j], "click", nz.dynatable.dataCell_onClick);
            }
        }
    }

    // Get the table dimensions
    var sizeTableHeader = nz.dynatable.getTableSize(tableHeader, 0);
    var sizeTableBody = nz.dynatable.getTableSize(table, nRowsToShow);

    // Set the table fixed layout, width 100%
    table.style.tableLayout = "fixed";
    tableHeader.style.tableLayout = "fixed";
    var maxTableWidth = sizeTable.width;
    tableHeader.style.width = table.style.width = maxTableWidth.toString() + "px";
    nz.dynatable.setTableColumnWidths(table, nz.dynatable[table.id].arrayColumnWidths);
    nz.dynatable.setTableColumnWidths(tableHeader, nz.dynatable[table.id].arrayColumnWidths);

    // Get scrollbar dimensions
    var sbWidth = fc.utils.getScrollBarWidth();
    var sbHeight = fc.utils.getScrollBarHeight();

    // Extend the last column over the scrollbar, if that is required
    if (bExtendLastCol) {
        nz.dynatable.extendLastColumnOverScrollbar(tableHeader, sbWidth);
    }

    // Make into a sortable table
    nz.dynatable.makeHeaderSortable(table, tableHeader);

    // Zebra stripe if styles are set
    nz.dynatable.resetRows(sTableId, table, true);

    // Create a wrapper div to hold the whole table
    var divShell = document.createElement("div");
    divShell.id = nz.dynatable.config.sDivShellPrefix + sTableId + nz.dynatable.config.sDivShellSuffix;
    divShell.style.overflowX = "auto";
    divShell.style.overflowY = "hidden";
    divShell.style.width = "100%";

    // Create a div to hold the header and the body.
    // The header and body are in a div that is fixed height, but unlimited width
    var divOuter = document.createElement("div");
    divOuter.id = nz.dynatable.config.sDivOuterPrefix + sTableId + nz.dynatable.config.sDivOuterSuffix;
    divOuter.style.overflowX = "hidden";
    divOuter.style.overflowY = "hidden";
    divOuter.style.height = (sizeTableHeader.height + sizeTableBody.height).toString() + "px";

    divOuter.style.width = (maxTableWidth + sbWidth + 1).toString() + "px";

    // Create a div to hold the header
    var divHeader = document.createElement("div");
    divHeader.style.overflow = "hidden"; // There should be no overflow, but just in case...
    divHeader.id = nz.dynatable.config.sDivHeaderPrefix + sTableId + nz.dynatable.config.sDivHeaderSuffix;
    divHeader.style.height = (sizeTableHeader.height).toString() + "px";

    // Optionally add in the width of the scrollbar to this div width
    var sDivHeaderWidth = (maxTableWidth + 1 + (bExtendLastCol ? sbWidth : 0)).toString() + "px";
    divHeader.style.width = sDivHeaderWidth;

    // Create a div to hold the body
    var divBody = document.createElement("div");
    divBody.style.overflowX = "hidden";
    divBody.style.overflowY = "scroll";
    divBody.id = nz.dynatable.config.sDivBodyPrefix + sTableId + nz.dynatable.config.sDivBodySuffix;
    divBody.style.height = (sizeTableBody.height).toString() + "px";
    divBody.style.width = (maxTableWidth + sbWidth + 1).toString() + "px";

    // Join the components
    divHeader.appendChild(tableHeader);
    divBody.appendChild(table);
    divOuter.appendChild(divHeader);
    divOuter.appendChild(divBody);

    divShell.appendChild(divOuter);


    nz.dynatable.log(prefix + "Exiting");
    return divShell;
}

nz.dynatable.rebuild = function (sTableId, arrDataNew) {
    var prefix = "nz.dynatable.rebuild() - ";
    nz.dynatable.log(prefix + "Entering");

    // If a new data array is supplied, use that. 
    // If not, the array may have been changed externally, so use the existing
    // array and rebuild from that.

    if (typeof arrDataNew !== 'undefined') {
        nz.dynatable[sTableId]["arrData"] = arrDataNew;
    }

    // Rebuild header and store
    nz.dynatable[sTableId]["header"] = nz.dynatable.buildHeaderData(nz.dynatable[sTableId]["arrData"]);

    var rawTable_rebuild = nz.dynatable.buildRawTable(
        sTableId,
        nz.dynatable[sTableId]["arrData"],
        nz.dynatable[sTableId]["header"],
        nz.dynatable[sTableId]["styleDefn"],
        nz.dynatable[sTableId]["nRowsToShow"]);


    var divShell_rebuild = nz.dynatable.buildScrollingTable(
        rawTable_rebuild,
        nz.dynatable[sTableId]["nRowsToShow"],
        nz.dynatable[sTableId]["bExtendLastColOverScrollbar"]);

    // We have a new divOuter.
    // Get the old divOuter's parent, drop it's child called divOuter, attach this one.
    var divShellId = nz.dynatable.config.sDivShellPrefix + sTableId + nz.dynatable.config.sDivShellSuffix;
    var divShell = document.getElementById(divShellId);
    var divShellParent = divShell.parentNode;
    divShellParent.removeChild(divShell);
    divShellParent.appendChild(divShell_rebuild);

    nz.dynatable.log(prefix + "Exiting");

    return divShell_rebuild;
}


nz.dynatable.getTableSize = function (table, nRowsToShow) {
    var prefix = "nz.dynatable.getTableSize() - ";
    nz.dynatable.log(prefix + "Entering");

    if (nRowsToShow == 0 || nRowsToShow === 'undefined') {
        return nz.dynatable.getTableSize_Sub(table);
    }

    // We have a subset of rows to show.
    // Clone the table, trim to the number of rows, get that height
    var tableClone = table.cloneNode(true);

    for (var k = tableClone.rows.length; k > nRowsToShow; --k) {
        // When k gets to 1, we should have only row zero left
        //tableClone.removeChild(table.rows[k - 1]);
        tableClone.deleteRow(k - 1);
    }


    nz.dynatable.log(prefix + "Exiting");
    return nz.dynatable.getTableSize_Sub(tableClone);
}

nz.dynatable.getTableSize_Sub = function (table) {
    var prefix = "nz.dynatable.getTableSize_Sub() - ";
    nz.dynatable.log(prefix + "Entering");

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

    nz.dynatable.log(prefix + "Exiting");

    return size;
}


nz.dynatable.makeHeaderOnly = function (table) {
    var prefix = "nz.dynatable.makeHeaderOnly() - ";
    nz.dynatable.log(prefix + "Entering");

    for (var k = table.rows.length; k > 1; --k) {
        // When k gets to 1, we should have only row zero left
        table.deleteRow(k - 1);
    }

    nz.dynatable.log(prefix + "Exiting");
}

nz.dynatable.setTableColumnWidths = function (table, arrayColumnWidths) {
    var prefix = "nz.dynatable.setTableColumnWidths() - ";
    nz.dynatable.log(prefix + "Entering");

    // Iterate the table and set width settings for each cell
    if (table.rows.length > 0) {
        for (var j = 0; j < table.rows[0].cells.length; ++j) {
            var width = arrayColumnWidths[j] || 0;
            table.rows[0].cells[j].style.width = width.toString() + "px";
        }
    }

    nz.dynatable.log(prefix + "Exiting");
}


nz.dynatable.getTableColumnWidths = function (table) {
    var prefix = "nz.dynatable.getTableColumnWidths() - ";
    nz.dynatable.log(prefix + "Entering");

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

    nz.dynatable.log(prefix + "Exiting");
    return arrayColumnWidths;
}

nz.dynatable.extendLastColumnOverScrollbar = function (tableHeader, sbWidth) {
    var prefix = "nz.dynatable.extendLastColumnOverScrollbar() - ";
    nz.dynatable.log(prefix + "Entering");

    var index = tableHeader.rows[0].cells.length - 1;
    var cellLastHeader = tableHeader.rows[0].cells[index];
    var sWidth = cellLastHeader.style.width;
    var nWidth = parseInt(sWidth);
    nWidth = nWidth + sbWidth;
    sWidth = nWidth.toString() + "px";
    cellLastHeader.style.width = sWidth;

    nz.dynatable.log(prefix + "Exiting");
}

nz.dynatable.dataCell_onClick = function () {
    var prefix = "nz.dynatable.dataCell_onClick() - ";
    nz.dynatable.log(prefix + "Entering");

    // A data cell in the table has been clicked on.
    // If this row is already selected, we deselect.
    // If this row is not selected, set selected, then check mode.
    // If in multi select mode, do nothing more, rows are independent.
    // If in single select mode, deselect all other selected rows.    
    // Keyword=Selectable

    var row = this.parentNode;

    if (fc.utils.isInvalidVar(row)) {
        console.error(prefix + "ERROR: Clicked cell did not have valid row as a parent.");
        return;
    }

    var table = row.parentNode;
    var sTableId = table.id;

    var trClassSelected = nz.dynatable[sTableId]["styleDefn"]["trClassSelected"];
    var trClass = nz.dynatable[sTableId]["styleDefn"]["trClass"];
    var bMultiSelect = nz.dynatable[sTableId]["bMultiSelect"];
    var fnCallback = nz.dynatable[sTableId]["fnCallback"];

    if (row.className == trClassSelected) {
        // Deselect this row
        nz.dynatable.setRowDeselected(sTableId, row, row.rowIndex);
    }
    else {
        // Check mode, if single, deselect all rows
        if (bMultiSelect == false) {
            // Single Select Mode
            nz.dynatable.resetRows(sTableId, table, false);
        }

        // Select this row
        row.className = trClassSelected;
    }

    var arrSelectedRows = nz.dynatable.getSelectedRows(table);

    // Call the callback with the row clicked on
    if (fc.utils.isValidVar(fnCallback)) {
        if (typeof fnCallback === "function") {
            try {
                fnCallback(arrSelectedRows);
            }
            catch (ex) {
                var msgException = "Failed during callback for dataCell_onClick event with exception: " + ex.message;
                nz.dynatable.error(prefix + msgException);
            }
        }
        else {
            nz.dynatable.log(prefix + "Not calling callback function because callback function variable is not of type function.");
        }
    }
    else {
        nz.dynatable.log(prefix + "Not calling callback function because callback function variable is not valid.");
    }

    nz.dynatable.log(prefix + "Exiting");
}


nz.dynatable.getSelectedRows = function (table) {
    var prefix = "nz.dynatable.getSelectedRows() - ";
    nz.dynatable.log(prefix + "Entering");

    // Return a reference to the selected rows.  
    var sTableId = table.id;
    var trClassSelected = nz.dynatable[sTableId]["styleDefn"]["trClassSelected"];

    var arrayRowsSelected = [];
    for (var i = 0; i < table.rows.length; ++i) {
        if (table.rows[i].className == trClassSelected) {
            arrayRowsSelected.push(table.rows[i]);
        }
    }

    nz.dynatable.log(prefix + "Exiting");
    return arrayRowsSelected;
}

nz.dynatable.getSelectedIndices = function (sTableId) {
    var prefix = "nz.dynatable.getSelectedIndices() - ";
    nz.dynatable.log(prefix + "Entering");

    // Return array of indices for the selected rows.  
    // Note that these are indices in the arrData data array, not the table.

    var arrayRowsSelectedIndices = [];

    var table = document.getElementById(sTableId);
    if (fc.utils.isInvalidVar(table)) {
        console.error(prefix + "ERROR: Could not get table element by id using passed id: >" + sTableId + "<");
        return arrayRowsSelectedIndices;
    }

    var trClassSelected = nz.dynatable[sTableId]["styleDefn"]["trClassSelected"];

    for (var i = 0; i < table.rows.length; ++i) {
        var row = table.rows[i];
        if (row.className == trClassSelected) {
            var index = nz.dynatable.getIndexFromRowName(row.id);
            if (index >= 0) arrayRowsSelectedIndices.push(index);
        }
    }

    nz.dynatable.log(prefix + "Exiting");
    return arrayRowsSelectedIndices;
}


nz.dynatable.makeHeaderSortable = function (table,tableHeader) {
    var prefix = "nz.dynatable.makeHeaderSortable() - ";
    nz.dynatable.log(prefix + "Entering");

    // Header table should have one row, rows[0].
    // Attach a function to header cell onclick event to trigger sorting.
    var cells = tableHeader.rows[0].cells;
    for (var i=0; i < cells.length; ++i) {
        (function (n) {                                                         // Call this anonymous function with argument i
            cells[i].onclick = function () {                                    // Attach a function with a closed n value to each header's onclick event
                nz.dynatable.sortrowsFlipOrder(table,tableHeader, n);       // Close off an instance of sortrows with value n and make it a fn
            };
        } (i));
    }

    nz.dynatable.log(prefix + "Exiting");
}

nz.dynatable.sortrowsFlipOrder = function (table,tableHeader,n, comparator) {
    var prefix = "nz.dynatable.sortrowsFlipOrder() - ";
    nz.dynatable.log(prefix + "Entering");

    // Wrapper function that checks the column being ordered, and if it is the
    // same as the last column used for ordering, reverses the sort order
    var sortColCName = table.id + "_SortCol";
    var sortOrderCName = table.id + "_SortOrder";

    var savedCol = fc.utils.getCookie(sortColCName);
    if (savedCol != null && savedCol != "") {
        // We have a saved column - is it this column
        if (savedCol == n.toString()) {
            // We have ordered this column before, flip the order
            var savedOrder = fc.utils.getCookie(sortOrderCName);
            if (savedOrder != null && savedOrder != "") {
                // We have a saved ordering criteria, reverse it and save it
                if (savedOrder == "ASC") {
                    fc.utils.setCookie(sortOrderCName, "DESC", 3);
                }
                else {
                    fc.utils.setCookie(sortOrderCName, "ASC", 3);
                }
            }
        }
    }

    nz.dynatable.sortrows(table, tableHeader,n, comparator);

    nz.dynatable.log(prefix + "Exiting");
}

nz.dynatable.sortrows = function (table, tableHeader, n, comparator) {
    var prefix = "nz.dynatable.sortrows() - ";
    nz.dynatable.log(prefix + "Entering");

    var bColIsNumeric = fc.utils.isColumnNumeric(table, n);
    var sTableId = table.id;

    // Get the cookie settings, if they exist
    var sortOrder = "DESC";
    var sortOrderCName = table.id + "_SortOrder";
    var lastSortOrder = fc.utils.getCookie(sortOrderCName);
    if (lastSortOrder != null && lastSortOrder != "") {
        // Re-apply the saved sort order
        sortOrder = lastSortOrder;
    }
    // else, remains "DESC"

    var rows = table.getElementsByTagName("tr");                                // Get all rows
    rows = Array.prototype.slice.call(rows, 0);                                 // Convert to array as a snapshot
    var rowsBlank = fc.utils.getBlankRows(rows);                                // Extract all blank rows to another storage object

    rows.sort(function (row1, row2) {
        var cell1 = row1.getElementsByTagName("td")[n];                         // Get nth cell
        var cell2 = row2.getElementsByTagName("td")[n];                         // of both rows

        // Handle undefined cell case
        if (typeof (cell1) == 'undefined' && typeof (cell2) == 'undefined') {
            return 0;
        }
        else if (typeof (cell1) == 'undefined') {                                 // cell2 wins, return 1
            return 1;
        }
        else if (typeof (cell2) == 'undefined') {                                 // cell1 wins, return -1
            return -1;
        }

        // Cells are defined, extract values for comparison
        var val1 = cell1.textContent || cell1.innerText;
        var val2 = cell2.textContent || cell2.innerText;

        if (comparator) return comparator(val1, val2); // If you've been passed a fn to use as a comparator, use it
        if (bColIsNumeric) return fc.utils.numericComparator(val1, val2);

        // else, do a default comparison
        return fc.utils.defaultComparator(val1, val2);

    }); // end of arrayAll.sort(function(){});

    // If descending, reverse the data array
    if (sortOrder == "DESC") rows.reverse();

    // Append rows into tbody in sorted order.
    // Note that the rows are implicitly removed, and that any nodes that are 
    // not rows <tr> will be above the sorted rows

    var i = 0;
    for (; i < rows.length; i++) {
        table.appendChild(rows[i]); // Put row back into table
    }

    // Add the blank rows back on
    var countBlankRows = rowsBlank.length;
    for (var i = 0; i < countBlankRows; ++i) {
        table.appendChild(rowsBlank[i][0]);
    }

    // Re-apply the zebra striping
    nz.dynatable.resetRows(sTableId, table, true);

    // Set the column widths of what is now the first row
    nz.dynatable.setTableColumnWidths(table, nz.dynatable[table.id].arrayColumnWidths);

    // Save the sort column and order
    var sortColCName = table.id + "_SortCol";
    fc.utils.setCookie(sortColCName, n.toString(10), 3);
    fc.utils.setCookie(sortOrderCName, sortOrder, 3);

    nz.dynatable.log(prefix + "Exiting");

}  // end of sortrows()

nz.dynatable.applySort = function (sTableId, n, sOrder) {
    var prefix = "nz.dynatable.applySort() - ";
    nz.dynatable.log(prefix + "Entering");

    if (!(sOrder == "ASC" || sOrder == "DESC")) {
        nz.dynatable.log(prefix + "WARNING: 3rd parameter [sOrder] must be either ASC or DESC; passed >" + sOrder + "<");
        return;
    }

    var table = document.getElementById(sTableId);

    if (!fc.utils.isValidVar(table)) {
        console.error(prefix + "ERROR: Could not find table with id >" + sTableId + "<");
        return;
    }

    var tableHeader = nz.dynatable.getTableHeader(sTableId);

    // Set the cookie to the required sort order
    var sortColCName = table.id + "_SortCol";
    var sortOrderCName = table.id + "_SortOrder";
    fc.utils.setCookie(sortColCName, n.toString(10), 3);
    fc.utils.setCookie(sortOrderCName, sOrder, 3);

    nz.dynatable.sortrows(table, tableHeader, n);

    nz.dynatable.log(prefix + "Exiting");
}

// CAUTION: 
// Sorting functions assume that the table is attached to the document,
// because they use document.getElementById() to locate the table.
// If the table is not yet attached, sorts will fail.
// Attach the dynatable, and then call the sort routine.
nz.dynatable.applySortByColumnIndex = function (sTableId, n, sOrder) {
    var prefix = "nz.dynatable.applySortByColumnIndex() - ";
    nz.dynatable.log(prefix + "Entering");

    if (n < 0) {
        console.error(prefix + "ERROR: Column index is negative.");
        return;
    }

    var table = document.getElementById(sTableId);

    if (!fc.utils.isValidVar(table)) {
        console.error(prefix + "ERROR: Could not find table with id >" + sTableId + "<");
        return;
    }

    var nCols = table.rows[0].cells.length;
    if (n >= nCols) {
        console.error(prefix + "ERROR: Column index is greater than the number of columns in the table (" + nCols + ")");
        return;
    }

    nz.dynatable.applySort(sTableId, n, sOrder);

    nz.dynatable.log(prefix + "Exiting");
}

// CAUTION: 
// Sorting functions assume that the table is attached to the document,
// because they use document.getElementById() to locate the table.
// If the table is not yet attached, sorts will fail.
// Attach the dynatable, and then call the sort routine.
nz.dynatable.applySortByColumnName = function (sTableId, sColName, sOrder) {
    var prefix = "nz.dynatable.applySortByColumnName() - ";
    nz.dynatable.log(prefix + "Entering");

    // Function to programmatically apply sort order to a table, rather than
    // the user clicking on a column header.

    var n = nz.dynatable.getIndexByColName(sTableId, sColName);

    if (n == -1) {
        nz.dynatable.log(prefix + "WARNING: Could not find column in table >" + sTableId + "< with column name >" + sColName + "<.  Cannot sort table as requested.");
        return;
    }

    nz.dynatable.applySort(sTableId, n, sOrder);

    nz.dynatable.log(prefix + "Exiting");
}

nz.dynatable.multiSelect = function (sTableId,bMultiSelect) {
    var prefix = "nz.dynatable.multiSelect() - ";
    nz.dynatable.log(prefix + "Entering");

    // Get/Set for multiselect state - true means yes, this table allows multiselection

    if (typeof bMultiSelect !== 'undefined') {
        // Set
        nz.dynatable.log(prefix + "INFO: Setting bMultiSelect to " + (bMultiSelect ? "true" : "false"));
        nz.dynatable[sTableId]["bMultiSelect"] = bMultiSelect;
    }

    nz.dynatable.log(prefix + "Exiting");
    return nz.dynatable[sTableId]["bMultiSelect"];
}

nz.dynatable.setRowDeselected = function (sTableId, row, i) {
    var prefix = "nz.dynatable.setRowDeselected() - ";
    nz.dynatable.log(prefix + "Entering");

    var bZebraStripe = nz.dynatable[sTableId]["bZebraStripe"];
    var trClass = nz.dynatable[sTableId]["styleDefn"]["trClass"];
    var trClassOdd = nz.dynatable[sTableId]["styleDefn"]["trClassOdd"];
    var trClassEven = nz.dynatable[sTableId]["styleDefn"]["trClassEven"];

    if (bZebraStripe) {
        if ((i % 2) == 0) {
            // Even
            row.className = trClassEven;
        }
        else {
            // Odd
            row.className = trClassOdd;
        }
    }
    else {
        row.className = trClass;
    }

    nz.dynatable.log(prefix + "Exiting");
}

nz.dynatable.resetRows = function (sTableId, table, bPreserveSelectedState) {
    var prefix = "nz.dynatable.resetRows() - ";
    nz.dynatable.log(prefix + "Entering");

    // Default syntax; Default to blanking the selected state
    bPreserveSelectedState = (typeof bPreserveSelectedState !== 'undefined') ? bPreserveSelectedState : false;

    var bZebraStripe = nz.dynatable[sTableId]["bZebraStripe"];
    var trClass = nz.dynatable[sTableId]["styleDefn"]["trClass"];
    var trClassOdd = nz.dynatable[sTableId]["styleDefn"]["trClassOdd"];
    var trClassEven = nz.dynatable[sTableId]["styleDefn"]["trClassEven"];
    var trClassSelected = nz.dynatable[sTableId]["styleDefn"]["trClassSelected"];

    for (var i = 0; i < table.rows.length; ++i) {
        row = table.rows[i];
        if (!(bPreserveSelectedState && row.className == trClassSelected)) {
            if (bZebraStripe) {
                row.className = (i % 2 == 0) ? trClassEven : trClassOdd;
            }
            else {
                row.className = trClass;
            }
        }
    }

    nz.dynatable.log(prefix + "Exiting");
}


nz.dynatable.setSelectAll = function (sTableId, bSelectState) {
    var prefix = "nz.dynatable.setSelectAll() - ";
    nz.dynatable.log(prefix + "Entering");

    if (typeof bSelectState === 'undefined') {
        console.error(prefix + "ERROR: No parameter passed to this function.  No default can be assumed.  No action taken.");
        nz.dynatable.log(prefix + "Exiting");
        return;
    }

    var bMultiSelect = nz.dynatable[sTableId]["bMultiSelect"];
    var table = document.getElementById(sTableId);

    if (bSelectState == true) {
        // Select all - only possible in multi select mode
        if (bMultiSelect) {
            var trClassSelected = nz.dynatable[sTableId]["styleDefn"]["trClassSelected"];
            for (var i = 0; i < table.rows.length; ++i) {
                row = table.rows[i];
                row.className = trClassSelected;
            }
        }
        else {
            nz.dynatable.log(prefix + "WARNING: bMultiSelect is false,  mode is SingleSelect, cannot select all.  No action taken.");
        }
    }
    else {
        // Deselect all
        nz.dynatable.resetRows(sTableId, table);
    }
    nz.dynatable.log(prefix + "Exiting");
}


nz.dynatable.getColNameByIndex = function (sTableId, n) {
    var prefix = "nz.dynatable.getColNameByIndex() - ";
    nz.dynatable.log(prefix + "Entering");

    // Passed index n, retrieve the column name from tableHeader

    var tableHeader = nz.dynatable.getTableHeader(sTableId);
    var headerLength = tableHeader.rows[0].cells.length;
    if (n >= headerLength) {
        // Error, index requested is too big for this header
        console.error(prefix + "ERROR: Index >" + n + "< requested from Header with length of >" + headerLength + "<; Cannot retrieve column name.");
        return "";
    }

    var sHeaderText = fc.utils.textContent(tableHeader.rows[0].cells[n])

    nz.dynatable.log(prefix + "Exiting; returning >" + sHeaderText + "<");
    return sHeaderText;
}


nz.dynatable.deleteSelected = function (sTableId, bDeleteSourceData) {
    var prefix = "nz.dynatable.deleteSelected() - ";
    nz.dynatable.log(prefix + "Entering");

    var table = document.getElementById(sTableId);
    var array = nz.dynatable.getSelectedIndices(sTableId);

    nz.dynatable.itemsDelete(table, array, bDeleteSourceData);

    nz.dynatable.log(prefix + "Exiting");
}

nz.dynatable.itemsDelete = function (table, arrRowsToDelete, bDeleteSourceData) {
    var prefix = "nz.dynatable.itemsDelete() - ";
    nz.dynatable.log(prefix + "Entering");

    if (arrRowsToDelete.length == 0) {
        nz.dynatable.log(prefix + "WARNING: Delete routine called with no selected rows.  Illogical, Captain.  No action taken.");
        nz.dynatable.resetRows(table.id, table, false); // Turn off selected rows
        nz.dynatable.log(prefix + "Exiting");
        return;
    }

    arrRowsToDelete.sort(function (a, b) { return (a - b); });
    arrRowsToDelete.reverse(); // When deleting from an array delete 'backwards' so indices do not become invalid

    var sTableId = table.id;
    var arrData = nz.dynatable[sTableId]["arrData"];

    for (var i = 0; i < arrRowsToDelete.length; ++i) {

        // Row handling
        var rowId = nz.dynatable.getRowName(sTableId, "tr", nz.dynatable.config.sType_DATA, arrRowsToDelete[i]);
        var row = document.getElementById(rowId);
        nz.dynatable.blankRow(row);
        table.appendChild(row); // Move to end of table, data should 'shuffle up'

        // Data handling
        if (bDeleteSourceData) {
            arrData.splice(arrRowsToDelete[i], 1);
        }
    }

    // Row names may be out of sync with data, and zebra striping might be wrong.
    // If data was deleted, rebuild, else, re-stripe.
    if (bDeleteSourceData) {
        nz.dynatable.rebuild(sTableId);
    }
    else {
        nz.dynatable.resetRows(sTableId, table, false);
    }

    nz.dynatable.log(prefix + "Exiting");
}

nz.dynatable.blankRow = function (row) {
    for (var i = 0; i < row.cells.length; ++i) {
        var cell = row.cells[i];
        cell.innerHTML = nz.dynatable.config.sEmptyStringHtml;
    }
}

nz.dynatable.getRowName = function (sTableId, sElement, sType, nIndex) {
    return sTableId + "_" + sElement + "_" + sType + "_" + fc.utils.prePad(nIndex.toString(), "0", nz.dynatable.config.nNumericPadding);
}

nz.dynatable.deleteRequest = function (sTableId, bResetSelected) {
    var prefix = "nz.dynatable.deleteRequest() - ";
    nz.dynatable.log(prefix + "Entering");

    // This fn calls back to the parent to say that the table would like
    // to delete certain rows.  This allows the parent to manage the 
    // source data.

    // Default Syntax; Default to true
    bResetSelected = (typeof bResetSelected === 'undefined') ? true : bResetSelected;

    var table = document.getElementById(sTableId);
    var selectedRows = nz.dynatable.getSelectedRows(table);

    var selectedDataIndices = nz.dynatable.getSelectedDataIndices(selectedRows);

    if (bResetSelected) nz.dynatable.resetRows(sTableId, table, false);

    nz.dynatable.log(prefix + "Exiting");
    return selectedDataIndices;
}

nz.dynatable.getSelectedDataIndices = function (rows) {
    // Iterate array of selected rows, get the name, 
    // if data, chew out index and add to return array

    var arrayReturn = [];

    for (var i = 0; i < rows.length; ++i) {
        var index = nz.dynatable.getIndexFromRowName(rows[i].id);
        if (index >= 0) arrayReturn.push(index);
    }

    return arrayReturn;
}

nz.dynatable.getIndexFromRowName = function (sRowName) {
    var arraySplit = sRowName.split("_");

    // [0] == sTableId
    // [1] == sElement eg "tr"
    // [2] == sType eg "DATA" or "PADDING"
    // [3] == sIndex

    // nz.dynatable.config.sType_DATA = "DATA"; nz.dynatable.config.sType_PADDING = "PADDING"; //

    // Ignore padding rows
    if (arraySplit[2] == nz.dynatable.config.sType_DATA) {
        return parseInt(arraySplit[3], 10);
    }
    else {
        return -1;
    }
}

nz.dynatable.greyRows = function (sTableId, sColumnName, sColumnData, bGreyOut) {
    var prefix = "nz.dynatable.greyRows() - ";
    nz.dynatable.log(prefix + "Entering");

    // Default Syntax; This defaults to true, grey out the row
    bGreyOut = (typeof bGreyOut === 'undefined') ? true : bGreyOut;

    if (!nz.dynatable[sTableId]["styleDefn"].hasOwnProperty("tdClassGreyOut")) {
        nz.dynatable.log(prefix + "WARNING: No tdClassGreyOut style is set in the style definition for this table; No action taken.");
        return;
    }


    ///////////////////////////////////////////////////////////////////////////
    // Grey out the rows where the passed column matches the passed data string

    var tdClassGreyOut = nz.dynatable[sTableId]["styleDefn"]["tdClassGreyOut"];
    var tdClass = nz.dynatable[sTableId]["styleDefn"]["tdClass"];

    var rows = nz.dynatable.getRows(sTableId, sColumnName, sColumnData);
    if (typeof rows === 'undefined' || rows.length == 0) {
        nz.dynatable.log(prefix + "WARNING: No rows found matching the criteria");
        return;
    }

    for (var i = 0; i < rows.length; ++i) {
        row = rows[i];
        if (bGreyOut) {
            nz.dynatable.setCellClass(row,tdClassGreyOut); // Set Grey
        }
        else {
            nz.dynatable.setCellClass(row,tdClass); // Set Normal
        }
    }

    nz.dynatable.log(prefix + "Exiting");
    return rows; // caller may interrogate returned rows, saves recalling getRows() again
}

nz.dynatable.setCellClass = function (row, sClass) {
    for (var i = 0; i < row.cells.length; ++i) {
        row.cells[i].className = sClass;
    }
}

nz.dynatable.getRows = function (sTableId, sColumnName, sColumnData) {
    var prefix = "nz.dynatable.getRows() - ";
    nz.dynatable.log(prefix + "Entering");

    var table = document.getElementById(sTableId);
    var tableHeader = nz.dynatable.getTableHeader(sTableId);

    if (tableHeader == null) {
        console.error(prefix + "ERROR: Could not find table header based on sTableId: >" + sTableId + "<");
        return;
    }

    var iCol = nz.dynatable.getIndexByColName(sTableId, sColumnName);

    if (iCol == -1) {
        console.error(prefix + "ERROR: Could not get a column index value for a column called >" + sColumnName + "<");
        return;
    }

    var arrayRows = [];

    // Iterate rows, return an array of refs to rows that match
    for (var i = 0; i < table.rows.length; ++i) {
        var cell = table.rows[i].cells[iCol];
        var cellData = fc.utils.textContent(cell);
        if (cellData == sColumnData)
            arrayRows.push(table.rows[i]);
    }

    nz.dynatable.log(prefix + "Exiting");
    return arrayRows;
}

nz.dynatable.getTableHeader = function (sTableId) {
    var tableHeaderId = nz.dynatable.config.sTableHeaderPrefix + sTableId + nz.dynatable.config.sTableHeaderSuffix;
    return document.getElementById(tableHeaderId);
}

nz.dynatable.getIndexByColName = function (sTableId, sColumnName) {
    var prefix = "nz.dynatable.getIndexByColName() - ";
    nz.dynatable.log(prefix + "Entering");

    // We're passed a header table, we return a zero-based index for the 
    // corresponding column, or -1 for failure.
    var tableHeader = nz.dynatable.getTableHeader(sTableId);

    var row = tableHeader.rows[0];
    for (var i = 0; i < row.cells.length; ++i) {
        var header = fc.utils.textContent(row.cells[i]);
        if (header == sColumnName)
            return i;
    }

    nz.dynatable.log(prefix + "Exiting");
    return -1;
}

nz.dynatable.getTdElementContent = function (arg) {
    // Take a variable and return a sensible string to show in the table

    if (typeof arg === 'undefined' || arg == null) {
        return nz.dynatable.config.sEmptyStringHtml;
    }

    if (typeof arg == 'string' || arg instanceof String) {
        if (arg == "" || arg == " ") {
            return nz.dynatable.config.sEmptyStringHtml; // Empty string, replace with nbsp
        }
        else {
            return arg; // Not empty, not a string, send it back unchanged
        }
    }

    // Not a string, not undefined and not null, try to convert to string and return...
    return arg.toString();
}


// If a callback is not set when the table is built, it can be set afterwards, using this function.
nz.dynatable.SetCallback = function (sTableId, fnCallback) {
    var prefix = "nz.dynatable.SetCallback() - ";
    nz.dynatable.log(prefix + "Entering");

    // Sanity
    if (fc.utils.isInvalidVar(fnCallback)) {
        nz.dynatable.error(prefix + "Callback function argument is not a valid variable.");
        return;
    }

    if (typeof fnCallback !== "function") {
        nz.dynatable.error(prefix + "Callback function argument is not of type function, it is type " + (typeof fnCallback) + ".");
        return;
    }

    // Now confirmed that we have a function.
    nz.dynatable[sTableId]["fnCallback"] = fnCallback;

    nz.dynatable.log(prefix + "Exiting; Callback function saved.");
}
