$(function () {

    tabInitializer();

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
        if (ui.cellData == '1' && ui.dataIndx != 'Circuit' ) {
            return '✓';
        } else if (ui.cellData == '0' && ui.dataIndx != 'Circuit') {
            return '✗';
        }
    }

    // for more PIC contact and address
    $('.contact-field-wrapper').each(function () {
        var $contactWrapper = $('.contact-fields', this);
        $(".contact-add-field", $(this)).click(function (e) {
            $('.contact-field:first-child', $contactWrapper).clone(true).appendTo($contactWrapper).find('input').val('').focus();
        });
        $('.contact-field .contact-remove-field', $contactWrapper).click(function () {
            if ($('.contact-field', $contactWrapper).length > 1)
                $(this).parent('.contact-field').remove();
        });
    });

    $('.email-field-wrapper').each(function () {
        var $emailWrapper = $('.email-fields', this);
        $(".email-add-field", $(this)).click(function (e) {
            $('.email-field:first-child', $emailWrapper).clone(true).appendTo($emailWrapper).find('input').val('').focus();
        });
        $('.email-field .email-remove-field', $emailWrapper).click(function () {
            if ($('.email-field', $emailWrapper).length > 1)
                $(this).parent('.email-field').remove();
        });
    });

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
        var detailPIC;
        var rowData = ui.rowData,
            //get a copy of gridDetailModel
            detailobj = gridDetailModel(rowData),
            detailobjLogger = gridDetailModelLogger(rowData),

            //get markup of the detail template.                
            html = $("#tmpl").html(),
            //create new detail place holder
            $detail = $("<div></div>");

        $.ajax({
            url: "/ticketingAPI.php?job=get_PIC&id=" + rowData['cust_no'],
            type: 'GET',
            cache: false,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            async: false,
            success: function (output) {
                // console.log(output.data);
                detailPIC = output.data;
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus); alert("Error: " + errorThrown);
            }
        });

        var descDetailPIC = {};
        for (var i = 0; i < detailPIC.length; i++) {
            var item = detailPIC[i];
            for (var key in item) {
                if (!(key in descDetailPIC))
                    descDetailPIC[key] = [];
                descDetailPIC[key].push(item[key]);
            }
        }

        // console.log(descDetailPIC);

        for (var key in descDetailPIC) {
            var cellData = (descDetailPIC[key] == null) ? "" : descDetailPIC[key];
            // console.log(cellData); // whole row in noc_PIC
            for (var i = cellData.length; i--;) {
                if ((key === 'PIC_name' || key ==='PIC_number') && descDetailPIC.PIC_isMainContact[i] === '1') {
                    cellData[i] = ' ' + "<b style='color:blue'>" + cellData[i] + '</b>';
                } else {
                    cellData[i] = ' ' + cellData[i];
                }
            }
            html = html.replace("<#=" + key + "#>", cellData);
        }
        $detail.html(html);

        $detail.find(".pq-tabs").tabs().on("tabsactivate", onTabsActive);

        //append pqGrid in the 1nd tab.                
        $("<div></div>").appendTo($("#tabs-1", $detail)).pqGrid(detailobj);
        //append pqGrid in the 4th tab.                
        $("<div></div>").appendTo($("#tabs-4", $detail)).pqGrid(detailobjLogger);

        return $detail;
    };

    var colModel = [
        { title: "", minWidth: 27, maxWidth: 27, type: "detail", resizable: false, editable: false },
        {
            title: "CID", dataType: "string", dataIndx: "CID", minWidth: '120', align: "center" },
        { title: "Customer Name", dataType: "string", minWidth: '150', align: "center", dataIndx: "CustomerName" },
        { title: "PE Router", minWidth: '120', align: "center", dataIndx: "PERouter" },
        { title: "Service", minWidth: '120', align: "center", dataIndx: "Service" },
        { title: "Carrier Name", minWidth: '120', align: "center", dataIndx: "CarrierName" },
        { title: "Contact No", dataType: "string", minWidth: '180', align: "center", dataIndx: "ContactNo" },
        { title: "Email Address", dataType: "string", minWidth: '240', align: "center", dataIndx: "EmailAddress" },
        { title: "Bandwidth", dataType: "string", minWidth: '60', align: "center", dataIndx: "Bandwidth" },
        { title: "Customer  Area", dataType: "string", minWidth: '90', align: "center", dataIndx: "CustomerArea" },
        { title: "Remarks", dataType: "string", minWidth: '210', align: "center", dataIndx: "Remarks" }
    ];

    // var lastSelect;
    var dataModel = {
        recIndx: "cust_no",
        location: "remote",
        dataType: "json",
        method: "GET",
        paging: "remote",
        url: "/ticketingAPI.php?job=get_allcustomers"
        , getData: function (dataJSON) {
            var data = dataJSON.data;
            // console.log(dataJSON);
            return { curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: data };
        }
    };

    var rPP_recall = getCookie("pqPager-rPP");
    rPP_recall = (rPP_recall > 1 ? rPP_recall : 10);

    var newObj = {
        resizable: true,
        flexHeight: true,
        flexWidth: false,
        collapsible: true,
        hoverMode: 'row',
        // freezeCols: 2,
        pageModel: { type: "remote", rPP: 10, strRpp: "{0}", rPP: rPP_recall, rPPOptions: [10,20,50,100, 500000]},
        dataModel: dataModel,
        colModel: colModel,
        sortModel: {
            type: 'remote',
            single: true,
            space: true,
            multiKey: null
        },
        filterModel: { mode: 'OR', header: false, type: 'remote' },
        selectionModel: { mode: 'single', type: 'row', native: true },
        scrollModel: { flexContent: true },
        virtualX: true, virtualY: false,
        editable: false,
        showTitle: false,
        autorow: false,
        rowHt: 50,
        wrap: true,
        hwrap: false,
        editModel: { clicksToEdit: 2 },
        detailModel: { init: initDetail },
        toolbar: {
            cls: "pq-toolbar-search",
            style: "display: block;",
            items: [
                {   type: 'button', 
                    label: 'Add', 
                    listeners: [{ click: addRow }],
                    style: 'float: left;', 
                    icon: 'ui-icon-plus', 
                    cls: 'addButton', 
                    options: { disabled: !isNOC() } 
                },
                {   type: 'button', 
                    label: 'Edit', 
                    listeners: [{ click: editRow }],
                    style: 'float: left;', 
                    icon: 'ui-icon-pencil', 
                    cls: 'editButton', 
                    options: { disabled: !isNOC() } 
                },
                {
                    type: 'select',
                    label: 'Format: ',
                    style: 'float: left;',
                    attr: 'id="export_format"',
                    options: [{ xlsx: 'Excel', csv: 'Csv', htm: 'Html', json: 'Json' }]
                },
                {
                    type: 'button',
                    label: "Export Customers",
                    style: 'display: block;',
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
                    type: 'textbox',
                    label: 'Filter: ',
                    attr: 'placeholder="Enter your keyword"',
                    cls: "filterValue",
                    style: 'float: left;padding-top:3px;',
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
                // { type: 'button', label: 'Check Grid', listeners: [{ click: checkGrid }] },
                { type: 'button', style: 'float: right;color: red;', label: 'Delete a Record', listeners: [{ click: delRow }], icon: 'ui-icon-minus', options: { disabled: !isNOC() } }
            ],
        },
        // toolbar: {
        //     cls: "pq-toolbar-search",
        //     style: "display: block;",
        //         items: [
        //             {
        //                 type: 'button',
        //                 label: 'Reset filters',
        //                 listener: function () {
        //                     this.reset({ filter: true });
        //                 }
        //             }
        //         ]
        // },
        refresh: function () {
            var pager = this.pager();
            if (pager) {
                pager.widget().find("option:last").html("All")
                // console.log("refreshed");
            }
        }
    };

    var grid = pq.grid("#cust_grid", newObj);

    $('.tab-details').click(function () {
        if ($(this).attr('id') === 'customerTab') {
            grid.destroy();
            grid = pq.grid("#cust_grid", newObj);
        } else if ($(this).attr('id') === 'PICTab'){
            grid.destroy();
            grid = pq.grid("#PIC_grid", newObjPIC);
        } else {
            grid.destroy();
            grid = pq.grid("#detailCustLog_grid", newObjDetail);
        }
    });

    // pager function to show all customers
    grid.pager().on("change", function (evt, ui) {
        if (ui.rPP) {
            setCookie("pqPager-rPP", ui.rPP, 365);
            // console.log("row per page change:" + ui.rPP);
        }
    })

    function setCookie(cname, cvalue, exdays) {
        console.log("setCookie: " + cname + " = " + cvalue)
    }

    function getCookie(cname) {
        console.log("getCookie: " + cname + " = 10");
        return 10;
    }

    /* another grid in detail view.
    * returns a new copy of detailModel every time the function is called.*/
    var gridDetailModel = function (rowData) {

        return {
            error: function () {
                gridMain.rowInvalidate({ rowData: rowData });
            },
            dataModel: {
                location: "remote",
                dataType: "json",
                method: "GET",
                url: "/ticketingAPI.php?job=get_allcustomer&id=" + rowData['cust_no']
            },
            columnTemplate: { render: renderTick },
            colModel: [
                { title: "Circuit", width: 120, align: "center", dataIndx: "Circuit", editable: false },
                { title: "Basic Diagram", width: 120, dataIndx: "BasicDiagram", editable: false  },
                { title: "Cacti", width: 120, dataIndx: "Cacti", editable: false },
                { title: "Open NMS", width: 120, dataIndx: "OpenNMS", editable: false },
                { title: "Trouble Ticket", width: 120, dataIndx: "TroubleTicket", editable: false },
                { title: "SI Maintenance", width: 120, dataIndx: "SIMaintenance", editable: false },
                { title: "Service Manager", width: 120, dataIndx: "ServiceManager", editable: false }
            ],
            width: 'flex',
            height: 'flex',
            resizable: false,
            selectionModel: { mode: 'single', type: 'row', native: true },
            maxHeight: 300,
            wrap: true,
            rowHt: 40,
            numberCell: { show: false },
            showTop: false,
            showBottom: false
        };
    };

    var colLoggerModel = [
        { title: "Timestamp", width: 120, align: "center", dataIndx: "timestamp", editable: false },
        { title: "Logger", width: 120, dataIndx: "logger", editable: false },
        { title: "Log Detail", width: 500, dataIndx: "log_detail", editable: false },
        { title: "Log Category", width: 120, dataIndx: "log_category", editable: false },
        { title: "Attachment", width: 120, dataIndx: "attachment", editable: false, render: displayHTMLLink }
    ];

    var gridDetailModelLogger = function (rowData) {

        return {
            error: function () {
                gridMain.rowInvalidate({ rowData: rowData });
            },
            dataModel: {
                location: "remote",
                dataType: "json",
                method: "GET",
                url: "/ticketingAPI.php?job=get_custlogger&id=" + rowData['CID']
            },
            colModel: colLoggerModel,
            width: 'flex',
            height: 'flex',
            resizable: false,
            selectionModel: { mode: 'single', type: 'row', native: true },
            filterModel: { on: true, mode: "OR", header: false, type: 'local' },
            maxHeight: 300,
            wrap: true,
            rowHt: 40,
            numberCell: { show: false },
            showTop: true,
            showBottom: false,
            toolbar: {
                cls: "pq-toolbar-search",
                items: [
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
                    }
                ]
            }
        };
    };


    //create popup dialog.
    $("#popup-dialog-crud").dialog({
        width: 800, modal: true,
        open: function () { $(".ui-dialog").position({ of: "#cust_grid" }); },
        autoOpen: false
    });

    serviceOptionInitializer(); // initialize once dialog is opened
    carrierOptionInitializer();

    $("textarea[name='DetailLog']").blur(function () {
        if ($(this).val()) {
            $(".ui-dialog-buttonpane button:contains('Update')").button('enable');
            $(".ui-dialog-buttonpane button:contains('Add')").button('enable');
        }
    });

    var attachmentHolder='';
    $("button[name='uploadButton']").on('click', function () {
        var inputTag = $("input[name='attachment']");
        var buttonTag = $("button[name='uploadButton']");
        var inputFile = inputTag.prop("files")[0];
        var fileName = inputTag.prop("files")[0].name;
        // console.log(inputFile);
        var myFormData = new FormData();
        var ext = fileName.split('.').pop().toLowerCase();
        if (jQuery.inArray(ext, ['gif', 'png', 'jpg', 'jpeg', 'txt', 'doc', 'xls', 'xlsx']) == -1) {
            alert("Invalid Image File");
        }
        var oFReader = new FileReader();
        oFReader.readAsDataURL(inputTag.prop("files")[0]);
        var f = inputTag.prop("files")[0];
        var fsize = f.size || f.fileSize;
        if (fsize > 2000000) {
            alert("Image File Size is very big");
        }
        else {
            myFormData.append('inputFile', inputFile);

            $.ajax({
                url: '/uploadAPI.php',
                type: 'POST',
                processData: false, // important
                contentType: false, // important
                // data: myFormData + '&job=' + 'add_attachment', // can we add TicketNo/cust_no
                data: myFormData, // can we add TicketNo/cust_no
                beforeSend: function () {
                    buttonTag.replaceWith("<label class='text-success'>Image Uploading...</label>");
                },
                success: function (data) {
                    // console.log(data);
                    attachmentHolder=data;
                    $('.text-success').replaceWith(data);
                    inputTag.remove();
                    // could return filename value to be saved to db
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus); alert("Error: " + errorThrown);
                }
            });
        }
    });

    function addRow() {
        var $frm = $("form#crud-form");
        // var arrayMaxDate = [];
        // var ticketNumber = '';
        // var todaysDate = (new Date()).toISOString().slice(0, 10).replace(/-/g, "");
        $frm.find("input").val(""); // what is it for? this is for clearing all input
        $frm.find("textarea").val("");

        // $("input[name='Downtime']").val(dateConvert());

        $("#popup-dialog-crud").dialog({
            open: function () {
                $(".ui-dialog-buttonpane button:contains('Add')").button('disable');
            },
            title: "Add Record",
            buttons: {
                Add: function () {

                    var row = [];

                    row['CID'] = $frm.find("input[name='CID']").val();
                    row['CustomerName'] = $frm.find("input[name='CustomerName']").val();
                    row['PERouter'] = $frm.find("input[name='PERouter']").val();
                    row['Service'] = $frm.find("select[name='Service']").val();
                    row['CarrierName'] = $frm.find("select[name='CarrierName']").val();;
                    row['ContactNo'] = $frm.find("textarea[name='ContactNo']").val();
                    row['EmailAddress'] = $frm.find("textarea[name='EmailAddress']").val();
                    row['Bandwidth'] = $frm.find("input[name='Bandwidth']").val();
                    row['CustomerArea'] = $frm.find("input[name='CustomerArea']").val();
                    row['Remarks'] = $frm.find("textarea[name='Remarks']").val();
                    row['Circuit'] = $frm.find("input[name='Circuit']").val();

                    row['Cacti'] = $frm.find("input[name='Cacti']").val();
                    row['BasicDiagram'] = $frm.find("input[name='BasicDiagram']").val();
                    row['OpenNMS'] = $frm.find("input[name='OpenNMS']").val();
                    row['TroubleTicket'] = $frm.find("input[name='TroubleTicket']").val();
                    row['SIMaintenance'] = $frm.find("input[name='SIMaintenance']").val();
                    row['ServiceManager'] = $frm.find("input[name='ServiceManager']").val();

                    row['attachmentHolder'] = $frm.find("input[name='attachmentHolder']").val(attachmentHolder);
                    row['DetailLog'] = $frm.find("textarea[name='DetailLog']").val();
                    row['LogCategory'] = $frm.find("select[name='LogCategory']").val();

                    row['userLogin'] = $frm.find("input[name='userLogin']").val(userLogin);
                    row['userEmail'] = $frm.find("input[name='userEmail']").val(userEmail);

                    // save to database (begin)
                    var form_data = $('form#crud-form').serialize();
                    // console.log(form_data);
                    // console.log(row);
                    var request = $.ajax({
                        url: '/ticketingAPI.php',
                        cache: false,
                        data: form_data + '&job=' + 'add_customer',
                        dataType: 'json',
                        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                        type: 'post',
                        async: true
                    });
                    request.done(function (output) {
                        if (output.result == 'success') {
                            // console.log('add successful');
                            grid.addRow({ rowData: row });
                            $("#cust_grid").pqGrid("refreshDataAndView");
                            alert('Customer: ' + row['CustomerName'] + ' is added.');
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
                    // console.log(buttons);
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
            // console.log(row['BasicDiagram']);
            var tempCacti, tempBasicDiagram, tempOpenNMS, tempTroubleTicket,tempSIM,tempSM;
            if (row['Cacti'] == "1") { tempCacti = true; } else if (row['Cacti'] == "0") { tempCacti = false; }
            if (row['BasicDiagram'] == "1") { tempBasicDiagram = true; } else if (row['BasicDiagram'] == "0") { tempBasicDiagram = false; }
            if (row['OpenNMS'] == "1") { tempOpenNMS = true; } else if (row['OpenNMS'] == "0") { tempOpenNMS = false; }
            if (row['TroubleTicket'] == "1") { tempTroubleTicket = true; } else if (row['TroubleTicket'] == "0") { tempTroubleTicket = false; }
            if (row['SIMaintenance'] == "1") { tempSIM = true; } else if (row['SIMaintenance'] == "0") { tempSIM = false; }
            if (row['ServiceManager'] == "1") { tempSM = true; } else if (row['ServiceManager'] == "0") { tempSM = false; }

            // console.log(tempBasicDiagram);
            var $frm = $("form#crud-form");
            $frm.find("input[name='cust_no']").val(row['cust_no']);
            $frm.find("input[name='CID']").val(row['CID']);
            $frm.find("input[name='CustomerName']").val(row['CustomerName']);
            $frm.find("input[name='PERouter']").val(row['PERouter']);
            $frm.find("select[name='Service']").val(row['Service']);
            $frm.find("select[name='CarrierName']").val(row['CarrierName']);
            $frm.find("textarea[name='ContactNo']").val(row['ContactNo']);
            $frm.find("textarea[name='EmailAddress']").val(row['EmailAddress']);
            $frm.find("input[name='Bandwidth']").val(row['Bandwidth']);
            $frm.find("input[name='CustomerArea']").val(row['CustomerArea']);
            $frm.find("textarea[name='Remarks']").val(row['Remarks']);
            $frm.find("input[name='Circuit']").val(row['Circuit']);

            $frm.find("input[type='checkbox'][name='Cacti']").prop('checked', tempCacti);
            $frm.find("input[type='checkbox'][name='BasicDiagram']").prop('checked', tempBasicDiagram);
            $frm.find("input[type='checkbox'][name='OpenNMS']").prop('checked', tempOpenNMS);
            $frm.find("input[type='checkbox'][name='TroubleTicket']").prop('checked', tempTroubleTicket);
            $frm.find("input[type='checkbox'][name='SIMaintenance']").prop('checked', tempSIM);
            $frm.find("input[type='checkbox'][name='ServiceManager']").prop('checked', tempSM);


            $frm.find("input[name='attachmentHolder']").val(row['attachmentHolder']);
            $frm.find("textarea[name='DetailLog']").val(row['DetailLog']);
            $frm.find("select[name='LogCategory']").val(row['LogCategory']);

            $frm.find("input[name='userLogin']").val(row['userLogin']);
            $frm.find("input[name='userEmail']").val(row['userEmail']);


            $("#popup-dialog-crud").dialog({
                title: "Edit Record (" + (rowIndx + 1) + ")",
                open: function () {
                    $(".ui-dialog-buttonpane button:contains('Update')").button('disable');
                },
                buttons: {
                    Update: function () {
                        //update row.
                        var row = [];
                        row['cust_no'] = $frm.find("input[name='cust_no']").val();
                        row['CID'] = $frm.find("input[name='CID']").val();
                        row['CustomerName'] = $frm.find("input[name='CustomerName']").val();
                        row['PERouter'] = $frm.find("input[name='PERouter']").val();
                        row['Service'] = $frm.find("select[name='Service']").val();
                        row['CarrierName'] = $frm.find("select[name='CarrierName']").val();;
                        row['ContactNo'] = $frm.find("textarea[name='ContactNo']").val();
                        row['EmailAddress'] = $frm.find("textarea[name='EmailAddress']").val();
                        row['Bandwidth'] = $frm.find("input[name='Bandwidth']").val();
                        row['CustomerArea'] = $frm.find("input[name='CustomerArea']").val();
                        row['Remarks'] = $frm.find("textarea[name='Remarks']").val();
                        row['Circuit'] = $frm.find("input[name='Circuit']").val();

                        row["userLogin"] = $frm.find("input[name='userLogin']").val(userLogin);
                        row["userEmail"] = $frm.find("input[name='userEmail']").val(userEmail);
                        
                        row['attachmentHolder'] = $frm.find("input[name='attachmentHolder']").val(attachmentHolder);
                        row['DetailLog'] = $frm.find("textarea[name='DetailLog']").val();
                        row['LogCategory'] = $frm.find("select[name='LogCategory']").val();

                        row['Cacti'] = $frm.find("input[type='checkbox'][name='Cacti']").is(":checked");
                        row['BasicDiagram'] = $frm.find("input[type='checkbox'][name='BasicDiagram']").is(":checked");
                        row['OpenNMS'] = $frm.find("input[type='checkbox'][name='OpenNMS']").is(":checked");
                        row['TroubleTicket'] = $frm.find("input[type='checkbox'][name='TroubleTicket']").is(":checked");
                        row['SIMaintenance'] = $frm.find("input[type='checkbox'][name='SIMaintenance']").is(":checked");
                        row['ServiceManager'] = $frm.find("input[type='checkbox'][name='ServiceManager']").is(":checked");

                        // save edit to database (begin)

                        var form_data = $('form#crud-form').serialize();
                        // console.log(row);
                        // console.log(form_data);
                        // $.ajaxSetup({
                        //     data: { 'job': 'edit_customer', 'id'= row['cust_no'] }
                        // });
                        request = $.ajax({
                            // url: '/ticketingAPI.php?job=edit_customer&id=' + row['cust_no'],
                            url: '/ticketingAPI.php',
                            cache: false,
                            data: form_data + '&job=' + 'edit_customer' + '&id=' + row['cust_no'],
                            dataType: 'json',
                            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                            type: 'post',
                            async:true
                        });
                        request.done(function (output) {
                            // console.log(output);
                            if (output.result == 'success') {
                                // console.log('edit successful');
                                // grid.updateRow({ rowIndx: rowIndx, row: row, checkEditable: false });
                                // lastSelect = grid.SelectRow().getSelection();
                                // lastSelect = lastSelect[0].rowIndx;
                                alert('Customer: ' + row['CustomerName'] + ' is edited.');
                                $("#cust_grid").pqGrid("refreshDataAndView");
                                // alert(attachmentHolder);
                                // grid.SelectRow().getSelection()['pq_detail'] = { 'show': true };
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

    //called by delete button.
    function delRow() {
        var rowIndx = getRowIndx();

        if (rowIndx != null) {
            var ans = window.confirm("Are you sure to delete row No " + (rowIndx + 1) + "?");
            if (ans) {
                var custId = grid.getRecId({ rowIndx: rowIndx });
                request = $.ajax({
                    url: '/ticketingAPI.php',
                    cache: false,
                    data: '&job=del_customer' + '&id=' + custId,
                    dataType: 'json',
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                    type: 'post',
                    async: true
                });
                // TODO : add logging function to customer remarks
                request.done(function (output) {
                    // console.log(output);
                    if (output.result == 'success') {
                        // console.log('delete successful');
                        alert('delete successful');
                        $("#cust_grid").pqGrid("refreshDataAndView");
                    } else {
                        console.log('delete failed');
                    }
                });
                request.fail(function (jqXHR, textStatus) {
                    console.log('error due to: ' + textStatus);
                });
            }
        }
    }

    // customer logger detail, read only
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
            title: "Logger", dataType: "string", width: '180', align: "center", dataIndx: "logger",
            filter: { type: 'textbox', condition: 'contain' }
        },
        {
            title: "Log Detail", width: '240', align: "center", dataIndx: "log_detail",
            filter: { type: 'textbox', condition: 'contain' }
        },
        {
            title: "Log Category", width: '150', align: "center", dataIndx: "log_category",
            filter: { type: 'textbox', condition: 'contain' }
        },
        {
            title: "Customer Name", width: '240', align: "center", dataIndx: "CustomerName",
            filter: { type: 'textbox', condition: 'contain' }
        },
        {
            title: "Attachment", width: '180', align: "center", dataIndx: "attachment", render: displayHTMLLink,
            filter: { type: 'textbox', condition: 'contain' }
        }
    ];

    var dataModelDetail = {
        recIndx: "timestamp",
        location: "remote",
        dataType: "json",
        method: "GET",
        paging: "remote",
        url: "/ticketingAPI.php?job=get_allCustLog"
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
        pageModel: { type: "remote", rPP: 10, strRpp: "{0}", rPPOptions: [10, 20, 50, 100, 200, 500] },
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

    // customer PIC table logic, read only
    var colModelPIC = [
        {   title: "Customer Name", dataType: "string", width: '240', align: "center", dataIndx: "CustomerName",
            filter: { type: 'textbox', condition: 'contain' }
        },
        {
            title: "Contact Name", dataType: "string", width: '180', align: "center", dataIndx: "PIC_name",
            filter: { type: 'textbox', condition: 'contain' }
        },
        {
            title: "Contact Number", width: '180', align: "center", dataIndx: "PIC_number",
            filter: { type: 'textbox', condition: 'contain' }
        },
        {
            title: "Main Contact?", width: '150', align: "center", dataIndx: "PIC_isMainContact",
            filter: { type: 'textbox', condition: 'contain' }
        },
        {
            title: "Email Address", width: '240', align: "center", dataIndx: "PIC_email",
            filter: { type: 'textbox', condition: 'contain' }
        },
        {
            title: "Notification?", width: '150', align: "center", dataIndx: "PIC_isMainEmail",
            filter: { type: 'textbox', condition: 'contain' }
        }
    ];

    var dataModelPIC = {
        recIndx: "timestamp",
        location: "remote",
        dataType: "json",
        method: "GET",
        paging: "remote",
        url: "/ticketingAPI.php?job=get_allPIC"
        , getData: function (dataJSON) {
            var data = dataJSON.data;
            // console.log(dataJSON);
            return { curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: data };
        }
    };

    var groupModel = {
        on: true,
        dataIndx: ['CustomerName'],
        collapsed: [false],
        merge: [true],
        showSummary: [false],
        grandSummary: false,
        title: [
            "{0} ({1})"
        ]
    };

    var newObjPIC = {
        resizable: true,
        flexHeight: true,
        flexWidth: false,
        // collapsible: false,
        hoverMode: 'row',
        pageModel: { type: "remote", rPP: 10, strRpp: "{0}", rPPOptions: [10, 50, 100, 200, 500] },
        dataModel: dataModelPIC,
        colModel: colModelPIC,
        sortModel: {
            type: 'remote',
            single: true,
            space: true,
            multiKey: null
        },
        filterModel: { mode: 'OR', header: false, type: 'remote' },
        groupModel: groupModel,
        selectionModel: { mode: 'single', type: 'row', native: true },
        scrollModel: { flexContent: true },
        virtualX: true, virtualY: false,
        editable: false,
        showTitle: false,
        autorow: false,
        rowHt: 50,
        wrap: true,
        hwrap: false,
        showTop: true,
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
                    type: 'button',
                    label: 'Reset filters',
                    listener: function () {
                        this.reset({ filter: true });
                    }
                }
            ]
        }
    };

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
