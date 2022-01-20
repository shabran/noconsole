
$(function () {

    tabInitializer();
    dateTimeInitializer();

    function filterhandler() {
        // still error TypeError: this.toolbar is not a function if implemented globally
        var $toolbar = this.toolbar(),
            $value = $toolbar.find(".filterValue"),
            value = $value.val(),
            condition = $toolbar.find(".filterCondition").val(),
            dataIndx = $toolbar.find(".filterColumn").val(),
            filterRules;

        if (dataIndx == "") {//search through all fields when no field selected.
            filterRules = this.getColModel()
                .filter(function (column) {
                    return column.dataIndx != 'pq_detail'
                })
                .map(function (column) {
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

    var statusOptions;

    // using shortcut for add and edit row, TODO: Refactor to DRY
    shortcut.add("ctrl+a", function () {
        if (isNOC()) {
            addRow();
        } else {
            alert("sorry, you don't have access to that function..");
        }
    });
    shortcut.add("ctrl+e", function () {
        if (isNOC()) {
            editRow();
        } else {
            alert("sorry, you don't have access to that function..");
        }
    });

    (function statusOptionInitializer() {
        if (isNOC) {
            statusOptions = {
                'Proposed': 'Proposed',
                'Approved': 'Approved',
                'Rejected': 'Rejected',
                'Borrowed': 'Borrowed',
                'Completed': 'Completed'
            }
        } else {
            statusOptions = {
                'Proposed': 'Proposed'
            }
        }
        var statusSelect = $("select[name='Status']");
        // console.log(serviceSelect);
        $.each(statusOptions, function (val, text) {
            statusSelect.append(
                $('<option></option>').val(val).html(text)
            );
        });
    })();

    // details tab section
    function onTabsActive(evt, ui) {
        //grid requires refresh whenever corresponding tab is refreshed.
        ui.newPanel.find(".pq-grid").pqGrid("refresh");
    };

    /**
    * does data binding of detail view.
    * @return: {jQuery object}
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
            console.log(html);
            var cellData = (rowData[key] == null) ? "" : rowData[key];
            html = html.replace("<#=" + key + "#>", cellData);
        }
        $detail.html(html);

        $detail.find(".pq-tabs").tabs().on("tabsactivate", onTabsActive);

        //append pqGrid in the 2nd tab.                
        $("<div></div>").appendTo($("#tabs-1", $detail)).pqGrid(detailobj);

        return $detail;
    };

    var colModel = [
        { title: "", minWidth: 27, maxWidth: 27, type: "detail", resizable: false, editable: false },
        { title: "Log No", dataType: "string", minWidth: '90', align: "center", dataIndx: "logbook_no" },
        { title: "Lendee Name", dataType: "string", minWidth: '210', align: "center", dataIndx: "lendee_name" },
        { title: "Item", dataType: "string", minWidth: '210', align: "center", dataIndx: "asset_name" },
        { title: "Start Time", dataType: "string", minWidth: '120', align: "center", dataIndx: "start_time" },
        { title: "Return Time", dataType: "string", minWidth: '120', align: "center", dataIndx: "end_time" },
        { title: "Status", dataType: "string", minWidth: '150', align: "center", dataIndx: "status" },
        { title: "Last Remark", dataType: "string", minWidth: '180', align: "center", dataIndx: "last_remark" }
    ];

    var lastSelect;
    var dataModel = {
        recIndx: "logbook_no",
        location: "remote",
        dataType: "json",
        method: "GET",
        sorting: "remote",
        paging: "remote",
        sortIndx: "logbook_no",
        sortDir: "down",
        url: "/ticketingAPI.php?job=get_logbook"
        , getData: function (dataJSON) {
            var data = dataJSON.data;
            // console.log(dataJSON);
            // data[lastSelect]['pq_detail'] = { 'show': true }; // works
            return { curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: data };
        }
    };


    // $("#logbook_grid").pqGrid(
    var newObj = {
        height: 'flex',
        resizable: true,
        flexHeight: true,
        flexWidth: false,
        collapsible: true,
        hoverMode: 'row',
        // maxHeight: 400,
        pageModel: { type: "remote", rPP: 10, strRpp: "{0}" },
        dataModel: dataModel,
        colModel: colModel,
        filterModel: { mode: 'OR', header: false, type: 'remote' },
        // title: "<b>Shipping Orders</b>",
        selectionModel: { mode: 'single', type: 'row' },
        // filterModel: { header: true, type: 'local' },
        // scrollModel: { autoFit: true, flexContent: true },
        virtualX: true, virtualY: false,
        editable: false,
        showTitle: false,
        hwrap: false,
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
                            if (column.title.length > 0) {
                                var obj = {};
                                obj[column.dataIndx] = column.title;
                                opts.push(obj);
                            }   
                        })
                        return opts;
                    }
                },
                {
                    type: 'select',
                    cls: "filterCondition",
                    listener: filterhandler,
                    options: [
                        { "contain": "Contains" },
                        { "begin": "Begins With" },
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
                    type: 'button',
                    label: 'Reset filters',
                    listener: function () {
                        this.reset({ filter: true });
                    }
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
    // );

    var grid = pq.grid("#logbook_grid", newObj);

    $('.tab-details').click(function () {
        if ($(this).attr('id') === 'logbookTab') {
            grid.destroy();
            grid = pq.grid("#logbook_grid", newObj);
        } else {
            grid.destroy();
            grid = pq.grid("#detailLogbook_grid", newObjDetail);
        }
    });

    /* another grid in detail view.
    * returns a new copy of detailModel every time the function is called.*/
    var gridDetailModel = function (rowData) {

        return {
            //pageModel: { type: "local", rPP: 5, strRpp: "" },
            sortModel: {
                sorter: [{ dataIndx: 'logbook_log_no', dir: "up" }]
            },
            dataModel: {
                location: "remote",
                dataType: "json",
                method: "GET",
                url: "/ticketingAPI.php?job=get_logbookLog&id=" + rowData['logbook_no']
                //url = "/pro/orderdetails.php?orderId=" + orderID //for PHP
            },
            colModel: [
                // { title: "Log ID", width: 90, dataIndx: "log_id" },
                // { title: "TicketNo", width: 90, dataIndx: "TicketNo" },
                { title: "Timestamp", width: 120, align: "center", dataIndx: "timestamp" },
                { title: "Logger", width: 120, dataIndx: "logger" },
                { title: "Remark Log", minwidth: 500, dataIndx: "remark_log" },
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

    //create popup dialog.
    $("#popup-dialog-crud").dialog({
        width: 800, modal: true,
        open: function () { $(".ui-dialog").position({ of: "#logbook_grid" }); },
        autoOpen: false
    });

    // get asset to fill in dropdown
    var request = $.ajax({
        async: false,
        url: '/ticketingAPI.php?job=get_allAssetName',
        cache: false,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        type: 'get'
    });
    request.done(function (dataJSON) {
        if (dataJSON.result == 'success') {
            var assetList = dataJSON.data;
            // console.log(assetList);
            var optionInput = [];
            $.each(assetList, function (i, value) {
                optionInput.push('<option value="' + value.asset_name + '">' + value.asset_name + '</option>');
            });
            $("select[name='AssetName']").html(optionInput.join(""));
            // console.log('get Assets success');
        } else {
            console.log('get Assets failed');
        }
    });
    request.fail(function (jqXHR, textStatus) {
        console.log('error due to: ' + textStatus);
    });

    //append Row
    function addRow() {

        var $frm = $("form#crud-form");

        $frm.find("input").val("");
        $frm.find("textarea").val("");
        $frm.find("input[name='LendeeName']").val(userLogin);
        $frm.find("select[name='AssetName']").prop('selectedIndex', 0);
        $frm.find("select[name='Status']").prop('selectedIndex', 0);

        // console.dir($frm.find("select[name='AssetName'] :selected").text());

        $("#popup-dialog-crud").dialog({
                open: function () {
                    $(".ui-dialog-buttonpane button:contains('Add')").button('disable');
                    validateForm();
                },
                title: "Add Logbook", 
                buttons: {
                Add: function () {
                    var row = [];
                    //save the record in DM.data.
                    row['lendee_name'] = $frm.find("input[name='LendeeName']").val(userLogin);
                    row['asset_name'] = $frm.find("select[name='AssetName'] :selected").text();  
                    row['start_time'] = $frm.find("input[name='StartTime']").val();
                    row['end_time'] = $frm.find("input[name='EndTime']").val();
                    row['status'] = $frm.find("select[name='Status']").val();
                    row['last_remark'] = $frm.find("textarea[name='AddRemark']").val();
                    row['lendee_email'] = $frm.find("input[name='userEmail']").val(userEmail);

                    // save to database (begin)
                    var form_data = $('form#crud-form').serialize();
                    // console.log(form_data);
                    // console.log(row);
                    var request = $.ajax({
                        url: '/ticketingAPI.php',
                        cache: false,
                        data: form_data + '&job=' + 'add_logbook',
                        dataType: 'json',
                        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                        type: 'post',
                        async: true
                    });
                    request.done(function (output) {
                        if (output.result == 'success') {
                            // console.log('add successful');
                            grid.addRow({ rowData: row });
                            $("#logbook_grid").pqGrid("refreshDataAndView");
                            alert('Logbook: ' + row['asset_name'] + ' is proposed.');
                        } else {
                            console.log('add failed');
                            alert(output.message);
                        }
                    });
                    request.fail(function (jqXHR, textStatus) {
                        console.log('error due to: ' + textStatus);
                    });
                    // save to database (end)

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
            // console.log(row);
            var $frm = $("form#crud-form");
            $frm.find("textarea").val("");

            $frm.find("input[name='LogbookNo']").val(row['logbook_no']);
            $frm.find("input[name='LendeeName']").val(row['lendee_name']);
            $frm.find("select[name='AssetName']").val(row['asset_name']);
            $frm.find("input[name='StartTime']").val(row['start_time']);
            $frm.find("input[name='EndTime']").val(row['end_time']);
            $frm.find("select[name='Status']").val(row['status']);
            // $frm.find("textarea[name='AddRemark']").val();
            $frm.find("input[name='userEmail']").val(userEmail);

            $("#popup-dialog-crud").dialog({
                    open: function () {
                        $(".ui-dialog-buttonpane button:contains('Update')").button('disable');
                        validateForm();
                    },
                    title: "Edit Logbook (" + (rowIndx + 1) + ")", 
                    buttons: {
                    Update: function () {
                        //update row.
                        var row = [];
                        row["logbook_no"] = $frm.find("input[name='LogbookNo']").val();
                        row["lendee_name"] = $frm.find("input[name='LendeeName']").val();
                        row["asset_name"] = $frm.find("select[name='AssetName']").val();
                        row["start_time"] = $frm.find("input[name='StartTime']").val();
                        row["end_time"] = $frm.find("input[name='EndTime']").val();
                        row["status"] = $frm.find("select[name='Status']").val();
                        // row["lendee_email"] = $frm.find("input[name='userEmail']").val();

                        row["last_remark"] = $frm.find("textarea[name='AddRemark']").val();

                        // save edit to database (begin)
                        var form_data = $('form#crud-form').serialize();
                        // console.log(form_data);
                        request = $.ajax({
                            url: '/ticketingAPI.php',
                            cache: false,
                            data: form_data + '&job=' + 'edit_logbook' + '&id=' + row['logbook_no'],
                            dataType: 'json',
                            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                            type: 'post',
                            async: true
                        });
                        request.done(function (output) {
                            // console.log(output);
                            if (output.result == 'success') {
                                alert('logbook: ' + row['asset_name'] + ' remark is added.');
                                $("#logbook_grid").pqGrid("refreshDataAndView");
                            } else {
                                console.log('edit failed');
                            }
                        });
                        request.fail(function (jqXHR, textStatus) {
                            console.log('error due to: ' + textStatus);
                        });
                        // save edit to database (end)

                        $(this).dialog("close");
                    },
                    Cancel: function () {
                        $(this).dialog("close");
                    }
                }
            }).dialog("open");
        }
    }

    // logbook logger detail (logbook remarks), read only
    var colModelDetailLogger = [
        {
            title: "Time Stamp", dataType: "string", dataIndx: "timestamp", width: '120', align: "center",
            filter: {
                type: 'textbox', condition: 'between', init: pqDatePicker,
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
        {
            title: "Logbook No", dataType: "string", dataIndx: "logbook_no", width: '120', align: "center",
            filter: { type: 'textbox', condition: 'contain' }
        },
        {
            title: "Logger", dataType: "string", width: '280', align: "center", dataIndx: "logger",
            filter: { type: 'textbox', condition: 'contain' }
        },
        {
            title: "Remark Log", width: '560', align: "center", dataIndx: "remark_log",
            filter: { type: 'textbox', condition: 'contain' }
        }
    ];

    var dataModelDetail = {
        recIndx: "logbook_log_no",
        location: "remote",
        dataType: "json",
        method: "GET",
        paging: "remote",
        url: "/ticketingAPI.php?job=get_logbook_remarks"
        , getData: function (dataJSON) {
            var data = dataJSON.data;
            // console.log(dataJSON);
            return { curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: data };
        }
    };

    var newObjDetail = {
        resizable: true,
        flexHeight: true,
        flexWidth: false,
        collapsible: true,
        hoverMode: 'row',
        pageModel: { type: "remote", rPP: 20, strRpp: "{0}", rPPOptions: [10, 20, 50, 100, 200, 500] },
        dataModel: dataModelDetail,
        colModel: colModelDetailLogger,
        sortModel: {
            type: 'remote',
            single: true,
            space: true,
            multiKey: null
        },
        filterModel: { on: true, mode: "AND", header: true, type: 'remote' },
        selectionModel: { mode: 'single', type: 'row', native: true },
        scrollModel: { flexContent: true },
        virtualX: true, virtualY: false,
        editable: false,
        showTitle: false,
        autorow: false,
        rowHt: 50,
        wrap: true,
        hwrap: false,
        // editModel: { clicksToEdit: 2 },
        toolbar: {
            cls: "pq-toolbar-search",
            items: [
                {
                    type: 'select',
                    label: 'Format: ',
                    attr: 'id="export_format"',
                    options: [{ xlsx: 'Excel', csv: 'Csv', htm: 'Html', json: 'Json' }]
                },
                {
                    type: 'button',
                    label: "Export Log",
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
                        saveAs(blob, "log_info." + format);
                    }
                },
                {
                    type: 'button',
                    label: 'Reset filters',
                    listener: function () {
                        this.reset({ filter: true });
                    }
                },
            ]
        }
    };

    function getRowIndx() {

        // var grid = $("#logbook_grid").pqGrid(newObj);
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
