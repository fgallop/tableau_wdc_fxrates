// immediate invoked function

(function () {
    // initialise the WDC API
    var myConnector = tableau.makeConnector();

    //setup the schema for the data

    myConnector.getSchema = function (schemaCallback) {
        // define columns in an array of objects
        var cols = [{
            id: "CAD",
            alias: "CAD",
            dataType: tableau.dataTypeEnum.float,
            description: "Exchange Rate Value"
        }, {
            id: "BaseCurrency",
            alias: "Base Currency",
            dataType: tableau.dataTypeEnum.string,
            description: "Selected Base Currency"
        }, {
            id: "Date",
            alias: "Date",
            dataType: tableau.dataTypeEnum.date,
            description: "Latest API Refresh Date"
        }];

        var tableSchema = {
            id: 'FixerIO',
            alias: 'FX Rates API',
            columns: cols
        };
        schemaCallback([tableSchema]);
    };

    myConnector.getData = function (table, doneCallback) {

        
        var today = new Date();
        var last30days = new Date(new Date().getTime()-(30*24*60*60*1000));
        
        tableau.log('today:' + today);
        tableau.log(today.getFullYear()            
            + '-' + today.getMonth()+1
            + '-' + today.getDate());
        tableau.log('last30days:' + last30days);
        tableau.log(last30days.getFullYear()            
            + '-' + last30days.getMonth()+1
            + '-' + last30days.getDate());
        
        var accessKey = tableau.connectionData.key;
        
        var baseUrl = 'https://api.exchangeratesapi.io/api/history?base=USD&symbols=CAD&start_at='
            + last30days.getFullYear()            
            + '-' + last30days.getMonth()
            + '-' + last30days.getDate()
            +'&end_at='
            + today.getFullYear()            
            + '-' + today.getMonth()
            + '-' + today.getDate();
        
        tableau.log(baseUrl);

        $.getJSON(baseUrl, function (resp) {
            var rateData = resp.rates;
            var date = resp.date;
            var tableData = []
            for (var key in rateData) {
                if (rateData.hasOwnProperty(key)) {
                    tableData.push({
                        'Date': key,
                        'CAD': rateData[key]["CAD"],
                        'BaseCurrency': 'USD',
                    });
                }
            }
            table.appendRows(tableData);
            doneCallback();
        })
    }

    tableau.registerConnector(myConnector);
})();

$(document).ready(function () {
    $("#clickButton").click(function () {

        var urlParam = {
            //baseCurr: $('#currencySelect').val().trim(),
            key: $('#accessKey').val().trim()
        };

       

        if (urlParam.key !== '') {

            tableau.connectionName = "FIXERio-data";
            tableau.connectionData = urlParam;
            tableau.submit(); // This sends the connector object to Tableau
            //test if works on console
            tableau.log('This button is working neatly');
        } else {
            tableau.log('Please enter your API key!');
            $(".errorMessage").text('Please enter your API key');
        }
    });
});
