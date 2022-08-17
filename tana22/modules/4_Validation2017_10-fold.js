//path to models
var ImageClassification = require('users/cjoseph/tana22:modules/3_Classification_BFArea.js');

//import model elements
var NumberOfTrees = ImageClassification.NumberOfTrees
var seedRF = ImageClassification.seedRF
var bands = ImageClassification.bands
var trainingCol = ImageClassification.trainingCol
var TD_as_classi = ImageClassification.trainingData


//load training datasets (already sampled)
var medianTDResizeBF = ee.FeatureCollection('projects/ee-cjoseph/assets/Training_Datasets_sampled/RandomizedTrainingDataResizeBF')
var MedianTD = ee.FeatureCollection('projects/ee-cjoseph/assets/Training_Datasets_sampled/allTrainingData')
var allimg17 = ee.FeatureCollection('projects/ee-cjoseph/assets/Training_Datasets_sampled/alltraining_allImg17')
var allimg17ResizeBF = ee.FeatureCollection('projects/ee-cjoseph/assets/Training_Datasets_sampled/training_allImg17ResizeBF')


var tvDataResize = ee.FeatureCollection('projects/ee-cjoseph/assets/validation_data/RandomizedTrainingDataResizeBF')
print(tvDataResize.size(), 'tvDataResize')
print(medianTDResizeBF.size(), 'medianTDResizeBF')

var DataUsed = TD_as_classi

//create folds from treining Data
var F1 = DataUsed.filter(ee.Filter.rangeContains('random', 0, 0.1)).set('system:id', 1)
print(F1, 'fold1')
var F2 = DataUsed.filter(ee.Filter.rangeContains('random', 0.1000000000000001, 0.2)).set('system:id', 2)

var F3 = DataUsed.filter(ee.Filter.rangeContains('random', 0.2000000000000001, 0.3)).set('system:id', 3)

var F4 = DataUsed.filter(ee.Filter.rangeContains('random', 0.3000000000000001, 0.4)).set('system:id', 4)

var F5 = DataUsed.filter(ee.Filter.rangeContains('random', 0.4000000000000001, 0.5)).set('system:id', 5)

var F6 = DataUsed.filter(ee.Filter.rangeContains('random', 0.5000000000000001, 0.6)).set('system:id', 6)

var F7 = DataUsed.filter(ee.Filter.rangeContains('random', 0.6000000000000001, 0.7)).set('system:id', 7)

var F8 = DataUsed.filter(ee.Filter.rangeContains('random', 0.7000000000000001, 0.8)).set('system:id', 8)

var F9 = DataUsed.filter(ee.Filter.rangeContains('random', 0.8000000000000001, 0.9)).set('system:id', 9)

var F10 = DataUsed.filter(ee.Filter.rangeContains('random', 0.9000000000000001, 1)).set('system:id', 10)

print(F1.size(), 'elements fold 1')
print(F2.size(), 'elements fold 2')
print(F3.size(), 'elements fold 3')
print(F4.size(), 'elements fold 4')
print(F5.size(), 'elements fold 5')
print(F6.size(), 'elements fold 6')
print(F7.size(), 'elements fold 7')
print(F8.size(), 'elements fold 8')
print(F9.size(), 'elements fold 9')
print(F10.size(), 'elements fold 10')

var Folds = ee.FeatureCollection([F1, F2, F3, F4, F5, F6, F7, F8, F9, F10])//try to merge all others in a function
print(Folds, 'List of all folds')



var Fnum = ee.List.sequence(1,10,1)
//print(Fnum)

//______________________________________________________________________________________________
//Random Forest 10 fold validation

function RF10FoldVali (element){
  //defie the id of the current fold
  var id = element;
  //filter collection of folds to leave out the current fold
  var allFolds = Folds.filter(ee.Filter.neq('system:id', id)).flatten();
  //current fold
  var leavout =  Folds.filter(ee.Filter.eq('system:id', id)).flatten() //.get(0);

      //create a classifier to seperately classify each validation fold
          var Fclassifier = ee.Classifier.smileRandomForest({numberOfTrees: NumberOfTrees, seed: seedRF}).train({
          features: allFolds,
          classProperty: trainingCol,
          inputProperties: bands
       })
  //classify the test fold     
  var vali = leavout.classify(Fclassifier).set('system:id', id)
  
  return vali
}
//run 10-fold validation function
var valid = Fnum.map(RF10FoldVali)
print(valid, 'valid')

var overallAccs =  valid.map(function OvAcc(element){
  var OA = ee.FeatureCollection(element).errorMatrix('LC', 'classification').accuracy()
  OA = ee.Number(OA)
  return OA
})
var OverallAccuracyRF = overallAccs.reduce(ee.Reducer.mean())
print(OverallAccuracyRF, 'overall accuracy RF FUNCTION')
var sdARF = overallAccs.reduce(ee.Reducer.stdDev())  
var varARF = overallAccs.reduce(ee.Reducer.variance()) 


//Producers Accuracy
/*var ProucersdAccs = matrixList.map(function ProdAcc(element){
  var PA = ee.FeatureCollection(element).errorMatrix('LC', 'classification').producersAccuracy()
  PA = ee.Number(PA)
  return PA
})
print(ProucersdAccs)
var ProducersOccuracyRF = ProucersdAccs.reduce(ee.Reducer.mean()) 
print(ProducersOccuracyRF, 'overall producers accuracy RF')*/

//Consumers Accuracy
/*var ConsumAccs = matrixList.map(function ConsAcc(element){
  var CA = ee.FeatureCollection(element).errorMatrix('LC', 'classification').consumersAccuracy()
  CA = ee.Number(CA)
  return CA
})
var ConsumersOccuracyRF = ConsumAccs.reduce(ee.Reducer.mean()) 
print(ConsumersOccuracyRF, 'overall consumers accuracy RF')*/

//Kappa
var Kappa = valid.map(function Kapp(element){
  var CA = ee.FeatureCollection(element).errorMatrix('LC', 'classification').kappa()
  CA = ee.Number(CA)
  return CA
})
var KappaRF = Kappa.reduce(ee.Reducer.mean()) 
print(KappaRF, 'overall kappa RF FUNCTION')
var sdKRF = Kappa.reduce(ee.Reducer.stdDev())  
var varKRF = Kappa.reduce(ee.Reducer.variance())  

//_______________________________________________________________________________________________________________________________________
//SVM: 10 fold validation
  
function SVM10FoldVali (element){
  //defie the id of the current fold
  var id = element;
  //filter collection of folds to leave out the current fold
  var allFolds = Folds.filter(ee.Filter.neq('system:id', id)).flatten();
  //current fold
  var leavout =  Folds.filter(ee.Filter.eq('system:id', id)).flatten() //.get(0);

      //train the classifier to seperately classify each validation fold
          var vclassifiersvm = ee.Classifier.libsvm({
    kernelType: 'RBF',
    gamma: 0.5,
    cost: 30//10
  });
  
          var classifiersvm = vclassifiersvm.train(allFolds, trainingCol, bands)
  //classify the test fold     
  var vali = leavout.classify(classifiersvm).set('system:id', id)
  
  return vali
}

//run 10-fold validation function
var valid = Fnum.map(SVM10FoldVali)

var overallAccs =  valid.map(function OvAcc(element){
  var OA = ee.FeatureCollection(element).errorMatrix('LC', 'classification').accuracy()
  OA = ee.Number(OA)
  return OA
})

var OverallAccuracySVM = overallAccs.reduce(ee.Reducer.mean())
print(OverallAccuracySVM, 'overall accuracy SVM')
var sdASVM = overallAccs.reduce(ee.Reducer.stdDev())  
var varASVM = overallAccs.reduce(ee.Reducer.variance())  

var Kappa = valid.map(function Kapp(element){
  var CA = ee.FeatureCollection(element).errorMatrix('LC', 'classification').kappa()
  CA = ee.Number(CA)
  return CA
})
var KappaSVM = Kappa.reduce(ee.Reducer.mean()) 
print(KappaSVM, 'overall kappa SVM')
var sdKSVM = Kappa.reduce(ee.Reducer.stdDev())  
var varKSVM = Kappa.reduce(ee.Reducer.variance())   


//_____________________________________________________________________________________________________________________________________
//CART Classifier 10 fold validation

function CART10FoldVali (element){
  //defie the id of the current fold
  var id = element;
  //filter collection of folds to leave out the current fold
  var allFolds = Folds.filter(ee.Filter.neq('system:id', id)).flatten();
  //current fold
  var leavout =  Folds.filter(ee.Filter.eq('system:id', id)).flatten() //.get(0);

      //train a classifier to seperately classify each validation fold
  var classifierC = ee.Classifier.smileCart().train(allFolds, trainingCol, bands);
  
  //classify the test fold     
  var vali = leavout.classify(classifierC).set('system:id', id)
  
  return vali
}

//run 10-fold validation function
var valid = Fnum.map(CART10FoldVali)

var overallAccs =  valid.map(function OvAcc(element){
  var OA = ee.FeatureCollection(element).errorMatrix('LC', 'classification').accuracy()
  OA = ee.Number(OA)
  return OA
})

var OverallAccuracyCART = overallAccs.reduce(ee.Reducer.mean())
print(OverallAccuracyCART, 'overall accuracy CART')
var sdACART = overallAccs.reduce(ee.Reducer.stdDev())  
var varACART = overallAccs.reduce(ee.Reducer.variance())  
  
var Kappa = valid.map(function Kapp(element){
  var CA = ee.FeatureCollection(element).errorMatrix('LC', 'classification').kappa()
  CA = ee.Number(CA)
  return CA
})
var KappaCART = Kappa.reduce(ee.Reducer.mean()) 
print(KappaCART, 'overall kappa CART')  
var sdKCART = Kappa.reduce(ee.Reducer.stdDev())   
var varKCART = Kappa.reduce(ee.Reducer.variance())  
//__________________________________________________________________________________________________
//exports
var RF = ee.Feature(null, {   Classifier: 'Random Forest',                        Accuracy: OverallAccuracyRF,    sdAccuracy: sdARF,    varAccuracy: varARF   , Kappa: KappaRF,     sdKappa: sdKRF,   varKappa: varKRF,})
var SVM = ee.Feature(null, {  Classifier: 'Support Vector MAchine',               Accuracy: OverallAccuracySVM,   sdAccuracy: sdASVM,   varAccuracy: varASVM  , Kappa: KappaSVM,    sdKappa: sdKSVM,  varKappa: varKSVM,})
var CART = ee.Feature(null, { Classifier: 'Classification and Regression Trees',  Accuracy: OverallAccuracyCART,  sdAccuracy: sdACART,  varAccuracy: varACART , Kappa: KappaCART,   sdKappa: sdKCART, varKappa: varKCART,})

  //create export CSV of area increment during year
var exportOverAcc = ee.FeatureCollection([RF, CART, SVM])
Export.table.toDrive({
  collection: exportOverAcc,
  folder: 'GEEData',
  description:'OverallAccuracies',
  fileFormat: 'CSV',
  selectors: ['Classifier', 'Accuracy', 'sdAccuracy', 'varAccuracy', 'Kappa', 'sdKappa', 'varKappa']
});