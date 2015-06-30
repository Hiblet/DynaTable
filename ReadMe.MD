DynaTable
---------

What: 

A DynaTable is an HTML table that has a fixed header and a vertically scrolling body.
The header and body scroll horizontally together.  
The intention is to have clickable headers to sort the columns, and also to allow highlighted rows.
A callback facility has been added to return an array of currently selected rows when a row is selected or deselected.

How:

Only using native Javascript, largely based on cross browser compatible routines in Flanagan.  
