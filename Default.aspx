﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    
    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
    <script type="text/javascript" src="<%= ResolveClientUrl("~/js/FCUtils.js") %>"></script>
    <script type="text/javascript" src="<%= ResolveClientUrl("~/js/DynaTable.js") %>"></script>
    <script type="text/javascript" src="<%= ResolveClientUrl("~/js/Default.js") %>"></script>

    <link rel="Stylesheet" type="text/css" href="<%= ResolveClientUrl("~/Default.css") %>" />    
    
    <title>DynaTable Experiment</title>


</head>
<body>
    <form id="form1" runat="server">
    <div>
    
        <input type="button" id="btnToggleMultiSelect" value="Toggle MultiSelect: ?" />
        <input type="button" id="btnSelectAll" value="Select All" />
        <input type="button" id="btnDeselectAll" value="Deselect All" />
        <input type="button" id="btnDeleteSelected" value="Delete" />
        <input type="button" id="btnDeleteRequest" value="Delete Request" />
        <br />
        <input type="button" id="btnGreyOutToggle" value="Toggle GreyOut" />
        <input type="button" id="btnApplySort" value="Apply Sort" />

        <br />
        <br />
    
        <div id="divContainer">
        </div>

        <br />
        <br />
        Callback Feedback:<br />
        <label id="lblCallbackFeedback"></label>
        <br />
        <br />

    </div>
    </form>
</body>
</html>
