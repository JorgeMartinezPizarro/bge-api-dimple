Graph = {
    id: 0,
    create: function(tt){
        var elementContainer = document.createElement("div");
        var title = document.createElement("h3");
        title.innerHTML = tt;
        elementContainer.appendChild(title);
        var elementID = "graph_" + Graph.id;
        var div = document.createElement("div");
        elementContainer.appendChild(div);
        div.id = elementID;
        document.body.appendChild(elementContainer);
        Graph.id++;
        return dimple.newSvg("#"+elementID, 600, 400);
    },
    drawBlockDurations: function(height){
        var svg = Graph.create("Block duration");
        var request = jQuery.ajax( {url: "https://api.bitcoinprivacy.net/blocks/"+(height-100)+"/"+height, dataType: "json"} );
        request.done(function(j){ Graph.renderBlockDurations(j, svg); });
        request.fail(function(jqXHR, textStatus){ console.log("error"); });
    },
    renderBlockDurations: function(blocks, svg){
        var data = [];
        var tp = blocks[0].tstamp;
        for (i = 1; i<blocks.length;i++){
            data.push({tstamp:(blocks[i].tstamp-tp)/60, height:blocks[i].height});
            tp = blocks[i].tstamp;
        }
        var chart = new dimple.chart(svg, data);
        chart.setBounds(95, 25, 475, 335)
        var x = chart.addCategoryAxis("x", "height");
        x.hidden = true;
        var y = chart.addMeasureAxis("y", "tstamp");
        y.title = "Block duration in minutes";
        chart.addSeries(null, dimple.plot.area);
        chart.draw();
    },
    drawBlockTransactions: function(height){
        var svg = Graph.create("Transactions per block");
        var request = jQuery.ajax( {url: "https://api.bitcoinprivacy.net/blocks/"+(height-100)+"/"+height, dataType: "json"} );
        request.done(function(j){ Graph.renderBlockTransactions(j, svg); });
        request.fail(function(jqXHR, textStatus){ console.log("error"); });
    },
    renderBlockTransactions: function(data, svg){
        var chart = new dimple.chart(svg, data);
        chart.setBounds(95, 25, 475, 335)
        var x = chart.addCategoryAxis("x", "height");
        x.hidden = true;
        var y = chart.addMeasureAxis("y", "tx");
        y.title = "Transactions pro Block";
        chart.addSeries(null, dimple.plot.bar);
        chart.draw();
    },
    drawDistribution: function(){
        var svg = Graph.create("Distribution");
        var request1 = jQuery.ajax( {url: "https://api.bitcoinprivacy.net/distribution/1000000000000", dataType: "json"} );
        var request2 = jQuery.ajax( {url: "https://api.bitcoinprivacy.net/distribution/100000000000", dataType: "json"} );
        var request3 = jQuery.ajax( {url: "https://api.bitcoinprivacy.net/distribution/10000000000", dataType: "json"} );
        var request4 = jQuery.ajax( {url: "https://api.bitcoinprivacy.net/distribution/1000000000", dataType: "json"} );
        var request5 = jQuery.ajax( {url: "https://api.bitcoinprivacy.net/distribution/100000000", dataType: "json"} );
        var request6 = jQuery.ajax( {url: "https://api.bitcoinprivacy.net/distribution/10000000", dataType: "json"} );
        var result1 = result2 = result3 = result4 = result5 = result6 = false;
        var addData = function(){
            if (result1&&result2&&result3&&result4&&result5&&result6){
                Graph.renderDistribution(result1,result2,result3,result4,result5,result6, svg);
            }
        }
        request1.done(function(j){ result1 = j; addData();});
        request2.done(function(j){ result2 = j; addData();});
        request3.done(function(j){ result3 = j; addData();});
        request4.done(function(j){ result4 = j; addData();});
        request5.done(function(j){ result5 = j; addData();});
        request6.done(function(j){ result6 = j; addData();});
        request1.fail(function(jqXHR, textStatus){ console.log("error"); });
        request2.fail(function(jqXHR, textStatus){ console.log("error"); });
        request3.fail(function(jqXHR, textStatus){ console.log("error"); });
        request4.fail(function(jqXHR, textStatus){ console.log("error"); });
        request5.fail(function(jqXHR, textStatus){ console.log("error"); });
        request6.fail(function(jqXHR, textStatus){ console.log("error"); });
    },
    renderDistribution: function(r10000,r1000,r100,r10,r1,r01, svg){
        var data = [
            {count:r10000.addresses, value:10000},
            {count:r1000.addresses-r10000.addresses, value:1000},
            {count:r100.addresses-r1000.addresses, value:100},
            {count:r10.addresses-r100.addresses, value:10},
            {count:r1.addresses-r10.addresses, value:1},
            {count:r01.addresses-r1.addresses, value:0.1}
        ];

        var myChart = new dimple.chart(svg, data);
        myChart.setBounds(95, 25, 475, 335)
        var y =  myChart.addMeasureAxis("y", "count");
        y.title = "Addresses per interval"
        var x = myChart.addCategoryAxis("x", "value");
        x.title = "Bitcoin intervals"
        myChart.addSeries(null, dimple.plot.bar);
        myChart.draw();
    },
    drawAddress: function(address){
        var svg = Graph.create(address);
        var request1 = jQuery.ajax( {url: "https://api.bitcoinprivacy.net/utxos/"+address+"/0/1000", dataType: "json"} );
        var request2 = jQuery.ajax( {url: "https://api.bitcoinprivacy.net/movements/"+address+"/0/1000", dataType: "json"} );
        var result1 = false;
        var result2 = false;
        request1.done(function(j){ result1 = j; if (result1 && result2) Graph.renderAddress(result1, result2, svg); });
        request2.done(function(j){ result2 = j; if (result1 && result2) Graph.renderAddress(result1, result2, svg); });
        request1.fail(function(jqXHR, textStatus){ console.log("error"); });
        request2.fail(function(jqXHR, textStatus){ console.log("error"); });
    },
    renderAddress: function(utxos,moves, svg){
        var data = [];
        for (i=0;i<utxos.length;i++){
            data.push({value:utxos[i].value/100000000, status:"unspend", tx:utxos[i].tx});
        }
        for (i=0;i<moves.length;i++){
            data.push({value:moves[i].value/100000000, status:"spend", tx:utxos[i].tx});
        }
        var myChart = new dimple.chart(svg, data);
        myChart.setBounds(95, 25, 475, 335)
        myChart.addCategoryAxis("x", "tx");
        myChart.addCategoryAxis("y", "status");
        myChart.addMeasureAxis("z", "value");
        myChart.addSeries("status", dimple.plot.bubble);
        myChart.addLegend(240, 10, 330, 20, "right");
        myChart.draw();
    },
}