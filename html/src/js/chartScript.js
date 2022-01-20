var ctx = $("canvas[id='KPIchart']");
// ctx.canvas.parentNode.style.width = 200;
// ctx.canvas.parentNode.style.height = 200;

// $.ajax({
//     url: "/ticketingAPI.php?job=get_PIC&id=" + rowData['cust_no'],
//     type: 'GET',
//     cache: false,
//     dataType: 'json',
//     contentType: 'application/json; charset=utf-8',
//     async: false,
//     success: function (output) {
//         detailPIC = output.data[0];
//     },
//     error: function (XMLHttpRequest, textStatus, errorThrown) {
//         alert("Status: " + textStatus); alert("Error: " + errorThrown);
//     }
// });

function newDate(days) {
    return moment().add(days, 'd');
}

var KPIchart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [newDate(-6), newDate(-5), newDate(-4), newDate(-3), newDate(-2), newDate(-1), newDate(0)],
        datasets: [{
            label: '# of Tickets',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    unit: 'day',
                    unitStepSize: 1,
                    displayFormats: {
                        'day': 'MMM DD'
                        }
                    }
                }],
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

function refreshData() {
    addData(KPIchart, [10, 2, 1, 15, 9, 7], 0);
}

function addData(chart, data, datasetIndex) {
    chart.data.datasets[datasetIndex].data = data;
    chart.update();
}