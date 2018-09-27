var result = '';
$('#loading').hide();
$(document).ready(function() {
    changetext(1);
});
$.ajaxSetup({
    error: function(jqXHR, exception) {
        if (jqXHR.status === 0) {
            alert('Not connect.n Verify Network.');
        } else if (jqXHR.status == 404) {
            alert('Requested page not found. [404]');
        } else if (jqXHR.status == 500) {
            alert('Internal Server Error [500].');
        } else if (exception === 'parsererror') {
            alert('Requested JSON parse failed.');
        } else if (exception === 'timeout') {
            alert('Time out error.');
        } else if (exception === 'abort') {
            alert('Ajax request aborted.');
        } else {
            alert('Uncaught Error.n' + jqXHR.responseText);
        }
    }
});

function runQuery() {
    $("#TableCont").empty();
    $("#error").empty();
    var url = "http://patho.phenomebrowser.net/sparql/sparql/";
    var query = $("#query").val();
    var queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=json";
    console.log(query);
    console.log(queryUrl);
    $.ajax({
        url: queryUrl,
        beforeSend: function() {
            $('#loading').show();
        },
        complete: function() {
            $('#loading').hide();
        },
        type: "post",
        dataType: 'jsonp',
        jsonp: 'callback',
        timeout: 10000,
        success: function(data) {

            var mydata = eval(data.results.bindings);
            var table = $.makeTable(mydata);
            $(table).appendTo("#TableCont");

        },
        error: function(xhr, textStatus, thrownError) {
            $("#error").append('<iframe src="' + queryUrl + '" style="border:2px solid red;width: 100%;"></iframe>');
        }
    });

}
$.makeTable = function(mydata) {
    console.log("processing");
    var table = $('<table border=1>').addClass("table table-striped");
    var tblHeader = "<tr>";
    for (var k in mydata[0]) tblHeader += "<th>" + k + "</th>";
    tblHeader += "</tr>";
    $(tblHeader).appendTo(table);
    $.each(mydata, function(index, value) {
        //console.log(value);
        var TableRow = "<tr>";
        $.each(value, function(key, val) {
            //console.log(val.value)
            TableRow += "<td>" + val.value + "</td>";
        });
        TableRow += "</tr>";
        $(table).append(TableRow);
    });
    return ($(table));
};


function changetext(example_no) {

    if (example_no == 1) {
        $("#query").val(`PREFIX RO: <http://purl.obolibrary.org/obo/RO_>
SELECT  ?pathogen ?phenotype 
WHERE 
  {
    ?s1 RO:0002200 ?phenotype .
    ?s1 RO:0002556 ?pathogen  
  } limit 20`);
    } else if (example_no == 2) {
        $("#query").val(`PREFIX RO: <http://purl.obolibrary.org/obo/RO_>

SELECT ?s ?o 
WHERE 
  {
    ?s RO:0002200 ?o 
  
  } limit 20`);
    } else if (example_no == 3) {
        $("#query").val(`PREFIX RO: <http://purl.obolibrary.org/obo/RO_>
SELECT ?s ?o 
WHERE 
  {
    ?s RO:0002556 ?o 
  
  } limit 20`);
    } else if (example_no == 4) {
        $("#query").val(`PREFIX RO: <http://purl.obolibrary.org/obo/RO_>
SELECT ?s ?o 
WHERE 
  {
    ?s RO:0002302 ?o 
  
  } limit 20`);
    } else if (example_no == 5) {
        $("#query").val(`PREFIX RO: <http://bio2vec.net/RO#>
SELECT  ?pathogen ?protein
WHERE 
  {
    ?s1 RO:resistant_protein ?protein .
    ?pathogen RO:antibiotic_resistance ?s1 
  } limit 20`);
    } else if (example_no == 6) {
        $("#query").val(`PREFIX RO: <http://bio2vec.net/RO#>
SELECT ?pathogen ?DNA_accessions 
WHERE 
  {
    ?s RO:resistant_DNAaccession ?DNA_accessions.
    ?pathogen RO:antibiotic_resistance ?s
  } limit 20`);
    } else if (example_no == 7) {
        $("#query").val(`PREFIX RO: <http://bio2vec.net/RO#>
SELECT ?pathogen ?drug
WHERE 
  {
    ?s RO:resistant_to_drug ?drug .
    ?pathogen RO:antibiotic_resistance ?s
  } limit 20`);
    } else if (example_no == 8) {
        $("#query").val(`PREFIX RO: <http://purl.obolibrary.org/obo/RO_>
  PREFIX NCBITaxon: <http://purl.obolibrary.org/obo/NCBITaxon_>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT distinct ?id ?diseases 
WHERE 
  {
    ?id RO:0002556 NCBITaxon:1993
    SERVICE <http://sparql.hegroup.org/sparql/> {
       ?id rdfs:label ?diseases
     }
  }`);
    }
}

/*

    $.ajaxSetup({
        error: function(jqXHR, exception) {
            if (jqXHR.status === 0) {
                alert('Not connect.n Verify Network.');
            } else if (jqXHR.status == 404) {
                alert('Requested page not found. [404]');
            } else if (jqXHR.status == 500) {
                alert('Internal Server Error [500].');
            } else if (exception === 'parsererror') {
                alert('Requested JSON parse failed.');
            } else if (exception === 'timeout') {
                alert('Time out error.');
            } else if (exception === 'abort') {
                alert('Ajax request aborted.');
            } else {
                alert('Uncaught Error.n' + jqXHR.responseText);
            }
        }
    });


.done(function(msg){  }).fail(function(jqXHR, exception) {
        alert('Error - ' + exception);
        console.log(exception);
    });*/