$(function () {

// initializing common function
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

// using shortcut for add and edit row, wondering how to refactor them
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

    Date.prototype.YYYYMMDD_HHMMSS = function () {
        var yyyy = this.getFullYear().toString();
        var MM = pad(this.getMonth() + 1, 2);
        var dd = pad(this.getDate(), 2);
        var hh = pad(this.getHours(), 2);
        var mm = pad(this.getMinutes(), 2)
        var ss = pad(this.getSeconds(), 2)

        return yyyy + MM + dd + '_' + hh + mm + ss;
    };

    function pad(number, length) {

        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }

// initializing date function
    function addTimes(startTime, endTime) {
        var times = [0, 0, 0]
        var max = times.length

        var a = (startTime || '').split(':')
        var b = (endTime || '').split(':')

        // normalize time values
        for (var i = 0; i < max; i++) {
            a[i] = isNaN(parseInt(a[i])) ? 0 : parseInt(a[i])
            b[i] = isNaN(parseInt(b[i])) ? 0 : parseInt(b[i])
        }

        // store time values
        for (var i = 0; i < max; i++) {
            times[i] = a[i] + b[i]
        }

        var hours = times[0]
        var minutes = times[1]
        var seconds = times[2]

        if (seconds >= 60) {
            var m = (seconds / 60) << 0
            minutes += m
            seconds -= 60 * m
        }

        if (minutes >= 60) {
            var h = (minutes / 60) << 0
            hours += h
            minutes -= 60 * h
        }

        return ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2)
    }

    // HTML formatting function
    function stripHtml(html) {
        // Create a new div element
        var temporalDivElement = document.createElement("div");
        // Set the HTML content with the providen
        temporalDivElement.innerHTML = html;
        // Retrieve the text property of the element (cross-browser support)
        return temporalDivElement.textContent || temporalDivElement.innerText || "";
    }

    var truncateRenderSummary = function (ui) {
        var dataRow = ui.rowData.Summary;
        dataRow = stripHtml(dataRow);
        if (dataRow.length > 15)
            return dataRow.substring(0, 17) + '...';
        else
            return dataRow;
    }

    var truncateRenderRFO = function (ui) {
        var dataRow = ui.rowData.RFO;
        dataRow = stripHtml(dataRow);
        if (dataRow.length > 15)
            return dataRow.substring(0, 17) + '...';
        else
            return dataRow;
    }

    // for autocomplete RFO input
    var availableTags = [
	"Administration",
        "Backbone Cable Bending/Degradation",
        "Backbone Cable Cut/Broken",
        "Backbone Carrier Broken Device",
        "Backbone Carrier Hung Device",
        "Backbone Radio Interference",
        "Carrier Configuration Problem",
        "Carrier had DDOS/Flooding",
	"Change Request",
	"Configuration Problem",
	"Connectivity Problem",
        "Carrier Mis Operation",
        "Carrier Plan Maintenance",
        "Carrier Power Issue",
	"Coordination Internal/Vendor/Customer",
	"Create/Updata Database",
        "Customer Inhouse Cable",
        "Customer Inquiry",
        "Customer LAN Issue",
        "Customer Plan Maintenance",
        "Customer Power Issue",
	"Hardware Problem",
        "Improvement",
	"IT LAN Project",
	"Meeting Internal/Vendor/Customer",
        "Lastmile Cable Bending/Degradation",
        "Lastmile Cable Cut/Broken",
        "Lastmile Carrier Broken Device",
        "Lastmile Carrier Hung Device",
        "Lastmile Radio Interference",
        "NTTI Broken Device",
        "NTTI Cable Bending/Degradation",
        "NTTI Cable Cut/Broken",
        "NTTI Configuration Problem",
        "NTTI Hung Device",
        "NTTI Mis Operation",
        "NTTI Plan Maintenance",
        "NTTI Power Issue",
        "NTTI Remote Hand Service",
	"Software Problem",
        "Termination Order",
	"Training",
        "Unidentified"
    ];

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
        var detailCust;
        var rowData = ui.rowData,
            //get a copy of gridDetailModel
            detailobj = gridDetailModel(rowData),
            //get markup of the detail template.                
            html = $("#tmpl").html(),
            //create new detail place holder
            $detail = $("<div></div>");
        // console.log(rowData['CustomerName']);
        $.ajax({
            url: "/ticketingAPI.php?job=get_customerdata_byname&id=" + rowData['CustomerName'],
            type: 'GET',
            cache: false,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            async: false,
            success: function (output) {
                detailCust = output.data[0];
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus); alert("Error: " + errorThrown);
            }
        });
        // console.log(detailCust);
        // console.log(rowData);
        for (var key in detailCust) { // it was key in rowData
            // console.log(rowData);
            var cellData = (detailCust[key] == null) ? "" : detailCust[key];
            html = html.replace("<#=" + key + "#>", cellData);
        }
        $detail.html(html);

        $detail.find(".pq-tabs").tabs().on("tabsactivate", onTabsActive);

        //append pqGrid in the 2nd tab.                
        $("<div></div>").appendTo($("#tabs-2", $detail)).pqGrid(detailobj);

        return $detail;
    };

    var colModel = [
        { title: "", minWidth: 27, maxWidth: 27, type: "detail", resizable: false, editable: false },
        {
            title: "Ticket No", dataType: "string", dataIndx: "TicketNo", minWidth: '120', align: "center",
            filter: { type: 'textbox', condition: 'contain' } 
        },
        {
            title: "Title", dataType: "string", minWidth: '120', align: "center", dataIndx: "Title",
            filter: { type: 'textbox', condition: 'contain' } 
            },
        {
            title: "Status", dataType: "string", minWidth: '120', align: "center", dataIndx: "Status",
            filter: {
                type: "select",
                condition: 'equal',
                prepend: { '': '--Select--' },
                options: ['Customer Inquiry', 'Maintenance', 'Monitoring', 'On Progress', 'Suspend', 'Totally Closed', 'Waiting Carrier', 'Waiting Customer', 'Waiting Other Team', 'Waiting RFO', 'Waiting Vendor'],
                // listeners: ['change']
            } 
        },
        {
            title: "Carrier", dataType: "string", minWidth: '120', align: "center", dataIndx: "Carrier",
            filter: {
                type: "select",
                condition: 'equal',
                prepend: { '': '--Select--' },
                options: ['APJII', 'Arthatel', 'Bali Tower', 'BITTEK', 'Biznet', 'Building Management', 'CBN', 'Citranet', 'DCI', 'Enterprise Mail', 'Fiberstar', 'G Suite Helpdesk', 'Icon+', 'IDC','iFORTE', 'Indonet', 'Indosat', 'Jatayu','Jopuri', 'Lintas Data Prima', 'Linknet', 'Lintas Artha', 'Lintasarta', 'Matrix - NAP Info', 'MKN', 'Moratel', 'MyRepublic', 'NTT Com', 'NTT Netmagic', 'NTTI', 'NTTI Nexcenter', 'Other', 'PGASKOM', 'Powertel', 'Telkomsel', 'TransIndonesia Network', 'SaftaGraha Karyatama', 'Sancom', 'SBP', 'Synetcom', 'Telkom', 'Wowrack', 'XL']
                //listeners: ['change']
            }
        },
        {
            title: "Customer Name", dataType: "string", minWidth: '120', align: "center", dataIndx: "CustomerName",
            filter: { type: 'textbox', condition: 'contain' } 
        },
        {
            title: "Service", dataType: "string", minWidth: '120', align: "center", dataIndx: "Service",
            filter: { type: 'textbox', condition: 'contain' }
        },
        {
            title: "Downtime", minWidth: '120', align: "center", dataIndx: "Downtime", dataType: "date",
            filter: { type: 'textbox', condition: "between", init: pqDatePicker,
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
        { title: "Uptime", minWidth: '120', align: "center", dataIndx: "Uptime" },
        { title: "Duration", minWidth: '120', align: "center", dataIndx: "Duration" },
        { title: "Summary", dataType: "string", minWidth: '120', align: "center", dataIndx: "Summary", render: truncateRenderSummary },
        { title: "Next Action", dataType: "string", minWidth: '120', align: "center", dataIndx: "NextAction" },
        {
            title: "RFO", dataType: "string", minWidth: '120', align: "center", dataIndx: "RFO", render: truncateRenderRFO,
            filter: {
                type: "select",
                condition: 'equal',
                prepend: { '': '--Select--' },
                options: availableTags,
                // listeners: ['change']
            }
        }
    ];

    // var lastSelect;
    var dataModel = {
        recIndx: "TicketNo",
        location: "remote",
        dataType: "json",
        method: "GET",
        paging: "remote",
        url: "/ticketingAPI.php?job=get_tickets"
        , getData: function (dataJSON) {
            var data = dataJSON.data;
            // console.log(dataJSON);
            return { curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: data };
        }
    };

    var newObj = {
        resizable: true,
        flexHeight: true,
        flexWidth: false,
        // collapsible: true,
        hoverMode: 'row',
        pageModel: { type: "remote", rPP: 10, strRpp: "{0}", rPPOptions: [10, 20, 50, 100, 200, 500] },
        dataModel: dataModel,
        colModel: colModel,
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
        showTop: true,
        editModel: { clicksToEdit: 2 },
        selectionModel: { mode: 'single', type: 'row', native: true },
        detailModel: { init: initDetail },
        toolbar: {
            cls: "pq-toolbar-search",
            items: [
                { type: 'button', label: 'Add', listeners: [{ click: addRow }], icon: 'ui-icon-plus', options: { disabled: !isNOC() } },
                { type: 'button', label: 'Edit', listeners: [{ click: editRow }], icon: 'ui-icon-pencil', options: { disabled: !isNOC() } },
                {
                    type: 'select',
                    label: 'Format: ',
                    attr: 'id="export_format"',
                    options: [{ xlsx: 'Excel', csv: 'Csv', htm: 'Html', json: 'Json' }]
                },
                {
                    type: 'button',
                    label: "Export Log Info",
                    icon: 'ui-icon-arrowthickstop-1-s',
                    listener: function () {

                        var format = $("#export_format").val(),
                            blob = this.exportData({
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

    var grid = pq.grid("#grid_crud", newObj);

    $('.tab-details').click(function () {
        if ($(this).attr('id') === 'ticketTab') {
            grid.destroy();
            grid = pq.grid("#grid_crud", newObj);
        } else {
            grid.destroy();
            grid = pq.grid("#detailTicketLog_grid", newObjDetail);
        }
    });

    /* another grid in detail view.
    * returns a new copy of detailModel every time the function is called.*/
    var gridDetailModel = function (rowData) {

        return {
            dataModel: {
                location: "remote",
                dataType: "json",
                method: "GET",
                url: "/ticketingAPI.php?job=get_detailLog&id=" + rowData['TicketNo']
            },
            colModel: [
                { title: "Time Stamp", width: 120, align: "center", dataIndx: "timestamp", editable: false },
                { title: "Logger", width: 120, dataIndx: "logger", editable: false  },
                { title: "Log Detail", width: 480, dataIndx: "log_detail", editable: false  },
                { title: "Log Category", width: 120, dataIndx: "log_category", editable: false },
                { title: "Attachment", width: 90, dataIndx: "attachment", editable: false, render: displayHTMLLink },
                { title: "Status Stamp", width: 120, dataIndx: "statusstamp", editable: false }
                ],
            width: 'flex',
            height: 'flex',
            resizable: false,
            selectionModel: { mode: 'single', type: 'row', native: true },
            filterModel: { on: true,  mode: 'OR', header: false, type: 'local' },
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
        open: function () { $(".ui-dialog").position({ of: "#grid_crud" }); },
        autoOpen: false
    });

    serviceOptionInitializer();
    carrierOptionInitializer();
    statusOptionInitializer();
    customerOptionInitializer(); // for autosearch ajax

    // some field cannot be empty, validation functions
    var TvalFlag = false;
    $("input[name='Title']").blur(function () {
        if ($(this).val()) {
            TvalFlag = true;
        } else if ($(this).val() === '') {
            TvalFlag = false;
        }
    });

    var CvalFlag = false;
    $("input[name='CustomerName']").blur(function () {
        if ($(this).val()) {
            CvalFlag = true;
        } else if ($(this).val() === '') {
            CvalFlag = false;
        }
    });

    var DLvalFlag = false;
    $("textarea[name='DetailLog']").blur(function () {
        if ($.trim($(this).val())) {
            DLvalFlag = true;
        } else if (!$.trim($(this).val())) {
            // console.log($(this).val().length)
            DLvalFlag = false;
        }
    });

    $(".needed").blur(function () {
        // console.log(DLvalFlag + TvalFlag + CvalFlag);
        if (DLvalFlag + TvalFlag + CvalFlag === 3) {
            $(".ui-dialog-buttonpane button:contains('Update')").button('enable');
            $(".ui-dialog-buttonpane button:contains('Add')").button('enable');
        }
    });

    function dateConvert() {
        now = new Date();
        year = "" + now.getFullYear();
        month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
        day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
        hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
        minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
        second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    }

    var attachmentHolder = ''; // if got attachment
    $("button[name='uploadButton']").on('click', function () {
        var inputTag = $("input[name='attachment']");
        var dateSuffix = new Date();

        var buttonTag = $("button[name='uploadButton']");
        var inputFile = inputTag.prop("files")[0];
        var fileName = inputTag.prop("files")[0].name;

        // var modFileName = fileName.split('.')[0] + Date.now() + '.' + fileName.split('.').pop().toLowerCase();
        var newFileName = fileName.split('.')[0] + '_' + dateSuffix.YYYYMMDD_HHMMSS() + '.' + fileName.split('.').pop().toLowerCase();
        // tempFileName = modFileName; // object value doesn't change
        console.dir(newFileName);

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
            myFormData.append('inputFile', inputFile, newFileName);
            // console.log(myFormData);

            $.ajax({
                url: '/uploadAPI.php',
                type: 'POST',
                processData: false, // important
                contentType: false, // important
                data: myFormData, // TODO: can we add TicketNo/cust_no for saving to its own attachment table?
                beforeSend: function () {
                    buttonTag.replaceWith("<label class='text-success'>Image Uploading...</label>");
                },
                success: function (data) {
                    // console.log(data);
                    attachmentHolder = data;
                    $('.text-success').replaceWith(data);
                    inputTag.remove();
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus); alert("Error: " + errorThrown);
                }
            });
        }
    });


    if (CvalFlag && TvalFlag && DLvalFlag) {
        $(".ui-dialog-buttonpane button:contains('Add')").button('enable');
        $(".ui-dialog-buttonpane button:contains('Update')").button('enable');

    } else {
        $(".ui-dialog-buttonpane button:contains('Add')").button('disable');
        $(".ui-dialog-buttonpane button:contains('Update')").button('disable');
    }

    //append Row, adding data function
    function addRow() {

        var $frm = $("form#crud-form");
        // $frm.validate();
        var arrayMaxDate = [];
        var ticketNumber = '';
        var durationFormatted = '';
	var tzoffset = (new Date()).getTimezoneOffset() * 60000;
        var todaysDate = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10).replace(/-/g, "");
        $frm.find("input").val("");
        $frm.find("textarea").val("");

        $("input[name='Downtime']").val(dateConvert());
        $("input[name='Duration']").val('00:00:00');

        $("#popup-dialog-crud").dialog({
                open: function () {
                    $(".ui-dialog-buttonpane button:contains('Add')").button('disable');
                },
                title: "Add Record", 
                buttons: {
                Add: function () {
                    // get the latest date (begin)
                    var request = $.ajax({
                        async: false,
                        url: '/ticketingAPI.php?job=get_latestDate',
                        cache: false,
                        dataType: 'json',
                        contentType: 'application/json; charset=utf-8',
                        type: 'get'
                    });
                    request.done(function (dataJSON) {
                        if (dataJSON.result == 'success') {
                            arrayMaxDate.push(dataJSON);
                            // console.log('get date success: ' + arrayMaxDate);
                        } else {
                            console.log('add failed');
                        }
                    });
                    request.fail(function (jqXHR, textStatus) {
                        console.log('error due to: ' + textStatus);
                    });
                    // get the latest date (end)
		    var fmtDowntime = new Date(arrayMaxDate[0].data[0].Downtime);
                    var tzoffsetLD = fmtDowntime.getTimezoneOffset() * 60000;
		    var latestDate = new Date(fmtDowntime - tzoffsetLD);

                    var ctrTicket = arrayMaxDate[0].data[0]["DayCounter"];
                    ctrTicket = parseInt(ctrTicket);
                    // console.log('latestDate after assigned new Date: ' + latestDate);

                    latestDate = latestDate.toISOString().slice(0, 10).replace(/-/g, "");

                    // latestDate = '20171221'; // for testing purpose
                    var lastTicketDate = parseInt(latestDate);
                    var todaysTicketDate = parseInt(todaysDate);
                    // console.log(latestDate);
                    // console.log(todaysDate);

                    if (lastTicketDate < todaysTicketDate) {
                        ctrTicket = 0; // reset ctrTicket if todaysDate is newer
                        ctrTicket = ctrTicket + 1;
                        var dsply = ctrTicket.toString();
                        dsply = ('0' + dsply).slice(-2);
                    } else {
                        ctrTicket = ctrTicket + 1;
                        var dsply = ctrTicket.toString();
                        dsply = ('0' + dsply).slice(-2);
                    }

                    ticketNumber = 'TT' + todaysDate + dsply;
                    ticketNumber = String(ticketNumber);
                    // console.log(typeof ticketNumber);

                    var row = [];

                    //save the record in DM.data.
                    row['TicketNo'] = $frm.find("input[name='TicketNo']").val(ticketNumber);
                    row['Title'] = $frm.find("input[name='Title']").val();
                    row['Status'] = $frm.find("select[name='Status']").val();
                    row['Carrier'] = $frm.find("select[name='Carrier']").val();
                    row['CustomerName'] = $frm.find("input[name='CustomerName']").val();;
                    row['Service'] = $frm.find("select[name='Service']").val();
                    row['Downtime'] = $frm.find("input[name='Downtime']").val();
                    row['Uptime'] = $frm.find("input[name='Uptime']").val();
                    var statusMarker = row['Status'];

                    if (statusMarker === 'On Progress' || statusMarker === 'Customer Inquiry') {
                        var rightNow = '';
                        rightNow = new Date();
                        var downtimeMarker = row['Downtime'];
                        downtimeMarker = new Date(downtimeMarker);
                        var timeDiff = rightNow - downtimeMarker;
                        timeDiff = new Date(timeDiff);
                        var diffSeconds = timeDiff / 1000;
                        var HH = Math.floor(diffSeconds / 3600);
                        // var MM = Math.floor(diffSeconds % 3600 / 60);
                        // var SS = Math.floor((diffSeconds % 3600 / 60) % 60);

                        // durationFormatted = ((HH < 10) ? ("0" + HH) : HH) + ":" + ((MM < 10) ? ("0" + MM) : MM) + ":" + ((SS < 10) ? ("0" + SS) : SS);
                        durationFormatted = ((HH < 10) ? ("0" + HH) : HH) + ":" + ((timeDiff.getMinutes() < 10) ? ("0" + timeDiff.getMinutes()) : timeDiff.getMinutes()) + ":" + ((timeDiff.getSeconds() < 10) ? ("0" + timeDiff.getSeconds()) : timeDiff.getSeconds());

                    }
                    if (statusMarker === 'Maintenance') {
                        durationFormatted = '00:00:00';
                    }
                    // console.log(durationFormatted);

                    row['Duration'] = $frm.find("input[name='Duration']").val(durationFormatted);
                    row['Summary'] = $frm.find("textarea[name='Summary']").val();
                    row['NextAction'] = $frm.find("textarea[name='NextAction']").val();
                    row['RFO'] = $frm.find("input[name='RFO']").val();
                    row['DayCounter'] = $frm.find("input[name='DayCounter']").val(ctrTicket);
                    row['TicketCreated'] = $frm.find("input[name='TicketCreated']").val(dateConvert());
                   
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
                        data: form_data + '&job=' + 'add_ticket',
                        dataType: 'json',
                        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                        type: 'post',
                        async: true
                    });
                    request.done(function (output) {
                        if (output.result == 'success') {
                            // console.log('add successful');
                            grid.addRow({ rowData: row });
                            $("#grid_crud").pqGrid("refreshDataAndView");
                            alert('Ticket No: '+ ticketNumber + ' is added.');
                        } else {
                            console.log('add failed');
                        }
                    });
                    request.fail(function (jqXHR, textStatus) {
                        console.log('error due to: ' + textStatus);
                    });
                    // save to database (end)

                    $(this).dialog("close");
                },
                Cancel: function () {
                    CvalFlag = false; DLvalFlag = false; TvalFlag = false;
                    $(this).dialog("close");
                }
            }
        });
        $("#popup-dialog-crud").dialog("open");
    }

    // $('.ui-button-text').click(function () { TODO: this is for loading screen for popup
    //         $("body").addClass("loading");
    //     console.log('it begins');
    // });
    //edit Row
    function editRow() {
        var rowIndx = getRowIndx();
        var arrayMaxTimeStamp = [];
        var latestTimeStamp = '';
        var latestStatus = '';
        // get latest timestamp on particular ticket
        // substract with downtime, add to duration until ticket status stop/suspended
        // $("body").addClass("loading");

        if (rowIndx != null) {          
            var row = grid.getRowData({ rowIndx: rowIndx });

            // duration maker function
            var durationFormatted = '';
            var initialDurationPure = row['Duration']; // get this from prev duration calculation
            // console.log('get initialDurationPure : ' + initialDurationPure);
            var initialDuration = new Date(initialDurationPure);
            // console.log('get initial duration on top after declared date : ' + initialDurationPure);
            var rightNow = ''; // could be set to latest timestamp
            var request = $.ajax({
                async: false,
                url: "/ticketingAPI.php?job=get_latestTimeStamp&id=" + row['TicketNo'],
                cache: false,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                type: 'get'
            });
            request.done(function (dataJSON) {
                if (dataJSON.result == 'success') {
                    arrayMaxTimeStamp.push(dataJSON); // seeking for latest timestamp or downtime
                    latestTimeStamp = arrayMaxTimeStamp[0].data[0].timestamp;
                    latestStatus = arrayMaxTimeStamp[0].data[0].Status;
                } else {
                    console.log('get timeStamp failed');
                }
            });
            request.fail(function (jqXHR, textStatus) {
                console.log('error due to: ' + textStatus);
            });
            latestTimeStamp = new Date(latestTimeStamp);
            rightNow = new Date();
            var timeDiff = rightNow - latestTimeStamp;
            timeDiff = new Date(timeDiff);
            var diffSeconds = timeDiff / 1000;
            var HH = Math.floor(diffSeconds / 3600);
            // var MM = Math.floor(diffSeconds % 3600 / 60);
            // var SS = Math.floor((diffSeconds % 3600 / 60) % 60);

            // durationFormatted = ((HH < 10) ? ("0" + HH) : HH) + ":" + ((MM < 10) ? ("0" + MM) : MM) + ":" + ((SS < 10) ? ("0" + SS) : SS);
            durationFormatted = ((HH < 10) ? ("0" + HH) : HH) + ":" + ((timeDiff.getMinutes() < 10) ? ("0" + timeDiff.getMinutes()) : timeDiff.getMinutes()) + ":" + ((timeDiff.getSeconds() < 10) ? ("0" + timeDiff.getSeconds()) : timeDiff.getSeconds());
            // console.log('the difference: ' + durationFormatted);
            // duration maker function end

            var $frm = $("form#crud-form");
            $frm.find("input[name='TicketNo']").val(row['TicketNo']);
            $frm.find("input[name='Title']").val(row['Title']);
            $frm.find("select[name='Status']").val(row['Status']);
            $frm.find("select[name='Carrier']").val(row['Carrier']);
            $frm.find("input[name='CustomerName']").val(row['CustomerName']);
            $frm.find("select[name='Service']").val(row['Service']);
            $frm.find("input[name='Downtime']").val(row['Downtime']);
            $frm.find("input[name='Uptime']").val(row['Uptime']);
            $frm.find("input[name='Duration']").val(row['Duration']);
            $frm.find("textarea[name='Summary']").val(row['Summary']);
            $frm.find("textarea[name='NextAction']").val(row['NextAction']);
            $frm.find("input[name='RFO']").val(row['RFO']);
            $frm.find("textarea[name='DetailLog']").val(row['DetailLog']);
            $frm.find("select[name='LogCategory']").val(row['LogCategory']);

            $frm.find("input[name='attachmentHolder']").val(row['attachmentHolder']);
            $frm.find("input[name='userLogin']").val(row['userLogin']);
            $frm.find("input[name='userEmail']").val(row['userEmail']);
            
            // $("body").removeClass("loading");
            // console.log('it ends');

            $("#popup-dialog-crud").dialog({
                title: "Edit Record (" + (rowIndx + 1) + ")", 
                open: function () {
                    // $("body").addClass("loading");
                    $(".ui-dialog-buttonpane button:contains('Update')").button('disable');
                    $frm.find("input[name='Title']").val() !== '' ? TvalFlag = true : TvalFlag = false;  
                    $frm.find("input[name='CustomerName']").val() !== '' ? CvalFlag = true : CvalFlag = false;
                },
                buttons: {
                    Update: function () {
                        //update row.
                        var row = [];
                        row["TicketNo"] = $frm.find("input[name='TicketNo']").val();
                        row["Title"] = $frm.find("input[name='Title']").val(); 
                        row["Status"] = $frm.find("select[name='Status']").val();
                        row["Carrier"] = $frm.find("select[name='Carrier']").val();
                        row["CustomerName"] = $frm.find("input[name='CustomerName']").val();
                        row["Service"] = $frm.find("input[name='Service']").val();
                        row["Downtime"] = $frm.find("input[name='Downtime']").val();
                        row["Uptime"] = $frm.find("input[name='Uptime']").val();
                        // console.log('get initialDurationPure : ' + initialDurationPure);
                        // console.log('get durationFormatted before : ' + durationFormatted);

                        if (latestStatus === 'On Progress' || latestStatus === 'Customer Inquiry') {
                            durationFormatted = addTimes(initialDurationPure , durationFormatted);
                            // timeDiff = new Date(timeDiff);
                            // var diffSeconds = timeDiff / 1000;
                            // var HH = Math.floor(diffSeconds / 3600);
                            // var MM = Math.floor(diffSeconds % 3600 / 60);
                            // // var SS = Math.floor((diffSeconds % 3600 / 60) % 60);

                            // durationFormatted = ((HH < 10) ? ("0" + HH) : HH) + ":" + ((MM < 10) ? ("0" + MM) : MM) + ":" + ((timeDiff.getSeconds() < 10) ? ("0" + timeDiff.getSeconds()) : timeDiff.getSeconds());
                        } else if (latestStatus === 'Maintenance') {
                            durationFormatted = '00:00:00';
                        } else { // if ticket is closed or suspended
                            durationFormatted = initialDurationPure;
                        }

                        console.log('get durationFormatted after: ' + durationFormatted);
                        row["Duration"] = $frm.find("input[name='Duration']").val(durationFormatted);
                        row["Summary"] = $frm.find("textarea[name='Summary']").val();
                        row["NextAction"] = $frm.find("textarea[name='NextAction']").val();
                        row["RFO"] = $frm.find("input[name='RFO']").val();
                        
                        row['attachmentHolder'] = $frm.find("input[name='attachmentHolder']").val(attachmentHolder);
                        row["userLogin"] = $frm.find("input[name='userLogin']").val(userLogin);
                        row["userEmail"] = $frm.find("input[name='userEmail']").val(userEmail);
                        
                        // save to database (begin)
                        var form_data = $('form#crud-form').serialize();
                        // console.log(row);
                        // console.log(form_data);
                        var request = $.ajax({
                            url: '/ticketingAPI.php',
                            cache: false,
                            data: form_data + '&job=' + 'edit_ticket' + '&id=' + row['TicketNo'],
                            dataType: 'json',
                            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                            type: 'post',
                            async: true
                        });
                        request.done(function (output) {
                            if (output.result == 'success') {
                                alert('Ticket No: ' + output.ticketNo + ' is edited.');
                                $("#grid_crud").pqGrid("refreshDataAndView");
                                // printLatestTimeStamp = rightNow;  // need to make server side
                                // $('#printLatestTimeStamp').text(printLatestTimeStamp);
                            } else {
                                console.log('edit failed');
                            }
                        });
                        request.fail(function (jqXHR, textStatus) {
                            console.log('error due to: ' + textStatus);
                        });
                        // save to database (end)

                        $(this).dialog("close");
                    },
                    Cancel: function () {
                        CvalFlag = false; DLvalFlag = false; TvalFlag = false;
                        $(this).dialog("close");
                    }
                }
            }).dialog("open");
            // $("#popup-dialog-crud").ready(function () {
            //     $("body").removeClass("loading");
            //     // console.log('it completes');
            // });
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
            title: "Ticket No", dataType: "string", dataIndx: "TicketNo", width: '120', align: "center",
            filter: { type: 'textbox', condition: 'contain' }
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
            filter: {
                type: "select",
                condition: 'equal',
                prepend: { '': '--Select--' },
                options: ['Progress Update', 'First Notification', 'Customer Update', 'Carrier Coordination'],
                // listeners: ['change']
            }
        },
        {
            title: "Status Stamp", width: '180', align: "center", dataIndx: "statusstamp",
            filter: {
                type: "select",
                condition: 'equal',
                prepend: { '': '--Select--' },
                options: ['Customer Inquiry', 'Maintenance', 'Monitoring', 'On Progress', 'Suspend', 'Totally Closed', 'Waiting Carrier', 'Waiting Customer', 'Waiting Other Team', 'Waiting RFO', 'Waiting Vendor'],
                // listeners: ['change']
            }
        },
        {
            title: "Attachment", width: '180', align: "center", dataIndx: "attachment", render: displayHTMLLink,
            filter: { type: 'textbox', condition: 'contain' }
        }
    ];

    var dataModelDetail = {
        recIndx: "log_id",
        location: "remote",
        dataType: "json",
        method: "GET",
        paging: "remote",
        url: "/ticketingAPI.php?job=get_allDetailLog"
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

    $("input[name^=RFO]").autocomplete({
        appendTo: "#crud-form",
        source: availableTags,
        minLength: 0
    }).focus(function () {
        //Use the below line instead of triggering keydown
        $(this).data("uiAutocomplete").search($(this).val());
    });

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
