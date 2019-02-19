var result = '';
$('#loading').hide();
var ex_no = 1;
$(document).ready(function() {
    changetext(1);
});


function runQuery() {
    $("#result").empty();
    var format = $('#format').val();
    var url = "http://patho.phenomebrowser.net/sparql/sparql/";
    var query = $("#query").val();
    var queryUrl = '';
    if (format != 'table') {

        queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=" + format;
        console.log(queryUrl);
        //$('#result_frame').attr('src', queryUrl)
        $("#result").append('<iframe src="' + queryUrl + '" style="border:2px solid black;width: 100%;height:400px;" name="PathoPhenoDB"></iframe>');
    } else {
        queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=json";
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
            timeout: 40000,
            success: function(data) {
                var mydata = eval(data.results.bindings);
                var table = $.makeTable(mydata);
                $(table).appendTo("#result");

            },
            error: function(xhr, textStatus, thrownError) {
                queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=text%2Fhtml";
                $("#result").append('<iframe src="' + queryUrl + '" style="border:2px solid black;width: 100%;height:400px;"></iframe>');
            }
        });

    }
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
    ex_no = example_no;
    if (example_no == 1) {
        $("#query").val(`#EX1:List all the pathogens with their disease-phenotypes

PREFIX SIO: <http://semanticscience.org/resource/SIO_>
PREFIX RO: <http://purl.obolibrary.org/obo/RO_>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT distinct ?PA_ID ?pathogen  ?D_ID ?disease ?disease_pathogen_evidence_code  ?P_ID ?phenotype ?disease_phenotype_evidence_code  
WHERE
  {
    ?D_ID SIO:000255 ?o1 .
    ?o1 RO:0002558 ?EC1_ID . 
    ?o1 RO:0002200 ?P_ID .
    ?D_ID SIO:000255 ?o .
    ?o RO:0002558 ?EC2_ID .
    ?o RO:0002556 ?PA_ID .
    ?PA_ID rdfs:label ?pathogen.
    ?P_ID rdfs:label ?phenotype .
    ?D_ID rdfs:label ?disease .
    ?EC1_ID rdfs:label ?disease_phenotype_evidence_code .
    ?EC2_ID rdfs:label ?disease_pathogen_evidence_code .

  } limit 50 `);
    } else if (example_no == 2) {
        $("#query").val(`#EX2:List all disease with their phenotypes

PREFIX SIO: <http://semanticscience.org/resource/SIO_>
PREFIX RO: <http://purl.obolibrary.org/obo/RO_>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT  ?Disease_ID ?Disease  ?evidence_Code ?Phenotype_ID   ?Phenotype FROM <http://patho_pheno_withlabel.com#>
WHERE 
  {
    ?Disease_ID SIO:000255 ?o .  
    ?o RO:0002558 ?EC_ID .
    ?o RO:0002200 ?Phenotype_ID .
    ?Disease_ID rdfs:label ?Disease .
    ?Phenotype_ID  rdfs:label ?Phenotype .
    ?EC_ID rdfs:label ?evidence_Code .
  } `);
    } else if (example_no == 3) {
        $("#query").val(`#EX3:List all diseases which caused by pathogens

PREFIX SIO: <http://semanticscience.org/resource/SIO_>
PREFIX RO: <http://purl.obolibrary.org/obo/RO_>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT distinct ?Disease_ID ?Disease ?Pathogen_ID ?Pathogen ?evidence_Code  
WHERE 
  {
    ?Disease_ID SIO:000255 ?o .  
    ?o RO:0002558 ?o1 .
    ?o RO:0002556  ?Pathogen_ID .
    ?Disease_ID rdfs:label ?Disease .
    ?Pathogen_ID rdfs:label ?Pathogen .
    ?o1 rdfs:label ?evidence_Code .

  } `);
    } else if (example_no == 4) {
        $("#query").val(`#EX4:List all diseases along with the drugs used to treat them

PREFIX RO: <http://purl.obolibrary.org/obo/RO_>
SELECT distinct ?Disease_ID  ?Disease ?Drug_ID ?Drug
WHERE 
  {
    ?Disease_ID RO:0002302 ?Drug_ID .
    ?Disease_ID rdfs:label  ?Disease .
    ?Drug_ID rdfs:label  ?Drug .

  }`);
    } else if (example_no == 5) {
        $("#query").val(`#EX5:List all the pathogens with their resistant proteins

PREFIX RO: <http://bio2vec.net/RO#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT distinct ?Pathogen_ID ?Pathogen ?Protein_ID 
WHERE   
  {
    ?s1 RO:resistant_protein ?Protein_ID .
    ?Pathogen_ID RO:antibiotic_resistance ?s1 .
    ?Pathogen_ID  rdfs:label  ?Pathogen.

  }`);
    } else if (example_no == 6) {
        $("#query").val(`#EX6:List all the pathogens with their resistant DNA accessions

PREFIX RO: <http://bio2vec.net/RO#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT distinct ?Pathogen_ID ?Pathogen  ?DNA_accessions_ID 
WHERE 
  {
    ?s RO:resistant_DNAaccession ?DNA_accessions_ID.
    ?Pathogen_ID RO:antibiotic_resistance ?s .
    ?Pathogen_ID  rdfs:label  ?Pathogen.

  } `);
    } else if (example_no == 7) {
        $("#query").val(`#EX7:List all the pathogens along with the resistant drugs

PREFIX RO: <http://bio2vec.net/RO#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT distinct ?Pathogen_ID ?Pathogen ?Drug_ID ?Drug
WHERE 
  {
    ?s RO:resistant_to_drug ?Drug_ID .
    ?Pathogen_ID  RO:antibiotic_resistance ?s .
    ?Drug_ID  rdfs:label  ?Drug .
    ?Pathogen_ID  rdfs:label  ?Pathogen.
  
  } `);
    } else if (example_no == 8) {
        $("#query").val(`#EX8:For a given specific pathogen, list all the diseases that it can cause

PREFIX RO: <http://purl.obolibrary.org/obo/RO_>
PREFIX SIO: <http://semanticscience.org/resource/SIO_>
PREFIX NCBITaxon: <http://purl.obolibrary.org/obo/NCBITaxon_>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT distinct ?D_ID ?Disease ?evidence_Code
WHERE 
  {
    ?D_ID SIO:000255  ?o .  
    ?o RO:0002558  ?EC_ID .
    ?o RO:0002556  NCBITaxon:1993 .
    ?D_ID rdfs:label ?Disease .
    ?EC_ID rdfs:label ?evidence_Code .
  }`);
    }
}