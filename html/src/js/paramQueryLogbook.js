
$(function () {

    $.getScript("./src/js/FileSaver.js");

    // details tab section

    function onTabsActive(evt, ui) {
        //grid requires refresh whenever corresponding tab is refreshed.
        ui.newPanel.find(".pq-grid").pqGrid("refresh");
    };

    /**
    * does data binding of detail view.
    * return: {jQuery object}
    */
    function initDetail(ui) {
        var rowData = ui.rowData,
            //get a copy of gridDetailModel
            detailobj = gridDetailModel(rowData),
            //get markup of the detail template.                
            html = $("#tmpl").html(),
            //create new detail place holder
            $detail = $("<div></div>");


        for (var key in rowData) {
            var cellData = (rowData[key] == null) ? "" : rowData[key];
            html = html.replace("<#=" + key + "#>", cellData);
        }
        $detail.html(html);

        $detail.find(".pq-tabs").tabs().on("tabsactivate", onTabsActive);

        //append pqGrid in the 2nd tab.                
        $("<div></div>").appendTo($("#tabs-2", $detail)).pqGrid(detailobj);

        return $detail;
    };

    /* another grid in detail view.
    * returns a new copy of detailModel every time the function is called.*/
    var gridDetailModel = function (rowData) {

        return {
            //pageModel: { type: "local", rPP: 5, strRpp: "" },
            sortModel: {
                sorter: [{ dataIndx: 'log_id', dir: "up" }]
            },
            dataModel: {
                location: "remote",
                dataType: "json",
                method: "GET",
                url: ".http://logbook.local/data.php?job=get_logbooks"
                //url = "/pro/orderdetails.php?orderId=" + orderID //for PHP
            },
            colModel: [
                { title: "Log ID", width: 90, dataIndx: "log_id" },
                { title: "Time Stamp", width: 90, dataType: "integer", dataIndx: "timestamp" },
                { title: "Logger", width: 230, dataIndx: "logger" },
                { title: "Log Detail", width: 80, dataIndx: "log_detail"}
            ],
            refresh: function (evt, ui) {
                if (ui.source != "flex") {
                    this.flex();
                }
            },
            height: 'flex',
            width: 'flex',
            maxHeight: 200,
            hwrap: false,
            numberCell: { show: false },
            showTop: false
        };
    };


    function changeFormat(value) {
        d1 = value ? value.split('/') : null;
        return value ? d1[1] + '/' + d1[0] + '/' + d1[2] : "";
    }
    function pqDatePicker(ui) {
        var $this = ui.$editor;
        $this
            //.css({ zIndex: 3, position: "relative" })
            .datepicker({
                yearRange: "-20:+0", //20 years prior to present.
                changeYear: true,
                changeMonth: true,
                dateFormat: "dd/mm/yy"
                //showButtonPanel: true
            });
        //default From date
        var $from = $this.filter(".pq-from").datepicker("option", "defaultDate", new Date("01/01/2015"));
        //default To date
        var $to = $this.filter(".pq-to").datepicker("option", "defaultDate", new Date("12/31/2018"));

        var value = changeFormat(ui.column.filter.value),
            value2 = changeFormat(ui.column.filter.value2);

        $from.val(value);
        $to.val(value2);
    }

    function filterhandler() {

        var $toolbar = this.toolbar(),
            $value = $toolbar.find(".filterValue"),
            value = $value.val(),
            condition = $toolbar.find(".filterCondition").val(),
            dataIndx = $toolbar.find(".filterColumn").val(),
            filterRules;

        if (dataIndx == "") {//search through all fields when no field selected.
            filterRules = this.getColModel().map(function (column) {
                return { dataIndx: column.dataIndx, condition: condition, value: value };
            })
        }
        else {//search through selected field.
            filterRules = [{ dataIndx: dataIndx, condition: condition, value: value }];
        }
        this.filter({
            oper: 'replace',
            rules: filterRules
        });
    }
    //filterRender to highlight matching cell text.
    function filterRender(ui) {
        var val = ui.cellData,
            filter = ui.column.filter;
        if (filter && filter.on && filter.value) {
            var condition = filter.condition,
                valUpper = val.toUpperCase(),
                txt = filter.value,
                txt = (txt == null) ? "" : txt.toString(),
                txtUpper = txt.toUpperCase(),
                indx = -1;
            if (condition == "end") {
                indx = valUpper.lastIndexOf(txtUpper);
                //if not at the end
                if (indx + txtUpper.length != valUpper.length) {
                    indx = -1;
                }
            }
            else if (condition == "contain") {
                indx = valUpper.indexOf(txtUpper);
            }
            else if (condition == "begin") {
                indx = valUpper.indexOf(txtUpper);
                //if not at the beginning.
                if (indx > 0) {
                    indx = -1;
                }
            }
            if (indx >= 0) {
                var txt1 = val.substring(0, indx);
                var txt2 = val.substring(indx, indx + txt.length);
                var txt3 = val.substring(indx + txt.length);
                return txt1 + "<span style='background:yellow;color:#333;'>" + txt2 + "</span>" + txt3;
            }
            else {
                return val;
            }
        }
        else {
            return val;
        }
    }

    var truncateRenderSummary = function (ui) {
        var dataRow = ui.rowData.Summary;
        // dataRow = sanitize(dataRow);
        if (dataRow.length > 15)
            return dataRow.substring(0, 17) + '...';
        else
            return dataRow;
    }

    var truncateRenderRFO = function (ui) {
        var dataRow = ui.rowData.RFO;
        // dataRow = sanitize(dataRow);
        if (dataRow.length > 15)
            return dataRow.substring(0, 17) + '...';
        else
            return dataRow;
    }

    var colModel = [
        { title: "TicketNo", dataIndx: "TicketNo", minWidth: '100', align: "center" },
        { title: "Title", minWidth: '150', align: "center", dataIndx: "Title" },
        { title: "Status", minWidth: '150', align: "center", dataIndx: "Status" },
        { title: "Carrier", minWidth: '150', align: "center", dataIndx: "Carrier" },
        { title: "CustomerName", minWidth: '150', align: "center", dataIndx: "CustomerName" },
        { title: "Service", minWidth: '150', align: "center", dataIndx: "Service" },
        {
            title: "Downtime", minWidth: '150', align: "center", dataIndx: "Downtime",
            filter: {
                type: 'textbox',
                condition: "between",
                init: pqDatePicker,
                listeners: [{
                    'change': function (evt, ui) {

                        ui.value = changeFormat(ui.value); //dd/mm to mm/dd
                        ui.value2 = changeFormat(ui.value2); //dd/mm to mm/dd

                        this.filter({
                            oper: "add",
                            rule: ui
                        })
                    }
                }]
            }
        },
        { title: "Uptime", minWidth: '150', align: "center", dataIndx: "Uptime" },
        { title: "Duration", minWidth: '150', align: "center", dataIndx: "Duration" },
        { title: "Summary", minWidth: '150', align: "center", dataIndx: "Summary", render: truncateRenderSummary },
        { title: "NextAction", minWidth: '150', align: "center", dataIndx: "NextAction" },
        { title: "RFO", minWidth: '150', align: "center", dataIndx: "RFO", render: truncateRenderRFO }
    ];

    var dataModel = {
        recIndx: "TicketNo",
        location: "remote",
        dataType: "JSON",
        method: "GET",
        sorting: "local",
        paging: "local",
        sortIndx: "TicketNo",
        sortDir: "down",
        url: "data.php?job=get_logbooks"
        , data: function (dataJSON) {
            var data = dataJSON.data;
            data[0]['pq_detail'] = { 'show': true };
            return { curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: data };
            }
        }   
    var newObj = {
        // scrollModel: { autoFit: true },
        // pageModel: { type: "local", rPP: 15, rPPOptions: [10, 20, 50, 100, 200] },
        width: "100%",
        height: 'flex',
        resizable: true,
        flexHeight: true,
        flexWidth: false,
        collapsible: true,
        hoverMode: 'row',
        pageModel: { type: 'local' },
        dataModel: dataModel,
        columnTemplate: { render: filterRender },
        colModel: colModel,
        filterModel: { mode: 'OR', header: true },
        editable: false,
        showTitle: false,
        editModel: { clicksToEdit: 2 },
        selectionModel: { mode: 'single', type: 'row' },
        detailModel: { init: initDetail },        
        toolbar: {
            cls: "pq-toolbar-search",
            items: [
                { type: 'button', label: 'Add', listeners: [{ click: addRow }], icon: 'ui-icon-plus' },
                { type: 'button', label: 'Edit', listeners: [{ click: editRow }], icon: 'ui-icon-pencil' },
                {
                    type: 'textbox',
                    label: 'Filter: ',
                    attr: 'placeholder="Enter your keyword"',
                    cls: "filterValue",
                    listener: { keyup: filterhandler }
                },
                {
                    type: 'select', cls: "filterColumn",
                    listener: filterhandler,
                    options: function (ui) {
                        var opts = [{ '': '[ All Fields ]' }];
                        this.getColModel().forEach(function (column) {
                            var obj = {};
                            obj[column.dataIndx] = column.title;
                            opts.push(obj);
                        })
                        return opts;
                    }
                },
                {
                    type: 'select',
                    cls: "filterCondition",
                    listener: filterhandler,
                    options: [
                        { "begin": "Begins With" },
                        { "contain": "Contains" },
                        { "end": "Ends With" },
                        { "notcontain": "Does not contain" },
                        { "equal": "Equal To" },
                        { "notequal": "Not Equal To" },
                        { "empty": "Empty" },
                        { "notempty": "Not Empty" },
                        { "less": "Less Than" },
                        { "great": "Great Than" },
                        { "regexp": "Regex" }
                    ]
                },
                {
                    type: 'select',
                    label: 'Format: ',
                    attr: 'id="export_format"',
                    options: [{ xlsx: 'Excel', csv: 'Csv', htm: 'Html', json: 'Json' }]
                },
                {
                    type: 'button',
                    label: "Export",
                    icon: 'ui-icon-arrowthickstop-1-s',
                    listener: function () {

                        var format = $("#export_format").val(),
                            blob = this.exportData({
                                //url: "/pro/demos/exportData",
                                format: format,
                                render: true
                            });
                        if (typeof blob === "string") {
                            blob = new Blob([blob]);
                        }
                        saveAs(blob, "pqGrid." + format);
                    }
                }
            ]
        }
    };

    // main initializer

    var grid = pq.grid("#grid_crud", newObj);
    //create popup dialog.
    $("#popup-dialog-crud").dialog({
        width: 400, modal: true,
        open: function () { $(".ui-dialog").position({ of: "#grid_crud" }); },
        autoOpen: false
    });

    //append Row
    function addRow() {

        var $frm = $("form#crud-form");
        $frm.find("input").val("");

        $("#popup-dialog-crud").dialog({
            title: "Add Record", buttons: {
                Add: function () {
                    var row = [];
                    //save the record in DM.data.
                    row['TicketNo'] = $frm.find("input[name='TicketNo']").val();
                    row['Title'] = $frm.find("input[name='Title']").val();
                    row['Status'] = $frm.find("input[name='Status']").val();
                    row['Carrier'] = $frm.find("input[name='Carrier']").val();
                    row['CustomerName'] = $frm.find("input[name='CustomerName']").val();
                    row['Service'] = $frm.find("input[name='Service']").val();
                    row['Downtime'] = $frm.find("input[name='Downtime']").val();
                    row['Uptime'] = $frm.find("input[name='Uptime']").val();
                    row['Duration'] = $frm.find("input[name='Duration']").val();
                    row['Summary'] = $frm.find("input[name='Summary']").val();
                    row['NextAction'] = $frm.find("input[name='NextAction']").val();
                    row['RFO'] = $frm.find("input[name='RFO']").val();

                    grid.addRow({ rowData: row });
                    $(this).dialog("close");
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            }
        });
        $("#popup-dialog-crud").dialog("open");
    }

    //edit Row
    function editRow() {
        var rowIndx = getRowIndx();
        if (rowIndx != null) {

            var row = grid.getRowData({ rowIndx: rowIndx });
            console.log(row);
            var $frm = $("form#crud-form");
            $frm.find("input[name='TicketNo']").val(row['TicketNo']);
            $frm.find("input[name='Title']").val(row['Title']);
            $frm.find("input[name='Status']").val(row['Status']);
            $frm.find("input[name='Carrier']").val(row['Carrier']);
            $frm.find("input[name='CustomerName']").val(row['CustomerName']);
            $frm.find("input[name='Service']").val(row['Service']);
            $frm.find("input[name='Downtime']").val(row['Downtime']);
            $frm.find("input[name='Uptime']").val(row['Uptime']);
            $frm.find("input[name='Duration']").val(row['Duration']);
            $frm.find("input[name='Summary']").val(row['Summary']);
            $frm.find("input[name='NextAction']").val(row['NextAction']);
            $frm.find("input[name='RFO']").val(row['RFO']);

            $("#popup-dialog-crud").dialog({
                title: "Edit Record (" + (rowIndx + 1) + ")", buttons: {
                    Update: function () {
                        //update row.
                        var row = [];
                        row['TicketNo'] = $frm.find("input[name='TicketNo']").val();
                        row['Title'] = $frm.find("input[name='Title']").val();
                        row['Status'] = $frm.find("input[name='Status']").val();
                        row['Carrier'] = $frm.find("input[name='Carrier']").val();
                        row['CustomerName'] = $frm.find("input[name='CustomerName']").val();
                        row['Service'] = $frm.find("input[name='Service']").val();
                        row['Downtime'] = $frm.find("input[name='Downtime']").val();
                        row['Uptime'] = $frm.find("input[name='Uptime']").val();
                        row['Duration'] = $frm.find("input[name='Duration']").val();
                        row['Summary'] = $frm.find("input[name='Summary']").val();
                        row['NextAction'] = $frm.find("input[name='NextAction']").val();
                        row['RFO'] = $frm.find("input[name='RFO']").val();

                        grid.updateRow({ rowIndx: rowIndx, row: row, checkEditable: false });

                        $(this).dialog("close");
                    },
                    Cancel: function () {
                        $(this).dialog("close");
                    }
                }
            }).dialog("open");
        }
    }

    function getRowIndx() {

        // var grid = $("#grid_crud").pqGrid(newObj);
        // console.log(grid);
        var arr = grid.SelectRow().getSelection();
        if (arr && arr.length > 0) {
            return arr[0].rowIndx;
        }
        else {
            alert("Select a row.");
            return null;
        }
    }


});
