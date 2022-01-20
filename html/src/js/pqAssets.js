
$(function () {

    tabInitializer();
    dateTimeInitializer();

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

    var renderTick = function (ui) {
        if (ui.cellData == '1' && ui.dataIndx == 'can_borrow') {
            return '✓';
        } else if (ui.cellData == '0' && ui.dataIndx == 'can_borrow') {
            return '✗';
        }
    }

    function filterhandler() {

        var $toolbar = this.toolbar(),
            $value = $toolbar.find(".filterValue"),
            value = $value.val(),
            condition = $toolbar.find(".filterCondition").val(),
            dataIndx = $toolbar.find(".filterColumn").val(),
            filterRules;

        if (dataIndx == "") {//search through all fields when no field selected.
            filterRules = this.getColModel()
            .filter(function (column){
                return column.dataIndx != 'pq_detail'
            }) 
            .map(function (column) {
                // console.dir(column.dataIndx);
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
        { title: "Asset No", dataType: "string", minWidth: '120', align: "center", dataIndx: "asset_no" },
        { title: "Asset Name", dataType: "string", minWidth: '300', align: "center", dataIndx: "asset_name" },
        { title: "Quantity", dataType: "string", minWidth: '120', align: "center", dataIndx: "quantity" },
        { title: "Serial No.", dataType: "string", minWidth: '180', align: "center", dataIndx: "serial_no" },
        { title: "Location", dataType: "string", minWidth: '120', align: "center", dataIndx: "location" },
        { title: "Can Borrow?", dataType: "string", minWidth: '120', align: "center", dataIndx: "can_borrow"},
        { title: "Remark", dataType: "string", minWidth: '120', align: "center", dataIndx: "remark" }
    ];

    var lastSelect;
    var dataModel = {
        recIndx: "asset_no",
        location: "remote",
        dataType: "json",
        method: "GET",
        sorting: "remote",
        paging: "remote",
        sortIndx: "asset_name",
        sortDir: "up",
        url: "/ticketingAPI.php?job=get_assets"
        , getData: function (dataJSON) {
            var data = dataJSON.data;
            // console.log(dataJSON);
            // data[lastSelect]['pq_detail'] = { 'show': true }; // works
            return { curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: data };
        }
    };


    // $("#asset_grid").pqGrid(
    var newObj = {
        height: 'flex',
        resizable: true,
        flexHeight: true,
        flexWidth: false,
        collapsible: true,
        hoverMode: 'row',
        // maxHeight: 400,
        pageModel: { type: "remote", rPP: 20, strRpp: "{0}" },
        dataModel: dataModel,
        columnTemplate: { render: renderTick },
        colModel: colModel,
        filterModel: { mode: 'OR', header: false },
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
                { type: 'button', label: 'Add', listeners: [{ click: addRow }], icon: 'ui-icon-plus', options: { disabled: !isNOC() } },
                { type: 'button', label: 'Edit', listeners: [{ click: editRow }], icon: 'ui-icon-pencil', options: { disabled: !isNOC() } },
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
                            // console.log(column.title.length);
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

    var grid = pq.grid("#asset_grid", newObj);

    $('.tab-details').click(function () {
        if ($(this).attr('id') === 'assetTab') {
            grid.destroy();
            grid = pq.grid("#asset_grid", newObj);
        } else {
            grid.destroy();
            grid = pq.grid("#detailAsset_grid", newObjDetail);
        }
    });

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
                url: "/ticketingAPI.php?job=get_assetLog&id=" + rowData['asset_no']
                //url = "/pro/orderdetails.php?orderId=" + orderID //for PHP
            },
            colModel: [
                // { title: "Log ID", width: 90, dataIndx: "log_id" },
                // { title: "TicketNo", width: 90, dataIndx: "TicketNo" },
                { title: "Timestamp", minWidth: 120, align: "center", dataIndx: "timestamp", editable: false },
                { title: "Logger", minWidth: 120, dataIndx: "logger", editable: false },
                { title: "Log Detail", minWidth: 500, dataIndx: "log_detail", editable: false }
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
        open: function () { $(".ui-dialog").position({ of: "#asset_grid" }); },
        autoOpen: false
    });

    //append Row
    function addRow() {

        var $frm = $("form#crud-form");

        $frm.find("input").val("");
        $frm.find("textarea").val("");

        $("#popup-dialog-crud").dialog({
            open: function () {
                $(".ui-dialog-buttonpane button:contains('Add')").button('disable');
                validateForm();
            },
            title: "Add Asset", 
            buttons: {
                Add: function () {
                    var row = [];
               //save the record in DM.data.
                    row['asset_name'] = $frm.find("input[name='ItemName']").val();
                    row['quantity'] = $frm.find("input[name='Quantity']").val();
                    row['serial_no'] = $frm.find("input[name='SerialNo']").val();
                    row['location'] = $frm.find("input[name='Location']").val();
                    row['can_borrow'] = $frm.find("input[name='CanBorrow']").val();   
                    row['remark'] = $frm.find("textarea[name='Remark']").val();      
                    row['DetailLog'] = $frm.find("textarea[name='DetailLog']").val();

                    // save to database (begin)
                    var form_data = $('form#crud-form').serialize();
                    // console.log(form_data);
                    // console.log(row);
                    var request = $.ajax({
                        url: '/ticketingAPI.php',
                        cache: false,
                        data: form_data + '&job=' + 'add_asset',
                        dataType: 'json',
                        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                        type: 'post',
                        async: true
                    });
                    request.done(function (output) {
                        if (output.result == 'success') {
                            // console.log('add successful');
                            grid.addRow({ rowData: row });
                            $("#asset_grid").pqGrid("refreshDataAndView");
                            alert('Asset: ' + row['asset_name'] + ' is added.');
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
            var tempCanBorrow;
            if (row['can_borrow'] == "1") { tempSM = true; } else if (row['can_borrow'] == "0") { tempSM = false; }

            var $frm = $("form#crud-form");
            $frm.find("input[name='AssetNo']").val(row['asset_no']);
            $frm.find("input[name='ItemName']").val(row['asset_name']);
            $frm.find("input[name='Quantity']").val(row['quantity']);
            $frm.find("input[name='SerialNo']").val(row['serial_no']);
            $frm.find("input[name='Location']").val(row['location']);
            $frm.find("textarea[name='Remark']").val(row['remark']);
            $frm.find("input[type='checkbox'][name='CanBorrow']").prop('checked', tempCanBorrow);
            $frm.find("textarea[name='DetailLog']").val(row['DetailLog']);

            $("#popup-dialog-crud").dialog({
                open: function () {
                    $(".ui-dialog-buttonpane button:contains('Update')").button('disable');
                    validateForm();
                },
                title: "Edit Asset (" + (rowIndx + 1) + ")", 
                buttons: {
                    Update: function () {
                        //update row.
                        var row = [];
                        row["asset_no"] = $frm.find("input[name='AssetNo']").val();
                        row["asset_name"] = $frm.find("input[name='ItemName']").val();
                        row["quantity"] = $frm.find("input[name='Quantity']").val();
                        row["serial_no"] = $frm.find("input[name='SerialNo']").val();
                        row["location"] = $frm.find("input[name='Location']").val();
                        row["remark"] = $frm.find("textarea[name='Remark']").val();
                        row['can_borrow'] = $frm.find("input[type='checkbox'][name='CanBorrow']").is(":checked");

                        row["DetailLog"] = $frm.find("input[name='DetailLog']").val();

                        // save edit to database (begin)
                        var form_data = $('form#crud-form').serialize();
                        // console.log(form_data);
                        request = $.ajax({
                            url: '/ticketingAPI.php',
                            cache: false,
                            data: form_data + '&job=' + 'edit_asset' + '&id=' + row['asset_no'],
                            dataType: 'json',
                            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                            type: 'post',
                            async: true
                        });
                        request.done(function (output) {
                            // console.log(output);
                            if (output.result == 'success') {
                                alert('Asset: ' + row['asset_name'] + ' is edited.');
                                $("#asset_grid").pqGrid("refreshDataAndView");
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

    // asset logger detail, read only
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
            title: "Asset No", dataType: "string", dataIndx: "asset_no", width: '120', align: "center",
            filter: { type: 'textbox', condition: 'contain' }
        },
        {
            title: "Logger", dataType: "string", width: '280', align: "center", dataIndx: "logger",
            filter: { type: 'textbox', condition: 'contain' }
        },
        {
            title: "Log Detail", width: '560', align: "center", dataIndx: "log_detail",
            filter: { type: 'textbox', condition: 'contain' }
        }
    ];

    var dataModelDetail = {
        recIndx: "log_id",
        location: "remote",
        dataType: "json",
        method: "GET",
        paging: "remote",
        url: "/ticketingAPI.php?job=get_asset_remarks"
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

        // var grid = $("#asset_grid").pqGrid(newObj);
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
