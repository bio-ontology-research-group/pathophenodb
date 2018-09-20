use strict;

my (@arr, $line, $sources, @id, $name, %hash_pheno, $dis, $i, $cnt, @tmp, $str, @data, $d, @disease_names, @source, @pathogen_names, @tmp, $dnames, $pnames, %doid, $key, $src, %PathTypes, @tmp2, %cntt, $t, $sub_classes, %tax_hash, %dis_pheno, @phenotype_names, @xx, $elem, @anew, $newstr, %max_tax, $resistant, %pathogen_type, $drug_str, $phene_str, @classes);

our %drugs;


my ($drug_count, $aro_count, %uniq_disease, $count, %uniq_res, %hash);

$drug_count=0;
$aro_count=0;
$count=0;


#disease_pheno ! here get disease phenotypes
open IN, "filtered-doid-pheno-23.txt"  or die "cannot open aberowl file";
while ($line=<IN>)
{
chop $line;
@arr=split('\t', $line);

if (exists $dis_pheno{$arr[0]}) {$dis_pheno{$arr[0]}=$dis_pheno{$arr[0]}."##".$arr[1];}
else {$dis_pheno{$arr[0]}=$arr[1];}

$arr[9]=~s/\[//g;
$arr[9]=~s/\]//g;
$arr[9]=~s/, /##/g;

$hash_pheno{$arr[1]}=$arr[9];

}
close IN;

#-----------------------------------------------Drug Data--------------------------------------
open IN, "sider_2_doid.new.txt" or die "cannot open disease dictionary";
while ($line=<IN>)
{#DOID:9744	CID116132418	NovoLog
 #DOID:9744	CID116132438	Humalog

chop $line;
@arr=split('\t', $line);

if (exists $drugs{$arr[0]}) {$drugs{$arr[0]}=$drugs{$arr[0]}."##".$arr[1]."__".$arr[2];}
else {$drugs{$arr[0]}=$arr[1]."__".$arr[2];}


}
close IN;




$cnt=0;




open IN, "Gold_dis_path.all.txt" or die "cannot open Swissprot mapping file";
while ($line=<IN>)
{ #DOID:0050174	Kunjin encephalitis	Kunjin virus	11077	virus	disease-ontology.org	
chop $line; 
@arr=split("\t", $line);

$uniq_disease{$arr[0]}=1;
$drug_str=drugs($arr[0]);
if ($drug_str eq "") {$drug_str="[]"; $drug_count++;}


$resistant=resistance($arr[3]);
if ($resistant eq "") {$resistant="[]"; }

if ($resistant ne "[]") { $aro_count++; $uniq_res{$arr[3]}=1;}

if (exists $dis_pheno{$arr[0]}) {$count++;}

$PathTypes{$arr[3]}=$arr[4];

}
close IN;


##print "Nof uniq pathogens=".scalar (keys %tax_hash)."\n";

print "Nof pathogen-disease pair which have no drugs=".$drug_count."\n";
print "Nof pathogen-disease pair which have ARO (drug resistancy data)=".$aro_count."\n";

print "Nof pathogen-disease pair which have phenotype=".$count."\n";

my $dr; $dr=0;
foreach $key (keys %uniq_disease)
{
if (exists $drugs{$key}) {$dr++;}
}

print "Nof uniq diseases which have drug data in sider=".$dr."\n";

$dr=0; 
foreach $key (keys %uniq_disease)
{
if (exists $dis_pheno{$key}) {$dr++;}
}

print "Nof distinct diseases which have phenotypes (text mined)=".$dr."\n";
print "Nof pathogens which have resistance info in ARO=". scalar (keys %uniq_res)."\n";


foreach $key (keys %PathTypes)
{$hash{$PathTypes{$key}}++;}

foreach $key (keys %hash)
{print $key." ".$hash{$key}."\n";}


#--------------------------------------
sub uniq {
  my %seen;
  return grep { !$seen{$_}++ } @_;
}


sub drugs{
##an array of objects: [ { "name": "Mary", "age": 12 }, { "name": "John", "age": 10 }] 
my ($id, @arr, $item, @tmp, $str, $aa);

$id=shift;
@arr=split('##', $drugs{$id});

foreach $item (@arr)
{ 
@tmp=split('__', $item);

$aa=
"{".
" ".'"'."Drug_ID".'"'.": ".'"'.$tmp[0].'"'.",".
" ".'"'."Drug_Name".'"'.": ".'"'.$tmp[1].'"'.
"}";

if ($str eq "") {$str=$aa;}
else {$str=$str.", ".$aa;}

}

if ($str ne "") {$str="[".$str."]";}
return $str;

}



sub resistance{

my (@tmp, @arr, $line, $str, $cnt, $aa);

my $tid=shift;

$cnt=0;

open INI, "complete_aro_match_wOrganism.txt" or die "cannot open aro mapping file";


$str="";
while ($line=<INI>)
{
#ARO:3000363	EreB	ARO:3000363@ARO:0000006#ARO:0000006	erythromycin	12560	CAA01212.1	A15097	Escherichia coli	562
#ARO_accession	Name	Lineage	Drug_name	PubChem_ID	Protein_accession	DNA_accession	Organism	Tax_ID

chop $line; 

@arr=split('	', $line);

##an array of objects: [ { "name": "Mary", "age": 12 }, { "name": "John", "age": 10 }] 

if ($tid eq $arr[8])
{ 
 
@tmp=split('#', $arr[2]);

$arr[5]="https://www.ncbi.nlm.nih.gov/protein/".$arr[5];
$arr[6]="https://www.ncbi.nlm.nih.gov/nuccore/".$arr[6];


$aa=
"{".
"    ".'"'."ARO_ID".'"'.": ".'"'.$arr[0].'"'.",".
"    ".'"'."ARO_Name".'"'.": ".'"'.$arr[1].'"'.",".
"    ".'"'."Resistant_ARO".'"'.": ".'"'.$tmp[$#tmp].'"'.",".
"    ".'"'."Resistant_to".'"'.": ".'"'.$arr[3].'"'.",".
"    ".'"'."PubChemID".'"'.": ".'"'.$arr[4].'"'.",".
"    ".'"'."Protein_accession".'"'.": ".'"'.$arr[5].'"'.",".
"    ".'"'."DNA_accession".'"'.": ".'"'.$arr[6].'"'.
#"    ".'"'."Org_name".'"'.": ".'"'.$arr[7].'"'.",".
#"    ".'"'."Tax_ID".'"'.": ".'"'.$arr[8].'"'.",".
"}";


if ($str eq "") {$str=$aa;}
else {$str=$str.", ".$aa;}

}
} 
close INI;

if ($str ne "") {$str="[".$str."]";}

return $str;
}


