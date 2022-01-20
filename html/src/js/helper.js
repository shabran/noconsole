$.getScript("./src/js/FileSaver.js");

function tabInitializer() {
    $('.tabs .tab-links a').on('click', function (e) {
        var currentAttrValue = jQuery(this).attr('href');
        // Show/Hide Tabs
        $('.tabs ' + currentAttrValue).show().siblings().hide();
        // Change/remove current tab to active
        $(this).parent('li').addClass('active').siblings().removeClass('active');
        e.preventDefault();
    });
}

function dateTimeInitializer() {
    $("input[name^=Downtime]").datetimepicker({
        step: 15
    });
    $("input[name^=Uptime]").datetimepicker({
        step: 15
    });
    $("input[name^=StartTime]").datetimepicker({
        step: 15
    });
    $("input[name^=EndTime]").datetimepicker({
        step: 15
    });
}
// Preparation when user login is missing, as in Qoti case
var userLogin = sessionStorage.getItem('username');
var userEmail = sessionStorage.getItem('email');
var userAccess = sessionStorage.getItem('access');

// check privileges, noc is '2'
function isNOC() {
    if (userAccess == '2') {
        return true; 
    } else if (userAccess == '1') {
        return false; // not noc
    } else {
        return false;
    }
}

    // Prevent logout
var refreshTime = 600000; // every 10 minutes in milliseconds
window.setInterval(function () {
    $.ajax({
        cache: false,
        type: "GET",
        url: "./session.php",
        success: function (data) {
        }
    });
}, refreshTime);

var serviceOptions = {
    'Arcstar - Emergency Support': 'Arcstar - Emergency Support',
    'Arcstar IPVPN': 'Arcstar IPVPN',
    'Astinet': 'Astinet', 
    'Backbone-Domestic-APJII': 'Backbone-Domestic-APJII',
    'Backbone-Domestic-Cyber 1 POP': 'Backbone-Domestic-Cyber 1 POP',
    'Backbone-Domestic-Dummy POP': 'Backbone-Domestic-Dummy POP',
    'Backbone-Domestic-EJIP POP': 'Backbone-Domestic-EJIP POP',
    'Backbone-Domestic-IDC 3D POP': 'Backbone-Domestic-IDC 3D POP',
    'Backbone-Domestic-KIM POP': 'Backbone-Domestic-KIM POP',
    'Backbone-Domestic-KIIC POP': 'Backbone-Domestic-KIIC POP',
    'Backbone-Domestic-MM2100 POP': 'Backbone-Domestic-MM2100 POP',
    'Backbone-Domestic-Segment 1 (W46<>INEX)': 'Backbone-Domestic-Segment 1 (W46<>INEX)',
    'Backbone-Domestic-Segment 2 (W46<>DCI)': 'Backbone-Domestic-Segment 2 (W46<>DCI)',
    'Backbone-Domestic-Segment 3 (INEX<>DCI)': 'Backbone-Domestic-Segment 3 (INEX<>DCI)',
    'Backbone-Domestic-Segment 4 (GC<>INEX via PU)':'Backbone-Domestic-Segment 4 (GC<>INEX via PU)',
    'Backbone-Domestic-Segment 5 (GC<>INEX via KAI)':'Backbone-Domestic-Segment 5 (GC<>INEX via KAI)',
    'Backbone-Domestic-Segment 6 (DC<>EJIP)':'Backbone-Domestic-Segment 6 (DCI<>EJIP)',
    'Backbone-Domestic-Segment 7 (EJIP<>GTN)':'Backbone-Domestic-Segment 7 (EJIP<>GTN)',
    'Backbone-Domestic-Segment 8 (GTN<>INEX)':'Backbone-Domestic-Segment 8 (GTN<>INEX)',
    'Backbone-Domestic-Summitmas POP': 'Backbone-Domestic-Summitmas POP',
    'Backbone-Domestic-Surabaya POP': 'Backbone-Domestic-Surabaya POP',
    'Backbone-International-GIN': 'Backbone-International-GIN',
    'Backbone-International-INEX POP': 'Backbone-International-INEX POP',
    'Backbone-International-W46 POP': 'Backbone-International-W46 POP',
    'Building Management - W46 POP': 'Building Management - W46 POP',
    'Data Center - MM2100 POP': 'Data Center - MM2100 POP',
    'Data Center - Nexcenter POP': 'Data Center - Nexcenter POP',
    'Data Center - Wisma46 POP': 'Data Center - Wisma46 POP',
    'GDCI – Blackout Drill Test':'GDCI – Blackout Drill Test',
    'Helpdesk': 'Helpdesk',
    'Helpdesk - Cloud Service':'Helpdesk - Cloud Service',
    'Helpdesk - Internet Service': 'Helpdesk - Internet Service',
    'Helpdesk - Orange Business Service': 'Helpdesk - Orange Business Service',
    'IP Transit': 'IP Transit',
    'IT LAN': 'IT LAN',
    'Mail-Enterprise': 'Mail-Enterprise',
    'Managed Anti Virus': 'Managed Anti Virus',
    'Managed Cyber Protect and Backup': 'Managed Cyber Protect and Backup',	
    'Managed FW': 'Managed Firewall',	
    'Managed WiFi':'Managed WiFi',
    'Managed Router':'Managed Router',	
    'Metro Ethernet': 'Metro Ethernet',
    'Metro Ethernet - Wisma 46 POP': 'Metro Ethernet - Wisma 46 POP',
    'MPLS IPVPN': 'MPLS IPVPN',
    'On Call Support':'On Call Support',
    'Onsite Support':'Onsite Support',
    'Other Service':'Other Service',
    'Network Interconnection': 'Network Interconnection',
    'NTTI Cloud':'NTTI Cloud',
    'NTTI Cloud Connect':'NTTI Cloud Connect',   
    'NTTI Dummy FO':'NTTI Dummy FO',
    'NTTI EJIP FO': 'NTTI EJIP FO',
    'NTTI Ether': 'NTTI Ether',
    'NTTI JKT-IX':'NTTI JKT-IX',
    'NTTI KIIC FO': 'NTTI KIIC FO',
    'NTTI KIM FO':'NTTI KIM FO',
    'NTTI MM2100 FO': 'NTTI MM2100 FO',
    'NTTI Nexcenter FO': 'NTTI Nexcenter FO',
    'NTTI Summitmas FO': 'NTTI Summitmas FO',
    'NTTI Wisma 46 FO': 'NTTI Wisma 46 FO',
    'NTTI - Remote Hand Service': 'NTTI - Remote Hand Service',
    'PSTN': 'PSTN',
    'Public Cloud' : 'Public Cloud', 
    'Rental Router':'Rental Router',
    'Rental Factory':'Rental Factory',
    'Rental Firewall':'Rental Firewall',
    'SD-WAN':'SD-WAN',
    'VPLS': 'VPLS'
};

function serviceOptionInitializer() {
    var serviceSelect = $("select[name='Service']");
    // console.log(serviceSelect);
    $.each(serviceOptions, function (val, text) {
        serviceSelect.append(
            $('<option></option>').val(val).html(text)
        );
    });
}

var carrierOptions = {
    'APJII': 'APJII',
    'Arthatel': 'Arthatel',
    'Bali Tower': 'Bali Tower',
    'BITTEK': 'BITTEK',
    'Biznet': 'Biznet',
    'Building Management': 'Building Management',
    'CBN': 'CBN',
    'Cergis': 'Cergis',
    'Citranet': 'Citranet',	
    'DCI': 'DCI',
    'Enterprise Mail': 'Enterprise Mail',
    'Fiberstar': 'Fiberstar',
    'G Suite Helpdesk': 'G Suite Helpdesk',
    'Icon+': 'Icon+',
    'IDC': 'IDC',
    'iFORTE':'iFORTE',
    'Indonet': 'Indonet',
    'Indosat': 'Indosat',
    'Jala Lintas Media':'Jala Lintas Media',
    'Jatayu': 'Jatayu',
    'Jopuri':'Jopuri',
    'KOSATO':'KOSATO',
    'Lintas Data Prima': 'Lintas Data Prima',
    'Linknet': 'Linknet',
    'Lintasarta': 'Lintasarta',
    'Matrix - NAP Info': 'Matrix - NAP Info',
    'MKN': 'MKN',
    'Moratel': 'Moratel',
    'MyRepublic': 'MyRepublic',
    'NTT Com': 'NTT Com',
    'NTT Netmagic': 'NTT Netmagic',
    'NTTI': 'NTTI',
    'NTTIS':'NTTIS',
    'Other': 'Other',
    'PGASKOM': 'PGASKOM',
    'Powertel': 'Powertel',
    'SIAP Networks': 'SIAP Networks',	
    'Telkomsel': 'Telkomsel',
    'TransIndonesia Network': 'TransIndonesia Network',
    'SaftaGraha Karyatama': 'SaftaGraha Karyatama',
    'Sancom': 'Sancom',
    'SBP': 'SBP',
    'Synetcom': 'Synetcom',
    'Telkom': 'Telkom',
    'Wowrack':'Wowrack',
    'test_carrier': 'test_carrier',
    'XL': 'XL'
};

function carrierOptionInitializer() {
    var carrierSelect = $("select[name='Carrier'], select[name='CarrierName']");
    // console.log(serviceSelect);
    $.each(carrierOptions, function (val, text) {
        carrierSelect.append(
            $('<option></option>').val(val).html(text)
        );
    });
}

var statusOptions = {
    'Customer Inquiry': 'Customer Inquiry',
    'Maintenance':'Maintenance',
    'Monitoring':'Monitoring',
    'On Progress':'On Progress',
    'Suspend':'Suspend',
    'Totally Closed': 'Totally Closed',
    'Waiting Carrier': 'Waiting Carrier',
    'Waiting Customer': 'Waiting Customer',
    'Waiting Other Team': 'Waiting Other Team',
    'Waiting RFO': 'Waiting RFO',
    'Waiting Vendor': 'Waiting Vendor'
};

function statusOptionInitializer() {
    var statusSelect = $("select[name='Status']");
    // console.log(serviceSelect);
    $.each(statusOptions, function (val, text) {
        statusSelect.append(
            $('<option></option>').val(val).html(text)
        );
    });
}


function customerOptionInitializer() {
    $("input[name='CustomerName']").keyup(function () {
        var dInput = this.value;
        var pq_filter = { "mode": "AND", "data": [{ "dataIndx": "CustomerName", "value": dInput, "condition": "contain", "dataType": "string", "cbFn": "" }] }
        pq_filter = encodeURIComponent(JSON.stringify(pq_filter));
        // console.log(pq_filter);
        var selectContainer = $("#suggesstion-box");
        $.ajax({
            type: "GET",
            url: "ticketingAPI.php?job=get_allCustomerName" + "&pq_filter=" + pq_filter,
            success: function (output) {
                var arrayOfCust = JSON.parse(output);
                var custOptions = [];
                var i = 0;
                for (; i < arrayOfCust.data.length ; i++) {
                    custOptions.push(arrayOfCust.data[i].CustomerName);
                }
                $("input[name='CustomerName']").autocomplete({
                    appendTo: "#crud-form",
                    source: custOptions,
                    minLength: 0
                });
            }
        });

    });
}

function validateForm() {
    var empty = true;
    console.log('empty =' + empty);
        $("form#crud-form .needed").keyup(function() {
            if ($.trim($("form#crud-form #DetailLog").val()) == '') {
            empty = true;
            console.log('empty =' + empty);
            } else {
                empty = false;
                console.log('empty =' + empty);
            }
            if (empty) {
                $(".ui-dialog-buttonpane button:contains('Update')").button('disable');
                $(".ui-dialog-buttonpane button:contains('Add')").button('disable');

            } else {
                $(".ui-dialog-buttonpane button:contains('Update')").button('enable');
                $(".ui-dialog-buttonpane button:contains('Add')").button('enable');
            }
        });
}

// change dateformat
function changeFormat(value) {

    mod = value ? value.replace(/\//g, "-") : null;
    // console.log(mod);
    return mod;
}

function pqDatePicker(ui) {
    var $this = ui.$editor;
    // console.log(dateConvert($this));
    $this
        //.css({ zIndex: 3, position: "relative" })
        .datetimepicker({
            // yearRange: "-20:+0", //20 years prior to present.
            changeYear: true,
            changeMonth: true,
            showButtonPanel: true,
            dateFormat: "yy-mm-dd",
            timeFormat: "HH:mm:ss",
            step: 15,
            onClose: function (evt, ui) {
                $(this).focus();
            },
            hour: '00',
            minute: '00'
        });
    //default From date
    var $from = $this.filter(".pq-from").datetimepicker("option", "defaultDate", new Date());
    //default To date
    var $to = $this.filter(".pq-to").datetimepicker("option", "defaultDate", new Date());

    var value = changeFormat(ui.column.filter.value),
        value2 = changeFormat(ui.column.filter.value2);

    $from.val(value);
    $to.val(value2);
}


// to render link on attachment
var displayHTMLLink = function (ui) {
    // console.log(ui);
    var dataRow = ui.rowData.attachment;
    return dataRow;
}
