@Grapes([
    @Grab(group='org.semanticweb.elk', module='elk-owlapi', version='0.4.2'),
    @Grab(group='net.sourceforge.owlapi', module='owlapi-api', version='4.1.0'),
    @Grab(group='net.sourceforge.owlapi', module='owlapi-apibinding', version='4.1.0'),
    @Grab(group='net.sourceforge.owlapi', module='owlapi-impl', version='4.1.0'),
    @Grab(group='net.sourceforge.owlapi', module='owlapi-parsers', version='4.1.0'),
    @Grab(group='org.codehaus.gpars', module='gpars', version='1.1.0'),
    @GrabConfig(systemClassLoader=true)
])

import org.semanticweb.owlapi.model.parameters.*;
import org.semanticweb.elk.owlapi.ElkReasonerFactory;
import org.semanticweb.elk.owlapi.ElkReasonerConfiguration;
import org.semanticweb.elk.reasoner.config.*;
import org.semanticweb.owlapi.apibinding.OWLManager;
import org.semanticweb.owlapi.reasoner.*;
import org.semanticweb.owlapi.reasoner.structural.StructuralReasoner
import org.semanticweb.owlapi.vocab.OWLRDFVocabulary;
import org.semanticweb.owlapi.model.*;
import org.semanticweb.owlapi.io.*;
import org.semanticweb.owlapi.owllink.*;
import org.semanticweb.owlapi.util.*;
import org.semanticweb.owlapi.search.*;
import org.semanticweb.owlapi.manchestersyntax.renderer.*;
import org.semanticweb.owlapi.reasoner.structural.*;

import groovyx.gpars.GParsPool;
import groovy.json.JsonSlurper;


def ontFile = this.args[0];
def clsFile = this.args[1];

OWLOntologyManager manager = OWLManager.createOWLOntologyManager()
OWLOntology ontology = manager.loadOntologyFromOntologyDocument(
    new File(ontFile))

OWLDataFactory fac = manager.getOWLDataFactory()
ConsoleProgressMonitor progressMonitor = new ConsoleProgressMonitor()
OWLReasonerConfiguration config = new SimpleConfiguration(progressMonitor)
OWLDataFactory dataFactory = manager.getOWLDataFactory()
ElkReasonerFactory reasonerFactory = new ElkReasonerFactory()
OWLReasoner reasoner = reasonerFactory.createReasoner(
    ontology, config)

def getAnchestors = { cls ->
    def res = reasoner.getSuperClasses(cls, false).getFlattened()
    return res
}


def classes = new HashSet<OWLClass>();

def jsonObjects = new JsonSlurper().parseText(new File(clsFile).text);

jsonObjects.each {
    OWLClass cls = dataFactory.getOWLClass(IRI.create(it["Phenotype"]));
    classes.add(cls)
    classes.addAll(getAnchestors(cls))
}

def newManager = OWLManager.createOWLOntologyManager()
def newOntology = newManager.createOntology(IRI.create("http://purl.obolibrary.org/obo/phenomenet.owl"))
classes.each { cls ->
    ontology.getReferencingAxioms(cls, Imports.INCLUDED).each { ax ->
	newOntology.addAxiom(ax);
    }

    EntitySearcher.getAnnotationAssertionAxioms(cls, ontology).each { ax ->
	newOntology.addAxiom(ax);
    }
}

newManager.saveOntology(newOntology, IRI.create("file:/home/kulmanm/KAUST/CBRC/dispath/data/phenomenet-sh.owl"));
