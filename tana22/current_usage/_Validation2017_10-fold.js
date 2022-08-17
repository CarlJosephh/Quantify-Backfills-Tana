/*###load images and create a collection
*/
//Load Boundary Layer
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana')
var viable = ee.FeatureCollection('projects/ee-cjoseph/assets/viable_watershed')
var classes = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/classes')
var classes_poly = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/classes_poly');
var PPclasses21 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/PPclasses21');
var Dclasses = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Dclasses');
var Dupuy = ee.FeatureCollection('projects/ee-cjoseph/assets/BDDA_Tana_VF_totale_v6');
var dupuy_classes17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/dupuy_classes17');
//var backfill_poly17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/backfill_poly17');
var backfill_poly17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Bruno_R_17/backfill_poly17_Bruno');
var otherBS17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Bruno_R_17/otherBS17_Bruno');
var roofs17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Bruno_R_17/roofs17');

//merge Dupuy 2021 trainig data with training data for backfills in 2017
dupuy_classes17 = dupuy_classes17.filter(ee.Filter.lte('LC', 12))/*.merge(dupuy_classes17.filter(ee.Filter.rangeContains('LC', 3, 12)))*/.merge(backfill_poly17).merge(otherBS17).merge(roofs17)
print(dupuy_classes17, 'dupuy_classes17')
//print(Dupuy)

/*Map.addLayer(dupuy_classes17,{} ,'dupuy_classes17')
Map.addLayer(viable,{} ,'viable')
*/
var trainingData = dupuy_classes17
var trainingCol = 'LC'

var StartYear = 2013
var EndYear = 2022

var YearOfInterest = 2017

var NumberOfTrees = 100
var seedRF = 10
//Map.addLayer(viable)
//________________________________________________________________________________
//IMPORT IMAGES

//Filter image collection

/*var image = ee.Image(ee.ImageCollection('LANDSAT/LC08/C01/T1')
  .filterBounds(GT)
  .filterDate('2020-05-01', '2020-06-01')
  .sort('CLOUD_COVER') //sorts for the earliest and least cloudy image 
  .first());*/
  
var dataset = ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
    .filterBounds(GT)
    //.filterDate('2016-10-01', '2017-05-01')
    //.filter(ee.Filter.calendarRange(2016, 2014, 'year'))  
    .filter(ee.Filter.calendarRange(10, 5, 'month'))
//print(dataset, 'dataset')

function ROICC (image) {//###FUNCTION SEEMS TO ONLY WORK FOR TOA IMAGES
  var cloud = ee.Algorithms.Landsat.simpleCloudScore(image).select('cloud');//'cloud'
  var cloudiness = cloud.reduceRegion({
    reducer: 'mean', 
    geometry: GT, 
    scale: 30,
  });
  return image.set(cloudiness);
}


function maskL8sr(image) {
  // Bit 0 - Fill
  // Bit 1 - Dilated Cloud
  // Bit 2 - Cirrus
  // Bit 3 - Cloud
  // Bit 4 - Cloud Shadow
  var qaMask = image.select('QA_PIXEL').bitwiseAnd(parseInt('11111', 2)).eq(0);
  var saturationMask = image.select('QA_RADSAT').eq(0);

  // Replace the original bands with the scaled ones and apply the masks.
  return image
      .updateMask(qaMask)
      .updateMask(saturationMask);
}

var withCloudiness = dataset.map(ROICC).map(maskL8sr)

    //adjust boundary value for CC filtering
var cloudfreeImage = withCloudiness.filter(ee.Filter.lte('cloud', 25));//'cloud'
//print(cloudfreeImage, 'fC', false);

//_________________________________________________________________________________________
//Load Images

var Landsat17 = cloudfreeImage.filterDate('2016-10-01', '2017-05-01').median()//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170620');//('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170706')!!! LC08_159073_20170620<-- highCC


var LS8export = ee.ImageCollection.fromImages([
 
  Landsat17,

]);
//print('LS8export: ', LS8export);

//_________________________________________________________________________________________
//IMAGE PREPROCESSING, Band calculations and clipping to region of interest

//load DEM
var elevation = ee.Image('USGS/SRTMGL1_003').clip(viable).select('elevation');
var slope = ee.Terrain.slope(elevation)
//function for clipping and calculating complex and simple band ratios
function process(image){
  //clipping the image
  var image = image.clip(viable);
  //band names
  //!!!PAY ATTENTION TO USE THE RIGHT BAND VALUES WHEN USING DATA FROM DIFFERENT LANDSAT MISSIONS!!!
  var bn = {
      'BLUE':   image.select('B2'),
      'GREEN':  image.select('B3'),
      'RED':    image.select('B4'),
      'NIR':    image.select('B5'),
      'SWIR1':  image.select('B6'),
      'SWIR2':  image.select('B7')}
  //complex band calculations
  var BSI = image.expression(//Bare Soil Index
    '((RED +SWIR2) - (NIR + BLUE)) / ((RED + SWIR2) + (NIR + BLUE))', bn)
    .rename('BSI');
  var NDVI = image.expression(//Normalised Difference Vegetation Index
    '(NIR - RED)/(NIR + RED)', bn)
    .rename('NDVI');
  var SCI = image.expression(//Soil Composition Index (SCI)
    '(SWIR1 - NIR)/(SWIR1 + NIR)', bn)
    .rename('SCI');
  var SBL = image.expression(//Soil Background Line (SBL)
    'NIR - (2.4*RED)', bn)
    .rename('SBL');
  var NDBI =image.expression(//Normalized Difference Built up Index :Zha, Y., J. Gao, and S. Ni. "Use of Normalized Difference Built-Up Index in Automatically Mapping Urban Areas from TM Imagery." International Journal of Remote Sensing 24, no. 3 (2003): 583-594
    '(SWIR1 - NIR) / (SWIR1 + NIR)', bn)
    .rename('NDBI')
  var NDWI = image.expression(//NDWI = (Band 3 – Band 5)/(Band 3 + Band 5)
    '(GREEN - NIR) / (GREEN + NIR)', bn)
    .rename('NDWI')
  //simple single band calculation
  //(Landsat data Ratios 1 - 3 from: May 2015 DOI:10.5194/isprsarchives-XL-7-W3-897-2015, Mwaniki et al. 2015)
  var Br4_3 = image.expression(//Mwaniki et al. 2015
    'RED / GREEN',bn)
    .rename('Br4_3')
  var Br6_2 = image.expression(//Mwaniki et al. 2015
    'SWIR1 / BLUE',bn)
    .rename('Br6_2') 
  var Br7_3 = image.expression(//Mwaniki et al. 2015
    'SWIR2 / RED',bn)
    .rename('Br7_3')
  var Br5_7 = image.expression(//Thi et al. 2019
    'NIR / SWIR2',bn)
    .rename('Br5_7')
  var Br5_4_3 = image.expression(
    '(NIR / RED / GREEN)', bn)
    .rename('Br5_4_3')
    //new indices use or not? 
   var RI = image.expression(//Redness index
    '(RED * RED) / (GREEN * GREEN)', bn)
    .rename('RI') 
  var CI = image.expression(//Colour index
    '(RED - GREEN) / (RED + GREEN)', bn)
    .rename('CI') 
  var ARVI = image.expression(//Atmospherically Resistant Vegetation Index
    '(NIR - (2 * RED) + BLUE) / (NIR + (2 * RED) + BLUE)', bn)
    .rename('ARVI') 
 
  
 //Add calculated ratios and indices to the image as bands
  var newBands = ee.Image([BSI, NDVI, SCI, SBL, NDBI, NDWI, Br4_3, Br6_2, Br7_3, Br5_4_3, elevation, slope, RI, CI, ARVI, Br5_7]);
  image = image.addBands(newBands);  
  return image;
}

//execute function on image collection
var Process = LS8export.map(process);
//print(Process, 'processed');


var ProcessList = Process.toList(Process.size());
//print(ProcessList, 'ProcessList')

//_____________________________________________________________________________________________________________________
//CLASSIFICATION
//Classification, train and classify

//Create training data
var bands = ['Br4_3', 'Br6_2', 'Br7_3','BSI', 'NDVI','SCI', 'NDWI', 'NDBI', 'Br5_4_3', 'elevation', 'slope', 'RI', 'CI', 'ARVI', 'Br5_7']  //;  ['B2', 'B3', 'B4', 'B5', 'B6', 'B7','Br4_3', 'Br6_2', 'Br7_4', 'BSI', 'NDVI', 'SCI', 'SBL'] 

//train with a single median image
var LS8train =  ee.ImageCollection.fromImages([ //Landsat17m
  Landsat17,
]);

var trainer = LS8train.map(process);
var trainerList = trainer.toList(trainer.size())


var training = ee.Image(trainerList.get(0)).select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
  collection: trainingData,
  properties: [trainingCol],
  scale: 30,
  geometries: true
})
print(training, 'training')

//train with three images
//________________________
/*var LS8train = cloudfreeImage.filterDate('2016-10-01', '2017-05-01')
print(LS8train, 'LS8train')

var trainer = LS8train.map(process);
//var trainerList = trainer.toList(trainer.size())
//print(trainerList, 'trainerList')

var featList = trainer.map(function sampling(x){
    var feat = ee.Image(x).select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
      collection: trainingData,
      properties: [trainingCol],
      scale: 30,
      geometries: true
    })
  return feat
})

print(featList, 'featList')

var training = featList.flatten()*/
//___________________________

//!!! SMILE CART CLSSIFICATION AND REGRESSION TREE Train the classifier
  /*var classifier = ee.Classifier.smileCart().train(training, trainingCol, bands);*/

//!!! SUPPORT VECTOR MACHINE Create an SVM classifier with custom parameters.
/* var classifiersvm = ee.Classifier.libsvm({
    kernelType: 'RBF',
    gamma: 0.5,
    cost: 30//10
  });

  // Train the classifier.
  var classifier = classifiersvm.train(training, trainingCol, bands);*/

//!!! RANDOM FOREST CLASSIFIER and train it.
var classifier = ee.Classifier.smileRandomForest({numberOfTrees: NumberOfTrees, seed: seedRF})
    .train({
      features: training,
      classProperty: trainingCol,
      inputProperties: bands
    });

//classification
function classify(image){
  var id = image.get('system:id')
  var imageC = image.select(bands).classify(classifier).set('system:id', id)
  return imageC
} 

var Classi = Process.map(classify)
//print(Classi,'classified')

var ClassiList = Classi.toList(Classi.size())

//!!! CONFUSION MATRIX VALIDATION
// Get a confusion matrix representing resubstitution accuracy.
var trainAccuracy = classifier.confusionMatrix();
//print('Resubstitution error matrix: ', trainAccuracy);
print('Training overall accuracy: ', trainAccuracy.accuracy());
//print('kappa: ', trainAccuracy.kappa());
//print('producers Accuracy: ', trainAccuracy.producersAccuracy());
//print('consumers Accuracy: ', trainAccuracy.consumersAccuracy());

//_______________________________________________________________________________________________
// 10-Fold validation for image 2017
//randomly reduce training classes to e in acceptable margin
/*function rndSizeResample(element){
    element = ee.FeatureCollection(element)
    var Esize = ee.Number(element.size())
    var margin = ee.Number(89)
    var rndE = element.randomColumn({columnName:'randomLarge', seed: 2, distribution: 'uniform'})
    var filtE = rndE.filter(ee.Filter.lte('randomLarge',  margin.divide(Esize)))
    return filtE
    
}*/

/*var margin = ee.Number(688)
var CollectionList = ee.List([
  training.filter(ee.Filter.eq('LC', 0)).randomColumn({columnName:'randomLarge', seed: 2, distribution: 'uniform'}).filter(ee.Filter.lte('randomLarge', margin.divide(688))),
  training.filter(ee.Filter.eq('LC', 1)).randomColumn({columnName:'randomLarge', seed: 2, distribution: 'uniform'}).filter(ee.Filter.lte('randomLarge', margin.divide(284))),
  training.filter(ee.Filter.eq('LC', 2)).randomColumn({columnName:'randomLarge', seed: 2, distribution: 'uniform'}).filter(ee.Filter.lte('randomLarge', margin.divide(883))),
  training.filter(ee.Filter.eq('LC', 3)).randomColumn({columnName:'randomLarge', seed: 2, distribution: 'uniform'}).filter(ee.Filter.lte('randomLarge', margin.divide(training.filter(ee.Filter.eq('LC', 3)).size()))),
  training.filter(ee.Filter.eq('LC', 4)).randomColumn({columnName:'randomLarge', seed: 2, distribution: 'uniform'}).filter(ee.Filter.lte('randomLarge', margin.divide(training.filter(ee.Filter.eq('LC', 4)).size()))),
  training.filter(ee.Filter.eq('LC', 5)).randomColumn({columnName:'randomLarge', seed: 2, distribution: 'uniform'}).filter(ee.Filter.lte('randomLarge', margin.divide(3003))),
  training.filter(ee.Filter.eq('LC', 6)).randomColumn({columnName:'randomLarge', seed: 2, distribution: 'uniform'}).filter(ee.Filter.lte('randomLarge', margin.divide(1000))),
  training.filter(ee.Filter.eq('LC', 7)).randomColumn({columnName:'randomLarge', seed: 2, distribution: 'uniform'}).filter(ee.Filter.lte('randomLarge', margin.divide(4154))),
  training.filter(ee.Filter.eq('LC', 8)).randomColumn({columnName:'randomLarge', seed: 2, distribution: 'uniform'}).filter(ee.Filter.lte('randomLarge', margin.divide(507))),
  training.filter(ee.Filter.eq('LC', 9)).randomColumn({columnName:'randomLarge', seed: 2, distribution: 'uniform'}).filter(ee.Filter.lte('randomLarge', margin.divide(139))),
  training.filter(ee.Filter.eq('LC', 10)).randomColumn({columnName:'randomLarge', seed: 2, distribution: 'uniform'}).filter(ee.Filter.lte('randomLarge', margin.divide(training.filter(ee.Filter.eq('LC', 10)).size()))),
  training.filter(ee.Filter.eq('LC', 11)).randomColumn({columnName:'randomLarge', seed: 2, distribution: 'uniform'}).filter(ee.Filter.lte('randomLarge', margin.divide(415))),
  training.filter(ee.Filter.eq('LC', 12)).randomColumn({columnName:'randomLarge', seed: 2, distribution: 'uniform'}).filter(ee.Filter.lte('randomLarge', margin.divide(training.filter(ee.Filter.eq('LC', 12)).size()))),
  training.filter(ee.Filter.eq('LC', 13)).randomColumn({columnName:'randomLarge', seed: 2, distribution: 'uniform'}).filter(ee.Filter.lte('randomLarge', margin.divide(training.filter(ee.Filter.eq('LC', 13)).size())))
  ])
  
print(CollectionList.get(7), 'CollectionList')              
//var CollectionListMapped = CollectionList.map(rndSizeResample)//.randomColumn({columnName:'random', seed: 2, distribution: 'uniform'})    

var tvDataResizeBF = ee.FeatureCollection(CollectionList).flatten().randomColumn('random', 1, 'uniform');
//print(tvDataResize, 'tvDataResize')


Export.table.toAsset({//toDrive({
  collection: tvDataResizeBF,
  description: 'RandomizedTrainingDataResizeBF', 
  //folder: 'GEE', 
  //fileFormat: 'SHP', 
  //selectors: ['LC', 'random', 'randomLarge'] 
})
*/
//____________________________________________

//sample over the whole training data
var tvdata = training.randomColumn({columnName: 'random', seed: 1})
//Export training Data to investigate distribution

Export.table.toDrive({
  collection: tvdata,
  description: 'allTrainingData', 
  folder: 'GEE', 
  fileFormat: 'SHP', 
  selectors: ['LC', 'random'] 
})


var tvDataResize = ee.FeatureCollection('projects/ee-cjoseph/assets/validation_data/RandomizedTrainingDataResizeBF')
Export.table.toDrive({//Asset({//toDrive({
  collection: tvDataResize,
  description: 'RandomizedTrainingDataResizeBF', 
  folder: 'GEEData', 
  fileFormat: 'CSV', 
  selectors: ['LC', 'random', 'randomLarge'] 
}) 


var DataUsed = tvDataResize

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

    var vclassifiersvm = ee.Classifier.libsvm({
    kernelType: 'RBF',
    gamma: 0.5,
    cost: 30//10
  });
  
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