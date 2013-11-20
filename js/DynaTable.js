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



///////////////////////////////////////////////////////////////////////////////
// Set some class variables up
//
kawasu.dynatable.config = new Object();
kawasu.dynatable.config.sTableHeaderPrefix = "table_";
kawasu.dynatable.config.sTableHeaderSuffix = "_Header";
kawasu.dynatable.config.sDivHeaderPrefix = "div_";
kawasu.dynatable.config.sDivHeaderSuffix = "_Header";
kawasu.dynatable.config.sDivBodyPrefix = "div_";
kawasu.dynatable.config.sDivBodySuffix = "_Body";
kawasu.dynatable.config.sDivOuterPrefix = "div_";
kawasu.dynatable.config.sDivOuterSuffix = "_Outer";

kawasu.dynatable.config.sEmptyStringHtml = "&nbsp";
kawasu.dynatable.config.nNumericPadding = 6;
kawasu.dynatable.config.sType_DATA = "DATA";
kawasu.dynatable.config.sType_PADDING = "PADDING";


///////////////////////////////////////////////////////////////////////////////
// ENTRY POINT
//

kawasu.dynatable.build = function (arrData, styleDefn, sTableId, nRowsToShow, bMultiSelect, bExtendLastColOverScrollbar) {
    var prefix = "kawasu.dynatable.build() - ";
    console.log(prefix + "Entering");

    // Default bMultiSelect argument value is false
    bMultiSelect = (typeof bMultiSelect !== 'undefined') ? bMultiSelect : false;

    // Default bExtendLastColOverScrollbar argument value is false
    bExtendLastColOverScrollbar = (typeof bExtendLastColOverScrollbar !== 'undefined') ? bExtendLastColOverScrollbar : false;

    if (arrData.length == 0) {
        console.log(prefix + "ERROR: No data passed to table creation routine build(), inbound array was zero length.");
        return;
    }

    // Cache the settings for use later.  All data pertaining to this table
    // will then be stored in this area.
    kawasu.dynatable[sTableId] = new Object();
    kawasu.dynatable[sTableId]["styleDefn"] = styleDefn;
    kawasu.dynatable[sTableId]["arrData"] = arrData;
    kawasu.dynatable[sTableId]["nRowsToShow"] = nRowsToShow;
    kawasu.dynatable[sTableId]["bExtendLastColOverScrollbar"] = bExtendLastColOverScrollbar;
    kawasu.dynatable[sTableId]["bMultiSelect"] = bMultiSelect;

    if (kawasu.dynatable[sTableId]["styleDefn"].hasOwnProperty("trClassOdd") &&
        kawasu.dynatable[sTableId]["styleDefn"].hasOwnProperty("trClassEven")) {
        kawasu.dynatable[sTableId]["bZebraStripe"] = true;
    }
    else {
        kawasu.dynatable[sTableId]["bZebraStripe"] = false;
    }


    // Header object is created by walking the inbound data and 
    // creating a property on a new object for every unique 
    // property on the objects in the arrData array.
    var header = kawasu.dynatable.buildHeaderData(arrData);

    var rawTable =
        kawasu.dynatable.buildRawTable(
            sTableId,
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

kawasu.dynatable.buildRawTable = function (sTableId, arrData, header, styleDefn, nRowsMinimum) {
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
    var sEmptyString = kawasu.dynatable.config.sEmptyStringHtml; // "&nbsp";

    // Real Data
    for (var i = 0; i < arrData.length; ++i) {
        var tr = document.createElement("tr");
        tr.className = classRow;
        tr.id = kawasu.dynatable.getRowName(sTableId, "tr", kawasu.dynatable.config.sType_DATA, i);

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

    // Padding
    for (var i = 0; i < nPaddingRows; ++i) {
        var tr = document.createElement("tr");
        tr.className = classRow;
        tr.id = kawasu.dynatable.getRowName(sTableId, "tr", kawasu.dynatable.config.sType_PADDING, i);

        for (var prop in header) {
            if (header.hasOwnProperty(prop)) {
                // For this column (header), create an empty data cell.
                var td = document.createElement("td");
                td.innerHTML = sEmptyString;
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

    var sTableId = table.id;

    table.style.tableLayout = "auto";
    var arrayColumnWidths = kawasu.dynatable.getTableColumnWidths(table);
    var sizeTable = kawasu.dynatable.getTableSize(table); // This is the size before the table is cut in two

    // Clone the table to make a header only
    var tableHeader = table.cloneNode(true);
    tableHeader.id = kawasu.dynatable.config.sTableHeaderPrefix + sTableId + kawasu.dynatable.config.sTableHeaderSuffix;
    kawasu.dynatable.makeHeaderOnly(tableHeader);

    // Hide the header row on the data part of the table
    //table.rows[0].style.display = "none";
    // Actually, delete the header row
    table.deleteRow(0);

    // If there is a selected style, attach a click function for selectable functionality
    if (kawasu.dynatable[table.id]["styleDefn"].hasOwnProperty("trClassSelected")) {
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

    // Extend the last column over the scrollbar, if that is required
    if (bExtendLastCol) {
        kawasu.dynatable.extendLastColumnOverScrollbar(tableHeader, sbWidth);
    }

    // Make into a sortable table
    kawasu.dynatable.makeHeaderSortable(table, tableHeader);

    // Zebra stripe if styles are set
    kawasu.dynatable.resetRows(sTableId,table,true);

    // Create a div to hold the header and the body.
    // The header and body are in a div that is fixed height, but unlimited width
    var divOuter = document.createElement("div");
    divOuter.id = kawasu.dynatable.config.sDivOuterPrefix + sTableId + kawasu.dynatable.config.sDivOuterSuffix;
    divOuter.style.overflowX = "scroll";
    divOuter.style.overflowY = "hidden";
    divOuter.style.height = (sizeTableHeader.height + sizeTableBody.height + sbHeight).toString() + "px";

    // Don't set the width on the outer div - The width comes from the containing parent div
    //divOuter.style.width = (maxTableWidth + sbWidth +1).toString() + "px";

    // Create a div to hold the header
    var divHeader = document.createElement("div");
    divHeader.style.overflow = "hidden"; // There should be no overflow, but just in case...
    divHeader.id = kawasu.dynatable.config.sDivHeaderPrefix + sTableId + kawasu.dynatable.config.sDivHeaderSuffix;
    divHeader.style.height = (sizeTableHeader.height).toString() + "px";

    // Optionally add in the width of the scrollbar to this div width
    var sDivHeaderWidth = (maxTableWidth + 1 + (bExtendLastCol ? sbWidth : 0)).toString() + "px";
    divHeader.style.width = sDivHeaderWidth;

    // Create a div to hold the body
    var divBody = document.createElement("div");
    divBody.style.overflowX = "hidden";
    divBody.style.overflowY = "scroll";
    divBody.id = kawasu.dynatable.config.sDivBodyPrefix + sTableId + kawasu.dynatable.config.sDivBodySuffix;
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

kawasu.dynatable.rebuild = function (sTableId, arrDataNew) {
    var prefix = "kawasu.dynatable.rebuild() - ";
    console.log(prefix + "Entering");

    // If a new data array is supplied, use that. 
    // If not, the array may have been changed externally, so use the existing
    // array and rebuild from that.

    if (typeof arrDataNew !== 'undefined') {
        kawasu.dynatable[sTableId]["arrData"] = arrDataNew;
    }

    // Rebuild header and store
    kawasu.dynatable[sTableId]["header"] = kawasu.dynatable.buildHeaderData(kawasu.dynatable[sTableId]["arrData"]);

    var rawTable_rebuild = kawasu.dynatable.buildRawTable(
        sTableId,
        kawasu.dynatable[sTableId]["arrData"],
        kawasu.dynatable[sTableId]["header"],
        kawasu.dynatable[sTableId]["styleDefn"],
        kawasu.dynatable[sTableId]["nRowsToShow"]);


    var divOuter_rebuild = kawasu.dynatable.buildScrollingTable(
        rawTable_rebuild,
        kawasu.dynatable[sTableId]["nRowsToShow"],
        kawasu.dynatable[sTableId]["bExtendLastColOverScrollbar"]);

    // We have a new divOuter.
    // Get the old divOuter's parent, drop it's child called divOuter, attach this one.
    var divOuterId = kawasu.dynatable.config.sDivOuterPrefix + sTableId + kawasu.dynatable.config.sDivOuterSuffix;
    var divOuter = document.getElementById(divOuterId);
    var divOuterParent = divOuter.parentNode;
    divOuterParent.removeChild(divOuter);
    divOuterParent.appendChild(divOuter_rebuild);

    console.log(prefix + "Exiting");

    return divOuter_rebuild;
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
    // If this row is already selected, we deselect.
    // If this row is not selected, set selected, then check mode.
    // If in multi select mode, do nothing more, rows are independent.
    // If in single select mode, deselect all other selected rows.    
    // Keyword=Selectable

    var row = this.parentNode;

    if (fc.utils.isInvalidVar(row)) {
        console.log(prefix + "ERROR: Clicked cell did not have valid row as a parent.");
        return;
    }

    var table = row.parentNode;
    var sTableId = table.id;

    var trClassSelected = kawasu.dynatable[sTableId]["styleDefn"]["trClassSelected"];
    var trClass = kawasu.dynatable[sTableId]["styleDefn"]["trClass"];
    var bMultiSelect = kawasu.dynatable[sTableId]["bMultiSelect"];

    if (row.className == trClassSelected) {
        // Deselect this row
        kawasu.dynatable.setRowDeselected(sTableId, row, row.rowIndex);
    }
    else {
        // Check mode, if single, deselect all rows
        if (bMultiSelect == false) {
            // Single Select Mode
            kawasu.dynatable.resetRows(sTableId, table, false);
        }

        // Select this row
        row.className = trClassSelected;
    }

    console.log(prefix + "Exiting");
}


kawasu.dynatable.dataCell_onClick1 = function () {
    var prefix = "kawasu.dynatable.dataCell_onClick1() - ";
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
    var sTableId = table.id;

    var trClassSelected = kawasu.dynatable[sTableId]["styleDefn"]["trClassSelected"];
    var trClass = kawasu.dynatable[sTableId]["styleDefn"]["trClass"];

    if (row.className == trClassSelected) {
        // This row is already selected, 
        // so toggle it to deselected
        kawasu.dynatable.setRowDeselected(sTableId, row, row.rowIndex);
    }
    else {
        // This row is not selected, 
        // so deselect the current selected row (if one exists) and select this one
        var bFound = false;
        for (var i = 0; (i < table.rows.length) && (bFound == false); ++i) {
            if (table.rows[i].className == trClassSelected) {
                // Found the selected row
                bFound = true; // early exit from loop
                kawasu.dynatable.setRowDeselected(sTableId, rows[i], i);
            }
        }
        row.className = trClassSelected;
    }

    console.log(prefix + "Exiting");
}

kawasu.dynatable.getSelectedRows = function (table) {
    var prefix = "kawasu.dynatable.getSelectedRows() - ";
    console.log(prefix + "Entering");

    // Return a reference to the selected rows.  
    var sTableId = table.id;
    var trClassSelected = kawasu.dynatable[sTableId]["styleDefn"]["trClassSelected"];

    var arrayRowsSelected = [];
    for (var i = 0; i < table.rows.length; ++i) {
        if (table.rows[i].className == trClassSelected) {
            arrayRowsSelected.push(table.rows[i]);
        }
    }

    console.log(prefix + "Exiting");
    return arrayRowsSelected;
}

kawasu.dynatable.getSelectedIndices = function (table) {
    var prefix = "kawasu.dynatable.getSelectedIndices() - ";
    console.log(prefix + "Entering");

    // Return array of indices for the selected rows.  
    var sTableId = table.id;
    var trClassSelected = kawasu.dynatable[sTableId]["styleDefn"]["trClassSelected"];

    var arrayRowsSelectedIndices = [];
    for (var i = 0; i < table.rows.length; ++i) {
        var row = table.rows[i];
        if (row.className == trClassSelected) {
            var index = kawasu.dynatable.getIndexFromRowName(row.id);
            if (index >= 0) arrayRowsSelectedIndices.push(index);
        }
    }

    console.log(prefix + "Exiting");
    return arrayRowsSelectedIndices;
}


kawasu.dynatable.makeHeaderSortable = function (table,tableHeader) {
    var prefix = "kawasu.dynatable.makeHeaderSortable() - ";
    console.log(prefix + "Entering");

    // Header table should have one row, rows[0].
    // Attach a function to header cell onclick event to trigger sorting.
    var cells = tableHeader.rows[0].cells;
    for (var i=0; i < cells.length; ++i) {
        (function (n) {                                                         // Call this anonymous function with argument i
            cells[i].onclick = function () {                                    // Attach a function with a closed n value to each header's onclick event
                kawasu.dynatable.sortrowsFlipOrder(table,tableHeader, n);       // Close off an instance of sortrows with value n and make it a fn
            };
        } (i));
    }

    console.log(prefix + "Exiting");
}

kawasu.dynatable.sortrowsFlipOrder = function (table,tableHeader,n, comparator) {
    var prefix = "kawasu.dynatable.sortrowsFlipOrder() - ";
    console.log(prefix + "Entering");

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

    kawasu.dynatable.sortrows(table, tableHeader,n, comparator);

    console.log(prefix + "Exiting");
}

kawasu.dynatable.sortrows = function (table, tableHeader, n, comparator) {
    var prefix = "kawasu.dynatable.sortrows() - ";
    console.log(prefix + "Entering");

    // Note: I need to keep the data and the rows 'in step', so that indices
    // are the same.  That is a pre-requisite of deletion of selected items,
    // I find the selecte row's indices and translate that to the data.
    // To do that, temporarily unite the data to the row and sort together,
    // then re-split.

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

    kawasu.dynatable.resetRows(sTableId, table, true);

    // Save the sort column and order
    var sortColCName = table.id + "_SortCol";
    fc.utils.setCookie(sortColCName, n.toString(10), 3);
    fc.utils.setCookie(sortOrderCName, sortOrder, 3);

    console.log(prefix + "Exiting");

}  // end of sortrows() 


kawasu.dynatable.multiSelect = function (sTableId,bMultiSelect) {
    var prefix = "kawasu.dynatable.multiSelect() - ";
    console.log(prefix + "Entering");

    // Get/Set for multiselect state - true means yes, this table allows multiselection

    if (typeof bMultiSelect !== 'undefined') {
        // Set
        console.log(prefix + "INFO: Setting bMultiSelect to " + (bMultiSelect ? "true" : "false"));
        kawasu.dynatable[sTableId]["bMultiSelect"] = bMultiSelect;
    }

    console.log(prefix + "Exiting");
    return kawasu.dynatable[sTableId]["bMultiSelect"];
}

kawasu.dynatable.setRowDeselected = function (sTableId, row, i) {
    var prefix = "kawasu.dynatable.setRowDeselected() - ";
    console.log(prefix + "Entering");

    var bZebraStripe = kawasu.dynatable[sTableId]["bZebraStripe"];
    var trClass = kawasu.dynatable[sTableId]["styleDefn"]["trClass"];
    var trClassOdd = kawasu.dynatable[sTableId]["styleDefn"]["trClassOdd"];
    var trClassEven = kawasu.dynatable[sTableId]["styleDefn"]["trClassEven"];

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

    console.log(prefix + "Exiting");
}

kawasu.dynatable.resetRows = function (sTableId, table, bPreserveSelectedState) {
    var prefix = "kawasu.dynatable.resetRows() - ";
    console.log(prefix + "Entering");

    // Default syntax; Default to blanking the selected state
    bPreserveSelectedState = (typeof bPreserveSelectedState !== 'undefined') ? bPreserveSelectedState : false;

    var bZebraStripe = kawasu.dynatable[sTableId]["bZebraStripe"];
    var trClass = kawasu.dynatable[sTableId]["styleDefn"]["trClass"];
    var trClassOdd = kawasu.dynatable[sTableId]["styleDefn"]["trClassOdd"];
    var trClassEven = kawasu.dynatable[sTableId]["styleDefn"]["trClassEven"];
    var trClassSelected = kawasu.dynatable[sTableId]["styleDefn"]["trClassSelected"];

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

    console.log(prefix + "Exiting");
}


kawasu.dynatable.setSelectAll = function (sTableId, bSelectState) {
    var prefix = "kawasu.dynatable.setSelectAll() - ";
    console.log(prefix + "Entering");

    if (typeof bSelectState === 'undefined') {
        console.log(prefix + "ERROR: No parameter passed to this function.  No default can be assumed.  No action taken.");
        console.log(prefix + "Exiting");
        return;
    }

    var bMultiSelect = kawasu.dynatable[sTableId]["bMultiSelect"];
    var table = document.getElementById(sTableId);

    if (bSelectState == true) {
        // Select all - only possible in multi select mode
        if (bMultiSelect) {
            var trClassSelected = kawasu.dynatable[sTableId]["styleDefn"]["trClassSelected"];
            for (var i = 0; i < table.rows.length; ++i) {
                row = table.rows[i];
                row.className = trClassSelected;
            }
        }
        else {
            console.log(prefix + "WARNING: bMultiSelect is false,  mode is SingleSelect, cannot select all.  No action taken.");
        }
    }
    else {
        // Deselect all
        kawasu.dynatable.resetRows(sTableId, table);
    }
    console.log(prefix + "Exiting");
}


kawasu.dynatable.getColNameByIndex = function (sTableId, n) {
    var prefix = "kawasu.dynatable.getColNameByIndex() - ";
    console.log(prefix + "Entering");

    // Passed index n, retrieve the column name from tableHeader

    var tableHeader = kawasu.dynatable.getTableHeader(sTableId);
    var headerLength = tableHeader.rows[0].cells.length;
    if (n >= headerLength) {
        // Error, index requested is too big for this header
        console.log(prefix + "ERROR: Index >" + n + "< requested from Header with length of >" + headerLength + "<; Cannot retrieve column name.");
        return "";
    }

    var sHeaderText = fc.utils.textContent(tableHeader.rows[0].cells[n])

    console.log(prefix + "Exiting; returning >" + sHeaderText + "<");
    return sHeaderText;
}


kawasu.dynatable.deleteSelected = function (sTableId, bDeleteSourceData) {
    var prefix = "kawasu.dynatable.deleteSelected() - ";
    console.log(prefix + "Entering");

    var table = document.getElementById(sTableId);
    var array = kawasu.dynatable.getSelectedIndices(table);

    kawasu.dynatable.itemsDelete(table, array, bDeleteSourceData);

    console.log(prefix + "Exiting");
}

kawasu.dynatable.itemsDelete = function (table, arrRowsToDelete, bDeleteSourceData) {
    var prefix = "kawasu.dynatable.itemsDelete() - ";
    console.log(prefix + "Entering");

    if (arrRowsToDelete.length == 0) {
        console.log(prefix + "WARNING: Delete routine called with no selected rows.  Illogical, Captain.  No action taken.");
        kawasu.dynatable.resetRows(table.id, table, false); // Turn off selected rows
        console.log(prefix + "Exiting");
        return;
    }

    arrRowsToDelete.sort(function (a, b) { return (a - b); });
    arrRowsToDelete.reverse(); // When deleting from an array delete 'backwards' so indices do not become invalid

    var sTableId = table.id;
    var arrData = kawasu.dynatable[sTableId]["arrData"];

    for (var i = 0; i < arrRowsToDelete.length; ++i) {

        // Row handling
        var rowId = kawasu.dynatable.getRowName(sTableId, "tr", kawasu.dynatable.config.sType_DATA, arrRowsToDelete[i]);
        var row = document.getElementById(rowId);
        kawasu.dynatable.blankRow(row);
        table.appendChild(row); // Move to end of table, data should 'shuffle up'

        // Data handling
        if (bDeleteSourceData) {
            arrData.splice(arrRowsToDelete[i], 1);
        }
    }

    // Row names may be out of sync with data, and zebra striping might be wrong.
    // If data was deleted, rebuild, else, re-stripe.
    if (bDeleteSourceData) {
        kawasu.dynatable.rebuild(sTableId);
    }
    else {
        kawasu.dynatable.resetRows(sTableId, table, false);
    }

    console.log(prefix + "Exiting");
}

kawasu.dynatable.blankRow = function (row) {
    for (var i = 0; i < row.cells.length; ++i) {
        var cell = row.cells[i];
        cell.innerHTML = kawasu.dynatable.config.sEmptyStringHtml;
    }
}

kawasu.dynatable.getRowName = function (sTableId, sElement, sType, nIndex) {
    return sTableId + "_" + sElement + "_" + sType + "_" + fc.utils.prePad(nIndex.toString(), "0", kawasu.dynatable.config.nNumericPadding);
}

kawasu.dynatable.deleteRequest = function (sTableId, bResetSelected) {
    var prefix = "kawasu.dynatable.deleteRequest() - ";
    console.log(prefix + "Entering");

    // This fn calls back to the parent to say that the table would like
    // to delete certain rows.  This allows the parent to manage the 
    // source data.

    // Default Syntax; Default to true
    bResetSelected = (typeof bResetSelected === 'undefined') ? true : bResetSelected;

    var table = document.getElementById(sTableId);
    var selectedRows = kawasu.dynatable.getSelectedRows(table);

    var selectedDataIndices = kawasu.dynatable.getSelectedDataIndices(selectedRows);

    if (bResetSelected) kawasu.dynatable.resetRows(sTableId, table, false);

    console.log(prefix + "Exiting");
    return selectedDataIndices;
}

kawasu.dynatable.getSelectedDataIndices = function (rows) {
    // Iterate array of selected rows, get the name, 
    // if data, chew out index and add to return array

    var arrayReturn = [];

    for (var i = 0; i < rows.length; ++i) {
        var index = kawasu.dynatable.getIndexFromRowName(rows[i].id);
        if (index >= 0) arrayReturn.push(index);
    }

    return arrayReturn;
}

kawasu.dynatable.getIndexFromRowName = function (sRowName) {
    var arraySplit = sRowName.split("_");

    // [0] == sTableId
    // [1] == sElement eg "tr"
    // [2] == sType eg "DATA" or "PADDING"
    // [3] == sIndex

    // kawasu.dynatable.config.sType_DATA = "DATA"; kawasu.dynatable.config.sType_PADDING = "PADDING"; //

    // Ignore padding rows
    if (arraySplit[2] == kawasu.dynatable.config.sType_DATA) {
        return parseInt(arraySplit[3], 10);
    }
    else {
        return -1;
    }
}

kawasu.dynatable.greyRows = function (sTableId, sColumnName, sColumnData, bGreyOut) {
    var prefix = "kawasu.dynatable.greyRows() - ";
    console.log(prefix + "Entering");

    // Default Syntax; This defaults to true, grey out the row
    bGreyOut = (typeof bGreyOut === 'undefined') ? true : bGreyOut;

    if (!kawasu.dynatable[sTableId]["styleDefn"].hasOwnProperty("trClassGreyOut")) {
        console.log(prefix + "WARNING: No trClassGreyOut style is set in the style definition for this table; No action taken.");
        return;
    }


    ///////////////////////////////////////////////////////////////////////////
    // Grey out the rows where the passed column matches the passed data string

    var trClassGreyOut = kawasu.dynatable[sTableId]["styleDefn"]["trClassGreyOut"];
    var rows = kawasu.dynatable.getRows(sTableId, sColumnName, sColumnData);
    if (typeof rows === 'undefined' || rows.length == 0) {
        console.log(prefix + "WARNING: No rows found matching the criteria");
        return;
    }

    for (var i = 0; i < rows.length; ++i) {
        row = rows[i];
        if (bGreyOut) {
            row.className = row.className + " " + trClassGreyOut;
        }
        else {
            kawasu.dynatable.setRowDeselected(sTableId, row, row.rowIndex);
            // Note, rowIndex should be the index of the row in the table, not 
            // the index of the row in the array returned from getRows().
        }
    }

    console.log(prefix + "Exiting");
    return rows; // caller may interrogate returned rows, saves recalling getRows() again
}

kawasu.dynatable.getRows = function (sTableId, sColumnName, sColumnData) {
    var prefix = "kawasu.dynatable.getRows() - ";
    console.log(prefix + "Entering");

    var table = document.getElementById(sTableId);
    var tableHeader = kawasu.dynatable.getTableHeader(sTableId);

    if (tableHeader == null) {
        console.log(prefix + "ERROR: Could not find table header based on sTableId: >" + sTableId + "<");
        return;
    }

    var iCol = kawasu.dynatable.getIndexByColName(sTableId, sColumnName);

    if (iCol == -1) {
        console.log(prefix + "ERROR: Could not get a column index value for a column called >" + sColumnName + "<");
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

    return arrayRows;

    console.log(prefix + "Exiting");
}

kawasu.dynatable.getTableHeader = function (sTableId) {
    var tableHeaderId = kawasu.dynatable.config.sTableHeaderPrefix + sTableId + kawasu.dynatable.config.sTableHeaderSuffix;
    return document.getElementById(tableHeaderId);
}

kawasu.dynatable.getIndexByColName = function (sTableId, sColumnName) {
    var prefix = "kawasu.dynatable.getIndexByColName() - ";
    console.log(prefix + "Entering");

    // We're passed a header table, we return a zero-based index for the 
    // corresponding column, or -1 for failure.
    var tableHeader = kawasu.dynatable.getTableHeader(sTableId);
    var row = tableHeader.rows[0];
    for (var i = 0; i < row.cells.length; ++i) {
        var header = fc.utils.textContent(row.cells[i]);
        if (header == sColumnName)
            return i;
    }

    console.log(prefix + "Exiting");
    return -1;
}